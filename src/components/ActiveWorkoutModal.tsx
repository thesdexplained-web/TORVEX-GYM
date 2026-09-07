import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  Flame, 
  Dumbbell, 
  RotateCcw, 
  Plus, 
  Minus,
  Trophy,
  Volume2
} from 'lucide-react';
import { Workout, WorkoutSession, UserProfile, ExerciseSessionLog } from '../types';
import { SessionService } from '../services/sessionService';
import { LocalStorageService } from '../services/localStorageService';
import { sounds } from '../utils/audio';

interface ActiveWorkoutModalProps {
  workout: Workout;
  userProfile?: UserProfile;
  userId?: string;
  onClose: () => void;
  onSessionFinished?: (result: {
    updatedProfile: UserProfile;
    unlockedAchievements: string[];
    completedChallenges: string[];
    finalSession?: WorkoutSession;
  }) => void;
  onCompleteSession?: (session: WorkoutSession) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  userProfile,
  userId,
  onClose,
  onSessionFinished,
  onCompleteSession
}) => {
  const resolvedUserId = userProfile?.userId || userId || 'guest_athlete';
  const activeProfile: UserProfile = userProfile || {
    userId: resolvedUserId,
    email: 'athlete@torvex.com',
    displayName: 'Torvex Athlete',
    role: 'athlete',
    currentStreak: 1,
    longestStreak: 1,
    totalWorkoutCount: 0,
    totalWorkoutMinutes: 0,
    totalCaloriesBurned: 0,
    createdAt: new Date().toISOString()
  };

  // Check if there is an in-progress session for this specific workout
  const cachedActive = LocalStorageService.getActiveSession();
  const isResuming = Boolean(cachedActive && cachedActive.workoutId === workout.workoutId);

  // Session Identity (Idempotent)
  const sessionIdRef = useRef<string>(
    isResuming && cachedActive.sessionId ? cachedActive.sessionId : SessionService.createNewSessionId()
  );
  const startTimeRef = useRef<string>(
    isResuming && cachedActive.startedAt ? cachedActive.startedAt : new Date().toISOString()
  );

  // Workout timing state - strictly preserve elapsedSeconds and pause state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    isResuming && typeof cachedActive.elapsedSeconds === 'number' ? cachedActive.elapsedSeconds : 0
  );
  const [isPaused, setIsPaused] = useState<boolean>(
    isResuming && typeof cachedActive.isPaused === 'boolean' ? cachedActive.isPaused : false
  );
  const lastTickRef = useRef<number>(Date.now());

  // Exercise progression
  const [currentExIndex, setCurrentExIndex] = useState<number>(
    isResuming && typeof cachedActive.currentExIndex === 'number' ? cachedActive.currentExIndex : 0
  );
  const currentEx = workout.exercises[currentExIndex] || workout.exercises[0];

  // Set-by-set logs
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseSessionLog[]>(() => {
    if (isResuming && Array.isArray(cachedActive.exerciseLogs) && cachedActive.exerciseLogs.length > 0) {
      return cachedActive.exerciseLogs;
    }
    return workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      targetMuscles: ex.targetMuscles,
      completed: false,
      sets: Array.from({ length: ex.sets }).map((_, i) => ({
        setNumber: i + 1,
        reps: ex.reps,
        weightKg: ex.weightKg,
        completed: false
      }))
    }));
  });

  // Rest Countdown Timer
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestActive, setIsRestActive] = useState<boolean>(false);

  // Completion State
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [finishSummary, setFinishSummary] = useState<any | null>(null);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number>(5);

  // Elapsed workout timer effect: zero-drift, accurate, never resets elapsed time on pause/resume or exercise transitions
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused && !isFinishing) {
      lastTickRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta >= 1) {
          lastTickRef.current += delta * 1000;
          setElapsedSeconds(prev => {
            const next = prev + delta;
            // Continuously persist so screen refresh never loses a second
            LocalStorageService.saveActiveSession({
              sessionId: sessionIdRef.current,
              workoutId: workout.workoutId,
              workoutTitle: workout.title,
              startedAt: startTimeRef.current,
              elapsedSeconds: next,
              isPaused: false,
              currentExIndex,
              exerciseLogs
            });
            return next;
          });
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, isFinishing, currentExIndex, exerciseLogs, workout]);

  // Handle visibility change so timer catches up when returning from background if active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        lastTickRef.current = Date.now();
      } else {
        if (!isPaused && !isFinishing) {
          const now = Date.now();
          const delta = Math.floor((now - lastTickRef.current) / 1000);
          if (delta > 0) {
            lastTickRef.current += delta * 1000;
            setElapsedSeconds(prev => prev + delta);
          }
        } else {
          lastTickRef.current = Date.now();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPaused, isFinishing]);

  // Handle toggle pause / resume with immediate state sync
  const handleTogglePause = () => {
    setIsPaused(prev => {
      const nextPaused = !prev;
      lastTickRef.current = Date.now();
      LocalStorageService.saveActiveSession({
        sessionId: sessionIdRef.current,
        workoutId: workout.workoutId,
        workoutTitle: workout.title,
        startedAt: startTimeRef.current,
        elapsedSeconds,
        isPaused: nextPaused,
        currentExIndex,
        exerciseLogs
      });
      return nextPaused;
    });
  };

  // Rest timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRestActive && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 4 && prev > 1) {
            sounds.playCountdownTick();
          } else if (prev === 1) {
            sounds.playRestComplete();
            setIsRestActive(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restSecondsRemaining === 0) {
      setIsRestActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestActive, restSecondsRemaining]);

  // Cache interrupted session state
  useEffect(() => {
    if (!isFinishing) {
      LocalStorageService.saveActiveSession({
        sessionId: sessionIdRef.current,
        workoutId: workout.workoutId,
        workoutTitle: workout.title,
        elapsedSeconds,
        currentExIndex,
        exerciseLogs
      });
    }
  }, [elapsedSeconds, currentExIndex, exerciseLogs, isFinishing, workout]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle set completed
  const handleToggleSet = (setIndex: number) => {
    const updated = [...exerciseLogs];
    const targetSet = updated[currentExIndex].sets[setIndex];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;
    targetSet.completedAt = willBeCompleted ? new Date().toISOString() : undefined;

    // Check if all sets of current exercise are done
    const allSetsDone = updated[currentExIndex].sets.every(s => s.completed);
    updated[currentExIndex].completed = allSetsDone;
    setExerciseLogs(updated);

    if (willBeCompleted) {
      sounds.playBeep(700, 100);
      // Auto-trigger rest timer
      const restDuration = currentEx.restSeconds || 60;
      setRestSecondsRemaining(restDuration);
      setIsRestActive(true);
    }
  };

  // Adjust weight for set
  const handleAdjustWeight = (setIndex: number, delta: number) => {
    const updated = [...exerciseLogs];
    const curWeight = updated[currentExIndex].sets[setIndex].weightKg;
    updated[currentExIndex].sets[setIndex].weightKg = Math.max(0, curWeight + delta);
    setExerciseLogs(updated);
  };

  // Adjust reps for set
  const handleAdjustReps = (setIndex: number, delta: number) => {
    const updated = [...exerciseLogs];
    const curReps = updated[currentExIndex].sets[setIndex].reps;
    updated[currentExIndex].sets[setIndex].reps = Math.max(1, curReps + delta);
    setExerciseLogs(updated);
  };

  // Complete current exercise and advance
  const handleCompleteCurrentExercise = () => {
    const updated = [...exerciseLogs];
    updated[currentExIndex].completed = true;
    updated[currentExIndex].sets.forEach(s => {
      s.completed = true;
    });
    setExerciseLogs(updated);
    sounds.playExerciseComplete();

    if (currentExIndex < workout.exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setRestSecondsRemaining(currentEx.restSeconds || 60);
      setIsRestActive(true);
    }
  };

  // Estimated calories burned calculation
  const estimatedCaloriesBurned = Math.round((elapsedSeconds / 60) * (workout.estimatedCalories / workout.durationMinutes));

  // Finish workout session handler
  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    sounds.playWorkoutFinish();

    // Trigger victory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const completedExCount = exerciseLogs.filter(e => e.completed).length;

    const finalSession: WorkoutSession = {
      sessionId: sessionIdRef.current,
      userId: resolvedUserId,
      workoutId: workout.workoutId,
      workoutTitle: workout.title,
      category: workout.category,
      startedAt: startTimeRef.current,
      completedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, elapsedSeconds),
      caloriesBurned: Math.max(25, estimatedCaloriesBurned),
      currentExerciseIndex: currentExIndex,
      completedExerciseCount: Math.max(1, completedExCount),
      totalExerciseCount: workout.exercises.length,
      exerciseLogs,
      sourceDevice: 'Web',
      completionStatus: 'completed',
    };

    // Clean up in-progress cache so it doesn't prompt resume
    LocalStorageService.clearActiveSession();

    const completionResult = await SessionService.completeSession(finalSession, activeProfile);
    
    // Notify parent immediately
    if (onCompleteSession) {
      onCompleteSession(finalSession);
    }
    if (onSessionFinished) {
      onSessionFinished({
        finalSession,
        ...completionResult
      });
    }

    setFinishSummary({
      finalSession,
      ...completionResult
    });
  };

  const handleCloseSummary = useCallback(() => {
    LocalStorageService.clearActiveSession();
    if (onCompleteSession && finishSummary?.finalSession) {
      onCompleteSession(finishSummary.finalSession);
    }
    if (onSessionFinished && finishSummary) {
      onSessionFinished(finishSummary);
    }
    onClose();
  }, [finishSummary, onCompleteSession, onSessionFinished, onClose]);

  // Auto-redirect timer for completion
  useEffect(() => {
    if (!finishSummary) return;
    setAutoRedirectCountdown(4);
    const timer = setInterval(() => {
      setAutoRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCloseSummary();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishSummary, handleCloseSummary]);

  return (
    <div id="active_workout_screen" className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white overflow-x-hidden overflow-y-auto">
      {/* Top Session Header */}
      <header className="shrink-0 sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500 truncate">
                {workout.category}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono shrink-0">
                {currentExIndex + 1}/{workout.exercises.length}
              </span>
            </div>
            <h2 className="text-xs sm:text-base font-bold text-white truncate">
              {workout.title}
            </h2>
          </div>
        </div>

        {/* Global Timers & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 bg-zinc-900 border border-zinc-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className={`font-bold ${isPaused ? 'text-zinc-400 animate-pulse' : 'text-amber-400'}`}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <button
            id="active_workout_pause_button"
            onClick={handleTogglePause}
            className={`p-1.5 sm:p-2 rounded-xl transition-all ${
              isPaused 
                ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <button
            id="active_workout_finish_top_button"
            onClick={handleFinishWorkout}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-md shadow-amber-500/20 shrink-0"
          >
            <span className="hidden sm:inline">Finish Workout</span>
            <span className="sm:hidden">Finish</span>
          </button>
        </div>
      </header>

      {/* Paused Overlay Notice */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-amber-200"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-semibold">Workout Paused ({formatTime(elapsedSeconds)})</span>
            </div>
            <button
              onClick={handleTogglePause}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Body */}
      <div className="flex-1 p-3 sm:p-6 max-w-4xl w-full mx-auto space-y-4 sm:space-y-6">
        {/* Rest Countdown Banner (if active) */}
        <AnimatePresence>
          {isRestActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center font-mono font-black text-lg sm:text-xl text-amber-400 border border-amber-500/40 animate-pulse shrink-0">
                  {restSecondsRemaining}s
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Active Rest Interval</h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400">Catch your breath, hydrate, prepare for next set</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setRestSecondsRemaining(prev => prev + 15)}
                  className="text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  +15s
                </button>
                <button
                  onClick={() => { setIsRestActive(false); setRestSecondsRemaining(0); }}
                  className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Skip Rest
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Exercise Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-500 block">
                Current Movement
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-white mt-0.5 break-words">
                {currentEx.exerciseName}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentEx.targetMuscles.map((muscle, idx) => (
                  <span key={idx} className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercise switch buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="active_workout_prev_exercise"
                disabled={currentExIndex === 0}
                onClick={() => setCurrentExIndex(prev => Math.max(0, prev - 1))}
                className="p-2 sm:p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition-colors"
                title="Previous Exercise"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                id="active_workout_next_exercise"
                disabled={currentExIndex === workout.exercises.length - 1}
                onClick={() => setCurrentExIndex(prev => Math.min(workout.exercises.length - 1, prev + 1))}
                className="p-2 sm:p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition-colors"
                title="Next Exercise"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Instructions cues */}
          {currentEx.instructions && currentEx.instructions.length > 0 && (
            <div className="py-3 sm:py-4 border-b border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Form & Execution Cues
              </span>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
                {currentEx.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sets Tracker Table */}
          <div className="pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Working Sets & Weight Log
            </h3>
            <div className="space-y-2.5">
              {exerciseLogs[currentExIndex]?.sets.map((setLog, setIdx) => (
                <div
                  key={setIdx}
                  className={`p-3 sm:p-4 rounded-xl border transition-all ${
                    setLog.completed 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                    {/* Set number and mobile checkmark */}
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          setLog.completed ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {setLog.completed ? <Check className="w-4 h-4 stroke-[3]" /> : setLog.setNumber}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">
                          Set {setLog.setNumber}
                        </span>
                        {setLog.completed && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            Done
                          </span>
                        )}
                      </div>

                      {/* Mobile check button */}
                      <div className="sm:hidden">
                        <button
                          id={`active_set_check_mobile_${setIdx}`}
                          type="button"
                          onClick={() => handleToggleSet(setIdx)}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                            setLog.completed 
                              ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{setLog.completed ? 'Completed' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Modifiers & Desktop Complete Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                      {/* Weight modifier */}
                      <div className="flex items-center gap-1.5 bg-zinc-900/90 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-lg border border-zinc-800/80 sm:border-0 flex-1 sm:flex-initial justify-between sm:justify-start">
                        <span className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-bold font-mono">KG</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(setIdx, -2.5)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 sm:w-12 text-center font-mono font-bold text-xs sm:text-sm text-white">
                            {setLog.weightKg}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(setIdx, 2.5)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reps modifier */}
                      <div className="flex items-center gap-1.5 bg-zinc-900/90 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-lg border border-zinc-800/80 sm:border-0 flex-1 sm:flex-initial justify-between sm:justify-start">
                        <span className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-bold font-mono">REPS</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustReps(setIdx, -1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 sm:w-10 text-center font-mono font-bold text-xs sm:text-sm text-white">
                            {setLog.reps}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustReps(setIdx, 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Desktop Set completion button */}
                      <div className="hidden sm:block">
                        <button
                          id={`active_set_check_${setIdx}`}
                          type="button"
                          onClick={() => handleToggleSet(setIdx)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            setLog.completed 
                              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                          }`}
                          title={setLog.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Exercise Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                id="active_workout_complete_exercise"
                onClick={handleCompleteCurrentExercise}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mark Exercise Complete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workout Progress Metrics Card */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Estimated Burn
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-amber-400 font-mono font-bold text-base sm:text-lg">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{estimatedCaloriesBurned} kcal</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Exercises Completed
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-emerald-400 font-mono font-bold text-base sm:text-lg">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>
                {exerciseLogs.filter(e => e.completed).length}/{workout.exercises.length}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Target Time
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-zinc-200 font-mono font-bold text-base sm:text-lg">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{workout.durationMinutes}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Finish Summary Modal */}
      {finishSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-y-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-500">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Workout Completed!
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {workout.title} has been saved to your training history.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 my-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Duration</span>
                <p className="text-base font-bold text-white font-mono mt-0.5">
                  {formatTime(finishSummary.finalSession.durationSeconds)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Calories</span>
                <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {finishSummary.finalSession.caloriesBurned} kcal
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Streak</span>
                <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {finishSummary.updatedProfile.currentStreak} Days
                </p>
              </div>
            </div>

            {/* Unlocked badges notification if any */}
            {finishSummary.unlockedAchievements?.length > 0 && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unlocked Badges: {finishSummary.unlockedAchievements.join(', ')}</span>
              </div>
            )}

            <button
              id="active_workout_summary_close"
              onClick={handleCloseSummary}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Return to Dashboard</span>
              <span className="text-xs bg-zinc-950/20 px-2 py-0.5 rounded-full font-mono">
                Auto in {autoRedirectCountdown}s
              </span>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
