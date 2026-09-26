import React, { useState, useEffect } from 'react';
import { ReminderItem, ReminderPriority, ReminderCategory } from '../../types';
import { useReminders } from '../../contexts/RemindersContext';
import {
  X,
  BellRing,
  Calendar,
  Clock,
  Flame,
  BookOpen,
  Briefcase,
  GraduationCap,
  HeartPulse,
  User,
  Zap,
} from 'lucide-react';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ReminderItem | null;
  defaultDate?: string;
}

const CATEGORIES: Array<{ key: ReminderCategory; label: string; icon: React.ElementType }> = [
  { key: 'Study', label: 'Study', icon: BookOpen },
  { key: 'Work', label: 'Work', icon: Briefcase },
  { key: 'Placement', label: 'Placement', icon: GraduationCap },
  { key: 'Health', label: 'Health', icon: HeartPulse },
  { key: 'Personal', label: 'Personal', icon: User },
  { key: 'Urgent', label: 'Urgent', icon: Zap },
  { key: 'General', label: 'General', icon: Calendar },
];

export const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultDate,
}) => {
  const { addReminder, editReminder } = useReminders();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('Study');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [remindBefore, setRemindBefore] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setDueDate(initialData.due_date);
      setDueTime(initialData.due_time || '18:00');
      setRemindBefore(initialData.remind_before_minutes ?? 15);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Study');
      setPriority('medium');
      setDueDate(defaultDate || new Date().toISOString().split('T')[0]);
      setDueTime('18:00');
      setRemindBefore(15);
    }
    setError('');
  }, [initialData, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a reminder title');
      return;
    }
    if (!dueDate) {
      setError('Please choose a due date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (initialData) {
        await editReminder(initialData.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          due_date: dueDate,
          due_time: dueTime || undefined,
          remind_before_minutes: remindBefore,
        });
      } else {
        await addReminder({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          priority,
          due_date: dueDate,
          due_time: dueTime || undefined,
          remind_before_minutes: remindBefore,
          is_completed: false,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0b1220] border border-blue-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-blue-200/80 dark:border-cyan-500/30">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {initialData ? 'Edit Reminder' : 'New Interactive Reminder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plan deadlines, study sessions, and milestone reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DSA Graphs Mock Test, Submit Project Milestone..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] truncate max-w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low' as ReminderPriority, label: 'Low', color: 'border-slate-300' },
                { key: 'medium' as ReminderPriority, label: 'Medium', color: 'border-amber-400' },
                { key: 'high' as ReminderPriority, label: 'High 🔥', color: 'border-rose-500' },
              ].map((p) => {
                const isSelected = priority === p.key;
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => setPriority(p.key)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? p.key === 'high'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p.key === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Due Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Due Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Time Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Times:</span>
            {[
              { label: 'Morning 09:00', val: '09:00' },
              { label: 'Afternoon 14:00', val: '14:00' },
              { label: 'Evening 18:00', val: '18:00' },
              { label: 'Night 21:00', val: '21:00' },
            ].map((qt) => (
              <button
                type="button"
                key={qt.val}
                onClick={() => setDueTime(qt.val)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-colors ${
                  dueTime === qt.val
                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-cyan-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

          {/* Advance Reminder Notice */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Audio & Notification Alert
            </label>
            <select
              value={remindBefore}
              onChange={(e) => setRemindBefore(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
            >
              <option value={0}>At time of event (Exact)</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key objectives, links, or context..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/25 transition-all transform active:scale-95"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Reminder' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
