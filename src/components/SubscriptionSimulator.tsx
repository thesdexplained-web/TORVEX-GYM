import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, AlertTriangle, ShieldCheck, RefreshCw, Cpu, User as UserIcon, Zap } from 'lucide-react';
import { SubscriptionStatus, UserSubscription, UserProfile } from '../types';
import { SubscriptionService } from '../services/subscriptionService';
import { AuthenticationService } from '../services/authService';

interface SubscriptionSimulatorProps {
  isOpen: boolean;
  userId: string;
  userProfile?: UserProfile | null;
  currentSubscription: UserSubscription | null;
  onClose: () => void;
  onStatusUpdated: (sub: UserSubscription) => void;
}

const SIMULATOR_STATES: { id: SubscriptionStatus; title: string; desc: string; entitlement: 'free' | 'premium'; badgeColor: string }[] = [
  { id: 'free', title: 'Free Tier', desc: 'Standard free access. Advanced workouts & AI locked.', entitlement: 'free', badgeColor: 'bg-zinc-800 text-zinc-300' },
  { id: 'trial_active', title: 'Trial Active', desc: '7-Day Free Trial running. Full premium access unlocked.', entitlement: 'premium', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'premium_active', title: 'Premium Active', desc: 'Valid paid subscriber. All features & wearable telemetry unlocked.', entitlement: 'premium', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'grace_period', title: 'Grace Period', desc: 'Payment renewal pending retry. Temporary access preserved.', entitlement: 'premium', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'billing_issue', title: 'Billing Issue', desc: 'Credit card declined / billing failure state.', entitlement: 'free', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'cancelled', title: 'Cancelled', desc: 'User cancelled autorenew; access expires at period end.', entitlement: 'free', badgeColor: 'bg-zinc-800 text-zinc-400' },
  { id: 'expired', title: 'Expired', desc: 'Past expiration date. Prompts renew paywall.', entitlement: 'free', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

export const SubscriptionSimulator: React.FC<SubscriptionSimulatorProps> = ({
  isOpen,
  userId,
  userProfile,
  currentSubscription,
  onClose,
  onStatusUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [activeState, setActiveState] = useState<SubscriptionStatus>(currentSubscription?.status || 'free');

  if (!isOpen) return null;

  const handleTogglePersona = async () => {
    setLoading(true);
    try {
      if (userProfile) {
        await AuthenticationService.signOut();
      } else {
        await AuthenticationService.signInAsDemoAthlete();
      }
    } catch (err) {
      console.error('Failed to toggle persona', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyState = async (status: SubscriptionStatus) => {
    setLoading(true);
    try {
      // If user is guest and activating premium/trial, automatically sign them in as demo athlete so profile & data show up
      let targetId = userId;
      if (!userProfile && (status === 'premium_active' || status === 'trial_active')) {
        const demoUser = await AuthenticationService.signInAsDemoAthlete();
        targetId = demoUser.userId;
      }
      const updated = await SubscriptionService.simulateState(targetId, status);
      setActiveState(status);
      onStatusUpdated(updated);
    } catch (err) {
      console.error('Failed to simulate state', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="subscription_simulator_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-zinc-900 border border-amber-500/30 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
      >
        {/* Pinned Header */}
        <div className="shrink-0 relative p-5 sm:p-6 pb-3 border-b border-zinc-800/60 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono">
                  QA ONLY
                </span>
                <span className="text-xs text-zinc-400 font-mono">RevenueCat Protocol</span>
              </div>
              <h3 className="text-lg font-bold text-white">Subscription Simulator</h3>
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
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Test any subscription state instantly to verify UI authorization barriers, paywall triggers, and data preservation.
          </p>

          {/* Current Auth Persona Status & Toggle */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${userProfile ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{userProfile ? userProfile.displayName : 'Guest (Not Signed In)'}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${userProfile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {userProfile ? 'AUTH OK' : 'GUEST'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {userProfile ? userProfile.emailAddress : 'Sign-in prompt appears for guests'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePersona}
              disabled={loading}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shrink-0"
            >
              {userProfile ? 'Switch to Guest' : 'Login as Athlete'}
            </button>
          </div>

          <div className="space-y-2.5">
            {SIMULATOR_STATES.map(st => {
              const isCurrent = activeState === st.id;
              return (
                <div
                  key={st.id}
                  id={`simulator_btn_${st.id}`}
                  onClick={() => handleApplyState(st.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent 
                      ? 'bg-amber-500/10 border-amber-500' 
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{st.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold uppercase ${st.badgeColor}`}>
                        {st.entitlement}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{st.desc}</p>
                  </div>

                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isCurrent ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'border-zinc-700 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="shrink-0 p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">Simulated UID: {userId.slice(0, 12)}...</span>
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
