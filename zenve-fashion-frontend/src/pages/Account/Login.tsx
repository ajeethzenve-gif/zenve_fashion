import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Crown,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface LoginProps {
  defaultForgotPassword?: boolean;
}

type RecoveryStep = 'request_otp' | 'verify_and_reset' | 'success';

export const Login: React.FC<LoginProps> = ({ defaultForgotPassword = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(defaultForgotPassword);

  // OTP & Reset Password State
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('request_otp');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password });
    if (success) {
      navigate(from, { replace: true });
    }
  };


  // Step 1: Send OTP to registered mail id
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = recoveryEmail.trim();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setRecoveryError('Please enter a valid registered email address.');
      return;
    }

    setIsSubmittingRecovery(true);
    setRecoveryError(null);

    try {
      await authService.sendPasswordResetOtp(targetEmail);
      setRecoveryStep('verify_and_reset');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to dispatch verification OTP. Please try again.';
      setRecoveryError(msg);
    } finally {
      setIsSubmittingRecovery(false);
    }
  };


  // Step 2: Verify OTP and update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (!otp.trim() || otp.trim().length < 4) {
      setRecoveryError('Please enter the verification OTP code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('Confirm password does not match the new password. Please verify.');
      return;
    }

    setIsSubmittingRecovery(true);

    try {
      await authService.verifyOtpAndUpdatePassword(recoveryEmail, otp, newPassword);
      setRecoveryStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP code or verification failed. Please try again.';
      setRecoveryError(msg);
    } finally {
      setIsSubmittingRecovery(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmittingRecovery(true);
    setRecoveryError(null);
    try {
      await authService.sendPasswordResetOtp(recoveryEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to resend verification OTP. Please try again.';
      setRecoveryError(msg);
    } finally {
      setIsSubmittingRecovery(false);
    }
  };

  const handleProceedToSignIn = () => {
    setEmail(recoveryEmail);
    setPassword(newPassword);
    setIsForgotPassword(false);
    setRecoveryStep('request_otp');
    setRecoveryError(null);
  };

  return (
    <div className="w-full bg-[#00140D] min-h-[85vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-[#001C13] border border-[#E4BD5A]/30 p-8 sm:p-10 space-y-6 text-left shadow-2xl relative">
        
        {/* Subtle Gold Corner Accents */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#E4BD5A]/40" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#E4BD5A]/40" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#E4BD5A]/40" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#E4BD5A]/40" />

        {/* FORGOT PASSWORD VIEW */}
        {isForgotPassword ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setRecoveryStep('request_otp');
                setRecoveryError(null);
                clearError();
              }}
              className="inline-flex items-center space-x-2 text-xs text-[#E4BD5A] hover:text-[#F5F0DF] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            {/* STEP 1: REQUEST OTP */}
            {recoveryStep === 'request_otp' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A]/40 flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-[#E4BD5A]" />
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Recover Atelier Access</h1>
                  <p className="text-xs text-[#B8B9A8]">
                    Enter your registered email address to receive a secure 6-digit verification OTP.
                  </p>
                </div>

                {recoveryError && (
                  <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => {
                          setRecoveryEmail(e.target.value);
                          setRecoveryError(null);
                        }}
                        className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                        placeholder="e.g. your registered email"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingRecovery}
                      className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
                    >
                      <span>{isSubmittingRecovery ? 'SENDING OTP...' : 'SEND VERIFICATION OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: VERIFY OTP + NEW PASSWORD + CONFIRM PASSWORD */}
            {recoveryStep === 'verify_and_reset' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A]/40 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#E4BD5A]" />
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Update Password</h1>
                  <p className="text-xs text-[#B8B9A8]">
                    Enter the OTP code dispatched to <span className="text-[#F5F0DF] font-mono">{recoveryEmail}</span> and set your new password.
                  </p>
                </div>

                {/* Verification Dispatched Notice */}
                <div className="p-3.5 bg-[#002418] border border-[#E4BD5A]/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#E4BD5A] uppercase tracking-wider font-semibold">
                      Verification Code Dispatched
                    </span>
                    <Mail className="w-3.5 h-3.5 text-[#E4BD5A]" />
                  </div>
                  <p className="text-[11px] text-[#F5F0DF]/90">
                    A 6-digit verification code has been dispatched to{' '}
                    <span className="text-[#E4BD5A] font-mono">{recoveryEmail}</span>. Please check your inbox.
                  </p>
                </div>

                {recoveryError && (
                  <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                  {/* 1. OTP Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block tracking-wider uppercase text-[#B8B9A8]">
                        6-Digit Verification OTP *
                      </label>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[11px] text-[#E4BD5A] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/[^0-9]/g, ''));
                          setRecoveryError(null);
                        }}
                        className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] font-mono tracking-[0.3em] placeholder:tracking-normal focus:outline-none focus:border-[#E4BD5A] transition-colors"
                        placeholder="e.g. 123456"
                      />
                    </div>
                  </div>

                  {/* 2. New Password */}
                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setRecoveryError(null);
                        }}
                        className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-10 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                        placeholder="•••••••• (Min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B9A8] hover:text-[#E4BD5A] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 3. Confirm Password */}
                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setRecoveryError(null);
                        }}
                        className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-10 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B9A8] hover:text-[#E4BD5A] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingRecovery}
                      className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
                    >
                      <span>{isSubmittingRecovery ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryStep('request_otp');
                        setRecoveryError(null);
                      }}
                      className="text-xs text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors cursor-pointer"
                    >
                      Use a different email address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {recoveryStep === 'success' && (
              <div className="space-y-6">
                <div className="p-5 bg-[#002B1D] border border-[#E4BD5A]/50 rounded-sm space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A] flex items-center justify-center text-[#E4BD5A] shadow-[0_0_16px_rgba(228,189,90,0.3)]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="font-serif text-2xl text-[#F5F0DF]">Password Updated Successfully</h2>
                    <p className="text-xs text-[#B8B9A8] leading-relaxed">
                      Your atelier credentials for <span className="text-[#E4BD5A] font-mono">{recoveryEmail}</span> have been renewed.
                    </p>
                  </div>

                  <div className="p-3 bg-[#00170F] border border-[#E4BD5A]/25 text-xs text-center space-y-1">
                    <span className="text-[10px] text-[#B8B9A8] uppercase tracking-wider block">
                      Account Status:
                    </span>
                    <span className="text-[#E4BD5A] font-semibold tracking-wider uppercase font-mono">
                      ✓ Ready for Atelier Sign In
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToSignIn}
                  className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
                >
                  <span>SIGN IN WITH NEW PASSWORD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD LOGIN VIEW */
          <>
            <div className="text-center space-y-2">
              <img src="/logo/zenve-logo.png" alt="ZENVE" className="h-12 w-auto mx-auto" />
              <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Sign In to Zenve</h1>
              <p className="text-xs text-[#B8B9A8]">Access your private wardrobe and atelier order tracking.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Traditional Form Login */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block tracking-wider uppercase text-[#B8B9A8]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setRecoveryEmail(email);
                      setRecoveryStep('request_otp');
                      setRecoveryError(null);
                      setIsForgotPassword(true);
                    }}
                    className="text-[11px] text-[#E4BD5A] hover:underline tracking-wider font-medium cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'VERIFYING...' : 'ENTER ATELIER'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E4BD5A]/15 text-center text-xs">
              <p className="text-[#B8B9A8]">
                Do not have an account?{' '}
                <Link to="/register" className="text-[#E4BD5A] hover:underline">
                  Create an Invitation Account
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

