// ============================================================================
// DevPilot — Master Five-Door 3D Futuristic Universe Dashboard
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Compass, FolderKanban, Award, TrendingUp,
  Sparkles, Layers, ShieldCheck, Flame, User, ArrowRight,
  Sliders, LayoutGrid, CheckCircle2
} from 'lucide-react';
import PortalDoor3D, { type DoorThemeConfig } from './PortalDoor3D';
import LearningRoadmapSubEnvironment from './LearningRoadmapSubEnvironment';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../store/useStore';
import type { TimetableEntry, LearningTopic, Project, Goal } from '../../types';

interface FiveDoorDashboardProps {
  timetable: TimetableEntry[];
  allTopics: LearningTopic[];
  overallPercentage: number;
  projects: Project[];
  goals: Goal[];
  onSwitchToClassicView?: () => void;
}

const DOOR_THEMES: Record<string, DoorThemeConfig> = {
  timetable: {
    primary: '#00d8ff',
    secondary: '#38bdf8',
    glowColor: '0, 216, 255',
    borderGlow: 'border-cyan-500/40 group-hover:border-cyan-400',
    textAccent: 'text-cyan-400',
    bgGradient: 'from-cyan-950/40 to-slate-950',
    runeSymbol: '⏳',
  },
  roadmap: {
    primary: '#a855f7',
    secondary: '#8a4cfc',
    glowColor: '168, 85, 247',
    borderGlow: 'border-violet-500/40 group-hover:border-violet-400',
    textAccent: 'text-violet-400',
    bgGradient: 'from-violet-950/40 to-slate-950',
    runeSymbol: '⚡',
  },
  projects: {
    primary: '#f97316',
    secondary: '#fb923c',
    glowColor: '249, 115, 22',
    borderGlow: 'border-orange-500/40 group-hover:border-orange-400',
    textAccent: 'text-orange-400',
    bgGradient: 'from-orange-950/40 to-slate-950',
    runeSymbol: '🛠️',
  },
  portfolio: {
    primary: '#eab308',
    secondary: '#fef08a',
    glowColor: '234, 179, 8',
    borderGlow: 'border-yellow-500/40 group-hover:border-yellow-400',
    textAccent: 'text-yellow-400',
    bgGradient: 'from-amber-950/40 to-slate-950',
    runeSymbol: '👑',
  },
  goals: {
    primary: '#10b981',
    secondary: '#34d399',
    glowColor: '16, 185, 129',
    borderGlow: 'border-emerald-500/40 group-hover:border-emerald-400',
    textAccent: 'text-emerald-400',
    bgGradient: 'from-emerald-950/40 to-slate-950',
    runeSymbol: '📈',
  },
};

export default function FiveDoorDashboard({
  timetable,
  allTopics,
  overallPercentage,
  projects,
  goals,
  onSwitchToClassicView,
}: FiveDoorDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [activeSubEnvironment, setActiveSubEnvironment] = useState<'main' | 'roadmap'>('main');
  const [openingDoorId, setOpeningDoorId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background atmospheric particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: { x: number; y: number; r: number; s: number; a: number }[] = [];
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.6,
        s: 0.15 + Math.random() * 0.45,
        a: 0.2 + Math.random() * 0.5,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.s;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.a})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDoorClick = (doorId: string, destinationRoute?: string) => {
    setOpeningDoorId(doorId);

    // If it's the Roadmap door, transition into the 6-portal secondary environment
    if (doorId === 'roadmap') {
      setTimeout(() => {
        setActiveSubEnvironment('roadmap');
        setOpeningDoorId(null);
      }, 500);
      return;
    }

    // Otherwise navigate to destination route
    if (destinationRoute) {
      setTimeout(() => {
        navigate(destinationRoute);
      }, 550);
    }
  };

  const completedGoals = goals.filter((g) => g.completed).length;
  const activeProjectsCount = projects.filter((p) => p.status === 'in-progress' || p.status === 'planning').length;
  const todayCompletedSlots = timetable.filter((s) => s.status === 'completed').length;

  return (
    <div className="relative w-full min-h-full bg-[#070b14] overflow-x-hidden flex flex-col justify-between select-none">
      {/* ── BACKGROUND VOLUMETRIC LIGHTS & ATMOSPHERE ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
      />

      {/* Top Ambient Glow Spotlights */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── PERSPECTIVE FLOOR GRID REFLECTION ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-64 pointer-events-none opacity-25"
        style={{
          background:
            'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent), repeating-linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0px, transparent 1px, transparent 40px)',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* ── TOP HUD NAVIGATION & STATUS BAR ── */}
      <header className="relative z-20 px-4 sm:px-8 pt-5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Sparkles size={20} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                DevPilot 3D Universe
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ACTIVE PORTAL HUB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Welcome back, <span className="text-slate-200 font-semibold">{user?.displayName || profile?.name || 'Developer'}</span>. Choose a destination portal to enter.
            </p>
          </div>
        </div>

        {/* Quick HUD Metrics & View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>{todayCompletedSlots}/{timetable.length} Slots</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Compass size={14} className="text-violet-400" />
              <span>{overallPercentage}% Roadmap</span>
            </div>
          </div>

          {onSwitchToClassicView && (
            <button
              type="button"
              onClick={onSwitchToClassicView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/90 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-xs"
            >
              <LayoutGrid size={13} />
              <span>Classic View</span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN INTERACTIVE AREA: FIVE DOORS OR ROADMAP SUB-ENVIRONMENT ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeSubEnvironment === 'roadmap' ? (
            <LearningRoadmapSubEnvironment
              key="roadmap-sub"
              onBackToMain={() => setActiveSubEnvironment('main')}
            />
          ) : (
            <motion.div
              key="five-doors"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-7xl mx-auto space-y-6"
            >
              {/* Universe Title Intro */}
              <div className="text-center space-y-1.5 mb-2">
                <span className="font-mono text-[11px] font-semibold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
                  PRIMARY NAVIGATION MATRIX
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Five Gateways to Engineering Mastery
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                  Step through any portal to enter your daily timetable, explore 6 technical curriculum tracks, view active builds, inspect your portfolio, or analyze weekly goals.
                </p>
              </div>

              {/* ── THE FIVE ARCHITECTURAL 3D DOORS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 justify-center items-stretch pt-2">
                {/* DOOR 01: MY TIMETABLE */}
                <PortalDoor3D
                  id="timetable"
                  doorNumber="01"
                  title="My Timetable"
                  subtitle="Routine & Schedule"
                  description="Command your college routine, study slots, and weekly planner with active task checkboxes."
                  icon={Clock}
                  theme={DOOR_THEMES.timetable}
                  telemetryBadge={timetable.length > 0 ? `${timetable.length} Slots Today` : 'Plan Today'}
                  telemetrySub="Live Sync"
                  isOpening={openingDoorId === 'timetable'}
                  onClick={() => handleDoorClick('timetable', '/timetable')}
                />

                {/* DOOR 02: LEARNING ROADMAP */}
                <PortalDoor3D
                  id="roadmap"
                  doorNumber="02"
                  title="Roadmap Hub"
                  subtitle="6 Technical Stacks"
                  description="Opens chamber for Python, C++ & DSA, System Design, WebDev, AI/ML, and Academics."
                  icon={Compass}
                  theme={DOOR_THEMES.roadmap}
                  telemetryBadge={`${overallPercentage}% Mastered`}
                  telemetrySub="6 Portals"
                  isOpening={openingDoorId === 'roadmap'}
                  onClick={() => handleDoorClick('roadmap')}
                />

                {/* DOOR 03: PROJECTS */}
                <PortalDoor3D
                  id="projects"
                  doorNumber="03"
                  title="Projects"
                  subtitle="Builds & Architecture"
                  description="Track production web apps, engineering repositories, milestone progress, and tech stacks."
                  icon={FolderKanban}
                  theme={DOOR_THEMES.projects}
                  telemetryBadge={projects.length > 0 ? `${activeProjectsCount || projects.length} Projects` : 'Start Build'}
                  telemetrySub="Showcase"
                  isOpening={openingDoorId === 'projects'}
                  onClick={() => handleDoorClick('projects', '/projects')}
                />

                {/* DOOR 04: PORTFOLIO */}
                <PortalDoor3D
                  id="portfolio"
                  doorNumber="04"
                  title="Portfolio"
                  subtitle="Career & Profile"
                  description="Showcase professional biography, verified skills, featured projects, and recruiter links."
                  icon={Award}
                  theme={DOOR_THEMES.portfolio}
                  telemetryBadge={profile?.name ? 'Profile Live' : 'Customize'}
                  telemetrySub="Verified"
                  isOpening={openingDoorId === 'portfolio'}
                  onClick={() => handleDoorClick('portfolio', '/portfolio')}
                />

                {/* DOOR 05: GOAL ANALYTICS */}
                <PortalDoor3D
                  id="goals"
                  doorNumber="05"
                  title="Goal Analytics"
                  subtitle="Metrics & Reviews"
                  description="Analyze study logs, weekly consistency scores, milestone completion, and habit streaks."
                  icon={TrendingUp}
                  theme={DOOR_THEMES.goals}
                  telemetryBadge={goals.length > 0 ? `${completedGoals}/${goals.length} Goals` : 'Set Targets'}
                  telemetrySub="Analytics"
                  isOpening={openingDoorId === 'goals'}
                  onClick={() => handleDoorClick('goals', '/goals')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER TELEMETRY STRIP ── */}
      <footer className="relative z-20 px-4 sm:px-8 py-3 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>DEVPILOT 3D ENGINE • HARDWARE ACCELERATED PERSPECTIVE</span>
        </div>

        <div className="flex items-center gap-3">
          <span>ALL DATA PERSISTENT IN INDEXEDDB + SUPABASE</span>
        </div>
      </footer>
    </div>
  );
}
