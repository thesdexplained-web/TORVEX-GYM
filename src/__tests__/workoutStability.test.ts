import { describe, it, expect, vi } from 'vitest';
import { WorkoutService } from '../services/workoutService';
import { INITIAL_WORKOUTS } from '../data/initialCatalog';
import { COMPREHENSIVE_EXERCISES } from '../data/allExercisesCatalog';

describe('Workout Catalog & Stability Tests', () => {
  it('should deliver initial workouts immediately without network delay or undefined entries', async () => {
    const workouts = await WorkoutService.getWorkouts();
    expect(workouts).toBeDefined();
    expect(workouts.length).toBeGreaterThanOrEqual(7);
    expect(workouts[0].workoutId).toBe(INITIAL_WORKOUTS[0].workoutId);
    expect(workouts.every(w => w.title && w.category && w.exercises.length > 0)).toBe(true);
  });

  it('should deliver initial exercises immediately without automatic seeding side-effects', async () => {
    const exercises = await WorkoutService.getExercises();
    expect(exercises).toBeDefined();
    expect(exercises.length).toBeGreaterThanOrEqual(30);
    expect(exercises[0].id).toBeDefined();
  });

  it('subscribeToWorkouts should emit initial workouts synchronously and support unsubscription', () => {
    const callback = vi.fn();
    const unsub = WorkoutService.subscribeToWorkouts(callback);

    expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ workoutId: INITIAL_WORKOUTS[0].workoutId })
    ]));

    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('filterWorkouts should accurately filter by category and difficulty without crashing', () => {
    const upperWorkouts = WorkoutService.filterWorkouts(INITIAL_WORKOUTS, 'Upper Body', 'All', '');
    expect(upperWorkouts.length).toBeGreaterThan(0);
    expect(upperWorkouts.every(w => w.category === 'Upper Body')).toBe(true);

    const advancedWorkouts = WorkoutService.filterWorkouts(INITIAL_WORKOUTS, 'All', 'Advanced', '');
    expect(advancedWorkouts.every(w => w.difficulty === 'Advanced')).toBe(true);
  });
});
