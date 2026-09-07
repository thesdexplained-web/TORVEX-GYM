/**
 * LocalStorageService - Manages offline caching, session history,
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
  FAVORITES_CACHE: 'torvex_favorites_cache',
  NOTES_CACHE: 'torvex_notes_cache',
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

  // Persisted Subscription Caching
  static getCachedSubscription(): any | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_SUBSCRIPTION_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static saveCachedSubscription(sub: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SUBSCRIPTION_CACHE, JSON.stringify(sub));
    } catch (e) {
      console.error('Failed to cache subscription', e);
    }
  }

  static clearCachedSubscription(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_SUBSCRIPTION_CACHE);
    } catch (e) {
      console.error('Failed to clear cached subscription', e);
    }
  }

  // Persisted Favorites Caching
  static getFavoriteWorkoutIds(userId?: string): string[] {
    try {
      const key = userId ? `${STORAGE_KEYS.FAVORITES_CACHE}_${userId}` : STORAGE_KEYS.FAVORITES_CACHE;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      // Fallback to global favorites cache if user-specific is empty
      const globalRaw = localStorage.getItem(STORAGE_KEYS.FAVORITES_CACHE);
      return globalRaw ? JSON.parse(globalRaw) : [];
    } catch {
      return [];
    }
  }

  static saveFavoriteWorkoutIds(ids: string[], userId?: string): void {
    try {
      const key = userId ? `${STORAGE_KEYS.FAVORITES_CACHE}_${userId}` : STORAGE_KEYS.FAVORITES_CACHE;
      const json = JSON.stringify(ids);
      localStorage.setItem(key, json);
      localStorage.setItem(STORAGE_KEYS.FAVORITES_CACHE, json);
    } catch (e) {
      console.warn('Failed to cache favorite workout IDs:', e);
    }
  }

  static toggleFavoriteWorkoutId(workoutId: string, userId?: string): { isFav: boolean; updatedIds: string[] } {
    try {
      const current = this.getFavoriteWorkoutIds(userId);
      const isAlreadyFav = current.includes(workoutId);
      const updated = isAlreadyFav
        ? current.filter(id => id !== workoutId)
        : [...current, workoutId];
      this.saveFavoriteWorkoutIds(updated, userId);
      return { isFav: !isAlreadyFav, updatedIds: updated };
    } catch (e) {
      console.warn('Failed to toggle favorite locally:', e);
      return { isFav: false, updatedIds: [] };
    }
  }

  // Persisted Notes Caching
  static getNotes(userId?: string): any[] {
    try {
      const key = userId ? `${STORAGE_KEYS.NOTES_CACHE}_${userId}` : STORAGE_KEYS.NOTES_CACHE;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveNotes(notes: any[], userId?: string): void {
    try {
      const key = userId ? `${STORAGE_KEYS.NOTES_CACHE}_${userId}` : STORAGE_KEYS.NOTES_CACHE;
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to cache notes:', e);
    }
  }

  static saveNote(note: any, userId?: string): void {
    try {
      const current = this.getNotes(userId);
      const existingIdx = current.findIndex(n => n.noteId === note.noteId);
      let updated: any[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = note;
      } else {
        updated = [note, ...current];
      }
      this.saveNotes(updated, userId);
    } catch (e) {
      console.warn('Failed to save note locally:', e);
    }
  }

  // Persisted Workout Sessions History Caching
  static getCachedSessionsHistory(userId?: string): any[] {
    try {
      const key = userId ? `${STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY}_${userId}` : STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      const globalRaw = localStorage.getItem(STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY);
      return globalRaw ? JSON.parse(globalRaw) : [];
    } catch {
      return [];
    }
  }

  static saveCachedSessionsHistory(sessions: any[], userId?: string): void {
    try {
      const key = userId ? `${STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY}_${userId}` : STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY;
      const json = JSON.stringify(sessions);
      localStorage.setItem(key, json);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SESSIONS_HISTORY, json);
    } catch (e) {
      console.warn('Failed to cache sessions history:', e);
    }
  }

  static addSessionToHistory(session: any, userId?: string): any[] {
    try {
      const existing = this.getCachedSessionsHistory(userId);
      const filtered = existing.filter(s => s.sessionId !== session.sessionId);
      const updated = [session, ...filtered];
      this.saveCachedSessionsHistory(updated, userId);
      return updated;
    } catch (e) {
      console.warn('Failed to add session to local history:', e);
      return [session];
    }
  }
}
