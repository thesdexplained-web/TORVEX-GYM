import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Star, 
  Flame, 
  Clock, 
  ChevronRight, 
  Lock,
  Layers,
  BookOpen,
  Film
} from 'lucide-react';
import { Workout, WorkoutCategory, Exercise } from '../../types';
import { INITIAL_WORKOUTS } from '../../data/initialCatalog';
import { WorkoutService } from '../../services/workoutService';
import { COMPREHENSIVE_EXERCISES } from '../../data/allExercisesCatalog';
import { ExerciseDetailModal } from '../ExerciseDetailModal';

interface WorkoutsViewProps {
  workouts: Workout[];
  favoriteIds: string[];
  isPremium: boolean;
  selectedCategoryFilter?: WorkoutCategory | 'All';
  onCategoryFilterChange?: (category: WorkoutCategory | 'All') => void;
  onSelectWorkout: (workout: Workout) => void;
  onToggleFavorite: (workoutId: string) => void;
}

const CATEGORIES: (WorkoutCategory | 'All')[] = [
  'All',
  'Strength',
  'Yoga',
  'Cardio',
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Core',
  'Mobility'
];

const DIFFICULTIES = ['All', 'Zero Level', 'Beginner', 'Intermediate', 'Advanced'];

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  workouts,
  favoriteIds,
  isPremium,
  selectedCategoryFilter,
  onCategoryFilterChange,
  onSelectWorkout,
  onToggleFavorite,
}) => {
  // Mode switcher: 'programs' or 'library'
  const [viewMode, setViewMode] = useState<'programs' | 'library'>(() => {
    try {
      const saved = localStorage.getItem('torvex_workouts_view_mode');
      return saved === 'library' ? 'library' : 'programs';
    } catch {
      return 'programs';
    }
  });

  // Exercises collection for the library mode
  const [exercises, setExercises] = useState<Exercise[]>(() => COMPREHENSIVE_EXERCISES);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filter and Search States
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'All'>(
    selectedCategoryFilter || 'All'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Keep internal selectedCategory in sync when parent passes a new selectedCategoryFilter
  useEffect(() => {
    if (selectedCategoryFilter !== undefined) {
      setSelectedCategory(selectedCategoryFilter);
      // When user selects a specific discipline (from Home or externally), automatically display the exercise library for that discipline
      if (selectedCategoryFilter !== 'All') {
        setViewMode('library');
      }
    }
  }, [selectedCategoryFilter]);

  const handleCategorySelect = (cat: WorkoutCategory | 'All') => {
    setSelectedCategory(cat);
    if (onCategoryFilterChange) {
      onCategoryFilterChange(cat);
    }
  };

  const handleSetViewMode = (mode: 'programs' | 'library') => {
    setViewMode(mode);
    try {
      localStorage.setItem('torvex_workouts_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Subscribe to exercise library updates smoothly and automatically in background
  useEffect(() => {
    const unsub = WorkoutService.subscribeToExercises((freshExercises) => {
      setExercises(freshExercises);
    });
    return () => unsub();
  }, []);

  // Single source of truth for workouts: prop passed from App.tsx with default fallback
  const activeWorkouts = useMemo(() => {
    return (workouts && workouts.length > 0) ? workouts : INITIAL_WORKOUTS;
  }, [workouts]);

  // Memoized filtered workouts list
  const filteredWorkouts = useMemo(() => {
    return activeWorkouts.filter(w => {
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
  }, [activeWorkouts, onlyFavorites, favoriteIds, selectedCategory, selectedDifficulty, searchQuery]);

  // Memoized filtered exercises list with difficulty & search support
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      if (selectedCategory !== 'All' && ex.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && ex.difficulty !== selectedDifficulty) return false;
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
  }, [exercises, selectedCategory, selectedDifficulty, searchQuery]);

  // Quick single-exercise workout launcher
  const handleStartQuickExercise = (ex: Exercise) => {
    const quickWorkout: Workout = {
      workoutId: `quick_${ex.id}_${Date.now()}`,
      title: ex.name,
      category: ex.category,
      difficulty: ex.difficulty || 'Intermediate',
      estimatedCalories: Math.round((ex.durationSeconds || 60) * 0.15 * ex.defaultSets),
      durationMinutes: Math.max(5, Math.ceil(((ex.durationSeconds || 60) + ex.defaultRestSeconds) * ex.defaultSets / 60)),
      description: ex.description || `Focused training session focusing on ${ex.name}.`,
      targetMuscles: ex.targetMuscles,
      exerciseCount: 1,
      imageUrl: ex.imageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      exercises: [
        {
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetMuscles: ex.targetMuscles,
          sets: ex.defaultSets,
          reps: ex.defaultReps,
          weightKg: ex.defaultWeightKg,
          restSeconds: ex.defaultRestSeconds,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
          description: ex.description,
          imageUrl: ex.imageUrl,
          gifUrl: ex.gifUrl
        }
      ],
      isPremiumOnly: false
    };
    onSelectWorkout(quickWorkout);
  };

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    'Zero Level': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    'Beginner': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'Intermediate': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    'Advanced': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  return (
    <div id="workouts_view" className="space-y-6 pb-12">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Training Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Personalized workout routines and complete exercise movement library.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
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

      {/* Mode Tabs: Programs vs Exercise Library */}
      <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md">
        <button
          id="tab_programs"
          onClick={() => handleSetViewMode('programs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
            viewMode === 'programs'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Routines ({activeWorkouts.length})</span>
        </button>
        <button
          id="tab_exercise_library"
          onClick={() => handleSetViewMode('library')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
            viewMode === 'library'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Exercise Library ({exercises.length})</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            id={`workouts_cat_${cat.toLowerCase().replace(/\s+/g, '_')}`}
            onClick={() => handleCategorySelect(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filters Bar (Available in both views) */}
      <div
        id="workout_secondary_filters"
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        {/* Difficulty Segmented Filter */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Difficulty:</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex-wrap">
            {DIFFICULTIES.map(diff => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  id={`filter_diff_${diff.toLowerCase().replace(/\s+/g, '_')}`}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors duration-150 ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 shadow-xs font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Favorites Toggle & Active Filter Indicator */}
        <div className="flex items-center gap-3">
          {viewMode === 'programs' && (
            <button
              id="filter_favorites_toggle"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                onlyFavorites
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          )}

          {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
                setOnlyFavorites(false);
                if (onCategoryFilterChange) onCategoryFilterChange('All');
              }}
              className="text-[11px] text-amber-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: ROUTINES / PROGRAMS */}
      {viewMode === 'programs' && (
        <div>
          {filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkouts.map(workout => {
                const isFav = favoriteIds.includes(workout.workoutId);
                const isLocked = workout.isPremiumOnly && !isPremium;

                return (
                  <div
                    key={workout.workoutId}
                    id={`workout_card_${workout.workoutId}`}
                    onClick={() => onSelectWorkout(workout)}
                    className="group relative bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">
                            {workout.category}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${difficultyColors[workout.difficulty]?.bg || 'bg-zinc-800'} ${difficultyColors[workout.difficulty]?.text || 'text-zinc-300'} ${difficultyColors[workout.difficulty]?.border || 'border-zinc-700'}`}>
                            {workout.difficulty}
                          </span>
                        </div>

                        <button
                          id={`fav_btn_${workout.workoutId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(workout.workoutId);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 min-h-[2.75rem] leading-snug">
                        {workout.title}
                      </h3>

                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {workout.description}
                      </p>

                      {/* Workout metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{workout.durationMinutes}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>{workout.estimatedCalories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{workout.exercises.length} moves</span>
                        </div>
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
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map(exercise => {
                const diff = exercise.difficulty || 'Intermediate';
                const dStyle = difficultyColors[diff] || difficultyColors['Intermediate'];

                return (
                  <div
                    key={exercise.id}
                    id={`exercise_card_${exercise.id}`}
                    onClick={() => setSelectedExercise(exercise)}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">
                            {exercise.category}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border font-mono ${dStyle.bg} ${dStyle.text} ${dStyle.border}`}>
                            {diff}
                          </span>
                        </div>
                        {exercise.gifUrl && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30" title="Includes animated demonstration">
                            <Film className="w-2.5 h-2.5" />
                            <span>GIF</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {exercise.name}
                      </h4>

                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {exercise.description || exercise.tips || exercise.instructions[0]}
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
                );
              })}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-200">No exercises found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No exercises match your current filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise Detail Modal with GIF Preview & Single Exercise Launch */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onStartAsQuickWorkout={handleStartQuickExercise}
      />
    </div>
  );
};
