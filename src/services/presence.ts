// ============================================================================
// DevPilot — Real-Time Online Presence & Heartbeat Tracking
// ============================================================================
import { supabase, isSupabaseConfigured } from './supabase';
import type { UserPresence, OnlineStatus, AuthUser } from '../types';

let presenceChannel: any = null;
let heartbeatInterval: any = null;
let lastActivityTimestamp = Date.now();

export function updateLastActivity() {
  lastActivityTimestamp = Date.now();
}

/**
 * Start presence tracking for the authenticated user
 */
export function startPresenceTracking(user: AuthUser | null) {
  if (!user || !isSupabaseConfigured()) return;

  // Clean up any existing channel
  stopPresenceTracking();

  const getStatus = (): OnlineStatus => {
    if (document.hidden) return 'away';
    const idleSeconds = (Date.now() - lastActivityTimestamp) / 1000;
    if (idleSeconds > 120) return 'away';
    return 'online';
  };

  const channel = supabase.channel('online_presence', {
    config: {
      presence: {
        key: user.id,
      },
    },
  });

  const sendHeartbeat = async () => {
    const status = getStatus();
    await channel.track({
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status,
      lastSeen: new Date().toISOString(),
      currentPage: window.location.pathname,
    });
  };

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await sendHeartbeat();
    }
  });

  presenceChannel = channel;

  // Listen to visibility changes and user interactions
  const onVisibilityChange = () => {
    updateLastActivity();
    sendHeartbeat();
  };

  const onUserInteraction = () => {
    updateLastActivity();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('mousemove', onUserInteraction, { passive: true });
  window.addEventListener('keydown', onUserInteraction, { passive: true });
  window.addEventListener('click', onUserInteraction, { passive: true });

  // Heartbeat every 45 seconds
  heartbeatInterval = setInterval(sendHeartbeat, 45000);
}

/**
 * Stop tracking presence upon logout
 */
export function stopPresenceTracking() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (presenceChannel) {
    presenceChannel.untrack();
    presenceChannel.unsubscribe();
    presenceChannel = null;
  }
}

/**
 * Subscribe to online presence changes (Used by Admin Dashboard)
 */
export function subscribeToOnlineUsers(
  callback: (users: UserPresence[]) => void
): () => void {
  if (!isSupabaseConfigured()) {
    // Provide a sample active session for demonstration
    callback([
      {
        userId: 'current-admin',
        displayName: 'Administrator (You)',
        role: 'admin',
        status: 'online',
        lastSeen: new Date().toISOString(),
        currentPage: window.location.pathname,
      },
    ]);
    return () => {};
  }

  const adminChannel = supabase.channel('admin_presence_listener');

  adminChannel
    .on('presence', { event: 'sync' }, () => {
      const state = adminChannel.presenceState();
      const onlineUsers: UserPresence[] = [];

      for (const key in state) {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const latest = presences[presences.length - 1];
          onlineUsers.push({
            userId: latest.userId || key,
            displayName: latest.displayName || 'DevPilot User',
            email: latest.email,
            phone: latest.phone,
            role: latest.role || 'user',
            status: latest.status || 'online',
            lastSeen: latest.lastSeen || new Date().toISOString(),
            currentPage: latest.currentPage,
          });
        }
      }

      callback(onlineUsers);
    })
    .subscribe();

  return () => {
    adminChannel.unsubscribe();
  };
}
