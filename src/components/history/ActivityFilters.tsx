import React from 'react';
import { ScheduleCategory } from '../../types';
import { CATEGORY_CONFIG } from '../../lib/constants';
import { Search } from 'lucide-react';

interface ActivityFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: 'date-desc' | 'date-asc' | 'duration-desc' | 'title';
  onSortChange: (sort: 'date-desc' | 'date-asc' | 'duration-desc' | 'title') => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  const categories = Object.keys(CATEGORY_CONFIG) as ScheduleCategory[];

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 transition-all">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search activities or notes..."
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-44">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Skipped">Skipped</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-40">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-300 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="duration-desc">Longest Duration</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
