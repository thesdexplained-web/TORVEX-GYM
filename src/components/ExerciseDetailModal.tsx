import React from 'react';
import { motion } from 'motion/react';
import { X, Dumbbell, Target, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose
}) => {
  if (!exercise) return null;

  return (
    <div 
      id="exercise_detail_modal_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
      >
        {/* Header Image or Icon */}
        <div className="relative h-40 sm:h-48 w-full shrink-0 overflow-hidden bg-zinc-950">
          <img
            src={exercise.imageUrl || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'}
            alt={exercise.name}
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />
          
          <button
            id="exercise_detail_modal_close"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-zinc-300 hover:text-white rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono">
              {exercise.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight line-clamp-1">
              {exercise.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Quick Spec Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Default Sets</span>
              <span className="text-sm font-bold text-amber-400">{exercise.defaultSets} sets</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Reps</span>
              <span className="text-sm font-bold text-amber-400">{exercise.defaultReps} reps</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Rest Period</span>
              <span className="text-sm font-bold text-amber-400">{exercise.defaultRestSeconds}s</span>
            </div>
          </div>

          {/* Equipment & Muscles */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <Dumbbell className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-zinc-400">Equipment:</span>
              <span className="font-semibold text-white">{exercise.equipmentNeeded}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Target Muscles:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {exercise.targetMuscles.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px] font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Execution Technique
            </h4>
            <ol className="space-y-2 text-xs text-zinc-300">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Coach Tips */}
          {exercise.tips && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold">Coach Cue: </span>
                {exercise.tips}
              </p>
            </div>
          )}
        </div>

        {/* Pinned Bottom Bar */}
        <div className="shrink-0 p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close Preview
          </button>
        </div>
      </motion.div>
    </div>
  );
};
