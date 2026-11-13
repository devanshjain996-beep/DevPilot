// ============================================================================
// DevPilot — Daily Timetable Page
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfWeek, parseISO } from 'date-fns';
import {
  Clock, Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2,
  XCircle, RotateCcw, Circle, Ban, CalendarDays, ListChecks,
  AlertTriangle, Percent,
} from 'lucide-react';
import {
  Card, PageHeader, Badge, Button, Modal, Input, Select, Tabs, ProgressBar, EmptyState,
} from '../components/ui';
import {
  useTimetableByDate, useTasks, addTask, updateTimetableStatus, initTimetableForDate,
} from '../hooks/useDatabase';
import { todayStr, formatDate, formatDay, generateId, cn, statusBg, priorityColor } from '../utils/helpers';
import { DEFAULT_TIMETABLE } from '../data/roadmapData';
import type { TaskStatus, Priority } from '../types';

// ── category → colour map ──
const CAT_COLOR: Record<string, string> = {
  python: 'border-l-emerald-500 bg-emerald-500/5',
  'cpp-dsa': 'border-l-violet-500 bg-violet-500/5',
  webdev: 'border-l-cyan-500 bg-cyan-500/5',
  academics: 'border-l-amber-500 bg-amber-500/5',
  personal: 'border-l-slate-400 bg-slate-500/5',
  blocked: 'border-l-red-500 bg-red-500/10',
  college: 'border-l-blue-500 bg-blue-500/5',
  planning: 'border-l-slate-400 bg-slate-500/5',
};

const CAT_BADGE: Record<string, string> = {
  python: 'success',
  'cpp-dsa': 'purple',
  webdev: 'info',
  academics: 'warning',
  personal: 'default',
  blocked: 'danger',
  college: 'info',
  planning: 'default',
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  completed: <CheckCircle2 size={16} />,
  skipped: <XCircle size={16} />,
  rescheduled: <RotateCcw size={16} />,
  pending: <Circle size={16} />,
};

const STATUS_BTN_STYLE: Record<TaskStatus, string> = {
  completed: 'hover:bg-emerald-500/20 text-emerald-500',
  skipped: 'hover:bg-red-500/20 text-red-500',
  rescheduled: 'hover:bg-amber-500/20 text-amber-500',
  pending: 'hover:bg-slate-500/20 text-slate-400',
};

const CATEGORY_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'cpp-dsa', label: 'C++ & DSA' },
  { value: 'webdev', label: 'Web Dev' },
  { value: 'academics', label: 'Academics' },
  { value: 'personal', label: 'Personal' },
  { value: 'college', label: 'College' },
  { value: 'planning', label: 'Planning' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// ──────────────────────────────────────────────────────────────────────────────
export default function TimetablePage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const entries = useTimetableByDate(selectedDate);
  const tasks = useTasks(selectedDate);
  const [activeTab, setActiveTab] = useState('daily');
  const [modalOpen, setModalOpen] = useState(false);

  // Seed today's timetable on first load
  useEffect(() => {
    initTimetableForDate(todayStr(), DEFAULT_TIMETABLE);
  }, []);

  // Seed when navigating to a new date
  useEffect(() => {
    initTimetableForDate(selectedDate, DEFAULT_TIMETABLE);
  }, [selectedDate]);

  // ── daily completion % ──
  const completionPct = useMemo(() => {
    const nonBlocked = entries.filter(e => !e.isBlocked);
    if (nonBlocked.length === 0) return 0;
    const done = nonBlocked.filter(e => e.status === 'completed').length;
    return Math.round((done / nonBlocked.length) * 100);
  }, [entries]);

  // ── nav ──
  const prevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const nextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const goToday = () => setSelectedDate(todayStr());

  const isToday = selectedDate === todayStr();

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        title="Daily Timetable"
        subtitle="Track your daily schedule and study sessions"
        action={
          <Button onClick={() => setModalOpen(true)} size="md">
            <Plus size={16} /> Add Task
          </Button>
        }
      />

      {/* ── Tabs ── */}
      <Tabs
        tabs={[
          { id: 'daily', label: 'Daily View', icon: <ListChecks size={16} /> },
          { id: 'weekly', label: 'Weekly Overview', icon: <CalendarDays size={16} /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'daily' ? (
        <>
          {/* ── Date navigation ── */}
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={prevDay}><ChevronLeft size={18} /></Button>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatDay(selectedDate)}, {formatDate(selectedDate)}
                </p>
                {isToday && <Badge variant="info">Today</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={nextDay}><ChevronRight size={18} /></Button>
            </div>

            <div className="flex items-center gap-4">
              {!isToday && (
                <Button variant="secondary" size="sm" onClick={goToday}>
                  <Calendar size={14} /> Today
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Percent size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Completion
                </span>
                <span className={cn(
                  'text-lg font-bold',
                  completionPct >= 80 ? 'text-emerald-500' : completionPct >= 50 ? 'text-amber-500' : 'text-red-400',
                )}>
                  {completionPct}%
                </span>
              </div>
            </div>
          </Card>

          <ProgressBar value={completionPct} color={completionPct >= 80 ? 'emerald' : completionPct >= 50 ? 'amber' : 'rose'} showPct={false} size="sm" />

          {/* ── Timetable entries ── */}
          {entries.length === 0 ? (
            <EmptyState
              icon={<Clock size={48} />}
              title="No entries for this day"
              description="Navigate to today or another date to see your timetable."
            />
          ) : (
            <div className="space-y-3">
              {[...entries]
                .sort((a, b) => a.startHour - b.startHour)
                .map(entry => (
                  <Card
                    key={entry.id}
                    className={cn(
                      'border-l-4 transition-all',
                      CAT_COLOR[entry.category] || 'border-l-slate-400',
                      entry.isBlocked && 'opacity-80',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* left: time + activity */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0 w-36">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.time}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            'font-medium',
                            entry.isBlocked ? 'text-red-400' : 'text-slate-900 dark:text-white',
                          )}>
                            {entry.activity}
                          </p>
                          <Badge variant={CAT_BADGE[entry.category] || 'default'} className="mt-1">
                            {entry.category}
                          </Badge>
                        </div>
                      </div>

                      {/* right: status buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {entry.isBlocked ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                            <Ban size={14} /> BLOCKED
                          </span>
                        ) : (
                          (['completed', 'skipped', 'rescheduled', 'pending'] as TaskStatus[]).map(s => (
                            <button
                              key={s}
                              title={s}
                              onClick={() => updateTimetableStatus(entry.id, s)}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                STATUS_BTN_STYLE[s],
                                entry.status === s && 'ring-2 ring-current bg-current/10',
                              )}
                            >
                              {STATUS_ICON[s]}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* ── Tasks added for this day ── */}
          {tasks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ListChecks size={18} className="text-blue-400" />
                Tasks for this day
              </h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <Card key={task.id} className="border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          'font-medium text-slate-900 dark:text-white',
                          task.status === 'completed' && 'line-through opacity-60',
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={CAT_BADGE[task.category] || 'default'}>{task.category}</Badge>
                          <span className={cn('text-xs font-medium', priorityColor(task.priority))}>{task.priority}</span>
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'skipped' ? 'danger' : 'warning'}>
                        {task.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Weekly Overview Tab ── */
        <WeeklyOverview selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}

      {/* ── Add‑task modal ── */}
      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} date={selectedDate} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Weekly calendar overview component
// ──────────────────────────────────────────────────────────────────────────────
function WeeklyOverview({ selectedDate, onSelectDate }: { selectedDate: string; onSelectDate: (d: string) => void }) {
  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map(day => (
        <DayCard key={day} date={day} isSelected={day === selectedDate} onSelect={() => onSelectDate(day)} />
      ))}
    </div>
  );
}

function DayCard({ date, isSelected, onSelect }: { date: string; isSelected: boolean; onSelect: () => void }) {
  const entries = useTimetableByDate(date);
  const nonBlocked = entries.filter(e => !e.isBlocked);
  const completed = nonBlocked.filter(e => e.status === 'completed').length;
  const total = nonBlocked.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const today = date === todayStr();

  // Seed when card renders
  useEffect(() => {
    initTimetableForDate(date, DEFAULT_TIMETABLE);
  }, [date]);

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'text-center cursor-pointer transition-all',
        isSelected && 'ring-2 ring-blue-500 border-blue-500',
        today && !isSelected && 'border-blue-400/50',
      )}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDay(date)}</p>
      <p className={cn('text-sm font-semibold mt-0.5', today ? 'text-blue-400' : 'text-slate-900 dark:text-white')}>
        {format(parseISO(date), 'MMM dd')}
      </p>
      {today && <Badge variant="info" className="mt-1 text-[10px]">Today</Badge>}
      <div className="mt-3">
        <ProgressBar value={pct} size="sm" showPct={false} color={pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose'} />
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{completed}/{total}</p>
      </div>
      {pct === 100 && total > 0 && (
        <span className="text-emerald-400 text-xs font-semibold">✓ All done</span>
      )}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Add‑task modal
// ──────────────────────────────────────────────────────────────────────────────
function AddTaskModal({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('python');
  const [priority, setPriority] = useState<Priority>('medium');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setTitle(''); setCategory('python'); setPriority('medium'); setTime(''); setError(''); };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }

    // Block tasks in 5–7 PM window
    if (time) {
      const [h] = time.split(':').map(Number);
      if (h >= 17 && h < 19) {
        setError('Cannot add tasks during the 5:00–7:00 PM blocked window.');
        return;
      }
    }

    await addTask({
      title: title.trim(),
      category,
      priority,
      status: 'pending',
      date,
      deadline: date,
      description: time ? `Scheduled at ${time}` : undefined,
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add Task">
      <div className="space-y-4">
        <Input label="Title" placeholder="What do you need to do?" value={title} onChange={e => { setTitle(e.target.value); setError(''); }} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={e => setCategory(e.target.value)} />
          <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={e => setPriority(e.target.value as Priority)} />
        </div>
        <Input label="Time (optional)" type="time" value={time} onChange={e => setTime(e.target.value)} />
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle size={14} /> {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Task</Button>
        </div>
      </div>
    </Modal>
  );
}
