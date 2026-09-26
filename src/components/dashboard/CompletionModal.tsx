import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ActivityRecord, ScheduleItem } from '../../types';
import { useData } from '../../contexts/DataContext';
import { CheckCircle2, Clock, FileText, Sparkles } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityRecord | null;
  schedule?: ScheduleItem | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  activity,
  schedule,
}) => {
  const { completeCurrentActivity } = useData();
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activity?.checkin_time) {
      const elapsedMins = Math.max(
        1,
        Math.round((Date.now() - new Date(activity.checkin_time).getTime()) / 60000)
      );
      setDurationMinutes(elapsedMins);
    } else if (schedule) {
      // Calculate scheduled span as default
      const [sh, sm] = schedule.start_time.split(':').map(Number);
      const [eh, em] = schedule.end_time.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff <= 0) diff += 1440;
      setDurationMinutes(diff > 0 ? diff : 30);
    }
  }, [activity, schedule, isOpen]);

  if (!activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeCurrentActivity(activity.id, Number(durationMinutes) || 1, notes.trim());
      onClose();
    } catch (err) {
      console.error('Failed to complete activity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Activity"
      description="Record your focus duration and optional session notes."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {activity.title || schedule?.title || 'Scheduled Activity'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Category: <span className="text-blue-600 dark:text-cyan-400 font-semibold">{activity.category || schedule?.category || 'General'}</span>
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-500/10 border border-blue-300 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Duration (Minutes)
          </label>
          <input
            type="number"
            min="1"
            max="1440"
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-base font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Session Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Solved 2 graph questions, wrote unit tests for auth module..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none shadow-xs"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
          >
            Mark as Completed
          </Button>
        </div>
      </form>
    </Modal>
  );
};
