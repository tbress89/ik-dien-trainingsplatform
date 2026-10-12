import { createClient } from '@supabase/supabase-js';
import { ACCOUNTS } from '../features';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The Supabase client, or null when accounts are off or the project isn't configured (tests, local dev
 * without a project, forks). Everything account-related checks for null, so the site works without it.
 * The anon key is public; row-level security in the database protects the data.
 */
export const supabase =
  ACCOUNTS && url && anonKey
    ? createClient(url, anonKey, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } })
    : null;
