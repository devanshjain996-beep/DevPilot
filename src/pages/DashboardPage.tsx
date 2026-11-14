// ============================================================================
// DevPilot - Dashboard Page
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  FolderKanban,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  Lock,
} from 'lucide-react';
import {
  Card,
  StatCard,
  ProgressBar,
  Badge,
  Checkbox,
} from '../components/ui';
import {
  useTodayTimetable,
  useTasks,
  useTrackProgress,
  useProjects,
  useGoals,
  useSubjects,
  useStudyLogs,
  useAllTopics,
  updateTimetableStatus,
  updateTask,
  lockExpiredSlotsForDate,
  calculateTimetableStats,
} from '../hooks/useDatabase';
import { todayStr, formatDate, formatDay, percentage, cn, statusBg } from '../utils/helpers';
import { useProfile } from '../store/useStore';
import WeeklyChart from '../components/charts/WeeklyChart';
import type { TaskStatus } from '../types';
import { startOfWeek, endOfWeek, format, parseISO, subDays } from 'date-fns';

function getTrackRoute(id: string): string {
  switch (id) {
    case 'python': return '/python';
    case 'cpp-dsa': return '/cpp-dsa';
    case 'webdev': return '/webdev';
    case 'system-design': return '/system-design';
    case 'ai-ml': return '/ai-ml';
    case 'c': return '/roadmap';
    default: return '/roadmap';
  }
}

function badgeVariant(status: TaskStatus): string {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'skipped': return 'danger';
    default: return 'default';
  }
}

function daysUntilDate(dateStr: string): number {
  try {
    const diff = Math.ceil(
      (parseISO(dateStr).getTime() - Date.now()) / 86_400_000,
    );
    return diff;
  } catch {
    return 0;
  }
}

// ── component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = todayStr();
  const { profile } = useProfile();
  const timetable = useTodayTimetable();
  const todayTasks = useTasks(today);
  const allTopics = useAllTopics();
  const studyLogs = useStudyLogs();
  const goals = useGoals();
  const subjects = useSubjects();
  const projects = useProjects();
  const { tracks, overallPercentage } = useTrackProgress();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Periodically check and lock expired slots on dashboard
  useEffect(() => {
    lockExpiredSlotsForDate(today);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      lockExpiredSlotsForDate(today);
    }, 15000);
    return () => clearInterval(timer);
  }, [today]);

  // Calculate timetable stats excluding exempt/holiday slots
  const timetableStats = useMemo(() => calculateTimetableStats(timetable), [timetable]);

  // ── 4. Daily completion percentage ──
  const dailyCompletion = useMemo(() => {
    const taskDone = todayTasks.filter((t) => t.status === 'completed').length;
    const reqDone = timetableStats.completed + taskDone;
    const reqTotal = timetableStats.totalRequired + todayTasks.length;
    return reqTotal > 0 ? Math.round((reqDone / reqTotal) * 100) : 100;
  }, [timetableStats, todayTasks]);

  // ── 5. Weekly study hours ──
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const buckets: Record<string, number> = {};
    dayLabels.forEach((d) => (buckets[d] = 0));

    studyLogs.forEach((log) => {
      try {
        const d = parseISO(log.date);
        if (d >= weekStart && d <= weekEnd) {
          const label = dayLabels[((d.getDay() + 6) % 7)]; // Mon=0
          buckets[label] += log.hours;
        }
      } catch { /* skip bad dates */ }
    });

    return dayLabels.map((day) => ({
      day,
      hours: Math.round(buckets[day] * 10) / 10,
    }));
  }, [studyLogs]);

  const totalWeeklyHours = useMemo(
    () => weeklyData.reduce((s, d) => s + d.hours, 0),
    [weeklyData],
  );

  // ── 6. Learning streak ──
  const streak = useMemo(() => {
    // Build a set of dates that had at least one completed topic or study log
    const activeDates = new Set<string>();
    allTopics.forEach((t) => {
      if (t.completedAt) {
        try {
          activeDates.add(format(parseISO(t.completedAt), 'yyyy-MM-dd'));
        } catch { /* skip */ }
      }
    });
    studyLogs.forEach((l) => activeDates.add(l.date));

    let count = 0;
    let d = new Date();
    // If today has no activity yet, start from yesterday
    if (!activeDates.has(format(d, 'yyyy-MM-dd'))) {
      d = subDays(d, 1);
    }
    while (activeDates.has(format(d, 'yyyy-MM-dd'))) {
      count++;
      d = subDays(d, 1);
    }
    return count;
  }, [allTopics, studyLogs]);

  // ── 7. Upcoming deadlines ──
  const deadlines = useMemo(() => {
    const items: { title: string; date: string; daysLeft: number; type: string }[] = [];
    goals.forEach((g) => {
      if (!g.completed && g.targetDate) {
        const dl = daysUntilDate(g.targetDate);
        if (dl >= 0 && dl <= 30) {
          items.push({ title: g.title, date: g.targetDate, daysLeft: dl, type: 'Goal' });
        }
      }
    });
    todayTasks.forEach((t) => {
      if (t.status !== 'completed' && t.deadline) {
        const dl = daysUntilDate(t.deadline);
        if (dl >= 0 && dl <= 30) {
          items.push({ title: t.title, date: t.deadline, daysLeft: dl, type: 'Task' });
        }
      }
    });
    items.sort((a, b) => a.daysLeft - b.daysLeft);
    return items.slice(0, 5);
  }, [goals, todayTasks]);

  // ── 8. Pending assignments ──
  const pendingAssignments = useMemo(() => {
    const items: { title: string; subject: string; dueDate: string }[] = [];
    subjects.forEach((s) => {
      (s.assignments ?? []).forEach((a) => {
        if (!a.completed) {
          items.push({ title: a.title, subject: s.name, dueDate: a.dueDate });
        }
      });
    });
    items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return items.slice(0, 5);
  }, [subjects]);

  // ── 9. Current projects ──
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === 'in-progress'),
    [projects],
  );

  // ── Continue Learning ──
  const continueTracks = useMemo(
    () => tracks.filter((t) => t.percentage < 100 && t.nextTopic),
    [tracks],
  );

  // ── handlers ──
  const toggleTimetableStatus = (entry: import('../types').TimetableEntry) => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const isRequired = !entry.isExempt && !entry.isHoliday && !entry.isBlocked && entry.category !== 'personal';
    const isExpired = isRequired && (currentHour >= entry.endHour || entry.status === 'missed');

    if (isExpired) {
      alert('This time slot has expired and is locked. Missed activities cannot be marked completed.');
      return;
    }
    updateTimetableStatus(entry.id, entry.status === 'completed' ? 'pending' : 'completed');
  };

  const toggleTaskStatus = (id: string, current: TaskStatus) => {
    updateTask(id, { status: current === 'completed' ? 'pending' : 'completed' });
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── 1. Welcome ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {profile.name} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {formatDay(today)}, {formatDate(today)} &nbsp;·&nbsp;{' '}
          <span className="text-blue-400">{profile.careerGoal}</span>
        </p>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Progress"
          value={`${dailyCompletion}%`}
          icon={<TrendingUp size={20} />}
          color="blue"
          sub={`${timetable.filter((e) => e.status === 'completed').length + todayTasks.filter((t) => t.status === 'completed').length} / ${timetable.length + todayTasks.length} items`}
        />
        <StatCard
          label="Weekly Study"
          value={`${totalWeeklyHours}h`}
          icon={<Clock size={20} />}
          color="violet"
          sub="This week"
        />
        <StatCard
          label="Learning Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          icon={<Flame size={20} />}
          color="amber"
          sub="Keep it going!"
        />
        <StatCard
          label="Overall Progress"
          value={`${overallPercentage}%`}
          icon={<Target size={20} />}
          color="emerald"
          sub={`${tracks.reduce((s, t) => s + t.completed, 0)} topics mastered`}
        />
      </div>

      {/* ── 10. Overall learning progress bar ── */}
      <Card>
        <ProgressBar
          value={overallPercentage}
          label="Overall Learning Progress"
          color="blue"
          size="lg"
        />
      </Card>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── 2. Today's Timetable ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Today's Timetable
              </h2>
            </div>
            {timetable.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No timetable entries for today. Add your schedule to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {timetable
                  .sort((a, b) => a.startHour - b.startHour)
                  .map((entry) => {
                    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
                    const isRequired = !entry.isExempt && !entry.isHoliday && !entry.isBlocked && entry.category !== 'personal';
                    const isExpired = isRequired && (currentHour >= entry.endHour || entry.status === 'missed');
                    const isCompleted = entry.status === 'completed';

                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700',
                          isCompleted && 'opacity-60 bg-emerald-500/[0.02] border-emerald-500/30',
                          isExpired && 'border-red-500/30 bg-red-500/[0.02]',
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpired ? (
                            <button
                              type="button"
                              disabled
                              title="Time expired · Locked"
                              className="w-4 h-4 rounded border border-red-500/40 bg-red-500/10 text-red-500 flex items-center justify-center cursor-not-allowed shrink-0"
                            >
                              <Lock size={10} />
                            </button>
                          ) : (
                            <Checkbox
                              checked={isCompleted}
                              onChange={() => toggleTimetableStatus(entry)}
                            />
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'text-sm font-medium truncate',
                                isCompleted
                                  ? 'text-slate-500 line-through'
                                  : isExpired
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-slate-900 dark:text-white',
                              )}
                            >
                              {entry.activity}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {entry.time}
                            </p>
                          </div>
                        </div>

                        {isExpired ? (
                          <Badge variant="danger" className="shrink-0 ml-2 gap-1 text-[10px]">
                            <Lock size={9} /> Missed
                          </Badge>
                        ) : entry.isHoliday ? (
                          <Badge variant="success" className="shrink-0 ml-2 text-[10px]">
                            Holiday Free Time
                          </Badge>
                        ) : entry.isBlocked ? (
                          <Badge variant="purple" className="shrink-0 ml-2 text-[10px]">
                            Free Time
                          </Badge>
                        ) : (
                          <Badge
                            variant={badgeVariant(entry.status)}
                            className="shrink-0 ml-2"
                          >
                            {entry.status}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>

          {/* ── 3. Today's Tasks ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Today's Tasks
              </h2>
              <Badge variant="info" className="ml-auto">
                {todayTasks.filter((t) => t.status === 'completed').length}/
                {todayTasks.length}
              </Badge>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tasks for today. Add tasks to stay organized.
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <Checkbox
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskStatus(task.id, task.status)}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          task.status === 'completed'
                            ? 'text-slate-500 line-through'
                            : 'text-slate-900 dark:text-white',
                        )}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={badgeVariant(task.status)} className="shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 5. Weekly Study Chart ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-violet-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Weekly Study Hours
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                {totalWeeklyHours}h total
              </span>
            </div>
            <WeeklyChart data={weeklyData} />
          </Card>

          {/* ── Track progress cards ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Learning Tracks
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {track.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {track.completed}/{track.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={track.percentage}
                    color={track.color}
                    showPct
                    size="sm"
                    label={undefined}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-6">
          {/* ── 7. Upcoming Deadlines ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-rose-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Upcoming Deadlines
              </h2>
            </div>
            {deadlines.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming deadlines. 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {deadlines.map((dl, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {dl.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(dl.date)}
                      </p>
                    </div>
                    <Badge
                      variant={dl.daysLeft <= 3 ? 'danger' : dl.daysLeft <= 7 ? 'warning' : 'default'}
                      className="shrink-0"
                    >
                      {dl.daysLeft === 0 ? 'Today' : `${dl.daysLeft}d`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 8. Pending Assignments ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={18} className="text-amber-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Pending Assignments
              </h2>
            </div>
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No pending assignments. All caught up!
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((a, i) => (
                  <div key={i} className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {a.subject} · Due {formatDate(a.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 9. Current Projects ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FolderKanban size={18} className="text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Active Projects
              </h2>
            </div>
            {activeProjects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No in-progress projects right now.
              </p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div key={p.id} className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {p.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="info">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Continue Learning ── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight size={18} className="text-violet-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Continue Learning
              </h2>
            </div>
            {continueTracks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All tracks completed! 🏆
              </p>
            ) : (
              <div className="space-y-3">
                {continueTracks.map((track) => (
                  <Link
                    key={track.id}
                    to={getTrackRoute(track.id)}
                    className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-colors group"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
                      {track.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Next: {track.nextTopic?.title}
                    </p>
                    <ProgressBar
                      value={track.percentage}
                      color={track.color}
                      showPct={false}
                      size="sm"
                      label={undefined}
                    />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
