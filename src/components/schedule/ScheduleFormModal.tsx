import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ScheduleItem, ScheduleCategory } from '../../types';
import { ALL_DAYS, CATEGORY_CONFIG } from '../../lib/constants';
import { Clock, Calendar, Tag, FileText, Check } from 'lucide-react';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: ScheduleItem | null;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('Development');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([...ALL_DAYS]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setStartTime(initialData.start_time.slice(0, 5));
      setEndTime(initialData.end_time.slice(0, 5));
      setSelectedDays(initialData.days.length > 0 ? initialData.days : [...ALL_DAYS]);
      setIsActive(initialData.is_active);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Development');
      setStartTime('06:00');
      setEndTime('07:00');
      setSelectedDays([...ALL_DAYS]);
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const setPresetDays = (preset: 'everyday' | 'weekdays' | 'weekends') => {
    if (preset === 'everyday') setSelectedDays([...ALL_DAYS]);
    if (preset === 'weekdays') setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    if (preset === 'weekends') setSelectedDays(['Saturday', 'Sunday']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        start_time: startTime,
        end_time: endTime,
        days: selectedDays,
        order_index: initialData ? initialData.order_index : 0,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      console.error('Failed saving schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.keys(CATEGORY_CONFIG) as ScheduleCategory[];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Schedule Routine' : 'Add New Schedule Routine'}
      description="Define activity timing, category, and recurrence days."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Activity Name
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DSA / Coding Practice"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((catKey) => {
              const cat = CATEGORY_CONFIG[catKey];
              const isSelected = category === catKey;
              return (
                <button
                  type="button"
                  key={catKey}
                  onClick={() => setCategory(catKey)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                    isSelected
                      ? `${cat.bgClass} ${cat.textClass} ${cat.borderClass} ring-2 ring-blue-500/20 shadow-sm`
                      : 'border-blue-200/70 bg-blue-50/40 text-slate-700 hover:text-blue-900 hover:bg-blue-100/60 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              End Time
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>
        </div>

        {/* Days Recurrence */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Recurring Days
            </label>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setPresetDays('everyday')}
                className="text-blue-600 dark:text-cyan-400 hover:underline px-1 font-semibold"
              >
                All
              </button>
              <span className="text-slate-400">•</span>
              <button
                type="button"
                onClick={() => setPresetDays('weekdays')}
                className="text-blue-600 dark:text-cyan-400 hover:underline px-1 font-semibold"
              >
                Weekdays
              </button>
              <span className="text-slate-400">•</span>
              <button
                type="button"
                onClick={() => setPresetDays('weekends')}
                className="text-blue-600 dark:text-cyan-400 hover:underline px-1 font-semibold"
              >
                Weekends
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'bg-blue-50/60 text-slate-700 hover:text-blue-900 hover:bg-blue-100/60 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-blue-200/60 dark:border-transparent'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Description / Goals (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key objectives or focus points..."
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none shadow-xs"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-slate-900 border border-blue-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Enable this routine</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Include in today's dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit / Cancel */}
        <div className="flex justify-end gap-3 pt-3 border-t border-blue-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
