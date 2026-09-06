import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  HeartPulse, 
  Watch, 
  Smartphone, 
  Activity, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ShieldCheck,
  Flame,
  Footprints
} from 'lucide-react';
import { HealthConnection, HealthConnectionState } from '../types';
import { HealthDataService } from '../services/healthService';

interface HealthSyncModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export const HealthSyncModal: React.FC<HealthSyncModalProps> = ({
  isOpen,
  userId,
  onClose
}) => {
  const [connections, setConnections] = useState<HealthConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadConnections();
    }
  }, [isOpen, userId]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const list = await HealthDataService.getConnections(userId);
      setConnections(list);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnection = async (conn: HealthConnection) => {
    const nextState: HealthConnectionState = conn.status === 'connected' ? 'disconnected' : 'connected';
    const updated = await HealthDataService.updateConnectionState(userId, conn.connectionId, nextState);
    setConnections(prev => prev.map(c => c.connectionId === conn.connectionId ? updated : c));
  };

  const handleSyncNow = async () => {
    setSyncingAll(true);
    try {
      const updated = await HealthDataService.syncAll(userId);
      setConnections(updated);
    } finally {
      setTimeout(() => setSyncingAll(false), 600);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="health_sync_modal_overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
      >
        {/* Pinned Header */}
        <div className="shrink-0 relative p-5 sm:p-6 pb-4 border-b border-zinc-800/60 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Connected Health Services
              </h3>
              <p className="text-xs text-zinc-400">
                HealthKit, Health Connect, Apple Watch & Wear OS Bridge
              </p>
            </div>
          </div>

          <button
            id="health_sync_close_button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Informational callout regarding Web telemetry sync architecture */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-zinc-200">Zero-Fake Telemetry Rule:</strong> Web interface receives cryptographically verified health packets synced via your companion Torvex mobile or watch device.
            </p>
          </div>

          {/* Connections List */}
          <div className="space-y-3">
          {connections.map(conn => {
            const isConnected = conn.status === 'connected';
            const Icon = conn.provider.includes('watch') ? Watch : conn.provider === 'wear_os' ? Watch : Smartphone;

            return (
              <div 
                key={conn.connectionId}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{conn.providerName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                        <span className="text-xs text-zinc-400 font-mono capitalize">
                          {conn.status.replace('_', ' ')}
                        </span>
                        {conn.lastSyncedAt && isConnected && (
                          <span className="text-[10px] text-zinc-500">
                            • Synced {new Date(conn.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      id={`health_toggle_${conn.connectionId}`}
                      onClick={() => handleToggleConnection(conn)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isConnected
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-zinc-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm shadow-emerald-500/20'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect API'}
                    </button>
                  </div>
                </div>

                {/* Telemetry preview when connected */}
                {isConnected && (
                  <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-zinc-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Steps</span>
                      <span className="font-mono font-bold text-white">{conn.metricsSynced.steps.toLocaleString()}</span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Active Kcal</span>
                      <span className="font-mono font-bold text-amber-400">{conn.metricsSynced.activeCalories}</span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Heart Rate</span>
                      <span className="font-mono font-bold text-rose-400">{conn.metricsSynced.heartRateBpm} bpm</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* Pinned Footer Actions */}
        <div className="shrink-0 p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <button
            id="health_sync_all_button"
            disabled={syncingAll}
            onClick={handleSyncNow}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin text-amber-400' : ''}`} />
            <span>{syncingAll ? 'Syncing Telemetry...' : 'Sync Telemetry Now'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
