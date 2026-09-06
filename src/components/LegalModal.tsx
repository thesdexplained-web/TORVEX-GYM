import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Trash2, 
  HelpCircle, 
  AlertTriangle, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  Lock, 
  HeartHandshake,
  Database
} from 'lucide-react';
import { AuthenticationService } from '../services/authService';

export type LegalTab = 'privacy' | 'terms' | 'deletion' | 'support';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  userId?: string | null;
  onAccountDeleted?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
  userId,
  onAccountDeleted
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDeleteConfirmText('');
      setDeleteError(null);
      setDeleteSuccess(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (userId) {
        await AuthenticationService.deleteUserData(userId);
      }
      // Also clear local cached domain data
      localStorage.clear();
      setDeleteSuccess(true);
      setTimeout(() => {
        if (onAccountDeleted) onAccountDeleted();
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err?.message || 'Failed to complete data deletion. Please contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <div 
      id="legal_compliance_modal_overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>TORVEX GYM</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Compliance & Legal
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Official App Store, Google Play & Web Legal Documentation
              </p>
            </div>
          </div>
          <button
            id="legal_modal_close_button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="shrink-0 flex items-center gap-1 p-2 bg-zinc-950 border-b border-zinc-800 overflow-x-auto text-xs font-semibold">
          <button
            id="legal_tab_privacy"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            id="legal_tab_terms"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use (EULA)</span>
          </button>

          <button
            id="legal_tab_support"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & FAQ</span>
          </button>

          <button
            id="legal_tab_deletion"
            onClick={() => setActiveTab('deletion')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'deletion'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Data & Account Deletion</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-zinc-300 leading-relaxed font-sans">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div id="legal_content_privacy" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Last Updated: September 2026 • Version 1.0.0
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  GDPR & CCPA Compliant
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">1. Overview & Commitment</h3>
                <p>
                  TORVEX GYM ("we", "our", or "the App") is committed to safeguarding your personal and athletic data. This Privacy Policy explains how information is collected, encrypted, stored, and utilized when you use the TORVEX GYM web application, Progressive Web App (PWA), and native mobile applications.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">2. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong className="text-zinc-200">Account Credentials:</strong> Email address, display name, and authentication tokens provided securely via Firebase Authentication (Google Sign-In or Email authentication).</li>
                  <li><strong className="text-zinc-200">Fitness & Training Metrics:</strong> Logged workout sessions, exercise reps, weight, sets, estimated active calories, target heart rate zones, workout duration, and personal notes.</li>
                  <li><strong className="text-zinc-200">Device & Usage Diagnostics:</strong> Device model, operating system version, and anonymous performance logs to ensure stability across Android, iOS, and modern desktop browsers.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">3. Health Data & Apple Health / Health Connect</h3>
                <p>
                  TORVEX GYM treats all biometric and workout statistics as confidential. We do not sell your health or fitness logs to third-party advertisers, data brokers, or advertising networks. Fitness data is solely used to calculate volume, strength progression, and AI coaching recommendations.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">4. Cloud Storage & Encryption</h3>
                <p>
                  Your data is securely persisted using Google Cloud Platform & Firebase Firestore with encrypted transit (TLS 1.3) and encrypted rest (AES-256). Access control is strictly enforced via Firestore Security Rules verifying ownership (<code className="text-amber-400">request.auth.uid == userId</code>).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">5. User Privacy Rights</h3>
                <p>
                  Under international privacy laws (including GDPR and CCPA), you have the right to inspect, export, correct, or permanently erase your personal data at any time. You can initiate complete deletion directly from the "Data & Account Deletion" tab inside this app.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">6. Developer & Privacy Inquiries</h3>
                <p>
                  For questions regarding our privacy practices or data processing, please contact the developer at:
                </p>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-2 text-zinc-300 font-mono">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>thesdexplained@gmail.com</span>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS OF USE (EULA) */}
          {activeTab === 'terms' && (
            <div id="legal_content_terms" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Standard End User License Agreement (EULA)
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  Apple & Google Compliant
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">1. Agreement to Terms</h3>
                <p>
                  By accessing or using TORVEX GYM, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the application.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">2. Medical & Exercise Disclaimer</h3>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-200/90">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    TORVEX GYM is an athletic tracking and self-guided workout companion. It does not provide medical advice, clinical diagnoses, or physical therapy. Consult a qualified physician prior to beginning any high-intensity weight training or cardiovascular exercise program.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">3. Subscriptions & Billing Terms</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li><strong className="text-zinc-200">Free Trial:</strong> New subscribers may receive a 7-day introductory trial. Unless cancelled at least 24 hours before the trial ends, your account will be charged the selected subscription rate.</li>
                  <li><strong className="text-zinc-200">Auto-Renewal:</strong> Subscriptions automatically renew unless auto-renew is cancelled at least 24 hours before the end of the current billing cycle.</li>
                  <li><strong className="text-zinc-200">Cancellation:</strong> For iOS purchases, manage or cancel your subscription anytime via your Apple ID Account Settings. For Android purchases, manage via Google Play Subscriptions. For Web purchases, manage via your Account Profile.</li>
                  <li><strong className="text-zinc-200">Refunds:</strong> In-app purchases are subject to the standard refund policies of Apple App Store and Google Play Store respectively.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">4. License Grant</h3>
                <p>
                  TORVEX GYM grants you a personal, revocable, non-exclusive, non-transferable license to use the application for individual fitness tracking in accordance with these Terms.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: SUPPORT & FAQ */}
          {activeTab === 'support' && (
            <div id="legal_content_support" className="space-y-4">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Official Support Center</h3>
                <p>
                  Need assistance with your workouts, subscription status, or bug reports? Our technical team is available to help.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-500" />
                      Email Support
                    </h4>
                    <p className="text-zinc-400 mt-1">Direct support inquiries and technical feedback:</p>
                    <a 
                      href="mailto:thesdexplained@gmail.com?subject=TORVEX%20GYM%20Support" 
                      className="text-amber-400 hover:underline font-mono text-[11px] mt-1 block"
                    >
                      thesdexplained@gmail.com
                    </a>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-400" />
                      Cloud Services Status
                    </h4>
                    <p className="text-zinc-400 mt-1">Firestore Database & Auth:</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      100% Operational
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Frequently Asked Questions</h3>

                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                  <h4 className="font-bold text-white">How do I restore my Pro subscription?</h4>
                  <p className="text-zinc-400 mt-1">
                    Open the Paywall or Subscription screen and click "Restore Purchases". If you previously purchased a plan under the same Google Play, Apple ID, or email, your entitlement will automatically be re-activated.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                  <h4 className="font-bold text-white">Can I use TORVEX GYM offline?</h4>
                  <p className="text-zinc-400 mt-1">
                    Yes! All 33+ comprehensive exercises, routines, timers, and active workout tracking run locally without an internet connection. Once you reconnect, data auto-syncs to the secure cloud.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: DATA & ACCOUNT DELETION (MANDATORY APPLE & GOOGLE COMPLIANCE) */}
          {activeTab === 'deletion' && (
            <div id="legal_content_deletion" className="space-y-4">
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Permanent Account & Data Erasure</span>
                </div>
                <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
                  In compliance with Apple App Store Guideline 5.1.1(v) and Google Play User Data policies, users have the right to completely and permanently delete their account and all associated fitness records.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">What Data Will Be Deleted?</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Your user profile, email address, display name, and avatar.</li>
                  <li>All saved workout sessions, heart rate logs, sets, and calorie metrics.</li>
                  <li>Custom workouts, personal notes, and achievement unlocks.</li>
                  <li>Local offline cache and synchronization tokens on your device.</li>
                </ul>
              </section>

              {deleteSuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Account Successfully Erased</h4>
                  <p className="text-xs text-zinc-300">
                    All your records have been permanently wiped from the database and local storage. Reloading application...
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Confirm Deletion Request
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    This action is <strong className="text-rose-400">irreversible</strong>. To confirm, please type <code className="bg-zinc-800 text-rose-300 px-1.5 py-0.5 rounded font-mono">DELETE</code> in the field below:
                  </p>

                  <input
                    id="account_delete_confirm_input"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => {
                      setDeleteConfirmText(e.target.value);
                      setDeleteError(null);
                    }}
                    placeholder='Type "DELETE" here'
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-mono"
                  />

                  {deleteError && (
                    <p className="text-xs text-rose-400 font-semibold">{deleteError}</p>
                  )}

                  <button
                    id="account_delete_submit_button"
                    disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                    onClick={handleDeleteAccount}
                    className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Permanently Erase My Account & Data</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">TORVEX GYM • Official Release</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
