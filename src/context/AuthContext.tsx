// ============================================================================
// DevPilot — Authentication Context & Provider
// ============================================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  signInWithGoogle,
  sendPhoneOtp as apiSendPhoneOtp,
  verifyPhoneOtp as apiVerifyPhoneOtp,
  linkPhoneNumber as apiLinkPhone,
  verifyPhoneLinking as apiVerifyPhoneLink,
  signOut as apiSignOut,
  formatSupabaseUser,
  fetchProfile,
  syncUserProfile,
} from '../services/auth';
import { startPresenceTracking, stopPresenceTracking } from '../services/presence';
import { syncEngine } from '../services/syncEngine';
import { db } from '../store/db';
import type { AuthUser, UserProfile, CloudSyncStatus } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  syncStatus: CloudSyncStatus;
  syncError: string | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  migrationModalOpen: boolean;
  setMigrationModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  sendPhoneOtp: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  linkPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneLink: (phone: string, token: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retrySync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(syncEngine.getStatus());
  const [syncError, setSyncError] = useState<string | null>(syncEngine.getLastError());

  // Listen to sync engine status
  useEffect(() => {
    const unsub = syncEngine.subscribe((status, errorMsg) => {
      setSyncStatus(status);
      setSyncError(errorMsg || null);
    });
    return unsub;
  }, []);

  // Check if there is local unassigned data from previous guest usage
  const checkPendingLocalData = useCallback(async (currentUserId: string) => {
    try {
      const taskCount = await db.tasks.count();
      const timetableCount = await db.timetable.count();
      const problemCount = await db.dsaProblems.count();
      const hasUnassigned =
        (await db.tasks.where('userId').equals('').count()) > 0 ||
        (await db.timetable.where('userId').equals('').count()) > 0 ||
        (await db.tasks.filter((t) => !t.userId).count()) > 0;

      const totalLocalItems = taskCount + timetableCount + problemCount;
      const migrationDismissed = localStorage.getItem(`devpilot_migration_dismissed_${currentUserId}`);

      if (totalLocalItems > 0 && hasUnassigned && !migrationDismissed) {
        setMigrationModalOpen(true);
      }
    } catch (err) {
      console.warn('Check local data error:', err);
    }
  }, []);

  const loadSession = useCallback(async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      // Local development or unconfigured mode
      const stored = localStorage.getItem('devpilot_mock_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setProfile({
            id: parsed.id,
            userId: parsed.id,
            name: parsed.displayName,
            email: parsed.email,
            phone: parsed.phone,
            role: parsed.role,
            bio: 'Local developer profile',
            careerGoal: 'Professional full-stack engineer',
            portfolioVisible: true,
            achievements: [],
            certifications: [],
          });
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = formatSupabaseUser(session.user);
        setUser(authUser);
        syncEngine.setUserId(authUser.id);
        startPresenceTracking(authUser);

        let userProfile = await fetchProfile(authUser.id);
        if (!userProfile) {
          userProfile = await syncUserProfile(authUser);
        }
        setProfile(userProfile);
        checkPendingLocalData(authUser.id);
      } else {
        setUser(null);
        setProfile(null);
        syncEngine.setUserId(null);
        stopPresenceTracking();
      }
    } catch (err) {
      console.error('Session load error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [checkPendingLocalData]);

  useEffect(() => {
    loadSession();

    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const authUser = formatSupabaseUser(session.user);
        setUser(authUser);
        syncEngine.setUserId(authUser.id);
        startPresenceTracking(authUser);

        let userProfile = await fetchProfile(authUser.id);
        if (!userProfile) {
          userProfile = await syncUserProfile(authUser);
        }
        setProfile(userProfile);
        checkPendingLocalData(authUser.id);
      } else {
        setUser(null);
        setProfile(null);
        syncEngine.setUserId(null);
        stopPresenceTracking();
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      stopPresenceTracking();
    };
  }, [loadSession, checkPendingLocalData]);

  const loginWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const sendPhoneOtp = async (phone: string) => {
    return await apiSendPhoneOtp(phone);
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { user: verifiedUser, error } = await apiVerifyPhoneOtp(phone, token);
    if (verifiedUser && !error) {
      setUser(verifiedUser);
      syncEngine.setUserId(verifiedUser.id);
      startPresenceTracking(verifiedUser);
      const userProfile = await fetchProfile(verifiedUser.id);
      setProfile(userProfile);
    }
    return { error };
  };

  const linkPhone = async (phone: string) => {
    return await apiLinkPhone(phone);
  };

  const verifyPhoneLink = async (phone: string, token: string) => {
    const { error } = await apiVerifyPhoneLink(phone, token);
    if (!error && user) {
      await refreshProfile();
    }
    return { error };
  };

  const logout = async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
    syncEngine.setUserId(null);
    stopPresenceTracking();
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  };

  const retrySync = async () => {
    await syncEngine.retrySync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured(),
        syncStatus,
        syncError,
        authModalOpen,
        setAuthModalOpen,
        migrationModalOpen,
        setMigrationModalOpen,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        linkPhone,
        verifyPhoneLink,
        logout,
        refreshProfile,
        retrySync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
