// ============================================================================
// DevPilot — Daily Timetable Page (Fully Customizable & Editable)
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfWeek, parseISO } from 'date-fns';
import {
  Clock, Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2,
  XCircle, RotateCcw, Circle, CalendarDays, ListChecks,
  AlertTriangle, Percent, Edit2, Trash2, Coffee, Sparkles, RefreshCw
} from 'lucide-react';
import {
  Card, PageHeader, Badge, Button, Modal, Input, Select, Tabs, ProgressBar, EmptyState, Checkbox
} from '../components/ui';
import {
  useTimetableByDate, useTasks, addTask, updateTask, deleteTask,
  updateTimetableStatus, updateTimetableEntry, addTimetableEntry,
  deleteTimetableEntry, initTimetableForDate, resetTimetableForDate
} from '../hooks/useDatabase';
import { todayStr, formatDate, formatDay, cn, priorityColor } from '../utils/helpers';
import { DEFAULT_TIMETABLE } from '../data/roadmapData';
import type { TaskStatus, Priority, TimetableEntry } from '../types';

// ── category → colour map ──
const CAT_COLOR: Record<string, string> = {
  python: 'border-l-emerald-500 bg-emerald-500/5',
  'cpp-dsa': 'border-l-violet-500 bg-violet-500/5',
  webdev: 'border-l-cyan-500 bg-cyan-500/5',
  academics: 'border-l-amber-500 bg-amber-500/5',
  personal: 'border-l-indigo-400 bg-indigo-500/5',
  college: 'border-l-blue-500 bg-blue-500/5',
  planning: 'border-l-slate-400 bg-slate-500/5',
};

const CAT_BADGE: Record<string, string> = {
  python: 'success',
  'cpp-dsa': 'purple',
  webdev: 'info',
  academics: 'warning',
  personal: 'default',
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
  { value: 'python', label: 'Python Practice' },
  { value: 'cpp-dsa', label: 'C++ & DSA' },
  { value: 'webdev', label: 'Web Development' },
  { value: 'academics', label: 'College Academics' },
  { value: 'personal', label: 'Personal & Free Time' },
  { value: 'college', label: 'College Hours' },
  { value: 'planning', label: 'Revision & Planning' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function TimetablePage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const entries = useTimetableByDate(selectedDate);
  const tasks = useTasks(selectedDate);
  const [activeTab, setActiveTab] = useState('daily');

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  // Seed today's timetable on first load
  useEffect(() => {
    initTimetableForDate(todayStr(), DEFAULT_TIMETABLE);
  }, []);

  // Seed when navigating to a new date
  useEffect(() => {
    initTimetableForDate(selectedDate, DEFAULT_TIMETABLE);
  }, [selectedDate]);

  // Daily completion percentage
  const completionPct = useMemo(() => {
    if (entries.length === 0) return 0;
    const done = entries.filter(e => e.status === 'completed').length;
    return Math.round((done / entries.length) * 100);
  }, [entries]);

  // Day Navigation
  const prevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const nextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const goToday = () => setSelectedDate(todayStr());

  const isToday = selectedDate === todayStr();

  const handleOpenEditSlot = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setSlotModalOpen(true);
  };

  const handleOpenAddSlot = () => {
    setEditingEntry(null);
    setSlotModalOpen(true);
  };

  const handleResetTimetable = async () => {
    if (confirm(`Reset timetable for ${formatDate(selectedDate)} to default schedule?`)) {
      await resetTimetableForDate(selectedDate, DEFAULT_TIMETABLE);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Daily Timetable"
        subtitle="Manage and customize your routine, study hours, and personal free time according to your schedule."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={handleResetTimetable} size="sm" className="text-xs">
              <RefreshCw size={14} /> Reset Schedule
            </Button>
            <Button variant="secondary" onClick={handleOpenAddSlot} size="sm" className="text-xs">
              <Plus size={14} /> Add Time Slot
            </Button>
            <Button onClick={() => setTaskModalOpen(true)} size="sm" className="text-xs">
              <Plus size={14} /> Add Task
            </Button>
          </div>
        }
      />

      {/* Tabs */}
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
          {/* Date navigation card */}
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
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
                  Daily Completion:
                </span>
                <span className={cn(
                  'text-lg font-bold',
                  completionPct >= 80 ? 'text-emerald-500' : completionPct >= 50 ? 'text-amber-500' : 'text-blue-400',
                )}>
                  {completionPct}%
                </span>
              </div>
            </div>
          </Card>

          <ProgressBar
            value={completionPct}
            color={completionPct >= 80 ? 'emerald' : completionPct >= 50 ? 'amber' : 'blue'}
            showPct={false}
            size="sm"
          />

          {/* Timetable Entries List */}
          {entries.length === 0 ? (
            <EmptyState
              icon={<Clock size={48} />}
              title="No timetable entries for this day"
              description="Click 'Add Time Slot' or 'Reset Schedule' to configure your daily routine."
              action={
                <div className="flex gap-2">
                  <Button onClick={handleResetTimetable} size="sm" variant="secondary">Reset to Default</Button>
                  <Button onClick={handleOpenAddSlot} size="sm">Add Time Slot</Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {[...entries]
                .sort((a, b) => a.startHour - b.startHour)
                .map(entry => (
                  <Card
                    key={entry.id}
                    className={cn(
                      'border-l-4 transition-all hover:border-blue-500/40 p-4',
                      CAT_COLOR[entry.category] || 'border-l-slate-400',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Time, Activity & Category */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0 w-36">
                          <Clock size={15} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {entry.time}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              'font-bold text-sm text-slate-900 dark:text-white',
                              entry.status === 'completed' && 'line-through text-slate-400 dark:text-slate-500'
                            )}>
                              {entry.activity}
                            </p>
                            <Badge variant={CAT_BADGE[entry.category] || 'default'}>
                              {entry.category}
                            </Badge>
                            {entry.isBlocked && (
                              <Badge variant="purple" className="flex items-center gap-1 text-[11px]">
                                <Coffee size={11} /> Free Time / Break
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions & Status buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Status buttons */}
                        <div className="flex items-center gap-1">
                          {(['completed', 'skipped', 'rescheduled', 'pending'] as TaskStatus[]).map(s => (
                            <button
                              key={s}
                              title={`Mark as ${s}`}
                              onClick={() => updateTimetableStatus(entry.id, s)}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                STATUS_BTN_STYLE[s],
                                entry.status === s && 'ring-2 ring-current bg-current/10 font-bold',
                              )}
                            >
                              {STATUS_ICON[s]}
                            </button>
                          ))}
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* Edit & Delete */}
                        <button
                          title="Edit this time slot"
                          onClick={() => handleOpenEditSlot(entry)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title="Delete this time slot"
                          onClick={async () => {
                            if (confirm(`Remove "${entry.activity}" from today's timetable?`)) {
                              await deleteTimetableEntry(entry.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* Standalone Tasks Section */}
          {tasks.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks size={18} className="text-blue-400" />
                Additional Tasks Scheduled for Today
              </h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <Card key={task.id} className="p-3.5 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onChange={async (checked) => {
                            await updateTask(task.id, {
                              status: checked ? 'completed' : 'pending'
                            });
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            'text-sm font-semibold truncate',
                            task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          )}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="capitalize">{task.category}</span>
                            {task.description && <span>· {task.description}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-semibold', priorityColor(task.priority))}>
                          {task.priority.toUpperCase()}
                        </span>
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'skipped' ? 'danger' : 'warning'}>
                          {task.status}
                        </Badge>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete task "${task.title}"?`)) {
                              await deleteTask(task.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Weekly Overview Tab */
        <WeeklyOverview selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}

      {/* Edit / Add Slot Modal */}
      <SlotEditModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        entry={editingEntry}
        date={selectedDate}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Slot Edit / Add Modal (Fully customizable)
// ──────────────────────────────────────────────────────────────────────────────
function SlotEditModal({
  open, onClose, entry, date
}: {
  open: boolean; onClose: () => void; entry: TimetableEntry | null; date: string;
}) {
  const [time, setTime] = useState('');
  const [startHour, setStartHour] = useState('17');
  const [endHour, setEndHour] = useState('19');
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('personal');
  const [isBreak, setIsBreak] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('pending');

  useEffect(() => {
    if (entry) {
      setTime(entry.time);
      setStartHour(String(entry.startHour));
      setEndHour(String(entry.endHour));
      setActivity(entry.activity);
      setCategory(entry.category);
      setIsBreak(!!entry.isBlocked);
      setStatus(entry.status);
    } else {
      setTime('2:00 – 4:00 PM');
      setStartHour('14');
      setEndHour('16');
      setActivity('Free Time & Rest');
      setCategory('personal');
      setIsBreak(true);
      setStatus('pending');
    }
  }, [entry, open]);

  const handleSave = async () => {
    if (!time.trim() || !activity.trim()) return;

    const sH = Number(startHour) || 12;
    const eH = Number(endHour) || (sH + 1);

    if (entry) {
      await updateTimetableEntry(entry.id, {
        time: time.trim(),
        startHour: sH,
        endHour: eH,
        activity: activity.trim(),
        category,
        isBlocked: isBreak,
        status,
      });
    } else {
      await addTimetableEntry({
        time: time.trim(),
        startHour: sH,
        endHour: eH,
        activity: activity.trim(),
        category,
        isBlocked: isBreak,
        status: 'pending',
        date,
      });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? 'Edit Timetable Slot' : 'Add Timetable Slot'}>
      <div className="space-y-4 text-xs">
        <Input
          label="Time Display Range"
          placeholder="e.g. 5:00 – 7:00 PM or 2:00 – 4:00 PM"
          value={time}
          onChange={e => setTime(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Hour (0-24)"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={startHour}
            onChange={e => setStartHour(e.target.value)}
          />
          <Input
            label="End Hour (0-24)"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={endHour}
            onChange={e => setEndHour(e.target.value)}
          />
        </div>

        <Input
          label="Activity Name"
          placeholder="e.g. Python learning, DSA Practice, Gym, Free Time & Rest"
          value={activity}
          onChange={e => setActivity(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />

          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'skipped', label: 'Skipped' },
              { value: 'rescheduled', label: 'Rescheduled' },
            ]}
          />
        </div>

        {/* Free Time / Break Toggle */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isBreak}
              onChange={e => setIsBreak(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Mark as Free Time / Rest Break</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-1 pl-6">
            Tagging a slot as a break marks it visually so you know it is your rest period. You can change this or edit activities anytime.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{entry ? 'Save Changes' : 'Add Time Slot'}</Button>
        </div>
      </div>
    </Modal>
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
  const completed = entries.filter(e => e.status === 'completed').length;
  const total = entries.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const today = date === todayStr();

  useEffect(() => {
    initTimetableForDate(date, DEFAULT_TIMETABLE);
  }, [date]);

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'text-center cursor-pointer transition-all p-3.5',
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
        <ProgressBar value={pct} size="sm" showPct={false} color={pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'blue'} />
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{completed}/{total}</p>
      </div>
      {pct === 100 && total > 0 && (
        <span className="text-emerald-400 text-xs font-semibold">✓ Done</span>
      )}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Add-task modal (Unrestricted - schedule tasks whenever you want)
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
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add Scheduled Task">
      <div className="space-y-4 text-xs">
        <Input
          label="Task Title"
          placeholder="What do you need to study or build?"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={e => setCategory(e.target.value)} />
          <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={e => setPriority(e.target.value as Priority)} />
        </div>
        <Input
          label="Time (Optional)"
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
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
