import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { SubscriptionService } from '../services/subscriptionService';
import { LocalStorageService } from '../services/localStorageService';

// Mock localStorage for Node test runner
const mockStorage: Record<string, string> = {};
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => {
        for (const k in mockStorage) {
          delete mockStorage[k];
        }
      },
      key: (index: number) => Object.keys(mockStorage)[index] || null,
      length: 0
    } as Storage;
  }
});

// Mock Firestore to verify segment count and operations
const mockDocCalls: any[] = [];
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn((_db, ...segments) => {
      mockDocCalls.push(segments);
      if (segments.length % 2 !== 0) {
        throw new Error(`Invalid document reference. Document references must have an even number of segments, but has ${segments.length}.`);
      }
      return { path: segments.join('/') } as any;
    }),
    getDoc: vi.fn(async () => ({
      exists: () => false,
      data: () => null
    })),
    setDoc: vi.fn(async () => {}),
    updateDoc: vi.fn(async () => {})
  };
});

describe('Subscription Service & Lifecycle Simulation Tests', () => {
  beforeEach(() => {
    mockDocCalls.length = 0;
    localStorage.clear();
  });

  it('should construct valid Firestore document paths with an EVEN number of segments (4 segments)', async () => {
    const testUserId = 'test_athlete_qa_01';
    await SubscriptionService.simulateState(testUserId, 'premium_active');

    // Must have called doc() with users / test_athlete_qa_01 / subscription / current (4 segments)
    expect(mockDocCalls.length).toBeGreaterThan(0);
    const lastCall = mockDocCalls[mockDocCalls.length - 1];
    expect(lastCall.length).toBe(4);
    expect(lastCall[0]).toBe('users');
    expect(lastCall[1]).toBe(testUserId);
    expect(lastCall[2]).toBe('subscription');
    expect(lastCall[3]).toBe('current');
  });

  it('should correctly simulate and verify all 7 subscription lifecycle states', async () => {
    const userId = 'qa_athlete_sim';

    // 1. Free tier
    const freeSub = await SubscriptionService.simulateState(userId, 'free');
    expect(freeSub.status).toBe('free');
    expect(freeSub.entitlement).toBe('free');
    expect(SubscriptionService.isPremium(freeSub)).toBe(false);

    // 2. Trial active (7 days)
    const trialSub = await SubscriptionService.simulateState(userId, 'trial_active');
    expect(trialSub.status).toBe('trial_active');
    expect(trialSub.entitlement).toBe('premium');
    expect(trialSub.trialActive).toBe(true);
    expect(SubscriptionService.isPremium(trialSub)).toBe(true);

    // 3. Premium active
    const premiumSub = await SubscriptionService.simulateState(userId, 'premium_active');
    expect(premiumSub.status).toBe('premium_active');
    expect(premiumSub.entitlement).toBe('premium');
    expect(premiumSub.autoRenew).toBe(true);
    expect(SubscriptionService.isPremium(premiumSub)).toBe(true);

    // 4. Grace period
    const graceSub = await SubscriptionService.simulateState(userId, 'grace_period');
    expect(graceSub.status).toBe('grace_period');
    expect(graceSub.entitlement).toBe('premium');
    expect(SubscriptionService.isPremium(graceSub)).toBe(true);

    // 5. Billing issue
    const billingSub = await SubscriptionService.simulateState(userId, 'billing_issue');
    expect(billingSub.status).toBe('billing_issue');
    expect(billingSub.entitlement).toBe('free');
    expect(SubscriptionService.isPremium(billingSub)).toBe(false);

    // 6. Cancelled
    const cancelledSub = await SubscriptionService.simulateState(userId, 'cancelled');
    expect(cancelledSub.status).toBe('cancelled');
    expect(cancelledSub.entitlement).toBe('free');
    expect(SubscriptionService.isPremium(cancelledSub)).toBe(false);

    // 7. Expired
    const expiredSub = await SubscriptionService.simulateState(userId, 'expired');
    expect(expiredSub.status).toBe('expired');
    expect(expiredSub.entitlement).toBe('free');
    expect(SubscriptionService.isPremium(expiredSub)).toBe(false);
  });

  it('getSubscription should initialize a 30-day free month and cache locally', async () => {
    const userId = 'free_month_user_001';
    const sub = await SubscriptionService.getSubscription(userId);

    expect(sub.userId).toBe(userId);
    expect(sub.status).toBe('trial_active');
    expect(sub.entitlement).toBe('premium');
    expect(sub.freeMonthActive).toBe(true);

    // Expiration date should be ~30 days in the future
    const now = new Date();
    const expiry = new Date(sub.expirationDate!);
    const diffDays = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);

    // Free Month Status check
    const status = SubscriptionService.getFreeMonthStatus(sub);
    expect(status.isWithinFreeMonth).toBe(true);
    expect(status.daysRemaining).toBe(30);

    // Local storage should also contain the cached subscription
    const cached = LocalStorageService.getCachedSubscription();
    expect(cached).not.toBeNull();
    expect(cached?.userId).toBe(userId);
    expect(cached?.status).toBe('trial_active');
  });

  it('purchasePlan should activate monthly and yearly tiers properly', async () => {
    const userId = 'purchase_user_002';
    const subMonthly = await SubscriptionService.purchasePlan(userId, 'monthly');

    expect(subMonthly.status).toBe('premium_active');
    expect(subMonthly.entitlement).toBe('premium');
    expect(subMonthly.planType).toBe('monthly');
    expect(SubscriptionService.isPremium(subMonthly)).toBe(true);

    const subYearly = await SubscriptionService.purchasePlan(userId, 'yearly');
    expect(subYearly.planType).toBe('yearly');
    expect(SubscriptionService.isPremium(subYearly)).toBe(true);
  });
});
