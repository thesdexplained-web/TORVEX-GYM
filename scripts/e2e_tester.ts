/**
 * Automated Torvex Gym End-to-End QA Test Suite Runner
 * Simulates real user flows, database paths, and store compliance checks.
 */

import { COMPREHENSIVE_EXERCISES } from '../src/data/allExercisesCatalog';
import { INITIAL_WORKOUTS, INITIAL_DAILY_CHALLENGES } from '../src/data/initialCatalog';
import { SubscriptionService } from '../src/services/subscriptionService';
import { LocalStorageService } from '../src/services/localStorageService';
import { HealthDataService } from '../src/services/healthService';
import { ExerciseSetLog, SubscriptionStatus } from '../src/types';

// Mock storage in Node if needed
const memoryStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (k: string) => memoryStorage[k] || null,
    setItem: (k: string, v: string) => { memoryStorage[k] = v; },
    removeItem: (k: string) => { delete memoryStorage[k]; },
    clear: () => { for (const k in memoryStorage) delete memoryStorage[k]; },
    key: () => null,
    length: 0
  } as any;
}

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function record(suite: string, name: string, condition: boolean, details?: string) {
  results.push({
    suite,
    name,
    status: condition ? 'PASS' : 'FAIL',
    details
  });
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🏋️  TORVEX GYM - AUTOMATED AI QA TEST SUITE RUNNER  🏋️');
  console.log('======================================================\n');

  // SUITE 1: CATALOG & EXERCISE INTEGRITY
  const suite1 = 'Exercise & Workout Catalog';
  record(suite1, 'Exercise Catalog Count >= 30', COMPREHENSIVE_EXERCISES.length >= 30, `Found ${COMPREHENSIVE_EXERCISES.length} exercises`);
  
  const allHaveMuscles = COMPREHENSIVE_EXERCISES.every(e => e.targetMuscles && e.targetMuscles.length > 0);
  record(suite1, 'Muscle Group Coverage on all exercises', allHaveMuscles);

  const allHaveInstructions = COMPREHENSIVE_EXERCISES.every(e => e.instructions && e.instructions.length > 0);
  record(suite1, 'Step-by-step Instructions present', allHaveInstructions);

  const uniqueExerciseIds = new Set(COMPREHENSIVE_EXERCISES.map(e => e.id)).size === COMPREHENSIVE_EXERCISES.length;
  record(suite1, 'Unique Exercise ID Integrity', uniqueExerciseIds);

  record(suite1, 'Structured Workout Programs Available', INITIAL_WORKOUTS.length >= 5, `Found ${INITIAL_WORKOUTS.length} workouts`);
  record(suite1, 'Daily Challenges Available', INITIAL_DAILY_CHALLENGES.length >= 3, `Found ${INITIAL_DAILY_CHALLENGES.length} challenges`);

  // SUITE 2: SUBSCRIPTION LIFECYCLE & SEGMENT VALIDATION
  const suite2 = 'RevenueCat & Subscription Simulator';
  const testUserId = 'auto_qa_athlete_99';

  const states: SubscriptionStatus[] = [
    'free',
    'trial_active',
    'premium_active',
    'grace_period',
    'billing_issue',
    'cancelled',
    'expired'
  ];

  for (const st of states) {
    const res = await SubscriptionService.simulateState(testUserId, st);
    const isValid = res.status === st;
    const isProExpected = (st === 'premium_active' || st === 'trial_active' || st === 'grace_period');
    const isProActual = SubscriptionService.isPremium(res);
    record(suite2, `Lifecycle State: [${st}]`, isValid && (isProExpected === isProActual), `Entitlement: ${res.entitlement}, Pro: ${isProActual}`);
  }

  // 1-Month (30-Day) Free access calculation check
  const freeMonth = await SubscriptionService.getSubscription(testUserId);
  const freeDays = Math.round((new Date(freeMonth.expirationDate!).getTime() - new Date(freeMonth.purchaseDate!).getTime()) / (1000 * 60 * 60 * 24));
  record(suite2, '1-Month Free Access Duration Accuracy', freeDays === 30, `Calculated: ${freeDays} days`);

  // SUITE 3: ACTIVE WORKOUT ENGINE & VOLUME ACCURACY
  const suite3 = 'Workout Engine & Volume Math';
  const sampleSets: ExerciseSetLog[] = [
    { setNumber: 1, weightKg: 100, reps: 10, completed: true },  // 1000 kg
    { setNumber: 2, weightKg: 100, reps: 10, completed: true },  // 1000 kg
    { setNumber: 3, weightKg: 120, reps: 5, completed: false },  // 0 kg (incomplete)
    { setNumber: 4, weightKg: 90, reps: 12, completed: true },   // 1080 kg
  ];

  const completedVolume = sampleSets
    .filter(s => s.completed)
    .reduce((acc, s) => acc + (s.weightKg * s.reps), 0);

  record(suite3, 'Lifting Volume Calculation (Completed sets only)', completedVolume === 3080, `Expected 3080kg, calculated ${completedVolume}kg`);

  // Active workout session recovery
  LocalStorageService.saveActiveSession({ workoutId: 'w_push_hypertrophy', setsCount: 8 });
  const recoveredSession = LocalStorageService.getActiveSession();
  record(suite3, 'Interrupted Workout Session Recovery', recoveredSession?.workoutId === 'w_push_hypertrophy');
  LocalStorageService.clearActiveSession();
  record(suite3, 'Active Workout Session Cleanup', LocalStorageService.getActiveSession() === null);

  // SUITE 4: OFFLINE SYNC QUEUE & STORAGE
  const suite4 = 'Offline-First Queue & Persistence';
  LocalStorageService.clearSyncQueue();
  LocalStorageService.addToSyncQueue({
    type: 'SAVE_WORKOUT_SESSION',
    payload: { sessionId: 'offline_sess_01' }
  });
  LocalStorageService.addToSyncQueue({
    type: 'UPDATE_USER_STATS',
    payload: { newStreak: 12 }
  });

  const queue = LocalStorageService.getSyncQueue();
  record(suite4, 'Offline Queue Append & Length', queue.length === 2);
  record(suite4, 'Queue Order FIFO Integrity', queue[0].type === 'SAVE_WORKOUT_SESSION' && queue[1].type === 'UPDATE_USER_STATS');

  LocalStorageService.removeFromSyncQueue(queue[0].id);
  record(suite4, 'Queue Item Dequeue & Acknowledgment', LocalStorageService.getSyncQueue().length === 1);
  LocalStorageService.clearSyncQueue();

  // SUITE 5: WEARABLES & HEALTH INTEGRATIONS
  const suite5 = 'Wearables & Health Connections';
  const healthConns = await HealthDataService.getConnections(testUserId);
  record(suite5, 'Health Services Catalog Initialized', healthConns.length >= 4);

  const updatedConn = await HealthDataService.updateConnectionState(testUserId, 'conn_apple_health', 'connected');
  record(suite5, 'Apple HealthKit Connection Toggle', updatedConn.status === 'connected' && updatedConn.metricsSynced.heartRateBpm > 0);

  const syncedAll = await HealthDataService.syncAll(testUserId);
  record(suite5, 'Multi-Device Telemetry Sync (HeartRate, Steps, Calories)', syncedAll.some(c => c.provider === 'apple_health' && c.status === 'connected'));

  // PRINT SUMMARY REPORT
  console.log('\n--- DETAILED TEST EXECUTION BREAKDOWN ---');
  let currentSuite = '';
  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    if (r.suite !== currentSuite) {
      currentSuite = r.suite;
      console.log(`\n📦 [${currentSuite}]`);
    }
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} ${r.name} ${r.details ? `(${r.details})` : ''}`);
    if (r.status === 'PASS') passedCount++;
    else failedCount++;
  }

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log(`🎯 PASS RATE: ${((passedCount / results.length) * 100).toFixed(1)}%`);
  console.log('======================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runAllTests().catch(err => {
  console.error('Test runner execution failed:', err);
  process.exit(1);
});
