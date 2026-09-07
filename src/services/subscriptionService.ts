import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  UserSubscription, 
  SubscriptionProduct, 
  SubscriptionPlanType, 
  SubscriptionStatus,
  FreeMonthStatus 
} from '../types';
import { SUBSCRIPTION_PRODUCTS } from '../data/initialCatalog';
import { LocalStorageService } from './localStorageService';

export class SubscriptionService {
  private static cachedSubscription: UserSubscription | null = null;
  private static listeners: ((sub: UserSubscription) => void)[] = [];

  static subscribe(listener: (sub: UserSubscription) => void) {
    this.listeners.push(listener);
    if (this.cachedSubscription) {
      listener(this.cachedSubscription);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(sub: UserSubscription) {
    this.cachedSubscription = sub;
    LocalStorageService.saveCachedSubscription(sub);
    this.listeners.forEach(l => l(sub));
  }

  /**
   * Get subscription from users/{userId}/subscription/current or initialize 1-Month (30-Day) Free Access
   */
  static async getSubscription(userId: string): Promise<UserSubscription> {
    try {
      // 1. Check local cache first
      const cached = LocalStorageService.getCachedSubscription();
      if (cached && cached.userId === userId) {
        this.cachedSubscription = cached;
      }

      // 2. Fetch from Firestore users/{userId}/subscription/current
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      const snap = await getDoc(subRef).catch(() => null);

      if (snap && snap.exists()) {
        const sub = snap.data() as UserSubscription;
        // Verify expiry in real-time
        const verifiedSub = this.verifyExpiration(sub);
        this.notify(verifiedSub);
        return verifiedSub;
      }

      if (this.cachedSubscription && this.cachedSubscription.userId === userId) {
        const verifiedSub = this.verifyExpiration(this.cachedSubscription);
        return verifiedSub;
      }

      // Default: 1-Month (30 Days) Full Free Access on First Login
      const now = new Date();
      const freeMonthEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const initialFreeMonthSub: UserSubscription = {
        userId,
        entitlement: 'premium', // 100% full Pro access unlocked for 30 days
        status: 'trial_active',
        productId: 'free_month',
        planType: 'monthly',
        platform: 'web',
        trialActive: true,
        trialStart: now.toISOString(),
        trialEnd: freeMonthEnd.toISOString(),
        purchaseDate: now.toISOString(),
        expirationDate: freeMonthEnd.toISOString(),
        autoRenew: false,
        willRenew: false,
        freeMonthActive: true,
        freeMonthStart: now.toISOString(),
        freeMonthEnd: freeMonthEnd.toISOString(),
        lastSyncedAt: now.toISOString()
      };

      await setDoc(subRef, initialFreeMonthSub).catch(() => {});
      this.notify(initialFreeMonthSub);
      return initialFreeMonthSub;
    } catch (err) {
      console.warn('Subscription fetch fallback to local state:', err);
      const now = new Date();
      const freeMonthEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const fallback: UserSubscription = this.cachedSubscription || {
        userId,
        entitlement: 'premium',
        status: 'trial_active',
        productId: 'free_month',
        planType: 'monthly',
        platform: 'web',
        trialActive: true,
        trialStart: now.toISOString(),
        trialEnd: freeMonthEnd.toISOString(),
        purchaseDate: now.toISOString(),
        expirationDate: freeMonthEnd.toISOString(),
        autoRenew: false,
        willRenew: false,
        freeMonthActive: true,
        freeMonthStart: now.toISOString(),
        freeMonthEnd: freeMonthEnd.toISOString(),
        lastSyncedAt: now.toISOString()
      };
      const verified = this.verifyExpiration(fallback);
      this.notify(verified);
      return verified;
    }
  }

  /**
   * Internal helper to verify if 30-day free access or subscription is expired
   */
  private static verifyExpiration(sub: UserSubscription): UserSubscription {
    // If user has a paid active subscription, verify its expiration date
    if (sub.status === 'premium_active') {
      if (sub.expirationDate && new Date(sub.expirationDate).getTime() < Date.now()) {
        const expiredSub: UserSubscription = {
          ...sub,
          entitlement: 'free',
          status: 'expired',
          freeMonthActive: false
        };
        return expiredSub;
      }
      return sub;
    }

    // If user is on 1-month free access
    if (sub.status === 'trial_active' || sub.freeMonthActive) {
      const expTime = sub.expirationDate ? new Date(sub.expirationDate).getTime() : 0;
      if (expTime > 0 && Date.now() >= expTime) {
        const expiredSub: UserSubscription = {
          ...sub,
          entitlement: 'free',
          status: 'expired',
          trialActive: false,
          freeMonthActive: false
        };
        return expiredSub;
      }
    }

    return sub;
  }

  /**
   * Calculate detailed 1-Month Free Access status including 15, 7, 3, 1 day reminders
   */
  static getFreeMonthStatus(sub?: UserSubscription | null): FreeMonthStatus {
    const s = sub || this.cachedSubscription;
    if (!s) {
      return {
        isWithinFreeMonth: false,
        isExpired: false,
        daysRemaining: 0,
        startDate: '',
        endDate: '',
        reminderNotice: null
      };
    }

    // If paid subscriber, no free trial reminders
    if (s.status === 'premium_active') {
      return {
        isWithinFreeMonth: false,
        isExpired: false,
        daysRemaining: 999,
        startDate: s.purchaseDate || '',
        endDate: s.expirationDate || '',
        reminderNotice: null
      };
    }

    const now = Date.now();
    const expTime = s.expirationDate ? new Date(s.expirationDate).getTime() : 0;
    const diffMs = expTime - now;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isExpired = diffMs <= 0 || s.status === 'expired';

    let reminderNotice: FreeMonthStatus['reminderNotice'] = null;

    if (isExpired) {
      reminderNotice = {
        tier: 0,
        title: 'Free Month Expired',
        message: 'Your 30-day free access period has ended. To continue using the application, please purchase a subscription. You can choose Monthly, 6-Month, or Yearly plans. Without an active subscription, the application cannot be used.',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      };
    } else if (daysRemaining <= 1) {
      reminderNotice = {
        tier: 1,
        title: '1 Day Remaining in Free Month!',
        message: 'Final 24 hours of your 1-Month Free Access! Choose a plan today to prevent your workout logging and streaks from pausing.',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      };
    } else if (daysRemaining <= 3) {
      reminderNotice = {
        tier: 3,
        title: '3 Days Remaining in Free Month',
        message: 'Only 3 days left of free access. Select Monthly, 6-Month, or Yearly to keep full access to Torvex AI Coach and all routines.',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    } else if (daysRemaining <= 7) {
      reminderNotice = {
        tier: 7,
        title: '7 Days Remaining in Free Month',
        message: '1 week remaining in your 1-Month Free Access! Lock in an Annual Pass to save 45% on uninterrupted gym progress.',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    } else if (daysRemaining <= 15) {
      reminderNotice = {
        tier: 15,
        title: '15 Days Remaining in Free Month',
        message: 'Halfway through your 1-Month Free Access! You have full access to all advanced splits, metrics, and wearable telemetry.',
        badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      };
    }

    return {
      isWithinFreeMonth: !isExpired && (s.trialActive || s.freeMonthActive || s.status === 'trial_active'),
      isExpired,
      daysRemaining,
      startDate: s.freeMonthStart || s.trialStart || '',
      endDate: s.expirationDate || '',
      reminderNotice
    };
  }

  static isPremium(sub?: UserSubscription | null): boolean {
    const s = sub || this.cachedSubscription;
    if (!s) return false;
    const verified = this.verifyExpiration(s);
    return verified.entitlement === 'premium' && (
      verified.status === 'premium_active' || 
      verified.status === 'trial_active' || 
      verified.status === 'grace_period'
    );
  }

  static getProducts(): SubscriptionProduct[] {
    return SUBSCRIPTION_PRODUCTS;
  }

  /**
   * Helper to activate 1-month free access
   */
  static async startFreeTrial(userId: string, _planType: SubscriptionPlanType = 'yearly'): Promise<UserSubscription> {
    return this.getSubscription(userId);
  }

  /**
   * Complete purchase of Monthly, 6-Month, or Yearly plan
   */
  static async purchasePlan(userId: string, planType: SubscriptionPlanType): Promise<UserSubscription> {
    const now = new Date();
    const prod = SUBSCRIPTION_PRODUCTS.find(p => p.planType === planType) || SUBSCRIPTION_PRODUCTS[0];
    const expDate = new Date(now);
    expDate.setMonth(expDate.getMonth() + prod.billingPeriodMonths);

    const updatedSub: UserSubscription = {
      userId,
      entitlement: 'premium',
      status: 'premium_active',
      productId: prod.productId,
      planType,
      platform: 'web',
      trialActive: false,
      freeMonthActive: false,
      purchaseDate: now.toISOString(),
      expirationDate: expDate.toISOString(),
      autoRenew: true,
      willRenew: true,
      lastSyncedAt: now.toISOString()
    };

    try {
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      await setDoc(subRef, updatedSub, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Cloud sync for purchase deferred:', e);
    }

    this.notify(updatedSub);
    return updatedSub;
  }

  /**
   * Restore purchases
   */
  static async restorePurchases(userId: string): Promise<{ success: boolean; subscription: UserSubscription }> {
    const sub = await this.getSubscription(userId);
    this.notify(sub);
    return {
      success: true,
      subscription: sub
    };
  }

  /**
   * Development Subscription Simulator
   * Allows QA to simulate all lifecycle states and custom days remaining (15d, 7d, 3d, 1d, expired)
   */
  static async simulateState(
    userId: string, 
    targetStatus: SubscriptionStatus, 
    daysRemainingOverride?: number
  ): Promise<UserSubscription> {
    const now = new Date();
    let entitlement: 'free' | 'premium' = 'free';
    let trialActive = false;
    let freeMonthActive = false;
    let trialStart: string | undefined;
    let trialEnd: string | undefined;
    let expirationDate: string | undefined;

    if (targetStatus === 'premium_active') {
      entitlement = 'premium';
      const exp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expirationDate = exp.toISOString();
    } else if (targetStatus === 'trial_active') {
      entitlement = 'premium';
      trialActive = true;
      freeMonthActive = true;
      const days = typeof daysRemainingOverride === 'number' ? daysRemainingOverride : 30;
      trialStart = now.toISOString();
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      trialEnd = end.toISOString();
      expirationDate = trialEnd;
    } else if (targetStatus === 'grace_period') {
      entitlement = 'premium';
      expirationDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (targetStatus === 'expired') {
      entitlement = 'free';
      // Set expiration to 1 hour in the past
      expirationDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    } else {
      entitlement = 'free';
    }

    const updatedSub: UserSubscription = {
      userId,
      entitlement,
      status: targetStatus,
      productId: entitlement === 'premium' ? 'torvex_sub_yearly' : 'free_tier',
      planType: 'yearly',
      platform: 'web',
      trialActive,
      freeMonthActive,
      trialStart,
      trialEnd,
      purchaseDate: now.toISOString(),
      expirationDate,
      autoRenew: targetStatus === 'premium_active',
      willRenew: targetStatus === 'premium_active',
      lastSyncedAt: now.toISOString()
    };

    try {
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      const firestorePayload = Object.fromEntries(
        Object.entries(updatedSub).filter(([_, v]) => v !== undefined)
      );
      await setDoc(subRef, firestorePayload, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Subscription Simulator cloud sync deferred:', e);
    }

    this.notify(updatedSub);
    return updatedSub;
  }
}
