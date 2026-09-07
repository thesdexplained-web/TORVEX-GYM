import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  RefreshCw,
  Edit2,
  ChevronDown
} from 'lucide-react';
import { AuthenticationService } from '../services/authService';
import { UserProfile } from '../types';
import { COUNTRY_CODES, CountryOption } from '../data/countryCodes';

interface AuthModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  onClose: () => void;
  onSuccess: (profile?: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  isMandatory = false,
  onClose, 
  onSuccess 
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_CODES[0]);
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [step, setStep] = useState<'PHONE_ENTRY' | 'OTP_VERIFICATION'>('PHONE_ENTRY');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'OTP_VERIFICATION') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Phone number sanitization and validation
  const handlePhoneChange = (val: string) => {
    // Only allow digits and spaces
    const cleanDigits = val.replace(/\D/g, '');
    setRawPhoneNumber(cleanDigits);

    if (phoneError) {
      setPhoneError(null);
    }
  };

  const validatePhoneNumber = (): { isValid: boolean; fullFormatted: string; error?: string } => {
    const trimmed = rawPhoneNumber.trim();

    if (!trimmed) {
      return { isValid: false, fullFormatted: '', error: 'Mobile number cannot be blank. Please enter your phone number.' };
    }

    if (!/^\d+$/.test(trimmed)) {
      return { isValid: false, fullFormatted: '', error: 'Mobile number must contain digits only.' };
    }

    if (trimmed.length < 7 || trimmed.length > 15) {
      return { 
        isValid: false, 
        fullFormatted: '', 
        error: `Please enter a valid phone number (between 7 and 15 digits). For ${selectedCountry.name}, standard length is ${selectedCountry.expectedLength} digits.` 
      };
    }

    // Specific check for India / US 10-digit standard
    if ((selectedCountry.code === 'IN' || selectedCountry.code === 'US') && trimmed.length !== 10) {
      return {
        isValid: false,
        fullFormatted: '',
        error: `${selectedCountry.name} phone numbers must be exactly 10 digits (currently ${trimmed.length}).`
      };
    }

    const fullFormatted = `${selectedCountry.dialCode} ${trimmed}`;
    return { isValid: true, fullFormatted };
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validation = validatePhoneNumber();
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Invalid phone number format.');
      return;
    }

    setPhoneError(null);
    setLoading(true);

    try {
      // Simulate real SMS dispatch
      await new Promise(resolve => setTimeout(resolve, 600));

      setStep('OTP_VERIFICATION');
      setResendCooldown(45);
      setStatusMessage(`6-digit code sent via SMS to ${validation.fullFormatted}`);

      // Apple Review & QA Bypass hint
      if (rawPhoneNumber === '9999999999' || rawPhoneNumber === '9876543210') {
        setOtpDigits(['1', '2', '3', '4', '5', '6']);
      } else {
        setOtpDigits(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      setPhoneError(err?.message || 'Failed to dispatch verification SMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto advance to next box
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 filled
    if (char && index === 5 && newDigits.every(d => d !== '')) {
      verifyOtpCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');

    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setOtpError(null);

    try {
      const fullPhone = `${selectedCountry.dialCode} ${rawPhoneNumber.trim()}`;
      const userProfile = await AuthenticationService.simulatePhoneOtpVerification(fullPhone, code);
      onSuccess(userProfile);
      onClose();
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid or expired OTP code. Use code 123456 for testing.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    const inCountry = COUNTRY_CODES.find(c => c.code === 'IN') || COUNTRY_CODES[0];
    setSelectedCountry(inCountry);
    setRawPhoneNumber('9999999999');
    setPhoneError(null);
    setStep('OTP_VERIFICATION');
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setStatusMessage('Demo credentials filled: +91 9999999999 / Code: 123456');
  };

  return (
    <div 
      id="auth_modal_overlay" 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 text-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col"
      >
        {/* Modal Header */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-zinc-800/80 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                TORVEX <span className="text-amber-500">ATHLETE</span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">Instant Mobile Phone Login</p>
            </div>
          </div>

          {!isMandatory && (
            <button
              id="auth_modal_close_button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          <AnimatePresence mode="wait">
            {step === 'PHONE_ENTRY' ? (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-base font-bold text-white">Enter Mobile Number</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    No passwords needed. We'll verify you instantly with a 6-digit SMS code.
                  </p>
                </div>

                {/* Validation Error Alert */}
                {phoneError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{phoneError}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>

                    <div className="flex items-stretch gap-2">
                      {/* Country Code Dropdown */}
                      <div className="relative shrink-0 w-[105px] sm:w-[150px]">
                        <select
                          id="auth_country_selector"
                          aria-label="Select Country Code"
                          value={selectedCountry.code}
                          onChange={(e) => {
                            const found = COUNTRY_CODES.find(c => c.code === e.target.value);
                            if (found) setSelectedCountry(found);
                          }}
                          className="appearance-none w-full h-full bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-xl pl-2.5 pr-7 py-3 focus:outline-none focus:border-amber-500 cursor-pointer truncate"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code} className="bg-zinc-900 text-white py-1">
                              {c.flag} {c.dialCode} ({c.name})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>

                      {/* Phone Input */}
                      <div className="relative flex-1 min-w-0">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          id="auth_input_phone_digits"
                          type="tel"
                          inputMode="numeric"
                          autoFocus
                          value={rawPhoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder={`e.g. ${selectedCountry.code === 'IN' ? '9876543210' : '5551234567'}`}
                          maxLength={15}
                          className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-zinc-500">
                      <span>Standard {selectedCountry.name}: {selectedCountry.expectedLength} digits</span>
                      {rawPhoneNumber && (
                        <span className={rawPhoneNumber.length === selectedCountry.expectedLength ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>
                          {rawPhoneNumber.length} / {selectedCountry.expectedLength} digits
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    id="auth_get_otp_button"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Get 6-Digit OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Apple Review / QA Quick Demo Card */}
                <div className="mt-4 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Apple Review & QA Test Account
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCountry(COUNTRY_CODES[0]);
                        setRawPhoneNumber('9999999999');
                      }}
                      className="text-[10px] text-amber-500 hover:text-amber-400 underline"
                    >
                      Fill Demo Number
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Phone: <span className="text-zinc-200 font-mono">+91 9999999999</span> | Bypass OTP: <span className="text-zinc-200 font-mono">123456</span>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">Verify Phone Number</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('PHONE_ENTRY');
                        setOtpError(null);
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      Change
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Code sent to <span className="font-mono text-zinc-200 font-bold">{selectedCountry.dialCode} {rawPhoneNumber}</span>
                  </p>
                </div>

                {/* Status or Error Notice */}
                {statusMessage && !otpError && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* 6 Individual OTP Boxes */}
                <div className="flex justify-between items-center gap-1.5 sm:gap-2 max-w-full">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => (otpInputRefs.current[idx] = el)}
                      id={`otp_box_${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-10 sm:w-12 h-12 sm:h-14 shrink min-w-0 text-center text-lg sm:text-xl font-bold font-mono rounded-xl bg-zinc-950 border transition-all focus:outline-none ${
                        digit
                          ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                          : 'border-zinc-800 text-white focus:border-amber-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px] text-zinc-500">Fixed test code: 123456</span>
                  
                  {resendCooldown > 0 ? (
                    <span className="text-zinc-500">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend SMS
                    </button>
                  )}
                </div>

                <button
                  id="auth_verify_otp_button"
                  type="button"
                  onClick={() => verifyOtpCode()}
                  disabled={loading || otpDigits.some(d => d === '')}
                  className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold py-3.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Enter Torvex</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QA & Apple Review Credentials Helper */}
          <div className="pt-2 border-t border-zinc-800/60">
            <button
              id="auth_demo_fill_button"
              type="button"
              onClick={handleFillDemoCredentials}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>QA & Apple Review: Auto-fill Demo Phone (+91 99999 99999)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
