// ============================================================================
// DevPilot — Notifications & Reminders Center
// ============================================================================
import { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Moon,
  Trash2,
  Sliders,
  Send,
  History,
  ShieldCheck,
  GraduationCap,
  Code2,
  Binary,
  Globe,
  Server,
  FolderKanban,
  Target,
  CalendarDays,
} from 'lucide-react';
import {
  getStoredNotificationPreferences,
  saveNotificationPreferences,
  requestBrowserNotificationPermission,
  deliverNotification,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../services/notifications';
import { db } from '../store/db';
import { Card, PageHeader, Badge, Button, Input, EmptyState } from '../components/ui';
import { formatDate, cn } from '../utils/helpers';
import type { NotificationPreference, NotificationHistoryItem } from '../types';

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPreference>(getStoredNotificationPreferences);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load history from Dexie
  const loadHistory = async () => {
    try {
      const items = await db.notificationHistory.orderBy('scheduledFor').reverse().limit(50).toArray();
      setHistory(items);
    } catch (err) {
      console.warn('Load history error:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleToggleCategory = (categoryKey: keyof NotificationPreference['categories']) => {
    const updated = {
      ...prefs,
      categories: {
        ...prefs.categories,
        [categoryKey]: !prefs.categories[categoryKey],
      },
    };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    showSaved();
  };

  const handleToggleDay = (dayIndex: number) => {
    const active = prefs.activeDays.includes(dayIndex)
      ? prefs.activeDays.filter((d) => d !== dayIndex)
      : [...prefs.activeDays, dayIndex];

    const updated = { ...prefs, activeDays: active };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    showSaved();
  };

  const handleToggleEnabled = async () => {
    if (!prefs.enabled) {
      const perm = await requestBrowserNotificationPermission();
      const updated = {
        ...prefs,
        enabled: perm === 'granted',
        browserPermission: perm,
      };
      setPrefs(updated);
      saveNotificationPreferences(updated);
    } else {
      const updated = { ...prefs, enabled: false };
      setPrefs(updated);
      saveNotificationPreferences(updated);
    }
    showSaved();
  };

  const showSaved = () => {
    setSaveMessage('Preferences updated successfully');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  // Test Notification Trigger
  const handleTestNotification = async () => {
    const success = await deliverNotification({
      title: 'DevPilot Reminder Test',
      body: 'Notifications are functioning correctly! Your study schedule will alert you on time.',
      category: 'python',
      url: '/timetable',
    });
    await loadHistory();
    if (!success) {
      alert('Notification blocked or quiet hours are active. Please check permissions and quiet hours below.');
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear notification history?')) {
      await db.notificationHistory.clear();
      await loadHistory();
    }
  };

  const filteredHistory = history.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification & Reminder Center"
        subtitle="Schedule automated activity reminders, set quiet hours, and inspect alert history."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleTestNotification}>
              <Send size={14} /> Send Test Alert
            </Button>
          </div>
        }
      />

      {saveMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* ── Main Permission Toggle Card ── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                prefs.enabled
                  ? 'bg-blue-500/10 text-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              )}
            >
              <Bell size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  DevPilot Study Reminders
                </h3>
                <Badge variant={prefs.enabled ? 'success' : 'default'}>
                  {prefs.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Receive browser alerts before scheduled timetable events, college lectures, and project deadlines. Reminders are strictly optional and can be toggled on or off at any moment.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={prefs.enabled ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleEnabled}
            className="shrink-0"
          >
            {prefs.enabled ? 'Disable Notifications' : 'Enable Notifications'}
          </Button>
        </div>
      </Card>

      {/* ── Customization Controls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Controls */}
        <Card className="p-5 space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={16} className="text-blue-500" />
              <span>Reminder Categories</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which activities should send notifications.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { key: 'college', label: 'College Schedule (6:00 AM – 2:00 PM)', icon: GraduationCap },
              { key: 'academics', label: 'College Academics (3:00 – 4:00 PM)', icon: GraduationCap },
              { key: 'python', label: 'Python Practice Sessions', icon: Code2 },
              { key: 'cppDsa', label: 'C++ and DSA Practice', icon: Binary },
              { key: 'webdev', label: 'Full-Stack Web Development', icon: Globe },
              { key: 'systemDesign', label: 'System Design Studies', icon: Server },
              { key: 'assignments', label: 'Academic Assignments Due', icon: CalendarDays },
              { key: 'projects', label: 'Project Deadlines', icon: FolderKanban },
              { key: 'dailyGoals', label: 'Daily Goal Targets', icon: Target },
              { key: 'weeklyReview', label: 'Weekly Review Reminders', icon: Calendar },
            ].map((cat) => {
              const active = prefs.categories[cat.key as keyof NotificationPreference['categories']];
              const Icon = cat.icon;
              return (
                <label
                  key={cat.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={active ? 'text-blue-500' : 'text-slate-400'} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleToggleCategory(cat.key as keyof NotificationPreference['categories'])}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              );
            })}
          </div>
        </Card>

        {/* Quiet Hours & Delivery Schedule */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Moon size={16} className="text-indigo-400" />
                <span>Quiet Hours</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically silence all notifications during your rest or sleep hours.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Enable Quiet Hours
                </span>
                <input
                  type="checkbox"
                  checked={prefs.quietHoursEnabled}
                  onChange={(e) => {
                    const updated = { ...prefs, quietHoursEnabled: e.target.checked };
                    setPrefs(updated);
                    saveNotificationPreferences(updated);
                    showSaved();
                  }}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => {
                      const updated = { ...prefs, quietHoursStart: e.target.value };
                      setPrefs(updated);
                      saveNotificationPreferences(updated);
                      showSaved();
                    }}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">End Time</label>
                  <Input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => {
                      const updated = { ...prefs, quietHoursEnd: e.target.value };
                      setPrefs(updated);
                      saveNotificationPreferences(updated);
                      showSaved();
                    }}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-emerald-500" />
                <span>Active Weekdays</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Days of the week when activity reminders should trigger.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {DAYS.map((day, idx) => {
                const active = prefs.activeDays.includes(idx);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all',
                      active
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Notification History Table ── */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History size={16} className="text-amber-500" />
              <span>Notification History</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of sent, pending, and blocked reminder alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(['all', 'sent', 'failed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    'px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer',
                    statusFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <Button variant="ghost" size="xs" onClick={handleClearHistory} className="text-red-500">
                <Trash2 size={12} /> Clear
              </Button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title="No notifications recorded"
            description="When reminders trigger, their delivery status will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <Badge variant={item.status === 'sent' ? 'success' : 'danger'} className="text-[10px]">
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">{item.body}</p>
                  {item.error && (
                    <p className="text-red-400 text-[10px]">Reason: {item.error}</p>
                  )}
                </div>
                <span className="text-slate-400 text-[10px] shrink-0 font-mono">
                  {new Date(item.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
