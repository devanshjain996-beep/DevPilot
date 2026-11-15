// ============================================================================
// DevPilot — Data Migration Modal (Local Data to Cloud Account)
// ============================================================================
import { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
  Calendar,
  ListTodo,
  Code2,
  FolderKanban,
  Target,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../../store/db';
import { syncEngine } from '../../services/syncEngine';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button } from '../ui';

interface LocalSummary {
  tasks: number;
  timetable: number;
  dsa: number;
  projects: number;
  goals: number;
  topics: number;
}

export default function DataMigrationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<LocalSummary>({
    tasks: 0,
    timetable: 0,
    dsa: 0,
    projects: 0,
    goals: 0,
    topics: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const loadCounts = async () => {
      try {
        const tasks = await db.tasks.count();
        const timetable = await db.timetable.count();
        const dsa = await db.dsaProblems.count();
        const projects = await db.projects.count();
        const goals = await db.goals.count();
        const topics = await db.topics.where('status').notEqual('not-started').count();

        setCounts({ tasks, timetable, dsa, projects, goals, topics });
      } catch (err) {
        console.warn('Error loading counts:', err);
      }
    };
    loadCounts();
  }, [open]);

  const handleMigrate = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Assign current user's ID to local records and queue for cloud synchronization
      const allTasks = await db.tasks.toArray();
      for (const t of allTasks) {
        if (!t.userId) {
          await db.tasks.update(t.id, { userId: user.id });
          await syncEngine.queueChange('tasks', { ...t, user_id: user.id });
        }
      }

      const allTimetable = await db.timetable.toArray();
      for (const tt of allTimetable) {
        if (!tt.userId) {
          await db.timetable.update(tt.id, { userId: user.id });
          await syncEngine.queueChange('timetable', { ...tt, user_id: user.id });
        }
      }

      const allDsa = await db.dsaProblems.toArray();
      for (const d of allDsa) {
        if (!d.userId) {
          await db.dsaProblems.update(d.id, { userId: user.id });
          await syncEngine.queueChange('dsa_problems', { ...d, user_id: user.id });
        }
      }

      const allProjects = await db.projects.toArray();
      for (const p of allProjects) {
        if (!p.userId) {
          await db.projects.update(p.id, { userId: user.id });
          await syncEngine.queueChange('projects', { ...p, user_id: user.id });
        }
      }

      const allGoals = await db.goals.toArray();
      for (const g of allGoals) {
        if (!g.userId) {
          await db.goals.update(g.id, { userId: user.id });
          await syncEngine.queueChange('goals', { ...g, user_id: user.id });
        }
      }

      // Mark migration as completed for this user
      localStorage.setItem(`devpilot_migration_dismissed_${user.id}`, 'true');

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Migration error:', err);
      setErrorMsg(err?.message || 'Failed to import local data. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`devpilot_migration_dismissed_${user.id}`, 'true');
    }
    onClose();
  };

  const totalItems =
    counts.tasks + counts.timetable + counts.dsa + counts.projects + counts.goals;

  return (
    <Modal open={open} onClose={handleDismiss} title="Import Existing Local Data?">
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Successfully Imported!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your local study records and schedule have been linked to your account{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {user?.email || user?.phone}
              </span>{' '}
              and synced to the cloud.
            </p>
          </div>
        ) : (
          <>
            <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                <Database size={15} />
                <span>Found {totalItems} local items from guest mode</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                We detected existing records saved in your browser. Would you like to import them into your new cloud account so you can access them across all your devices?
              </p>
            </div>

            {/* Breakdown Preview */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Calendar size={15} className="text-blue-500" />
                <div>
                  <p className="text-[10px] text-slate-400">Timetable Slots</p>
                  <p className="font-bold text-slate-900 dark:text-white">{counts.timetable} items</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <ListTodo size={15} className="text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-400">Daily Tasks</p>
                  <p className="font-bold text-slate-900 dark:text-white">{counts.tasks} items</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Code2 size={15} className="text-violet-500" />
                <div>
                  <p className="text-[10px] text-slate-400">DSA Problems</p>
                  <p className="font-bold text-slate-900 dark:text-white">{counts.dsa} items</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <FolderKanban size={15} className="text-amber-500" />
                <div>
                  <p className="text-[10px] text-slate-400">Projects</p>
                  <p className="font-bold text-slate-900 dark:text-white">{counts.projects} items</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={handleDismiss}>
                Skip / Start Fresh
              </Button>
              <Button type="button" size="sm" onClick={handleMigrate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing to Cloud...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Import to My Account
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
