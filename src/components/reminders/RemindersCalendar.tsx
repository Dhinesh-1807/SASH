import React, { useState, useMemo } from 'react';
import { useReminders } from '../../contexts/RemindersContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface RemindersCalendarProps {
  onQuickAddDate?: (dateStr: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const RemindersCalendar: React.FC<RemindersCalendarProps> = ({ onQuickAddDate }) => {
  const { reminders, selectedDate, setSelectedDate } = useReminders();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const monthYearLabel = useMemo(() => {
    return currentMonthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentMonthDate]);

  // Group reminders by due_date
  const remindersByDate = useMemo(() => {
    const map = new Map<string, typeof reminders>();
    for (const r of reminders) {
      const existing = map.get(r.due_date) || [];
      existing.push(r);
      map.set(r.due_date, existing);
    }
    return map;
  }, [reminders]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Days in current month
    const totalDays = lastDayOfMonth.getDate();

    // Day of week for 1st of month: 0 (Sun) to 6 (Sat)
    // Convert to Monday = 0, ..., Sunday = 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      prevDays.push({ dateStr, dayNum, isCurrentMonth: false });
    }

    // Current month days
    const currentDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let day = 1; day <= totalDays; day++) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
      currentDays.push({ dateStr, dayNum: day, isCurrentMonth: true });
    }

    // Next month filler days (fill up to 35 or 42 cells)
    const totalCells = Math.ceil((prevDays.length + currentDays.length) / 7) * 7;
    const nextDaysCount = totalCells - (prevDays.length + currentDays.length);
    const nextDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let day = 1; day <= nextDaysCount; day++) {
      const d = new Date(year, month + 1, day);
      const dateStr = d.toISOString().split('T')[0];
      nextDays.push({ dateStr, dayNum: day, isCurrentMonth: false });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonthDate]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-100/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-blue-200/80 dark:border-cyan-500/30">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {monthYearLabel}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select date to filter reminders or click <span className="font-semibold text-blue-600 dark:text-cyan-400">+</span> to add
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleJumpToday}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            Today
          </button>

          <div className="flex items-center rounded-xl border border-blue-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid Matrix */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarDays.map(({ dateStr, dayNum, isCurrentMonth }) => {
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const dayReminders = remindersByDate.get(dateStr) || [];
          const hasReminders = dayReminders.length > 0;

          const pendingCount = dayReminders.filter((r) => !r.is_completed).length;
          const hasHighPriority = dayReminders.some((r) => !r.is_completed && r.priority === 'high');
          const isAllCompleted = hasReminders && pendingCount === 0;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`group relative min-h-[58px] sm:min-h-[70px] p-1 sm:p-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
                  : isToday
                  ? 'bg-blue-50/80 dark:bg-cyan-950/20 border-blue-400 dark:border-cyan-500/50 shadow-2xs'
                  : isCurrentMonth
                  ? 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-cyan-500/40 hover:bg-blue-50/30 dark:hover:bg-slate-800/40'
                  : 'bg-slate-50/40 dark:bg-slate-900/20 border-transparent text-slate-400 dark:text-slate-600 hover:border-slate-200 dark:hover:border-slate-800'
              }`}
            >
              {/* Day Number and Quick Add Button */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold leading-none ${
                    isSelected
                      ? 'text-white'
                      : isToday
                      ? 'text-blue-700 dark:text-cyan-400 font-black'
                      : isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Quick Add Button on Hover */}
                {onQuickAddDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAddDate(dateStr);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-md transition-opacity ${
                      isSelected
                        ? 'hover:bg-blue-700 text-white'
                        : 'hover:bg-blue-100 text-blue-600 dark:hover:bg-slate-700 dark:text-cyan-400'
                    }`}
                    title={`Add reminder for ${dateStr}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Reminders Indicator Badges */}
              {hasReminders && (
                <div className="mt-1 flex flex-col gap-0.5">
                  {/* Indicators Preview */}
                  <div className="flex items-center gap-1">
                    {hasHighPriority && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-300' : 'bg-rose-500 animate-pulse'
                        }`}
                        title="High priority reminder"
                      />
                    )}
                    {isAllCompleted ? (
                      <CheckCircle2
                        className={`w-3 h-3 ${
                          isSelected ? 'text-white' : 'text-emerald-500'
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-[9px] font-bold px-1 rounded-sm leading-tight truncate ${
                          isSelected
                            ? 'bg-blue-700/80 text-white'
                            : hasHighPriority
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-cyan-950/50 dark:text-cyan-300'
                        }`}
                      >
                        {dayReminders.length} {dayReminders.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>High Priority</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Scheduled</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>All Done</span>
          </span>
        </div>

        <div className="text-right font-medium">
          Selected: <strong className="text-slate-900 dark:text-white font-mono">{selectedDate}</strong>
        </div>
      </div>
    </div>
  );
};
