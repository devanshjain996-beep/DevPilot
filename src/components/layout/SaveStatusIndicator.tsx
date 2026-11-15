// ============================================================================
// DevPilot — Cloud Save & Sync Status Indicator
// ============================================================================
import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

export default function SaveStatusIndicator() {
  const { syncStatus, syncError, retrySync, user, isConfigured } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retrySync();
    setRetrying(false);
  };

  if (!user && !isConfigured) {
    return (
      <div
        title="Saved locally in browser IndexedDB"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Local Mode</span>
      </div>
    );
  }

  if (syncStatus === 'saving') {
    return (
      <div
        title="Synchronizing changes with cloud database..."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 select-none animate-pulse"
      >
        <Loader2 size={12} className="animate-spin text-blue-500" />
        <span>Saving...</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/10 text-red-500 border border-red-500/20">
        <AlertCircle size={12} />
        <span className="max-w-[80px] sm:max-w-none truncate" title={syncError || 'Sync failed'}>
          Sync Error
        </span>
        <button
          onClick={handleRetry}
          disabled={retrying}
          title="Retry cloud synchronization"
          className="p-0.5 hover:bg-red-500/20 rounded cursor-pointer transition-colors"
        >
          <RefreshCw size={11} className={cn(retrying && 'animate-spin')} />
        </button>
      </div>
    );
  }

  if (syncStatus === 'offline') {
    return (
      <div
        title="You are currently offline. Changes are stored locally and will sync when reconnected."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 select-none"
      >
        <WifiOff size={12} />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div
      title="All changes saved securely to cloud"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none transition-all"
    >
      <CheckCircle2 size={12} className="text-emerald-500" />
      <span>Saved</span>
    </div>
  );
}
