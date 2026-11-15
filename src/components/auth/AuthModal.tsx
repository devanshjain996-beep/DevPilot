// ============================================================================
// DevPilot — Authentication Modal (Google OAuth, Phone OTP, Account Linking)
// ============================================================================
import { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button, Input } from '../ui';

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    isConfigured,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    user,
    linkPhone,
    verifyPhoneLink,
    authError,
    clearAuthError,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'options' | 'phone-input' | 'phone-otp'>('options');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetState = () => {
    setAuthMode('options');
    setOtpCode('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // 1. Google OAuth Sign-in
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    const { error } = await loginWithGoogle();
    setIsLoading(false);
    if (error) {
      setErrorMsg(error.message);
    }
  };

  // 2. Send Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid phone number with country code (e.g. +91 9876543210)');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    if (user) {
      // Linking phone to existing account
      const { error } = await linkPhone(phoneNumber);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`OTP sent to ${phoneNumber}`);
        setAuthMode('phone-otp');
      }
    } else {
      // Direct phone sign-in / registration
      const { error } = await sendPhoneOtp(phoneNumber);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`OTP sent to ${phoneNumber}`);
        setAuthMode('phone-otp');
      }
    }
  };

  // 3. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP received via SMS.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    if (user) {
      const { error } = await verifyPhoneLink(phoneNumber, otpCode);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Phone number verified and linked successfully!');
        setTimeout(() => handleClose(), 1500);
      }
    } else {
      const { error } = await verifyPhoneOtp(phoneNumber, otpCode);
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => handleClose(), 1200);
      }
    }
  };

  // Mock Developer Login (for local test/preview before Supabase env vars are set)
  const handleDevMockLogin = () => {
    const mockUser = {
      id: 'dev-owner-001',
      email: 'devanshjain996@gmail.com',
      phone: '+919999999999',
      displayName: 'Devansh Jain (Admin)',
      isGoogleVerified: true,
      isPhoneVerified: true,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem('devpilot_mock_user', JSON.stringify(mockUser));
    window.location.reload();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={user ? 'Link Phone Number' : 'Sign in to DevPilot'}
    >
      <div className="space-y-4">
        {/* Status Banners */}
        {(errorMsg || authError) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authentication Notice</span>
              <span>{errorMsg || authError}</span>
            </div>
            {authError && (
              <button
                type="button"
                onClick={clearAuthError}
                className="text-red-400 hover:text-red-300 text-[10px] underline ml-1 cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isConfigured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <HelpCircle size={14} />
              <span>Cloud Configuration Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Supabase environment variables (<code className="bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>) are not yet configured in production.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleDevMockLogin}
                className="px-2.5 py-1 bg-amber-500 text-slate-900 font-bold rounded-lg text-[11px] hover:bg-amber-400 cursor-pointer transition-all flex items-center gap-1"
              >
                <Sparkles size={12} /> Test / Login as Administrator (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: INITIAL OPTIONS ── */}
        {authMode === 'options' && (
          <div className="space-y-3 pt-1">
            {!user && (
              <>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-400">or</span>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setAuthMode('phone-input')}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Phone size={18} />
              <span>{user ? 'Verify & Link Phone Number' : 'Continue with Phone Number'}</span>
            </button>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Zero Password, High Security</span>
              </div>
              <p className="text-[11px]">
                Your account is protected using official Google OAuth OpenID Connect and cryptographic SMS OTP verification. Your private study logs and timetable are strictly protected with Row-Level Security.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: PHONE INPUT ── */}
        {authMode === 'phone-input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Phone Number
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                required
                autoFocus
                className="font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Include country code (e.g. +91 for India, +1 for USA).
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAuthMode('options')}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading} size="sm">
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── STEP 3: OTP VERIFICATION ── */}
        {authMode === 'phone-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Enter 6-Digit OTP Code
              </label>
              <Input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
                className="text-center font-mono text-lg tracking-widest"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sent to <span className="font-semibold text-slate-300">{phoneNumber}</span>.{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('phone-input')}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  Change number
                </button>
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAuthMode('phone-input')}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading} size="sm">
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Verify & Continue
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
