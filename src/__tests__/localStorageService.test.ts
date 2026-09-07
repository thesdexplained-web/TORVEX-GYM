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

  it('should toggle and persist favorite workout IDs locally', () => {
    const userId = 'user_fav_test_01';
    expect(LocalStorageService.getFavoriteWorkoutIds(userId)).toEqual([]);

    const res1 = LocalStorageService.toggleFavoriteWorkoutId('workout_push_day', userId);
    expect(res1.isFav).toBe(true);
    expect(res1.updatedIds).toContain('workout_push_day');
    expect(LocalStorageService.getFavoriteWorkoutIds(userId)).toContain('workout_push_day');

    const res2 = LocalStorageService.toggleFavoriteWorkoutId('workout_push_day', userId);
    expect(res2.isFav).toBe(false);
    expect(res2.updatedIds).not.toContain('workout_push_day');
    expect(LocalStorageService.getFavoriteWorkoutIds(userId)).not.toContain('workout_push_day');
  });

  it('should save and retrieve personal workout notes locally', () => {
    const userId = 'user_notes_test_01';
    const mockNote = {
      noteId: 'note_123',
      userId,
      title: 'Leg Day Personal Record',
      content: 'Hit 140kg squat for 5 reps clean form.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    LocalStorageService.saveNote(mockNote, userId);
    const notes = LocalStorageService.getNotes(userId);
    expect(notes.length).toBe(1);
    expect(notes[0].title).toBe('Leg Day Personal Record');
  });
});
