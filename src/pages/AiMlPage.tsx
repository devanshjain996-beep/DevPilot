// ============================================================================
// DevPilot — AI/ML Development Page
// ============================================================================
import { useState } from 'react';
import {
  Brain, CheckCircle2, Search, ExternalLink, Sparkles, Bot, Cpu,
  Database, Shield, DollarSign, Layers, Rocket, Zap, MessageSquare
} from 'lucide-react';
import { Card, PageHeader, ProgressBar, Badge, Button, Checkbox, Textarea, StatCard } from '../components/ui';
import { useTopics, updateTopicStatus, updateTopicNotes } from '../hooks/useDatabase';
import { percentage, statusBg, cn } from '../utils/helpers';
import type { LearningStatus } from '../types';

export default function AiMlPage() {
  const topics = useTopics('ai-ml');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const completedCount = topics.filter(t => t.status === 'completed').length;
  const progressPct = percentage(completedCount, topics.length);

  const sections = [
    'AI Fundamentals',
    'Building with AI APIs',
    'Building AI Applications',
    'Production & Operations'
  ];

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesSec = sectionFilter === 'all' || t.section === sectionFilter;
    return matchesSearch && matchesSec;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D AI & NEURAL SYSTEMS CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-violet-500/40 bg-gradient-to-r from-[#190928] via-[#100f24] to-[#070b16] shadow-2xl shadow-violet-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-violet-950/80 text-violet-300 border border-violet-400/50 shadow-sm shadow-violet-500/20">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                PORTAL 02.5 // AI SYSTEMS CHAMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Brain size={11} className="text-violet-400" /> AI-POWERED DEV
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI-Powered Software Development
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Build production AI applications with modern LLM APIs, vector embeddings, RAG semantic search, and autonomous agents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-violet-950/60 border border-violet-500/40 rounded-2xl shadow-inner text-right">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Progress</span>
              <span className="text-xl font-black text-violet-300">{progressPct}% Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Mission Card */}
      <Card className="bg-gradient-to-r from-violet-950/60 via-purple-950/40 to-slate-900 border-violet-500/30 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              Your Career Goal: AI-Powered Software Developer
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              You are not aiming to become a theoretical AI researcher — you are building real-world full-stack applications powered by AI: intelligent assistants, document RAG search, autonomous agents, and production APIs.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-2xl font-black text-violet-400">{completedCount} / {topics.length}</span>
            <span className="text-xs text-slate-400 block">Topics Completed</span>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Curriculum" value={topics.length} icon={<Brain size={20} />} color="violet" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard label="Practical Projects" value="4 Ready" icon={<Bot size={20} />} color="cyan" sub="Chatbot, PDF Q&A, Agent, RAG" />
        <StatCard label="Mastery Score" value={`${progressPct}%`} icon={<Zap size={20} />} color="rose" />
      </div>

      {/* Progress Bar */}
      <Card className="p-4 bg-slate-900 border-violet-500/30">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-200 flex items-center gap-2">
              <Brain className="text-violet-400" size={18} />
              AI Application Roadmap Progress
            </span>
            <span className="text-violet-400 font-bold">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} color="violet" size="md" showPct={false} />
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search LLM, RAG, prompt engineering, agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={e => setSectionFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium w-full sm:w-auto"
        >
          <option value="all">All Modules</option>
          {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
        </select>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {sections.map(sec => {
          const secTopics = filteredTopics.filter(t => t.section === sec);
          if (secTopics.length === 0) return null;

          const secDone = secTopics.filter(t => t.status === 'completed').length;
          const secPct = percentage(secDone, secTopics.length);

          return (
            <div key={sec} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-rose-400" size={18} />
                  {sec}
                </h3>
                <Badge variant="purple">
                  {secDone} / {secTopics.length} done ({secPct}%)
                </Badge>
              </div>

              <div className="space-y-3">
                {secTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 via-[#0d1424] to-[#070b16] border border-slate-800 border-l-[5px] border-l-violet-400 shadow-lg shadow-violet-950/20 transition-all hover:border-violet-500/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={topic.status === 'completed'}
                          onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-violet-300">#{topic.order}</span>
                            <h4 className={cn(
                              'text-base sm:text-lg font-black tracking-tight truncate',
                              topic.status === 'completed' ? 'text-violet-400 line-through opacity-75' : 'text-white'
                            )}>
                              {topic.title}
                            </h4>
                            <Badge className={statusBg(topic.status)}>
                              {topic.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={topic.status}
                          onChange={e => updateTopicStatus(topic.id, e.target.value as LearningStatus)}
                          className="text-xs bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold cursor-pointer hover:border-slate-500"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="learning">Learning</option>
                          <option value="practising">Practising</option>
                          <option value="completed">Completed</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                          className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700"
                        >
                          {expandedTopicId === topic.id ? 'Hide' : 'Hands-on & Notes'}
                        </Button>
                      </div>
                    </div>

                    {expandedTopicId === topic.id && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs">
                        {topic.exercises && topic.exercises.length > 0 && (
                          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                            <span className="font-bold text-rose-400 block mb-2 flex items-center gap-1.5">
                              <Bot size={15} /> Practical Building Challenge:
                            </span>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-200 font-medium leading-relaxed">
                              {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                            </ul>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Personal AI Notes & Architecture Patterns:
                          </span>
                          <Textarea
                            placeholder="Add your prompt templates, API response schemas, token usage insights..."
                            value={topic.notes}
                            onChange={e => updateTopicNotes(topic.id, e.target.value)}
                            className="text-xs"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
