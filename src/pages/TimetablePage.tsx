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
  repairAndSyncTimetable, calculateTimetableStats, loadReadyMadeTimetable,
  clearTimetableForDate, deduplicateEntriesInMemory
} from '../hooks/useDatabase';
import { todayStr, formatDate, formatDay, cn, priorityColor } from '../utils/helpers';
import { DEFAULT_TIMETABLE } from '../data/roadmapData';
import type {
  TaskStatus, Priority, TimetableEntry, ScheduleException,
  ExceptionType, SlotVisualStatus, HolidayMode
} from '../types';

// ── Category → color & style map (High-readability cyber portal theme) ──
export const CAT_STYLE: Record<string, {
  border: string;
  bg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  python: {
    border: 'border-l-emerald-400',
    bg: 'bg-gradient-to-r from-emerald-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-emerald-950/70',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/50',
  },
  'cpp-dsa': {
    border: 'border-l-violet-400',
    bg: 'bg-gradient-to-r from-violet-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-violet-950/70',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/50',
  },
  webdev: {
    border: 'border-l-cyan-400',
    bg: 'bg-gradient-to-r from-cyan-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-cyan-950/70',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/50',
  },
  academics: {
    border: 'border-l-amber-400',
    bg: 'bg-gradient-to-r from-amber-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-amber-950/70',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/50',
  },
  personal: {
    border: 'border-l-indigo-400',
    bg: 'bg-gradient-to-r from-indigo-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-indigo-950/70',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/50',
  },
  college: {
    border: 'border-l-blue-400',
    bg: 'bg-gradient-to-r from-blue-950/35 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-blue-950/70',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/50',
  },
  planning: {
    border: 'border-l-teal-400',
    bg: 'bg-gradient-to-r from-teal-950/30 via-[#0d1424] to-[#070b16]',
    badgeBg: 'bg-teal-950/70',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/50',
  },
};

const CAT_COLOR: Record<string, string> = {
  python: 'border-l-emerald-400 bg-emerald-950/30 shadow-emerald-500/10 hover:border-l-emerald-300',
  'cpp-dsa': 'border-l-violet-400 bg-violet-950/30 shadow-violet-500/10 hover:border-l-violet-300',
  webdev: 'border-l-cyan-400 bg-cyan-950/30 shadow-cyan-500/10 hover:border-l-cyan-300',
  academics: 'border-l-amber-400 bg-amber-950/30 shadow-amber-500/10 hover:border-l-amber-300',
  personal: 'border-l-indigo-400 bg-indigo-950/30 shadow-indigo-500/10 hover:border-l-indigo-300',
  college: 'border-l-blue-400 bg-blue-950/35 shadow-blue-500/10 hover:border-l-blue-300',
  planning: 'border-l-teal-400 bg-teal-950/30 shadow-teal-500/10 hover:border-l-teal-300',
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
    return deduplicateEntriesInMemory(entries)
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

  const handleLoadReadyMade = async () => {
    const modeLabel = currentHolidayMode === 'holiday-study'
      ? 'Holiday Study Schedule'
      : currentHolidayMode === 'holiday-no-study'
      ? 'Holiday Rest Day Routine'
      : 'Normal College & Study Schedule';

    if (entries.length > 0) {
      if (!confirm(`Load ready-made ${modeLabel} for ${formatDate(selectedDate)}? This will replace current slots with the recommended template.`)) {
        return;
      }
    }
    await loadReadyMadeTimetable(selectedDate);
  };

  const handleClearDay = async () => {
    if (confirm(`Clear all timetable slots for ${formatDate(selectedDate)}? You can add your own custom slots from scratch.`)) {
      await clearTimetableForDate(selectedDate);
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
      {/* ── 3D TIME COMMAND PORTAL HERO BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-cyan-500/30 bg-gradient-to-r from-[#0b1429] via-[#0d1c3a] to-[#080e1e] shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Futuristic glowing cyber accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                DOOR 01 // TIME COMMAND PORTAL
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Clock size={11} className="text-cyan-400" /> CHRONO SYNC ACTIVE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Daily Timetable & Planner
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Automated missed-slot locking, intelligent holiday routine divisions, and cut-off rest days engineered for peak productivity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeExceptionsCount > 0 && (
              <button
                type="button"
                onClick={() => setExceptionsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-200 hover:text-white border border-amber-500/50 bg-amber-950/50 hover:bg-amber-900/60 shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Layers size={14} className="text-amber-400" /> Exceptions ({activeExceptionsCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setCustomHolidayModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-600 hover:border-amber-400 shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Sun size={14} className="text-amber-400" /> Advance Holiday
            </button>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={handleClearDay}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white border border-rose-500/50 bg-rose-950/50 hover:bg-rose-900/60 shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Trash2 size={14} className="text-rose-400" /> Clear Slots
              </button>
            )}
            <button
              type="button"
              onClick={handleLoadReadyMade}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-200 hover:text-white border border-cyan-500/50 bg-cyan-950/50 hover:bg-cyan-900/60 shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-400" /> Ready-made Template
            </button>
            <button
              type="button"
              onClick={handleOpenAddSlot}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={14} className="text-cyan-400" /> Add Slot
            </button>
            <button
              type="button"
              onClick={() => setTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>
        </div>
      </div>

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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c1426] via-[#09101f] to-[#070c18] border border-slate-800/90 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentHolidayMode === 'normal' && (
                  <div className="p-2.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl shadow-inner">
                    <GraduationCap size={22} />
                  </div>
                )}
                {currentHolidayMode === 'holiday-study' && (
                  <div className="p-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-inner">
                    <Laptop size={22} />
                  </div>
                )}
                {currentHolidayMode === 'holiday-no-study' && (
                  <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-inner">
                    <Palmtree size={22} />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-base text-white tracking-tight">
                      {currentHolidayMode === 'normal' && '📚 Normal College Routine'}
                      {currentHolidayMode === 'holiday-study' && '💻 Holiday Study Plan Active'}
                      {currentHolidayMode === 'holiday-no-study' && '🌴 Rest Day (No Study) Active'}
                    </span>
                    {currentHolidayMode === 'normal' && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
                        College 6 AM – 2 PM (No Task Checkbox)
                      </span>
                    )}
                    {currentHolidayMode === 'holiday-study' && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        6 AM – 2 PM Divided into Study Sessions
                      </span>
                    )}
                    {currentHolidayMode === 'holiday-no-study' && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                        Cut off from Weekly Progress · Excused
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {currentHolidayMode === 'normal' && 'College attendance is fixed routine. 3–4 PM College Academics has task checkbox (locks if missed).'}
                    {currentHolidayMode === 'holiday-study' && 'Morning college hours divided into Python, Web Dev, System Design, and College Academics practice.'}
                    {currentHolidayMode === 'holiday-no-study' && 'Full rest day. Automatically cut off from this week\'s study progress so your score is not penalized.'}
                  </p>
                </div>
              </div>

              {/* Mode switch pills */}
              <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('normal')}
                  className={cn(
                    'px-3.5 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95',
                    currentHolidayMode === 'normal'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                  )}
                >
                  <GraduationCap size={15} className={currentHolidayMode === 'normal' ? 'text-white' : 'text-blue-400'} />
                  <span>Normal Day</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('holiday-study')}
                  className={cn(
                    'px-3.5 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95',
                    currentHolidayMode === 'holiday-study'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/50'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                  )}
                >
                  <Laptop size={15} className={currentHolidayMode === 'holiday-study' ? 'text-white' : 'text-emerald-400'} />
                  <span>Holiday Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestModeChange('holiday-no-study')}
                  className={cn(
                    'px-3.5 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95',
                    currentHolidayMode === 'holiday-no-study'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/50'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                  )}
                >
                  <Palmtree size={15} className={currentHolidayMode === 'holiday-no-study' ? 'text-white' : 'text-indigo-400'} />
                  <span>Rest Day</span>
                </button>
              </div>
            </div>
          </div>

          {/* Date navigation & Statistics Header */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1426] to-[#070c18] border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={prevDay} className="text-white hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 border-slate-600">
                  <ChevronLeft size={18} />
                </Button>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {formatDay(selectedDate)}, {formatDate(selectedDate)}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {isToday && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-400/50">
                        Today
                      </span>
                    )}
                    {dailySettings?.isNoStudyDay ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-400/50">
                        Rest Day (Excused)
                      </span>
                    ) : dailySettings?.isHoliday ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-400/50">
                        Holiday Study
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-950 text-blue-300 border border-blue-400/50">
                        Normal Day
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={nextDay} className="text-white hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 border-slate-600">
                  <ChevronRight size={18} />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {!isToday && (
                  <Button variant="secondary" size="sm" onClick={goToday} className="text-white font-bold bg-slate-800 hover:bg-slate-700 border-cyan-500/40 hover:border-cyan-400 shadow-sm">
                    <Calendar size={14} className="text-cyan-400" /> Jump to Today
                  </Button>
                )}
                <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/40 rounded-2xl shadow-inner">
                  <Percent size={18} className="text-cyan-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Completion:
                  </span>
                  <span className={cn(
                    'text-lg font-black',
                    stats.completionPct >= 80 ? 'text-emerald-400' : stats.completionPct >= 50 ? 'text-amber-400' : 'text-cyan-300',
                  )}>
                    {dailySettings?.isNoStudyDay ? 'Excused (100%)' : `${stats.completionPct}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Holographic Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Required Slots</p>
                <p className="text-xl font-black text-white mt-1">
                  {dailySettings?.isNoStudyDay ? '0 (Day Off)' : stats.totalRequired}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10">
                <p className="text-[11px] text-emerald-300 font-extrabold uppercase tracking-wider">Completed</p>
                <p className="text-xl font-black text-emerald-300 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 shadow-sm shadow-red-500/10">
                <p className="text-[11px] text-red-300 font-extrabold uppercase tracking-wider">Missed / Locked</p>
                <p className="text-xl font-black text-red-300 mt-1">{stats.missed}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/15">
                <p className="text-[11px] text-cyan-300 font-extrabold uppercase tracking-wider">In Progress</p>
                <p className="text-xl font-black text-cyan-300 mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Upcoming</p>
                <p className="text-xl font-black text-slate-200 mt-1">{stats.upcoming}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/10">
                <p className="text-[11px] text-indigo-300 font-extrabold uppercase tracking-wider">College & Breaks</p>
                <p className="text-xl font-black text-indigo-300 mt-1">{stats.exempt}</p>
              </div>
            </div>

            <ProgressBar
              value={stats.completionPct}
              color={stats.completionPct >= 80 ? 'emerald' : stats.completionPct >= 50 ? 'amber' : 'blue'}
              showPct={false}
              size="sm"
            />
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-extrabold mr-1 text-[11px] uppercase tracking-wider pl-1">Filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 border border-cyan-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                All ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('in-progress')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'in-progress'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'upcoming'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'completed'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                Completed ({stats.completed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('missed')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'missed'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 border border-red-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                Missed ({stats.missed})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('exempt')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl font-extrabold transition-all duration-200 cursor-pointer text-xs active:scale-95 hover:-translate-y-0.5',
                  statusFilter === 'exempt'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/50'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500'
                )}
              >
                College & Breaks ({stats.exempt})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-200 bg-cyan-950/60 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 shadow-inner">
              <Clock size={14} className="text-cyan-400" />
              <span>Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Timetable Entries List */}
          {entries.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-dashed border-2 border-slate-700 bg-slate-900/50">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center shadow-md">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    No timetable slots for {formatDay(selectedDate)}, {formatDate(selectedDate)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-medium">
                    {currentHolidayMode === 'holiday-study'
                      ? 'Marked as a Holiday Study Day. Create your own custom holiday schedule from scratch, or load our ready-made morning study routine.'
                      : currentHolidayMode === 'holiday-no-study'
                      ? 'Marked as a Rest Day / Day Off. Create your own personal tasks or load our relaxed holiday routine.'
                      : 'Create your own personalized daily schedule from scratch, or load our ready-made college & study routine.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleOpenAddSlot}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={16} /> Build Custom Timetable
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadReadyMade}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-cyan-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 hover:border-cyan-400 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles size={16} className="text-cyan-400" /> Load Ready-made Schedule
                  </button>
                </div>
              </div>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <EmptyState
              icon={<Clock size={48} />}
              title="No slots match this filter"
              description={`No timetable slots found under the '${statusFilter}' filter.`}
              action={
                <div className="flex gap-2">
                  <Button onClick={() => setStatusFilter('all')} size="sm" variant="secondary" className="text-white font-bold bg-slate-800 border-slate-600">Clear Filter</Button>
                  <Button onClick={handleOpenAddSlot} size="sm" className="text-white font-bold bg-blue-600">Add Time Slot</Button>
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

                const catStyle = CAT_STYLE[entry.category] || {
                  border: 'border-l-slate-400',
                  bg: 'bg-gradient-to-r from-slate-900/90 via-[#0d1424] to-[#070b16]',
                  badgeBg: 'bg-slate-800',
                  badgeText: 'text-slate-300',
                  badgeBorder: 'border-slate-700',
                };

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'relative group rounded-2xl border transition-all duration-300 p-4 sm:p-5 border-l-[6px] shadow-lg',
                      catStyle.border,
                      catStyle.bg,
                      isInProgress
                        ? 'border-cyan-400/80 ring-2 ring-cyan-400/50 shadow-cyan-950/60 bg-gradient-to-r from-cyan-950/40 via-[#0e1930] to-[#070b16]'
                        : isMissed
                        ? 'border-rose-500/80 border-l-rose-500 bg-gradient-to-r from-rose-950/25 via-[#0e1322] to-[#070a14]'
                        : isCompleted
                        ? 'border-emerald-500/70 border-l-emerald-500 bg-gradient-to-r from-emerald-950/25 via-[#0e1422] to-[#070a14]'
                        : isCollegeBlock
                        ? 'border-blue-500/70 border-l-blue-500 bg-gradient-to-r from-blue-950/30 via-[#0d1424] to-[#070a14]'
                        : 'border-slate-800/90 hover:border-slate-700'
                    )}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      {/* Left: Checkbox / Icon + Digital Chronometer + Activity details */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* Status Checkbox or Institutional Routine Icon */}
                        <div className="pt-0.5 sm:pt-0 shrink-0">
                          {isCollegeBlock ? (
                            <div
                              title="College Hours (6:00 AM – 2:00 PM) · Fixed Institutional Routine"
                              className="w-7 h-7 rounded-xl border border-blue-400/50 bg-blue-950/70 text-blue-300 flex items-center justify-center shrink-0 shadow-inner"
                            >
                              <GraduationCap size={15} />
                            </div>
                          ) : !hasTaskCheckbox ? (
                            <div
                              title={entry.activity}
                              className="w-7 h-7 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 flex items-center justify-center shrink-0 shadow-inner"
                            >
                              {entry.activity.toLowerCase().includes('lunch') ? (
                                <Utensils size={14} className="text-amber-400" />
                              ) : entry.activity.toLowerCase().includes('sleep') ? (
                                <BedDouble size={14} className="text-indigo-400" />
                              ) : dailySettings?.isNoStudyDay ? (
                                <Palmtree size={14} className="text-emerald-400" />
                              ) : (
                                <Coffee size={14} className="text-cyan-400" />
                              )}
                            </div>
                          ) : isMissed ? (
                            <button
                              type="button"
                              disabled
                              title="Time has expired for this study task. It is permanently locked."
                              className="w-7 h-7 rounded-xl border-2 border-rose-500/50 bg-rose-950/60 text-rose-300 flex items-center justify-center cursor-not-allowed opacity-90 shadow-inner"
                            >
                              <Lock size={13} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleSlotCheck(entry)}
                              title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                              className={cn(
                                'w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm',
                                isCompleted
                                  ? 'border-emerald-400 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
                                  : isInProgress
                                  ? 'border-cyan-400 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 ring-2 ring-cyan-400/40 shadow-cyan-500/20'
                                  : 'border-slate-600 hover:border-cyan-400 bg-slate-900/90 text-transparent hover:text-slate-400'
                              )}
                            >
                              {isCompleted ? (
                                <Check size={15} strokeWidth={3} />
                              ) : isInProgress ? (
                                <Circle size={10} className="fill-cyan-400 text-cyan-400" />
                              ) : (
                                <Check size={13} className="opacity-0 group-hover:opacity-40" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* High-visibility Digital Chronometer Box */}
                        <div className={cn(
                          'flex items-center gap-2 shrink-0 px-3.5 py-1.5 rounded-xl border shadow-inner min-w-[150px] sm:min-w-[170px]',
                          isInProgress
                            ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-200'
                            : isMissed
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                            : isCompleted
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                            : 'bg-slate-950/90 border-slate-700/80 text-slate-200'
                        )}>
                          <Clock size={14} className={cn(
                            'shrink-0',
                            isInProgress ? 'text-cyan-400 animate-pulse' : 'text-slate-400'
                          )} />
                          <span className="font-mono text-xs sm:text-sm font-bold tracking-wide">
                            {entry.time}
                          </span>
                        </div>

                        {/* Title and High-Contrast Badges */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <p className={cn(
                              'font-extrabold text-base sm:text-lg tracking-tight',
                              isCompleted && 'line-through text-slate-400 dark:text-slate-400 opacity-75',
                              isMissed && 'text-slate-300 dark:text-slate-200',
                              !isCompleted && !isMissed && 'text-white'
                            )}>
                              {entry.activity}
                            </p>

                            <span className={cn(
                              'px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border',
                              catStyle.badgeBg,
                              catStyle.badgeText,
                              catStyle.badgeBorder
                            )}>
                              {entry.category}
                            </span>

                            {/* College fixed routine indicator */}
                            {isCollegeBlock && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-950/80 text-blue-200 border border-blue-500/50">
                                <GraduationCap size={12} className="text-blue-400" /> College Routine
                              </span>
                            )}

                            {/* Dynamic visual status badge */}
                            {isInProgress && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-cyan-950/90 text-cyan-200 border border-cyan-400/70 shadow-sm shadow-cyan-400/20 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                In Progress
                              </span>
                            )}

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-200 border border-emerald-500/50">
                                <Check size={12} strokeWidth={3} className="text-emerald-400" /> Completed
                              </span>
                            )}

                            {isMissed && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-950/80 text-rose-200 border border-rose-500/50">
                                <Lock size={11} className="text-rose-400" /> Missed · Locked
                              </span>
                            )}

                            {entry.isHoliday && !dailySettings?.isNoStudyDay && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-200 border border-emerald-500/50">
                                <Laptop size={11} className="text-emerald-400" /> Holiday Study Session
                              </span>
                            )}

                            {dailySettings?.isNoStudyDay && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-950/80 text-indigo-200 border border-indigo-500/50">
                                <Palmtree size={11} className="text-indigo-400" /> Day Off Rest
                              </span>
                            )}

                            {entry.isBlocked && !isCollegeBlock && !entry.isHoliday && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-950/80 text-indigo-200 border border-indigo-500/50">
                                <Coffee size={11} className="text-indigo-400" /> Rest Break
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Manage Slot and Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                        {/* Manage Slot Button - High Contrast & Crisp Text */}
                        <button
                          type="button"
                          onClick={() => setManageEntry(entry)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 hover:border-cyan-400 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                        >
                          <Sliders size={13} className="text-cyan-400 shrink-0" />
                          <span className="text-white tracking-wide">Manage Slot</span>
                        </button>

                        <div className="h-5 w-px bg-slate-700/80 mx-0.5" />

                        {/* Edit Button */}
                        <button
                          type="button"
                          title="Edit slot details"
                          onClick={() => handleOpenEditSlot(entry)}
                          className="p-2 text-slate-200 hover:text-cyan-300 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          title="Delete slot"
                          onClick={async () => {
                            if (confirm(`Remove "${entry.activity}" from today's timetable?`)) {
                              await deleteTimetableEntry(entry.id);
                            }
                          }}
                          className="p-2 text-slate-200 hover:text-red-400 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Standalone Tasks Section */}
          {tasks.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ListChecks size={18} className="text-cyan-400" />
                Additional Scheduled Tasks
              </h3>
              <div className="space-y-2.5">
                {tasks.map(task => (
                  <div key={task.id} className="p-3.5 rounded-xl border border-slate-800 bg-gradient-to-r from-blue-950/20 via-[#0c1322] to-[#070b16] border-l-[5px] border-l-blue-500 shadow-md">
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
                            'text-sm font-bold truncate',
                            task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                          )}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                            <span className="capitalize font-semibold text-cyan-300">{task.category}</span>
                            {task.description && <span>· {task.description}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-extrabold', priorityColor(task.priority))}>
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
                          className="p-1.5 text-slate-300 hover:text-red-400 bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
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
              <p className="mt-1 text-slate-200 font-medium leading-relaxed">
                You are switching today back to a Normal Day after 2:00 PM.
                College hours (6:00 AM – 2:00 PM) will remain recorded as normal institutional routine, while 3:00 PM – 4:00 PM College Academics will maintain its active status.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSwitchConfirmOpen(false)} className="text-white font-bold bg-slate-800 border-slate-600">Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSwitch} className="text-white font-bold bg-blue-600 hover:bg-blue-500 shadow-md">Confirm Switch to Normal Day</Button>
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
          // Re-sync current date to restore slots
          await repairAndSyncTimetable(selectedDate);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0c1426] border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/70 p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Calendar size={32} />
        </div>

        <div>
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">
            Daily Routine Plan · {formatDate(date)}
          </span>
          <h2 className="text-2xl font-black text-white mt-1 tracking-tight">
            What is your schedule for today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto font-medium leading-relaxed">
            Select your schedule mode. DevPilot keeps your schedule clean with zero pre-filled clutter — you can build your custom routine from scratch, or load our ready-made template anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* 1. NORMAL COLLEGE DAY */}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onSelect('normal');
              setLoading(false);
            }}
            className="flex flex-col p-4 rounded-2xl border-2 border-blue-500/40 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-900/50 text-left transition-all cursor-pointer group shadow-lg shadow-blue-950/40 active:scale-95"
          >
            <GraduationCap size={24} className="text-blue-400 group-hover:scale-110 transition-transform mb-2.5" />
            <span className="text-sm font-black text-blue-300">
              Normal College Day
            </span>
            <span className="text-xs text-slate-200 font-medium mt-1.5 leading-relaxed">
              Standard weekday. 6 AM – 2 PM College block locked, revision & study afternoon.
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
            className="flex flex-col p-4 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 text-left transition-all cursor-pointer group shadow-lg shadow-emerald-950/40 active:scale-95"
          >
            <Laptop size={24} className="text-emerald-400 group-hover:scale-110 transition-transform mb-2.5" />
            <span className="text-sm font-black text-emerald-300">
              Holiday (Study Plan)
            </span>
            <span className="text-xs text-slate-200 font-medium mt-1.5 leading-relaxed">
              Self-study day. Focused study sessions across Python, DSA, Web Dev & Academics.
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
            className="flex flex-col p-4 rounded-2xl border-2 border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/50 text-left transition-all cursor-pointer group shadow-lg shadow-indigo-950/40 active:scale-95"
          >
            <Palmtree size={24} className="text-indigo-400 group-hover:scale-110 transition-transform mb-2.5" />
            <span className="text-sm font-black text-indigo-300">
              No Study (Day Off)
            </span>
            <span className="text-xs text-slate-200 font-medium mt-1.5 leading-relaxed">
              Full rest day. Excused from weekly completion metrics to preserve your streak.
            </span>
          </button>
        </div>

        <p className="text-xs text-cyan-200 font-medium bg-cyan-950/60 border border-cyan-500/40 rounded-xl py-2.5 px-3">
          💡 You will start with a clean schedule to add your own slots. Click "Load Ready-made Schedule" if you prefer our curated template.
        </p>
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
        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700">
          <p className="font-black text-white text-sm">{entry.activity}</p>
          <p className="text-xs text-slate-300 font-medium mt-1">
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
                <p className="text-slate-200 font-medium mt-1">
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
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleExecuteRemoval('day')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-700/80 hover:border-cyan-400 bg-slate-900/90 hover:bg-slate-800 transition-all text-left cursor-pointer active:scale-98 group"
            >
              <div>
                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">1. Remove for Today Only</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Disappears only on {formatDate(selectedDate)}. Automatically returns tomorrow.
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('week')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-700/80 hover:border-cyan-400 bg-slate-900/90 hover:bg-slate-800 transition-all text-left cursor-pointer active:scale-98 group"
            >
              <div>
                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">2. Remove for the Entire Week</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Removes from {weekStart} to {weekEnd}. Automatically returns next Monday.
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('month')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-700/80 hover:border-cyan-400 bg-slate-900/90 hover:bg-slate-800 transition-all text-left cursor-pointer active:scale-98 group"
            >
              <div>
                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">3. Remove for the Entire Month</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Removes for all of {monthName}. Automatically returns next month.
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmType('permanent')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-950/30 hover:bg-rose-900/50 transition-all text-left cursor-pointer text-rose-300 hover:text-white active:scale-98 group"
            >
              <div>
                <p className="font-bold text-rose-300 group-hover:text-rose-200 transition-colors">4. Remove Permanently</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Removes this recurring slot indefinitely until manually re-added.
                </p>
              </div>
              <Trash2 size={18} className="text-rose-400 group-hover:scale-110 transition-transform" />
            </button>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <Button variant="secondary" size="sm" onClick={onEdit} className="text-white hover:text-cyan-300 font-bold bg-slate-800 border-slate-600">
                <Edit2 size={13} className="text-cyan-400" /> Edit Slot Details
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose} className="text-white font-bold bg-slate-800 border-slate-600">
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
        <p className="text-slate-300 font-medium leading-relaxed">
          The following timetable slots have been temporarily or permanently removed. You can restore any slot with one click.
        </p>

        {exceptions.length === 0 ? (
          <p className="text-center py-6 text-slate-300 font-medium">No active exceptions found.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {exceptions.map(ex => (
              <div
                key={ex.id}
                className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">
                      {ex.slotId.replace('slot-', '')}
                    </span>
                    <Badge variant={ex.type === 'permanent' ? 'danger' : 'warning'}>
                      {ex.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Range: {ex.startDate} to {ex.endDate} · {ex.reason}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => onRestore(ex.id)}
                  className="shrink-0 text-white font-bold bg-slate-800 border-slate-600 hover:border-cyan-400"
                >
                  <RotateCcw size={12} className="text-cyan-400" /> Restore Slot
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800/80">
          <Button variant="secondary" onClick={onClose} className="text-white font-bold bg-slate-800 border-slate-600">Close</Button>
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
        <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-white">
                Automatically treat Sundays as Day Off
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
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

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button variant="secondary" onClick={onClose} className="text-white font-bold bg-slate-800 border-slate-600">Cancel</Button>
          <Button onClick={() => onAddHoliday(date, mode, reason)} className="text-white font-bold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md">Save Schedule Plan</Button>
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
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
          <label className="flex items-center gap-2.5 cursor-pointer font-bold text-white">
            <input
              type="checkbox"
              checked={isBreak}
              onChange={e => setIsBreak(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Mark as Free Time / Rest Break</span>
          </label>
          <p className="text-xs text-slate-300 font-medium mt-1 pl-6">
            Tagging a slot as free time or break excludes it from penalizing daily completion percentages.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
          <Button variant="secondary" onClick={onClose} className="text-white font-bold bg-slate-800 border-slate-600">Cancel</Button>
          <Button onClick={handleSave} className="text-white font-bold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md">{entry ? 'Save Changes' : 'Add Time Slot'}</Button>
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
    initTimetableForDate(date);
  }, [date]);

  const stats = useMemo(() => {
    return calculateTimetableStats(entries, dailySettings?.isNoStudyDay);
  }, [entries, dailySettings]);

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'text-center cursor-pointer transition-all p-3.5',
        isSelected && 'ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20',
        today && !isSelected && 'border-cyan-400/50',
      )}
    >
      <p className="text-xs text-slate-300 font-bold">{formatDay(date)}</p>
      <p className={cn('text-sm font-black mt-0.5', today ? 'text-cyan-300' : 'text-white')}>
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
        <p className="text-xs mt-1 text-slate-300 font-medium">
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
          <Button variant="secondary" onClick={() => { reset(); onClose(); }} className="text-white font-bold bg-slate-800 border-slate-600">Cancel</Button>
          <Button onClick={handleSubmit} className="text-white font-bold bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md">Add Task</Button>
        </div>
      </div>
    </Modal>
  );
}
