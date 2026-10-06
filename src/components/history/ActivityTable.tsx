import React, { useState } from 'react';
import { ActivityRecord } from '../../types';
import { CATEGORY_CONFIG } from '../../lib/constants';
import { useData } from '../../contexts/DataContext';
import { formatTime12h } from '../dashboard/CurrentFocusBanner';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ActivityTableProps {
  activities: ActivityRecord[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ activities }) => {
  const { schedules } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(activities.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleActivities = activities.slice(startIndex, startIndex + itemsPerPage);

  const formatActivityDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeFromIso = (isoStr: string | null) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '—';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
        <p className="text-slate-800 dark:text-slate-300 font-semibold text-sm">No activity history records found</p>
        <p className="text-xs text-slate-500 mt-1">
          Complete routines or try adjusting your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-2xl overflow-hidden border border-blue-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-blue-50/80 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-blue-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Activity Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Start Time</th>
              <th className="py-3.5 px-4">End Time</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 dark:divide-slate-800/60">
            {visibleActivities.map((act) => {
              const matchedSchedule = act.schedule_id
                ? schedules.find((s) => s.id === act.schedule_id)
                : null;
              const cleanNoteTitle = act.notes
                ? act.notes.replace(/^\[(.*?)\]\s*/, '').replace(/\s*\(\d+m\s+logged\)$/, '').trim()
                : '';
              const displayTitle =
                act.title && act.title !== 'Focus Session'
                  ? act.title
                  : (matchedSchedule?.title || cleanNoteTitle || act.title || 'Focus Session');

              let extractedCategory = act.category;
              if ((!extractedCategory || extractedCategory === 'Other') && act.notes) {
                const bracketMatch = act.notes.match(/^\[(.*?)\]/);
                if (bracketMatch && bracketMatch[1]) {
                  const raw = bracketMatch[1];
                  if (raw === 'Development' || raw === 'Learning' || raw === 'Study' || raw === 'Placement' || raw === 'Health' || raw === 'General') {
                    extractedCategory = (raw === 'Learning' ? 'Study' : raw) as any;
                  }
                }
              }
              const displayCategory =
                extractedCategory && extractedCategory !== 'Other'
                  ? extractedCategory
                  : (matchedSchedule?.category || extractedCategory || 'Other');
              const cat = CATEGORY_CONFIG[displayCategory] || CATEGORY_CONFIG.Other;

              return (
                <tr key={act.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatActivityDate(act.activity_date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{displayTitle}</div>
                    {act.notes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1 mt-0.5">
                        "{act.notes}"
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.bgClass} ${cat.textClass} ${cat.borderClass}`}
                    >
                      {cat.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimeFromIso(act.checkin_time)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimeFromIso(act.completion_time)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                    {act.duration_minutes > 0 ? `${act.duration_minutes} min` : '—'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        act.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : act.status === 'In Progress'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-400 border-blue-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {visibleActivities.map((act) => {
          const matchedSchedule = act.schedule_id
            ? schedules.find((s) => s.id === act.schedule_id)
            : null;
          const cleanNoteTitle = act.notes
            ? act.notes.replace(/^\[(.*?)\]\s*/, '').replace(/\s*\(\d+m\s+logged\)$/, '').trim()
            : '';
          const displayTitle =
            act.title && act.title !== 'Focus Session'
              ? act.title
              : (matchedSchedule?.title || cleanNoteTitle || act.title || 'Focus Session');

          let extractedCategory = act.category;
          if ((!extractedCategory || extractedCategory === 'Other') && act.notes) {
            const bracketMatch = act.notes.match(/^\[(.*?)\]/);
            if (bracketMatch && bracketMatch[1]) {
              const raw = bracketMatch[1];
              if (raw === 'Development' || raw === 'Learning' || raw === 'Study' || raw === 'Placement' || raw === 'Health' || raw === 'General') {
                extractedCategory = (raw === 'Learning' ? 'Study' : raw) as any;
              }
            }
          }
          const displayCategory =
            extractedCategory && extractedCategory !== 'Other'
              ? extractedCategory
              : (matchedSchedule?.category || extractedCategory || 'Other');
          const cat = CATEGORY_CONFIG[displayCategory] || CATEGORY_CONFIG.Other;

          return (
            <div key={act.id} className="glass-card rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {formatActivityDate(act.activity_date)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    act.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : act.status === 'In Progress'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-400 border-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {act.status}
                </span>
              </div>

              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                {displayTitle}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className={`px-2 py-0.5 rounded-full border ${cat.bgClass} ${cat.textClass} ${cat.borderClass}`}>
                  {cat.label}
                </span>
                <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">
                  {act.duration_minutes > 0 ? `${act.duration_minutes} min` : '0 min'}
                </span>
              </div>

              {act.notes && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-blue-50/50 dark:bg-slate-900/60 p-2 rounded-lg">
                  "{act.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, activities.length)} of {activities.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-800 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-slate-800 shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
