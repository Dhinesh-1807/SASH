import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getSupabase, getSupabaseCredentials } from '../lib/supabase';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Calendar,
  Database,
  Check,
  Volume2,
  Sparkles,
  Lock,
  KeyRound,
  Mail,
  AlertCircle,
} from 'lucide-react';

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { profile, user, updateUserProfile, resetPasswordForEmail, updateUserPassword } = useAuth();
  const { isConfigured } = getSupabaseCredentials();
  const { prefs, updatePrefs, permission, requestPermission, testNotification } = useNotifications();

  const [timezone, setTimezone] = useState(
    profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  );
  const [weekStartsOn, setWeekStartsOn] = useState<'Monday' | 'Sunday'>(
    profile?.week_starts_on || 'Monday'
  );

  const [savedMessage, setSavedMessage] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(isConfigured);
  const [testSentMessage, setTestSentMessage] = useState(false);

  // Security / Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailResetLoading, setEmailResetLoading] = useState(false);
  const [emailResetMessage, setEmailResetMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      const { isConfigured } = getSupabaseCredentials();
      if (!isConfigured) {
        if (isMounted) setIsConnected(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        if (isMounted) setIsConnected(false);
        return;
      }

      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error && error.message?.includes('Failed to fetch')) {
          if (isMounted) setIsConnected(false);
        } else {
          if (isMounted) setIsConnected(true);
        }
      } catch {
        if (isMounted) setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSaveSettings = async () => {
    try {
      await updateUserProfile({
        timezone,
        week_starts_on: weekStartsOn,
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 3500);
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    const targetEmail = profile?.email || user?.email;
    if (!targetEmail) return;
    setEmailResetLoading(true);
    setEmailResetMessage(null);
    try {
      const res = await resetPasswordForEmail(targetEmail);
      if (res.success) {
        setEmailResetMessage(`Password change link sent to ${targetEmail}! Please check your Gmail Inbox & Spam folder.`);
        setTimeout(() => setEmailResetMessage(null), 6000);
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Failed to send password reset email.' });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to send email.' });
    } finally {
      setEmailResetLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Customize theme preferences, notification reminders, timezone, and backend connections.
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span>Appearance & Theme</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode (Creamy Blue)', icon: Sun },
            { id: 'dark', label: 'Dark Mode (Deep Navy)', icon: Moon },
            { id: 'system', label: 'System Default', icon: Monitor },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-100/80 text-blue-700 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-300 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-blue-200/80 bg-blue-50/40 text-slate-700 hover:text-blue-900 hover:bg-blue-100/60 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 shadow-xs'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Notifications Configuration */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Notifications & Alerts</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audio chimes and system notifications keep you accountable and on schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                testNotification();
                setTestSentMessage(true);
                setTimeout(() => setTestSentMessage(false), 3000);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-100/90 hover:bg-blue-200/80 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border dark:border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio & Alert 🔔</span>
            </button>
          </div>
        </div>

        {/* Browser Permission Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/40 dark:bg-slate-900/60 border border-blue-200/70 dark:border-slate-800 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Browser Notification Permission:</span>
          {permission === 'granted' ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Allowed (Popups Active)
            </span>
          ) : permission === 'denied' ? (
            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Blocked in Browser (Audio Chimes still active)
            </span>
          ) : (
            <button
              type="button"
              onClick={requestPermission}
              className="font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Click to Enable Desktop Popups</span>
            </button>
          )}
        </div>

        {testSentMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Test alert fired! Audio chime sounded and notification sent.</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50/90 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800 transition-colors shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Schedule Start Reminders</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Audio chime and alert 5 minutes before scheduled activities begin</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.scheduleReminders}
              onChange={(e) => {
                if (e.target.checked && permission !== 'granted') {
                  requestPermission();
                }
                updatePrefs({ scheduleReminders: e.target.checked });
              }}
              className="w-4 h-4 rounded text-blue-600 dark:text-cyan-500 focus:ring-blue-500 dark:focus:ring-cyan-400 border-blue-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50/90 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800 transition-colors shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">In-Progress Activity Reminders</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Audio and visual chime when activity duration nears completion</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.activityReminders}
              onChange={(e) => {
                if (e.target.checked && permission !== 'granted') {
                  requestPermission();
                }
                updatePrefs({ activityReminders: e.target.checked });
              }}
              className="w-4 h-4 rounded text-blue-600 dark:text-cyan-500 focus:ring-blue-500 dark:focus:ring-cyan-400 border-blue-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-50/90 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800 transition-colors shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Productivity Summary</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Evening digest of your completed routine and current streak</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.dailySummaryNotif}
              onChange={(e) => {
                if (e.target.checked && permission !== 'granted') {
                  requestPermission();
                }
                updatePrefs({ dailySummaryNotif: e.target.checked });
              }}
              className="w-4 h-4 rounded text-blue-600 dark:text-cyan-500 focus:ring-blue-500 dark:focus:ring-cyan-400 border-blue-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 3. Timezone & Calendar Start Day */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Regional & Calendar Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Week Starts On
            </label>
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(e.target.value as 'Monday' | 'Sunday')}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="Monday">Monday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedMessage && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Regional settings saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveSettings}
            className="ml-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm transition-all active:scale-95"
          >
            Save Regional Settings
          </button>
        </div>
      </div>

      {/* 4. Security & Password Management */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Security & Password</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Change your account password directly or send a password reset link to your email.
            </p>
          </div>

          {/* Quick Send Reset Link Button */}
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={emailResetLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-center disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>{emailResetLoading ? 'Sending link...' : 'Send Reset Link to Email'}</span>
          </button>
        </div>

        {/* Email Reset Feedback Alert */}
        {emailResetMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{emailResetMessage}</span>
          </div>
        )}

        {/* In-Place Password Change Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-1 border-t border-blue-100/70 dark:border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {passwordLoading ? 'Updating password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Supabase Cloud Integration Status */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Supabase Cloud Integration</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isConnected
                  ? 'Cloud database is synchronized with PostgreSQL backend'
                  : 'Disconnected from Supabase backend. Please check network connection'}
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div>
            {isConnected ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 animate-pulse" />
                </span>
                <span>Disconnected</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
