import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { LocalStorageService } from '../services/localStorageService';
import { ExerciseSetLog } from '../types';

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

describe('Workout Session Volume & Offline Sync Queue Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should calculate accurate total lifting volume from completed sets only', () => {
    const sets: ExerciseSetLog[] = [
      { setNumber: 1, weightKg: 80, reps: 10, completed: true },  // 800 kg
      { setNumber: 2, weightKg: 90, reps: 8, completed: true },   // 720 kg
      { setNumber: 3, weightKg: 100, reps: 5, completed: false }, // not completed -> 0
      { setNumber: 4, weightKg: 85, reps: 10, completed: true },  // 850 kg
    ];

    const volume = sets
      .filter(s => s.completed)
      .reduce((acc, s) => acc + (s.weightKg * s.reps), 0);

    expect(volume).toBe(800 + 720 + 850); // 2370 kg
  });

  it('should correctly queue offline items and maintain queue FIFO', () => {
    expect(LocalStorageService.getSyncQueue()).toHaveLength(0);

    LocalStorageService.addToSyncQueue({
      type: 'SAVE_WORKOUT_SESSION',
      payload: { sessionId: 'session_offline_01', totalVolumeKg: 2400 }
    });

    LocalStorageService.addToSyncQueue({
      type: 'UPDATE_USER_STATS',
      payload: { currentStreak: 5 }
    });

    const queue = LocalStorageService.getSyncQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0].type).toBe('SAVE_WORKOUT_SESSION');
    expect(queue[1].type).toBe('UPDATE_USER_STATS');

    // Remove first item
    LocalStorageService.removeFromSyncQueue(queue[0].id);
    const updatedQueue = LocalStorageService.getSyncQueue();
    expect(updatedQueue).toHaveLength(1);
    expect(updatedQueue[0].type).toBe('UPDATE_USER_STATS');

    // Clear queue
    LocalStorageService.clearSyncQueue();
    expect(LocalStorageService.getSyncQueue()).toHaveLength(0);
  });

  it('should save and clear active workout session in local cache during workouts', () => {
    const activeData = {
      workoutId: 'w_push_strength',
      startTime: new Date().toISOString(),
      currentExerciseIndex: 1
    };

    LocalStorageService.saveActiveSession(activeData);
    const retrieved = LocalStorageService.getActiveSession();
    expect(retrieved).not.toBeNull();
    expect(retrieved.workoutId).toBe('w_push_strength');

    LocalStorageService.clearActiveSession();
    expect(LocalStorageService.getActiveSession()).toBeNull();
  });
});
