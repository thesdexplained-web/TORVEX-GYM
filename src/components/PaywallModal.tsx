import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Bot, 
  HeartPulse, 
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';
import { SubscriptionPlanType, UserSubscription } from '../types';
import { SubscriptionService } from '../services/subscriptionService';

interface PaywallModalProps {
  isOpen: boolean;
  userId: string;
  isExpired?: boolean;
  onClose: () => void;
  onSuccess: (sub: UserSubscription) => void;
  onOpenSimulator?: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  userId,
  isExpired = false,
  onClose,
  onSuccess,
  onOpenSimulator,
  onOpenLegal
}) => {
  const products = SubscriptionService.getProducts();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('yearly');
  const [loading, setLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setStatusNotice(null);
    try {
      const sub = await SubscriptionService.purchasePlan(userId, selectedPlan);
      setStatusNotice('Subscription activated successfully! Welcome to Torvex Pro.');
      setTimeout(() => {
        onSuccess(sub);
        onClose();
      }, 600);
    } catch (e: any) {
      setStatusNotice('Purchase activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setStatusNotice(null);
    try {
      const res = await SubscriptionService.restorePurchases(userId);
      if (res.subscription.status === 'premium_active') {
        setStatusNotice('Purchases restored successfully. Unlimited access restored.');
        setTimeout(() => {
          onSuccess(res.subscription);
          onClose();
        }, 600);
      } else {
        setStatusNotice('No active paid subscriptions found on this account.');
      }
    } catch {
      setStatusNotice('No previous purchases found for this account.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProd = products.find(p => p.planType === selectedPlan) || products[2];

  return (
    <div 
      id="paywall_modal_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
      >
        {/* Pinned Top Header */}
        <div className="shrink-0 relative p-5 sm:p-6 pb-3 border-b border-zinc-800/60 bg-zinc-900 text-center">
          {/* Only show close button if free month has not expired */}
          {!isExpired && (
            <button
              id="paywall_close_button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isExpired ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Lock className="w-3.5 h-3.5" />
              MEMBERSHIP REQUIRED
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              TORVEX PRO MEMBERSHIP
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            TORVEX <span className="text-amber-500">PREMIUM</span>
          </h2>

          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {isExpired
              ? 'Your free trial period has ended. Activate a plan to continue training.'
              : 'Unlock complete workout intelligence, AI coaching, and cloud telemetry.'}
          </p>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Critical Expired Notice Bar (Exact User Instruction) */}
          {isExpired && (
            <div 
              id="paywall_expired_mandatory_notice"
              className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs sm:text-sm leading-relaxed"
            >
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Free Trial Period Concluded</p>
                <p className="text-rose-200/90 text-xs">
                  Your free trial period has ended. To continue using the application, please purchase a subscription. You can choose Monthly, 6-Month, or Yearly plans. Without an active subscription, the application cannot be used.
                </p>
              </div>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Unlimited Routines</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Torvex AI Coach</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Apple Watch Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Deep Muscle Analytics</span>
            </div>
          </div>

          {/* Plans Selector: Monthly, 6-Month, Yearly */}
          <div className="space-y-2.5">
            {products.map(prod => {
              const isSelected = selectedPlan === prod.planType;
              return (
                <div
                  key={prod.productId}
                  id={`paywall_plan_${prod.planType}`}
                  onClick={() => setSelectedPlan(prod.planType)}
                  className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {prod.badge && (
                    <span className="absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 shadow-sm">
                      {prod.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-zinc-700'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{prod.title}</h4>
                      <p className="text-xs text-zinc-400 truncate">{prod.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold font-mono text-amber-400">
                      {prod.priceDisplay}
                    </span>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {prod.effectiveMonthlyPriceDisplay}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {statusNotice && (
            <div className="text-center text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
              {statusNotice}
            </div>
          )}
        </div>

        {/* Pinned Bottom CTA Bar */}
        <div className="shrink-0 p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/80 space-y-2.5">
          <button
            id="paywall_subscribe_button"
            disabled={loading}
            onClick={handlePurchase}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm disabled:opacity-50 truncate"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-zinc-950 shrink-0" />
                <span className="truncate">
                  {isExpired ? 'Purchase Subscription • ' : 'Activate '}{selectedProd.title} ({selectedProd.priceDisplay})
                </span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 pt-0.5">
            <button
              id="paywall_restore_button"
              type="button"
              onClick={handleRestore}
              className="hover:text-zinc-200 underline transition-colors"
            >
              Restore Purchases
            </button>

            {onOpenSimulator && (
              <button
                id="paywall_open_simulator_button"
                type="button"
                onClick={onOpenSimulator}
                className="text-amber-500 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>QA Days & State Simulator</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-400 pt-1">
            <button
              id="paywall_link_terms"
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="hover:text-amber-400 underline underline-offset-2 transition-colors"
            >
              Terms of Use (EULA)
            </button>
            <span className="text-zinc-600">•</span>
            <button
              id="paywall_link_privacy"
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="hover:text-amber-400 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 text-center leading-tight">
            Subscription auto-renews at selected plan cycle unless cancelled 24 hours prior to expiration.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
