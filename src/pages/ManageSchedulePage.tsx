import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ScheduleItem, ScheduleCategory } from '../types';
import { CATEGORY_CONFIG } from '../lib/constants';
import { ScheduleCardManage } from '../components/schedule/ScheduleCardManage';
import { ScheduleFormModal } from '../components/schedule/ScheduleFormModal';
import { Plus, CalendarDays, Search } from 'lucide-react';

export const ManageSchedulePage: React.FC = () => {
  const {
    schedules,
    addNewSchedule,
    modifySchedule,
    removeScheduleItem,
    duplicateScheduleItem,
    toggleScheduleStatus,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const categories = Object.keys(CATEGORY_CONFIG) as ScheduleCategory[];

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedules, selectedCategory, searchQuery]);

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingItem) {
      await modifySchedule(editingItem.id, data);
      setEditingItem(null);
    } else {
      await addNewSchedule(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              <span>Manage Schedule</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              {schedules.length} {schedules.length === 1 ? 'Routine' : 'Routines'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize your daily and weekly routines, customize timings, and toggle active activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 border border-transparent flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-3 transition-all border border-blue-100/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routines by title or keywords..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Category Selector */}
          <div className="w-full sm:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer shadow-xs transition-all font-medium"
            >
              <option value="ALL">All Categories ({schedules.length})</option>
              {categories.map((c) => {
                const count = schedules.filter((s) => s.category === c).length;
                return (
                  <option key={c} value={c}>
                    {c} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick category filter pills */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c;
            const cat = CATEGORY_CONFIG[c];
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  isSelected
                    ? `${cat.bgClass} ${cat.textClass} ${cat.borderClass} ring-2 ring-blue-500/30 shadow-xs`
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule list */}
      {filteredSchedules.length > 0 ? (
        <div className="space-y-3">
          {filteredSchedules.map((schedule) => (
            <ScheduleCardManage
              key={schedule.id}
              schedule={schedule}
              onEdit={handleEdit}
              onDuplicate={duplicateScheduleItem}
              onDelete={removeScheduleItem}
              onToggleActive={toggleScheduleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No schedules match your filter.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
