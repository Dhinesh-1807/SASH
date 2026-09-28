import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'emerald' | 'cyan' | 'blue' | 'amber';
  progress?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeColor = 'cyan',
  progress,
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  }[badgeColor];

  const iconContainerClasses = {
    emerald: 'bg-emerald-50/90 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    cyan: 'bg-sky-50/90 text-sky-600 border-sky-200/80 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-500/30',
    blue: 'bg-blue-50/90 text-blue-600 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
    amber: 'bg-amber-50/90 text-amber-600 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
  }[badgeColor];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-3 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {value}
          </div>
        </div>

        <div className={`p-2 sm:p-2.5 rounded-xl border shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0 ${iconContainerClasses}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
        {typeof progress === 'number' && (
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs gap-1 sm:gap-2 pt-0.5 min-w-0">
          {subtitle ? (
            <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] font-medium truncate">
              {subtitle}
            </span>
          ) : (
            <span />
          )}
          {badge && (
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold border text-[9px] sm:text-[10px] shrink-0 shadow-2xs whitespace-nowrap ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
