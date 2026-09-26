import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface LoginFormProps {
  onOpenSupabaseConfig?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password' | 'reset_password';

export const LoginForm: React.FC<LoginFormProps> = () => {
  const {
    loginWithEmail,
    signupWithEmail,
    resendConfirmationEmail,
    resetPasswordForEmail,
    updateUserPassword,
    isPasswordRecovery,
    setIsPasswordRecovery,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Automatically activate reset_password mode if arriving from recovery link
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset_password');
      setErrorMessage('');
      setSuccessNotice('Security verification confirmed. Enter your new password below.');
    }
  }, [isPasswordRecovery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    // 1. FORGOT PASSWORD MODE
    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address to receive the password reset link.');
        return;
      }
      setIsLoading(true);
      try {
        const result = await resetPasswordForEmail(email.trim());
        if (result.success) {
          setSuccessNotice(
            `Password reset link has been sent to ${email.trim()}. Please check your Gmail Inbox and Spam folder to change your password.`
          );
        } else {
          setErrorMessage(result.error || 'Failed to send password reset email. Please try again.');
        }
      } catch {
        setErrorMessage('An unexpected error occurred while requesting password reset.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. SET NEW PASSWORD MODE
    if (mode === 'reset_password') {
      if (!password) {
        setErrorMessage('Please enter your new password.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        const result = await updateUserPassword(password);
        if (result.success) {
          setSuccessNotice('Your password has been changed successfully! Redirecting...');
          setTimeout(() => {
            setIsPasswordRecovery(false);
            setMode('signin');
            setPassword('');
            setConfirmPassword('');
          }, 1500);
        } else {
          setErrorMessage(result.error || 'Failed to update password.');
        }
      } catch {
        setErrorMessage('An unexpected error occurred while updating your password.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 3. SIGN IN & SIGN UP MODES
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const result = await loginWithEmail(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Invalid email or password.');
        }
      } else {
        const result = await signupWithEmail(email, password, fullName);
        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
        } else if (result.requireVerification) {
          setSuccessNotice(
            'Account created! A confirmation email has been sent. Please check your inbox or sign in.'
          );
          setMode('signin');
        }
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email above to resend verification.');
      return;
    }
    setIsResending(true);
    const res = await resendConfirmationEmail(email);
    setIsResending(false);
    if (res.success) {
      setSuccessNotice('Confirmation email resent! Please check your Gmail Inbox & Spam folder.');
      setErrorMessage('');
    } else {
      setErrorMessage(res.error || 'Failed to resend confirmation email.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all">
        {/* Top brand glow line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />

        {/* Back Button for Forgot Password & Reset Password */}
        {(mode === 'forgot_password' || mode === 'reset_password') && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessNotice('');
                setIsPasswordRecovery(false);
              }}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Sign In vs Sign Up Tabs (Only shown in standard auth modes) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex items-center p-1 bg-blue-100/70 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessNotice('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Mode Headers */}
        <div className="text-center mb-6">
          {mode === 'forgot_password' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mx-auto mb-3 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Forgot Password? 🔑
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Enter your registered Gmail or email address and we'll send a password reset link to your inbox.
              </p>
            </>
          ) : mode === 'reset_password' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Set New Password 🔒
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Enter your new password below to regain full access to your SASH dashboard.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {mode === 'signin' ? 'Welcome Back 👋' : 'Create Your Account 🎯'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'signin'
                  ? 'Enter your Gmail or email and password to continue'
                  : 'Start your high-performance schedule management today'}
              </p>
            </>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-2.5 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>

            {errorMessage.toLowerCase().includes('not confirmed') && (
              <div className="pt-2 border-t border-rose-500/20 space-y-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Please verify your email address to continue:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Check your <strong>Gmail Inbox & Spam</strong> for the confirmation link.</li>
                  <li>Click <strong>Resend Email</strong> below if you didn't receive it.</li>
                </ul>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Notification */}
        {successNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs space-y-2 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{successNotice}</span>
            </div>

            {mode === 'forgot_password' && (
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className="font-bold text-emerald-800 dark:text-emerald-200 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="text-emerald-700 dark:text-emerald-300 hover:underline text-[11px] font-semibold"
                >
                  Resend Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan, Karthik"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
              />
            </div>
          )}

          {/* Email / Gmail (All modes except reset_password) */}
          {mode !== 'reset_password' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Gmail / Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus={mode === 'signin' || mode === 'forgot_password'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Password (Sign In & Sign Up) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Password</span>
                </label>

                {/* FORGOT PASSWORD LINK IN LOGIN PAGE */}
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage('');
                      setSuccessNotice('');
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password & Confirm Password (Reset Password Mode) */}
          {mode === 'reset_password' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>New Password (min 6 chars)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Action Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={
              mode === 'forgot_password' ? (
                <Mail className="w-4 h-4" />
              ) : mode === 'reset_password' ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
          >
            {mode === 'signin'
              ? 'Sign In to Dashboard'
              : mode === 'signup'
              ? 'Create My Account'
              : mode === 'forgot_password'
              ? 'Send Reset Link to Email'
              : 'Update Password & Sign In'}
          </Button>
        </form>

        {/* Security badge */}
        <div className="mt-5 pt-4 border-t border-blue-200/70 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-500" />
          <span>Secured with Supabase PostgreSQL Auth</span>
        </div>
      </div>
    </div>
  );
};
