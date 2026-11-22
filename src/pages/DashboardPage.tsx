// ============================================================================
// DevPilot — 3D Universe Dashboard Page (Full-Screen 3D Only)
// ============================================================================
import React, { useEffect } from 'react';
import {
  useTodayTimetable,
  useTrackProgress,
  useProjects,
  useGoals,
  useAllTopics,
  repairAndSyncTimetable,
  lockExpiredSlotsForDate,
} from '../hooks/useDatabase';
import { todayStr } from '../utils/helpers';
import FiveDoorDashboard from '../components/dashboard/FiveDoorDashboard';

export default function DashboardPage() {
  const today = todayStr();
  const timetable = useTodayTimetable();
  const allTopics = useAllTopics();
  const { overallPercentage } = useTrackProgress();
  const projects = useProjects();
  const goals = useGoals();

  // Automatically repair, sync schedule, and periodically check and lock expired slots
  useEffect(() => {
    repairAndSyncTimetable(today);
    const timer = setInterval(() => {
      lockExpiredSlotsForDate(today);
    }, 15000);
    return () => clearInterval(timer);
  }, [today]);

  return (
    <FiveDoorDashboard
      timetable={timetable}
      allTopics={allTopics}
      overallPercentage={overallPercentage}
      projects={projects}
      goals={goals}
    />
  );
}
