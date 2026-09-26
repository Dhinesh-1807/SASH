import React, { useState } from 'react';
import { ReminderItem, ReminderCategory } from '../../types';
import { useReminders } from '../../contexts/RemindersContext';
import {
  Check,
  Clock,
  Flame,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  BellRing,
  BookOpen,
  Briefcase,
  GraduationCap,
  HeartPulse,
  User,
  Zap,
} from 'lucide-react';

interface ReminderCardProps {
  reminder: ReminderItem;
  onEdit: (reminder: ReminderItem) => void;
}

const CATEGORY_ICONS: Record<ReminderCategory, React.ElementType> = {
  Study: BookOpen,
  Work: Briefcase,
  Placement: GraduationCap,
  Health: HeartPulse,
  Personal: User,
  Urgent: Zap,
  General: Calendar,
};

const CATEGORY_THEMES: Record<
  ReminderCategory,
  { bg: string; text: string; border: string; dot: string }
> = {
  Study: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  Work: {
    bg: 'bg-sky-50 dark:bg-cyan-500/15',
    text: 'text-sky-700 dark:text-cyan-300',
    border: 'border-sky-200 dark:border-cyan-500/30',
    dot: 'bg-sky-500',
  },
  Placement: {
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  Health: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  Personal: {
    bg: 'bg-purple-50 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-500/30',
    dot: 'bg-purple-500',
  },
  Urgent: {
    bg: 'bg-rose-50 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/30',
    dot: 'bg-rose-500',
  },
  General: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
};

function formatDueCountdown(dueDate: string, dueTime?: string): { text: string; isOverdue: boolean } {
  const now = new Date();
  const dueDateTime = new Date(`${dueDate}T${dueTime || '23:59:59'}`);

  const diffMs = dueDateTime.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiffMin = Math.round(Math.abs(diffMs) / (1000 * 60));

  if (absDiffMin < 60) {
    return {
      text: isOverdue ? `${absDiffMin}m overdue` : `Due in ${absDiffMin}m`,
      isOverdue,
    };
  }

  const hours = Math.floor(absDiffMin / 60);
  if (hours < 24) {
    const remMins = absDiffMin % 60;
    return {
      text: isOverdue ? `${hours}h ${remMins}m overdue` : `Due in ${hours}h ${remMins}m`,
      isOverdue,
    };
  }

  const days = Math.floor(hours / 24);
  return {
    text: isOverdue ? `${days}d overdue` : `Due in ${days}d`,
    isOverdue,
  };
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onEdit }) => {
  const { toggleComplete, removeReminder, snoozeReminder } = useReminders();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[reminder.category] || Calendar;
  const theme = CATEGORY_THEMES[reminder.category] || CATEGORY_THEMES.General;
  const countdown = formatDueCountdown(reminder.due_date, reminder.due_time);

  const priorityStyles = {
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    medium: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[reminder.priority];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeReminder(reminder.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border ${
        reminder.is_completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : 'bg-white/95 dark:bg-[#0b1220]/90 border-blue-100/90 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-cyan-500/40'
      }`}
    >
      {/* Category Left Accent Pip */}
      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${theme.dot}`} />

      <div className="flex items-start gap-3 pl-2.5">
        {/* Checkbox Button */}
        <button
          onClick={() => toggleComplete(reminder.id)}
          className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            reminder.is_completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800'
          }`}
          title={reminder.is_completed ? 'Mark pending' : 'Mark completed'}
        >
          {reminder.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Reminder Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Pill */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${theme.bg} ${theme.text} ${theme.border}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{reminder.category}</span>
            </span>

            {/* Priority Pill */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${priorityStyles}`}
            >
              {reminder.priority === 'high' && <Flame className="w-3 h-3 fill-rose-500" />}
              <span className="capitalize">{reminder.priority} Priority</span>
            </span>

            {/* Countdown / Due status pill */}
            {!reminder.is_completed && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  countdown.isOverdue
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{countdown.text}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug tracking-tight ${
              reminder.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {reminder.title}
          </h4>

          {/* Description */}
          {reminder.description && (
            <p
              className={`text-xs leading-relaxed line-clamp-2 ${
                reminder.is_completed
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {reminder.description}
            </p>
          )}

          {/* Bottom Time & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                {reminder.due_date}
              </span>
              {reminder.due_time && (
                <span className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                  {reminder.due_time}
                </span>
              )}
              {reminder.remind_before_minutes && reminder.remind_before_minutes > 0 ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Alert enabled">
                  <BellRing className="w-3 h-3" />
                  {reminder.remind_before_minutes}m
                </span>
              ) : null}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {!reminder.is_completed && (
                <>
                  <button
                    onClick={() => snoozeReminder(reminder.id, 60)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-slate-700"
                    title="Snooze 1 hour"
                  >
                    +1h
                  </button>

                  <button
                    onClick={() => snoozeReminder(reminder.id, 1440)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-slate-700"
                    title="Snooze to tomorrow"
                  >
                    Tomorrow
                  </button>
                </>
              )}

              <button
                onClick={() => onEdit(reminder)}
                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit reminder"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
