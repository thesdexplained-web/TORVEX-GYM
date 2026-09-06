import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  UserSubscription, 
  SubscriptionProduct, 
  SubscriptionPlanType, 
  SubscriptionStatus 
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
   * Get subscription from users/{userId}/subscription/current or initialize Free
   */
  static async getSubscription(userId: string): Promise<UserSubscription> {
    try {
      // 1. Check local cache first
      const cached = LocalStorageService.getCachedSubscription();
      if (cached && cached.userId === userId) {
        this.cachedSubscription = cached;
      }

      // 2. Fetch from Firestore users/{userId}/subscription/current (valid 4-segment doc reference)
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      const snap = await getDoc(subRef).catch(() => null);

      if (snap && snap.exists()) {
        const sub = snap.data() as UserSubscription;
        this.notify(sub);
        return sub;
      }

      if (this.cachedSubscription && this.cachedSubscription.userId === userId) {
        return this.cachedSubscription;
      }

      // Default initial free subscription
      const defaultSub: UserSubscription = {
        userId,
        entitlement: 'free',
        status: 'free',
        productId: 'free_tier',
        planType: 'monthly',
        platform: 'web',
        trialActive: false,
        autoRenew: false,
        willRenew: false,
        lastSyncedAt: new Date().toISOString()
      };

      await setDoc(subRef, defaultSub).catch(() => {});
      this.notify(defaultSub);
      return defaultSub;
    } catch (err) {
      console.warn('Subscription fetch fallback to local state:', err);
      const fallback: UserSubscription = this.cachedSubscription || {
        userId,
        entitlement: 'free',
        status: 'free',
        productId: 'free_tier',
        planType: 'monthly',
        platform: 'web',
        trialActive: false,
        autoRenew: false,
        willRenew: false,
        lastSyncedAt: new Date().toISOString()
      };
      this.notify(fallback);
      return fallback;
    }
  }

  static isPremium(sub?: UserSubscription | null): boolean {
    const s = sub || this.cachedSubscription;
    if (!s) return false;
    return s.entitlement === 'premium' && (s.status === 'premium_active' || s.status === 'trial_active' || s.status === 'grace_period');
  }

  static getProducts(): SubscriptionProduct[] {
    return SUBSCRIPTION_PRODUCTS;
  }

  /**
   * Start 7-Day Free Trial
   */
  static async startFreeTrial(userId: string, planType: SubscriptionPlanType = 'yearly'): Promise<UserSubscription> {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const prod = SUBSCRIPTION_PRODUCTS.find(p => p.planType === planType) || SUBSCRIPTION_PRODUCTS[2];

    const updatedSub: UserSubscription = {
      userId,
      entitlement: 'premium',
      status: 'trial_active',
      productId: prod.productId,
      planType,
      platform: 'web',
      trialActive: true,
      trialStart: now.toISOString(),
      trialEnd: trialEnd.toISOString(),
      purchaseDate: now.toISOString(),
      expirationDate: trialEnd.toISOString(),
      autoRenew: true,
      willRenew: true,
      lastSyncedAt: now.toISOString()
    };

    try {
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      await setDoc(subRef, updatedSub, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Cloud sync for trial deferred:', e);
    }

    this.notify(updatedSub);
    return updatedSub;
  }

  /**
   * Complete purchase (RevenueCat Web flow integration)
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
   * Development Subscription Simulator (Section 50)
   * QA can simulate all 7 subscription lifecycle states without real payments.
   */
  static async simulateState(userId: string, targetStatus: SubscriptionStatus): Promise<UserSubscription> {
    const now = new Date();
    let entitlement: 'free' | 'premium' = 'free';
    let trialActive = false;
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
      trialStart = now.toISOString();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      trialEnd = end.toISOString();
      expirationDate = trialEnd;
    } else if (targetStatus === 'grace_period') {
      entitlement = 'premium';
      expirationDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
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
      trialStart,
      trialEnd,
      purchaseDate: now.toISOString(),
      expirationDate,
      autoRenew: targetStatus === 'premium_active' || targetStatus === 'trial_active',
      willRenew: targetStatus === 'premium_active',
      lastSyncedAt: now.toISOString()
    };

    try {
      const subRef = doc(db, 'users', userId, 'subscription', 'current');
      await setDoc(subRef, updatedSub, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Subscription Simulator cloud sync deferred:', e);
    }

    this.notify(updatedSub);
    return updatedSub;
  }
}
