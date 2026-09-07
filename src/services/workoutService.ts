import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Workout, WorkoutCategory, WorkoutNote, Exercise } from '../types';
import { INITIAL_WORKOUTS } from '../data/initialCatalog';
import { COMPREHENSIVE_EXERCISES } from '../data/allExercisesCatalog';
import { LocalStorageService } from './localStorageService';

export class WorkoutService {
  private static cachedWorkouts: Workout[] = INITIAL_WORKOUTS;
  private static cachedExercises: Exercise[] = COMPREHENSIVE_EXERCISES;
  private static isSeedingExercises = false;

  /**
   * Safe merge strategy for Workouts:
   * Combines built-in catalog with Firestore workouts so items never vanish.
   */
  static mergeWorkouts(cloudList: Workout[]): Workout[] {
    const map = new Map<string, Workout>();
    for (const w of INITIAL_WORKOUTS) {
      map.set(w.workoutId, w);
    }
    for (const w of cloudList) {
      if (w && w.workoutId && w.title) {
        map.set(w.workoutId, {
          ...(map.get(w.workoutId) || {}),
          ...w
        });
      }
    }
    return Array.from(map.values());
  }

  /**
   * Safe merge strategy for Exercises:
   * Combines built-in catalog with Firestore exercises so movements never vanish.
   */
  static mergeExercises(cloudList: Exercise[]): Exercise[] {
    const map = new Map<string, Exercise>();
    for (const ex of COMPREHENSIVE_EXERCISES) {
      map.set(ex.id, ex);
    }
    for (const ex of cloudList) {
      if (ex && ex.id && ex.name) {
        map.set(ex.id, {
          ...(map.get(ex.id) || {}),
          ...ex
        });
      }
    }
    return Array.from(map.values());
  }

  /**
   * Real-time subscription to cloud workouts.
   * Compares payload against in-memory cache to prevent duplicate re-renders.
   * Uses safe merge so catalog items never vanish.
   */
  static subscribeToWorkouts(callback: (workouts: Workout[]) => void): () => void {
    callback(this.cachedWorkouts.length > 0 ? this.cachedWorkouts : INITIAL_WORKOUTS);

    try {
      const workoutsColl = collection(db, 'workouts');
      return onSnapshot(workoutsColl, (snapshot) => {
        if (!snapshot.empty) {
          const list: Workout[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as Workout;
            if (data && data.workoutId && data.title) {
              list.push(data);
            }
          });

          const merged = this.mergeWorkouts(list);
          const isSame = this.cachedWorkouts.length === merged.length &&
            this.cachedWorkouts.every((w, i) => w.workoutId === merged[i]?.workoutId && w.title === merged[i]?.title);

          if (!isSame) {
            this.cachedWorkouts = merged;
            callback(merged);
          }
        }
      }, (error) => {
        console.warn('Firestore workouts onSnapshot fallback to local catalog:', error);
      });
    } catch (err) {
      console.warn('Error subscribing to workouts in cloud:', err);
      return () => {};
    }
  }

  /**
   * Real-time subscription to cloud exercises library.
   * Automatically synchronizes in the background.
   */
  static subscribeToExercises(callback: (exercises: Exercise[]) => void): () => void {
    callback(this.cachedExercises.length > 0 ? this.cachedExercises : COMPREHENSIVE_EXERCISES);

    try {
      const exercisesColl = collection(db, 'exercises');
      return onSnapshot(exercisesColl, (snapshot) => {
        if (!snapshot.empty) {
          const list: Exercise[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as Exercise;
            if (data && data.id && data.name) {
              list.push(data);
            }
          });

          const merged = this.mergeExercises(list);
          const isSame = this.cachedExercises.length === merged.length &&
            this.cachedExercises[0]?.id === merged[0]?.id &&
            this.cachedExercises[this.cachedExercises.length - 1]?.id === merged[merged.length - 1]?.id;

          if (!isSame) {
            this.cachedExercises = merged;
            callback(merged);
          }
        } else if (auth.currentUser && !this.isSeedingExercises) {
          this.isSeedingExercises = true;
          this.seedExercisesToCloud().finally(() => {
            this.isSeedingExercises = false;
          });
        }
      }, (error) => {
        console.warn('Firestore exercises onSnapshot fallback to local catalog:', error);
      });
    } catch {
      return () => {};
    }
  }

  /**
   * Push all catalog workouts directly to Firestore using batched writes with merge: true
   */
  static async seedWorkoutsToCloud(): Promise<number> {
    try {
      const batch = writeBatch(db);
      for (const w of INITIAL_WORKOUTS) {
        const ref = doc(db, 'workouts', w.workoutId);
        batch.set(ref, w, { merge: true });
      }
      await batch.commit();
      return INITIAL_WORKOUTS.length;
    } catch (err) {
      console.warn('Seed workouts to cloud encountered error:', err);
      return 0;
    }
  }

  /**
   * Push all exercises to Firestore in chunks using merge: true to protect custom exercises
   */
  static async seedExercisesToCloud(): Promise<number> {
    try {
      const chunkSize = 450;
      for (let i = 0; i < COMPREHENSIVE_EXERCISES.length; i += chunkSize) {
        const chunk = COMPREHENSIVE_EXERCISES.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const ex of chunk) {
          const ref = doc(db, 'exercises', ex.id);
          batch.set(ref, ex, { merge: true });
        }
        await batch.commit();
      }
      return COMPREHENSIVE_EXERCISES.length;
    } catch (err) {
      console.warn('Seed exercises to cloud encountered error:', err);
      return 0;
    }
  }

  /**
   * Get all exercises (from cache or merged Firestore and catalog)
   */
  static async getExercises(): Promise<Exercise[]> {
    if (this.cachedExercises.length > 0) {
      return this.cachedExercises;
    }
    try {
      const snap = await getDocs(collection(db, 'exercises'));
      if (!snap.empty) {
        const list: Exercise[] = [];
        snap.forEach(d => {
          const item = d.data() as Exercise;
          if (item && item.id) list.push(item);
        });
        const merged = this.mergeExercises(list);
        this.cachedExercises = merged;
        return merged;
      }
    } catch {
      // Ignore read errors, fallback to built-in catalog
    }
    this.cachedExercises = COMPREHENSIVE_EXERCISES;
    return COMPREHENSIVE_EXERCISES;
  }

  /**
   * Fetch all workouts (from cache, Firestore, or fallback to initial catalog)
   */
  static async getWorkouts(): Promise<Workout[]> {
    if (this.cachedWorkouts.length > 0) {
      return this.cachedWorkouts;
    }

    try {
      const workoutsColl = collection(db, 'workouts');
      const snapshot = await getDocs(workoutsColl);

      if (!snapshot.empty) {
        const list: Workout[] = [];
        snapshot.forEach(docSnap => {
          const item = docSnap.data() as Workout;
          if (item && item.workoutId) list.push(item);
        });
        const merged = this.mergeWorkouts(list);
        this.cachedWorkouts = merged;
        return merged;
      }
    } catch (error) {
      console.warn('Using local workout catalog fallback:', error);
    }

    this.cachedWorkouts = INITIAL_WORKOUTS;
    return INITIAL_WORKOUTS;
  }

  static async getWorkoutById(workoutId: string): Promise<Workout | null> {
    const workouts = await this.getWorkouts();
    return workouts.find(w => w.workoutId === workoutId) || null;
  }

  static filterWorkouts(
    workouts: Workout[], 
    category?: WorkoutCategory | 'All', 
    difficulty?: string, 
    searchQuery?: string
  ): Workout[] {
    return workouts.filter(w => {
      if (category && category !== 'All' && w.category !== category) return false;
      if (difficulty && difficulty !== 'All' && w.difficulty !== difficulty) return false;
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = w.title.toLowerCase().includes(q);
        const matchesCategory = w.category.toLowerCase().includes(q);
        const matchesMuscles = w.targetMuscles.some(m => m.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCategory && !matchesMuscles) return false;
      }
      return true;
    });
  }

  // Favorites in users/{userId}/favorite_workouts/{workoutId} with offline-first persistence
  static async getFavoriteWorkoutIds(userId: string): Promise<string[]> {
    const localFavs = LocalStorageService.getFavoriteWorkoutIds(userId);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const favColl = collection(db, 'users', userId, 'favorite_workouts');
        const snap = await getDocs(favColl);
        const remoteIds = snap.docs.map(d => d.id);
        const merged = Array.from(new Set([...localFavs, ...remoteIds]));
        LocalStorageService.saveFavoriteWorkoutIds(merged, userId);
        return merged;
      } catch (err) {
        return localFavs;
      }
    }

    return localFavs;
  }

  static async toggleFavoriteWorkout(userId: string, workoutId: string, isFav: boolean): Promise<boolean> {
    const { isFav: newStatus } = LocalStorageService.toggleFavoriteWorkoutId(workoutId, userId);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const favDoc = doc(db, 'users', userId, 'favorite_workouts', workoutId);
        if (!newStatus) {
          await deleteDoc(favDoc);
        } else {
          await setDoc(favDoc, { workoutId, favoritedAt: new Date().toISOString() });
        }
      } catch (e) {
        console.warn('Cloud sync of favorite skipped or failed, preserved locally:', e);
      }
    }

    return newStatus;
  }

  // Notes in users/{userId}/workout_notes/{noteId} with local persistence
  static async getNotes(userId: string): Promise<WorkoutNote[]> {
    const localNotes = LocalStorageService.getNotes(userId) as WorkoutNote[];
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const snap = await getDocs(collection(db, 'users', userId, 'workout_notes'));
        const remoteNotes = snap.docs.map(d => d.data() as WorkoutNote);
        const map = new Map<string, WorkoutNote>();
        localNotes.forEach(n => map.set(n.noteId, n));
        remoteNotes.forEach(n => map.set(n.noteId, n));
        const merged = Array.from(map.values());
        LocalStorageService.saveNotes(merged, userId);
        return merged;
      } catch {
        return localNotes;
      }
    }
    return localNotes;
  }

  static async saveNote(userId: string, note: Omit<WorkoutNote, 'noteId' | 'createdAt' | 'updatedAt'>): Promise<WorkoutNote> {
    const noteId = 'note_' + Date.now();
    const now = new Date().toISOString();
    const fullNote: WorkoutNote = {
      ...note,
      noteId,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    LocalStorageService.saveNote(fullNote, userId);

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'users', userId, 'workout_notes', noteId), fullNote);
      } catch (e) {
        console.warn('Cloud sync of note skipped or failed, saved locally:', e);
      }
    }
    return fullNote;
  }
}
