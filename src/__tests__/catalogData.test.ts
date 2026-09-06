import { describe, it, expect } from 'vitest';
import { COMPREHENSIVE_EXERCISES } from '../data/allExercisesCatalog';
import { INITIAL_WORKOUTS } from '../data/initialCatalog';

describe('Exercise Catalog and Workouts Data Integrity Tests', () => {
  it('should have a comprehensive catalog with 30+ exercises', () => {
    expect(COMPREHENSIVE_EXERCISES.length).toBeGreaterThanOrEqual(30);
  });

  it('should have unique IDs for all exercises in the catalog', () => {
    const ids = COMPREHENSIVE_EXERCISES.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every exercise should specify target muscles, instructions, and equipment', () => {
    for (const ex of COMPREHENSIVE_EXERCISES) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.targetMuscles.length).toBeGreaterThan(0);
      expect(ex.instructions.length).toBeGreaterThan(0);
      expect(ex.equipmentNeeded).toBeTruthy();
      expect(ex.defaultSets).toBeGreaterThan(0);
      expect(ex.defaultReps).toBeGreaterThan(0);
    }
  });

  it('should have structured workout programs covering multiple muscle splits', () => {
    expect(INITIAL_WORKOUTS.length).toBeGreaterThanOrEqual(5);

    const categories = new Set(INITIAL_WORKOUTS.map(w => w.category));
    expect(categories.has('Full Body') || categories.has('Upper Body')).toBe(true);
    expect(categories.has('Strength') || categories.has('Lower Body')).toBe(true);

    for (const workout of INITIAL_WORKOUTS) {
      expect(workout.workoutId).toBeTruthy();
      expect(workout.title).toBeTruthy();
      expect(workout.durationMinutes).toBeGreaterThan(0);
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.estimatedCalories).toBeGreaterThan(0);
    }
  });
});
