// ============================================================================
// DevPilot — Daily Timetable Page (Upgraded & Robust Routine Engine)
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import {
  format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth,
  endOfMonth, parseISO, getDay
} from 'date-fns';
import {
  Clock, Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2,
  XCircle, RotateCcw, Circle, CalendarDays, ListChecks,
  AlertTriangle, Percent, Edit2, Trash2, Coffee, Sparkles, RefreshCw,
  Lock, Sun, Palmtree, Sliders, Check, HelpCircle, AlertCircle,
  Eye, CheckSquare, Layers, ShieldCheck, GraduationCap, BookOpen,
  BedDouble, Utensils, Laptop
} from 'lucide-react';
import {
  Card, PageHeader, Badge, Button, Modal, Input, Select, Tabs,
  ProgressBar, EmptyState, Checkbox
} from '../components/ui';
import {
  useTimetableByDate, useTasks, useDailySettings, useScheduleExceptions,
  deleteScheduleException, addTask, updateTask, deleteTask,
  updateTimetableStatus, updateTimetableEntry, addTimetableEntry,
  deleteTimetableEntry, initTimetableForDate, resetTimetableForDate,
  lockExpiredSlotsForDate, applyHolidayToDate, removeSlotWithException,
  repairAndSyncTimetable, calculateTimetableStats
} from '../hooks/useDatabase';
import { todayStr, formatDate, formatDay, cn, priorityColor } from '../utils/helpers';
import { DEFAULT_TIMETABLE } from '../data/roadmapData';
import type {
  TaskStatus, Priority, TimetableEntry, ScheduleException,
  ExceptionType, SlotVisualStatus, HolidayMode
} from '../types';

// ── Category → color map ──
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

// Helper to determine slot visual status accurately
export function getSlotVisualStatus(
  entry: TimetableEntry,
  date: string,
  now: Date
): SlotVisualStatus {
  if (entry.status === 'completed') return 'completed';
  // College institutional hours and personal breaks are exempt routine blocks
  if (entry.isExempt || entry.isBlocked || entry.category === 'personal' || entry.category === 'college') {
    return 'exempt';
  }

  const today = todayStr();
  if (date < today) return 'missed';
  if (date > today) return 'upcoming';

  const currentHour = now.getHours() + now.getMinutes() / 60;
  if (currentHour >= entry.endHour) return 'missed';
  if (currentHour >= entry.startHour && currentHour < entry.endHour) return 'in-progress';
  return 'upcoming';
}

export default function TimetablePage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const entries = useTimetableByDate(selectedDate);
  const tasks = useTasks(selectedDate);
  const dailySettings = useDailySettings(selectedDate);
  const exceptions = useScheduleExceptions();
  const [activeTab, setActiveTab] = useState('daily');
  const [statusFilter, setStatusFilter] = useState<'all' | SlotVisualStatus>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sunday auto-holiday preference
  const [autoSundays, setAutoSundays] = useState(() => {
    return localStorage.getItem('devpilot_auto_sundays_holiday') === 'true';
  });

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [manageEntry, setManageEntry] = useState<TimetableEntry | null>(null);
  const [exceptionsModalOpen, setExceptionsModalOpen] = useState(false);
  const [customHolidayModalOpen, setCustomHolidayModalOpen] = useState(false);

  // Switch holiday confirmation modal state
  const [switchConfirmOpen, setSwitchConfirmOpen] = useState(false);
  const [targetHolidayMode, setTargetHolidayMode] = useState<HolidayMode>('normal');

  // Auto-prompt holiday state
  const showHolidayPrompt = useMemo(() => {
    return dailySettings === undefined;
  }, [dailySettings]);

  // Periodic ticker: check and lock expired slots every 10 seconds
  useEffect(() => {
    lockExpiredSlotsForDate(selectedDate);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      lockExpiredSlotsForDate(selectedDate);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  // Handle Sunday auto-holiday rule if setting is enabled and not answered yet
  useEffect(() => {
    if (autoSundays && dailySettings === undefined) {
      const isSunday = getDay(parseISO(selectedDate)) === 0;
      if (isSunday) {
        applyHolidayToDate(selectedDate, 'holiday-no-study', 'Automatic Sunday Rest Day');
      }
    }
  }, [selectedDate, autoSundays, dailySettings]);

  // Seed & automatically repair timetable for date on mount and navigation
  useEffect(() => {
    repairAndSyncTimetable(selectedDate);
  }, [selectedDate]);

  // Calculate stats using unified robust formula
  const stats = useMemo(() => {
    return calculateTimetableStats(entries, dailySettings?.isNoStudyDay);
  }, [entries, dailySettings]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.startHour - b.startHour)
      .filter(entry => {
        if (statusFilter === 'all') return true;
        const vStatus = getSlotVisualStatus(entry, selectedDate, currentTime);
        return vStatus === statusFilter;
      });
  }, [entries, statusFilter, selectedDate, currentTime]);

  // Day Navigation
  const prevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const nextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const goToday = () => setSelectedDate(todayStr());

  const isToday = selectedDate === todayStr();

  // Handlers
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

  // Holiday mode change handler
  const handleRequestModeChange = (targetMode: HolidayMode) => {
    if (isToday && targetMode === 'normal') {
      const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
      // If switching to normal after 2 PM, warn user
      if (currentHour >= 14) {
        setTargetHolidayMode('normal');
        setSwitchConfirmOpen(true);
        return;
      }
    }
    applyHolidayToDate(selectedDate, targetMode);
  };

  const handleConfirmSwitch = async () => {
    setSwitchConfirmOpen(false);
    await applyHolidayToDate(selectedDate, targetHolidayMode);
  };

  // Checkbox toggle handler
  const handleToggleSlotCheck = async (entry: TimetableEntry) => {
    const vStatus = getSlotVisualStatus(entry, selectedDate, currentTime);

    // If missed/expired, strictly forbid completion
    if (vStatus === 'missed') {
      alert('This time slot has expired and is locked. Missed activities cannot be marked completed.');
      return;
    }

    if (entry.status === 'completed') {
      await updateTimetableStatus(entry.id, 'pending');
    } else {
      await updateTimetableStatus(entry.id, 'completed');
    }
  };

  const activeExceptionsCount = exceptions.length;
  const currentHolidayMode = dailySettings?.holidayMode || (dailySettings?.isHoliday ? (dailySettings?.isNoStudyDay ? 'holiday-no-study' : 'holiday-study') : 'normal');

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Daily Timetable"
        subtitle="Command your day with automatic missed-slot locking, intelligent holiday study dividing, and cut-off rest days."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {activeExceptionsCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExceptionsModalOpen(true)}
                className="text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
              >
                <Layers size={14} /> Exceptions ({activeExceptionsCount})
              </Button>
            )}
            <Button variant="secondary" onClick={() => setCustomHolidayModalOpen(true)} size="sm" className="text-xs">
              <Sun size={14} /> Advance Holiday
            </Button>
            <Button variant="secondary" onClick={handleResetTimetable} size="sm" className="text-xs">
              <RefreshCw size={14} /> Reset Schedule
            </Button>
            <Button variant="secondary" onClick={handleOpenAddSlot} size="sm" className="text-xs">
              <Plus size={14} /> Add Slot
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
          {/* ── Schedule Mode Selector & Status Card ── */}
          <Card className="p-3.5 border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {currentHolidayMode === 'normal' && (
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <GraduationCap size={20} />
                  </div>
                )}
                {currentHolidayMode === 'holiday-study' && (
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Laptop size={20} />
                  </div>
                )}
                {currentHolidayMode === 'holiday-no-study' && (
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Palmtree size={20} />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentHolidayMode === 'normal' && '📚 Normal College Routine'}
                      {currentHolidayMode === 'holiday-study' && '💻 Holiday Study Plan Active'}
                      {currentHolidayMode === 'holiday-no-study' && '🌴 Rest Day (No Study) Active'}
                    </span>
                    {currentHolidayMode === 'normal' && (
                      <Badge variant="info">College 6 AM – 2 PM (No Task Checkbox)</Badge>
                    )}
                    {currentHolidayMode === 'holiday-study' && (
                      <Badge variant="success">6 AM – 2 PM Divided into Study Sessions</Badge>
                    )}
                    {currentHolidayMode === 'holiday-no-study' && (
                      <Badge variant="purple">Cut off from Weekly Progress · Excused</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentHolidayMode === 'normal' && 'College attendance is fixed routine. 3–4 PM College Academics has task checkbox (locks if missed).'}
                    {currentHolidayMode === 'holiday-study' && 'Morning college hours divided into Python, Web Dev, System Design, and College Academics practice.'}
                    {currentHolidayMode === 'holiday-no-study' && 'Full rest day. Automatically cut off from this week\'s study progress so your score is not penalized.'}
                  </p>
                </div>
              </div>

              {/* Mode switch pills */}
              <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('normal')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                    currentHolidayMode === 'normal'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <GraduationCap size={13} /> Normal Day
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('holiday-study')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                    currentHolidayMode === 'holiday-study'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Laptop size={13} /> Holiday Study
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('holiday-no-study')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                    currentHolidayMode === 'holiday-no-study'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Palmtree size={13} /> Day Off
                </button>
              </div>
            </div>
          </Card>

          {/* Date navigation & Statistics Header */}
          <Card className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={prevDay}><ChevronLeft size={18} /></Button>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatDay(selectedDate)}, {formatDate(selectedDate)}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    {isToday && <Badge variant="info">Today</Badge>}
                    {dailySettings?.isNoStudyDay ? (
                      <Badge variant="purple">Rest Day (Excused)</Badge>
                    ) : dailySettings?.isHoliday ? (
                      <Badge variant="success">Holiday Study</Badge>
                    ) : (
                      <Badge variant="default">Normal Day</Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={nextDay}><ChevronRight size={18} /></Button>
              </div>

              <div className="flex items-center gap-4">
                {!isToday && (
                  <Button variant="secondary" size="sm" onClick={goToday}>
                    <Calendar size={14} /> Jump to Today
                  </Button>
                )}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Percent size={16} className="text-blue-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Completion:
                  </span>
                  <span className={cn(
                    'text-base font-bold',
                    stats.completionPct >= 80 ? 'text-emerald-500' : stats.completionPct >= 50 ? 'text-amber-500' : 'text-blue-400',
                  )}>
                    {dailySettings?.isNoStudyDay ? 'Excused (100%)' : `${stats.completionPct}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Required Study Slots</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {dailySettings?.isNoStudyDay ? '0 (Day Off)' : stats.totalRequired}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[11px] text-emerald-400 font-medium">Completed</p>
                <p className="text-base font-bold text-emerald-500 mt-0.5">{stats.completed}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-[11px] text-red-400 font-medium">Missed (Locked)</p>
                <p className="text-base font-bold text-red-500 mt-0.5">{stats.missed}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-[11px] text-blue-400 font-medium">In Progress</p>
                <p className="text-base font-bold text-blue-500 mt-0.5">{stats.inProgress}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Upcoming</p>
                <p className="text-base font-bold text-slate-400 mt-0.5">{stats.upcoming}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[11px] text-indigo-400 font-medium">College & Breaks</p>
                <p className="text-base font-bold text-indigo-400 mt-0.5">{stats.exempt}</p>
              </div>
            </div>

            <ProgressBar
              value={stats.completionPct}
              color={stats.completionPct >= 80 ? 'emerald' : stats.completionPct >= 50 ? 'amber' : 'blue'}
              showPct={false}
              size="sm"
            />
          </Card>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1 text-[11px]">Filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                All ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('in-progress')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'in-progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'upcoming'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                Completed ({stats.completed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('missed')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'missed'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                Missed ({stats.missed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('exempt')}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                  statusFilter === 'exempt'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                College & Breaks ({stats.exempt})
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock size={12} />
              <span>Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Timetable Entries List */}
          {filteredEntries.length === 0 ? (
            <EmptyState
              icon={<Clock size={48} />}
              title="No slots found for this filter"
              description="Adjust your filter or click 'Reset Schedule' to restore the standard routine."
              action={
                <div className="flex gap-2">
                  <Button onClick={() => setStatusFilter('all')} size="sm" variant="secondary">Clear Filter</Button>
                  <Button onClick={handleOpenAddSlot} size="sm">Add Time Slot</Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredEntries.map(entry => {
                const visualStatus = getSlotVisualStatus(entry, selectedDate, currentTime);
                const isMissed = visualStatus === 'missed';
                const isCompleted = visualStatus === 'completed';
                const isInProgress = visualStatus === 'in-progress';

                // Does this slot have a task completion checkbox?
                // College (6 AM - 2 PM) and personal breaks do NOT have checkboxes.
                // 3 PM - 4 PM College Academics & study sessions DO have checkboxes!
                const isCollegeBlock = entry.slotId === 'slot-college' || entry.category === 'college';
                const isPersonalBreak = entry.isBlocked || entry.category === 'personal';
                const hasTaskCheckbox = !isCollegeBlock && !isPersonalBreak && !dailySettings?.isNoStudyDay;

                return (
                  <Card
                    key={entry.id}
                    className={cn(
                      'border-l-4 transition-all p-4',
                      CAT_COLOR[entry.category] || 'border-l-slate-400',
                      isInProgress && 'ring-2 ring-blue-500/50 shadow-md bg-blue-500/5',
                      isMissed && 'border-l-red-500 bg-red-500/[0.02]',
                      isCompleted && 'border-l-emerald-500 bg-emerald-500/[0.02]',
                      isCollegeBlock && 'border-l-blue-600 bg-blue-500/[0.03]'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Checkbox / Icon + Time + Activity details */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* Status Checkbox or Institutional Routine Icon */}
                        <div className="pt-0.5 sm:pt-0 shrink-0">
                          {isCollegeBlock ? (
                            <div
                              title="College Hours (6:00 AM – 2:00 PM) · Fixed Institutional Routine"
                              className="w-5 h-5 rounded-md border border-blue-400/40 bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"
                            >
                              <GraduationCap size={13} />
                            </div>
                          ) : !hasTaskCheckbox ? (
                            <div
                              title={entry.activity}
                              className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0"
                            >
                              {entry.activity.toLowerCase().includes('lunch') ? (
                                <Utensils size={12} />
                              ) : entry.activity.toLowerCase().includes('sleep') ? (
                                <BedDouble size={12} />
                              ) : dailySettings?.isNoStudyDay ? (
                                <Palmtree size={12} className="text-indigo-400" />
                              ) : (
                                <Coffee size={12} />
                              )}
                            </div>
                          ) : isMissed ? (
                            <button
                              type="button"
                              disabled
                              title="Time has expired for this study task. It is permanently locked."
                              className="w-5 h-5 rounded-md border-2 border-red-500/40 bg-red-500/10 text-red-500 flex items-center justify-center cursor-not-allowed opacity-80"
                            >
                              <Lock size={12} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleSlotCheck(entry)}
                              title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                              className={cn(
                                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer',
                                isCompleted
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : isInProgress
                                  ? 'border-blue-500 hover:bg-blue-500/20 text-blue-500 ring-2 ring-blue-500/30'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
                              )}
                            >
                              {isCompleted && <Check size={13} strokeWidth={3} />}
                            </button>
                          )}
                        </div>

                        {/* Time range */}
                        <div className="flex items-center gap-1.5 shrink-0 w-36">
                          <Clock size={14} className={cn(
                            'shrink-0',
                            isInProgress ? 'text-blue-500 animate-pulse' : 'text-slate-400'
                          )} />
                          <span className={cn(
                            'text-xs font-semibold',
                            isInProgress ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                          )}>
                            {entry.time}
                          </span>
                        </div>

                        {/* Title and Badges */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn(
                              'font-bold text-sm text-slate-900 dark:text-white',
                              isCompleted && 'line-through text-slate-400 dark:text-slate-500',
                              isMissed && 'text-slate-600 dark:text-slate-400'
                            )}>
                              {entry.activity}
                            </p>

                            <Badge variant={CAT_BADGE[entry.category] || 'default'}>
                              {entry.category}
                            </Badge>

                            {/* College fixed routine indicator */}
                            {isCollegeBlock && (
                              <Badge variant="info" className="gap-1 text-[10px]">
                                <GraduationCap size={10} /> College Routine
                              </Badge>
                            )}

                            {/* Dynamic visual status badge */}
                            {isInProgress && (
                              <Badge variant="info" className="animate-pulse gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                                In Progress
                              </Badge>
                            )}

                            {isCompleted && (
                              <Badge variant="success" className="gap-1">
                                <Check size={11} strokeWidth={3} /> Completed
                              </Badge>
                            )}

                            {isMissed && (
                              <Badge variant="danger" className="gap-1">
                                <Lock size={10} /> Missed · Locked
                              </Badge>
                            )}

                            {entry.isHoliday && !dailySettings?.isNoStudyDay && (
                              <Badge variant="success" className="gap-1 text-[10px]">
                                <Laptop size={10} /> Holiday Study Session
                              </Badge>
                            )}

                            {dailySettings?.isNoStudyDay && (
                              <Badge variant="purple" className="gap-1 text-[10px]">
                                <Palmtree size={10} /> Day Off Rest
                              </Badge>
                            )}

                            {entry.isBlocked && !isCollegeBlock && !entry.isHoliday && (
                              <Badge variant="purple" className="gap-1 text-[10px]">
                                <Coffee size={10} /> Rest Break
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Manage Slot and Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                        {/* Manage Slot Button */}
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setManageEntry(entry)}
                          className="text-xs flex items-center gap-1.5 border-slate-300 dark:border-slate-700"
                        >
                          <Sliders size={13} />
                          <span>Manage Slot</span>
                        </Button>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                        {/* Edit Button */}
                        <button
                          title="Edit slot details"
                          onClick={() => handleOpenEditSlot(entry)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          title="Delete slot"
                          onClick={async () => {
                            if (confirm(`Remove "${entry.activity}" from today's timetable?`)) {
                              await deleteTimetableEntry(entry.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Standalone Tasks Section */}
          {tasks.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks size={18} className="text-blue-400" />
                Additional Scheduled Tasks
              </h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <Card key={task.id} className="p-3 border-l-4 border-l-blue-500">
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
                          className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
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
        /* Weekly Calendar Overview Tab */
        <WeeklyOverview selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}

      {/* ── DAILY SCHEDULE / HOLIDAY PROMPT MODAL ── */}
      <HolidayPromptModal
        open={showHolidayPrompt}
        date={selectedDate}
        onSelect={async (mode) => {
          await applyHolidayToDate(selectedDate, mode);
        }}
      />

      {/* ── SWITCH HOLIDAY SAFETY CONFIRMATION MODAL ── */}
      <Modal
        open={switchConfirmOpen}
        onClose={() => setSwitchConfirmOpen(false)}
        title="College Slot Already Ended"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Notice: 6:00 AM – 2:00 PM Slot Has Ended</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                You are switching today back to a Normal Day after 2:00 PM.
                College hours (6:00 AM – 2:00 PM) will remain recorded as normal institutional routine, while 3:00 PM – 4:00 PM College Academics will maintain its active status.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSwitchConfirmOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSwitch}>Confirm Switch to Normal Day</Button>
          </div>
        </div>
      </Modal>

      {/* ── MANAGE SLOT MODAL ── */}
      {manageEntry && (
        <ManageSlotModal
          open={!!manageEntry}
          onClose={() => setManageEntry(null)}
          entry={manageEntry}
          selectedDate={selectedDate}
          onEdit={() => {
            const entryToEdit = manageEntry;
            setManageEntry(null);
            handleOpenEditSlot(entryToEdit);
          }}
        />
      )}

      {/* ── ACTIVE SCHEDULE EXCEPTIONS MODAL ── */}
      <ScheduleExceptionsModal
        open={exceptionsModalOpen}
        onClose={() => setExceptionsModalOpen(false)}
        exceptions={exceptions}
        onRestore={async (id) => {
          await deleteScheduleException(id);
          // Re-init current date to restore slots
          await initTimetableForDate(selectedDate, DEFAULT_TIMETABLE);
        }}
      />

      {/* ── ADVANCE CUSTOM HOLIDAY MODAL ── */}
      <AdvanceHolidayModal
        open={customHolidayModalOpen}
        onClose={() => setCustomHolidayModalOpen(false)}
        autoSundays={autoSundays}
        onToggleAutoSundays={(val) => {
          setAutoSundays(val);
          localStorage.setItem('devpilot_auto_sundays_holiday', String(val));
        }}
        onAddHoliday={async (holidayDate, mode, reason) => {
          await applyHolidayToDate(holidayDate, mode, reason);
          setCustomHolidayModalOpen(false);
          alert(`Schedule configured for ${formatDate(holidayDate)}: ${reason}`);
        }}
      />

      {/* ── SLOT EDIT / ADD MODAL ── */}
      <SlotEditModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        entry={editingEntry}
        date={selectedDate}
      />

      {/* ── ADD TASK MODAL ── */}
      <AddTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. DAILY SCHEDULE / HOLIDAY PROMPT MODAL (3 Options)
// ──────────────────────────────────────────────────────────────────────────────
function HolidayPromptModal({
  open,
  date,
  onSelect,
}: {
  open: boolean;
  date: string;
  onSelect: (mode: HolidayMode) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Calendar size={28} />
        </div>

        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
            Daily Routine Plan · {formatDate(date)}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            What is your schedule for today?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Choose your daily structure. On normal days, College (6 AM – 2 PM) is fixed routine. On holidays, you can divide morning hours into focused study sessions or take a complete Day Off cut off from weekly progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* 1. NORMAL COLLEGE DAY */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onSelect('normal');
              setLoading(false);
            }}
            className="flex flex-col p-4 rounded-xl border-2 border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/15 text-left transition-all cursor-pointer group"
          >
            <GraduationCap size={22} className="text-blue-500 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Normal College Day
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              6 AM – 2 PM College (locked, no checkbox). 3–4 PM College Academics active.
            </span>
          </button>

          {/* 2. HOLIDAY WITH STUDY PLAN */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onSelect('holiday-study');
              setLoading(false);
            }}
            className="flex flex-col p-4 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15 text-left transition-all cursor-pointer group"
          >
            <Laptop size={22} className="text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Holiday (Study Plan)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Divides 6 AM – 2 PM into Python, Web Dev, System Design & Academics.
            </span>
          </button>

          {/* 3. NO STUDY (DAY OFF) */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onSelect('holiday-no-study');
              setLoading(false);
            }}
            className="flex flex-col p-4 rounded-xl border-2 border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/15 text-left transition-all cursor-pointer group"
          >
            <Palmtree size={22} className="text-indigo-500 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              No Study (Day Off)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Full rest day. Automatically cut off from this week's study progress.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. MANAGE SLOT MODAL (Remove for Today / Week / Month / Permanent)
// ──────────────────────────────────────────────────────────────────────────────
function ManageSlotModal({
  open,
  onClose,
  entry,
  selectedDate,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  entry: TimetableEntry;
  selectedDate: string;
  onEdit: () => void;
}) {
  const [confirmType, setConfirmType] = useState<ExceptionType | null>(null);
  const [loading, setLoading] = useState(false);

  const slotId = entry.slotId || entry.id;

  // Compute dates for week and month
  const weekStart = format(startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 'MMM dd');
  const weekEnd = format(endOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 'MMM dd, yyyy');
  const monthName = format(parseISO(selectedDate), 'MMMM yyyy');

  const handleExecuteRemoval = async (type: ExceptionType) => {
    setLoading(true);
    await removeSlotWithException(slotId, type, selectedDate);
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Manage Slot: ${entry.activity}`}>
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white">{entry.activity}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Scheduled: {entry.time} · Date: {formatDate(selectedDate)}
          </p>
        </div>

        {confirmType ? (
          /* Confirmation step */
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  Confirm Removal for {confirmType.toUpperCase()}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {confirmType === 'day' && `Remove "${entry.activity}" for today (${formatDate(selectedDate)}) only? It will return tomorrow.`}
                  {confirmType === 'week' && `Remove "${entry.activity}" for the entire week (${weekStart} – ${weekEnd})? It will automatically return next week.`}
                  {confirmType === 'month' && `Remove "${entry.activity}" for the entire month of ${monthName}? It will automatically return on the 1st of next month.`}
                  {confirmType === 'permanent' && `Permanently remove "${entry.activity}" from recurring schedule until manually re-added?`}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmType(null)}>Back</Button>
              <Button
                variant="danger"
                size="sm"
                disabled={loading}
                onClick={() => handleExecuteRemoval(confirmType)}
              >
                {loading ? 'Removing...' : 'Yes, Confirm Removal'}
              </Button>
            </div>
          </div>
        ) : (
          /* Option Action Cards */
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleExecuteRemoval('day')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">1. Remove for Today Only</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Disappears only on {formatDate(selectedDate)}. Automatically returns tomorrow.
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('week')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">2. Remove for the Entire Week</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Removes from {weekStart} to {weekEnd}. Automatically returns next Monday.
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('month')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">3. Remove for the Entire Month</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Removes for all of {monthName}. Automatically returns next month.
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('permanent')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-red-500/20 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 transition-all text-left cursor-pointer text-red-500"
            >
              <div>
                <p className="font-bold">4. Remove Permanently</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Removes this recurring slot indefinitely until manually re-added.
                </p>
              </div>
              <Trash2 size={16} className="text-red-400" />
            </button>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit2 size={13} /> Edit Slot Details
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. ACTIVE SCHEDULE EXCEPTIONS MODAL
// ──────────────────────────────────────────────────────────────────────────────
function ScheduleExceptionsModal({
  open,
  onClose,
  exceptions,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  exceptions: ScheduleException[];
  onRestore: (id: string) => Promise<void>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Active Schedule Exceptions">
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">
          The following timetable slots have been temporarily or permanently removed. You can restore any slot with one click.
        </p>

        {exceptions.length === 0 ? (
          <p className="text-center py-6 text-slate-400">No active exceptions found.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {exceptions.map(ex => (
              <div
                key={ex.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white capitalize">
                      {ex.slotId.replace('slot-', '')}
                    </span>
                    <Badge variant={ex.type === 'permanent' ? 'danger' : 'warning'}>
                      {ex.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Range: {ex.startDate} to {ex.endDate} · {ex.reason}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => onRestore(ex.id)}
                  className="shrink-0"
                >
                  <RotateCcw size={12} /> Restore Slot
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. ADVANCE HOLIDAY & SUNDAYS CONFIG MODAL
// ──────────────────────────────────────────────────────────────────────────────
function AdvanceHolidayModal({
  open,
  onClose,
  autoSundays,
  onToggleAutoSundays,
  onAddHoliday,
}: {
  open: boolean;
  onClose: () => void;
  autoSundays: boolean;
  onToggleAutoSundays: (val: boolean) => void;
  onAddHoliday: (date: string, mode: HolidayMode, reason: string) => Promise<void>;
}) {
  const [date, setDate] = useState(todayStr());
  const [mode, setMode] = useState<HolidayMode>('holiday-study');
  const [reason, setReason] = useState('Festival / College Holiday');

  return (
    <Modal open={open} onClose={onClose} title="Holidays & Day-Off Preferences">
      <div className="space-y-4 text-xs">
        {/* Auto Sundays setting */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Automatically treat Sundays as Day Off
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When enabled, Sundays are automatically cut off from weekly study progress.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSundays}
              onChange={e => onToggleAutoSundays(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Advance Custom Holiday picker */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sun size={15} className="text-amber-500" /> Pre-schedule a Holiday
          </h4>
          <Input
            label="Holiday Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Select
            label="Plan Type for this Holiday"
            value={mode}
            onChange={e => setMode(e.target.value as HolidayMode)}
            options={[
              { value: 'holiday-study', label: 'Holiday Study Plan (Divide 6 AM - 2 PM into study)' },
              { value: 'holiday-no-study', label: 'No Study (Day Off - cut off from weekly progress)' },
              { value: 'normal', label: 'Normal College Day' },
            ]}
          />
          <Input
            label="Reason / Occasion"
            placeholder="e.g. Diwali, College Fest, Semester Break"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAddHoliday(date, mode, reason)}>Save Schedule Plan</Button>
        </div>
      </div>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. SLOT EDIT / ADD MODAL
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
            step="0.25"
            value={startHour}
            onChange={e => setStartHour(e.target.value)}
          />
          <Input
            label="End Hour (0-24)"
            type="number"
            min="0"
            max="24"
            step="0.25"
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
              { value: 'missed', label: 'Missed' },
              { value: 'exempt', label: 'Exempt' },
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
            Tagging a slot as free time or break excludes it from penalizing daily completion percentages.
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
// 6. WEEKLY CALENDAR OVERVIEW COMPONENT (With Cut-Off Day Off Exclusion)
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
  const dailySettings = useDailySettings(date);
  const today = date === todayStr();

  useEffect(() => {
    initTimetableForDate(date, DEFAULT_TIMETABLE);
  }, [date]);

  const stats = useMemo(() => {
    return calculateTimetableStats(entries, dailySettings?.isNoStudyDay);
  }, [entries, dailySettings]);

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
      <div className="flex items-center justify-center gap-1 mt-1">
        {today && <Badge variant="info" className="text-[10px]">Today</Badge>}
        {dailySettings?.isNoStudyDay ? (
          <Badge variant="purple" className="text-[10px]">Day Off</Badge>
        ) : dailySettings?.isHoliday ? (
          <Badge variant="success" className="text-[10px]">Holiday Study</Badge>
        ) : null}
      </div>
      <div className="mt-3">
        <ProgressBar
          value={stats.completionPct}
          size="sm"
          showPct={false}
          color={stats.completionPct >= 80 ? 'emerald' : stats.completionPct >= 50 ? 'amber' : 'blue'}
        />
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          {dailySettings?.isNoStudyDay ? 'Excused' : `${stats.completed}/${stats.totalRequired} req`}
        </p>
      </div>
      {stats.completionPct === 100 && (
        <span className="text-emerald-400 text-xs font-semibold">
          {dailySettings?.isNoStudyDay ? '🌴 Rest' : '✓ 100%'}
        </span>
      )}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. ADD TASK MODAL
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
