/**
 * Time utility functions for SASH
 * Provides 12h formatting, minute conversions, duration calculations,
 * and schedule window status evaluation.
 */

export interface ScheduleTimeStatus {
  isWithinWindow: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  message: string;
}

// Format "HH:MM" or "HH:MM:SS" to "hh:mm A" (e.g. "06:00" -> "06:00 AM")
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  let min = parseInt(parts[1], 10);
  if (isNaN(hour)) hour = 0;
  if (isNaN(min)) min = 0;
  if (min >= 60) {
    hour = (hour + Math.floor(min / 60)) % 24;
    min = min % 60;
  }
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
}

// Convert "HH:MM" to minutes from midnight (0 to 1439)
export function getMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Compute human duration between two time strings (e.g. "06:00" and "07:30" -> "1h 30m")
export function getDurationLabel(start: string, end: string): string {
  try {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = eh * 60 + em - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${mins}m`;
  } catch {
    return '';
  }
}

/**
 * Determine whether a scheduled routine is currently within its assigned time window,
 * upcoming in the future, or in the past.
 */
export function getScheduleTimeWindowStatus(
  startTime: string,
  endTime: string,
  currentMinutes?: number
): ScheduleTimeStatus {
  const current =
    currentMinutes !== undefined
      ? currentMinutes
      : new Date().getHours() * 60 + new Date().getMinutes();

  const startMin = getMinutes(startTime);
  const endMin = getMinutes(endTime);

  const isOvernight = endMin < startMin;
  const isWithinWindow = isOvernight
    ? current >= startMin || current < endMin
    : current >= startMin && current <= endMin;

  if (isWithinWindow) {
    return {
      isWithinWindow: true,
      isUpcoming: false,
      isPast: false,
      message: 'Active Window — Ready to check in',
    };
  }

  if (isOvernight) {
    const isUpcoming = current < startMin && current >= endMin;
    return {
      isWithinWindow: false,
      isUpcoming,
      isPast: !isUpcoming,
      message: `Unlocks at ${formatTime12h(startTime)}`,
    };
  } else {
    if (current < startMin) {
      return {
        isWithinWindow: false,
        isUpcoming: true,
        isPast: false,
        message: `Unlocks at ${formatTime12h(startTime)}`,
      };
    } else {
      return {
        isWithinWindow: false,
        isUpcoming: false,
        isPast: true,
        message: `Window closed at ${formatTime12h(endTime)}`,
      };
    }
  }
}
