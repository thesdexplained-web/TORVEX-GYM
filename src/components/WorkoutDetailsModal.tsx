import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Clock, 
  Flame, 
  Dumbbell, 
  Heart, 
  ShieldCheck, 
  Lock, 
  Play, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Workout } from '../types';

interface WorkoutDetailsModalProps {
  workout: Workout;
  isFavorite: boolean;
  isPremiumUser: boolean;
  onToggleFavorite: () => void;
  onStartWorkout: () => void;
  onOpenPaywall: () => void;
  onClose: () => void;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({
  workout,
  isFavorite,
  isPremiumUser,
  onToggleFavorite,
  onStartWorkout,
  onOpenPaywall,
  onClose
}) => {
  const isLocked = workout.isPremiumOnly && !isPremiumUser;

  return (
    <div 
      id="workout_details_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col"
      >
        {/* Hero Header with Media Image */}
        <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-zinc-950">
          <img
            src={workout.imageUrl}
            alt={workout.title}
            className="w-full h-full object-cover object-center opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

          {/* Top Actions */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-amber-400">
              {workout.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                id="workout_details_favorite_button"
                onClick={onToggleFavorite}
                className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 hover:bg-zinc-800 text-white transition-colors"
                title="Favorite Workout"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'}`} />
              </button>
              <button
                id="workout_details_close_button"
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title & Key Highlights on hero */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                workout.difficulty === 'Advanced' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                workout.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {workout.difficulty}
              </span>
              {workout.isPremiumOnly && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-zinc-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {workout.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Key Metrics row */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Duration</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-white font-mono">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{workout.durationMinutes} min</span>
              </div>
            </div>
            <div className="text-center border-x border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Est. Burn</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-amber-400 font-mono">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{workout.estimatedCalories} kcal</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Movements</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-white font-mono">
                <Dumbbell className="w-4 h-4 text-zinc-400" />
                <span>{workout.exerciseCount} exercises</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Protocol Overview
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {workout.description}
            </p>
          </div>

          {/* Targeted Muscle Groups */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Targeted Kinetic Chains
            </h3>
            <div className="flex flex-wrap gap-2">
              {workout.targetMuscles.map((muscle, idx) => (
                <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-medium">
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Exercise Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Exercise Breakdown ({workout.exercises.length})
            </h3>
            <div className="space-y-3">
              {workout.exercises.map((ex, index) => (
                <div key={ex.exerciseId} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 sm:p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{ex.exerciseName}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {ex.targetMuscles.map((m, mIdx) => (
                            <span key={mIdx} className="text-[10px] text-zinc-400">
                              • {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prescription badges */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {ex.sets} sets × {ex.reps} reps
                      </span>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {ex.weightKg > 0 ? `${ex.weightKg} kg | ` : ''}{ex.restSeconds}s rest
                      </div>
                    </div>
                  </div>

                  {/* Form cues if available */}
                  {ex.instructions && ex.instructions.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-900 text-[11px] text-zinc-400 space-y-1">
                      {ex.instructions.map((inst, i) => (
                        <p key={i} className="leading-snug">
                          {i + 1}. {inst}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="shrink-0 p-4 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex items-center gap-4">
          {isLocked ? (
            <button
              id="workout_details_unlock_button"
              onClick={onOpenPaywall}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>Unlock with 7-Day Free Trial</span>
            </button>
          ) : (
            <button
              id="workout_details_start_button"
              onClick={onStartWorkout}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wider"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              <span>Start Workout Now</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
