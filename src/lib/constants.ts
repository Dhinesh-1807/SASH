import { ScheduleCategory } from '../types';

export const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const CATEGORY_CONFIG: Record<
  ScheduleCategory,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeColor: string;
    hex: string;
    iconName: string;
  }
> = {
  Learning: {
    label: 'Learning',
    bgClass: 'bg-indigo-50 dark:bg-indigo-500/15',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-500/30',
    badgeColor: 'bg-indigo-500',
    hex: '#6366F1',
    iconName: 'BookOpen',
  },
  Development: {
    label: 'Development',
    bgClass: 'bg-sky-50 dark:bg-cyan-500/15',
    textClass: 'text-sky-700 dark:text-cyan-300',
    borderClass: 'border-sky-200 dark:border-cyan-500/30',
    badgeColor: 'bg-sky-500',
    hex: '#0284C7',
    iconName: 'Code2',
  },
  Placement: {
    label: 'Placement',
    bgClass: 'bg-amber-50 dark:bg-amber-500/15',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-500/30',
    badgeColor: 'bg-amber-500',
    hex: '#D97706',
    iconName: 'Briefcase',
  },
  College: {
    label: 'College',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/15',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-500/30',
    badgeColor: 'bg-emerald-500',
    hex: '#059669',
    iconName: 'GraduationCap',
  },
  Fitness: {
    label: 'Fitness',
    bgClass: 'bg-rose-50 dark:bg-rose-500/15',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-500/30',
    badgeColor: 'bg-rose-500',
    hex: '#E11D48',
    iconName: 'Dumbbell',
  },
  Personal: {
    label: 'Personal',
    bgClass: 'bg-purple-50 dark:bg-purple-500/15',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-500/30',
    badgeColor: 'bg-purple-500',
    hex: '#9333EA',
    iconName: 'User',
  },
  Health: {
    label: 'Health',
    bgClass: 'bg-teal-50 dark:bg-teal-500/15',
    textClass: 'text-teal-800 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-500/30',
    badgeColor: 'bg-teal-500',
    hex: '#0D9488',
    iconName: 'HeartPulse',
  },
  Planning: {
    label: 'Planning',
    bgClass: 'bg-blue-50 dark:bg-blue-500/15',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-500/30',
    badgeColor: 'bg-blue-500',
    hex: '#2563EB',
    iconName: 'CalendarCheck',
  },
  Other: {
    label: 'Other',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-700',
    badgeColor: 'bg-slate-500',
    hex: '#64748B',
    iconName: 'Compass',
  },
};

export const DEFAULT_DS_FOCUS_ROUTINE: Array<{
  title: string;
  category: ScheduleCategory;
  start_time: string;
  end_time: string;
  description: string;
}> = [
  {
    title: 'Wake Up',
    category: 'Personal',
    start_time: '05:00',
    end_time: '05:10',
    description: 'Hydrate, stretch, and start the day with disciplined focus.',
  },
  {
    title: 'Exercise / Walking',
    category: 'Fitness',
    start_time: '05:10',
    end_time: '06:00',
    description: 'Morning brisk walk or light workout to boost metabolism and alertness.',
  },
  {
    title: 'DSA / Coding Practice',
    category: 'Learning',
    start_time: '06:00',
    end_time: '07:00',
    description: 'Solve 2 LeetCode / competitive programming problems with optimal time complexity.',
  },
  {
    title: 'Aptitude Practice',
    category: 'Learning',
    start_time: '07:00',
    end_time: '08:00',
    description: 'Quantitative aptitude, logical reasoning, and verbal speed drills.',
  },
  {
    title: 'Breakfast',
    category: 'Health',
    start_time: '08:00',
    end_time: '09:00',
    description: 'Nutritious breakfast and get ready for college.',
  },
  {
    title: 'College',
    category: 'College',
    start_time: '09:30',
    end_time: '16:30',
    description: 'Lectures, labs, coursework, and campus academic sessions.',
  },
  {
    title: 'Travel / Snack',
    category: 'Personal',
    start_time: '16:30',
    end_time: '17:00',
    description: 'Commute back home, refresh, and evening snack.',
  },
  {
    title: 'Power Nap',
    category: 'Health',
    start_time: '17:00',
    end_time: '17:30',
    description: '20-30 min power recovery nap to restore cognitive clarity.',
  },
  {
    title: 'Cricket / Outdoor Activity',
    category: 'Fitness',
    start_time: '17:30',
    end_time: '18:30',
    description: 'Outdoor sports, cricket match, or cardio with friends.',
  },
  {
    title: 'Project Development',
    category: 'Development',
    start_time: '18:30',
    end_time: '19:30',
    description: 'Active coding on high-impact full-stack portfolio projects.',
  },
  {
    title: 'Dinner',
    category: 'Personal',
    start_time: '19:30',
    end_time: '20:00',
    description: 'Healthy dinner with family.',
  },
  {
    title: 'Project / Data Analytics',
    category: 'Development',
    start_time: '20:00',
    end_time: '21:00',
    description: 'Data analytics, visualization, model exploration, and system architecture.',
  },
  {
    title: 'College Revision',
    category: 'College',
    start_time: '21:00',
    end_time: '21:30',
    description: 'Review lecture notes, submissions, and upcoming exam material.',
  },
  {
    title: 'SQL / Interview Preparation',
    category: 'Placement',
    start_time: '21:30',
    end_time: '22:00',
    description: 'Core CS fundamentals (SQL queries, OS, DBMS, System Design questions).',
  },
  {
    title: 'Free Time',
    category: 'Personal',
    start_time: '22:00',
    end_time: '22:20',
    description: 'Unwind, talk to friends or family, relax.',
  },
  {
    title: 'Plan Tomorrow',
    category: 'Planning',
    start_time: '22:20',
    end_time: '22:30',
    description: 'Review today, prioritize top 3 objectives for tomorrow in D\'s Focus.',
  },
  {
    title: 'Wind Down',
    category: 'Personal',
    start_time: '22:30',
    end_time: '23:00',
    description: 'Screen-off time, light reading, relaxing before bed.',
  },
  {
    title: 'Sleep',
    category: 'Health',
    start_time: '23:00',
    end_time: '05:00',
    description: 'Deep restorative 6 hours of sleep for peak performance.',
  },
];
