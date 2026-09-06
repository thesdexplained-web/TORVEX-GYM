import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  Flame, 
  Dumbbell, 
  Heart, 
  Lock, 
  Sparkles, 
  ChevronRight,
  SlidersHorizontal,
  Cloud,
  RefreshCw,
  Layers,
  BookOpen,
  Info,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { Workout, WorkoutCategory, WorkoutDifficulty, Exercise } from '../../types';
import { WorkoutService } from '../../services/workoutService';
import { ExerciseDetailModal } from '../ExerciseDetailModal';

interface WorkoutsViewProps {
  workouts: Workout[];
  favoriteIds: string[];
  isPremium: boolean;
  onSelectWorkout: (workout: Workout) => void;
  onToggleFavorite: (workoutId: string) => void;
}

const CATEGORIES: (WorkoutCategory | 'All')[] = [
  'All',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Strength',
  'Cardio',
  'Core',
  'Mobility'
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  workouts,
  favoriteIds,
  isPremium,
  onSelectWorkout,
  onToggleFavorite
}) => {
  const [viewMode, setViewMode] = useState<'programs' | 'library'>('programs');
  const [internalWorkouts, setInternalWorkouts] = useState<Workout[]>(() => workouts || []);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => !workouts || workouts.length === 0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const hasFetchedRef = useRef<boolean>(false);

  // Memoized fetch function ensuring data is only fetched once on mount
  const fetchWorkoutData = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Trigger loading state if no cached data exists
    if (!workouts || workouts.length === 0) {
      setIsLoading(true);
    }

    try {
      const [fetchedWorkouts, fetchedExercises] = await Promise.all([
        WorkoutService.getWorkouts(),
        WorkoutService.getExercises()
      ]);

      if (fetchedWorkouts && fetchedWorkouts.length > 0) {
        setInternalWorkouts(prev => {
          if (prev.length === fetchedWorkouts.length && prev[0]?.workoutId === fetchedWorkouts[0]?.workoutId) {
            return prev;
          }
          return fetchedWorkouts;
        });
      }

      if (fetchedExercises && fetchedExercises.length > 0) {
        setExercises(fetchedExercises);
      }
    } catch (err) {
      console.warn('Initial workout data fetch error, using local catalog fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workouts]);

  // Memoized effect hook ensuring data is fetched strictly once on mount
  useEffect(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  // Synchronize incoming workouts without triggering full re-renders if content is unchanged
  useEffect(() => {
    if (workouts && workouts.length > 0) {
      setInternalWorkouts(prev => {
        if (prev.length === workouts.length && prev[0]?.workoutId === workouts[0]?.workoutId) {
          return prev;
        }
        return workouts;
      });
      setIsLoading(false);
    }
  }, [workouts]);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    setSyncMessage('Syncing with Firestore...');
    try {
      const [wCount, exCount] = await Promise.all([
        WorkoutService.seedWorkoutsToCloud(),
        WorkoutService.seedExercisesToCloud()
      ]);
      const [freshWorkouts, freshExercises] = await Promise.all([
        WorkoutService.getWorkouts(),
        WorkoutService.getExercises()
      ]);
      if (freshWorkouts?.length) setInternalWorkouts(freshWorkouts);
      if (freshExercises?.length) setExercises(freshExercises);
      setSyncMessage(`✓ Synced ${wCount} routines & ${exCount} exercises!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      console.error('Cloud sync error:', err);
      setSyncMessage('Error syncing to cloud');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Memoized filtered workouts list to prevent re-calculations and unnecessary re-renders
  const filteredWorkouts = useMemo(() => {
    const list = internalWorkouts.length > 0 ? internalWorkouts : workouts;
    return list.filter(w => {
      if (onlyFavorites && !favoriteIds.includes(w.workoutId)) return false;
      if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && w.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = w.title.toLowerCase().includes(q);
        const matchesDesc = w.description.toLowerCase().includes(q);
        const matchesCategory = w.category.toLowerCase().includes(q);
        const matchesMuscles = w.targetMuscles.some(m => m.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesMuscles) return false;
      }
      return true;
    });
  }, [internalWorkouts, workouts, onlyFavorites, favoriteIds, selectedCategory, selectedDifficulty, searchQuery]);

  // Memoized filtered exercises list
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      if (selectedCategory !== 'All' && ex.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesCategory = ex.category.toLowerCase().includes(q);
        const matchesMuscles = ex.targetMuscles.some(m => m.toLowerCase().includes(q));
        const matchesEquip = ex.equipmentNeeded.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesMuscles && !matchesEquip) return false;
      }
      return true;
    });
  }, [exercises, selectedCategory, searchQuery]);

  return (
    <div id="workouts_view" className="space-y-6 pb-12">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Live Firestore
            </span>
            {syncMessage && (
              <span className="text-[11px] text-amber-400 font-medium">
                {syncMessage}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Training Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Cloud-synchronized workouts and extensive exercise movement database.
          </p>
        </div>

        {/* Action buttons & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn_cloud_sync"
            onClick={handleManualCloudSync}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            title="Upload/Sync all exercise and program data to Firebase Cloud"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              id="workouts_search_input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={viewMode === 'programs' ? "Search routines, muscles..." : "Search exercises, equipment..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Mode Tabs: Programs vs Exercise Library */}
      <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md">
        <button
          id="tab_programs"
          onClick={() => setViewMode('programs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'programs'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Programs ({workouts.length})</span>
        </button>
        <button
          id="tab_exercise_library"
          onClick={() => setViewMode('library')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'library'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Exercise Library ({exercises.length || 35}+)</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            id={`workouts_cat_${cat.toLowerCase().replace(/\s+/g, '_')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filters Bar (shown for programs) */}
      {viewMode === 'programs' && (
        <div
          id="workout_secondary_filters"
          className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          {/* Difficulty Segmented Filter */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Difficulty:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950/70 p-1 rounded-xl border border-slate-200/70 dark:border-zinc-800/80">
              {DIFFICULTIES.map(diff => {
                const isSelected = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    id={`filter_diff_${diff.toLowerCase()}`}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs border border-slate-200/80 dark:border-zinc-700/60 font-black'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Favorites Toggle & Quick Reset */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Quick Reset when filters active */}
            {(selectedDifficulty !== 'All' || selectedCategory !== 'All' || onlyFavorites || searchQuery.trim() !== '') && (
              <button
                id="btn_clear_workout_filters"
                onClick={() => {
                  setSelectedDifficulty('All');
                  setSelectedCategory('All');
                  setOnlyFavorites(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {/* Favorites Toggle */}
            <button
              id="btn_filter_favorites"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                onlyFavorites
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-zinc-950/70 text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/20 border-slate-200/80 dark:border-zinc-800/80'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-zinc-400'}`} />
              <span>Favorites</span>
              {onlyFavorites && favoriteIds.length > 0 && (
                <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.2 font-mono ml-0.5">
                  {favoriteIds.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Secondary Info/Filter Bar (shown for Exercise Library) */}
      {viewMode === 'library' && (
        <div
          id="exercise_secondary_filters"
          className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs transition-colors flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400">
            <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredExercises.length}</strong> movements
              {selectedCategory !== 'All' && <span> in <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedCategory}</span></span>}
            </span>
          </div>

          {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
            <button
              id="btn_clear_exercise_filters"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}

      {/* VIEW MODE 1: WORKOUT PROGRAMS */}
      {viewMode === 'programs' && (
        <div>
          {isLoading ? (
            <div id="workouts_loading_skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`workout_skeleton_${i}`}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between shadow-xs"
                >
                  <div className="h-48 bg-slate-200 dark:bg-zinc-800 relative flex items-center justify-center">
                    <Dumbbell className="w-8 h-8 text-slate-400 dark:text-zinc-700/50" />
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                      <div className="h-4 w-12 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    </div>
                    <div className="h-6 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-zinc-800/50 rounded" />
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkouts.map(workout => {
                const isLocked = workout.isPremiumOnly && !isPremium;
                const isFav = favoriteIds.includes(workout.workoutId);

                return (
                  <div
                    key={workout.workoutId}
                    id={`workout_card_${workout.workoutId}`}
                    onClick={() => onSelectWorkout(workout)}
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Card Media Header */}
                    <div className="relative h-48 overflow-hidden bg-zinc-950">
                      <img
                        src={workout.imageUrl}
                        alt={workout.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-900/90 backdrop-blur-md text-zinc-300 border border-zinc-700/50">
                          {workout.category}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(workout.workoutId);
                          }}
                          className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                            isFav 
                              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' 
                              : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom Image Stats */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300 font-mono">
                        <div className="flex items-center gap-1 bg-zinc-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{workout.durationMinutes}m</span>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{workout.estimatedCalories} kcal</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            workout.difficulty === 'Advanced' ? 'bg-rose-500/20 text-rose-400' :
                            workout.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {workout.difficulty}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {workout.exerciseCount} exercises
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {workout.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {workout.description}
                        </p>
                      </div>

                      {/* Muscle tags footer */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {workout.targetMuscles.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {m}
                            </span>
                          ))}
                          {workout.targetMuscles.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                              +{workout.targetMuscles.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="text-amber-500 flex items-center text-xs font-bold gap-0.5 group-hover:translate-x-1 transition-transform">
                          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-200">No workouts match your filter</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search query, difficulty, or category filter to discover routines.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: EXERCISE LIBRARY (ALL INDIVIDUAL EXERCISES) */}
      {viewMode === 'library' && (
        <div>
          {isLoading ? (
            <div id="exercises_loading_skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`exercise_skeleton_${i}`}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 animate-pulse space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-14 bg-slate-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-slate-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800/50 rounded" />
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex justify-between">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800/60 rounded" />
                    <div className="h-3 w-12 bg-slate-200 dark:bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  id={`exercise_card_${exercise.id}`}
                  onClick={() => setSelectedExercise(exercise)}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">
                        {exercise.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {exercise.defaultSets} × {exercise.defaultReps}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {exercise.name}
                    </h4>

                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {exercise.tips || exercise.instructions[0]}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500 truncate max-w-[170px]">
                      {exercise.equipmentNeeded}
                    </span>
                    <span className="text-amber-400 font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Guide <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-200">No exercises found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No exercises match your search query "{searchQuery}".
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
