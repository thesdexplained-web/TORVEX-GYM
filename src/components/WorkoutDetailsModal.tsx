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
        className="modal-content-card relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col"
      >
        {/* Hero Header with Media Image */}
        <div className="hero-media-container relative min-h-[14rem] sm:min-h-[16rem] w-full shrink-0 overflow-hidden bg-zinc-950 flex flex-col justify-between p-4 sm:p-5">
          <img
            src={workout.imageUrl}
            alt={workout.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Always dark gradient overlay for crystal clear contrast on hero media */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: 'linear-gradient(to top, rgba(9, 9, 11, 0.98) 0%, rgba(9, 9, 11, 0.72) 45%, rgba(0, 0, 0, 0.55) 100%)' 
            }}
          />

          {/* Top Actions */}
          <div className="relative z-10 flex justify-between items-center w-full">
            <span 
              className="hero-badge hero-media-text text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border shadow-sm"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.5)' }}
              data-hero-text="true"
            >
              {workout.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                id="workout_details_favorite_button"
                onClick={onToggleFavorite}
                className="p-2 rounded-full backdrop-blur-md border transition-colors shadow-sm"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
                title="Favorite Workout"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-200'}`} />
              </button>
              <button
                id="workout_details_close_button"
                onClick={onClose}
                className="p-2 rounded-full backdrop-blur-md border transition-colors shadow-sm hover:bg-black/80"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#ffffff' }}
                title="Close Details"
              >
                <X className="w-5 h-5 text-zinc-200" />
              </button>
            </div>
          </div>

          {/* Title & Key Highlights on hero */}
          <div className="relative z-10 mt-auto pt-6">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span 
                className="hero-badge hero-media-text text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                data-hero-text="true"
                style={{
                  backgroundColor: workout.difficulty === 'Advanced' ? 'rgba(244, 63, 94, 0.35)' :
                    workout.difficulty === 'Intermediate' ? 'rgba(245, 158, 11, 0.35)' :
                    'rgba(16, 185, 129, 0.35)',
                  color: '#ffffff',
                  borderColor: workout.difficulty === 'Advanced' ? 'rgba(244, 63, 94, 0.6)' :
                    workout.difficulty === 'Intermediate' ? 'rgba(245, 158, 11, 0.6)' :
                    'rgba(16, 185, 129, 0.6)'
                }}
              >
                {workout.difficulty}
              </span>
              {workout.isPremiumOnly && (
                <span 
                  className="hero-badge hero-media-text text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm font-semibold"
                  data-hero-text="true"
                  style={{ backgroundColor: '#f59e0b', color: '#09090b' }}
                >
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
            <h2 
              className="hero-title hero-media-text text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight"
              data-hero-text="true"
              style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)' }}
            >
              {workout.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Key Metrics row */}
          <div className="metric-stat-box grid grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Duration</span>
              <div className="stat-val flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-white font-mono">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{workout.durationMinutes} min</span>
              </div>
            </div>
            <div className="text-center border-x border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Est. Burn</span>
              <div className="stat-val flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-amber-400 font-mono">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{workout.estimatedCalories} kcal</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Movements</span>
              <div className="stat-val flex items-center justify-center gap-1 mt-1 text-sm sm:text-base font-bold text-white font-mono">
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
            <p className="protocol-text text-xs sm:text-sm text-zinc-300 leading-relaxed">
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
                <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/60 font-medium">
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
                <div key={ex.exerciseId} className="exercise-card-item bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 sm:p-4 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
                      <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white break-words">{ex.exerciseName}</h4>
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
                      <span className="text-xs font-mono font-bold text-amber-400 block">
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
        <div className="shrink-0 p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-4">
          {isLocked ? (
            <button
              id="workout_details_unlock_button"
              onClick={onOpenPaywall}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>Unlock with Torvex Pro</span>
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
