import React, { useState, useMemo } from 'react';
import { useReminders } from '../contexts/RemindersContext';
import { useAuth } from '../contexts/AuthContext';
import { ReminderItem, ReminderCategory } from '../types';
import { RemindersCalendar } from '../components/reminders/RemindersCalendar';
import { ReminderCard } from '../components/reminders/ReminderCard';
import { ReminderFormModal } from '../components/reminders/ReminderFormModal';
import {
  BellRing,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  CalendarCheck,
  ListFilter,
  Sparkles,
  Download,
} from 'lucide-react';

type FilterTab = 'ALL' | 'TODAY' | 'UPCOMING' | 'HIGH' | 'COMPLETED';

export const RemindersPage: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    reminders,
    selectedDate,
    setSelectedDate,
    stats,
    isLoading,
  } = useReminders();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string>('');
  const [mobileView, setMobileView] = useState<'list' | 'calendar'>('list');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter((item) => {
      // Search
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Tabs
      if (activeTab === 'TODAY') {
        return item.due_date === todayStr && !item.is_completed;
      }
      if (activeTab === 'UPCOMING') {
        return item.due_date > todayStr && !item.is_completed;
      }
      if (activeTab === 'HIGH') {
        return item.priority === 'high' && !item.is_completed;
      }
      if (activeTab === 'COMPLETED') {
        return item.is_completed;
      }

      // Default ALL: if a date is specifically chosen that is not todayStr and user hasn't chosen a special tab,
      // we show items matching the selected date first or all
      return true;
    }).sort((a, b) => {
      // Incomplete first, then by date, then by time
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      const dateCmp = a.due_date.localeCompare(b.due_date);
      if (dateCmp !== 0) return dateCmp;
      return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
    });
  }, [reminders, activeTab, selectedCategory, searchQuery, todayStr]);

  // Selected date's specific reminders
  const selectedDateReminders = useMemo(() => {
    return reminders.filter((r) => r.due_date === selectedDate);
  }, [reminders, selectedDate]);

  const handleOpenAdd = (dateStr?: string) => {
    setEditingReminder(null);
    setModalDefaultDate(dateStr || selectedDate || todayStr);
    setIsFormModalOpen(true);
  };

  const handleEdit = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setIsFormModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = ['Title', 'Category', 'Due Date', 'Due Time', 'Priority', 'Status', 'Description'];
    const rows = reminders.map((r) => [
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.due_date}"`,
      `"${r.due_time || ''}"`,
      `"${r.priority}"`,
      `"${r.is_completed ? 'Completed' : 'Pending'}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
    ]);

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
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BellRing className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              <span>Interactive Reminder Dashboard</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 shadow-2xs">
              {stats.pending} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize study milestones, exam deadlines, and daily reminders with interactive calendar syncing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export reminders to CSV"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/25 border border-transparent flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Reminders */}
        <div className="rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Reminders
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.total}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">{stats.pending} remaining</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
              Active
            </span>
          </div>
        </div>

        {/* Due Today */}
        <div className="rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Due Today
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.dueToday}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 dark:bg-cyan-950/40 dark:text-cyan-400 border border-sky-200 dark:border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Scheduled for today</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30">
              Today
            </span>
          </div>
        </div>

        {/* High Priority */}
        <div className="rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                High Priority
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.highPriority}
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Requires attention</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
              Urgent 🔥
            </span>
          </div>
        </div>

        {/* Completed Rate */}
        <div className="rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Completed
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.completionRate}%
              </div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats.completed} finished</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.completed}/{stats.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Toggle between List View and Calendar View */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-blue-100/70 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'list'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Reminders List ({filteredReminders.length})</span>
        </button>
        <button
          onClick={() => setMobileView('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileView === 'calendar'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Calendar View</span>
        </button>
      </div>

      {/* Main Dual Grid: Interactive Calendar (Left) + Reminders Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Month Calendar (5 cols on lg) */}
        <div className={`lg:col-span-5 space-y-4 ${mobileView === 'calendar' ? 'block' : 'hidden lg:block'}`}>
          <RemindersCalendar onQuickAddDate={(dateStr) => handleOpenAdd(dateStr)} />

          {/* Quick Date Shortcuts */}
          <div className="rounded-2xl bg-white/90 dark:bg-[#0b1220]/90 border border-blue-100/90 dark:border-slate-800/90 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Selected Date Tasks</span>
              <span className="font-mono text-blue-600 dark:text-cyan-400">
                {selectedDateReminders.length} scheduled
              </span>
            </div>

            {selectedDateReminders.length > 0 ? (
              <div className="space-y-1.5">
                {selectedDateReminders.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleEdit(r)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          r.is_completed ? 'bg-emerald-500' : r.priority === 'high' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                      />
                      <span className={`truncate ${r.is_completed ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                        {r.title}
                      </span>
                    </div>
                    {r.due_time && (
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {r.due_time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No reminders scheduled for this date.</p>
            )}

            <button
              onClick={() => handleOpenAdd(selectedDate)}
              className="w-full py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add for {selectedDate}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Reminders List & Filter Controls (7 cols on lg) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
          {/* Search and Filters Bar */}
          <div className="rounded-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800/90 p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reminders by title or keywords..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Category Dropdown */}
              <div className="w-full sm:w-44">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Placement">Placement</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                All ({reminders.length})
              </button>

              <button
                onClick={() => setActiveTab('TODAY')}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'TODAY'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                Today ({stats.dueToday})
              </button>

              <button
                onClick={() => setActiveTab('HIGH')}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'HIGH'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>High Priority ({stats.highPriority})</span>
              </button>

              <button
                onClick={() => setActiveTab('UPCOMING')}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'UPCOMING'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                Upcoming
              </button>

              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>

          {/* Reminders List */}
          {filteredReminders.length > 0 ? (
            <div className="space-y-3">
              {filteredReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur-md p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No reminders found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No reminders match your search terms.'
                  : activeTab === 'COMPLETED'
                  ? 'No completed reminders yet. Mark items off to track your achievements!'
                  : 'All caught up! Add a new reminder or milestone for your studies and work.'}
              </p>
              <button
                onClick={() => handleOpenAdd()}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs inline-flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Reminder</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Reminder Modal */}
      <ReminderFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingReminder(null);
        }}
        initialData={editingReminder}
        defaultDate={modalDefaultDate}
      />
    </div>
  );
};
