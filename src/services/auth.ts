// ============================================================================
// DevPilot — Authentication Service (Google OAuth, Phone OTP, Account Linking)
// ============================================================================
import { supabase, isSupabaseConfigured } from './supabase';
import type { AuthUser, UserProfile, UserRole } from '../types';

export const ADMIN_EMAILS: string[] = (
  import.meta.env.VITE_ADMIN_EMAILS || 'devanshjain996@gmail.com'
)
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Check if the given email has administrator privileges
 */
export function isUserAdmin(email?: string, role?: string): boolean {
  if (role === 'admin') return true;
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Initiate Google OAuth authentication
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      ),
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Send SMS One-Time Password (OTP) to a mobile phone number
 */
export async function sendPhoneOtp(phone: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        'Supabase is not configured yet. Please configure your Supabase project with Twilio / SMS provider.'
      ),
    };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: 'sms',
      },
    });
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Verify received Phone OTP
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<{ user: AuthUser | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: new Error('Supabase is not configured.'),
    };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms',
    });

    if (error) return { user: null, error };
    if (!data.user) return { user: null, error: new Error('No user returned from verification.') };

    const authUser = formatSupabaseUser(data.user);
    // Ensure profile row exists
    await syncUserProfile(authUser);
    return { user: authUser, error: null };
  } catch (err) {
    return { user: null, error: err as Error };
  }
}

/**
 * Link or update phone number on existing authenticated account
 */
export async function linkPhoneNumber(phone: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured.') };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.updateUser({
      phone: formattedPhone,
    });
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Verify the OTP sent to link phone number
 */
export async function verifyPhoneLinking(
  phone: string,
  token: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured.') };
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'phone_change',
    });

    if (!error) {
      // Mark phone as verified in profiles
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await supabase
          .from('profiles')
          .update({
            phone: formattedPhone,
            phone_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);
      }
    }

    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Sign out current session and invalidate tokens
 */
export async function signOut(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    localStorage.removeItem('devpilot_mock_user');
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Format raw Supabase User object into DevPilot AuthUser
 */
export function formatSupabaseUser(user: any): AuthUser {
  const email = user.email || user.user_metadata?.email;
  const phone = user.phone || user.user_metadata?.phone;
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email?.split('@')[0] ||
    (phone ? `User ${phone.slice(-4)}` : 'Developer');
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    undefined;

  const isGoogleVerified = Boolean(
    user.app_metadata?.provider === 'google' ||
      user.identities?.some((i: any) => i.provider === 'google') ||
      (user.email_confirmed_at && email)
  );

  const isPhoneVerified = Boolean(
    user.phone_confirmed_at || user.user_metadata?.phone_verified
  );

  const role: UserRole = isUserAdmin(email, user.app_metadata?.role) ? 'admin' : 'user';

  return {
    id: user.id,
    email,
    phone,
    displayName: name,
    avatarUrl,
    isGoogleVerified,
    isPhoneVerified,
    role,
    createdAt: user.created_at || new Date().toISOString(),
    lastLoginAt: user.last_sign_in_at || new Date().toISOString(),
  };
}

/**
 * Synchronize user profile in `profiles` table
 */
export async function syncUserProfile(user: AuthUser): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!existing) {
      const newProfile: any = {
        id: user.id,
        name: user.displayName,
        email: user.email,
        phone: user.phone,
        email_verified: user.isGoogleVerified,
        phone_verified: user.isPhoneVerified,
        avatar_url: user.avatarUrl,
        role: user.role,
        bio: 'Passionate software engineer building modern applications.',
        career_goal: 'Become a high-impact senior engineer',
        portfolio_visible: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      await supabase.from('profiles').insert(newProfile);
      return mapProfileFromDb(newProfile);
    } else {
      // Update last login
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          email_verified: user.isGoogleVerified || existing.email_verified,
          phone_verified: user.isPhoneVerified || existing.phone_verified,
          role: user.role === 'admin' ? 'admin' : existing.role,
        })
        .eq('id', user.id);

      return mapProfileFromDb(existing);
    }
  } catch (err) {
    console.warn('Sync profile error:', err);
    return null;
  }
}

/**
 * Fetch profile for a given user
 */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return mapProfileFromDb(data);
  } catch {
    return null;
  }
}

/**
 * Update user profile details
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.bio !== undefined) dbPayload.bio = updates.bio;
    if (updates.careerGoal !== undefined) dbPayload.career_goal = updates.careerGoal;
    if (updates.college !== undefined) dbPayload.college = updates.college;
    if (updates.github !== undefined) dbPayload.github = updates.github;
    if (updates.linkedin !== undefined) dbPayload.linkedin = updates.linkedin;
    if (updates.portfolioVisible !== undefined) dbPayload.portfolio_visible = updates.portfolioVisible;
    if (updates.timezone !== undefined) dbPayload.timezone = updates.timezone;
    if (updates.avatarUrl !== undefined) dbPayload.avatar_url = updates.avatarUrl;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;

    dbPayload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId);

    return { error };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Delete account and all associated cloud data
 */
export async function deleteUserAccount(userId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    // Delete user profile (cascades to all user tables due to ON DELETE CASCADE)
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) return { error };

    await supabase.auth.signOut();
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

function mapProfileFromDb(raw: any): UserProfile {
  return {
    id: raw.id,
    userId: raw.id,
    name: raw.name || 'Developer',
    email: raw.email,
    phone: raw.phone,
    emailVerified: raw.email_verified,
    phoneVerified: raw.phone_verified,
    avatarUrl: raw.avatar_url,
    role: raw.role || 'user',
    bio: raw.bio || '',
    careerGoal: raw.career_goal || '',
    college: raw.college,
    github: raw.github,
    linkedin: raw.linkedin,
    portfolioVisible: raw.portfolio_visible ?? true,
    timezone: raw.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    achievements: raw.achievements || [],
    certifications: raw.certifications || [],
    createdAt: raw.created_at,
    lastLoginAt: raw.last_login_at,
  };
}
