import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { SummaryCards } from '../components/history/SummaryCards';
import { ActivityFilters } from '../components/history/ActivityFilters';
import { ActivityTable } from '../components/history/ActivityTable';
import { History, Download } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { activities, schedules } = useData();
  const { user, profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'duration-desc' | 'title'>('date-desc');

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let result = activities.filter((act) => {
      const matchedSchedule = act.schedule_id ? schedules.find((s) => s.id === act.schedule_id) : null;
      const title =
        act.title && act.title !== 'Focus Session'
          ? act.title
          : (matchedSchedule?.title || act.title || 'Focus Session');
      const category =
        act.category && act.category !== 'Other'
          ? act.category
          : (matchedSchedule?.category || act.category || 'Other');

      // Search
      const matchesSearch =
        !searchTerm ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.notes && act.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'ALL' || category === selectedCategory;

      // Status
      const matchesStatus =
        selectedStatus === 'ALL' || act.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return (b.activity_date + (b.checkin_time || '')).localeCompare(a.activity_date + (a.checkin_time || ''));
      }
      if (sortBy === 'date-asc') {
        return (a.activity_date + (a.checkin_time || '')).localeCompare(b.activity_date + (b.checkin_time || ''));
      }
      if (sortBy === 'duration-desc') {
        return (b.duration_minutes || 0) - (a.duration_minutes || 0);
      }
      if (sortBy === 'title') {
        const titleA = a.title || schedules.find(s => s.id === a.schedule_id)?.title || '';
        const titleB = b.title || schedules.find(s => s.id === b.schedule_id)?.title || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [activities, schedules, searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Export to CSV function
  const handleExportCsv = () => {
    const headers = ['Date', 'Activity', 'Category', 'CheckIn Time', 'Completion Time', 'Duration (Minutes)', 'Status', 'Notes'];
    const rows = activities.map((a) => {
      const matchedSchedule = a.schedule_id ? schedules.find((s) => s.id === a.schedule_id) : null;
      const title =
        a.title && a.title !== 'Focus Session'
          ? a.title
          : (matchedSchedule?.title || a.title || 'Focus Session');
      const category =
        a.category && a.category !== 'Other'
          ? a.category
          : (matchedSchedule?.category || a.category || 'General');

      return [
        `"${a.activity_date}"`,
        `"${title.replace(/"/g, '""')}"`,
        `"${category}"`,
        `"${a.checkin_time || ''}"`,
        `"${a.completion_time || ''}"`,
        a.duration_minutes || 0,
        `"${a.status}"`,
        `"${(a.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    // Format: <username>_SASH_<DATE>.csv
    const rawUsername =
      profile?.full_name ||
      user?.email?.split('@')[0] ||
      'User';
    const sanitizedUsername = rawUsername.trim().replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${sanitizedUsername}_SASH_${dateStr}.csv`;

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            <span>Activity History</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Audit your historical check-ins, focus durations, and performance logs.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Export All CSV</span>
        </button>
      </div>

      {/* Summary Cards (Daily, Weekly, Monthly) */}
      <SummaryCards activities={activities} onExportCsv={handleExportCsv} />

      {/* Filters (Search, Category, Status, Sort) */}
      <ActivityFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Table / Mobile Cards with Pagination */}
      <ActivityTable activities={filteredActivities} />
    </div>
  );
};
