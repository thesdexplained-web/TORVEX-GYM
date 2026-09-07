import { FreeMonthStatus } from '../types';

export class NotificationService {
  private static STORAGE_KEY = 'torvex_notified_tiers';

  /**
   * Request permission for local web notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check and fire local notifications for 15, 7, 3, 1 days remaining
   */
  static checkAndFireReminders(status: FreeMonthStatus) {
    if (!status.reminderNotice) return;
    const tier = status.reminderNotice.tier;

    // Check if we already notified for this tier today
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `${this.STORAGE_KEY}_${tier}_${dateStr}`;
    if (localStorage.getItem(key)) {
      return;
    }

    // Attempt browser notification if supported and granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(status.reminderNotice.title, {
          body: status.reminderNotice.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        localStorage.setItem(key, 'true');
      } catch (e) {
        console.warn('Local notification trigger error:', e);
      }
    }
  }
}
