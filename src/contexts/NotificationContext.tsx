import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  NotificationPrefs,
  getStoredNotificationPrefs,
  saveStoredNotificationPrefs,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  triggerSystemNotification,
} from '../lib/notifications';
import { useData } from './DataContext';

export interface InAppAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

interface NotificationContextType {
  prefs: NotificationPrefs;
  updatePrefs: (newPrefs: Partial<NotificationPrefs>) => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  activeAlerts: InAppAlert[];
  dismissAlert: (id: string) => void;
  testNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(getStoredNotificationPrefs);
  const [permission, setPermission] = useState<NotificationPermission>(getBrowserNotificationPermission);
  const [activeAlerts, setActiveAlerts] = useState<InAppAlert[]>([]);

  const { todayTimeline, activeActivity, activeElapsedTimeSeconds, streak, todayStats } = useData();

  // Track notified IDs to prevent duplicate spamming
  const notifiedScheduleIds = useRef<Set<string>>(new Set());
  const notifiedActivityIds = useRef<Set<string>>(new Set());
  const notifiedDailySummaryDate = useRef<string>('');

  const updatePrefs = (newPrefs: Partial<NotificationPrefs>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      saveStoredNotificationPrefs(updated);
      return updated;
    });
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
    return res;
  };

  const pushInAppAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newAlert: InAppAlert = {
      id,
      title,
      message,
      type,
      timestamp: new Date(),
    };

    setActiveAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);

    // Auto-dismiss after 6.5s
    setTimeout(() => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 6500);
  };

  const dismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Immediate Test Function
  const testNotification = () => {
    triggerSystemNotification('SASH Alert 🎯', {
      body: 'Audio chime and notification alert system is working perfectly!',
      playChime: 'alert',
      tag: 'test-notification',
    });

    pushInAppAlert(
      "Notification Test Successful! 🔔",
      "Audio chime was generated and alert triggered. Your notifications are active!",
      'success'
    );
  };

  // Background monitor loop running every 20 seconds
  useEffect(() => {
    const checkScheduleAndActivityReminders = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      const todayDateStr = now.toISOString().split('T')[0];

      // 1. Schedule Start Reminders (5 minutes before scheduled activities begin)
      if (prefs.scheduleReminders) {
        todayTimeline.forEach((item) => {
          if (!item.schedule.start_time || item.activity?.status === 'Completed' || item.activity?.status === 'Skipped') {
            return;
          }

          const [sh, sm] = item.schedule.start_time.split(':').map(Number);
          const startTotalMinutes = sh * 60 + sm;
          const diffMinutes = startTotalMinutes - currentTotalMinutes;

          // Check if activity starts in 1 to 5 minutes
          if (diffMinutes >= 0 && diffMinutes <= 5) {
            const reminderKey = `${todayDateStr}_${item.schedule.id}`;
            if (!notifiedScheduleIds.current.has(reminderKey)) {
              notifiedScheduleIds.current.add(reminderKey);

              const timeText = diffMinutes === 0 ? 'Starting right now' : `Starts in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
              const title = `Upcoming: ${item.schedule.title} ⏰`;
              const body = `${timeText} (${item.schedule.start_time}). Get ready to focus!`;

              triggerSystemNotification(title, {
                body,
                playChime: 'alert',
                tag: reminderKey,
              });

              pushInAppAlert(title, body, 'info');
            }
          }
        });
      }

      // 2. In-Progress Activity Reminders (when activity duration reaches planned duration)
      if (prefs.activityReminders && activeActivity) {
        const actKey = `${activeActivity.id}_duration_warning`;
        if (!notifiedActivityIds.current.has(actKey)) {
          const plannedDuration = activeActivity.duration_minutes || 30;
          const elapsedMins = activeElapsedTimeSeconds / 60;

          if (elapsedMins >= plannedDuration) {
            notifiedActivityIds.current.add(actKey);

            const title = `Focus Time Complete: ${activeActivity.title || 'In-Progress Session'} 🎯`;
            const body = `You've reached your planned ${plannedDuration}m focus goal. Mark it complete to log your achievements!`;

            triggerSystemNotification(title, {
              body,
              playChime: 'warning',
              tag: actKey,
            });

            pushInAppAlert(title, body, 'warning');
          }
        }
      }

      // 3. Daily Productivity Summary (Evening notification around 8:00 PM - 9:00 PM)
      if (prefs.dailySummaryNotif && currentHours >= 20 && notifiedDailySummaryDate.current !== todayDateStr) {
        notifiedDailySummaryDate.current = todayDateStr;

        const totalHours = (todayStats.totalFocusedMinutes / 60).toFixed(1);
        const title = "Daily Productivity Summary 📈";
        const body = `You completed ${todayStats.completedActivities} routines today with ${totalHours}h focused! Current streak: ${streak} days 🔥`;

        triggerSystemNotification(title, {
          body,
          playChime: 'alert',
          tag: `summary_${todayDateStr}`,
        });

        pushInAppAlert(title, body, 'success');
      }
    };

    checkScheduleAndActivityReminders();
    const interval = setInterval(checkScheduleAndActivityReminders, 20000);
    return () => clearInterval(interval);
  }, [prefs, todayTimeline, activeActivity, activeElapsedTimeSeconds, streak, todayStats]);

  return (
    <NotificationContext.Provider
      value={{
        prefs,
        updatePrefs,
        permission,
        requestPermission,
        activeAlerts,
        dismissAlert,
        testNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
