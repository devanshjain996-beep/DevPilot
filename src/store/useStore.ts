// ============================================================================
// DevPilot - App Store (localStorage-based settings + helpers)
// ============================================================================
import { useEffect, useState, useCallback } from 'react';
import type { AppSettings, UserProfile } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  reminderEnabled: true,
  studyPreferences: {
    dailyStudyGoalHours: 5,
    preferredLanguage: 'python',
  },
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Developer',
  bio: '[Your bio here - tell the world about yourself]',
  careerGoal: 'Become a professional AI-powered software developer',
  portfolioVisible: true,
  achievements: [],
  certifications: [],
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadJSON('devpilot_settings', DEFAULT_SETTINGS));

  const setSettings = useCallback((updater: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveJSON('devpilot_settings', next);
      return next;
    });
  }, []);

  return { settings, setSettings };
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(() => loadJSON('devpilot_profile', DEFAULT_PROFILE));

  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveJSON('devpilot_profile', next);
      return next;
    });
  }, []);

  return { profile, setProfile };
}

export function useTheme() {
  const { settings, setSettings } = useSettings();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, [setSettings]);

  return { theme: settings.theme, toggleTheme };
}
