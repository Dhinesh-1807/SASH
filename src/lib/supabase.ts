import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'ds_focus_supabase_url';
const STORAGE_KEY_ANON = 'ds_focus_supabase_anon_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;

  const url = storedUrl || envUrl || '';
  const key = storedKey || envKey || '';

  return {
    url: url.trim(),
    key: key.trim(),
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    // Reinitialize client
    supabaseInstance = initClient();
  }
}

let supabaseInstance: SupabaseClient | null = null;

function initClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    supabaseInstance = initClient();
  }
  return supabaseInstance;
}

export async function checkSupabaseTablesStatus(): Promise<{
  checked: boolean;
  profiles: boolean;
  schedules: boolean;
  activities: boolean;
  allExist: boolean;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { checked: false, profiles: false, schedules: false, activities: false, allExist: false };
  }

  try {
    const [pRes, sRes, aRes] = await Promise.all([
      supabase.from('profiles').select('id').limit(1),
      supabase.from('schedules').select('id').limit(1),
      supabase.from('activities').select('id').limit(1),
    ]);

    const isMissing = (err: any) => err && (err.code === 'PGRST205' || err.message?.includes('schema cache'));
    const profiles = !isMissing(pRes.error);
    const schedules = !isMissing(sRes.error);
    const activities = !isMissing(aRes.error);

    return {
      checked: true,
      profiles,
      schedules,
      activities,
      allExist: profiles && schedules && activities,
    };
  } catch {
    return { checked: false, profiles: false, schedules: false, activities: false, allExist: false };
  }
}

