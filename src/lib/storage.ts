import { getSupabase } from './supabase';
import { ScheduleItem, ActivityRecord, UserProfile, ScheduleCategory } from '../types';
import { DEFAULT_DS_FOCUS_ROUTINE } from './constants';

function getLocalDataKey(userId: string) {
  return `ds_focus_data_v1_${userId}`;
}

interface LocalStore {
  profile: UserProfile | null;
  schedules: ScheduleItem[];
  activities: ActivityRecord[];
}

function loadLocalStore(userId: string): LocalStore {
  try {
    const raw = localStorage.getItem(getLocalDataKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading local storage:', err);
  }
  return {
    profile: null,
    schedules: [],
    activities: [],
  };
}

function saveLocalStore(userId: string, data: LocalStore) {
  try {
    localStorage.setItem(getLocalDataKey(userId), JSON.stringify(data));
  } catch (err) {
    console.error('Failed writing local storage:', err);
  }
}

// ==========================================
// PROFILES
// ==========================================
export async function fetchProfile(
  userId: string,
  defaultEmail = '',
  defaultName = ''
): Promise<UserProfile> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          email: data.email || defaultEmail || 'dhinesh@sash.com',
          full_name: data.full_name || defaultName || 'Dhinesh',
          gender: data.gender ?? 'Male',
          age: data.age ?? 22,
          profession: data.profession ?? 'Software Developer',
        } as UserProfile;
      }

      // If profile row doesn't exist in Supabase yet, insert it now so it shows in Supabase Table Editor
      if (!error && !data) {
        const toCreate: Record<string, unknown> = {
          id: userId,
          email: defaultEmail,
          full_name: defaultName || 'Dhinesh',
          gender: 'Male',
          age: 22,
          profession: 'Software Developer',
          daily_goal_target: 6,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          week_starts_on: 'Monday',
        };
        let { data: createdProf, error: insErr } = await supabase
          .from('profiles')
          .upsert([toCreate])
          .select()
          .maybeSingle();

        // If gender/age/profession columns not yet added to Supabase table
        if (
          insErr &&
          (insErr.message.includes('gender') ||
            insErr.message.includes('age') ||
            insErr.message.includes('profession'))
        ) {
          delete toCreate.gender;
          delete toCreate.age;
          delete toCreate.profession;
          const retry = await supabase
            .from('profiles')
            .upsert([toCreate])
            .select()
            .maybeSingle();
          if (!retry.error && retry.data) {
            createdProf = retry.data;
            insErr = null;
          }
        }

        if (!insErr && createdProf) {
          const store = loadLocalStore(userId);
          store.profile = {
            ...createdProf,
            gender: 'Male',
            age: 22,
            profession: 'Software Developer',
          } as UserProfile;
          saveLocalStore(userId, store);
          return store.profile;
        }
      }
    } catch (err) {
      console.warn('Supabase fetchProfile fallback:', err);
    }
  }

  // Fallback to local
  const store = loadLocalStore(userId);
  if (store.profile) {
    return store.profile;
  }

  const newProfile: UserProfile = {
    id: userId,
    full_name: defaultName || 'Dhinesh',
    email: defaultEmail || 'dhinesh@sash.com',
    phone: '',
    gender: 'Male',
    age: 22,
    profession: 'Software Developer',
    daily_goal_target: 6,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    week_starts_on: 'Monday',
    created_at: new Date().toISOString(),
  };
  store.profile = newProfile;
  saveLocalStore(userId, store);
  return newProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      // If Supabase table is missing gender, age, or profession columns,
      // update base columns and preserve demographic values locally
      if (
        error &&
        (error.message.includes('gender') ||
          error.message.includes('age') ||
          error.message.includes('profession'))
      ) {
        console.warn(
          'Supabase profiles table missing gender/age/profession columns. Please run migration SQL in Supabase SQL Editor.'
        );
        const safeUpdates: Record<string, unknown> = { ...updates };
        delete safeUpdates.gender;
        delete safeUpdates.age;
        delete safeUpdates.profession;
        const retry = await supabase
          .from('profiles')
          .update({
            ...safeUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.profile = {
          ...data,
          ...updates,
        } as UserProfile;
        saveLocalStore(userId, store);
        return store.profile;
      }
    } catch (err) {
      console.warn('Supabase updateProfile fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  const current = store.profile || (await fetchProfile(userId));
  const updated: UserProfile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  store.profile = updated;
  saveLocalStore(userId, store);
  return updated;
}

// ==========================================
// SCHEDULES
// ==========================================
export async function fetchSchedules(userId: string): Promise<ScheduleItem[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (!error && data && data.length > 0) {
        const store = loadLocalStore(userId);
        store.schedules = data as ScheduleItem[];
        saveLocalStore(userId, store);
        return data as ScheduleItem[];
      }
    } catch (err) {
      console.warn('Supabase fetchSchedules fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  return store.schedules;
}

export async function createSchedule(
  userId: string,
  schedule: Omit<ScheduleItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ScheduleItem> {
  const newId = crypto.randomUUID ? crypto.randomUUID() : `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const item: ScheduleItem = {
    ...schedule,
    id: newId,
    user_id: userId,
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          id: item.id,
          user_id: userId,
          title: item.title,
          description: item.description,
          category: item.category,
          start_time: item.start_time,
          end_time: item.end_time,
          days: item.days,
          order_index: item.order_index,
          is_active: item.is_active,
        }])
        .select()
        .single();

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.schedules.push(data as ScheduleItem);
        saveLocalStore(userId, store);
        return data as ScheduleItem;
      }
    } catch (err) {
      console.warn('Supabase createSchedule fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  store.schedules.push(item);
  saveLocalStore(userId, store);
  return item;
}

export async function updateSchedule(
  userId: string,
  id: string,
  updates: Partial<ScheduleItem>
): Promise<ScheduleItem> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.schedules = store.schedules.map((s) => (s.id === id ? (data as ScheduleItem) : s));
        saveLocalStore(userId, store);
        return data as ScheduleItem;
      }
    } catch (err) {
      console.warn('Supabase updateSchedule fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  let updatedItem: ScheduleItem | undefined;
  store.schedules = store.schedules.map((s) => {
    if (s.id === id) {
      updatedItem = { ...s, ...updates, updated_at: new Date().toISOString() };
      return updatedItem;
    }
    return s;
  });
  saveLocalStore(userId, store);
  return updatedItem || (store.schedules.find((s) => s.id === id) as ScheduleItem);
}

export async function deleteSchedule(userId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('schedules').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase deleteSchedule fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  store.schedules = store.schedules.filter((s) => s.id !== id);
  saveLocalStore(userId, store);
}

export async function importDefaultRoutine(userId: string): Promise<ScheduleItem[]> {
  const importedItems: ScheduleItem[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < DEFAULT_DS_FOCUS_ROUTINE.length; i++) {
    const def = DEFAULT_DS_FOCUS_ROUTINE[i];
    const created = await createSchedule(userId, {
      title: def.title,
      description: def.description,
      category: def.category as ScheduleCategory,
      start_time: def.start_time,
      end_time: def.end_time,
      days: days,
      order_index: i,
      is_active: true,
    });
    importedItems.push(created);
  }

  return importedItems;
}

// ==========================================
// ACTIVITIES (Check-ins, completions)
// ==========================================
export async function fetchActivities(userId: string, dateLimitDays = 90): Promise<ActivityRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - dateLimitDays);
      const sinceStr = sinceDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', sinceStr)
        .order('activity_date', { ascending: false });

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.activities = data as ActivityRecord[];
        saveLocalStore(userId, store);
        return data as ActivityRecord[];
      }
    } catch (err) {
      console.warn('Supabase fetchActivities fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  return store.activities;
}

export async function recordCheckIn(
  userId: string,
  scheduleId: string | null,
  title: string,
  category: ScheduleCategory,
  targetDateStr?: string
): Promise<ActivityRecord> {
  const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const newId = crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const activityData: ActivityRecord = {
    id: newId,
    user_id: userId,
    schedule_id: scheduleId,
    activity_date: todayStr,
    checkin_time: nowIso,
    completion_time: null,
    status: 'In Progress',
    duration_minutes: 0,
    notes: '',
    title,
    category,
    created_at: nowIso,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          id: activityData.id,
          user_id: userId,
          schedule_id: scheduleId,
          activity_date: todayStr,
          checkin_time: nowIso,
          status: 'In Progress',
          duration_minutes: 0,
          notes: '',
        }])
        .select()
        .single();

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.activities = [data as ActivityRecord, ...store.activities.filter(a => a.id !== data.id)];
        saveLocalStore(userId, store);
        return { ...(data as ActivityRecord), title, category };
      }
    } catch (err) {
      console.warn('Supabase recordCheckIn fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  store.activities = [activityData, ...store.activities];
  saveLocalStore(userId, store);
  return activityData;
}

export async function completeActivity(
  userId: string,
  activityId: string,
  durationMinutes: number,
  notes = ''
): Promise<ActivityRecord> {
  const nowIso = new Date().toISOString();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          completion_time: nowIso,
          status: 'Completed',
          duration_minutes: durationMinutes,
          notes,
        })
        .eq('id', activityId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.activities = store.activities.map(a => a.id === activityId ? (data as ActivityRecord) : a);
        saveLocalStore(userId, store);
        return data as ActivityRecord;
      }
    } catch (err) {
      console.warn('Supabase completeActivity fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  let updated: ActivityRecord | undefined;
  store.activities = store.activities.map(a => {
    if (a.id === activityId) {
      updated = {
        ...a,
        completion_time: nowIso,
        status: 'Completed',
        duration_minutes: durationMinutes,
        notes,
      };
      return updated;
    }
    return a;
  });
  saveLocalStore(userId, store);
  return updated || (store.activities.find(a => a.id === activityId) as ActivityRecord);
}

export async function skipActivity(
  userId: string,
  scheduleId: string | null,
  title: string,
  category: ScheduleCategory,
  notes = '',
  targetDateStr?: string
): Promise<ActivityRecord> {
  const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const newId = crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const activityData: ActivityRecord = {
    id: newId,
    user_id: userId,
    schedule_id: scheduleId,
    activity_date: todayStr,
    checkin_time: null,
    completion_time: nowIso,
    status: 'Skipped',
    duration_minutes: 0,
    notes,
    title,
    category,
    created_at: nowIso,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          id: activityData.id,
          user_id: userId,
          schedule_id: scheduleId,
          activity_date: todayStr,
          status: 'Skipped',
          duration_minutes: 0,
          notes,
        }])
        .select()
        .single();

      if (!error && data) {
        const store = loadLocalStore(userId);
        store.activities = [data as ActivityRecord, ...store.activities.filter(a => a.id !== data.id)];
        saveLocalStore(userId, store);
        return { ...(data as ActivityRecord), title, category };
      }
    } catch (err) {
      console.warn('Supabase skipActivity fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  store.activities = [activityData, ...store.activities];
  saveLocalStore(userId, store);
  return activityData;
}

// Record an independent Focus Timer session
export async function recordFocusSession(
  userId: string,
  minutes: number,
  notes = 'Dedicated Focus Session'
): Promise<ActivityRecord> {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const newId = crypto.randomUUID ? crypto.randomUUID() : `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const activityData: ActivityRecord = {
    id: newId,
    user_id: userId,
    schedule_id: null,
    activity_date: todayStr,
    checkin_time: startTime,
    completion_time: nowIso,
    status: 'Completed',
    duration_minutes: minutes,
    notes,
    title: 'Focus Session',
    category: 'Development',
    created_at: nowIso,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('activities')
        .insert([{
          id: activityData.id,
          user_id: userId,
          schedule_id: null,
          activity_date: todayStr,
          checkin_time: startTime,
          completion_time: nowIso,
          status: 'Completed',
          duration_minutes: minutes,
          notes,
        }])
        .select()
        .single();

      if (data) {
        const store = loadLocalStore(userId);
        store.activities = [data as ActivityRecord, ...store.activities.filter(a => a.id !== data.id)];
        saveLocalStore(userId, store);
        return { ...(data as ActivityRecord), title: 'Focus Session', category: 'Development' };
      }
    } catch (err) {
      console.warn('Supabase recordFocusSession fallback:', err);
    }
  }

  const store = loadLocalStore(userId);
  store.activities = [activityData, ...store.activities];
  saveLocalStore(userId, store);
  return activityData;
}

// Calculate streak: consecutive days with at least 1 completed activity
export function calculateStreak(activities: ActivityRecord[]): number {
  if (!activities || activities.length === 0) return 0;

  const completedDates = new Set(
    activities
      .filter(a => a.status === 'Completed')
      .map(a => a.activity_date)
  );

  if (completedDates.size === 0) return 0;

  let streak = 0;
  const current = new Date();
  const todayStr = current.toISOString().split('T')[0];

  // If completed today, start from today, else if completed yesterday, start from yesterday
  let checkDate = new Date(current);
  if (!completedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];
    if (!completedDates.has(yesterdayStr)) {
      return 0;
    }
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
