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
import { NotificationService } from './services/notificationService';
import { SyncService } from './services/syncService';
import { 
  UserProfile, 
  Workout, 
  WorkoutSession, 
  DailyChallenge, 
  Achievement, 
  UserSubscription, 
  WorkoutNote,
  WorkoutCategory
} from './types';
import { INITIAL_WORKOUTS } from './data/initialCatalog';
import { AlertCircle, Clock, Lock, Sparkles } from 'lucide-react';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return AuthenticationService.getCurrentUser();
  });
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

  // Active Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isHealthSyncOpen, setIsHealthSyncOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');
  const [inspectingWorkout, setInspectingWorkout] = useState<Workout | null>(null);
  const [activeWorkoutToRun, setActiveWorkoutToRun] = useState<Workout | null>(null);
  const [workoutDisciplineFilter, setWorkoutDisciplineFilter] = useState<WorkoutCategory | 'All'>('All');

  const handleSelectDisciplineFromHome = (discipline: string) => {
    setWorkoutDisciplineFilter(discipline as (WorkoutCategory | 'All'));
    setActiveTab('workouts');
  };

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
      // Graceful fallback
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
        setIsAuthModalOpen(false);
        await loadUserData(profile.userId);
      } else {
        // Guest mode removed: User must log in to access the app
        setSubscription(null);
        setSessions([]);
        setNotes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Live Cloud Workouts
  useEffect(() => {
    const unsub = WorkoutService.subscribeToWorkouts((updatedWorkouts) => {
      setWorkouts(prev => {
        if (
          prev.length === updatedWorkouts.length &&
          prev.every((w, i) => w.workoutId === updatedWorkouts[i]?.workoutId && w.title === updatedWorkouts[i]?.title)
        ) {
          return prev;
        }
        return updatedWorkouts;
      });
    });

    return () => unsub();
  }, []);

  // Daily Challenges for current user
  useEffect(() => {
    if (!userProfile) return;
    const initChallenges = async () => {
      const chs = await ChallengeService.getDailyChallenges(userProfile.userId);
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

      // Check notification triggers for 15, 7, 3, 1 days remaining
      const freeStatus = SubscriptionService.getFreeMonthStatus(sub);
      NotificationService.checkAndFireReminders(freeStatus);
    } catch (err) {
      console.error('Failed to load user state from database:', err);
    }
  };

  // Check 1-Month Free status & Day 31 Hard Lock
  const freeMonthStatus = SubscriptionService.getFreeMonthStatus(subscription);
  const isSubscriptionExpired = Boolean(
    userProfile && 
    (freeMonthStatus.isExpired || subscription?.status === 'expired') && 
    subscription?.status !== 'premium_active'
  );

  // Trigger hard lock paywall immediately if free month expired
  useEffect(() => {
    if (isSubscriptionExpired) {
      setIsPaywallOpen(true);
    }
  }, [isSubscriptionExpired]);

  const handleFinishSplash = () => {
    sessionStorage.setItem('torvex_splash_shown', 'true');
    setShowSplash(false);
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('torvex_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleToggleFavorite = async (workoutId: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    const isCurrentlyFav = favoriteWorkoutIds.includes(workoutId);
    setFavoriteWorkoutIds(prev => 
      isCurrentlyFav ? prev.filter(id => id !== workoutId) : [...prev, workoutId]
    );
    await WorkoutService.toggleFavoriteWorkout(userProfile.userId, workoutId, isCurrentlyFav);
    const updated = await WorkoutService.getFavoriteWorkoutIds(userProfile.userId);
    setFavoriteWorkoutIds(updated);
  };

  const handleStartWorkout = (workout: Workout) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check if subscription has expired (Day 31 hard lock)
    if (isSubscriptionExpired) {
      setIsPaywallOpen(true);
      return;
    }

    const isLocked = workout.isPremiumOnly && !SubscriptionService.isPremium(subscription);
    if (isLocked) {
      setIsPaywallOpen(true);
      return;
    }

    setInspectingWorkout(null);
    setActiveWorkoutToRun(workout);
  };

  const handleCompleteActiveSession = useCallback(async (newSession: WorkoutSession) => {
    if (!userProfile) return;
    
    // 1. Optimistically update session history immediately for instant UI feedback
    setSessions(prev => {
      const exists = prev.some(s => s.sessionId === newSession.sessionId);
      if (exists) {
        return prev.map(s => s.sessionId === newSession.sessionId ? newSession : s);
      }
      return [newSession, ...prev];
    });

    // 2. Optimistically update profile metrics (Workout Count, Minutes, Calories, Streak)
    const updatedProfile: UserProfile = {
      ...userProfile,
      totalWorkoutCount: userProfile.totalWorkoutCount + 1,
      totalWorkoutMinutes: userProfile.totalWorkoutMinutes + Math.round(newSession.durationSeconds / 60),
      totalCaloriesBurned: userProfile.totalCaloriesBurned + newSession.caloriesBurned,
      currentStreak: Math.max(1, userProfile.currentStreak),
      lastWorkoutDate: newSession.completedAt || new Date().toISOString()
    };
    setUserProfile(updatedProfile);

    // 3. Automatically navigate back to dashboard
    setActiveTab('home');

    // 4. Concurrently fetch fresh server state from Firestore to ensure exact synchronization
    try {
      const [freshSessions, achs, chs] = await Promise.all([
        SessionService.getUserSessions(userProfile.userId),
        AchievementService.getUserAchievements(userProfile.userId),
        ChallengeService.getDailyChallenges(userProfile.userId)
      ]);
      if (freshSessions && freshSessions.length > 0) {
        setSessions(freshSessions);
      }
      const freshProfile = AuthenticationService.getCurrentUser();
      if (freshProfile) {
        setUserProfile(freshProfile);
      }
      setAchievements(achs);
      setDailyChallenges(chs);
    } catch (e) {
      console.warn('Post-workout refresh background sync notice:', e);
    }
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

  const isPremiumUser = SubscriptionService.isPremium(subscription);

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

      {/* 1-Month Free Access Countdown & Notification Reminder Banner (15, 7, 3, 1 Days) */}
      {userProfile && freeMonthStatus.reminderNotice && !isSubscriptionExpired && (
        <div 
          id="free_month_reminder_banner"
          className="border-b bg-zinc-900/90 px-4 py-2.5 transition-all shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono ${freeMonthStatus.reminderNotice.badgeClass}`}>
                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                {freeMonthStatus.daysRemaining} {freeMonthStatus.daysRemaining === 1 ? 'DAY' : 'DAYS'} REMAINING
              </span>
              <span className="text-zinc-200 font-medium">
                {freeMonthStatus.reminderNotice.message}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                id="reminder_view_plans_button"
                onClick={() => setIsPaywallOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 fill-zinc-950" />
                <span>View Plans</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Views Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-12">
        {/* If user is not logged in: Show Mandatory Login Gate Banner */}
        {!userProfile ? (
          <div 
            id="mandatory_login_gate_card"
            className="my-8 max-w-md mx-auto p-6 sm:p-8 bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-2xl text-center space-y-4"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Sign In to Torvex
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Login is required to access your workouts, progress telemetry, and personal training splits. Every new user receives <strong>1 Month Free Access</strong> to all Pro features upon signing in.
            </p>
            <button
              id="gate_signin_button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              Sign In with Mobile Number
            </button>
          </div>
        ) : (
          <>
            <div className={activeTab === 'home' ? 'block' : 'hidden'}>
              <HomeView
                userProfile={userProfile}
                workouts={workouts}
                dailyChallenges={dailyChallenges}
                recentSessions={sessions}
                subscription={subscription}
                onSelectWorkout={setInspectingWorkout}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
                onSelectDiscipline={handleSelectDisciplineFromHome}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenPaywall={() => setIsPaywallOpen(true)}
              />
            </div>

            <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
              <WorkoutsView
                workouts={workouts}
                favoriteIds={favoriteWorkoutIds}
                isPremium={isPremiumUser}
                selectedCategoryFilter={workoutDisciplineFilter}
                onCategoryFilterChange={(cat) => setWorkoutDisciplineFilter(cat)}
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
          </>
        )}
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
      {activeWorkoutToRun && userProfile && (
        <ActiveWorkoutModal
          workout={activeWorkoutToRun}
          userId={userProfile.userId}
          onCompleteSession={handleCompleteActiveSession}
          onClose={() => setActiveWorkoutToRun(null)}
        />
      )}

      {/* Authentication Modal - Mandatory when not logged in */}
      <AuthModal
        isOpen={isAuthModalOpen || !userProfile}
        isMandatory={!userProfile}
        onClose={() => {
          if (userProfile) {
            setIsAuthModalOpen(false);
          }
        }}
        onSuccess={(profile) => {
          if (profile) {
            setUserProfile(profile);
            setIsAuthModalOpen(false);
            loadUserData(profile.userId);
          }
        }}
      />

      {/* Paywall Modal - Hard lock when expired or requested by user */}
      <PaywallModal
        isOpen={isPaywallOpen}
        userId={userProfile?.userId || ''}
        isExpired={isSubscriptionExpired}
        onClose={() => {
          if (!isSubscriptionExpired) {
            setIsPaywallOpen(false);
          }
        }}
        onSuccess={(sub) => {
          setSubscription(sub);
          setIsPaywallOpen(false);
        }}
        onOpenSimulator={() => {
          setIsSimulatorOpen(true);
        }}
        onOpenLegal={handleOpenLegal}
      />

      {/* QA Subscription Simulator Modal */}
      <SubscriptionSimulator
        isOpen={isSimulatorOpen}
        userId={userProfile?.userId || 'qa_athlete_test'}
        userProfile={userProfile}
        currentSubscription={subscription}
        onClose={() => setIsSimulatorOpen(false)}
        onStatusUpdated={(sub) => setSubscription(sub)}
      />

      {/* Health & Wearables Synchronization Modal */}
      <HealthSyncModal
        isOpen={isHealthSyncOpen}
        userId={userProfile?.userId || ''}
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
