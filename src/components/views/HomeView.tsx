import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Clock, 
  Dumbbell, 
  Trophy, 
  Play, 
  ArrowRight, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Target,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { UserProfile, Workout, DailyChallenge, WorkoutSession, UserSubscription } from '../../types';
import { WORKOUT_CATEGORIES } from '../../data/initialCatalog';

interface HomeViewProps {
  userProfile: UserProfile | null;
  workouts: Workout[];
  dailyChallenges: DailyChallenge[];
  recentSessions: WorkoutSession[];
  subscription: UserSubscription | null;
  onSelectWorkout: (workout: Workout) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenPaywall: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  workouts,
  dailyChallenges,
  recentSessions,
  subscription,
  onSelectWorkout,
  onNavigateTab,
  onOpenAuth,
  onOpenPaywall
}) => {
  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const isPremium = subscription?.entitlement === 'premium';
  const featuredWorkout = workouts[0] || null;
  const recentSession = recentSessions[0] || null;

  // New user empty state check
  const isFreshUser = !userProfile || (userProfile.totalWorkoutCount === 0);

  return (
    <div id="home_view" className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Greeting & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
              {currentDateDisplay}
            </span>
            {isPremium && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                PREMIUM
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {getGreeting()},{' '}
            <span className="text-amber-500">
              {userProfile ? userProfile.displayName.split(' ')[0] : 'Athlete'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {isFreshUser
              ? 'Ready to build your foundation? Start your very first training session.'
              : `You are on a ${userProfile?.currentStreak || 0}-day training streak. Keep the momentum high.`}
          </p>
        </div>

        {/* User Streak & Actions */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                Current Streak
              </span>
              <span className="font-mono font-black text-lg text-white">
                {userProfile ? userProfile.currentStreak : 0}{' '}
                <span className="text-xs font-normal text-zinc-400">days</span>
              </span>
            </div>
          </div>

          {!userProfile && (
            <button
              id="home_signin_button"
              onClick={onOpenAuth}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Quick Statistics Grid (Strict Data Integrity: 0 for fresh users) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Workouts</span>
            <Dumbbell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {userProfile?.totalWorkoutCount || 0}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Sessions completed</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Workout Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {userProfile?.totalWorkoutMinutes || 0}
            <span className="text-xs font-normal text-zinc-400 ml-1">min</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Active kinetic load</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Calories</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-mono font-black text-2xl text-amber-400">
            {(userProfile?.totalCaloriesBurned || 0).toLocaleString()}
            <span className="text-xs font-normal text-zinc-400 ml-1">kcal</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Energy expenditure</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Peak Streak</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-2xl text-emerald-400">
            {userProfile?.longestStreak || 0}
            <span className="text-xs font-normal text-zinc-400 ml-1">days</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Personal record</span>
        </div>
      </div>

      {/* Primary Featured Workout Card */}
      {featuredWorkout && (
        <div className="relative rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl">
          <div className="relative h-64 sm:h-72 w-full">
            <img
              src={featuredWorkout.imageUrl}
              alt={featuredWorkout.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/30" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-zinc-950">
                Recommended Routine
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-zinc-300">
                {featuredWorkout.category}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {featuredWorkout.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-lg line-clamp-2">
                  {featuredWorkout.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-300 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{featuredWorkout.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{featuredWorkout.estimatedCalories} kcal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-4 h-4 text-zinc-400" />
                    <span>{featuredWorkout.exerciseCount} exercises</span>
                  </div>
                </div>
              </div>

              <button
                id="home_featured_start_button"
                onClick={() => onSelectWorkout(featuredWorkout)}
                className="shrink-0 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Categories Browser */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Workout Disciplines
            </h3>
            <p className="text-xs text-zinc-400">Target specific kinetic chains and training adaptations</p>
          </div>
          <button
            onClick={() => onNavigateTab('workouts')}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {WORKOUT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigateTab('workouts')}
              className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
            >
              <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1 block">
                {cat.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Challenges Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                Daily Challenges
              </h3>
            </div>
            <p className="text-xs text-zinc-400">Earn consistency points and maintain daily volume</p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-400">
            {dailyChallenges.filter(c => c.completionStatus === 'completed').length}/{dailyChallenges.length} Done
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyChallenges.map(c => {
            const isDone = c.completionStatus === 'completed';
            const percent = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));

            return (
              <div 
                key={c.challengeId}
                className={`p-4 rounded-xl border transition-all ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {c.title}
                  </h4>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                      +{c.rewardPoints} XP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">{c.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className={`h-full transition-all duration-500 ${isDone ? 'bg-emerald-400' : 'bg-amber-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Progress: {c.currentValue}/{c.targetValue}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Workout or New User Empty State */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
            Recent Activity
          </h3>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
          >
            All Logs
          </button>
        </div>

        {recentSession ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {recentSession.category}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {new Date(recentSession.startedAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{recentSession.workoutTitle}</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 font-mono">
                <span>Duration: {Math.round(recentSession.durationSeconds / 60)} min</span>
                <span>•</span>
                <span className="text-amber-400">{recentSession.caloriesBurned} kcal</span>
                <span>•</span>
                <span>{recentSession.completedExerciseCount} exercises</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('progress')}
              className="self-start sm:self-center text-xs font-semibold px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              View Session Breakdown
            </button>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-zinc-300">No workout records yet</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Start your first workout to build your progress and establish your streak.
            </p>
            {featuredWorkout && (
              <button
                onClick={() => onSelectWorkout(featuredWorkout)}
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-semibold text-xs px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Launch First Session</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
