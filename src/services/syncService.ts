import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { LocalStorageService, SyncQueueItem } from './localStorageService';

export type SyncEngineState = 'synced' | 'syncing' | 'pending' | 'failed' | 'retrying';

export interface SyncStatusListener {
  (state: SyncEngineState, pendingCount: number, lastSyncTime?: string): void;
}

export class SyncService {
  private static currentState: SyncEngineState = 'synced';
  private static listeners: SyncStatusListener[] = [];
  private static lastSyncTime: string = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  private static isSyncing = false;

  static init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  static onStatusChange(listener: SyncStatusListener) {
    this.listeners.push(listener);
    const queue = LocalStorageService.getSyncQueue();
    listener(this.currentState, queue.length, this.lastSyncTime);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    const queue = LocalStorageService.getSyncQueue();
    this.listeners.forEach(l => l(this.currentState, queue.length, this.lastSyncTime));
  }

  static getState(): { state: SyncEngineState; pendingCount: number; lastSyncTime: string } {
    return {
      state: this.currentState,
      pendingCount: LocalStorageService.getSyncQueue().length,
      lastSyncTime: this.lastSyncTime
    };
  }

  /**
   * Process all offline queued operations and synchronize to Firebase
   */
  static async processQueue(): Promise<void> {
    if (this.isSyncing) return;
    const queue = LocalStorageService.getSyncQueue();
    if (queue.length === 0) {
      this.currentState = 'synced';
      this.notify();
      return;
    }

    this.isSyncing = true;
    this.currentState = 'syncing';
    this.notify();

    for (const item of queue) {
      try {
        await this.executeOperation(item);
        LocalStorageService.removeFromSyncQueue(item.id);
      } catch (err) {
        console.error('Failed to sync item:', item, err);
        item.retryCount += 1;
        this.currentState = 'retrying';
      }
    }

    this.isSyncing = false;
    const remaining = LocalStorageService.getSyncQueue();
    if (remaining.length === 0) {
      this.currentState = 'synced';
      this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      this.currentState = 'failed';
    }
    this.notify();
  }

  private static async executeOperation(item: SyncQueueItem): Promise<void> {
    if (item.type === 'SAVE_WORKOUT_SESSION') {
      const session = item.payload;
      const ref = doc(db, 'users', session.userId, 'workout_sessions', session.sessionId);
      await setDoc(ref, session, { merge: true });
    } else if (item.type === 'UPDATE_USER_STATS') {
      const profile = item.payload;
      const ref = doc(db, 'users', profile.userId);
      await updateDoc(ref, {
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        totalWorkoutCount: profile.totalWorkoutCount,
        totalWorkoutMinutes: profile.totalWorkoutMinutes,
        totalCaloriesBurned: profile.totalCaloriesBurned,
        lastActiveAt: profile.lastActiveAt,
        updatedAt: new Date().toISOString()
      });
    }
  }
}
