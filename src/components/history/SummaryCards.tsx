import React from 'react';
import { ActivityRecord } from '../../types';
import { Download, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface SummaryCardsProps {
  activities: ActivityRecord[];
  onExportCsv: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ activities, onExportCsv }) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 7 days ago
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  // 30 days ago
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().split('T')[0];

  // Metrics
  const dailyActs = activities.filter((a) => a.activity_date === todayStr);
  const dailyCompleted = dailyActs.filter((a) => a.status === 'Completed').length;
  const dailyMins = dailyActs.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);

  const weeklyActs = activities.filter((a) => a.activity_date >= weekAgoStr);
  const weeklyCompleted = weeklyActs.filter((a) => a.status === 'Completed').length;
  const weeklyMins = weeklyActs.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);

  const monthlyActs = activities.filter((a) => a.activity_date >= monthAgoStr);
  const monthlyCompleted = monthlyActs.filter((a) => a.status === 'Completed').length;
  const monthlyMins = monthlyActs.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Executive Summary
        </h3>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-cyan-400 dark:border-slate-700 text-xs font-semibold transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Summary */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-blue-600 dark:border-l-cyan-400 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Today's Summary</span>
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{dailyCompleted}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">completed</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-cyan-400 font-mono mt-1 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {dailyMins} min focused
          </p>
        </div>

        {/* Weekly Summary */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-blue-500 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Last 7 Days</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{weeklyCompleted}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">completed</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {weeklyMins} min focused
          </p>
        </div>

        {/* Monthly Summary */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-indigo-500 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Last 30 Days</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{monthlyCompleted}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">completed</span>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-1 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {monthlyMins} min focused
          </p>
        </div>
      </div>
    </div>
  );
};
