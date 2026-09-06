import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { DailyChallenge } from '../types';
import { INITIAL_DAILY_CHALLENGES } from '../data/initialCatalog';

export class ChallengeService {
  /**
   * Fetch daily challenges for the given user and today's date
   */
  static async getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'daily_challenges'));
      const list: DailyChallenge[] = [];
      snap.forEach(d => {
        const item = d.data() as DailyChallenge;
        if (item.challengeDate === today) {
          list.push(item);
        }
      });

      if (list.length === 0) {
        // Seed today's challenges for user
        const seeded: DailyChallenge[] = [];
        for (const c of INITIAL_DAILY_CHALLENGES) {
          const userChallenge: DailyChallenge = {
            ...c,
            userId,
            challengeDate: today,
            currentValue: 0,
            completionStatus: 'pending'
          };
          await setDoc(doc(db, 'users', userId, 'daily_challenges', c.challengeId), userChallenge).catch(() => {});
          seeded.push(userChallenge);
        }
        return seeded;
      }
      return list;
    } catch {
      return INITIAL_DAILY_CHALLENGES.map(c => ({ ...c, challengeDate: today, userId }));
    }
  }

  /**
   * Record activity into daily challenges and return names of newly completed challenges
   */
  static async recordActivity(userId: string, delta: { workouts?: number; minutes?: number; calories?: number }): Promise<string[]> {
    const challenges = await this.getDailyChallenges(userId);
    const completedNames: string[] = [];

    for (const c of challenges) {
      if (c.completionStatus === 'completed') continue;

      let added = 0;
      if (c.metric === 'workouts' && delta.workouts) added = delta.workouts;
      if (c.metric === 'minutes' && delta.minutes) added = delta.minutes;
      if (c.metric === 'calories' && delta.calories) added = delta.calories;

      if (added > 0) {
        const nextVal = c.currentValue + added;
        const isDone = nextVal >= c.targetValue;
        const updated: DailyChallenge = {
          ...c,
          currentValue: Math.min(nextVal, c.targetValue),
          completionStatus: isDone ? 'completed' : 'pending',
          completedAt: isDone ? new Date().toISOString() : undefined
        };

        try {
          await setDoc(doc(db, 'users', userId, 'daily_challenges', c.challengeId), updated, { merge: true });
        } catch (e) {
          console.warn('Daily challenge update offline fallback:', e);
        }

        if (isDone) {
          completedNames.push(c.title);
        }
      }
    }

    return completedNames;
  }
}
