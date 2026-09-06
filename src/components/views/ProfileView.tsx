import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Trophy, 
  Flame, 
  Clock, 
  Dumbbell, 
  Sparkles, 
  HeartPulse, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  CreditCard, 
  Cpu, 
  Edit3, 
  Check, 
  BookOpenCheck,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { UserProfile, Achievement, UserSubscription, WorkoutNote } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { AuthenticationService } from '../../services/authService';
import { WorkoutService } from '../../services/workoutService';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  achievements: Achievement[];
  subscription: UserSubscription | null;
  notes: WorkoutNote[];
  onOpenAuth: () => void;
  onOpenPaywall: () => void;
  onOpenSimulator: () => void;
  onOpenHealthSync: () => void;
  onProfileUpdated: (p: UserProfile) => void;
  onNoteAdded: (note: WorkoutNote) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  achievements,
  subscription,
  notes,
  onOpenAuth,
  onOpenPaywall,
  onOpenSimulator,
  onOpenHealthSync,
  onProfileUpdated,
  onNoteAdded
}) => {
  const { theme, toggleTheme } = useTheme();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editGoal, setEditGoal] = useState(userProfile?.fitnessGoal || 'Build Muscle');
  const [editLevel, setEditLevel] = useState(userProfile?.fitnessLevel || 'Intermediate');
  const [editDays, setEditDays] = useState(userProfile?.preferredDaysPerWeek || 4);

  // New note creation state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    try {
      const updated = await AuthenticationService.updateProfileData({
        displayName: editName,
        fitnessGoal: editGoal as any,
        fitnessLevel: editLevel as any,
        preferredDaysPerWeek: editDays
      });
      onProfileUpdated(updated);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !newNoteTitle.trim()) return;

    const note = await WorkoutService.saveNote(userProfile.userId, {
      userId: userProfile.userId,
      title: newNoteTitle,
      content: newNoteContent,
      tags: ['Personal Log', 'Torvex Session']
    });
    onNoteAdded(note);
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNoteForm(false);
  };

  const handleSignOut = async () => {
    await AuthenticationService.signOut();
  };

  const isPremium = subscription?.entitlement === 'premium';
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div id="profile_view" className="space-y-6 sm:space-y-8 pb-12">
      {/* Profile Overview Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userProfile?.profileImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={userProfile?.displayName || 'Torvex Athlete'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-zinc-700 shadow-md"
                referrerPolicy="no-referrer"
              />
              {isPremium && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {userProfile?.displayName || 'Torvex Athlete'}
                </h2>
                {userProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {userProfile?.emailAddress || 'Not signed in'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {userProfile?.fitnessGoal || 'Build Muscle'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono">
                  {userProfile?.fitnessLevel || 'Intermediate'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick status & account actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {userProfile ? (
              <button
                id="profile_signout_button"
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                id="profile_signin_button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Form Popup/Drawer */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Primary Goal
              </label>
              <select
                value={editGoal}
                onChange={e => setEditGoal(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Build Muscle">Build Muscle</option>
                <option value="Lose Weight">Lose Weight</option>
                <option value="Increase Stamina">Increase Stamina</option>
                <option value="Functional Mobility">Functional Mobility</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Target Days/Wk
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={editDays}
                  onChange={e => setEditDays(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription & Telemetry Integrations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Subscription Entitlement Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Membership & RevenueCat Entitlement
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                isPremium ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {subscription?.status.replace('_', ' ').toUpperCase() || 'FREE'}
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              {isPremium ? 'Torvex Pro Athlete Pass' : 'Torvex Standard Pass'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {isPremium
                ? 'Full access to all advanced splits, AI Coach periodization, and cross-device telemetry.'
                : 'Free tier active. Upgrade to unlock all advanced hypertrophy splits and AI consultation.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <button
              id="profile_manage_subscription_button"
              onClick={onOpenPaywall}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {isPremium ? 'Manage Membership' : 'Upgrade • 7 Days Free'}
            </button>

            <button
              id="profile_open_simulator_button"
              onClick={onOpenSimulator}
              className="text-xs text-zinc-400 hover:text-amber-400 font-mono flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>QA Simulator</span>
            </button>
          </div>
        </div>

        {/* Connected Services (Apple Health & Wearables) Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Connected Wearables & Health
              </span>
              <HeartPulse className="w-4 h-4 text-emerald-400" />
            </div>

            <h3 className="text-lg font-black text-white">
              Apple Watch & Health Connect
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Synchronize resting heart rate, active calories burned, and wrist-based workout sessions.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Bridge: Firebase Sync Engine
            </span>
            <button
              id="profile_connected_services_button"
              onClick={onOpenHealthSync}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Manage Connections
            </button>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Prestige Badges & Milestones
            </h3>
            <p className="text-xs text-zinc-400">Unlock awards through training consistency</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {unlockedCount}/{achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map(ach => {
            const percent = Math.min(100, Math.round((ach.progress / ach.requirement) * 100));

            return (
              <div
                key={ach.achievementId}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  ach.isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 opacity-70'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                  ach.isUnlocked ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1">{ach.name}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {ach.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-2 mb-1">
                  <div
                    className={`h-full ${ach.isUnlocked ? 'bg-amber-500' : 'bg-zinc-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {ach.isUnlocked ? 'Unlocked' : `${ach.progress}/${ach.requirement}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout Notes Organizer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
              Athlete Workout Journal & Notes
            </h3>
            <p className="text-xs text-zinc-400">Keep personal cues, barbell weights, and session notes</p>
          </div>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleAddNote} className="mb-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
            <input
              type="text"
              required
              placeholder="Note Title (e.g. Squat Stance Adjustment)"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="Observations, fatigue levels, warmup notes..."
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Save Note
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note.noteId} className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{note.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-xs text-zinc-500 font-mono">
              No workout notes added yet. Click "+ New Note" to save training cues.
            </div>
          )}
        </div>
      </div>

      {/* Global Settings (Theme & Environment) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-black uppercase tracking-tight text-white mb-4">
          Application Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <div>
                <h4 className="font-bold text-white">Visual Interface Theme</h4>
                <p className="text-[11px] text-zinc-400">Current: {theme === 'dark' ? 'Athletic Dark' : 'Deliberate Light'}</p>
              </div>
            </div>
            <button
              id="theme_toggle_button"
              onClick={toggleTheme}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-1.5 rounded-lg font-semibold transition-colors"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <h4 className="font-bold text-white">Cloud Database Architecture</h4>
              <p className="text-[11px] text-zinc-500 font-mono">Project: torvex-gym • Status: Active</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
