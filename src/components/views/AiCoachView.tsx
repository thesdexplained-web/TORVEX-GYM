import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Target, 
  Clock, 
  Dumbbell, 
  Calendar, 
  Check, 
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { WorkoutDifficulty, UserProfile, UserSubscription } from '../../types';
import { AiCoachService, ChatMessage, AiCoachConsultationRequest } from '../../services/aiCoachService';

interface AiCoachViewProps {
  userProfile: UserProfile | null;
  subscription: UserSubscription | null;
  onOpenPaywall: () => void;
  onNavigateWorkouts: () => void;
}

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  userProfile,
  subscription,
  onOpenPaywall,
  onNavigateWorkouts
}) => {
  const isPremium = subscription?.entitlement === 'premium';

  // Consultation state
  const [goal, setGoal] = useState<string>('Build Muscle');
  const [level, setLevel] = useState<WorkoutDifficulty>('Intermediate');
  const [availableTime, setAvailableTime] = useState<number>(45);
  const [preference, setPreference] = useState<string>('Split Routine');
  const [equipment, setEquipment] = useState<string>('Full Gym Equipment');
  const [frequency, setFrequency] = useState<number>(4);

  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    summary: string;
    weeklySchedule: { day: string; focus: string; duration: number }[];
    recommendations: any[];
  } | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: `Hello ${userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Athlete'}. I am your Torvex AI Conditioning Specialist. How can I optimize your volume, programming, or recovery today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);

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
        trainingPreference: preference,
        equipmentAvailability: equipment,
        workoutFrequencyPerWeek: frequency
      });
      setGeneratedPlan(plan);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    setUserInput('');

    const newMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setSendingMsg(true);

    try {
      const reply = await AiCoachService.sendCoachMessage(userText, {
        totalWorkouts: userProfile?.totalWorkoutCount || 0,
        streak: userProfile?.currentStreak || 0
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

  return (
    <div id="ai_coach_view" className="space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-mono">
              <Bot className="w-3.5 h-3.5" />
              INTELLIGENT ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Torvex AI Fitness Coach
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Algorithmic periodization, micro-loading schedules, kinetic adjustments, and real-time biomechanical guidance.
          </p>
        </div>

        {!isPremium && (
          <button
            onClick={onOpenPaywall}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock AI Coach with Trial</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intake Consultation Form (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              Athlete Profiling Parameters
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
                <option value="Lose Weight">Lose Weight & Metabolic Burn</option>
                <option value="Increase Stamina">Increase Stamina & VO2 Max</option>
                <option value="Functional Mobility">Functional Mobility & Longevity</option>
              </select>
            </div>

            {/* Fitness Level */}
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

            {/* Time available */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold text-zinc-400 uppercase tracking-wider">
                <span>Available Training Block</span>
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

            {/* Frequency */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold text-zinc-400 uppercase tracking-wider">
                <span>Workout Frequency</span>
                <span className="font-mono text-amber-400 font-bold">{frequency} days / week</span>
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

            {/* Equipment Availability */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Equipment Availability
              </label>
              <select
                value={equipment}
                onChange={e => setEquipment(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Full Gym Equipment">Full Commercial Gym (Barbells, Cables, Dumbbells)</option>
                <option value="Dumbbells Only">Dumbbells & Bench Only</option>
                <option value="Bodyweight Only">Bodyweight & Calisthenics</option>
              </select>
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
                  <span>Generate Customized Protocol</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Custom Plan Results & Interactive Coach Chat (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Generated Plan Display */}
          {generatedPlan ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono">
                  ACTIVE AI BLUEPRINT
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{generatedPlan.summary}</h3>

              {/* Weekly Split Schedule */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Weekly Programmed Split
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {generatedPlan.weeklySchedule.map((item, idx) => (
                    <div key={idx} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs">
                      <div className="font-bold text-amber-400 font-mono text-[11px]">{item.day}</div>
                      <div className="font-medium text-white text-[11px] mt-0.5">{item.focus}</div>
                      <div className="text-zinc-500 font-mono text-[10px] mt-1">{item.duration} min</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific Recommendations */}
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Periodization Directives
                </h4>
                {generatedPlan.recommendations.map(rec => (
                  <div key={rec.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-amber-500 font-bold block">{rec.title}</span>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{rec.recommendation}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 italic">Why: {rec.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-lg">
              <Bot className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-zinc-300">No active generated blueprint</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Fill in your parameters on the left to generate an algorithmic training split and recovery guidelines.
              </p>
            </div>
          )}

          {/* Interactive Chat with Torvex AI Specialist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Direct Coach Consultation
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Real-time biomechanics</span>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none'
                        : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}
              {sendingMsg && (
                <div className="text-zinc-500 text-[11px] font-mono italic">
                  Torvex Coach is analyzing your query...
                </div>
              )}
            </div>

            {/* Chat input form */}
            <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
              <input
                id="ai_coach_chat_input"
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Ask about squat technique, sore lats, protein timing..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                id="ai_coach_send_button"
                type="submit"
                disabled={sendingMsg || !userInput.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 p-2.5 rounded-xl disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
