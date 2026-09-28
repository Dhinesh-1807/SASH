import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  ScheduleItem,
  ActivityRecord,
  TodayTimelineItem,
  DailySummaryStats,
  ScheduleCategory,
} from '../types';
import { useAuth } from './AuthContext';
import {
  fetchSchedules,
  fetchActivities,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  recordCheckIn,
  completeActivity,
  skipActivity,
  recordFocusSession,
  calculateStreak,
  importDefaultRoutine,
} from '../lib/storage';
import { sounds } from '../lib/audio';
import confetti from 'canvas-confetti';
import { getScheduleTimeWindowStatus, formatTime12h, getMinutes } from '../lib/time';

interface DataContextType {
  schedules: ScheduleItem[];
  activities: ActivityRecord[];
  isLoadingData: boolean;
  todayTimeline: TodayTimelineItem[];
  currentScheduleItem: ScheduleItem | null;
  nextScheduleItem: ScheduleItem | null;
  currentProgressPct: number;
  todayStats: DailySummaryStats;
  streak: number;
  productivityScore: number;
  activeActivity: ActivityRecord | null; // Currently in progress
  activeElapsedTimeSeconds: number;
  currentMinutesNow: number;

  // Actions
  addNewSchedule: (data: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<ScheduleItem>;
  modifySchedule: (id: string, updates: Partial<ScheduleItem>) => Promise<ScheduleItem>;
  removeScheduleItem: (id: string) => Promise<void>;
  duplicateScheduleItem: (id: string) => Promise<ScheduleItem>;
  toggleScheduleStatus: (id: string) => Promise<void>;
  importRoutine: () => Promise<void>;

  checkIn: (schedule: ScheduleItem) => Promise<ActivityRecord>;
  completeCurrentActivity: (activityId: string, durationMinutes: number, notes?: string) => Promise<ActivityRecord>;
  skipCurrentSchedule: (schedule: ScheduleItem, notes?: string) => Promise<ActivityRecord>;
  logFocusSession: (minutes: number, notes?: string, title?: string, category?: ScheduleCategory) => Promise<ActivityRecord>;
  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Real-time ticking for in-progress activities and current time tracking
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshAllData = useCallback(async () => {
    if (!user) {
      setSchedules([]);
      setActivities([]);
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      const [schList, actList] = await Promise.all([
        fetchSchedules(user.id),
        fetchActivities(user.id, 90),
      ]);

      const enrichedActivities = actList.map((act) => {
        const matchedSchedule = act.schedule_id
          ? schList.find((s) => s.id === act.schedule_id)
          : null;

        let title = act.title;
        let category = act.category;

        if (!title || title === 'Focus Session') {
          if (matchedSchedule?.title) {
            title = matchedSchedule.title;
          } else if (act.notes && act.notes.startsWith('[')) {
            const match = act.notes.match(/^\[(.*?)\]\s*(.*)$/);
            if (match && match[2] && match[2] !== 'Focus Timer Session') {
              title = match[2];
            } else if (match && match[1]) {
              title = `${match[1]} Focus`;
            }
          }
        }

        if (!category || category === 'Other') {
          if (matchedSchedule?.category) {
            category = matchedSchedule.category;
          } else if (act.notes && act.notes.startsWith('[')) {
            const match = act.notes.match(/^\[(.*?)\]/);
            if (match && match[1]) {
              const parsed = match[1] === 'Learning' ? 'Study' : match[1];
              category = parsed as ScheduleCategory;
            }
          }
        }

        return {
          ...act,
          title: title || 'Focus Session',
          category: category || 'Development',
        };
      });

      setSchedules(schList);
      setActivities(enrichedActivities);
    } catch (err) {
      console.error('Failed to load user schedules/activities:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Current day name and date string
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[now.getDay()];
  }, [now]);

  const todayDateStr = useMemo(() => {
    return now.toISOString().split('T')[0];
  }, [now]);

  // Today's activities
  const todayActivities = useMemo(() => {
    return activities.filter((a) => a.activity_date === todayDateStr);
  }, [activities, todayDateStr]);

  // Today's schedule items (filtered by days array and active status)
  const todaySchedules = useMemo(() => {
    return schedules
      .filter((s) => s.is_active && (s.days.includes(todayDayName) || s.days.length === 0))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedules, todayDayName]);

  // Current time in "HH:MM"
  const currentTimeStr = useMemo(() => {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [now]);

  // Helper: minutes since midnight
  const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const currentMinutesNow = useMemo(() => {
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }, [now]);

  // Auto-skip pending scheduled routines whose time window has ended
  const autoSkippedSchedulesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || isLoadingData || todaySchedules.length === 0) return;

    const expiredPending = todaySchedules.filter((sch) => {
      // Don't repeat if already auto-skipped in this session
      if (autoSkippedSchedulesRef.current.has(sch.id)) return false;
      // If already recorded today (In Progress, Completed, or Skipped)
      const hasRecord = todayActivities.some((a) => a.schedule_id === sch.id);
      if (hasRecord) return false;

      const timeStatus = getScheduleTimeWindowStatus(sch.start_time, sch.end_time, currentMinutesNow);
      return timeStatus.isPast;
    });

    if (expiredPending.length === 0) return;

    expiredPending.forEach((sch) => autoSkippedSchedulesRef.current.add(sch.id));

    const executeAutoSkips = async () => {
      for (const sch of expiredPending) {
        try {
          const record = await skipActivity(
            user.id,
            sch.id,
            sch.title,
            sch.category,
            'Auto-skipped: Scheduled time ended',
            todayDateStr
          );
          setActivities((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
        } catch (err) {
          console.error('Failed to auto-skip schedule:', sch.title, err);
          autoSkippedSchedulesRef.current.delete(sch.id);
        }
      }
    };

    executeAutoSkips();
  }, [user, isLoadingData, todaySchedules, todayActivities, currentMinutesNow, todayDateStr]);

  // Find currently active schedule and next schedule
  const { currentScheduleItem, nextScheduleItem, currentProgressPct } = useMemo(() => {
    if (todaySchedules.length === 0) {
      return { currentScheduleItem: null, nextScheduleItem: null, currentProgressPct: 0 };
    }

    let current: ScheduleItem | null = null;
    let next: ScheduleItem | null = null;
    let progressPct = 0;

    for (let i = 0; i < todaySchedules.length; i++) {
      const sch = todaySchedules[i];
      const startMin = getMinutes(sch.start_time);
      const endMin = getMinutes(sch.end_time);

      // Handle schedules crossing midnight (e.g. 23:00 to 05:00)
      const isOvernight = endMin < startMin;
      const isCurrently = isOvernight
        ? currentMinutesNow >= startMin || currentMinutesNow < endMin
        : currentMinutesNow >= startMin && currentMinutesNow < endMin;

      if (isCurrently) {
        current = sch;
        const totalDuration = isOvernight ? 1440 - startMin + endMin : endMin - startMin;
        const elapsed = isOvernight
          ? currentMinutesNow >= startMin
            ? currentMinutesNow - startMin
            : 1440 - startMin + currentMinutesNow
          : currentMinutesNow - startMin;
        progressPct = Math.min(100, Math.max(0, Math.round((elapsed / (totalDuration || 1)) * 100)));
        next = todaySchedules[i + 1] || null;
        break;
      }

      if (currentMinutesNow < startMin && !next) {
        next = sch;
      }
    }

    if (!current && !next && todaySchedules.length > 0) {
      // If time is past all schedules today, next is tomorrow morning's first schedule
      next = todaySchedules[0];
    }

    return { currentScheduleItem: current, nextScheduleItem: next, currentProgressPct: progressPct };
  }, [todaySchedules, currentMinutesNow]);

  // Combine today schedules with activities for the timeline
  const todayTimeline: TodayTimelineItem[] = useMemo(() => {
    return todaySchedules.map((sch) => {
      const act = todayActivities.find((a) => a.schedule_id === sch.id);
      return {
        schedule: sch,
        activity: act,
        isCurrentlyActive: currentScheduleItem?.id === sch.id,
        isNext: nextScheduleItem?.id === sch.id,
      };
    });
  }, [todaySchedules, todayActivities, currentScheduleItem, nextScheduleItem]);

  // Today's summary metrics
  const todayStats: DailySummaryStats = useMemo(() => {
    const total = todaySchedules.length;
    let completed = 0;
    let skipped = 0;
    let inProgress = 0;
    let focusMins = 0;

    todayActivities.forEach((a) => {
      if (a.status === 'Completed') {
        completed++;
        focusMins += a.duration_minutes || 0;
      } else if (a.status === 'Skipped') {
        skipped++;
      } else if (a.status === 'In Progress') {
        inProgress++;
      }
    });

    const pending = Math.max(0, total - completed - skipped - inProgress);
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      date: todayDateStr,
      totalActivities: total,
      completedActivities: completed,
      skippedActivities: skipped,
      inProgressActivities: inProgress,
      pendingActivities: pending,
      completionPercentage,
      totalFocusedMinutes: focusMins,
    };
  }, [todaySchedules, todayActivities, todayDateStr]);

  // Active in-progress activity (if any)
  const activeActivity = useMemo(() => {
    return todayActivities.find((a) => a.status === 'In Progress') || null;
  }, [todayActivities]);

  // Stopwatch elapsed seconds for in-progress activity
  const activeElapsedTimeSeconds = useMemo(() => {
    if (!activeActivity || !activeActivity.checkin_time) return 0;
    const checkin = new Date(activeActivity.checkin_time).getTime();
    const current = now.getTime();
    return Math.max(0, Math.floor((current - checkin) / 1000));
  }, [activeActivity, now]);

  // Daily Streak
  const streak = useMemo(() => {
    return calculateStreak(activities);
  }, [activities]);

  // Productivity Score (0 to 100)
  const productivityScore = useMemo(() => {
    // 60% completion rate, 25% focus minutes (scaled to 120 mins), 15% streak (scaled to 7 days)
    const completionWeight = (todayStats.completionPercentage / 100) * 60;
    const focusWeight = Math.min(25, (todayStats.totalFocusedMinutes / 120) * 25);
    const streakWeight = Math.min(15, (streak / 7) * 15);
    return Math.min(100, Math.round(completionWeight + focusWeight + streakWeight));
  }, [todayStats, streak]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const addNewSchedule = async (
    data: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<ScheduleItem> => {
    if (!user) throw new Error('Not authenticated');
    const created = await createSchedule(user.id, data);
    setSchedules((prev) => [...prev, created]);
    return created;
  };

  const modifySchedule = async (id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> => {
    if (!user) throw new Error('Not authenticated');
    const updated = await updateSchedule(user.id, id, updates);
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const removeScheduleItem = async (id: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await deleteSchedule(user.id, id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateScheduleItem = async (id: string): Promise<ScheduleItem> => {
    if (!user) throw new Error('Not authenticated');
    const target = schedules.find((s) => s.id === id);
    if (!target) throw new Error('Schedule not found');

    const copyData: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title: `${target.title} (Copy)`,
      description: target.description,
      category: target.category,
      start_time: target.start_time,
      end_time: target.end_time,
      days: [...target.days],
      order_index: schedules.length,
      is_active: target.is_active,
    };

    const duplicated = await createSchedule(user.id, copyData);
    setSchedules((prev) => [...prev, duplicated]);
    return duplicated;
  };

  const toggleScheduleStatus = async (id: string): Promise<void> => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;
    await modifySchedule(id, { is_active: !target.is_active });
  };

  const importRoutine = async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    setIsLoadingData(true);
    try {
      const imported = await importDefaultRoutine(user.id);
      setSchedules((prev) => [...prev, ...imported]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const checkIn = async (schedule: ScheduleItem): Promise<ActivityRecord> => {
    if (!user) throw new Error('Not authenticated');

    const timeStatus = getScheduleTimeWindowStatus(schedule.start_time, schedule.end_time, currentMinutesNow);
    if (!timeStatus.isWithinWindow) {
      throw new Error(
        `Check-in is only allowed during the scheduled window (${formatTime12h(schedule.start_time)} — ${formatTime12h(schedule.end_time)}).`
      );
    }

    sounds.playCheckInSound();
    const record = await recordCheckIn(user.id, schedule.id, schedule.title, schedule.category, todayDateStr);
    setActivities((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
    return record;
  };

  const completeCurrentActivity = async (
    activityId: string,
    durationMinutes: number,
    notes = ''
  ): Promise<ActivityRecord> => {
    if (!user) throw new Error('Not authenticated');
    sounds.playCompleteFanfare();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#0066FF', '#00C2FF', '#38D3FF', '#10B981', '#ffffff'],
      });
    } catch {
      // Ignore if canvas is not ready
    }

    const updated = await completeActivity(user.id, activityId, durationMinutes, notes);
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === activityId) {
          return {
            ...updated,
            title: updated.title || a.title,
            category: updated.category || a.category,
          };
        }
        return a;
      })
    );
    return updated;
  };

  const skipCurrentSchedule = async (schedule: ScheduleItem, notes = ''): Promise<ActivityRecord> => {
    if (!user) throw new Error('Not authenticated');
    const record = await skipActivity(user.id, schedule.id, schedule.title, schedule.category, notes, todayDateStr);
    setActivities((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
    return record;
  };

  const logFocusSession = async (
    minutes: number,
    notes = 'Dedicated Focus Session',
    title = 'Focus Session',
    category: ScheduleCategory = 'Development'
  ): Promise<ActivityRecord> => {
    if (!user) throw new Error('Not authenticated');
    sounds.playTimerChime();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00C2FF', '#0066FF', '#818CF8'],
      });
    } catch {
      // Ignore
    }

    const record = await recordFocusSession(user.id, minutes, notes, title, category);
    setActivities((prev) => [record, ...prev]);
    return record;
  };

  return (
    <DataContext.Provider
      value={{
        schedules,
        activities,
        isLoadingData,
        todayTimeline,
        currentScheduleItem,
        nextScheduleItem,
        currentProgressPct,
        todayStats,
        streak,
        productivityScore,
        activeActivity,
        activeElapsedTimeSeconds,
        currentMinutesNow,
        addNewSchedule,
        modifySchedule,
        removeScheduleItem,
        duplicateScheduleItem,
        toggleScheduleStatus,
        importRoutine,
        checkIn,
        completeCurrentActivity,
        skipCurrentSchedule,
        logFocusSession,
        refreshAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    return {
      schedules: [],
      activities: [],
      isLoadingData: false,
      todayTimeline: [],
      currentScheduleItem: null,
      nextScheduleItem: null,
      currentProgressPct: 0,
      todayStats: {
        date: new Date().toISOString().split('T')[0],
        totalActivities: 0,
        completedActivities: 0,
        skippedActivities: 0,
        inProgressActivities: 0,
        pendingActivities: 0,
        completionPercentage: 0,
        totalFocusedMinutes: 0,
      },
      streak: 0,
      productivityScore: 0,
      activeActivity: null,
      activeElapsedTimeSeconds: 0,
      currentMinutesNow: new Date().getHours() * 60 + new Date().getMinutes(),
      addNewSchedule: async () => ({} as any),
      modifySchedule: async () => ({} as any),
      removeScheduleItem: async () => {},
      duplicateScheduleItem: async () => ({} as any),
      toggleScheduleStatus: async () => {},
      importRoutine: async () => {},
      checkIn: async () => ({} as any),
      completeCurrentActivity: async () => ({} as any),
      skipCurrentSchedule: async () => ({} as any),
      logFocusSession: async () => ({} as any),
      refreshAllData: async () => {},
    };
  }
  return context;
}
