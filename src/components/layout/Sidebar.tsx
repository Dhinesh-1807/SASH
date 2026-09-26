import React from 'react';
import {
  LayoutDashboard,
  BellRing,
  CalendarDays,
  BarChart3,
  History,
  User,
  Settings,
  LogOut,
  Flame,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export type AppPage =
  | 'dashboard'
  | 'reminders'
  | 'manage-schedule'
  | 'analytics'
  | 'history'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onOpenTimer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onOpenTimer }) => {
  const { logout, profile, user } = useAuth();
  const { streak } = useData();

  const navItems = [
    { id: 'dashboard' as AppPage, label: 'Today\'s Focus', icon: LayoutDashboard },
    { id: 'reminders' as AppPage, label: 'Reminder Dashboard', icon: BellRing },
    { id: 'manage-schedule' as AppPage, label: 'Manage Schedule', icon: CalendarDays },
    { id: 'analytics' as AppPage, label: 'Interactive Analytics', icon: BarChart3 },
    { id: 'history' as AppPage, label: 'Activity History', icon: History },
    { id: 'profile' as AppPage, label: 'Profile', icon: User },
    { id: 'settings' as AppPage, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#F4F8FC] dark:bg-[#070b16] border-r border-blue-200/70 dark:border-slate-800/80 h-screen sticky top-0 z-30 select-none transition-colors duration-200">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-blue-200/70 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SASH"
            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,102,255,0.3)]"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-cyan-300 dark:to-white bg-clip-text text-transparent">
              SASH
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
              Plan • Schedule • Achieve
            </span>
          </div>
        </div>
      </div>

      {/* Streak & Quick Focus Widget */}
      <div className="p-3.5 mx-3 my-3 rounded-xl bg-gradient-to-br from-blue-100/70 to-sky-100/50 dark:from-blue-950/40 dark:to-cyan-950/20 border border-blue-200 dark:border-cyan-500/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak} Day Streak</span>
          </div>
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 bg-white/90 dark:bg-cyan-950/50 hover:bg-white dark:hover:bg-cyan-900/60 px-2 py-1 rounded-lg border border-blue-200 dark:border-cyan-500/30 transition-all shadow-xs"
            title="Start Pomodoro Focus Timer"
          >
            <Clock className="w-3 h-3" />
            Focus
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 dark:from-blue-600/30 dark:to-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-blue-100/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-white dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white dark:bg-cyan-400 shadow-sm" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-blue-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300 truncate">
                {profile?.full_name || (user?.email ? user.email.split('@')[0] : 'User')}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{profile?.email || user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
