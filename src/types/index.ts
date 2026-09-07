/**
 * TORVEX GYM - Core Domain Types and Interfaces
 * Professional, strongly-typed fitness domain model
 */

export type WorkoutDifficulty = 'Zero Level' | 'Beginner' | 'Intermediate' | 'Advanced';

export type WorkoutCategory = 
  | 'Full Body' 
  | 'Upper Body' 
  | 'Lower Body' 
  | 'Strength' 
  | 'Cardio' 
  | 'Core' 
  | 'Mobility'
  | 'Yoga';

export type ExerciseDifficulty = 'Zero Level' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  category: WorkoutCategory;
  targetMuscles: string[];
  equipmentNeeded: string;
  difficulty?: ExerciseDifficulty;
  durationSeconds?: number;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  defaultRestSeconds: number;
  description?: string;
  instructions: string[];
  tips?: string;
  imageUrl?: string;
  gifUrl?: string;
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string[];
  sets: number;
  reps: number;
  weightKg: number;
  restSeconds: number;
  difficulty?: ExerciseDifficulty;
  instructions: string[];
  description?: string;
  imageUrl?: string;
  gifUrl?: string;
}

export interface Workout {
  workoutId: string;
  title: string;
  description: string;
  category: WorkoutCategory;
  difficulty: WorkoutDifficulty;
  durationMinutes: number;
  targetMuscles: string[];
  exerciseCount: number;
  exercises: WorkoutExerciseItem[];
  estimatedCalories: number;
  imageUrl: string;
  isPremiumOnly: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseSetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: string;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string[];
  sets: ExerciseSetLog[];
  completed: boolean;
  notes?: string;
}

export interface WorkoutSession {
  sessionId: string;
  userId: string;
  workoutId: string;
  workoutTitle: string;
  category: WorkoutCategory;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  caloriesBurned: number;
  currentExerciseIndex: number;
  completedExerciseCount: number;
  totalExerciseCount: number;
  exerciseLogs: ExerciseSessionLog[];
  sourceDevice: 'Web' | 'iPhone' | 'Android' | 'Apple Watch' | 'Wear OS';
  completionStatus: 'in_progress' | 'completed' | 'abandoned';
  notes?: string;
  syncedAt?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  emailAddress: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutCount: number;
  totalWorkoutMinutes: number;
  totalCaloriesBurned: number;
  fitnessGoal?: 'Build Muscle' | 'Lose Weight' | 'Increase Stamina' | 'Functional Mobility';
  fitnessLevel?: WorkoutDifficulty;
  preferredDaysPerWeek?: number;
  heightCm?: number;
  weightKg?: number;
}

export interface StreakRecord {
  streakId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  workoutsCompleted: number;
  minutesLogged: number;
  caloriesLogged: number;
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: 'Workouts' | 'Streaks' | 'Calories' | 'Milestones';
  icon: string;
  requirement: number;
  unit: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallenge {
  challengeId: string;
  userId?: string;
  title: string;
  description: string;
  challengeDate: string; // YYYY-MM-DD
  metric: 'workouts' | 'minutes' | 'calories' | 'exercises';
  targetValue: number;
  currentValue: number;
  completionStatus: 'pending' | 'completed';
  completedAt?: string;
  rewardPoints: number;
}

export interface UserGoal {
  goalId: string;
  userId: string;
  title: string;
  metric: 'weekly_workouts' | 'weekly_minutes' | 'weekly_calories';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
}

export type SubscriptionPlanType = 'monthly' | 'six_months' | 'yearly';

export type SubscriptionStatus = 
  | 'free' 
  | 'trial_active' 
  | 'premium_active' 
  | 'expired' 
  | 'billing_issue' 
  | 'cancelled' 
  | 'grace_period';

export interface UserSubscription {
  userId: string;
  entitlement: 'free' | 'premium';
  status: SubscriptionStatus;
  productId: string;
  planType: SubscriptionPlanType;
  platform: 'web' | 'ios' | 'android';
  trialActive: boolean;
  trialStart?: string;
  trialEnd?: string;
  purchaseDate?: string;
  expirationDate?: string;
  autoRenew: boolean;
  willRenew: boolean;
  lastSyncedAt?: string;
  freeMonthActive?: boolean;
  freeMonthStart?: string;
  freeMonthEnd?: string;
}

export interface FreeMonthStatus {
  isWithinFreeMonth: boolean;
  isExpired: boolean;
  daysRemaining: number;
  startDate: string;
  endDate: string;
  reminderNotice: {
    tier: 15 | 7 | 3 | 1 | 0;
    title: string;
    message: string;
    badgeClass: string;
  } | null;
}

export interface SubscriptionProduct {
  productId: string;
  planType: SubscriptionPlanType;
  title: string;
  priceDisplay: string;
  priceValueInINR: number;
  billingPeriodMonths: number;
  badge?: string;
  effectiveMonthlyPriceDisplay: string;
  description: string;
}

export type HealthConnectionState = 
  | 'not_connected' 
  | 'connecting' 
  | 'permission_required' 
  | 'connected' 
  | 'permission_denied' 
  | 'disconnected' 
  | 'syncing' 
  | 'sync_error';

export interface HealthConnection {
  connectionId: string;
  userId: string;
  provider: 'apple_health' | 'health_connect' | 'apple_watch' | 'wear_os';
  providerName: string;
  status: HealthConnectionState;
  lastSyncedAt?: string;
  permissions: string[];
  metricsSynced: {
    steps: number;
    activeCalories: number;
    heartRateBpm: number;
    restingHeartRateBpm: number;
    syncedWorkoutsCount: number;
  };
}

export interface WorkoutNote {
  noteId: string;
  userId: string;
  workoutId?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: 'workout_reminder' | 'challenge' | 'achievement' | 'streak' | 'subscription';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AiCoachRecommendation {
  id: string;
  title: string;
  focus: string;
  recommendation: string;
  suggestedWorkoutId?: string;
  reason: string;
  difficultyAdjustment?: string;
}
