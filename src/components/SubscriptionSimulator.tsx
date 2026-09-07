import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, ShieldCheck, Cpu, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { SubscriptionStatus, UserSubscription, UserProfile } from '../types';
import { SubscriptionService } from '../services/subscriptionService';

interface SubscriptionSimulatorProps {
  isOpen: boolean;
  userId: string;
  userProfile?: UserProfile | null;
  currentSubscription: UserSubscription | null;
  onClose: () => void;
  onStatusUpdated: (sub: UserSubscription) => void;
}

export const SubscriptionSimulator: React.FC<SubscriptionSimulatorProps> = ({
  isOpen,
  userId,
  userProfile,
  currentSubscription,
  onClose,
  onStatusUpdated
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplySimulation = async (status: SubscriptionStatus, daysRemaining?: number) => {
    setLoading(true);
    try {
      const updated = await SubscriptionService.simulateState(userId, status, daysRemaining);
      onStatusUpdated(updated);
    } catch (err) {
      console.error('Failed to simulate state', err);
    } finally {
      setLoading(false);
    }
  };

  const freeStatus = SubscriptionService.getFreeMonthStatus(currentSubscription);

  return (
    <div 
      id="subscription_simulator_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/30 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
      >
        {/* Pinned Header */}
        <div className="shrink-0 relative p-5 pb-3 border-b border-zinc-800/60 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono">
                  QA SUITE
                </span>
                <span className="text-xs text-zinc-400 font-mono">1-Month Free & Reminders</span>
              </div>
              <h3 className="text-lg font-bold text-white">Subscription & Countdown Simulator</h3>
            </div>
          </div>

          <button
            id="subscription_simulator_close"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Quickly test the 30-day countdown engine, in-app notification banners (15d, 7d, 3d, 1d), and Day 31 hard paywall lockout.
          </p>

          {/* Current State Info */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500 uppercase tracking-wider font-mono text-[10px] block">Current Status</span>
              <span className="font-bold text-white">{currentSubscription?.status || 'None'}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 uppercase tracking-wider font-mono text-[10px] block">Days Remaining</span>
              <span className="font-bold text-amber-400 font-mono">{freeStatus.daysRemaining} days</span>
            </div>
          </div>

          {/* 30-Day Reminder Trigger Simulators */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              1-Month Countdown & Notification Reminders
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="sim_btn_15d"
                type="button"
                disabled={loading}
                onClick={() => handleApplySimulation('trial_active', 15)}
                className="p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>15 Days Left</span>
                </div>
                <p className="text-[11px] text-zinc-400">Trigger 15-day reminder notice</p>
              </button>

              <button
                id="sim_btn_7d"
                type="button"
                disabled={loading}
                onClick={() => handleApplySimulation('trial_active', 7)}
                className="p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>7 Days Left</span>
                </div>
                <p className="text-[11px] text-zinc-400">Trigger 7-day reminder notice</p>
              </button>

              <button
                id="sim_btn_3d"
                type="button"
                disabled={loading}
                onClick={() => handleApplySimulation('trial_active', 3)}
                className="p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3 Days Left</span>
                </div>
                <p className="text-[11px] text-zinc-400">Trigger 3-day reminder notice</p>
              </button>

              <button
                id="sim_btn_1d"
                type="button"
                disabled={loading}
                onClick={() => handleApplySimulation('trial_active', 1)}
                className="p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>1 Day Left</span>
                </div>
                <p className="text-[11px] text-zinc-400">Trigger 1-day urgent reminder</p>
              </button>
            </div>
          </div>

          {/* Hard Lock and Paid Statuses */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Lifecycle States & Day 31 Hard Lock
            </span>

            {/* Hard Lock Expired Button */}
            <button
              id="sim_btn_expired"
              type="button"
              disabled={loading}
              onClick={() => handleApplySimulation('expired')}
              className="w-full p-3.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 rounded-xl text-left transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-0.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Day 31: Free Month Expired (Hard Lockout)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Forces paywall with mandatory prompt. App cannot be used without paid subscription.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                EXPIRED
              </span>
            </button>

            {/* Active Paid Subscriber Button */}
            <button
              id="sim_btn_paid_pro"
              type="button"
              disabled={loading}
              onClick={() => handleApplySimulation('premium_active')}
              className="w-full p-3.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-xl text-left transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Active Pro Paid Subscriber</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Valid paid membership. Zero reminders, all pro features and telemetry unlocked.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                PRO ACTIVE
              </span>
            </button>

            {/* Reset to Fresh 30-Day Free Month */}
            <button
              id="sim_btn_fresh_30d"
              type="button"
              disabled={loading}
              onClick={() => handleApplySimulation('trial_active', 30)}
              className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset to Fresh 30-Day Free Month</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Simulates a new user first-login state (full 30 days remaining).
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                30D FRESH
              </span>
            </button>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="shrink-0 p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">User: {userId.slice(0, 14)}</span>
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
