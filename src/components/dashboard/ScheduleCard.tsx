import React, { useState } from 'react';
import { ScheduleItem, ActivityRecord } from '../../types';
import { CATEGORY_CONFIG } from '../../lib/constants';
import { useData } from '../../contexts/DataContext';
import { formatTime12h, getDurationLabel, getScheduleTimeWindowStatus } from '../../lib/time';
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  SkipForward,
  Check,
  FileText,
  Lock,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { CompletionModal } from './CompletionModal';

interface ScheduleCardProps {
  schedule: ScheduleItem;
  activity?: ActivityRecord;
  isCurrentlyActive?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  activity,
  isCurrentlyActive = false,
}) => {
  const { checkIn, skipCurrentSchedule, activeElapsedTimeSeconds, currentMinutesNow } = useData();
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const category = CATEGORY_CONFIG[schedule.category] || CATEGORY_CONFIG.Other;
  const status = activity?.status || 'Pending';
  const duration = getDurationLabel(schedule.start_time, schedule.end_time);
  const timeStatus = getScheduleTimeWindowStatus(
    schedule.start_time,
    schedule.end_time,
    currentMinutesNow
  );

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    if (!timeStatus.isWithinWindow) {
      setActionError(`Check-in is only available between ${formatTime12h(schedule.start_time)} and ${formatTime12h(schedule.end_time)}.`);
      return;
    }
    setIsActionLoading(true);
    setActionError('');
    try {
      await checkIn(schedule);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unable to check in right now.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsActionLoading(true);
    try {
      await skipCurrentSchedule(schedule, skipReason);
      setIsSkipModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
          isCurrentlyActive
            ? 'bg-blue-50/50 dark:bg-cyan-950/20 border-blue-400 dark:border-cyan-500/60 ring-2 ring-blue-500/20 dark:ring-cyan-500/30 shadow-md'
            : status === 'Completed'
            ? 'bg-emerald-50/15 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40 shadow-xs'
            : 'bg-white/95 dark:bg-[#0b1220]/90 border-blue-100/80 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:border-blue-200 dark:hover:border-slate-700'
        }`}
      >
        {/* Subtle Category Left Accent Pill */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${category.badgeColor}`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-3">
          {/* Left Info Block */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Header Metadata Pill Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Time Pill */}
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-cyan-200 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>
                  {formatTime12h(schedule.start_time)} — {formatTime12h(schedule.end_time)}
                </span>
                {duration && (
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold pl-1 border-l border-slate-200 dark:border-slate-700">
                    {duration}
                  </span>
                )}
              </span>

              {/* Category Pill */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${category.bgClass} ${category.textClass} ${category.borderClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${category.badgeColor}`} />
                {category.label}
              </span>

              {/* Status Badges */}
              {status === 'Completed' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Completed ({activity?.duration_minutes || 0}m)</span>
                </span>
              )}

              {status === 'In Progress' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-blue-200 dark:border-cyan-400/40 shadow-2xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                  <span>In Progress</span>
                </span>
              )}

              {status === 'Pending' && (
                <>
                  {timeStatus.isWithinWindow ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/40 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
                      <span>Available Now</span>
                    </span>
                  ) : timeStatus.isUpcoming ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Upcoming</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 shadow-2xs">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Window Passed</span>
                    </span>
                  )}
                </>
              )}

              {status === 'Skipped' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <SkipForward className="w-3 h-3 text-slate-400" />
                  <span>{activity?.notes?.includes('Auto-skipped') ? 'Auto-Skipped' : 'Skipped'}</span>
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {schedule.title}
              </h3>

              {schedule.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                  {schedule.description}
                </p>
              )}
            </div>

            {/* Session Notes if completed */}
            {activity?.notes && (
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-xl px-3 py-2 flex items-start gap-2 mt-1 italic">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>"{activity.notes}"</span>
              </div>
            )}

            {/* Error Message banner */}
            {actionError && (
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 pt-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {status === 'Pending' && (
              <div className="flex items-center gap-2">
                {timeStatus.isWithinWindow ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/25 border border-transparent transition-all transform active:scale-95 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Check In</span>
                  </button>
                ) : timeStatus.isUpcoming ? (
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-not-allowed shadow-2xs select-none"
                    title={`Check-in unlocks at ${formatTime12h(schedule.start_time)}`}
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Unlocks at {formatTime12h(schedule.start_time)}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-not-allowed shadow-2xs select-none"
                    title={`Scheduled window has closed`}
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Window Closed</span>
                  </button>
                )}

                <button
                  onClick={() => setIsSkipModalOpen(true)}
                  disabled={isActionLoading}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                  title="Skip Activity"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === 'In Progress' && (
              <div className="flex items-center gap-2">
                {/* Live elapsed timer */}
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-300 dark:border-cyan-500/40 rounded-xl font-mono text-blue-700 dark:text-cyan-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{formatElapsed(activeElapsedTimeSeconds)}</span>
                </div>

                <button
                  onClick={() => setIsCompletionModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-transparent transition-all transform active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete</span>
                </button>
              </div>
            )}

            {status === 'Completed' && (
              <button
                onClick={() => setIsCompletionModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-cyan-300 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Edit Notes"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Notes</span>
              </button>
            )}

            {status === 'Skipped' && (
              <div className="flex items-center gap-1.5">
                {timeStatus.isWithinWindow ? (
                  <button
                    onClick={handleCheckIn}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Re-open Check In"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-open</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Time Ended</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        activity={activity || null}
        schedule={schedule}
      />

      {/* Skip confirmation modal */}
      {isSkipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0b1220] border border-blue-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-800 dark:text-slate-100">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                Skip "{schedule.title}"?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will mark this routine as skipped for today's analytics.
              </p>
            </div>

            <textarea
              rows={2}
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Reason for skipping (e.g. Exams, Travel, Sick leave)..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-cyan-400 transition-all"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSkipModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isActionLoading}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 transition-colors"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
