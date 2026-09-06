import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { Splash } from './components/Splash';
import { Onboarding } from './components/Onboarding';
import { AuthModal } from './components/AuthModal';
import { WorkoutDetailsModal } from './components/WorkoutDetailsModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { PaywallModal } from './components/PaywallModal';
import { SubscriptionSimulator } from './components/SubscriptionSimulator';
import { HealthSyncModal } from './components/HealthSyncModal';
import { LegalModal, LegalTab } from './components/LegalModal';

// Views
import { HomeView } from './components/views/HomeView';
import { WorkoutsView } from './components/views/WorkoutsView';
import { ProgressView } from './components/views/ProgressView';
import { AiCoachView } from './components/views/AiCoachView';
import { ProfileView } from './components/views/ProfileView';

// Services & Domain
import { AuthenticationService } from './services/authService';
import { WorkoutService } from './services/workoutService';
import { SessionService } from './services/sessionService';
import { AchievementService } from './services/achievementService';
import { ChallengeService } from './services/challengeService';
import { SubscriptionService } from './services/subscriptionService';
import { SyncService } from './services/syncService';
import { 
  UserProfile, 
  Workout, 
  WorkoutSession, 
  DailyChallenge, 
  Achievement, 
  UserSubscription, 
  WorkoutNote 
} from './types';
import { INITIAL_WORKOUTS } from './data/initialCatalog';
import { Sparkles, Info, X } from 'lucide-react';

export default function App() {
  return (
    <ThemeProvider>
      <TorvexAppContent />
    </ThemeProvider>
  );
}

function TorvexAppContent() {
  // App lifecycle stages
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem('torvex_splash_shown');
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('torvex_onboarding_completed');
  });

  // Current navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Core domain data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS);
  const [favoriteWorkoutIds, setFavoriteWorkoutIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [notes, setNotes] = useState<WorkoutNote[]>([]);

  // Connectivity & Sync state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState<boolean>(false);

  // Active Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isHealthSyncOpen, setIsHealthSyncOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');
  const [inspectingWorkout, setInspectingWorkout] = useState<Workout | null>(null);
  const [activeWorkoutToRun, setActiveWorkoutToRun] = useState<Workout | null>(null);

  const handleOpenLegal = (tab: LegalTab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Deep-link check for public store compliance URLs (?page=privacy or #terms)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page') || window.location.hash.replace('#', '').toLowerCase();
      if (pageParam === 'privacy' || pageParam === 'privacy-policy') {
        handleOpenLegal('privacy');
      } else if (pageParam === 'terms' || pageParam === 'eula' || pageParam === 'tos') {
        handleOpenLegal('terms');
      } else if (pageParam === 'support' || pageParam === 'faq' || pageParam === 'contact') {
        handleOpenLegal('support');
      } else if (pageParam === 'delete' || pageParam === 'deletion' || pageParam === 'delete-account') {
        handleOpenLegal('deletion');
      }
    } catch {
      // Graceful fallback for sandboxed iframes
    }
  }, []);

  // Initialize Sync Service & Online Listeners
  useEffect(() => {
    AuthenticationService.init();
    SyncService.init();
    
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    const unsubSync = SyncService.onStatusChange((_, count) => {
      setPendingSyncCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      unsubSync();
    };
  }, []);

  // Subscribe to Authentication state
  useEffect(() => {
    const unsubscribe = AuthenticationService.onAuthStateChange(async (profile) => {
      setUserProfile(profile);
      if (profile) {
        await loadUserData(profile.userId);
      } else {
        await loadGuestData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Live Cloud Workouts Subscription (mounted once, independent of user profile changes)
  useEffect(() => {
    const unsub = WorkoutService.subscribeToWorkouts((updatedWorkouts) => {
      setWorkouts(prev => {
        // Prevent re-renders if the list has not changed
        if (prev.length === updatedWorkouts.length && prev[0]?.workoutId === updatedWorkouts[0]?.workoutId) {
          return prev;
        }
        return updatedWorkouts;
      });
    });

    return () => unsub();
  }, []);

  // Daily Challenges for current user or guest
  useEffect(() => {
    const initChallenges = async () => {
      const chs = await ChallengeService.getDailyChallenges(userProfile?.userId || 'guest');
      setDailyChallenges(chs);
    };
    initChallenges();
  }, [userProfile?.userId]);

  const loadUserData = async (userId: string) => {
    try {
      const [favs, sess, achs, sub, userNotes, chs] = await Promise.all([
        WorkoutService.getFavoriteWorkoutIds(userId),
        SessionService.getUserSessions(userId),
        AchievementService.getUserAchievements(userId),
        SubscriptionService.getSubscription(userId),
        WorkoutService.getNotes(userId),
        ChallengeService.getDailyChallenges(userId)
      ]);

      setFavoriteWorkoutIds(favs);
      setSessions(sess);
      setAchievements(achs);
      setSubscription(sub);
      setNotes(userNotes);
      setDailyChallenges(chs);
    } catch (err) {
      console.error('Failed to load user state from database:', err);
    }
  };

  const loadGuestData = async () => {
    const [sess, achs, sub, favs, userNotes, chs] = await Promise.all([
      SessionService.getUserSessions('guest'),
      AchievementService.getUserAchievements('guest'),
      SubscriptionService.getSubscription('guest'),
      WorkoutService.getFavoriteWorkoutIds('guest'),
      WorkoutService.getNotes('guest'),
      ChallengeService.getDailyChallenges('guest')
    ]);

    setSessions(sess);
    setAchievements(achs);
    setSubscription(sub);
    setFavoriteWorkoutIds(favs);
    setNotes(userNotes);
    setDailyChallenges(chs);
  };

  const handleFinishSplash = () => {
    sessionStorage.setItem('torvex_splash_shown', 'true');
    setShowSplash(false);
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('torvex_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleToggleFavorite = async (workoutId: string) => {
    const userId = userProfile ? userProfile.userId : 'guest';
    const isCurrentlyFav = favoriteWorkoutIds.includes(workoutId);
    await WorkoutService.toggleFavoriteWorkout(userId, workoutId, isCurrentlyFav);
    const updated = await WorkoutService.getFavoriteWorkoutIds(userId);
    setFavoriteWorkoutIds(updated);
  };

  const handleStartWorkout = (workout: Workout) => {
    // Check if locked
    const isLocked = workout.isPremiumOnly && subscription?.entitlement !== 'premium';
    if (isLocked) {
      setIsPaywallOpen(true);
      return;
    }

    setInspectingWorkout(null);
    setActiveWorkoutToRun(workout);
  };

  const handleCompleteActiveSession = useCallback(async (newSession: WorkoutSession) => {
    setSessions(prev => [newSession, ...prev]);
    const userId = userProfile ? userProfile.userId : 'guest';

    // Refresh profile metrics & achievements
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        totalWorkoutCount: userProfile.totalWorkoutCount + 1,
        totalWorkoutMinutes: userProfile.totalWorkoutMinutes + Math.round(newSession.durationSeconds / 60),
        totalCaloriesBurned: userProfile.totalCaloriesBurned + newSession.caloriesBurned,
        currentStreak: Math.max(1, userProfile.currentStreak),
        lastWorkoutDate: newSession.completedAt || new Date().toISOString()
      };
      setUserProfile(updatedProfile);
    }

    // Refresh challenges & achievements
    const [achs, chs] = await Promise.all([
      AchievementService.getUserAchievements(userId),
      ChallengeService.getDailyChallenges(userId)
    ]);
    setAchievements(achs);
    setDailyChallenges(chs);
  }, [userProfile]);

  // Stage 1: Splash Screen Gate
  if (showSplash) {
    return <Splash onFinish={handleFinishSplash} onGetStarted={handleFinishSplash} />;
  }

  // Stage 2: Onboarding Flow Gate
  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={handleFinishOnboarding}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    );
  }

  const isPremiumUser = subscription?.entitlement === 'premium';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Top App Header & Nav */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userProfile={userProfile}
        subscription={subscription}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      {/* Guest Mode Persistence Banner */}
      {!userProfile && !guestBannerDismissed && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-medium">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                You are currently in guest mode. <strong>Sign in</strong> to sync your workouts, streaks, and wearable telemetry to the cloud.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors"
              >
                Sign In Now
              </button>
              <button
                onClick={() => setGuestBannerDismissed(true)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Views Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-12">
        <div className={activeTab === 'home' ? 'block' : 'hidden'}>
          <HomeView
            userProfile={userProfile}
            workouts={workouts}
            dailyChallenges={dailyChallenges}
            recentSessions={sessions}
            subscription={subscription}
            onSelectWorkout={setInspectingWorkout}
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        </div>

        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <WorkoutsView
            workouts={workouts}
            favoriteIds={favoriteWorkoutIds}
            isPremium={isPremiumUser}
            onSelectWorkout={setInspectingWorkout}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        <div className={activeTab === 'progress' ? 'block' : 'hidden'}>
          <ProgressView
            userProfile={userProfile}
            sessions={sessions}
            onNavigateWorkouts={() => setActiveTab('workouts')}
          />
        </div>

        <div className={activeTab === 'coach' ? 'block' : 'hidden'}>
          <AiCoachView
            userProfile={userProfile}
            subscription={subscription}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onNavigateWorkouts={() => setActiveTab('workouts')}
          />
        </div>

        <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
          <ProfileView
            userProfile={userProfile}
            achievements={achievements}
            subscription={subscription}
            notes={notes}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenHealthSync={() => setIsHealthSyncOpen(true)}
            onOpenLegal={handleOpenLegal}
            onProfileUpdated={setUserProfile}
            onNoteAdded={(n) => setNotes(prev => [n, ...prev])}
          />
        </div>
      </main>

      {/* Workout Details Modal */}
      {inspectingWorkout && (
        <WorkoutDetailsModal
          workout={inspectingWorkout}
          isFavorite={favoriteWorkoutIds.includes(inspectingWorkout.workoutId)}
          isPremiumUser={isPremiumUser}
          onToggleFavorite={() => handleToggleFavorite(inspectingWorkout.workoutId)}
          onStartWorkout={() => handleStartWorkout(inspectingWorkout)}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onClose={() => setInspectingWorkout(null)}
        />
      )}

      {/* Active Workout Session Modal (Live Player) */}
      {activeWorkoutToRun && (
        <ActiveWorkoutModal
          workout={activeWorkoutToRun}
          userId={userProfile ? userProfile.userId : 'guest'}
          onCompleteSession={handleCompleteActiveSession}
          onClose={() => setActiveWorkoutToRun(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setUserProfile(profile);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        userId={userProfile ? userProfile.userId : 'guest'}
        onClose={() => setIsPaywallOpen(false)}
        onSuccess={(sub) => {
          setSubscription(sub);
        }}
        onOpenSimulator={() => {
          setIsPaywallOpen(false);
          setIsSimulatorOpen(true);
        }}
        onOpenLegal={handleOpenLegal}
      />

      {/* QA Subscription Simulator Modal */}
      <SubscriptionSimulator
        isOpen={isSimulatorOpen}
        userId={userProfile ? userProfile.userId : 'guest'}
        userProfile={userProfile}
        currentSubscription={subscription}
        onClose={() => setIsSimulatorOpen(false)}
        onStatusUpdated={(sub) => setSubscription(sub)}
      />

      {/* Health & Wearables Synchronization Modal */}
      <HealthSyncModal
        isOpen={isHealthSyncOpen}
        userId={userProfile ? userProfile.userId : 'guest'}
        onClose={() => setIsHealthSyncOpen(false)}
      />

      {/* Store Compliance & Legal Documentation Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
        userId={userProfile?.userId}
        onAccountDeleted={() => {
          setUserProfile(null);
          setSubscription(null);
          setSessions([]);
          setNotes([]);
        }}
      />
    </div>
  );
}
