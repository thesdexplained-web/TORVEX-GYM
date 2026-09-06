import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Dumbbell, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Plus
} from 'lucide-react';
import { UserProfile, WorkoutSession } from '../../types';

interface ProgressViewProps {
  userProfile: UserProfile | null;
  sessions: WorkoutSession[];
  onNavigateWorkouts: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProfile,
  sessions,
  onNavigateWorkouts
}) => {
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  // Group workouts by day of the week for weekly activity
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Compute weekly stats
  const now = new Date();
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyMinutesMap = new Map<string, number>();
  past7Days.forEach(day => dailyMinutesMap.set(day, 0));

  sessions.forEach(s => {
    const sDate = s.startedAt.split('T')[0];
    if (dailyMinutesMap.has(sDate)) {
      const cur = dailyMinutesMap.get(sDate) || 0;
      dailyMinutesMap.set(sDate, cur + Math.round(s.durationSeconds / 60));
    }
  });

  const maxMinutesInDay = Math.max(45, ...Array.from(dailyMinutesMap.values()));

  const isFreshUser = !userProfile || userProfile.totalWorkoutCount === 0;

  return (
    <div id="progress_view" className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Progress & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Historical kinetic volume, streak longevity, and session audit logs.
        </p>
      </div>

      {/* Main KPI Quad Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Sessions</span>
            <Dumbbell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-white">
            {userProfile?.totalWorkoutCount || 0}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Full workouts recorded</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Time in Motion</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-white">
            {userProfile?.totalWorkoutMinutes || 0}
            <span className="text-sm font-normal text-zinc-400 ml-1">min</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Cumulative active time</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Burn</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-amber-400">
            {(userProfile?.totalCaloriesBurned || 0).toLocaleString()}
            <span className="text-sm font-normal text-zinc-400 ml-1">kcal</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Thermic energy consumed</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current / Max Streak</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">
            {userProfile?.currentStreak || 0}
            <span className="text-sm text-zinc-500 font-normal ml-2">/ {userProfile?.longestStreak || 0}d</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Consecutive training days</span>
        </div>
      </div>

      {/* Weekly Activity Volume Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              7-Day Training Volume
            </h3>
            <p className="text-xs text-zinc-400">Daily minutes recorded across recent sessions</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {Array.from(dailyMinutesMap.values()).reduce((a, b) => a + b, 0)} min total this week
          </span>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b border-zinc-800">
          {past7Days.map((dayStr, idx) => {
            const minutes = dailyMinutesMap.get(dayStr) || 0;
            const heightPercent = Math.max(8, Math.round((minutes / maxMinutesInDay) * 100));
            const dayLabel = new Date(dayStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={dayStr} className="flex flex-col items-center justify-end h-full group">
                {minutes > 0 && (
                  <span className="text-[10px] font-mono text-amber-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {minutes}m
                  </span>
                )}
                <div 
                  className={`w-full max-w-[36px] rounded-lg transition-all duration-500 ${
                    minutes > 0 
                      ? 'bg-amber-500 group-hover:bg-amber-400 shadow-sm shadow-amber-500/30' 
                      : 'bg-zinc-800/80 group-hover:bg-zinc-800'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[11px] font-medium text-zinc-400 mt-2 font-mono">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout Session History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Workout Session History
            </h3>
            <p className="text-xs text-zinc-400">Chronological ledger of completed workouts</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {sessions.length} Recorded
          </span>
        </div>

        {isFreshUser ? (
          <div className="text-center py-12 px-4 bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
            <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-200">No workout records found</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Start your first workout to build your progress and review detailed set-by-set telemetry.
            </p>
            <button
              onClick={onNavigateWorkouts}
              className="mt-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              Browse Workouts
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(sess => (
              <div
                key={sess.sessionId}
                onClick={() => setSelectedSession(sess)}
                className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {sess.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(sess.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{sess.workoutTitle}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400 font-mono">
                    <span>{Math.round(sess.durationSeconds / 60)} min</span>
                    <span>•</span>
                    <span className="text-amber-400">{sess.caloriesBurned} kcal</span>
                    <span>•</span>
                    <span>{sess.completedExerciseCount} of {sess.totalExerciseCount} exercises</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs text-zinc-500 font-mono">ID: {sess.sessionId.slice(-6)}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Audit Modal if selected */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  {selectedSession.category} • {selectedSession.sourceDevice}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedSession.workoutTitle}
                </h3>
                <p className="text-xs text-zinc-400">
                  {new Date(selectedSession.startedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Session Stats Bar */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center text-xs mb-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Duration</span>
                <p className="font-mono font-bold text-white mt-0.5">
                  {Math.round(selectedSession.durationSeconds / 60)} min
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Calories</span>
                <p className="font-mono font-bold text-amber-400 mt-0.5">
                  {selectedSession.caloriesBurned} kcal
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Status</span>
                <p className="font-mono font-bold text-emerald-400 mt-0.5 capitalize">
                  {selectedSession.completionStatus}
                </p>
              </div>
            </div>

            {/* Exercise Logs */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Exercise Sets Completed
              </h4>
              {selectedSession.exerciseLogs.map((log, lIdx) => (
                <div key={lIdx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white">{log.exerciseName}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {log.sets.filter(s => s.completed).length}/{log.sets.length} sets
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                    {log.sets.map((set, sIdx) => (
                      <div 
                        key={sIdx}
                        className={`p-1.5 rounded text-center border ${
                          set.completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <div>Set {set.setNumber}</div>
                        <div className="font-bold text-white">{set.weightKg}kg × {set.reps}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedSession(null)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 rounded-xl text-xs mt-4 transition-colors"
            >
              Close Details
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
