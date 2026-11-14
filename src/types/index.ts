// ============================================================================
// DevPilot - Type Definitions
// ============================================================================

export type LearningStatus = 'not-started' | 'learning' | 'practising' | 'completed';
export type ProjectStatus = 'idea' | 'planning' | 'in-progress' | 'completed';
export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'rescheduled' | 'missed' | 'exempt' | 'in-progress' | 'upcoming';
export type SlotVisualStatus = 'upcoming' | 'in-progress' | 'completed' | 'missed' | 'exempt';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ExceptionType = 'day' | 'week' | 'month' | 'permanent';

export interface TimetableEntry {
  id: string;
  slotId?: string; // Stable ID across recurring occurrences (e.g. 'slot-college')
  time: string;
  startHour: number;
  endHour: number;
  activity: string;
  category: string;
  isBlocked?: boolean; // Personal break / free time
  isHoliday?: boolean; // Converted for holiday
  isExempt?: boolean;  // Excused/exempt from required calculations
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  completedAt?: string;
  statusUpdatedAt?: string;
  locked?: boolean;
}

export interface ScheduleException {
  id: string;
  slotId: string;
  type: ExceptionType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  createdAt: string;
}

export type HolidayMode = 'normal' | 'holiday-study' | 'holiday-no-study';

export interface DailySettings {
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  holidayMode?: HolidayMode;
  holidayReason?: string;
  answeredPrompt: boolean;
  isNoStudyDay?: boolean;
  updatedAt: string;
}

export interface WeeklySlot {
  id: string;
  day: string;
  timeSlot: string;
  activity: string;
  category: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  deadline?: string;
  status: TaskStatus;
  date: string;
  createdAt: string;
}

export interface LearningTopic {
  id: string;
  trackId: string;
  section: string;
  order: number;
  title: string;
  description: string;
  prerequisites?: string[];
  exercises?: string[];
  resources?: string[];
  status: LearningStatus;
  notes: string;
  completedAt?: string;
}

export interface DSAProblem {
  id: string;
  name: string;
  topic: string;
  difficulty: Difficulty;
  platform: string;
  url: string;
  attemptDate?: string;
  solved: boolean;
  attempts: number;
  timeTaken?: string;
  solutionNotes: string;
  needsRevision: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  deadline?: string;
  completionDate?: string;
  status: ProjectStatus;
  notes: string;
  lessonsLearned: string;
  showInPortfolio: boolean;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  assignments: Assignment[];
  exams: Exam[];
  practicals: Practical[];
  progress: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  topics: string[];
  completed: boolean;
  notes: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  marks?: number;
  maxMarks?: number;
  notes: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  marks?: number;
  maxMarks?: number;
  prepared: boolean;
}

export interface Practical {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
  marks?: number;
  maxMarks?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  period: GoalPeriod;
  targetDate: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  studyHours: number;
  pythonTopics: number;
  dsaProblems: number;
  webdevProgress: string;
  systemDesignTopics: number;
  aimlProgress: string;
  academicProgress: string;
  projectsWorkedOn: string;
  missedTasks: string;
  difficulties: string;
  achievements: string;
  nextWeekPlan: string;
  chatgptFeedback?: string;
  createdAt: string;
}

export interface StudyLog {
  id: string;
  date: string;
  category: string;
  hours: number;
  topicsCompleted: number;
  notes: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  github?: string;
  linkedin?: string;
  bio: string;
  careerGoal: string;
  college?: string;
  portfolioVisible: boolean;
  achievements: string[];
  certifications: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  reminderEnabled: boolean;
  studyPreferences: {
    dailyStudyGoalHours: number;
    preferredLanguage: string;
  };
}

export interface ProgressReport {
  completedTopics: Record<string, number>;
  totalTopics: Record<string, number>;
  pythonHours: number;
  dsaProblemsAttempted: number;
  dsaProblemsSolved: number;
  webdevProgress: string;
  systemDesignProgress: string;
  aimlProgress: string;
  academicProgress: string;
  projectUpdates: string;
  weeklyStudyHours: number;
  difficulties: string;
  suggestedPriorities: string[];
}
