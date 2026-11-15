// ============================================================================
// DevPilot - Dexie Database (IndexedDB)
// ============================================================================
import Dexie, { type Table } from 'dexie';
import type {
  TimetableEntry, Task, LearningTopic, DSAProblem, Project,
  Subject, Goal, WeeklyReview, StudyLog, WeeklySlot,
  ScheduleException, DailySettings, NotificationHistoryItem
} from '../types';

export class DevPilotDB extends Dexie {
  timetable!: Table<TimetableEntry, string>;
  tasks!: Table<Task, string>;
  topics!: Table<LearningTopic, string>;
  dsaProblems!: Table<DSAProblem, string>;
  projects!: Table<Project, string>;
  subjects!: Table<Subject, string>;
  goals!: Table<Goal, string>;
  weeklyReviews!: Table<WeeklyReview, string>;
  studyLogs!: Table<StudyLog, string>;
  weeklySlots!: Table<WeeklySlot, string>;
  scheduleExceptions!: Table<ScheduleException, string>;
  dailySettings!: Table<DailySettings, string>;
  notificationHistory!: Table<NotificationHistoryItem, string>;

  constructor() {
    super('DevPilotDB');
    this.version(1).stores({
      timetable: 'id, date, category, status',
      tasks: 'id, date, category, status, priority',
      topics: 'id, trackId, section, status, order',
      dsaProblems: 'id, topic, difficulty, platform, solved',
      projects: 'id, status',
      subjects: 'id',
      goals: 'id, period, completed',
      weeklyReviews: 'id, weekStart',
      studyLogs: 'id, date, category',
      weeklySlots: 'id, day',
    });
    this.version(2).stores({
      timetable: 'id, date, category, status, slotId',
      tasks: 'id, date, category, status, priority',
      topics: 'id, trackId, section, status, order',
      dsaProblems: 'id, topic, difficulty, platform, solved',
      projects: 'id, status',
      subjects: 'id',
      goals: 'id, period, completed',
      weeklyReviews: 'id, weekStart',
      studyLogs: 'id, date, category',
      weeklySlots: 'id, day',
      scheduleExceptions: 'id, slotId, type, startDate, endDate',
      dailySettings: 'date, isHoliday',
    });
    this.version(3).stores({
      timetable: 'id, date, category, status, slotId, userId',
      tasks: 'id, date, category, status, priority, userId',
      topics: 'id, trackId, section, status, order, userId',
      dsaProblems: 'id, topic, difficulty, platform, solved, userId',
      projects: 'id, status, userId',
      subjects: 'id, userId',
      goals: 'id, period, completed, userId',
      weeklyReviews: 'id, weekStart, userId',
      studyLogs: 'id, date, category, userId',
      weeklySlots: 'id, day, userId',
      scheduleExceptions: 'id, slotId, type, startDate, endDate, userId',
      dailySettings: 'date, isHoliday, userId',
      notificationHistory: 'id, scheduledFor, status, category, userId',
    });
  }
}

export const db = new DevPilotDB();
