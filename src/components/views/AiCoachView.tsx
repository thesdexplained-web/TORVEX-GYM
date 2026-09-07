import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Target, 
  Clock, 
  Calendar, 
  Lock,
  MessageSquare,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { WorkoutDifficulty, UserProfile, UserSubscription } from '../../types';
import { AiCoachService, ChatMessage } from '../../services/aiCoachService';
import { LocalStorageService } from '../../services/localStorageService';

interface AiCoachViewProps {
  userProfile: UserProfile | null;
  subscription: UserSubscription | null;
  onOpenPaywall: () => void;
  onNavigateWorkouts: () => void;
}

const QUICK_PROMPTS = [
  { label: 'Review My Progress', query: 'Can you review my workout progress, consistency, and recent sessions?' },
  { label: 'What should I train today?', query: 'What should I train today based on my recent workout history and goal?' },
  { label: 'Bench Press Form', query: 'How do I optimize my bench press form and protect my shoulders?' },
  { label: 'Squat Biomechanics', query: 'How should I position my feet and knees for deep squats without knee pain?' },
  { label: 'Recovery & DOMS', query: 'My muscles are very sore. How should I speed up recovery and reduce DOMS?' },
  { label: 'Protein & Nutrition', query: 'What is my optimal daily protein and carb intake for muscle growth?' },
  { label: 'Overcoming Plateaus', query: 'My compound lifts have stalled. What deload or progressive overload protocol should I use?' }
];

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  userProfile,
  subscription,
  onOpenPaywall,
  onNavigateWorkouts
}) => {
  const isPremium = subscription?.entitlement === 'premium';
  const [activeTab, setActiveTab] = useState<'chat' | 'planner'>('chat');

  // Load recent workout sessions for contextual awareness
  const recentSessions = LocalStorageService.getCachedSessionsHistory(userProfile?.userId);
  const totalWorkouts = userProfile?.totalWorkoutCount || recentSessions.length || 0;
  const currentStreak = userProfile?.currentStreak || 0;
  const primaryGoal = userProfile?.fitnessGoal || 'Build Muscle';
  const fitnessLevel = userProfile?.fitnessLevel || 'Intermediate';
  const latestSession = recentSessions.length > 0 ? recentSessions[0] : null;

  // Split Generator State
  const [goal, setGoal] = useState<string>(primaryGoal);
  const [level, setLevel] = useState<WorkoutDifficulty>(fitnessLevel);
  const [availableTime, setAvailableTime] = useState<number>(45);
  const [frequency, setFrequency] = useState<number>(4);
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    summary: string;
    weeklySchedule: { day: string; focus: string; duration: number }[];
    recommendations: any[];
  } | null>(null);

  // Chat conversation state
  const athleteName = userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Athlete';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: `Hello ${athleteName}! I am your AI Fitness Coach.\n\nI can analyze your technique, review your workout progress (${totalWorkouts} sessions logged, ${currentStreak}-day streak), suggest your next routine, or dial in your nutrition.\n\nWhat would you like to work on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMsg]);

  const executeSend = async (text: string) => {
    if (!text.trim() || sendingMsg) return;

    const newMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setUserInput('');
    setSendingMsg(true);

    try {
      const reply = await AiCoachService.sendCoachMessage(text, {
        displayName: userProfile?.displayName,
        totalWorkouts,
        streak: currentStreak,
        fitnessLevel: level,
        primaryGoal: goal,
        recentSessions: recentSessions.slice(0, 3).map((s: any) => ({
          workoutTitle: s.workoutTitle || 'Custom Workout',
          category: s.category || 'Strength',
          durationSeconds: s.durationSeconds || 1800,
          caloriesBurned: s.caloriesBurned || 250,
          completedAt: s.completedAt || new Date().toISOString()
        })),
        conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      const coachMsg: ChatMessage = {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(userInput);
  };

  const handleRunConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) {
      onOpenPaywall();
      return;
    }

    setGenerating(true);
    try {
      const plan = await AiCoachService.generateConsultationPlan({
        fitnessGoal: goal,
        fitnessLevel: level,
        availableWorkoutTime: availableTime,
        trainingPreference: 'Split Routine',
        equipmentAvailability: 'Full Gym Equipment',
        workoutFrequencyPerWeek: frequency
      });
      setGeneratedPlan(plan);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div id="ai_coach_view" className="space-y-5 pb-12">
      {/* Clean, Focused Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              AI Coach Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            AI Fitness Coach
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Personalized training advice, form guidance, and workout planning tailored to your progress.
          </p>
        </div>

        {/* Action / Paywall */}
        {!isPremium && (
          <button
            onClick={onOpenPaywall}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-center"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Pro Coach</span>
          </button>
        )}
      </div>

      {/* Context Status Bar - Scannable & User-Friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Streak</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">{currentStreak} Days</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Workouts</span>
            <span className="text-xs sm:text-sm font-black text-white font-mono">{totalWorkouts} Logged</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Goal</span>
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px] block">{primaryGoal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Recent</span>
            <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px] block">
              {latestSession ? latestSession.workoutTitle : 'Ready to Start'}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Mode Switcher */}
      <div className="flex items-center gap-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 max-w-sm">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat with Coach</span>
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'planner'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Split Generator</span>
        </button>
      </div>

      {/* Main Tab 1: Chat Experience */}
      {activeTab === 'chat' ? (
        <div className="space-y-3">
          {/* Quick Prompts Row */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => executeSend(qp.query)}
                  disabled={sendingMsg}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-all font-medium disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col h-[520px] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-semibold rounded-tr-none shadow-md'
                        : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {sendingMsg && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono p-2 bg-zinc-950/60 rounded-xl border border-zinc-800 w-fit">
                  <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span>Coach is analyzing your workout history and biomechanics...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/60 flex gap-2">
              <input
                id="ai_coach_chat_input"
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Ask about workout form, recovery, nutrition, or what to train today..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                id="ai_coach_send_button"
                type="submit"
                disabled={sendingMsg || !userInput.trim()}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 px-4 sm:px-5 py-3 rounded-xl disabled:opacity-40 transition-colors flex items-center justify-center font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask Coach</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Main Tab 2: Split Generator - Simplified, Clean, Understandable */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Intake Form (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <Target className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                Workout Split Parameters
              </h3>
            </div>

            <form onSubmit={handleRunConsultation} className="space-y-4 text-xs">
              {/* Fitness Goal */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Primary Fitness Goal
                </label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Build Muscle">Build Muscle & Hypertrophy</option>
                  <option value="Lose Weight">Lose Weight & Fat Burn</option>
                  <option value="Increase Stamina">Endurance & Conditioning</option>
                  <option value="Functional Mobility">Mobility & Longevity</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as WorkoutDifficulty[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 px-2 rounded-lg font-bold text-center border transition-colors ${
                        level === lvl 
                          ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Training Days / Week</span>
                  <span className="font-mono text-amber-400 font-bold">{frequency} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="1"
                  value={frequency}
                  onChange={e => setFrequency(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Session Length</span>
                  <span className="font-mono text-amber-400 font-bold">{availableTime} min</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={availableTime}
                  onChange={e => setAvailableTime(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                id="ai_coach_submit_button"
                type="submit"
                disabled={generating}
                className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider mt-2 disabled:opacity-50"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-zinc-950" />
                    <span>Generate Custom Split</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel (7 cols) */}
          <div className="lg:col-span-7">
            {generatedPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono">
                    Custom Generated Plan
                  </span>
                  <button
                    onClick={() => onNavigateWorkouts()}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Browse Workouts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-black text-white">{generatedPlan.summary}</h3>

                {/* Day-by-Day Schedule */}
                <div className="pt-3 border-t border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Weekly Schedule
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {generatedPlan.weeklySchedule.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                        <div className="font-bold text-amber-400 font-mono text-[11px]">{item.day}</div>
                        <div className="font-medium text-white text-[11px] mt-0.5">{item.focus}</div>
                        <div className="text-zinc-500 font-mono text-[10px] mt-1">{item.duration} min</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Directives */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Coaching Directives
                  </h4>
                  {generatedPlan.recommendations.map(rec => (
                    <div key={rec.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                      <span className="text-amber-500 font-bold block">{rec.title}</span>
                      <p className="text-zinc-300 mt-0.5 leading-relaxed">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-lg h-full flex flex-col items-center justify-center min-h-[300px]">
                <Bot className="w-10 h-10 text-zinc-600 mb-2.5" />
                <h4 className="text-sm font-bold text-zinc-300">Ready to Build Your Split</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Select your goal, frequency, and time on the left, then click Generate to create your personalized training program.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
