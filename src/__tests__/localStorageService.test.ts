import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { LocalStorageService } from '../services/localStorageService';
import { UserProfile } from '../types';

// Mock localStorage for Node test runner environment
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

describe('LocalStorageService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to dark theme when no preference is saved', () => {
    const theme = LocalStorageService.getTheme();
    expect(theme).toBe('dark');
  });

  it('should correctly save and retrieve light theme', () => {
    LocalStorageService.setTheme('light');
    const theme = LocalStorageService.getTheme();
    expect(theme).toBe('light');
  });

  it('should persist and retrieve cached UserProfile across simulated sessions', () => {
    const mockUser: UserProfile = {
      userId: 'test-athlete-001',
      displayName: 'Alex Rivers',
      emailAddress: 'alex.rivers@torvex.fit',
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      currentStreak: 7,
      longestStreak: 14,
      totalWorkoutCount: 18,
      totalWorkoutMinutes: 840,
      totalCaloriesBurned: 7200,
      fitnessGoal: 'Build Muscle',
      fitnessLevel: 'Advanced',
      preferredDaysPerWeek: 5,
      weightKg: 82
    };

    LocalStorageService.saveCachedUserProfile(mockUser);
    const restored = LocalStorageService.getCachedUserProfile();

    expect(restored).not.toBeNull();
    expect(restored?.userId).toBe('test-athlete-001');
    expect(restored?.displayName).toBe('Alex Rivers');
    expect(restored?.currentStreak).toBe(7);
  });

  it('should clear cached UserProfile when user logs out', () => {
    const mockUser: UserProfile = {
      userId: 'test-user-002',
      displayName: 'Guest Test',
      emailAddress: 'guest@torvex.fit',
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      totalWorkoutCount: 0,
      totalWorkoutMinutes: 0,
      totalCaloriesBurned: 0
    };

    LocalStorageService.saveCachedUserProfile(mockUser);
    expect(LocalStorageService.getCachedUserProfile()).not.toBeNull();

    LocalStorageService.clearCachedUserProfile();
    expect(LocalStorageService.getCachedUserProfile()).toBeNull();
  });
});
