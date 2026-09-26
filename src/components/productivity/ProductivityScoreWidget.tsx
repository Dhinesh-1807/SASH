import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Zap, CheckCircle2, Clock, Flame } from 'lucide-react';

export const ProductivityScoreWidget: React.FC = () => {
  const { productivityScore, todayStats, streak } = useData();

  const getTier = (score: number) => {
    if (score >= 85) {
      return {
        title: 'Elite Focus',
        desc: 'Peak cognitive discipline',
        badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/40',
        dot: 'bg-blue-600 dark:bg-cyan-400',
      };
    }
    if (score >= 60) {
      return {
        title: 'High Momentum',
        desc: 'Consistent focus maintained',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/40',
        dot: 'bg-emerald-500',
      };
    }
    if (score >= 35) {
      return {
        title: 'Building Habit',
        desc: 'Positive momentum building',
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/40',
        dot: 'bg-amber-500',
      };
    }
    return {
      title: 'Ready to Start',
      desc: 'Execute routines to build score',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    };
  };

  const tier = getTier(productivityScore);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-5 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Productivity Score
          </span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Calculated daily focus composite
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${tier.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
          {tier.title}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
        {/* Modern Radial Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xs" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-600 dark:text-cyan-400 transition-all duration-1000 ease-out"
              strokeDasharray={`${productivityScore}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {productivityScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
              /100
            </span>
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-3 gap-2.5 flex-1 w-full">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Completion</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {todayStats.completionPercentage}%
            </div>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span>Focus Time</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {todayStats.totalFocusedMinutes}m
            </div>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Streak</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {streak}d
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
