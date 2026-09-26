import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { CurrentFocusBanner } from '../components/dashboard/CurrentFocusBanner';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ScheduleCard } from '../components/dashboard/ScheduleCard';
import { ProductivityScoreWidget } from '../components/productivity/ProductivityScoreWidget';
import { ScheduleFormModal } from '../components/schedule/ScheduleFormModal';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { getScheduleTimeWindowStatus } from '../lib/time';
import {
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Percent,
  Target,
  ArrowRight,
  Flame,
  CalendarCheck,
  Download,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateManage: () => void;
}

type TimelineFilter = 'ALL' | 'AVAILABLE' | 'UPCOMING' | 'COMPLETED' | 'SKIPPED';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateManage }) => {
  const {
    todayTimeline,
    todayStats,
    streak,
    isLoadingData,
    addNewSchedule,
    importRoutine,
    currentMinutesNow,
  } = useData();
  const { profile } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('ALL');
  const [isImporting, setIsImporting] = useState(false);

  // Compute precise focus time string (e.g. "1h 30m logged")
  const focusHours = Math.floor(todayStats.totalFocusedMinutes / 60);
  const focusMins = todayStats.totalFocusedMinutes % 60;
  const focusSubtitle =
    focusHours > 0
      ? `${focusHours}h ${focusMins}m logged`
      : `${focusMins}m logged`;

  // Daily habit target from profile (defaults to 6 routines)
  const dailyTarget = profile?.daily_goal_target || 6;
  const targetPct = Math.min(100, Math.round((todayStats.completedActivities / dailyTarget) * 100));

  // Compute status counts for timeline filter tabs
  const filterCounts = useMemo(() => {
    let available = 0;
    let upcoming = 0;
    let completed = 0;
    let skipped = 0;

    for (const item of todayTimeline) {
      const status = item.activity?.status || 'Pending';
      if (status === 'Completed') {
        completed++;
      } else if (status === 'Skipped') {
        skipped++;
      } else {
        const timeStatus = getScheduleTimeWindowStatus(
          item.schedule.start_time,
          item.schedule.end_time,
          currentMinutesNow
        );
        if (timeStatus.isWithinWindow || status === 'In Progress') {
          available++;
        } else if (timeStatus.isUpcoming) {
          upcoming++;
        }
      }
    }

    return {
      all: todayTimeline.length,
      available,
      upcoming,
      completed,
      skipped,
    };
  }, [todayTimeline, currentMinutesNow]);

  // Filtered timeline items
  const filteredTimeline = useMemo(() => {
    if (activeFilter === 'ALL') return todayTimeline;

    return todayTimeline.filter((item) => {
      const status = item.activity?.status || 'Pending';
      if (activeFilter === 'COMPLETED') return status === 'Completed';
      if (activeFilter === 'SKIPPED') return status === 'Skipped';

      const timeStatus = getScheduleTimeWindowStatus(
        item.schedule.start_time,
        item.schedule.end_time,
        currentMinutesNow
      );

      if (activeFilter === 'AVAILABLE') {
        return (timeStatus.isWithinWindow && status === 'Pending') || status === 'In Progress';
      }
      if (activeFilter === 'UPCOMING') {
        return timeStatus.isUpcoming && status === 'Pending';
      }

      return true;
    });
  }, [todayTimeline, activeFilter, currentMinutesNow]);

  const handleImportRoutine = async () => {
    setIsImporting(true);
    try {
      await importRoutine();
    } catch (err) {
      console.error('Failed to import routines:', err);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  const hasTimelineItems = todayTimeline.length > 0;

  return (
    <div className="space-y-6">
      {/* Smart Currently / Next banner */}
      <CurrentFocusBanner onNavigateManage={onNavigateManage} />

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Completion */}
        <KpiCard
          title="Today's Completion"
          value={`${todayStats.completionPercentage}%`}
          subtitle={`${todayStats.completedActivities} of ${todayStats.totalActivities} completed`}
          icon={<Percent className="w-5 h-5 text-sky-600 dark:text-cyan-400" />}
          progress={todayStats.completionPercentage}
          badge={todayStats.completionPercentage >= 70 ? 'On Track 🔥' : 'In Progress'}
          badgeColor={todayStats.completionPercentage >= 70 ? 'emerald' : 'cyan'}
        />

        {/* Completed Activities */}
        <KpiCard
          title="Completed"
          value={todayStats.completedActivities}
          subtitle={`${todayStats.skippedActivities} skipped today`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          badge={`${todayStats.completedActivities} Done`}
          badgeColor="emerald"
        />

        {/* Remaining Activities */}
        <KpiCard
          title="Remaining"
          value={todayStats.pendingActivities}
          subtitle="Scheduled for today"
          icon={<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          badge={todayStats.pendingActivities === 0 && todayStats.totalActivities > 0 ? 'All Clear 🎉' : 'To Do'}
          badgeColor="blue"
        />

        {/* Total Focus Minutes */}
        <KpiCard
          title="Focus Time"
          value={`${todayStats.totalFocusedMinutes}m`}
          subtitle={focusSubtitle}
          icon={<Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          badge={`${streak}d Streak 🔥`}
          badgeColor="amber"
        />
      </div>

      {/* Middle Row: Productivity Score + Daily Target & Habit Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Productivity Score (7 columns on large screens) */}
        <div className="lg:col-span-7">
          <ProductivityScoreWidget />
        </div>

        {/* Daily Habit Target & Schedule Hub (5 columns on large screens) */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Daily Habit Target
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-blue-200 dark:border-cyan-400/40">
                Goal: {dailyTarget} Routines
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {todayStats.completedActivities} of {dailyTarget} routines completed
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                  {targetPct}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${targetPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                {todayStats.completedActivities >= dailyTarget ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    🎯 Daily target achieved! Fantastic discipline today.
                  </span>
                ) : (
                  <span>
                    Complete <strong className="text-slate-700 dark:text-slate-300">{Math.max(0, dailyTarget - todayStats.completedActivities)} more</strong> to hit your daily focus goal.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Clean Quick Action Buttons */}
          <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Routine</span>
            </button>

            <button
              onClick={onNavigateManage}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule Timeline Section */}
      <div className="space-y-4 pt-2">
        {/* Section Header & Interactive Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <span>Today's Focus Timeline</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {todayTimeline.length} scheduled
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check in as you begin each activity to record accurate focus analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-blue-200 dark:border-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Add Routine</span>
            </button>
          </div>
        </div>

        {/* Clean Filter Tabs Bar */}
        {hasTimelineItems && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 w-fit">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              All ({filterCounts.all})
            </button>

            {filterCounts.available > 0 && (
              <button
                onClick={() => setActiveFilter('AVAILABLE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'AVAILABLE'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-600 hover:text-blue-800 dark:text-cyan-400 dark:hover:text-cyan-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-ping" />
                <span>Available ({filterCounts.available})</span>
              </button>
            )}

            {filterCounts.upcoming > 0 && (
              <button
                onClick={() => setActiveFilter('UPCOMING')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === 'UPCOMING'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Upcoming ({filterCounts.upcoming})
              </button>
            )}

            {filterCounts.completed > 0 && (
              <button
                onClick={() => setActiveFilter('COMPLETED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300'
                }`}
              >
                Completed ({filterCounts.completed})
              </button>
            )}

            {filterCounts.skipped > 0 && (
              <button
                onClick={() => setActiveFilter('SKIPPED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === 'SKIPPED'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Skipped ({filterCounts.skipped})
              </button>
            )}
          </div>
        )}

        {/* Timeline Items or Filter Empty State */}
        {hasTimelineItems ? (
          filteredTimeline.length > 0 ? (
            <div className="space-y-3">
              {filteredTimeline.map(({ schedule, activity, isCurrentlyActive }) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  activity={activity}
                  isCurrentlyActive={isCurrentlyActive}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-8 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No routines match the active filter ({activeFilter.toLowerCase()}).
              </p>
              <button
                onClick={() => setActiveFilter('ALL')}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                View all scheduled routines
              </button>
            </div>
          )
        ) : (
          /* Empty State when 0 routines are scheduled */
          <div className="rounded-2xl border border-blue-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-md p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mx-auto shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                No routines scheduled for today
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Add your classes, study hours, coding sessions, or import the curated SASH master routine.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleImportRoutine}
                disabled={isImporting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>{isImporting ? 'Importing...' : 'Import Master Routine'}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 border border-transparent flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Schedule Routine</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await addNewSchedule(data);
        }}
      />
    </div>
  );
};
