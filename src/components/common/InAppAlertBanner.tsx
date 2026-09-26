import React from 'react';
import { useNotifications, InAppAlert } from '../../contexts/NotificationContext';
import { Bell, CheckCircle2, AlertTriangle, X, Volume2 } from 'lucide-react';

export const InAppAlertBanner: React.FC = () => {
  const { activeAlerts, dismissAlert } = useNotifications();

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
      {activeAlerts.map((alert: InAppAlert) => {
        const isSuccess = alert.type === 'success';
        const isWarning = alert.type === 'warning';

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md animate-fade-in transition-all flex items-start gap-3.5 ${
              isSuccess
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-300 dark:border-emerald-500/40 text-slate-800 dark:text-slate-100 shadow-emerald-500/10'
                : isWarning
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-300 dark:border-amber-500/40 text-slate-800 dark:text-slate-100 shadow-amber-500/10'
                : 'bg-white/95 dark:bg-slate-900/95 border-blue-300 dark:border-blue-500/40 text-slate-800 dark:text-slate-100 shadow-blue-500/10'
            }`}
          >
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : isWarning
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-cyan-400'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="text-xs sm:text-sm font-bold truncate">
                  {alert.title}
                </h4>
                <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {alert.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
