// Browser Notification and Alert system for SASH
import { sounds } from './audio';

export interface NotificationPrefs {
  scheduleReminders: boolean;
  activityReminders: boolean;
  dailySummaryNotif: boolean;
}

const STORAGE_KEY_PREFS = 'ds_focus_notif_prefs';

export const DEFAULT_PREFS: NotificationPrefs = {
  scheduleReminders: true,
  activityReminders: true,
  dailySummaryNotif: true,
};

export function getStoredNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveStoredNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed saving notification preferences:', err);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Failed requesting notification permission:', err);
    return 'denied';
  }
}

export function triggerSystemNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    playChime?: 'alert' | 'warning' | 'complete' | 'none';
  }
) {
  // 1. Play audio chime if requested
  if (options?.playChime === 'warning') {
    sounds.playWarningChime();
  } else if (options?.playChime === 'complete') {
    sounds.playCompleteFanfare();
  } else if (options?.playChime !== 'none') {
    sounds.playAlertChime();
  }

  // 2. Fire native browser notification if granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options?.body,
        icon: options?.icon || '/logo.png',
        badge: '/logo.png',
        tag: options?.tag,
      });
    } catch (err) {
      console.warn('Browser notification failed:', err);
    }
  }
}
