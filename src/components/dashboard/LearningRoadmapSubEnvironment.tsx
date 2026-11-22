// ============================================================================
// DevPilot — Secondary 3D Sub-Environment: 6 Interactive Learning Portals
// ============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Sparkles, Code2, Binary, Cpu,
  Globe, Brain, GraduationCap, ArrowUpRight, Compass
} from 'lucide-react';

interface LearningPortalItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  route: string;
  icon: React.ElementType;
  themeColor: string;
  glowRgb: string;
  badge: string;
}

const LEARNING_PORTALS: LearningPortalItem[] = [
  {
    id: 'python',
    name: 'Python Mastery',
    tagline: 'Modern Systems, OOP & Scripting',
    description: 'Master core syntax, data structures, generators, decorators, and production Python architectures.',
    route: '/python',
    icon: Code2,
    themeColor: '#10b981', // Emerald
    glowRgb: '16, 185, 129',
    badge: 'Core Track',
  },
  {
    id: 'cpp-dsa',
    name: 'C++ and DSA',
    tagline: 'Algorithms & High Performance',
    description: 'Pointers, dynamic memory, STL, Trees, Graphs, Dynamic Programming, and Asymptotic Big-O complexity.',
    route: '/cpp-dsa',
    icon: Binary,
    themeColor: '#8a4cfc', // Violet
    glowRgb: '138, 76, 252',
    badge: 'Competitive DSA',
  },
  {
    id: 'system-design',
    name: 'System Design',
    tagline: 'Scalable Distributed Architectures',
    description: 'Microservices, horizontal scaling, caching (Redis), message queues (Kafka), database sharding & CDN.',
    route: '/system-design',
    icon: Cpu,
    themeColor: '#00d8ff', // Cyan
    glowRgb: '0, 216, 255',
    badge: 'High Scale',
  },
  {
    id: 'webdev',
    name: 'Web Development',
    tagline: 'Full-Stack Modern Web Engineering',
    description: 'React, Next.js, Node.js, REST & GraphQL APIs, WebSockets, state management, and modern CSS frameworks.',
    route: '/webdev',
    icon: Globe,
    themeColor: '#38bdf8', // Electric Blue
    glowRgb: '56, 189, 248',
    badge: 'Production Web',
  },
  {
    id: 'ai-ml',
    name: 'AI/ML Development',
    tagline: 'Neural Networks & Large Language Models',
    description: 'Machine learning fundamentals, deep learning, embeddings, transformer architectures, and Gemini APIs.',
    route: '/ai-ml',
    icon: Brain,
    themeColor: '#f43f5e', // Rose
    glowRgb: '244, 63, 94',
    badge: 'GenAI & Tensors',
  },
  {
    id: 'academics',
    name: 'College Academics',
    tagline: 'University Curriculum & Exams',
    description: 'Semester subjects, core CS theoretical disciplines, revision schedules, and high-GPA academic milestones.',
    route: '/academics',
    icon: GraduationCap,
    themeColor: '#eab308', // Gold
    glowRgb: '234, 179, 8',
    badge: 'Semester Goals',
  },
];

interface LearningRoadmapSubEnvironmentProps {
  onBackToMain: () => void;
}

export default function LearningRoadmapSubEnvironment({ onBackToMain }: LearningRoadmapSubEnvironmentProps) {
  const navigate = useNavigate();
  const [openingPortalId, setOpeningPortalId] = useState<string | null>(null);

  const handlePortalClick = (route: string, id: string) => {
    setOpeningPortalId(id);
    setTimeout(() => {
      navigate(route);
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4 }}
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between py-6 px-4 sm:px-8 select-none"
    >
      {/* ── SUB-ENVIRONMENT HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMain}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs text-xs sm:text-sm font-semibold group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal Hub</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                CHAMBER 02
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Learning Roadmap Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select one of the six specialized engineering domains below to enter its full curriculum.
            </p>
          </div>
        </div>

        {/* Action to view unified global roadmap */}
        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-indigo-500/20 self-start sm:self-auto"
        >
          <Compass size={16} />
          <span>Full Visual Roadmap</span>
        </button>
      </div>

      {/* ── SIX 3D LEARNING PORTAL GATES ── */}
      <div className="my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {LEARNING_PORTALS.map((portal) => {
            const Icon = portal.icon;
            const isSelected = openingPortalId === portal.id;

            return (
              <motion.div
                key={portal.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePortalClick(portal.route, portal.id)}
                className={`relative rounded-2xl p-5 border bg-slate-950/90 cursor-pointer overflow-hidden transition-all duration-300 group ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(0,216,255,0.6)]'
                    : 'border-slate-800 hover:border-slate-700 shadow-lg shadow-black/40'
                }`}
                style={{
                  boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(${portal.glowRgb}, 0.06)`,
                }}
              >
                {/* Glowing portal halo on hover */}
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none"
                  style={{ backgroundColor: portal.themeColor }}
                />

                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `rgba(${portal.glowRgb}, 0.12)`,
                      borderColor: `rgba(${portal.glowRgb}, 0.4)`,
                      color: portal.themeColor,
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <span
                    className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: `rgba(${portal.glowRgb}, 0.35)`,
                      backgroundColor: `rgba(${portal.glowRgb}, 0.08)`,
                      color: portal.themeColor,
                    }}
                  >
                    {portal.badge}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{portal.name}</span>
                    <ArrowUpRight size={18} className="text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  <p className="text-xs font-bold" style={{ color: portal.themeColor }}>
                    {portal.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-3">
                  {portal.description}
                </p>

                {/* Bottom Threshold Line */}
                <div
                  className="mt-4 h-1 w-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: `rgba(${portal.glowRgb}, 0.5)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CHAMBER FOOTER NOTE ── */}
      <div className="text-center text-xs text-slate-300 font-mono font-medium py-3 border-t border-slate-800/80">
        DevPilot Multi-Track Knowledge Architecture • All progress is synchronized to your profile
      </div>
    </motion.div>
  );
}
