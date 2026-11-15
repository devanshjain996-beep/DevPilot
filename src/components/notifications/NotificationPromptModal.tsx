// ============================================================================
// DevPilot — Notification Opt-in Prompt Modal
// ============================================================================
import { useState } from 'react';
import { Bell, Check, X, ShieldAlert, Sparkles, Clock, Calendar } from 'lucide-react';
import {
  requestBrowserNotificationPermission,
  dismissNotificationPrompt,
} from '../../services/notifications';
import { Modal, Button } from '../ui';

export default function NotificationPromptModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleEnable = async () => {
    setLoading(true);
    await requestBrowserNotificationPermission();
    setLoading(false);
    onClose();
  };

  const handleNotNow = () => {
    dismissNotificationPrompt(false);
    onClose();
  };

  const handleDisable = () => {
    dismissNotificationPrompt(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Bell size={28} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Enable DevPilot Reminders?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Get timely reminders 10 minutes before your scheduled college slots, Python practice, C++ & DSA sessions, and assignment deadlines.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left text-xs space-y-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-blue-500 shrink-0" />
            <span>Automatic quiet hours from 10:00 PM to 07:00 AM.</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-emerald-500 shrink-0" />
            <span>Fully customizable by subject, time, and weekdays.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="w-full justify-center"
            size="sm"
          >
            <Check size={14} /> Enable Notifications
          </Button>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={handleNotNow}
              className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Not Now
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={handleDisable}
              className="px-3 py-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
            >
              Disable Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
