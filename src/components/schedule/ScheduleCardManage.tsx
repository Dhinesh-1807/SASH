import React, { useState } from 'react';
import { ScheduleItem } from '../../types';
import { CATEGORY_CONFIG } from '../../lib/constants';
import { formatTime12h } from '../dashboard/CurrentFocusBanner';
import { Edit2, Copy, Trash2, Clock, Calendar, AlertTriangle } from 'lucide-react';

interface ScheduleCardManageProps {
  schedule: ScheduleItem;
  onEdit: (item: ScheduleItem) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

function getDurationLabel(start: string, end: string): string {
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

export const ScheduleCardManage: React.FC<ScheduleCardManageProps> = ({
  schedule,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const category = CATEGORY_CONFIG[schedule.category] || CATEGORY_CONFIG.Other;
  const duration = getDurationLabel(schedule.start_time, schedule.end_time);

  return (
    <>
      <div
        className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-200 relative overflow-hidden border border-blue-100/90 dark:border-slate-800 shadow-xs hover:shadow-md ${
          !schedule.is_active
            ? 'opacity-65 bg-slate-50/70 dark:bg-slate-900/40'
            : 'bg-white/95 dark:bg-slate-900/80 hover:border-blue-300 dark:hover:border-cyan-500/40'
        }`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${category.badgeColor}`} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
          {/* Main Info */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Time Pill */}
              <span className="text-xs font-mono font-bold text-blue-950 dark:text-cyan-200 bg-blue-50/90 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>
                  {formatTime12h(schedule.start_time)} — {formatTime12h(schedule.end_time)}
                </span>
                {duration && (
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold pl-1 border-l border-blue-200 dark:border-slate-700">
                    {duration}
                  </span>
                )}
              </span>

              {/* Category Badge */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${category.bgClass} ${category.textClass} ${category.borderClass} shadow-2xs flex items-center gap-1`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${category.badgeColor}`} />
                {category.label}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  schedule.is_active
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {schedule.is_active ? 'Active' : 'Paused'}
              </span>
            </div>

            {/* Task Title (High Contrast) */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {schedule.title}
            </h3>

            {/* Description */}
            {schedule.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {schedule.description}
              </p>
            )}

            {/* Recurrence Days Badges */}
            <div className="flex items-center gap-1.5 pt-0.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
              <div className="flex flex-wrap items-center gap-1">
                {schedule.days.length === 7 ? (
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-cyan-300 bg-blue-50/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-slate-700">
                    Every Day
                  </span>
                ) : (
                  schedule.days.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-blue-200/60 dark:border-slate-700 font-semibold font-mono"
                    >
                      {d.slice(0, 3)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center p-1.5 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl border border-blue-100/80 dark:border-slate-800">
            {/* Active Toggle Switch */}
            <div className="flex items-center pr-1.5 border-r border-blue-200/70 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onToggleActive(schedule.id)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  schedule.is_active ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title={schedule.is_active ? 'Pause Routine' : 'Activate Routine'}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    schedule.is_active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Edit */}
            <button
              onClick={() => onEdit(schedule)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700/80 rounded-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-slate-600 shadow-2xs"
              title="Edit Routine"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Duplicate */}
            <button
              onClick={() => onDuplicate(schedule.id)}
              className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-white dark:hover:bg-slate-700/80 rounded-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-slate-600 shadow-2xs"
              title="Duplicate Routine"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 shadow-2xs"
              title="Delete Routine"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Delete Routine?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <span className="text-slate-900 dark:text-white font-semibold">"{schedule.title}"</span>? This cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(schedule.id);
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
              >
                Delete Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
