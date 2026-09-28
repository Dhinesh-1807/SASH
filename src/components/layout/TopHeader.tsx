import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Flame, Clock, Sun, Moon, Settings } from 'lucide-react';
import { AppPage } from './Sidebar';

interface TopHeaderProps {
  onOpenTimer: () => void;
  onOpenSupabaseConfig?: () => void;
  onNavigate?: (page: AppPage) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenTimer, onNavigate }) => {
  const { user, profile } = useAuth();
  const { streak } = useData();
  const { theme, setTheme } = useTheme();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#050811]/90 backdrop-blur-md border-b border-blue-200/70 dark:border-slate-800/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Logo & Greeting */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile brand icon */}
        <div className="lg:hidden flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="SASH"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_8px_rgba(0,102,255,0.3)]"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
            <span className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {getGreeting()}, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Leader'}
            </span>
            <span className="animate-pulse shrink-0">👋</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {formattedDate} • <span className="text-blue-600 dark:text-cyan-400 font-mono font-semibold">{formattedTime}</span>
          </p>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Cloud Sync / Demo Status Pill */}
        {user?.isDemo ? (
          <div
            title="Running in Demo mode. Data is stored locally in this browser."
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo (Local)</span>
          </div>
        ) : (
          <div
            title="Connected to Supabase PostgreSQL Cloud. Real-time synced."
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cloud Synced</span>
          </div>
        )}

        {/* Streak Pill */}
        <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{streak}d</span>
        </div>

        {/* Start Focus Timer Button */}
        <button
          onClick={onOpenTimer}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white dark:from-blue-600/30 dark:to-cyan-500/20 dark:hover:from-blue-600/50 dark:hover:to-cyan-500/40 dark:text-cyan-300 border border-transparent dark:border-cyan-400/30 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
          title="Open Focus Timer"
          aria-label="Focus Timer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Focus Timer</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-xl border border-blue-200 dark:border-slate-800 bg-blue-50/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:border-blue-300 dark:hover:border-slate-700 transition-colors shrink-0"
          title={`Switch to ${theme === 'dark' ? 'Light Theme (Creamy Blue)' : 'Dark Theme'}`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Mobile Settings Shortcut */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('settings')}
            className="sm:hidden p-1.5 rounded-xl border border-blue-200 dark:border-slate-800 bg-blue-50/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-100 hover:border-blue-300 dark:hover:border-slate-700 transition-colors shrink-0"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
