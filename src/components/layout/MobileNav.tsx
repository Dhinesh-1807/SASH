import React from 'react';
import { LayoutDashboard, CalendarDays, BellRing, BarChart3, User } from 'lucide-react';
import { AppPage } from './Sidebar';

interface MobileNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard' as AppPage, label: 'Focus', icon: LayoutDashboard },
    { id: 'manage-schedule' as AppPage, label: 'Schedule', icon: CalendarDays },
    { id: 'reminders' as AppPage, label: 'Reminders', icon: BellRing },
    { id: 'analytics' as AppPage, label: 'Analytics', icon: BarChart3 },
    { id: 'profile' as AppPage, label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070b16]/95 backdrop-blur-xl border-t border-blue-200/70 dark:border-slate-800/80 px-2 py-1 safe-area-pb transition-colors duration-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`relative px-3 py-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 dark:bg-cyan-500/10' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-blue-600 dark:text-cyan-400' : ''
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shadow-xs" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
