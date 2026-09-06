import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Achievement, UserProfile } from '../types';
import { INITIAL_ACHIEVEMENT_DEFINITIONS } from '../data/initialCatalog';

export class AchievementService {
  /**
   * Fetch all achievements for a user, combining definitions with user-specific unlock state
   * at users/{userId}/achievements/{achievementId}
   */
  static async getUserAchievements(userId: string, userProfile?: UserProfile | null): Promise<Achievement[]> {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'achievements'));
      const userMap = new Map<string, Partial<Achievement>>();
      snap.forEach(d => {
        userMap.set(d.id, d.data() as Achievement);
      });

      return INITIAL_ACHIEVEMENT_DEFINITIONS.map(def => {
        const userRec = userMap.get(def.achievementId);
        if (userRec) {
          return {
            ...def,
            ...userRec,
          };
        }

        // Calculate initial progress based on current userProfile
        let currentProg = 0;
        if (userProfile) {
          if (def.achievementId === 'ach-first-workout' || def.achievementId === 'ach-workouts-10' || def.achievementId === 'ach-workouts-100') {
            currentProg = userProfile.totalWorkoutCount || 0;
          } else if (def.achievementId === 'ach-first-step') {
            currentProg = userProfile.totalWorkoutMinutes || 0;
          } else if (def.achievementId === 'ach-streak-7' || def.achievementId === 'ach-streak-30') {
            currentProg = userProfile.longestStreak || 0;
          } else if (def.achievementId === 'ach-cardio-crusher') {
            currentProg = userProfile.totalCaloriesBurned || 0;
          } else if (def.achievementId === 'ach-strength-builder') {
            currentProg = Math.floor((userProfile.totalWorkoutCount || 0) * 0.7);
          }
        }

        const isUnlocked = currentProg >= def.requirement;
        return {
          ...def,
          progress: Math.min(currentProg, def.requirement),
          isUnlocked,
          unlockedAt: isUnlocked ? new Date().toISOString() : undefined
        };
      });
    } catch (e) {
      console.warn('Local achievements fallback:', e);
      return INITIAL_ACHIEVEMENT_DEFINITIONS;
    }
  }

  /**
   * Evaluates user stats and unlocks badges automatically in users/{userId}/achievements/{achievementId}
   * Prevents duplicate unlock records.
   */
  static async evaluateUserProgress(userId: string, profile: UserProfile): Promise<string[]> {
    const newlyUnlocked: string[] = [];
    const currentList = await this.getUserAchievements(userId, profile);

    for (const ach of currentList) {
      if (ach.isUnlocked) continue; // Already unlocked

      let progressVal = 0;
      switch (ach.achievementId) {
        case 'ach-first-workout':
        case 'ach-workouts-10':
        case 'ach-workouts-100':
          progressVal = profile.totalWorkoutCount;
          break;
        case 'ach-first-step':
          progressVal = profile.totalWorkoutMinutes;
          break;
        case 'ach-streak-7':
        case 'ach-streak-30':
          progressVal = profile.currentStreak;
          break;
        case 'ach-cardio-crusher':
          progressVal = profile.totalCaloriesBurned;
          break;
        case 'ach-strength-builder':
          progressVal = profile.totalWorkoutCount;
          break;
      }

      const reached = progressVal >= ach.requirement;
      const updatedAch: Achievement = {
        ...ach,
        progress: Math.min(progressVal, ach.requirement),
        isUnlocked: reached,
        unlockedAt: reached ? new Date().toISOString() : undefined
      };

      // Save to Firestore
      try {
        const achRef = doc(db, 'users', userId, 'achievements', ach.achievementId);
        await setDoc(achRef, updatedAch, { merge: true });
      } catch (err) {
        console.warn('Failed to sync achievement to firestore:', err);
      }

      if (reached) {
        newlyUnlocked.push(ach.name);
      }
    }

    return newlyUnlocked;
  }
}
