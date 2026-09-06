import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Zap } from 'lucide-react';

interface SplashProps {
  onFinish?: () => void;
  onGetStarted?: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish, onGetStarted }) => {
  const handleProceed = () => {
    if (typeof onFinish === 'function') {
      onFinish();
    } else if (typeof onGetStarted === 'function') {
      onGetStarted();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleProceed();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish, onGetStarted]);

  return (
    <div 
      id="splash_screen"
      onClick={handleProceed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white select-none cursor-pointer overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-900/80 shadow-2xl shadow-black backdrop-blur-md"
          >
            <Dumbbell className="w-12 h-12 text-amber-500" strokeWidth={2.2} />
          </motion.div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Zap className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
          </div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl sm:text-4xl font-black tracking-tight uppercase"
        >
          TORVEX <span className="text-amber-500 font-extrabold">GYM</span>
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-2 text-sm sm:text-base font-medium tracking-widest uppercase text-zinc-400"
        >
          Train. Track. Transform.
        </motion.p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute bottom-10 text-xs text-zinc-600 font-mono tracking-wider"
      >
        Tap anywhere to enter
      </motion.div>
    </div>
  );
};
