// ============================================================================
// DevPilot - Database hooks for data access
// ============================================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '../store/db';
import { todayStr, weekRange, percentage, generateId } from '../utils/helpers';
import { ALL_TRACKS, DEFAULT_TIMETABLE, HOLIDAY_MORNING_SLOTS } from '../data/roadmapData';
import { syncEngine } from '../services/syncEngine';
import type {
  LearningTopic, TimetableEntry, Task, DSAProblem, Project,
  Subject, Goal, StudyLog, WeeklySlot, ScheduleException, DailySettings,
  ExceptionType, HolidayMode, WeeklyReview
} from '../types';

export function isTaskSlotWithCheckbox(entry: TimetableEntry): boolean {
  if (entry.slotId === 'slot-college' || entry.category === 'college') {
    return false;
  }
  if (entry.isBlocked || entry.category === 'personal') {
    return false;
  }
  return true;
}

// ── Topic operations ──
export function useTopics(trackId?: string) {
  return useLiveQuery(() =>
    trackId
      ? db.topics.where('trackId').equals(trackId).sortBy('order')
      : db.topics.orderBy('order').toArray()
  , [trackId]) ?? [];
}

export function useAllTopics() {
  return useLiveQuery(() => db.topics.toArray()) ?? [];
}

export async function initTopicsIfEmpty() {
  const count = await db.topics.count();
  if (count === 0) {
    const allTopics = ALL_TRACKS.flatMap(track => track.topics);
    await db.topics.bulkAdd(allTopics);
  }
}

export async function updateTopicStatus(id: string, status: LearningTopic['status']) {
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  await db.topics.update(id, {
    status,
    completedAt,
  });
  await syncEngine.queueChange('learning_progress', { id, status, completed_at: completedAt });
}

export async function updateTopicNotes(id: string, notes: string) {
  await db.topics.update(id, { notes });
  await syncEngine.queueChange('learning_progress', { id, notes });
}

// ── Timetable operations ──
export function deduplicateEntriesInMemory(entries: TimetableEntry[]): TimetableEntry[] {
  if (entries.length <= 1) return entries;
  const seen = new Set<string>();
  const result: TimetableEntry[] = [];
  for (const e of entries) {
    const key = e.slotId
      ? `slot:${e.slotId}`
      : `time:${e.startHour}-${e.endHour}-${(e.activity || '').trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(e);
    }
  }
  return result;
}

export function useTodayTimetable() {
  const today = todayStr();
  const raw = useLiveQuery(() => db.timetable.where('date').equals(today).toArray(), [today]) ?? [];
  return deduplicateEntriesInMemory(raw);
}

export function useTimetableByDate(date: string) {
  const raw = useLiveQuery(() => db.timetable.where('date').equals(date).toArray(), [date]) ?? [];
  return deduplicateEntriesInMemory(raw);
}

export function useDailySettings(date: string) {
  return useLiveQuery(() => db.dailySettings.get(date), [date]);
}

export async function setDailySettings(settings: DailySettings) {
  await db.dailySettings.put(settings);
  await syncEngine.queueChange('daily_settings', settings);
}

export function useScheduleExceptions() {
  return useLiveQuery(() => db.scheduleExceptions.toArray()) ?? [];
}

export async function addScheduleException(exception: Omit<ScheduleException, 'id' | 'createdAt'>) {
  const id = generateId();
  const item: ScheduleException = {
    ...exception,
    id,
    createdAt: new Date().toISOString(),
  };
  await db.scheduleExceptions.add(item);
  await syncEngine.queueChange('schedule_exceptions', item);
  return item;
}

export async function deleteScheduleException(id: string) {
  await db.scheduleExceptions.delete(id);
  await syncEngine.queueChange('schedule_exceptions', { id }, 'delete');
}

export async function removeSlotWithException(
  slotId: string,
  type: ExceptionType,
  selectedDate: string,
  reason?: string
) {
  let startDate = selectedDate;
  let endDate = selectedDate;

  if (type === 'week') {
    startDate = format(startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    endDate = format(endOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  } else if (type === 'month') {
    startDate = format(startOfMonth(parseISO(selectedDate)), 'yyyy-MM-dd');
    endDate = format(endOfMonth(parseISO(selectedDate)), 'yyyy-MM-dd');
  } else if (type === 'permanent') {
    startDate = selectedDate;
    endDate = '2099-12-31';
  }

  // Record schedule exception
  await addScheduleException({
    slotId,
    type,
    startDate,
    endDate,
    reason: reason || `Removed for ${type}`,
  });

  // Remove existing entries within the exception window
  const entries = await db.timetable
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();

  const matchingIds = entries
    .filter(e => (e.slotId || e.id) === slotId)
    .map(e => e.id);

  if (matchingIds.length > 0) {
    await db.timetable.bulkDelete(matchingIds);
  }
}

/**
 * Deduplicate any duplicate timetable records for a specific date.
 * Finds entries sharing the same slotId or identical (startHour, endHour, activity),
 * keeps the best entry (completed if one is completed), and deletes the duplicates.
 */
export async function deduplicateTimetableForDate(date: string): Promise<number> {
  const entries = await db.timetable.where('date').equals(date).toArray();
  if (entries.length <= 1) return 0;

  const seenMap = new Map<string, TimetableEntry>();
  const duplicateIds: string[] = [];

  for (const entry of entries) {
    const key = entry.slotId
      ? `slot:${entry.slotId}`
      : `time:${entry.startHour}-${entry.endHour}-${(entry.activity || '').trim().toLowerCase()}`;

    if (seenMap.has(key)) {
      const existing = seenMap.get(key)!;
      // If the duplicate entry is completed while the existing is pending, keep the completed one
      if (entry.status === 'completed' && existing.status !== 'completed') {
        duplicateIds.push(existing.id);
        seenMap.set(key, entry);
      } else {
        duplicateIds.push(entry.id);
      }
    } else {
      seenMap.set(key, entry);
    }
  }

  if (duplicateIds.length > 0) {
    await db.timetable.bulkDelete(duplicateIds);
    for (const id of duplicateIds) {
      await syncEngine.queueChange('timetable', { id }, 'delete');
    }
    return duplicateIds.length;
  }
  return 0;
}

const syncingDates = new Set<string>();

/**
 * Universal auto-repair and routine synchronization engine.
 * Ensures that:
 * 1. Automatically cleans up duplicate records for the date.
 * 2. If the user has NOT created or chosen a timetable for this date, does NOT force-seed ready-made slots.
 * 3. Only locks expired slots and synchronizes holiday attributes for existing slots.
 */
export async function repairAndSyncTimetable(date: string) {
  if (syncingDates.has(date)) return;
  syncingDates.add(date);

  try {
    // 1. Remove any duplicated slots in the database
    await deduplicateTimetableForDate(date);

    const existingEntries = await db.timetable.where('date').equals(date).toArray();
    // If table is completely empty for this date, do NOT force-seed! User will build their own or choose to load.
    if (existingEntries.length === 0) {
      return;
    }

    const ds = await db.dailySettings.get(date);
    const holidayMode: HolidayMode = ds?.holidayMode || (ds?.isHoliday ? (ds?.isNoStudyDay ? 'holiday-no-study' : 'holiday-study') : 'normal');

    // If day off / no-study, mark existing slots as exempt
    if (holidayMode === 'holiday-no-study') {
      for (const e of existingEntries) {
        if (!e.isExempt || !e.isBlocked || e.status !== 'exempt') {
          await db.timetable.update(e.id, {
            isExempt: true,
            isBlocked: true,
            status: 'exempt',
          });
        }
      }
    }

    // Lock expired slots for today or past dates
    await lockExpiredSlotsForDate(date);
  } finally {
    syncingDates.delete(date);
  }
}

/**
 * Explicitly load the curated ready-made timetable for a date on user demand.
 * Supports both Normal College Day and Holiday Day cases!
 */
export async function loadReadyMadeTimetable(date: string) {
  const ds = await db.dailySettings.get(date);
  const holidayMode: HolidayMode = ds?.holidayMode || (ds?.isHoliday ? (ds?.isNoStudyDay ? 'holiday-no-study' : 'holiday-study') : 'normal');

  // Active schedule exceptions
  const exceptions = await db.scheduleExceptions.toArray();
  const activeExceptions = exceptions.filter(ex => ex.startDate <= date && date <= ex.endDate);
  const excludedSlotIds = new Set(activeExceptions.map(ex => ex.slotId));

  // Clear existing slots for this date first to ensure zero duplicates
  await db.timetable.where('date').equals(date).delete();

  if (holidayMode === 'holiday-study') {
    // Holiday study routine: 9 gapless morning study slots + afternoon study
    const morning = HOLIDAY_MORNING_SLOTS
      .filter(s => !excludedSlotIds.has(s.slotId || ''))
      .map(s => ({
        ...s,
        id: generateId(),
        date,
        status: 'pending' as const,
      }));
    const afternoon = DEFAULT_TIMETABLE
      .filter(s => s.slotId !== 'slot-college' && s.slotId !== 'slot-wakeup' && !excludedSlotIds.has(s.slotId || ''))
      .map(s => ({
        ...s,
        id: generateId(),
        date,
        activity: s.slotId === 'slot-academics' ? 'College Academics (Revision & Assignments)' : s.activity,
        category: s.slotId === 'slot-academics' ? 'academics' : s.category,
        isBlocked: s.slotId === 'slot-academics' ? false : s.isBlocked,
        status: 'pending' as const,
      }));
    await db.timetable.bulkAdd([...morning, ...afternoon]);
  } else if (holidayMode === 'holiday-no-study') {
    // Holiday rest routine: day off & recovery
    const dayOffMorning: TimetableEntry[] = [
      { slotId: 'hslot-wakeup', time: '6:00 – 6:15 AM', startHour: 6, endHour: 6.25, activity: 'Wake up & stretch', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-workout', time: '6:15 – 7:00 AM', startHour: 6.25, endHour: 7, activity: 'Morning walk & light exercise', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-breakfast', time: '7:00 – 8:00 AM', startHour: 7, endHour: 8, activity: 'Freshen up & breakfast', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-dayoff-am', time: '8:00 AM – 2:00 PM', startHour: 8, endHour: 14, activity: 'Personal Day Off & Free Time', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
    ];
    const afternoon = DEFAULT_TIMETABLE
      .filter(s => s.slotId !== 'slot-college' && s.slotId !== 'slot-wakeup' && !excludedSlotIds.has(s.slotId || ''))
      .map(s => ({
        ...s,
        id: generateId(),
        date,
        isBlocked: true,
        isExempt: true,
        status: 'exempt' as const,
      }));
    await db.timetable.bulkAdd([...dayOffMorning, ...afternoon]);
  } else {
    // Normal day: College 6 AM - 2 PM + Python + DSA + WebDev + Academics
    const normal = DEFAULT_TIMETABLE
      .filter(s => !excludedSlotIds.has(s.slotId || ''))
      .map(s => ({
        ...s,
        id: generateId(),
        date,
        status: 'pending' as const,
      }));
    await db.timetable.bulkAdd(normal);
  }

  await lockExpiredSlotsForDate(date);
}

/**
 * Wipe all slots for a date so user can start with a clean slate.
 */
export async function clearTimetableForDate(date: string) {
  await db.timetable.where('date').equals(date).delete();
  await syncEngine.queueChange('timetable', { date }, 'delete');
}

export async function applyHolidayToDate(date: string, mode: HolidayMode, reason?: string) {
  const isHoliday = mode !== 'normal';
  const isNoStudyDay = mode === 'holiday-no-study';

  await db.dailySettings.put({
    date,
    isHoliday,
    holidayMode: mode,
    isNoStudyDay,
    holidayReason: reason,
    answeredPrompt: true,
    updatedAt: new Date().toISOString(),
  });

  await repairAndSyncTimetable(date);
}

export async function lockExpiredSlotsForDate(date: string) {
  const now = new Date();
  const today = todayStr();
  const isToday = date === today;
  const isPast = date < today;

  if (!isToday && !isPast) return;

  const ds = await db.dailySettings.get(date);
  if (ds?.isNoStudyDay) return; // Excused no-study day

  const currentHour = now.getHours() + now.getMinutes() / 60;
  const entries = await db.timetable.where('date').equals(date).toArray();

  for (const entry of entries) {
    // Only lock tasks that have a study checkbox (3-4 PM Academics, Python, C++, WebDev, Planning, etc.)
    if (!isTaskSlotWithCheckbox(entry)) {
      continue;
    }
    if (entry.status === 'completed') {
      continue;
    }

    const isExpired = isPast || (isToday && currentHour >= entry.endHour);

    if (isExpired && entry.status !== 'missed') {
      await db.timetable.update(entry.id, {
        status: 'missed',
        locked: true,
        statusUpdatedAt: new Date().toISOString(),
      });
    }
  }
}

export function calculateTimetableStats(entries: TimetableEntry[], isNoStudyDay?: boolean) {
  if (isNoStudyDay) {
    return {
      totalRequired: 0,
      completed: 0,
      missed: 0,
      inProgress: 0,
      upcoming: 0,
      exempt: entries.length,
      completionPct: 100,
      isNoStudyDay: true,
    };
  }

  // Required slots: All slots that have a study checkbox (3-4 PM College Academics IS included, College 6 AM - 2 PM is excluded)
  const required = entries.filter(e => !e.isExempt && isTaskSlotWithCheckbox(e));

  const completed = required.filter(e => e.status === 'completed').length;
  const missed = required.filter(e => e.status === 'missed').length;
  const inProgress = required.filter(e => e.status === 'in-progress').length;
  const upcoming = required.filter(e => e.status === 'upcoming' || e.status === 'pending').length;
  const exempt = entries.filter(e => e.isExempt || !isTaskSlotWithCheckbox(e)).length;
  const totalRequired = required.length;
  const completionPct = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 100;

  return {
    totalRequired,
    completed,
    missed,
    inProgress,
    upcoming,
    exempt,
    completionPct,
    isNoStudyDay: false,
  };
}

export async function initTimetableForDate(date: string, _entries?: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  await deduplicateTimetableForDate(date);
}

export async function updateTimetableStatus(id: string, status: TimetableEntry['status']) {
  // If attempting to complete, store timestamp
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  const statusUpdatedAt = new Date().toISOString();
  await db.timetable.update(id, {
    status,
    completedAt,
    statusUpdatedAt,
  });
  await syncEngine.queueChange('timetable', { id, status, completed_at: completedAt, status_updated_at: statusUpdatedAt });
}

export async function updateTimetableEntry(id: string, data: Partial<TimetableEntry>) {
  await db.timetable.update(id, data);
  await syncEngine.queueChange('timetable', { id, ...data });
}

export async function addTimetableEntry(entry: Omit<TimetableEntry, 'id'>) {
  const id = generateId();
  const item = { ...entry, id };
  await db.timetable.add(item);
  await syncEngine.queueChange('timetable', item);
}

export async function deleteTimetableEntry(id: string) {
  await db.timetable.delete(id);
  await syncEngine.queueChange('timetable', { id }, 'delete');
}

export async function resetTimetableForDate(date: string, _entries?: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  await loadReadyMadeTimetable(date);
}

// ── Task operations ──
export function useTasks(date?: string) {
  return useLiveQuery(() =>
    date
      ? db.tasks.where('date').equals(date).toArray()
      : db.tasks.toArray()
  , [date]) ?? [];
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const item = { ...task, id, createdAt };
  await db.tasks.add(item);
  await syncEngine.queueChange('tasks', item);
}

export async function updateTask(id: string, data: Partial<Task>) {
  await db.tasks.update(id, data);
  await syncEngine.queueChange('tasks', { id, ...data });
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id);
  await syncEngine.queueChange('tasks', { id }, 'delete');
}

// ── DSA Problems ──
export function useDSAProblems() {
  return useLiveQuery(() => db.dsaProblems.toArray()) ?? [];
}

export async function addDSAProblem(problem: Omit<DSAProblem, 'id'>) {
  const id = generateId();
  const item = { ...problem, id };
  await db.dsaProblems.add(item);
  await syncEngine.queueChange('dsa_problems', item);
}

export async function updateDSAProblem(id: string, data: Partial<DSAProblem>) {
  await db.dsaProblems.update(id, data);
  await syncEngine.queueChange('dsa_problems', { id, ...data });
}

export async function deleteDSAProblem(id: string) {
  await db.dsaProblems.delete(id);
  await syncEngine.queueChange('dsa_problems', { id }, 'delete');
}

// ── Projects ──
export function useProjects() {
  return useLiveQuery(() => db.projects.toArray()) ?? [];
}

export async function addProject(project: Omit<Project, 'id'>) {
  const id = generateId();
  const item = { ...project, id };
  await db.projects.add(item);
  await syncEngine.queueChange('projects', item);
}

export async function updateProject(id: string, data: Partial<Project>) {
  await db.projects.update(id, data);
  await syncEngine.queueChange('projects', { id, ...data });
}

export async function deleteProject(id: string) {
  await db.projects.delete(id);
  await syncEngine.queueChange('projects', { id }, 'delete');
}

// ── Subjects ──
export function useSubjects() {
  return useLiveQuery(() => db.subjects.toArray()) ?? [];
}

export async function addSubject(subject: Omit<Subject, 'id'>) {
  const id = generateId();
  const item = { ...subject, id };
  await db.subjects.add(item);
  await syncEngine.queueChange('subjects', item);
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  await db.subjects.update(id, data);
  await syncEngine.queueChange('subjects', { id, ...data });
}

export async function deleteSubject(id: string) {
  await db.subjects.delete(id);
  await syncEngine.queueChange('subjects', { id }, 'delete');
}

// ── Goals ──
export function useGoals() {
  return useLiveQuery(() => db.goals.toArray()) ?? [];
}

export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>) {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const item = { ...goal, id, createdAt };
  await db.goals.add(item);
  await syncEngine.queueChange('goals', item);
}

export async function updateGoal(id: string, data: Partial<Goal>) {
  await db.goals.update(id, data);
  await syncEngine.queueChange('goals', { id, ...data });
}

export async function deleteGoal(id: string) {
  await db.goals.delete(id);
  await syncEngine.queueChange('goals', { id }, 'delete');
}

// ── Study Logs ──
export function useStudyLogs() {
  return useLiveQuery(() => db.studyLogs.toArray()) ?? [];
}

export async function addStudyLog(log: Omit<StudyLog, 'id'>) {
  const id = generateId();
  const item = { ...log, id };
  await db.studyLogs.add(item);
  await syncEngine.queueChange('study_logs', item);
}

// ── Weekly Reviews ──
export function useWeeklyReviews() {
  return useLiveQuery(() => db.weeklyReviews.toArray()) ?? [];
}

export async function addWeeklyReview(review: Omit<WeeklyReview, 'id' | 'createdAt'>) {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const item = { ...review, id, createdAt };
  await db.weeklyReviews.add(item);
  await syncEngine.queueChange('weekly_reviews', item);
}

// ── Weekly Slots ──
export function useWeeklySlots() {
  return useLiveQuery(() => db.weeklySlots.toArray()) ?? [];
}

export async function updateWeeklySlot(id: string, data: Partial<WeeklySlot>) {
  await db.weeklySlots.update(id, data);
  await syncEngine.queueChange('weekly_slots', { id, ...data });
}

// ── Progress Calculation ──
export function useTrackProgress() {
  const topics = useAllTopics();
  
  const tracks = ALL_TRACKS.map(track => {
    const trackTopics = topics.filter(t => t.trackId === track.id);
    const completed = trackTopics.filter(t => t.status === 'completed').length;
    const total = trackTopics.length;
    return {
      id: track.id,
      name: track.name,
      color: track.color,
      completed,
      total,
      percentage: percentage(completed, total),
      nextTopic: trackTopics.find(t => t.status !== 'completed'),
    };
  });

  const totalCompleted = tracks.reduce((sum, t) => sum + t.completed, 0);
  const totalAll = tracks.reduce((sum, t) => sum + t.total, 0);

  return { tracks, overallPercentage: percentage(totalCompleted, totalAll) };
}

// ── Export/Import ──
export async function exportAllData() {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    topics: await db.topics.toArray(),
    timetable: await db.timetable.toArray(),
    tasks: await db.tasks.toArray(),
    dsaProblems: await db.dsaProblems.toArray(),
    projects: await db.projects.toArray(),
    subjects: await db.subjects.toArray(),
    goals: await db.goals.toArray(),
    studyLogs: await db.studyLogs.toArray(),
    weeklyReviews: await db.weeklyReviews.toArray(),
    weeklySlots: await db.weeklySlots.toArray(),
    scheduleExceptions: await db.scheduleExceptions.toArray(),
    dailySettings: await db.dailySettings.toArray(),
    settings: localStorage.getItem('devpilot_settings'),
    profile: localStorage.getItem('devpilot_profile'),
  };
  return data;
}

export async function importAllData(data: any) {
  if (!data?.version) throw new Error('Invalid backup file');
  await db.transaction('rw', [
    db.topics, db.timetable, db.tasks, db.dsaProblems, db.projects,
    db.subjects, db.goals, db.studyLogs, db.weeklyReviews, db.weeklySlots,
    db.scheduleExceptions, db.dailySettings
  ], async () => {
    if (data.topics) { await db.topics.clear(); await db.topics.bulkAdd(data.topics); }
    if (data.timetable) { await db.timetable.clear(); await db.timetable.bulkAdd(data.timetable); }
    if (data.tasks) { await db.tasks.clear(); await db.tasks.bulkAdd(data.tasks); }
    if (data.dsaProblems) { await db.dsaProblems.clear(); await db.dsaProblems.bulkAdd(data.dsaProblems); }
    if (data.projects) { await db.projects.clear(); await db.projects.bulkAdd(data.projects); }
    if (data.subjects) { await db.subjects.clear(); await db.subjects.bulkAdd(data.subjects); }
    if (data.goals) { await db.goals.clear(); await db.goals.bulkAdd(data.goals); }
    if (data.studyLogs) { await db.studyLogs.clear(); await db.studyLogs.bulkAdd(data.studyLogs); }
    if (data.weeklyReviews) { await db.weeklyReviews.clear(); await db.weeklyReviews.bulkAdd(data.weeklyReviews); }
    if (data.weeklySlots) { await db.weeklySlots.clear(); await db.weeklySlots.bulkAdd(data.weeklySlots); }
    if (data.scheduleExceptions) { await db.scheduleExceptions.clear(); await db.scheduleExceptions.bulkAdd(data.scheduleExceptions); }
    if (data.dailySettings) { await db.dailySettings.clear(); await db.dailySettings.bulkAdd(data.dailySettings); }
  });
  if (data.settings) localStorage.setItem('devpilot_settings', data.settings);
  if (data.profile) localStorage.setItem('devpilot_profile', data.profile);
}

export async function clearAllData() {
  await db.topics.clear();
  await db.timetable.clear();
  await db.tasks.clear();
  await db.dsaProblems.clear();
  await db.projects.clear();
  await db.subjects.clear();
  await db.goals.clear();
  await db.studyLogs.clear();
  await db.weeklyReviews.clear();
  await db.weeklySlots.clear();
  await db.scheduleExceptions.clear();
  await db.dailySettings.clear();
  localStorage.removeItem('devpilot_settings');
  localStorage.removeItem('devpilot_profile');
}
