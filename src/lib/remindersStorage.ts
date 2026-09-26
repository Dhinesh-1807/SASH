import { getSupabase } from './supabase';
import { ReminderItem, ReminderPriority, ReminderCategory } from '../types';

function getLocalRemindersKey(userId: string) {
  return `sash_reminders_${userId}`;
}

function loadLocalReminders(userId: string): ReminderItem[] {
  try {
    const raw = localStorage.getItem(getLocalRemindersKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading local reminders:', err);
  }
  return [];
}

function saveLocalReminders(userId: string, items: ReminderItem[]) {
  try {
    localStorage.setItem(getLocalRemindersKey(userId), JSON.stringify(items));
  } catch (err) {
    console.error('Failed writing local reminders:', err);
  }
}

function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SAMPLE_REMINDERS: Array<Omit<ReminderItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = [
  {
    title: 'Review LeetCode Dynamic Programming & Graphs',
    description: 'Solve 2 Medium problems focusing on topological sort and memoization.',
    due_date: getTodayStr(),
    due_time: '19:00',
    priority: 'high',
    category: 'Study',
    is_completed: false,
    remind_before_minutes: 15,
  },
  {
    title: 'Submit SASH Full-Stack Dashboard Milestone',
    description: 'Verify all interactive charts, responsive mobile view, and live notifications.',
    due_date: getTodayStr(),
    due_time: '21:30',
    priority: 'high',
    category: 'Work',
    is_completed: false,
    remind_before_minutes: 30,
  },
  {
    title: 'Placement Mock Interview Preparation (OS & DBMS)',
    description: 'Revise ACID properties, indexing structures, and virtual memory paging.',
    due_date: getRelativeDateStr(1),
    due_time: '11:00',
    priority: 'medium',
    category: 'Placement',
    is_completed: false,
    remind_before_minutes: 15,
  },
  {
    title: 'Weekly Tech Architecture & Code Review',
    description: 'Analyze backend queries, optimize response latencies, and review pull requests.',
    due_date: getRelativeDateStr(3),
    due_time: '16:00',
    priority: 'medium',
    category: 'Work',
    is_completed: false,
    remind_before_minutes: 0,
  },
  {
    title: 'Morning Cardio & Flexibility Routine',
    description: 'Completed 30 minutes brisk jog and core bodyweight stretches.',
    due_date: getTodayStr(),
    due_time: '06:30',
    priority: 'low',
    category: 'Health',
    is_completed: true,
    completed_at: new Date().toISOString(),
    remind_before_minutes: 0,
  },
];

export async function fetchReminders(userId: string): Promise<ReminderItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })
        .order('due_time', { ascending: true });

      if (!error && data && data.length > 0) {
        saveLocalReminders(userId, data as ReminderItem[]);
        return data as ReminderItem[];
      }
    } catch (err) {
      console.warn('Supabase fetchReminders fallback:', err);
    }
  }

  // Local storage fallback
  const local = loadLocalReminders(userId);
  if (local && local.length > 0) {
    return local;
  }

  // Pre-seed with sample reminders so the calendar is interactive right away
  const seeded: ReminderItem[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < INITIAL_SAMPLE_REMINDERS.length; i++) {
    const s = INITIAL_SAMPLE_REMINDERS[i];
    seeded.push({
      ...s,
      id: `rem_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId,
      created_at: now,
      updated_at: now,
    });
  }

  saveLocalReminders(userId, seeded);
  return seeded;
}

export async function createReminder(
  userId: string,
  data: Omit<ReminderItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ReminderItem> {
  const newId = crypto.randomUUID
    ? crypto.randomUUID()
    : `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const item: ReminderItem = {
    ...data,
    id: newId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: created, error } = await supabase
        .from('reminders')
        .insert([item])
        .select()
        .single();
      if (!error && created) {
        const local = loadLocalReminders(userId);
        saveLocalReminders(userId, [created as ReminderItem, ...local]);
        return created as ReminderItem;
      }
    } catch (err) {
      console.warn('Supabase createReminder fallback:', err);
    }
  }

  const local = loadLocalReminders(userId);
  const updated = [item, ...local];
  saveLocalReminders(userId, updated);
  return item;
}

export async function updateReminder(
  userId: string,
  id: string,
  updates: Partial<ReminderItem>
): Promise<ReminderItem> {
  const now = new Date().toISOString();
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) {
        const local = loadLocalReminders(userId);
        const next = local.map((r) => (r.id === id ? (data as ReminderItem) : r));
        saveLocalReminders(userId, next);
        return data as ReminderItem;
      }
    } catch (err) {
      console.warn('Supabase updateReminder fallback:', err);
    }
  }

  const local = loadLocalReminders(userId);
  const existing = local.find((r) => r.id === id);
  if (!existing) {
    throw new Error('Reminder not found');
  }

  const updated: ReminderItem = {
    ...existing,
    ...updates,
    updated_at: now,
  };

  const next = local.map((r) => (r.id === id ? updated : r));
  saveLocalReminders(userId, next);
  return updated;
}

export async function deleteReminder(userId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('reminders').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase deleteReminder fallback:', err);
    }
  }

  const local = loadLocalReminders(userId);
  const filtered = local.filter((r) => r.id !== id);
  saveLocalReminders(userId, filtered);
}

export async function toggleReminderCompletion(
  userId: string,
  id: string
): Promise<ReminderItem> {
  const local = loadLocalReminders(userId);
  const target = local.find((r) => r.id === id);
  if (!target) throw new Error('Reminder not found');

  const willBeCompleted = !target.is_completed;
  const updates: Partial<ReminderItem> = {
    is_completed: willBeCompleted,
    completed_at: willBeCompleted ? new Date().toISOString() : undefined,
  };

  return updateReminder(userId, id, updates);
}
