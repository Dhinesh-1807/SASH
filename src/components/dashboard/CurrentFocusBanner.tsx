import React from 'react';
import { useData } from '../../contexts/DataContext';
import { CATEGORY_CONFIG } from '../../lib/constants';
import { formatTime12h, getDurationLabel } from '../../lib/time';
export { formatTime12h };
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Clock,
  Play,
  Calendar,
  Compass,
  Square,
} from 'lucide-react';

interface CurrentFocusBannerProps {
  onOpenTimer?: () => void;
  onNavigateManage?: () => void;
}

export const CurrentFocusBanner: React.FC<CurrentFocusBannerProps> = ({
  onOpenTimer,
  onNavigateManage,
}) => {
  const {
    currentScheduleItem,
    nextScheduleItem,
    currentProgressPct,
    todayStats,
    activeActivity,
    activeElapsedTimeSeconds,
    checkIn,
    completeCurrentActivity,
  } = useData();

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentCategory = currentScheduleItem
    ? CATEGORY_CONFIG[currentScheduleItem.category] || CATEGORY_CONFIG.Other
    : null;

  const durationLabel = currentScheduleItem
    ? getDurationLabel(currentScheduleItem.start_time, currentScheduleItem.end_time)
    : '';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/95 via-blue-50/70 to-sky-50/90 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-cyan-950/40 border border-blue-200/80 dark:border-cyan-500/30 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-slate-800 dark:text-slate-100 mb-6">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-100/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            {currentScheduleItem ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 dark:bg-cyan-500/15 border border-blue-300 dark:border-cyan-500/30 text-[11px] font-bold text-blue-700 dark:text-cyan-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                <span>ACTIVE FOCUS ROUTINE</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>SCHEDULE STATUS</span>
              </span>
            )}
          </div>

          <div className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {todayStats.totalActivities === 0 ? (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                No activities scheduled for today
              </span>
            ) : todayStats.pendingActivities === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                All {todayStats.totalActivities} routines completed today! 🎉
              </span>
            ) : todayStats.completionPercentage >= 70 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                {todayStats.pendingActivities} remaining • On track today! 🔥
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400">Today:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {todayStats.completedActivities} of {todayStats.totalActivities} completed
                </span>
                <span className="text-blue-600 dark:text-cyan-400 font-semibold font-mono">
                  ({todayStats.completionPercentage}%)
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Main Banner Content */}
        {currentScheduleItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-3">
              {/* Category & Time Pill */}
              <div className="flex flex-wrap items-center gap-2">
                {currentCategory && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${currentCategory.bgClass} ${currentCategory.textClass} ${currentCategory.borderClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentCategory.badgeColor}`} />
                    {currentCategory.label}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-blue-200 dark:border-slate-700 shadow-2xs">
                  <Clock className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                  <span>
                    {formatTime12h(currentScheduleItem.start_time)} — {formatTime12h(currentScheduleItem.end_time)}
                  </span>
                  {durationLabel && (
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold pl-1 border-l border-slate-200 dark:border-slate-700">
                      {durationLabel}
                    </span>
                  )}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {currentScheduleItem.title}
              </h2>

              {/* Description */}
              {currentScheduleItem.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl line-clamp-2">
                  {currentScheduleItem.description}
                </p>
              )}

              {/* Progress Bar & Timing Details */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Routine Progress
                  </span>
                  <span className="text-blue-700 dark:text-cyan-400 font-bold font-mono text-xs">
                    {currentProgressPct}% elapsed
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-blue-100 dark:border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 transition-all duration-500 rounded-full"
                    style={{ width: `${currentProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Action Column */}
            <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-3 pt-3 lg:pt-0 lg:border-l border-blue-200/70 dark:border-slate-800/80 lg:pl-6">
              {activeActivity ? (
                <div className="w-full bg-white/95 dark:bg-slate-900/90 border border-blue-300 dark:border-cyan-500/40 rounded-xl p-3.5 text-center lg:text-right shadow-xs space-y-2">
                  <div className="text-[10px] text-blue-600 dark:text-cyan-400 uppercase tracking-widest font-bold flex items-center justify-center lg:justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Focus Session In Progress</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
                    {formatElapsed(activeElapsedTimeSeconds)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Live timer tracking your focus
                  </p>
                  <button
                    onClick={async () => {
                      if (activeActivity) {
                        const elapsedMins = Math.max(1, Math.round(activeElapsedTimeSeconds / 60));
                        await completeCurrentActivity(activeActivity.id, elapsedMins, 'Completed via Focus Banner');
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs transform active:scale-95 cursor-pointer"
                    title="Stop focus session and store in Activity History"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop & Save Session</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => checkIn(currentScheduleItem)}
                  className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/25 border border-transparent transition-all transform active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
                  <span>Check In Now</span>
                </button>
              )}

              {/* Next Activity Hint */}
              {nextScheduleItem && (
                <div className="w-full flex items-center justify-between lg:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 lg:border-none">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                    Next up:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[170px]">
                    {nextScheduleItem.title}
                  </span>
                  <span className="text-blue-600 dark:text-cyan-400 font-mono font-semibold shrink-0">
                    ({formatTime12h(nextScheduleItem.start_time)})
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Between Focus Sessions */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Between Focus Blocks</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {nextScheduleItem ? (
                  <>
                    Next routine <span className="font-semibold text-slate-800 dark:text-slate-200">"{nextScheduleItem.title}"</span> begins at <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{formatTime12h(nextScheduleItem.start_time)}</span>.
                  </>
                ) : todayStats.totalActivities > 0 ? (
                  "All routines for today have wrapped up. Great effort!"
                ) : (
                  "Ready to plan your focus? Add your first routine to build momentum."
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
              {nextScheduleItem && (
                <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 text-xs shadow-2xs">
                  <span className="text-slate-500 dark:text-slate-400">Up Next:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                    {nextScheduleItem.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                  <span className="text-blue-600 dark:text-cyan-400 font-mono font-bold shrink-0">
                    {formatTime12h(nextScheduleItem.start_time)}
                  </span>
                </div>
              )}

              {onOpenTimer && (
                <button
                  onClick={onOpenTimer}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ad-hoc Timer</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
