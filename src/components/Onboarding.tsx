import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  BookOpenCheck, 
  Trophy, 
  TrendingUp, 
  Bot, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import { LocalStorageService } from '../services/localStorageService';

interface OnboardingProps {
  onComplete: () => void;
  onOpenAuth?: () => void;
}

const SLIDES = [
  {
    icon: Dumbbell,
    title: 'Personalized Workouts',
    subtitle: 'Precision Resistance & Hypertrophy Protocols',
    description: 'Access periodized full-body splits, compound barbell routines, and high-octane conditioning engineered for measurable progression.',
    accent: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    icon: BookOpenCheck,
    title: 'Workout Planner and Notes',
    subtitle: 'Set-by-Set Logging & Rep Tracking',
    description: 'Record active working sets, load weights, rest countdowns, and targeted muscle cues with instant local-first reliability.',
    accent: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    icon: Trophy,
    title: 'Daily Challenges and Badges',
    subtitle: 'Gamified Discipline & Milestones',
    description: 'Conquer daily caloric and volume challenges, protect your consecutive training streak, and unlock prestige gym achievements.',
    accent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Progress & Health Telemetry',
    subtitle: 'Real Data from Zero to Mastery',
    description: 'Track weekly minutes, cumulative calorie expenditure, Apple Health & Wear OS synchronization with strict data integrity.',
    accent: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: Bot,
    title: 'Torvex AI Fitness Coach',
    subtitle: 'Adaptive Guidance & Form Coaching',
    description: 'Receive personalized training adjustments, micro-loading schedules, and recovery recommendations tailored to your goals.',
    accent: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onOpenAuth }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    LocalStorageService.setCompletedOnboarding(true);
    onComplete();
  };

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div id="onboarding_container" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col justify-between h-[85vh] max-h-[680px]">
        {/* Top bar with Skip */}
        <div className="flex justify-between items-center">
          <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            TORVEX ARCHITECTURE // 0{currentSlide + 1}
          </div>
          <div className="flex items-center gap-2">
            {onOpenAuth && (
              <button
                id="onboarding_signin_link"
                onClick={onOpenAuth}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 px-2 py-1 rounded hover:bg-zinc-900 transition-colors"
              >
                Sign In
              </button>
            )}
            <button
              id="onboarding_skip_button"
              onClick={handleFinish}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="my-auto py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-24 h-24 rounded-3xl border flex items-center justify-center mb-8 shadow-xl ${slide.accent}`}>
                <IconComponent className="w-12 h-12" strokeWidth={2} />
              </div>

              <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2">
                {slide.subtitle}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4">
                {slide.title}
              </h2>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-sm">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Indicator Dots */}
        <div className="flex flex-col gap-6">
          {/* Indicator dots */}
          <div className="flex justify-center items-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                id={`onboarding_dot_${idx}`}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'w-8 bg-amber-500' 
                    : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            id="onboarding_next_button"
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {currentSlide === SLIDES.length - 1 ? (
              <>
                <span>Get Started</span>
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
