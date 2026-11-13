// ============================================================================
// DevPilot - Database hooks for data access
// ============================================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../store/db';
import { todayStr, weekRange, percentage, generateId } from '../utils/helpers';
import { ALL_TRACKS } from '../data/roadmapData';
import type { LearningTopic, TimetableEntry, Task, DSAProblem, Project, Subject, Goal, StudyLog, WeeklySlot } from '../types';

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

export async function initTimetableForDate(date: string, entries: Omit<TimetableEntry, 'id' | 'date' | 'status'>[]) {
  const existing = await db.timetable.where('date').equals(date).count();
  if (existing === 0) {
    const items: TimetableEntry[] = entries.map(e => ({
      ...e,
      id: generateId(),
      date,
      status: 'pending' as const,
    }));
    await db.timetable.bulkAdd(items);
  }
}

export async function updateTimetableStatus(id: string, status: TimetableEntry['status']) {
  await db.timetable.update(id, { status });
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
    version: 1,
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
    settings: localStorage.getItem('devpilot_settings'),
    profile: localStorage.getItem('devpilot_profile'),
  };
  return data;
}

export async function importAllData(data: any) {
  if (!data?.version) throw new Error('Invalid backup file');
  await db.transaction('rw', [db.topics, db.timetable, db.tasks, db.dsaProblems, db.projects, db.subjects, db.goals, db.studyLogs, db.weeklyReviews, db.weeklySlots], async () => {
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
  localStorage.removeItem('devpilot_settings');
  localStorage.removeItem('devpilot_profile');
}
