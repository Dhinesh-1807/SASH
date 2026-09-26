import React from 'react';
import { LayoutDashboard, BellRing, CalendarDays, BarChart3, History, User } from 'lucide-react';
import { AppPage } from './Sidebar';

interface MobileNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard' as AppPage, label: 'Focus', icon: LayoutDashboard },
    { id: 'reminders' as AppPage, label: 'Reminders', icon: BellRing },
    { id: 'manage-schedule' as AppPage, label: 'Schedule', icon: CalendarDays },
    { id: 'analytics' as AppPage, label: 'Analytics', icon: BarChart3 },
    { id: 'history' as AppPage, label: 'Activity', icon: History },
    { id: 'profile' as AppPage, label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070b16]/95 backdrop-blur-xl border-t border-blue-200/70 dark:border-slate-800/80 px-2 py-1.5 safe-area-pb transition-colors duration-200">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-cyan-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400 shadow-sm" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
