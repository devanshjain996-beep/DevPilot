// ============================================================================
// DevPilot - Database hooks for data access
// ============================================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '../store/db';
import { todayStr, weekRange, percentage, generateId } from '../utils/helpers';
import { ALL_TRACKS, DEFAULT_TIMETABLE, HOLIDAY_MORNING_SLOTS } from '../data/roadmapData';
import type {
  LearningTopic, TimetableEntry, Task, DSAProblem, Project,
  Subject, Goal, StudyLog, WeeklySlot, ScheduleException, DailySettings,
  ExceptionType, HolidayMode
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

  // Re-sync schedule for this date based on the chosen mode
  const existingEntries = await db.timetable.where('date').equals(date).toArray();

  if (mode === 'holiday-study') {
    // 1. On holiday: completely remove 6 AM - 2 PM college slot, 5 AM wakeup, and any old morning slots
    const toDelete = existingEntries
      .filter(e => e.slotId === 'slot-college' || e.slotId === 'slot-wakeup' || e.slotId?.startsWith('hslot-'))
      .map(e => e.id);
    if (toDelete.length > 0) {
      await db.timetable.bulkDelete(toDelete);
    }

    // Insert the 9 gapless holiday morning slots from 6:00 AM to 2:00 PM (Zero Gaps: wake up, workout, breakfast, Python, Web Dev, Break, System Design, College Academics, Review)
    const morningSlots: TimetableEntry[] = HOLIDAY_MORNING_SLOTS.map(s => ({
      ...s,
      id: generateId(),
      date,
      status: 'pending' as const,
    }));
    await db.timetable.bulkAdd(morningSlots);

    // Ensure 3:00 PM – 4:00 PM College Academics and evening study slots are ACTIVE STUDY TASKS WITH CHECKBOXES!
    const remaining = await db.timetable.where('date').equals(date).toArray();
    for (const e of remaining) {
      if (['slot-academics', 'slot-python', 'slot-cpp-dsa', 'slot-webdev', 'slot-planning'].includes(e.slotId || '')) {
        await db.timetable.update(e.id, {
          activity: e.slotId === 'slot-academics' ? 'College Academics (Revision & Assignments)' : e.activity,
          category: e.slotId === 'slot-academics' ? 'academics' : e.category,
          isBlocked: false,
          isExempt: false,
          isHoliday: false,
        });
      }
    }
  } else if (mode === 'holiday-no-study') {
    // 2. Day off / No Study: Excused day with zero checkboxes, cut off from weekly progress
    const toDelete = existingEntries
      .filter(e => e.slotId === 'slot-college' || e.slotId === 'slot-wakeup' || e.slotId?.startsWith('hslot-'))
      .map(e => e.id);
    if (toDelete.length > 0) {
      await db.timetable.bulkDelete(toDelete);
    }

    const dayOffMorning: TimetableEntry[] = [
      { slotId: 'hslot-wakeup', time: '6:00 – 6:15 AM', startHour: 6, endHour: 6.25, activity: 'Wake up & stretch', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-workout', time: '6:15 – 7:00 AM', startHour: 6.25, endHour: 7, activity: 'Morning walk & light exercise', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-breakfast', time: '7:00 – 8:00 AM', startHour: 7, endHour: 8, activity: 'Freshen up & breakfast', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      { slotId: 'hslot-dayoff-am', time: '8:00 AM – 2:00 PM', startHour: 8, endHour: 14, activity: 'Personal Day Off & Free Time', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
    ];
    await db.timetable.bulkAdd(dayOffMorning);

    // Convert other slots to excused day-off rest
    const remaining = await db.timetable.where('date').equals(date).toArray();
    for (const e of remaining) {
      if (!e.slotId?.startsWith('hslot-')) {
        await db.timetable.update(e.id, {
          isBlocked: true,
          isExempt: true,
          status: 'exempt',
          locked: false,
        });
      }
    }
  } else {
    // 3. Normal Day: College 6 AM - 2 PM locked institutional block (no checkbox), 3 PM - 4 PM College Academics active with checkbox
    const toDelete = existingEntries
      .filter(e => e.slotId?.startsWith('hslot-'))
      .map(e => e.id);
    if (toDelete.length > 0) {
      await db.timetable.bulkDelete(toDelete);
    }

    // Ensure 5:00 - 5:45 AM wakeup exists
    const wakeup = existingEntries.find(e => e.slotId === 'slot-wakeup');
    if (!wakeup) {
      await db.timetable.add({
        id: generateId(),
        slotId: 'slot-wakeup',
        time: '5:00 – 5:45 AM',
        startHour: 5,
        endHour: 5.75,
        activity: 'Wake up, get ready & breakfast',
        category: 'personal',
        isBlocked: true,
        status: 'pending',
        date,
      });
    }

    // Ensure college slot exists (6:00 AM – 2:00 PM, locked, no checkbox)
    const college = existingEntries.find(e => e.slotId === 'slot-college');
    if (college) {
      await db.timetable.update(college.id, {
        time: '6:00 AM – 2:00 PM',
        startHour: 6,
        endHour: 14,
        activity: 'College',
        category: 'college',
        isBlocked: true, // Fixed college routine, no checkbox
        isHoliday: false,
        isExempt: false,
        status: 'pending',
        locked: true,
      });
    } else {
      await db.timetable.add({
        id: generateId(),
        slotId: 'slot-college',
        time: '6:00 AM – 2:00 PM',
        startHour: 6,
        endHour: 14,
        activity: 'College',
        category: 'college',
        isBlocked: true,
        isHoliday: false,
        isExempt: false,
        status: 'pending',
        locked: true,
        date,
      });
    }

    // Ensure 3:00 - 4:00 PM College Academics is ACTIVE STUDY TASK WITH CHECKBOX!
    const academics = existingEntries.find(e => e.slotId === 'slot-academics');
    if (academics) {
      await db.timetable.update(academics.id, {
        activity: 'College Academics (Revision & Assignments)',
        category: 'academics',
        isBlocked: false, // Active study task with checkbox!
        isExempt: false,
        isHoliday: false,
      });
    } else {
      await db.timetable.add({
        id: generateId(),
        slotId: 'slot-academics',
        time: '3:00 – 4:00 PM',
        startHour: 15,
        endHour: 16,
        activity: 'College Academics (Revision & Assignments)',
        category: 'academics',
        isBlocked: false,
        isHoliday: false,
        isExempt: false,
        status: 'pending',
        date,
      });
    }

    // Restore regular study slots
    const current = await db.timetable.where('date').equals(date).toArray();
    for (const e of current) {
      if (['slot-python', 'slot-cpp-dsa', 'slot-webdev', 'slot-planning'].includes(e.slotId || '')) {
        await db.timetable.update(e.id, {
          isBlocked: false,
          isExempt: false,
          isHoliday: false,
        });
      }
    }
  }

  await lockExpiredSlotsForDate(date);
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

export async function initTimetableForDate(date: string, entries: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  const existingCount = await db.timetable.where('date').equals(date).count();

  // Retrieve active schedule exceptions
  const exceptions = await db.scheduleExceptions.toArray();
  const activeExceptions = exceptions.filter(ex => ex.startDate <= date && date <= ex.endDate);
  const excludedSlotIds = new Set(activeExceptions.map(ex => ex.slotId));

  // Retrieve holiday settings
  const ds = await db.dailySettings.get(date);
  const holidayMode = ds?.holidayMode || (ds?.isHoliday ? 'holiday-study' : 'normal');

  if (existingCount === 0) {
    if (holidayMode === 'holiday-study') {
      // Initialize with morning gapless divided sessions (6 AM - 2 PM) - NO "6:00 AM – 2:00 PM" slot!
      const morningSlots = HOLIDAY_MORNING_SLOTS
        .filter(e => !excludedSlotIds.has(e.slotId || ''))
        .map(s => ({
          ...s,
          id: generateId(),
          date,
          status: 'pending' as const,
        }));

      // Afternoon & evening slots (including 3-4 PM College Academics as an active study task!)
      const afternoonSlots = entries
        .filter(e => e.slotId !== 'slot-college' && e.slotId !== 'slot-wakeup' && !excludedSlotIds.has(e.slotId || ''))
        .map(e => ({
          ...e,
          id: generateId(),
          date,
          activity: e.slotId === 'slot-academics' ? 'College Academics (Revision & Assignments)' : e.activity,
          isBlocked: e.slotId === 'slot-academics' ? false : e.isBlocked,
          status: 'pending' as const,
        }));

      await db.timetable.bulkAdd([...morningSlots, ...afternoonSlots]);
    } else if (holidayMode === 'holiday-no-study') {
      const dayOffMorning: TimetableEntry[] = [
        { slotId: 'hslot-wakeup', time: '6:00 – 6:15 AM', startHour: 6, endHour: 6.25, activity: 'Wake up & stretch', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
        { slotId: 'hslot-workout', time: '6:15 – 7:00 AM', startHour: 6.25, endHour: 7, activity: 'Morning walk & light exercise', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
        { slotId: 'hslot-breakfast', time: '7:00 – 8:00 AM', startHour: 7, endHour: 8, activity: 'Freshen up & breakfast', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
        { slotId: 'hslot-dayoff-am', time: '8:00 AM – 2:00 PM', startHour: 8, endHour: 14, activity: 'Personal Day Off & Free Time', category: 'personal', isBlocked: true, isExempt: true, isHoliday: true, status: 'exempt', id: generateId(), date },
      ];
      const afternoonSlots = entries
        .filter(e => e.slotId !== 'slot-college' && e.slotId !== 'slot-wakeup' && !excludedSlotIds.has(e.slotId || ''))
        .map(e => ({
          ...e,
          id: generateId(),
          date,
          isBlocked: true,
          isExempt: true,
          status: 'exempt' as const,
        }));
      await db.timetable.bulkAdd([...dayOffMorning, ...afternoonSlots]);
    } else {
      // Normal Day
      const allowedEntries = entries.filter(e => !excludedSlotIds.has(e.slotId || ''));
      const items: TimetableEntry[] = allowedEntries.map(e => ({
        ...e,
        id: generateId(),
        date,
        // College (6 AM - 2 PM) is fixed locked routine, no checkbox
        isBlocked: e.slotId === 'slot-college' ? true : e.isBlocked,
        status: 'pending' as const,
      }));
      await db.timetable.bulkAdd(items);
    }
  }

  // Automatically lock any expired study tasks
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

export async function resetTimetableForDate(date: string, _entries: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  await db.timetable.where('date').equals(date).delete();

  const ds = await db.dailySettings.get(date);
  const holidayMode: HolidayMode = ds?.holidayMode || (ds?.isHoliday ? (ds?.isNoStudyDay ? 'holiday-no-study' : 'holiday-study') : 'normal');

  await applyHolidayToDate(date, holidayMode);
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
