// ============================================================================
// DevPilot — Supabase Client & Configuration Verification
// ============================================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Reads credentials from NEXT_PUBLIC_* (Next.js / requested standard) or VITE_* (Vite default)
const supabaseUrl =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  '';

const supabaseAnonKey =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 10 &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Create a robust Supabase client instance with automatic token refresh and persistence
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'devpilot_supabase_auth_token',
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
