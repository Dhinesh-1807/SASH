import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ReminderItem } from '../types';
import { useAuth } from './AuthContext';
import {
  fetchReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminderCompletion,
} from '../lib/remindersStorage';
import { sounds } from '../lib/audio';
import { triggerSystemNotification } from '../lib/notifications';
import confetti from 'canvas-confetti';

interface RemindersStats {
  total: number;
  dueToday: number;
  highPriority: number;
  completed: number;
  pending: number;
  completionRate: number;
}

interface RemindersContextType {
  reminders: ReminderItem[];
  isLoading: boolean;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  addReminder: (
    data: Omit<ReminderItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<ReminderItem>;
  editReminder: (id: string, updates: Partial<ReminderItem>) => Promise<ReminderItem>;
  removeReminder: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  stats: RemindersStats;
  refreshReminders: () => Promise<void>;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export const RemindersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr);

  const notifiedReminderIds = useRef<Set<string>>(new Set());

  const refreshReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchReminders(user.id);
      setReminders(data);
    } catch (err) {
      console.error('Failed loading reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshReminders();
  }, [refreshReminders]);

  const addReminder = async (
    data: Omit<ReminderItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<ReminderItem> => {
    if (!user) throw new Error('User must be logged in to create reminders');
    const created = await createReminder(user.id, data);
    setReminders((prev) => [created, ...prev]);
    return created;
  };

  const editReminder = async (
    id: string,
    updates: Partial<ReminderItem>
  ): Promise<ReminderItem> => {
    if (!user) throw new Error('User must be logged in');
    const updated = await updateReminder(user.id, id, updates);
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const removeReminder = async (id: string): Promise<void> => {
    if (!user) return;
    await deleteReminder(user.id, id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleComplete = async (id: string): Promise<void> => {
    if (!user) return;
    const target = reminders.find((r) => r.id === id);
    const willBeCompleted = target ? !target.is_completed : false;

    const updated = await toggleReminderCompletion(user.id, id);
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));

    if (willBeCompleted) {
      sounds.playCompleteFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0284C7', '#38BDF8', '#10B981', '#6366F1'],
        });
      } catch {
        // Fallback if canvas confetti fails
      }
    }
  };

  const snoozeReminder = async (id: string, minutes: number): Promise<void> => {
    if (!user) return;
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    let newDate = target.due_date;
    let newTime = target.due_time || '09:00';

    if (minutes === 1440) {
      // Tomorrow same time
      const d = new Date(`${target.due_date}T00:00:00`);
      d.setDate(d.getDate() + 1);
      newDate = d.toISOString().split('T')[0];
    } else {
      // Add minutes to due_time
      const [h, m] = newTime.split(':').map(Number);
      const totalMins = h * 60 + m + minutes;
      const nextH = Math.floor(totalMins / 60) % 24;
      const nextM = totalMins % 60;
      newTime = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
      if (totalMins >= 24 * 60) {
        const d = new Date(`${target.due_date}T00:00:00`);
        d.setDate(d.getDate() + 1);
        newDate = d.toISOString().split('T')[0];
      }
    }

    // Reset notified status
    notifiedReminderIds.current.delete(id);

    await editReminder(id, {
      due_date: newDate,
      due_time: newTime,
      is_completed: false,
    });
  };

  // Background reminder notification engine
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const currentTotalMin = curHour * 60 + curMin;

      for (const rem of reminders) {
        if (rem.is_completed) continue;
        if (rem.due_date !== todayStr) continue;
        if (!rem.due_time) continue;

        const [rh, rm] = rem.due_time.split(':').map(Number);
        const remTotalMin = rh * 60 + rm;
        const advanceNotice = rem.remind_before_minutes || 0;
        const targetMin = remTotalMin - advanceNotice;

        // Check if current time is within 1 minute of trigger
        if (Math.abs(currentTotalMin - targetMin) <= 1 && !notifiedReminderIds.current.has(rem.id)) {
          notifiedReminderIds.current.add(rem.id);

          // Audio chime
          sounds.playAlertChime();

          // System Notification
          const title = `Reminder: ${rem.title}`;
          const body = rem.due_time
            ? `Scheduled for ${rem.due_time}${advanceNotice > 0 ? ` (${advanceNotice}m warning)` : ''}. ${rem.description || ''}`
            : rem.description || 'Action required.';

          triggerSystemNotification(title, {
            body,
            icon: '/logo.png',
            tag: `reminder-${rem.id}`,
          });
        }
      }
    };

    const interval = setInterval(checkDueReminders, 25000);
    checkDueReminders();
    return () => clearInterval(interval);
  }, [reminders]);

  // Overall Statistics
  const stats = useMemo(() => {
    const todayStr = getTodayStr();
    let total = reminders.length;
    let dueToday = 0;
    let highPriority = 0;
    let completed = 0;

    for (const r of reminders) {
      if (r.is_completed) {
        completed++;
      } else {
        if (r.due_date === todayStr) dueToday++;
        if (r.priority === 'high') highPriority++;
      }
    }

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      dueToday,
      highPriority,
      completed,
      pending,
      completionRate,
    };
  }, [reminders]);

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        isLoading,
        selectedDate,
        setSelectedDate,
        addReminder,
        editReminder,
        removeReminder,
        toggleComplete,
        snoozeReminder,
        stats,
        refreshReminders,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
};

export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}
