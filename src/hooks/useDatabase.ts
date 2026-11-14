// ============================================================================
// DevPilot - Database hooks for data access
// ============================================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '../store/db';
import { todayStr, weekRange, percentage, generateId } from '../utils/helpers';
import { ALL_TRACKS } from '../data/roadmapData';
import type {
  LearningTopic, TimetableEntry, Task, DSAProblem, Project,
  Subject, Goal, StudyLog, WeeklySlot, ScheduleException, DailySettings, ExceptionType
} from '../types';

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
  await db.topics.update(id, {
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : undefined
  });
}

export async function updateTopicNotes(id: string, notes: string) {
  await db.topics.update(id, { notes });
}

// ── Timetable operations ──
export function useTodayTimetable() {
  const today = todayStr();
  return useLiveQuery(() => db.timetable.where('date').equals(today).toArray(), [today]) ?? [];
}

export function useTimetableByDate(date: string) {
  return useLiveQuery(() => db.timetable.where('date').equals(date).toArray(), [date]) ?? [];
}

export function useDailySettings(date: string) {
  return useLiveQuery(() => db.dailySettings.get(date), [date]);
}

export async function setDailySettings(settings: DailySettings) {
  await db.dailySettings.put(settings);
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
  return item;
}

export async function deleteScheduleException(id: string) {
  await db.scheduleExceptions.delete(id);
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

export async function applyHolidayToDate(date: string, isHoliday: boolean, reason?: string) {
  await db.dailySettings.put({
    date,
    isHoliday,
    holidayReason: reason,
    answeredPrompt: true,
    updatedAt: new Date().toISOString(),
  });

  // Find college slot for this date
  const entries = await db.timetable.where('date').equals(date).toArray();
  const collegeEntry = entries.find(e =>
    e.slotId === 'slot-college' || e.category === 'college' || e.activity.toLowerCase().includes('college')
  );

  if (collegeEntry) {
    if (isHoliday) {
      await db.timetable.update(collegeEntry.id, {
        activity: 'Free Time (Holiday)',
        category: 'personal',
        isHoliday: true,
        isBlocked: true,
        isExempt: true,
        status: 'exempt',
        locked: false,
        statusUpdatedAt: new Date().toISOString(),
      });
    } else {
      const now = new Date();
      const isToday = date === todayStr();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const hasEnded = isToday && currentHour >= collegeEntry.endHour;

      await db.timetable.update(collegeEntry.id, {
        activity: 'College',
        category: 'college',
        isHoliday: false,
        isBlocked: false,
        isExempt: false,
        status: hasEnded ? 'missed' : 'pending',
        locked: hasEnded,
        statusUpdatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function lockExpiredSlotsForDate(date: string) {
  const now = new Date();
  const today = todayStr();
  const isToday = date === today;
  const isPast = date < today;

  if (!isToday && !isPast) return;

  const currentHour = now.getHours() + now.getMinutes() / 60;
  const entries = await db.timetable.where('date').equals(date).toArray();

  for (const entry of entries) {
    if (entry.isExempt || entry.isHoliday || entry.isBlocked || entry.category === 'personal') {
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

export function calculateTimetableStats(entries: TimetableEntry[]) {
  const required = entries.filter(e => !e.isExempt && !e.isHoliday && !e.isBlocked && e.category !== 'personal');
  const completed = required.filter(e => e.status === 'completed').length;
  const missed = required.filter(e => e.status === 'missed').length;
  const inProgress = required.filter(e => e.status === 'in-progress').length;
  const upcoming = required.filter(e => e.status === 'upcoming' || e.status === 'pending').length;
  const exempt = entries.filter(e => e.isExempt || e.isHoliday || e.isBlocked || e.category === 'personal').length;
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
  };
}

export async function initTimetableForDate(date: string, entries: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  const existingCount = await db.timetable.where('date').equals(date).count();

  // Retrieve active schedule exceptions
  const exceptions = await db.scheduleExceptions.toArray();
  const activeExceptions = exceptions.filter(ex => ex.startDate <= date && date <= ex.endDate);
  const excludedSlotIds = new Set(activeExceptions.map(ex => ex.slotId));

  // Retrieve holiday settings
  const ds = await db.dailySettings.get(date);
  const isHoliday = ds?.isHoliday ?? false;

  if (existingCount === 0) {
    const allowedEntries = entries.filter(e => !excludedSlotIds.has(e.slotId || ''));

    const items: TimetableEntry[] = allowedEntries.map(e => {
      const isCollege = e.slotId === 'slot-college' || e.category === 'college';
      if (isHoliday && isCollege) {
        return {
          ...e,
          id: generateId(),
          date,
          activity: 'Free Time (Holiday)',
          category: 'personal',
          isHoliday: true,
          isBlocked: true,
          isExempt: true,
          status: 'exempt' as const,
        };
      }
      return {
        ...e,
        id: generateId(),
        date,
        status: 'pending' as const,
      };
    });

    if (items.length > 0) {
      await db.timetable.bulkAdd(items);
    }
  }

  // Automatically lock any expired slots
  await lockExpiredSlotsForDate(date);
}

export async function updateTimetableStatus(id: string, status: TimetableEntry['status']) {
  // If attempting to complete, store timestamp
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;
  await db.timetable.update(id, {
    status,
    completedAt,
    statusUpdatedAt: new Date().toISOString(),
  });
}

export async function updateTimetableEntry(id: string, data: Partial<TimetableEntry>) {
  await db.timetable.update(id, data);
}

export async function addTimetableEntry(entry: Omit<TimetableEntry, 'id'>) {
  await db.timetable.add({ ...entry, id: generateId() });
}

export async function deleteTimetableEntry(id: string) {
  await db.timetable.delete(id);
}

export async function resetTimetableForDate(date: string, entries: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  await db.timetable.where('date').equals(date).delete();

  // Retrieve active exceptions
  const exceptions = await db.scheduleExceptions.toArray();
  const activeExceptions = exceptions.filter(ex => ex.startDate <= date && date <= ex.endDate);
  const excludedSlotIds = new Set(activeExceptions.map(ex => ex.slotId));

  // Check holiday
  const ds = await db.dailySettings.get(date);
  const isHoliday = ds?.isHoliday ?? false;

  const allowedEntries = entries.filter(e => !excludedSlotIds.has(e.slotId || ''));

  const items: TimetableEntry[] = allowedEntries.map(e => {
    const isCollege = e.slotId === 'slot-college' || e.category === 'college';
    if (isHoliday && isCollege) {
      return {
        ...e,
        id: generateId(),
        date,
        activity: 'Free Time (Holiday)',
        category: 'personal',
        isHoliday: true,
        isBlocked: true,
        isExempt: true,
        status: 'exempt' as const,
      };
    }
    return {
      ...e,
      id: generateId(),
      date,
      status: 'pending' as const,
    };
  });

  if (items.length > 0) {
    await db.timetable.bulkAdd(items);
  }

  await lockExpiredSlotsForDate(date);
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
  await db.tasks.add({ ...task, id: generateId(), createdAt: new Date().toISOString() });
}

export async function updateTask(id: string, data: Partial<Task>) {
  await db.tasks.update(id, data);
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id);
}

// ── DSA Problems ──
export function useDSAProblems() {
  return useLiveQuery(() => db.dsaProblems.toArray()) ?? [];
}

export async function addDSAProblem(problem: Omit<DSAProblem, 'id'>) {
  await db.dsaProblems.add({ ...problem, id: generateId() });
}

export async function updateDSAProblem(id: string, data: Partial<DSAProblem>) {
  await db.dsaProblems.update(id, data);
}

export async function deleteDSAProblem(id: string) {
  await db.dsaProblems.delete(id);
}

// ── Projects ──
export function useProjects() {
  return useLiveQuery(() => db.projects.toArray()) ?? [];
}

export async function addProject(project: Omit<Project, 'id'>) {
  await db.projects.add({ ...project, id: generateId() });
}

export async function updateProject(id: string, data: Partial<Project>) {
  await db.projects.update(id, data);
}

export async function deleteProject(id: string) {
  await db.projects.delete(id);
}

// ── Subjects ──
export function useSubjects() {
  return useLiveQuery(() => db.subjects.toArray()) ?? [];
}

export async function addSubject(subject: Omit<Subject, 'id'>) {
  await db.subjects.add({ ...subject, id: generateId() });
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  await db.subjects.update(id, data);
}

export async function deleteSubject(id: string) {
  await db.subjects.delete(id);
}

// ── Goals ──
export function useGoals() {
  return useLiveQuery(() => db.goals.toArray()) ?? [];
}

export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>) {
  await db.goals.add({ ...goal, id: generateId(), createdAt: new Date().toISOString() });
}

export async function updateGoal(id: string, data: Partial<Goal>) {
  await db.goals.update(id, data);
}

export async function deleteGoal(id: string) {
  await db.goals.delete(id);
}

// ── Study Logs ──
export function useStudyLogs() {
  return useLiveQuery(() => db.studyLogs.toArray()) ?? [];
}

export async function addStudyLog(log: Omit<StudyLog, 'id'>) {
  await db.studyLogs.add({ ...log, id: generateId() });
}

// ── Weekly Reviews ──
export function useWeeklyReviews() {
  return useLiveQuery(() => db.weeklyReviews.toArray()) ?? [];
}

// ── Weekly Slots ──
export function useWeeklySlots() {
  return useLiveQuery(() => db.weeklySlots.toArray()) ?? [];
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
