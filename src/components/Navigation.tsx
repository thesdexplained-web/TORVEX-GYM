import React from 'react';
import { 
  Home, 
  Dumbbell, 
  TrendingUp, 
  Bot, 
  User, 
  Sparkles, 
  Flame, 
  Zap, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, UserSubscription } from '../types';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'home' | 'workouts' | 'progress' | 'coach' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userProfile: UserProfile | null;
  subscription: UserSubscription | null;
  isOnline: boolean;
  pendingSyncCount: number;
  onOpenAuth: () => void;
  onOpenPaywall: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  subscription,
  isOnline,
  pendingSyncCount,
  onOpenAuth,
  onOpenPaywall
}) => {
  const { theme, toggleTheme } = useTheme();
  const isPremium = subscription?.entitlement === 'premium';

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Top Application Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            id="nav_brand_logo"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Flame className="w-5 h-5 fill-zinc-950" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tighter text-white uppercase block leading-none">
                TORVEX <span className="text-amber-500">GYM</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono block mt-0.5">
                PERFORMANCE ENGINE
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop md and up) */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_link_${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync State Badge */}
            <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  {pendingSyncCount > 0 && (
                    <span className="text-amber-400 font-bold">
                      {pendingSyncCount} queued
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1 text-rose-400">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
            </div>

            {/* Premium CTA or Badge */}
            {isPremium ? (
              <span 
                onClick={onOpenPaywall}
                className="cursor-pointer hidden sm:flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>PRO</span>
              </span>
            ) : (
              <button
                id="nav_upgrade_button"
                onClick={onOpenPaywall}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all shadow-md shadow-amber-500/20 uppercase tracking-wider"
              >
                <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                <span>7-Day Trial</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              id="nav_theme_button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* User Account / Avatar */}
            {userProfile ? (
              <div
                id="nav_user_avatar"
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              >
                <img
                  src={userProfile.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={userProfile.displayName}
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <button
                id="nav_signin_button"
                onClick={onOpenAuth}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Sticky Tab Bar for Mobile devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile_nav_${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold tracking-tight mt-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
