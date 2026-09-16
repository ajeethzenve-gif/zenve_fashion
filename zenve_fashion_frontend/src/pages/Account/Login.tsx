import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
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

type RecoveryStep =
  | 'request_otp'
  | 'verify_and_reset'
  | 'success';

type LoginType = 'email' | 'mobile';

export const Login: React.FC<LoginProps> = ({
  defaultForgotPassword = false,
}) => {


  const [loginType, setLoginType] =
    useState<LoginType>('email');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [isSendingOtp, setIsSendingOtp] =
    useState(false);

  const [isVerifyingOtp, setIsVerifyingOtp] =
    useState(false);

  const [mobileError, setMobileError] =
    useState<string | null>(null);


  const [isForgotPassword, setIsForgotPassword] =
    useState(defaultForgotPassword);

  const [recoveryStep, setRecoveryStep] =
    useState<RecoveryStep>('request_otp');

  const [recoveryEmail, setRecoveryEmail] =
    useState('');

  const [recoveryOtp, setRecoveryOtp] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [recoveryError, setRecoveryError] =
    useState<string | null>(null);

  const [isSubmittingRecovery, setIsSubmittingRecovery] =
    useState(false);


  const {
    login,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as {
      from?: { pathname: string };
    })?.from?.pathname || '/account';


  const handleEmailLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearError();

    if (!email.trim()) {
      return;
    }

    if (!password) {
      return;
    }

    const success = await login({
      email: email.trim(),
      password,
    });

    if (success) {
      navigate(from, {
        replace: true,
      });
    }
  };


  const handleSendMobileOtp = async () => {
    clearError();
    setMobileError(null);

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setMobileError('Please enter your mobile phone number.');
      return;
    }

    const phoneNumber = cleanPhone.replace(
      /[\s-]/g,
      ''
    );

    const validPhone =
      /^(\+91|91)?[6-9]\d{9}$/.test(
        phoneNumber
      ) || phoneNumber.length >= 10;

    if (!validPhone) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);

    try {
      await authService.sendMobileOtp(
        cleanPhone
      );

      setOtpSent(true);
      setOtp('');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to send OTP. Please try again.';
      setMobileError(msg);
      console.error(
        'Send mobile OTP error:',
        err
      );
    } finally {
      setIsSendingOtp(false);
    }
  };



  const handleVerifyMobileOtp = async () => {
    clearError();
    setMobileError(null);

    if (!phone.trim()) {
      setMobileError('Please enter your mobile phone number.');
      return;
    }

    if (otp.length !== 6) {
      setMobileError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const res =
        await authService.verifyMobileOtp(
          phone.trim(),
          otp
        );

      if (res && res.token) {
        useAuthStore.setState({
          user: res.user,
          token: res.token,
          isAuthenticated: true,
          isLoading: false,
        });

        navigate(from, {
          replace: true,
        });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid or expired OTP. Please check and try again.';
      setMobileError(msg);
      console.error(
        'Verify mobile OTP error:',
        err
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  const handleResendMobileOtp = async () => {
    if (!phone.trim()) {
      return;
    }

    setIsSendingOtp(true);
    clearError();

    try {
      await authService.sendMobileOtp(
        phone.trim()
      );

      setOtp('');
      setOtpSent(true);
    } catch (err: any) {
      console.error(
        'Resend OTP error:',
        err
      );
    } finally {
      setIsSendingOtp(false);
    }
  };


  const handleLoginTypeChange = (
    type: LoginType
  ) => {
    setLoginType(type);

    clearError();

    setOtpSent(false);
    setOtp('');

    if (type === 'email') {
      setPhone('');
    } else {
      setEmail('');
      setPassword('');
    }
  };


  const handleForgotPassword = () => {
    clearError();

    setRecoveryEmail(email);

    setRecoveryStep(
      'request_otp'
    );

    setRecoveryError(null);

    setIsForgotPassword(true);
  };



  const handleSendPasswordResetOtp =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      const targetEmail =
        recoveryEmail.trim();

      if (
        !targetEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          targetEmail
        )
      ) {
        setRecoveryError(
          'Please enter a valid registered email address.'
        );

        return;
      }

      setIsSubmittingRecovery(true);
      setRecoveryError(null);

      try {
        await authService.sendPasswordResetOtp(
          targetEmail
        );

        setRecoveryStep(
          'verify_and_reset'
        );
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to send OTP. Please try again.';

        setRecoveryError(message);
      } finally {
        setIsSubmittingRecovery(false);
      }
    };


  const handleUpdatePassword =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setRecoveryError(null);

      if (
        !recoveryOtp.trim() ||
        recoveryOtp.trim().length !== 6
      ) {
        setRecoveryError(
          'Please enter the 6-digit verification OTP.'
        );

        return;
      }

      if (
        !newPassword ||
        newPassword.length < 6
      ) {
        setRecoveryError(
          'Password must contain at least 6 characters.'
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setRecoveryError(
          'Passwords do not match.'
        );

        return;
      }

      setIsSubmittingRecovery(true);

      try {
        await authService.verifyOtpAndUpdatePassword(
          recoveryEmail,
          recoveryOtp,
          newPassword
        );

        setRecoveryStep('success');
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Invalid OTP or password update failed.';

        setRecoveryError(message);
      } finally {
        setIsSubmittingRecovery(false);
      }
    };


  const handleResendPasswordOtp =
    async () => {
      setIsSubmittingRecovery(true);
      setRecoveryError(null);

      try {
        await authService.sendPasswordResetOtp(
          recoveryEmail
        );
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to resend OTP.';

        setRecoveryError(message);
      } finally {
        setIsSubmittingRecovery(false);
      }
    };


  const handleBackToLogin = () => {
    setIsForgotPassword(false);

    setRecoveryStep(
      'request_otp'
    );

    setRecoveryError(null);

    setRecoveryOtp('');
    setNewPassword('');
    setConfirmPassword('');

    clearError();
  };


  const handleProceedToSignIn = () => {
    setEmail(recoveryEmail);
    setPassword('');

    setLoginType('email');

    setIsForgotPassword(false);

    setRecoveryStep(
      'request_otp'
    );

    setRecoveryError(null);
  };


  return (
    <div className="w-full bg-[#00140D] min-h-[85vh] flex items-center justify-center py-16 px-4">

      <div className="max-w-md w-full bg-[#001C13] border border-[#E4BD5A]/30 p-8 sm:p-10 space-y-6 text-left shadow-2xl relative">

        {/* Corner Accents */}

        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#E4BD5A]/40" />

        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#E4BD5A]/40" />

        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#E4BD5A]/40" />

        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#E4BD5A]/40" />


        {isForgotPassword ? (

          <div className="space-y-6">

            <button
              type="button"
              onClick={
                handleBackToLogin
              }
              className="inline-flex items-center space-x-2 text-xs text-[#E4BD5A] hover:text-[#F5F0DF] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />

              <span>
                Back to Sign In
              </span>
            </button>


            {recoveryStep ===
              'request_otp' && (

                <div className="space-y-6">

                  <div className="text-center space-y-2">

                    <div className="w-12 h-12 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A]/40 flex items-center justify-center">

                      <KeyRound className="w-6 h-6 text-[#E4BD5A]" />

                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">
                      Recover Atelier Access
                    </h1>

                    <p className="text-xs text-[#B8B9A8]">
                      Enter your registered email address to receive a secure verification OTP.
                    </p>

                  </div>

                  {recoveryError && (

                    <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">

                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />

                      <span>
                        {recoveryError}
                      </span>

                    </div>

                  )}

                  <form
                    onSubmit={
                      handleSendPasswordResetOtp
                    }
                    className="space-y-4 text-xs"
                  >

                    <div>

                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                        Registered Email Address
                      </label>

                      <div className="relative">

                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                        <input
                          type="email"
                          required
                          value={
                            recoveryEmail
                          }
                          onChange={(e) => {
                            setRecoveryEmail(
                              e.target.value
                            );

                            setRecoveryError(
                              null
                            );
                          }}
                          className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                          placeholder="name@example.com"
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmittingRecovery
                      }
                      className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
                    >

                      <span>
                        {isSubmittingRecovery
                          ? 'SENDING OTP...'
                          : 'SEND VERIFICATION OTP'}
                      </span>

                      <ArrowRight className="w-4 h-4" />

                    </button>

                  </form>

                </div>
              )}


            {recoveryStep ===
              'verify_and_reset' && (

                <div className="space-y-6">

                  <div className="text-center space-y-2">

                    <div className="w-12 h-12 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A]/40 flex items-center justify-center">

                      <ShieldCheck className="w-6 h-6 text-[#E4BD5A]" />

                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">
                      Update Password
                    </h1>

                    <p className="text-xs text-[#B8B9A8]">
                      Enter the OTP sent to{' '}
                      <span className="text-[#E4BD5A]">
                        {recoveryEmail}
                      </span>
                    </p>

                  </div>

                  {recoveryError && (

                    <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">

                      <AlertCircle className="w-4 h-4 text-red-400" />

                      <span>
                        {recoveryError}
                      </span>

                    </div>

                  )}

                  <form
                    onSubmit={
                      handleUpdatePassword
                    }
                    className="space-y-4 text-xs"
                  >


                    <div>

                      <div className="flex items-center justify-between mb-1.5">

                        <label className="block tracking-wider uppercase text-[#B8B9A8]">
                          Verification OTP
                        </label>

                        <button
                          type="button"
                          onClick={
                            handleResendPasswordOtp
                          }
                          className="text-[11px] text-[#E4BD5A] hover:underline flex items-center space-x-1 cursor-pointer"
                        >

                          <RotateCcw className="w-3 h-3" />

                          <span>
                            Resend OTP
                          </span>

                        </button>

                      </div>

                      <div className="relative">

                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={
                            recoveryOtp
                          }
                          onChange={(e) =>
                            setRecoveryOtp(
                              e.target.value.replace(
                                /\D/g,
                                ''
                              )
                            )
                          }
                          className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] font-mono tracking-[0.3em] focus:outline-none focus:border-[#E4BD5A]"
                          placeholder="123456"
                        />

                      </div>

                    </div>


                    <div>

                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                        New Password
                      </label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                        <input
                          type={
                            showNewPassword
                              ? 'text'
                              : 'password'
                          }
                          required
                          minLength={6}
                          value={
                            newPassword
                          }
                          onChange={(e) =>
                            setNewPassword(
                              e.target.value
                            )
                          }
                          className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-10 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                          placeholder="••••••••"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B9A8] cursor-pointer"
                        >

                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}

                        </button>

                      </div>

                    </div>


                    <div>

                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                        Confirm New Password
                      </label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                        <input
                          type={
                            showConfirmPassword
                              ? 'text'
                              : 'password'
                          }
                          required
                          minLength={6}
                          value={
                            confirmPassword
                          }
                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }
                          className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-10 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                          placeholder="••••••••"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B9A8] cursor-pointer"
                        >

                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}

                        </button>

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmittingRecovery
                      }
                      className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
                    >

                      <span>
                        {isSubmittingRecovery
                          ? 'UPDATING PASSWORD...'
                          : 'UPDATE PASSWORD'}
                      </span>

                      <ArrowRight className="w-4 h-4" />

                    </button>

                  </form>

                </div>
              )}


            {recoveryStep ===
              'success' && (

                <div className="space-y-6">

                  <div className="p-5 bg-[#002B1D] border border-[#E4BD5A]/50 space-y-4">

                    <div className="w-14 h-14 mx-auto rounded-full bg-[#002418] border border-[#E4BD5A] flex items-center justify-center text-[#E4BD5A]">

                      <CheckCircle2 className="w-7 h-7" />

                    </div>

                    <div className="text-center">

                      <h2 className="font-serif text-2xl text-[#F5F0DF]">
                        Password Updated
                      </h2>

                      <p className="text-xs text-[#B8B9A8] mt-2">
                        Your password has been successfully updated.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleProceedToSignIn
                    }
                    className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
                  >

                    <span>
                      SIGN IN WITH NEW PASSWORD
                    </span>

                    <ArrowRight className="w-4 h-4" />

                  </button>

                </div>
              )}

          </div>

        ) : (



          <>


            <div className="text-center space-y-2">

              <img
                src="/logo/zenve-logo.png"
                alt="ZENVE"
                className="h-12 w-auto mx-auto"
              />

              <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">
                Sign In to Zenve
              </h1>

              <p className="text-xs text-[#B8B9A8]">
                Access your private wardrobe and atelier order tracking.
              </p>

            </div>


            {error && (

              <div className="p-3 bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-start space-x-2">

                <AlertCircle className="w-4 h-4 flex-shrink-0" />

                <span>
                  {error}
                </span>

              </div>

            )}


            {loginType === 'email' && (

              <form
                onSubmit={handleEmailLogin}
                className="space-y-4 text-xs"
              >


                <div>

                  <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Login With
                  </label>

                  <div className="grid grid-cols-2 border border-[#E4BD5A]/30">

                    <button
                      type="button"
                      onClick={() =>
                        handleLoginTypeChange(
                          'email'
                        )
                      }
                      className="py-2.5 text-xs tracking-wider uppercase bg-[#E4BD5A] text-[#00140D] font-bold cursor-pointer"
                    >
                      Email
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleLoginTypeChange(
                          'mobile'
                        )
                      }
                      className="py-2.5 text-xs tracking-wider uppercase bg-[#002B1D] text-[#B8B9A8] hover:text-[#F5F0DF] cursor-pointer"
                    >
                      Mobile Number
                    </button>

                  </div>

                </div>


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
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      placeholder="name@example.com"
                    />

                  </div>

                </div>


                <div>

                  <div className="flex items-center justify-between mb-1.5">

                    <label className="tracking-wider uppercase text-[#B8B9A8]">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={
                        handleForgotPassword
                      }
                      className="text-[11px] text-[#E4BD5A] hover:underline cursor-pointer"
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
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
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

                    <span>
                      {isLoading
                        ? 'VERIFYING...'
                        : 'ENTER ATELIER'}
                    </span>

                    <ArrowRight className="w-4 h-4" />

                  </button>

                </div>

              </form>

            )}



            {loginType === 'mobile' && (

              <div className="space-y-4 text-xs">

                {mobileError && (
                  <div className="p-3 bg-red-900/30 border border-red-500/40 text-red-200 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{mobileError}</span>
                  </div>
                )}


                <div>

                  <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Login With
                  </label>

                  <div className="grid grid-cols-2 border border-[#E4BD5A]/30">

                    <button
                      type="button"
                      onClick={() =>
                        handleLoginTypeChange(
                          'email'
                        )
                      }
                      className="py-2.5 text-xs tracking-wider uppercase bg-[#002B1D] text-[#B8B9A8] hover:text-[#F5F0DF] cursor-pointer"
                    >
                      Email
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleLoginTypeChange(
                          'mobile'
                        )
                      }
                      className="py-2.5 text-xs tracking-wider uppercase bg-[#E4BD5A] text-[#00140D] font-bold cursor-pointer"
                    >
                      Mobile Number
                    </button>

                  </div>

                </div>


                <div>

                  <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(
                          e.target.value
                        );

                        setOtpSent(false);
                        setOtp('');
                        clearError();
                      }}
                      className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      placeholder="+91 98450 12345"
                    />

                  </div>

                  <p className="text-[10px] text-[#B8B9A8] mt-1.5">
                    We'll send a verification OTP to this number.
                  </p>

                </div>


                {!otpSent && (

                  <button
                    type="button"
                    onClick={
                      handleSendMobileOtp
                    }
                    disabled={
                      isSendingOtp
                    }
                    className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer"
                  >

                    <span>
                      {isSendingOtp
                        ? 'SENDING OTP...'
                        : 'SEND OTP'}
                    </span>

                    <ArrowRight className="w-4 h-4" />

                  </button>

                )}


                {otpSent && (

                  <div className="space-y-4">

                    <div className="p-3 bg-[#002418] border border-[#E4BD5A]/30">

                      <p className="text-[10px] text-[#E4BD5A] uppercase tracking-wider">
                        OTP Sent
                      </p>

                      <p className="text-[11px] text-[#B8B9A8] mt-1">
                        A 6-digit OTP has been sent to{' '}
                        <span className="text-[#F5F0DF]">
                          {phone}
                        </span>
                      </p>

                    </div>


                    <div>

                      <div className="flex items-center justify-between mb-1.5">

                        <label className="tracking-wider uppercase text-[#B8B9A8]">
                          Verification OTP
                        </label>

                        <button
                          type="button"
                          onClick={
                            handleResendMobileOtp
                          }
                          disabled={
                            isSendingOtp
                          }
                          className="text-[11px] text-[#E4BD5A] hover:underline flex items-center space-x-1 cursor-pointer"
                        >

                          <RotateCcw className="w-3 h-3" />

                          <span>
                            {isSendingOtp
                              ? 'SENDING...'
                              : 'Resend OTP'}
                          </span>

                        </button>

                      </div>

                      <div className="relative">

                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E4BD5A]" />

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(
                                /\D/g,
                                ''
                              )
                            )
                          }
                          className="w-full bg-[#002B1D] border border-[#E4BD5A]/30 pl-10 pr-3 py-3 text-xs text-[#F5F0DF] font-mono tracking-[0.3em] focus:outline-none focus:border-[#E4BD5A]"
                          placeholder="123456"
                        />

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={
                        handleVerifyMobileOtp
                      }
                      disabled={
                        isVerifyingOtp ||
                        otp.length !== 6
                      }
                      className="w-full btn-gold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer"
                    >

                      <span>
                        {isVerifyingOtp
                          ? 'VERIFYING OTP...'
                          : 'VERIFY OTP'}
                      </span>

                      <CheckCircle2 className="w-4 h-4" />

                    </button>

                  </div>

                )}


                <div className="text-center pt-1">

                  <button
                    type="button"
                    onClick={() =>
                      handleLoginTypeChange(
                        'email'
                      )
                    }
                    className="text-[11px] text-[#B8B9A8] hover:text-[#E4BD5A] cursor-pointer"
                  >
                    ← Login with Email instead
                  </button>

                </div>

              </div>

            )}


            <div className="pt-4 border-t border-[#E4BD5A]/15 text-center text-xs">

              <p className="text-[#B8B9A8]">

                Do not have an account?{' '}

                <Link
                  to="/register"
                  className="text-[#E4BD5A] hover:underline"
                >
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