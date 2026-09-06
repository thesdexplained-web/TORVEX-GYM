/**
 * LocalStorageService - Manages offline caching, preferences,
 * interrupted workout recovery, and sync queues
 */

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'torvex_onboarding_completed',
  THEME_MODE: 'torvex_theme_mode',
  ACTIVE_SESSION_CACHE: 'torvex_active_session_cache',
  OFFLINE_SYNC_QUEUE: 'torvex_offline_sync_queue',
  OFFLINE_USER_CACHE: 'torvex_user_profile_cache',
  OFFLINE_SESSIONS_HISTORY: 'torvex_sessions_history_cache',
  OFFLINE_SUBSCRIPTION_CACHE: 'torvex_subscription_cache',
  HEALTH_CONNECTIONS_CACHE: 'torvex_health_connections_cache',
};

export interface SyncQueueItem {
  id: string;
  type: 'SAVE_WORKOUT_SESSION' | 'UPDATE_USER_STATS' | 'UPDATE_CHALLENGE' | 'UPDATE_HEALTH_SYNC';
  payload: any;
  timestamp: string;
  retryCount: number;
}

export class LocalStorageService {
  static hasCompletedOnboarding(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
    } catch {
      return false;
    }
  }

  static setCompletedOnboarding(completed: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to write onboarding state', e);
    }
  }

  static getTheme(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'dark';
    } catch {
      return 'dark';
    }
  }

  static setTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
    } catch (e) {
      console.error('Failed to set theme in local storage', e);
    }
  }

  static saveActiveSession(sessionData: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_CACHE, JSON.stringify(sessionData));
    } catch (e) {
      console.error('Failed to cache active session', e);
    }
  }

  static getActiveSession(): any | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clearActiveSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_CACHE);
    } catch (e) {
      console.error('Failed to clear active session', e);
    }
  }

  // Offline Sync Queue
  static getSyncQueue(): SyncQueueItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    try {
      const queue = this.getSyncQueue();
      const newItem: SyncQueueItem = {
        ...item,
        id: 'sync_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      queue.push(newItem);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to add to sync queue', e);
    }
  }

  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue().filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to remove item from sync queue', e);
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE);
    } catch (e) {
      console.error('Failed to clear sync queue', e);
    }
  }

  // Persisted User Profile & Session Auth Caching
  static getCachedUserProfile(): any | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_USER_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static saveCachedUserProfile(profile: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_USER_CACHE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to cache user profile', e);
    }
  }

  static clearCachedUserProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_USER_CACHE);
    } catch (e) {
      console.error('Failed to clear cached user profile', e);
    }
  }
}
