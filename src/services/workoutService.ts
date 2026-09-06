import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Workout, WorkoutCategory, WorkoutNote, Exercise } from '../types';
import { INITIAL_WORKOUTS } from '../data/initialCatalog';
import { COMPREHENSIVE_EXERCISES } from '../data/allExercisesCatalog';

export class WorkoutService {
  private static cachedWorkouts: Workout[] = INITIAL_WORKOUTS;
  private static cachedExercises: Exercise[] = COMPREHENSIVE_EXERCISES;
  private static isSeedingWorkouts = false;
  private static isSeedingExercises = false;

  /**
   * Real-time subscription to cloud workouts.
   * Compares payload against in-memory cache to prevent infinite re-rendering.
   */
  static subscribeToWorkouts(callback: (workouts: Workout[]) => void): () => void {
    // Provide initial catalog immediately so UI has zero delay
    if (this.cachedWorkouts.length > 0) {
      callback(this.cachedWorkouts);
    } else {
      callback(INITIAL_WORKOUTS);
    }

    try {
      const workoutsColl = collection(db, 'workouts');
      return onSnapshot(workoutsColl, (snapshot) => {
        if (!snapshot.empty) {
          const list: Workout[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Workout);
          });

          // Check if data actually changed to prevent duplicate re-render cycles
          const isSame = this.cachedWorkouts.length === list.length &&
            this.cachedWorkouts.every((w, i) => w.workoutId === list[i]?.workoutId && w.title === list[i]?.title);

          if (!isSame) {
            this.cachedWorkouts = list;
            callback(list);
          }
        } else {
          // Cloud collection is currently empty
          callback(INITIAL_WORKOUTS);
          if (!this.isSeedingWorkouts) {
            this.isSeedingWorkouts = true;
            this.seedWorkoutsToCloud()
              .catch(err => console.warn('Background workout seed skipped/failed:', err))
              .finally(() => { this.isSeedingWorkouts = false; });
          }
        }
      }, (error) => {
        console.warn('Firestore workouts onSnapshot fallback to local catalog:', error);
        callback(this.cachedWorkouts.length > 0 ? this.cachedWorkouts : INITIAL_WORKOUTS);
      });
    } catch (err) {
      console.warn('Error subscribing to workouts in cloud:', err);
      callback(INITIAL_WORKOUTS);
      return () => {};
    }
  }

  /**
   * Real-time subscription to cloud exercises library.
   * Compares payload against in-memory cache to prevent infinite re-rendering.
   */
  static subscribeToExercises(callback: (exercises: Exercise[]) => void): () => void {
    if (this.cachedExercises.length > 0) {
      callback(this.cachedExercises);
    } else {
      callback(COMPREHENSIVE_EXERCISES);
    }

    try {
      const exercisesColl = collection(db, 'exercises');
      return onSnapshot(exercisesColl, (snapshot) => {
        if (!snapshot.empty) {
          const list: Exercise[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Exercise);
          });

          const isSame = this.cachedExercises.length === list.length &&
            this.cachedExercises[0]?.id === list[0]?.id &&
            this.cachedExercises[this.cachedExercises.length - 1]?.id === list[list.length - 1]?.id;

          if (!isSame) {
            this.cachedExercises = list;
            callback(list);
          }
        } else {
          callback(COMPREHENSIVE_EXERCISES);
          if (!this.isSeedingExercises) {
            this.isSeedingExercises = true;
            this.seedExercisesToCloud()
              .catch(err => console.warn('Background exercise seed skipped/failed:', err))
              .finally(() => { this.isSeedingExercises = false; });
          }
        }
      }, (error) => {
        console.warn('Firestore exercises onSnapshot fallback to local catalog:', error);
        callback(COMPREHENSIVE_EXERCISES);
      });
    } catch {
      callback(COMPREHENSIVE_EXERCISES);
      return () => {};
    }
  }

  /**
   * Push all catalog workouts directly to Firestore using batched writes
   * to fire exactly ONE snapshot notification instead of dozens of sequential updates.
   */
  static async seedWorkoutsToCloud(): Promise<number> {
    try {
      const batch = writeBatch(db);
      for (const w of INITIAL_WORKOUTS) {
        const ref = doc(db, 'workouts', w.workoutId);
        batch.set(ref, w);
      }
      await batch.commit();
      this.cachedWorkouts = INITIAL_WORKOUTS;
      return INITIAL_WORKOUTS.length;
    } catch (err) {
      console.warn('Batch seed workouts failed, falling back to individual sets:', err);
      let count = 0;
      for (const w of INITIAL_WORKOUTS) {
        try {
          await setDoc(doc(db, 'workouts', w.workoutId), w);
          count++;
        } catch {
          // ignore permission errors for guest
        }
      }
      this.cachedWorkouts = INITIAL_WORKOUTS;
      return count;
    }
  }

  /**
   * Push all 50+ individual exercises to Firestore in batches of 500 (standard Firestore limit)
   */
  static async seedExercisesToCloud(): Promise<number> {
    try {
      const batch = writeBatch(db);
      for (const ex of COMPREHENSIVE_EXERCISES) {
        const ref = doc(db, 'exercises', ex.id);
        batch.set(ref, ex);
      }
      await batch.commit();
      this.cachedExercises = COMPREHENSIVE_EXERCISES;
      return COMPREHENSIVE_EXERCISES.length;
    } catch (err) {
      console.warn('Batch seed exercises failed, falling back:', err);
      this.cachedExercises = COMPREHENSIVE_EXERCISES;
      return COMPREHENSIVE_EXERCISES.length;
    }
  }

  /**
   * Get all exercises (from cache or initial comprehensive list)
   */
  static async getExercises(): Promise<Exercise[]> {
    if (this.cachedExercises.length > 0) {
      return this.cachedExercises;
    }
    try {
      const snap = await getDocs(collection(db, 'exercises'));
      if (!snap.empty) {
        const list: Exercise[] = [];
        snap.forEach(d => list.push(d.data() as Exercise));
        this.cachedExercises = list;
        return list;
      } else {
        await this.seedExercisesToCloud();
        return COMPREHENSIVE_EXERCISES;
      }
    } catch {
      this.cachedExercises = COMPREHENSIVE_EXERCISES;
      return COMPREHENSIVE_EXERCISES;
    }
  }

  /**
   * Seed catalog to Firestore `workouts/{workoutId}` if empty, or fetch all workouts
   */
  static async getWorkouts(): Promise<Workout[]> {
    if (this.cachedWorkouts.length > 0) {
      return this.cachedWorkouts;
    }

    try {
      const workoutsColl = collection(db, 'workouts');
      const snapshot = await getDocs(workoutsColl);

      if (snapshot.empty) {
        // Seed default catalog to Firestore
        await this.seedWorkoutsToCloud();
        this.cachedWorkouts = INITIAL_WORKOUTS;
        return INITIAL_WORKOUTS;
      } else {
        const list: Workout[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Workout);
        });
        this.cachedWorkouts = list.length > 0 ? list : INITIAL_WORKOUTS;
        return this.cachedWorkouts;
      }
    } catch (error) {
      console.warn('Using local workout catalog fallback:', error);
      this.cachedWorkouts = INITIAL_WORKOUTS;
      return INITIAL_WORKOUTS;
    }
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

  // Favorites in users/{userId}/favorite_workouts/{workoutId}
  static async getFavoriteWorkoutIds(userId: string): Promise<string[]> {
    try {
      const favColl = collection(db, 'users', userId, 'favorite_workouts');
      const snap = await getDocs(favColl);
      return snap.docs.map(d => d.id);
    } catch {
      return [];
    }
  }

  static async toggleFavoriteWorkout(userId: string, workoutId: string, isFav: boolean): Promise<boolean> {
    try {
      const favDoc = doc(db, 'users', userId, 'favorite_workouts', workoutId);
      if (isFav) {
        await deleteDoc(favDoc);
        return false;
      } else {
        await setDoc(favDoc, { workoutId, favoritedAt: new Date().toISOString() });
        return true;
      }
    } catch (e) {
      console.error('Failed to toggle favorite', e);
      return !isFav;
    }
  }

  // Notes in users/{userId}/workout_notes/{noteId}
  static async getNotes(userId: string): Promise<WorkoutNote[]> {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'workout_notes'));
      return snap.docs.map(d => d.data() as WorkoutNote);
    } catch {
      return [];
    }
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
    try {
      await setDoc(doc(db, 'users', userId, 'workout_notes', noteId), fullNote);
    } catch (e) {
      console.warn('Saved note locally fallback:', e);
    }
    return fullNote;
  }
}
