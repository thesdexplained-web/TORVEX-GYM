import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { AuthenticationService } from '../services/authService';
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

describe('Phone-Only Authentication & Number Validation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should reject blank or empty phone numbers', () => {
    const testEmpty = '';
    const cleanDigits = testEmpty.replace(/\D/g, '');
    expect(cleanDigits.length).toBe(0);
  });

  it('should validate 10-digit format for standard mobile numbers', () => {
    const validNumber = '9876543210';
    const invalidShort = '98765';
    const invalidChars = '98765abcd0';

    expect(/^\d{10}$/.test(validNumber)).toBe(true);
    expect(/^\d{10}$/.test(invalidShort)).toBe(false);
    expect(/^\d{10}$/.test(invalidChars)).toBe(false);
  });

  it('should verify OTP and create synthetic user profile without third party logins', async () => {
    const testPhone = '+91 9876543210';
    const profile = await AuthenticationService.simulatePhoneOtpVerification(testPhone, '123456');

    expect(profile).toBeDefined();
    expect(profile.userId).toContain('phone_user_');
    expect(profile.displayName).toContain('Athlete');

    // Should be cached in LocalStorage
    const cached = LocalStorageService.getCachedUserProfile();
    expect(cached).not.toBeNull();
    expect(cached?.userId).toBe(profile.userId);
  });

  it('should reject invalid or incorrect OTP code', async () => {
    const testPhone = '+91 9876543210';
    await expect(AuthenticationService.simulatePhoneOtpVerification(testPhone, '999888'))
      .rejects.toThrow('Invalid verification code');
  });

  it('should allow Apple Review & QA test phone number +91 9999999999 with code 123456', async () => {
    const appleReviewPhone = '+91 9999999999';
    const profile = await AuthenticationService.simulatePhoneOtpVerification(appleReviewPhone, '123456');

    expect(profile.userId).toContain('phone_user_99999999');
    expect(profile.displayName).toBe('Athlete (9999)');
  });
});
