export type ScheduleCategory =
  | 'Learning'
  | 'Development'
  | 'Placement'
  | 'College'
  | 'Fitness'
  | 'Personal'
  | 'Health'
  | 'Planning'
  | 'Other';

export type ActivityStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  gender?: string;
  age?: number;
  profession?: string;
  daily_goal_target: number;
  timezone: string;
  week_starts_on: 'Monday' | 'Sunday';
  created_at: string;
  updated_at?: string;
}

export interface ScheduleItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ScheduleCategory;
  start_time: string; // e.g. "06:00" or "06:00:00"
  end_time: string;   // e.g. "07:00" or "07:00:00"
  days: string[];     // ["Monday", "Tuesday", ...]
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  schedule_id: string | null;
  activity_date: string; // YYYY-MM-DD
  checkin_time: string | null;
  completion_time: string | null;
  status: ActivityStatus;
  duration_minutes: number;
  notes: string;
  created_at?: string;
  // Denormalized/joined schedule details for quick display:
  title?: string;
  category?: ScheduleCategory;
}

export interface TodayTimelineItem {
  schedule: ScheduleItem;
  activity?: ActivityRecord;
  isCurrentlyActive?: boolean;
  isNext?: boolean;
}

export interface DailySummaryStats {
  date: string;
  totalActivities: number;
  completedActivities: number;
  skippedActivities: number;
  inProgressActivities: number;
  pendingActivities: number;
  completionPercentage: number;
  totalFocusedMinutes: number;
}

export interface AnalyticsSummary {
  todayCompletionRate: number;
  weeklyCompletionRate: number;
  currentStreakDays: number;
  totalFocusMinutes: number;
  completedActivitiesCount: number;
  productivityScore: number;
}

export type ReminderPriority = 'low' | 'medium' | 'high';

export type ReminderCategory =
  | 'General'
  | 'Work'
  | 'Study'
  | 'Placement'
  | 'Personal'
  | 'Health'
  | 'Urgent';

export interface ReminderItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:MM
  priority: ReminderPriority;
  category: ReminderCategory;
  is_completed: boolean;
  completed_at?: string;
  remind_before_minutes?: number; // 0, 15, 30, 60
  created_at: string;
  updated_at?: string;
}

