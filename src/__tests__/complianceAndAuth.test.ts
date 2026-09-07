import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { LocalStorageService } from '../services/localStorageService';
import { HealthDataService } from '../services/healthService';

// Mock localStorage for Node test runner
const mockStorage: Record<string, string> = {};
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => {
        for (const k in mockStorage) {
          delete mockStorage[k];
        }
      },
      key: (index: number) => Object.keys(mockStorage)[index] || null,
      length: 0
    } as Storage;
  }
});

describe('Store Compliance, Health Integrations, & Onboarding Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should verify onboarding completion state persists in storage', () => {
    expect(LocalStorageService.hasCompletedOnboarding()).toBe(false);
    LocalStorageService.setCompletedOnboarding(true);
    expect(LocalStorageService.hasCompletedOnboarding()).toBe(true);
  });

  it('should initialize health connections with Apple Health, Health Connect, Apple Watch, and Wear OS', async () => {
    const userId = 'qa_health_athlete';
    const connections = await HealthDataService.getConnections(userId);

    expect(connections.length).toBeGreaterThanOrEqual(4);
    const providers = connections.map(c => c.provider);
    expect(providers).toContain('apple_health');
    expect(providers).toContain('health_connect');
    expect(providers).toContain('apple_watch');
    expect(providers).toContain('wear_os');

    for (const c of connections) {
      expect(c.connectionId).toBeTruthy();
      expect(c.providerName).toBeTruthy();
      expect(c.status).toBeDefined();
      expect(c.permissions.length).toBeGreaterThan(0);
    }
  });

  it('should update health connection state to connected and disconnected', async () => {
    const userId = 'qa_health_athlete_2';
    const updated = await HealthDataService.updateConnectionState(userId, 'conn_apple_health', 'connected');
    expect(updated.status).toBe('connected');
    expect(updated.lastSyncedAt).toBeDefined();
    expect(updated.metricsSynced.heartRateBpm).toBe(138);

    const disconnected = await HealthDataService.updateConnectionState(userId, 'conn_apple_health', 'not_connected');
    expect(disconnected.status).toBe('not_connected');
  });

  it('should support multi-device telemetry synchronization via syncAll', async () => {
    const userId = 'qa_health_athlete_3';
    // Connect apple health first
    await HealthDataService.updateConnectionState(userId, 'conn_apple_health', 'connected');

    const syncedList = await HealthDataService.syncAll(userId);
    expect(syncedList.length).toBeGreaterThanOrEqual(4);

    const appleHealth = syncedList.find(c => c.provider === 'apple_health');
    expect(appleHealth?.status).toBe('connected');
    expect(appleHealth?.lastSyncedAt).toBeDefined();
  });
});
