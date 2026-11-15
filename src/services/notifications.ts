// ============================================================================
// DevPilot — Notification & Reminder Management Service
// ============================================================================
import { db } from '../store/db';
import { generateId } from '../utils/helpers';
import type { NotificationPreference, NotificationHistoryItem } from '../types';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference = {
  enabled: false,
  browserPermission: 'default',
  categories: {
    college: true,
    python: true,
    cppDsa: true,
    webdev: true,
    systemDesign: true,
    academics: true,
    assignments: true,
    exams: true,
    projects: true,
    dailyGoals: true,
    weeklyReview: true,
  },
  reminderMinutesBefore: 10,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  activeDays: [1, 2, 3, 4, 5, 6, 0], // Every day by default
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const PREFS_KEY = 'devpilot_notification_preferences';
const PROMPT_ANSWERED_KEY = 'devpilot_notification_prompt_answered';

export function getStoredNotificationPreferences(): NotificationPreference {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function saveNotificationPreferences(prefs: NotificationPreference) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  localStorage.setItem(PROMPT_ANSWERED_KEY, 'true');
}

export function hasAnsweredNotificationPrompt(): boolean {
  return localStorage.getItem(PROMPT_ANSWERED_KEY) === 'true';
}

export function dismissNotificationPrompt(neverAskAgain: boolean = false) {
  localStorage.setItem(PROMPT_ANSWERED_KEY, 'true');
  if (neverAskAgain) {
    const current = getStoredNotificationPreferences();
    saveNotificationPreferences({ ...current, enabled: false });
  }
}

/**
 * Register Service Worker for background push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      return reg;
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
      return null;
    }
  }
  return null;
}

/**
 * Request Browser Notification Permission explicitly
 */
export async function requestBrowserNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    const prefs = getStoredNotificationPreferences();
    saveNotificationPreferences({
      ...prefs,
      enabled: permission === 'granted',
      browserPermission: permission,
    });
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Check if the current time falls inside quiet hours
 */
export function isWithinQuietHours(prefs: NotificationPreference, now: Date = new Date()): boolean {
  if (!prefs.quietHoursEnabled) return false;

  const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
  const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // e.g. 01:00 to 06:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight: e.g. 22:00 to 07:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Deliver a notification immediately or record failure if blocked/quiet
 */
export async function deliverNotification(item: {
  title: string;
  body: string;
  category: keyof NotificationPreference['categories'];
  url?: string;
  userId?: string;
}): Promise<boolean> {
  const prefs = getStoredNotificationPreferences();

  // 1. Check if notifications are enabled
  if (!prefs.enabled) return false;

  // 2. Check if category is enabled
  if (!prefs.categories[item.category]) return false;

  // 3. Check quiet hours
  const now = new Date();
  if (isWithinQuietHours(prefs, now)) {
    // Log as skipped/failed due to quiet hours
    await db.notificationHistory.add({
      id: generateId(),
      userId: item.userId,
      title: item.title,
      body: item.body,
      category: String(item.category),
      scheduledFor: now.toISOString(),
      status: 'failed',
      error: 'Quiet hours active',
    });
    return false;
  }

  // 4. Check active days
  const currentDay = now.getDay();
  if (!prefs.activeDays.includes(currentDay)) {
    return false;
  }

  // 5. Deliver notification
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Use service worker notification if available
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          await reg.showNotification(item.title, {
            body: item.body,
            icon: '/vite.svg',
            data: { url: item.url || '/' },
          });
        } else {
          new Notification(item.title, { body: item.body });
        }
      } else {
        new Notification(item.title, { body: item.body });
      }

      // Record in notification history
      await db.notificationHistory.add({
        id: generateId(),
        userId: item.userId,
        title: item.title,
        body: item.body,
        category: String(item.category),
        scheduledFor: now.toISOString(),
        sentAt: now.toISOString(),
        status: 'sent',
      });
      return true;
    } else {
      await db.notificationHistory.add({
        id: generateId(),
        userId: item.userId,
        title: item.title,
        body: item.body,
        category: String(item.category),
        scheduledFor: now.toISOString(),
        status: 'failed',
        error: 'Browser permission not granted',
      });
      return false;
    }
  } catch (err: any) {
    await db.notificationHistory.add({
      id: generateId(),
      userId: item.userId,
      title: item.title,
      body: item.body,
      category: String(item.category),
      scheduledFor: now.toISOString(),
      status: 'failed',
      error: err?.message || 'Delivery error',
    });
    return false;
  }
}
