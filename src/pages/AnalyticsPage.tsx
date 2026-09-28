import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { KpiCard } from '../components/dashboard/KpiCard';
import { CompletionRateChart } from '../components/analytics/CompletionRateChart';
import { DailyActivitiesChart } from '../components/analytics/DailyActivitiesChart';
import { CategoryBreakdownChart } from '../components/analytics/CategoryBreakdownChart';
import { ProductivityTimelineChart } from '../components/analytics/ProductivityTimelineChart';
import { PerformanceComparisonChart } from '../components/analytics/PerformanceComparisonChart';
import { CATEGORY_CONFIG } from '../lib/constants';
import { ScheduleCategory } from '../types';
import { BarChart3, TrendingUp, Calendar, Clock, Flame, CheckCircle2 } from 'lucide-react';

type AnalyticsPeriod = 'today' | '7days' | '30days' | 'month';

export const AnalyticsPage: React.FC = () => {
  const { activities, schedules, todayStats, streak } = useData();
  const [period, setPeriod] = useState<AnalyticsPeriod>('7days');

  // Calculate dates based on period
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();

    if (period === 'today') {
      // today only
    } else if (period === '7days') {
      start.setDate(end.getDate() - 6);
    } else if (period === '30days') {
      start.setDate(end.getDate() - 29);
    } else if (period === 'month') {
      start.setDate(1); // First of this month
    }

    return {
      startStr: start.toISOString().split('T')[0],
      endStr: end.toISOString().split('T')[0],
      startDate: start,
      endDate: end,
    };
  }, [period]);

  // Filter activities within range
  const filteredActivities = useMemo(() => {
    return activities.filter(
      (a) => a.activity_date >= dateRange.startStr && a.activity_date <= dateRange.endStr
    );
  }, [activities, dateRange]);

  // Generate array of date strings in range
  const daysInRange = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [dateRange]);

  // Top KPI calculations
  const totalCompletedInRange = filteredActivities.filter((a) => a.status === 'Completed').length;
  const totalFocusMinsInRange = filteredActivities.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);

  // Weekly Completion Rate:
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weeklyActs = activities.filter((a) => a.activity_date >= weekStartStr);
  const weeklyCompleted = weeklyActs.filter((a) => a.status === 'Completed').length;
  const estimatedWeeklyTotal = Math.max(weeklyCompleted, schedules.length * 7 || 1);
  const weeklyCompletionRate = Math.min(100, Math.round((weeklyCompleted / estimatedWeeklyTotal) * 100));

  // Chart 1: Completion Rate Line Chart Data
  const completionRateData = useMemo(() => {
    return daysInRange.map((d) => {
      const dayActs = activities.filter((a) => a.activity_date === d);
      const comp = dayActs.filter((a) => a.status === 'Completed').length;
      const total = Math.max(comp, schedules.length || 1);
      const rate = Math.round((comp / total) * 100);
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return { date: d, rate, label };
    });
  }, [daysInRange, activities, schedules.length]);

  // Chart 2: Daily Completed Activities Bar Chart Data
  const dailyActivitiesData = useMemo(() => {
    return daysInRange.map((d) => {
      const count = activities.filter((a) => a.activity_date === d && a.status === 'Completed').length;
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return { label, completed: count };
    });
  }, [daysInRange, activities]);

  // Chart 3: Time Spent by Category Donut Chart Data
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    const categories = Object.keys(CATEGORY_CONFIG) as ScheduleCategory[];
    categories.forEach((c) => (catMap[c] = 0));

    filteredActivities.forEach((act) => {
      if (act.status === 'Completed') {
        const cat = act.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (act.duration_minutes || 30);
      }
    });

    return categories.map((c) => ({
      name: c,
      minutes: catMap[c] || 0,
      color: CATEGORY_CONFIG[c].hex,
    }));
  }, [filteredActivities]);

  // Chart 4: Productivity Timeline Area Chart Data
  const productivityTimelineData = useMemo(() => {
    return daysInRange.map((d) => {
      const mins = activities
        .filter((a) => a.activity_date === d && a.status === 'Completed')
        .reduce((acc, a) => acc + (a.duration_minutes || 0), 0);
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return { label, focusMinutes: mins };
    });
  }, [daysInRange, activities]);

  // Chart 5: Performance Comparison Bar Chart Data (Completed, Skipped, Pending)
  const performanceData = useMemo(() => {
    return daysInRange.map((d) => {
      const dayActs = activities.filter((a) => a.activity_date === d);
      const completed = dayActs.filter((a) => a.status === 'Completed').length;
      const skipped = dayActs.filter((a) => a.status === 'Skipped').length;
      const pending = Math.max(0, schedules.length - completed - skipped);
      const dateObj = new Date(d);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return { label, completed, skipped, pending };
    });
  }, [daysInRange, activities, schedules.length]);

  return (
    <div className="space-y-6">
      {/* Header and Period Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            <span>Interactive Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track completion trends, focus volume, and distribution across life categories.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 bg-blue-100/70 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'month', label: 'This Month' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id as AnalyticsPeriod)}
              className={`flex-1 sm:flex-initial shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-center ${
                period === t.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <KpiCard
          title="Today's Completion"
          value={`${todayStats.completionPercentage}%`}
          subtitle={`${todayStats.completedActivities} / ${todayStats.totalActivities} routines`}
          icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-cyan-400" />}
          progress={todayStats.completionPercentage}
        />

        <KpiCard
          title="Weekly Completion"
          value={`${weeklyCompletionRate}%`}
          subtitle="Past 7 days average"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          progress={weeklyCompletionRate}
          badgeColor="emerald"
        />

        <KpiCard
          title="Current Streak"
          value={`${streak} Days`}
          subtitle="Consecutive discipline"
          icon={<Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
          badge="Active 🔥"
          badgeColor="amber"
        />

        <KpiCard
          title="Total Focus Time"
          value={`${Math.round(totalFocusMinsInRange / 60)}h ${totalFocusMinsInRange % 60}m`}
          subtitle={`Across ${totalCompletedInRange} sessions`}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          badge="Logged"
          badgeColor="blue"
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly/Period Completion Rate Line Chart */}
        <div className="glass-card rounded-2xl p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Completion Rate Trajectory</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily completion percentage over time</p>
            </div>
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">% Trend</span>
          </div>
          <CompletionRateChart data={completionRateData} />
        </div>

        {/* Chart 2: Daily Completed Activities Bar Chart */}
        <div className="glass-card rounded-2xl p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Daily Completed Routines</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total activities finished per day</p>
            </div>
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">Count</span>
          </div>
          <DailyActivitiesChart data={dailyActivitiesData} />
        </div>

        {/* Chart 3: Time Spent by Category Donut Chart */}
        <div className="glass-card rounded-2xl p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Time Spent by Category</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Focus minute breakdown across categories</p>
            </div>
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">Distribution</span>
          </div>
          <CategoryBreakdownChart data={categoryData} />
        </div>

        {/* Chart 4: Productivity Timeline Area Chart */}
        <div className="glass-card rounded-2xl p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Productivity Focus Volume</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total focused minutes logged each day</p>
            </div>
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">Minutes</span>
          </div>
          <ProductivityTimelineChart data={productivityTimelineData} />
        </div>
      </div>

      {/* Chart 5: Schedule Performance (Full Width) */}
      <div className="glass-card rounded-2xl p-5 space-y-3 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">5. Schedule Performance Comparison</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Completed vs Skipped vs Pending activities across selected dates
            </p>
          </div>
          <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">Comparison</span>
        </div>
        <PerformanceComparisonChart data={performanceData} />
      </div>
    </div>
  );
};
