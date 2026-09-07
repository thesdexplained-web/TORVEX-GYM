import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { WorkoutSession, UserProfile } from '../types';
import { LocalStorageService } from './localStorageService';
import { AchievementService } from './achievementService';
import { ChallengeService } from './challengeService';

export class SessionService {
  /**
   * Generates an idempotent, unique session ID
   */
  static createNewSessionId(): string {
    return 'torvex_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  /**
   * Save or update an in-progress or completed session.
   * Uses doc(db, 'users', userId, 'workout_sessions', sessionId) for idempotent writes.
   */
  static async recordWorkoutSession(session: WorkoutSession): Promise<void> {
    // 1. Immediately cache to local storage so user history is never lost or delayed
    LocalStorageService.addSessionToHistory(session, session.userId);

    // 2. Sync to Firestore if user is authenticated as owner
    try {
      if (auth.currentUser && auth.currentUser.uid === session.userId) {
        const sessionRef = doc(db, 'users', session.userId, 'workout_sessions', session.sessionId);
        const dataToSave = {
          ...session,
          syncedAt: new Date().toISOString()
        };
        await setDoc(sessionRef, dataToSave, { merge: true });
      } else {
        // Queue for synchronization when user authenticates
        LocalStorageService.addToSyncQueue({
          type: 'SAVE_WORKOUT_SESSION',
          payload: session
        });
      }
    } catch (error) {
      console.warn('Network write failed, adding session to offline sync queue:', error);
      LocalStorageService.addToSyncQueue({
        type: 'SAVE_WORKOUT_SESSION',
        payload: session
      });
    }
  }

  /**
   * Complete a workout session.
   * Performs atomic updates:
   * 1. Records completed session
   * 2. Recalculates streak & streaks history
   * 3. Increments totalWorkoutCount, totalWorkoutMinutes, totalCaloriesBurned on user profile
   * 4. Evaluates daily challenges
   * 5. Evaluates achievements
   */
  static async completeSession(session: WorkoutSession, userProfile: UserProfile): Promise<{
    updatedProfile: UserProfile;
    unlockedAchievements: string[];
    completedChallenges: string[];
  }> {
    const completedSession: WorkoutSession = {
      ...session,
      completionStatus: 'completed',
      completedAt: session.completedAt || new Date().toISOString(),
    };

    // 1. Save session record (idempotent)
    await this.recordWorkoutSession(completedSession);

    // 2. Compute duration in minutes and calories
    const minutes = Math.max(1, Math.round(completedSession.durationSeconds / 60));
    const calories = completedSession.caloriesBurned;

    // 3. Compute Streak
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveDate = userProfile.lastActiveAt ? userProfile.lastActiveAt.split('T')[0] : '';
    
    let newCurrentStreak = userProfile.currentStreak || 0;
    if (!lastActiveDate) {
      newCurrentStreak = 1;
    } else if (lastActiveDate === todayStr) {
      // Already trained today, maintain current streak
      newCurrentStreak = Math.max(1, newCurrentStreak);
    } else {
      const prevDate = new Date();
      prevDate.setDate(prevDate.getDate() - 1);
      const yesterdayStr = prevDate.toISOString().split('T')[0];

      if (lastActiveDate === yesterdayStr) {
        newCurrentStreak += 1;
      } else {
        // Streak broken
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(userProfile.longestStreak || 0, newCurrentStreak);
    const newTotalCount = (userProfile.totalWorkoutCount || 0) + 1;
    const newTotalMinutes = (userProfile.totalWorkoutMinutes || 0) + minutes;
    const newTotalCalories = (userProfile.totalCaloriesBurned || 0) + calories;

    const updatedProfile: UserProfile = {
      ...userProfile,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      totalWorkoutCount: newTotalCount,
      totalWorkoutMinutes: newTotalMinutes,
      totalCaloriesBurned: newTotalCalories,
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update user document in Firestore
    try {
      const userRef = doc(db, 'users', userProfile.userId);
      await updateDoc(userRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        totalWorkoutCount: newTotalCount,
        totalWorkoutMinutes: newTotalMinutes,
        totalCaloriesBurned: newTotalCalories,
        lastActiveAt: updatedProfile.lastActiveAt,
        updatedAt: updatedProfile.updatedAt
      });

      // Also record streak history in users/{userId}/streak_history/{streakId}
      const streakRecordRef = doc(db, 'users', userProfile.userId, 'streak_history', todayStr);
      await setDoc(streakRecordRef, {
        streakId: todayStr,
        userId: userProfile.userId,
        date: todayStr,
        workoutsCompleted: 1,
        minutesLogged: minutes,
        caloriesLogged: calories
      }, { merge: true });

    } catch (e) {
      console.warn('Offline update user profile stats fallback:', e);
      LocalStorageService.addToSyncQueue({
        type: 'UPDATE_USER_STATS',
        payload: updatedProfile
      });
    }

    // 4. Update Daily Challenges
    const completedChallenges = await ChallengeService.recordActivity(userProfile.userId, {
      workouts: 1,
      minutes,
      calories
    });

    // 5. Check and unlock achievements
    const unlockedAchievements = await AchievementService.evaluateUserProgress(userProfile.userId, updatedProfile);

    // Clear active session cache
    LocalStorageService.clearActiveSession();

    return {
      updatedProfile,
      unlockedAchievements,
      completedChallenges
    };
  }

  /**
   * Fetch user workout history from local storage cache with Firestore synchronization.
   * Prevents permission-denied errors when unauthenticated or offline.
   */
  static async getUserSessions(userId: string): Promise<WorkoutSession[]> {
    const cachedSessions = LocalStorageService.getCachedSessionsHistory(userId) as WorkoutSession[];

    // If unauthenticated or userId does not match current auth, return cached sessions without throwing
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return cachedSessions;
    }

    try {
      const sessColl = collection(db, 'users', userId, 'workout_sessions');
      const q = query(sessColl, orderBy('startedAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const cloudList: WorkoutSession[] = [];
      snap.forEach(d => {
        const item = d.data() as WorkoutSession;
        if (item && item.sessionId) {
          cloudList.push(item);
        }
      });

      // Merge cloud list with local cached sessions (cloud takes precedence for same sessionId)
      const sessionMap = new Map<string, WorkoutSession>();
      cachedSessions.forEach(s => sessionMap.set(s.sessionId, s));
      cloudList.forEach(s => sessionMap.set(s.sessionId, s));

      const merged = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

      LocalStorageService.saveCachedSessionsHistory(merged, userId);
      return merged;
    } catch (error) {
      // Return cached sessions on network or permission errors silently
      return cachedSessions;
    }
  }
}
