// ============================================================================
// DevPilot — Web Development Page (Frontend & Backend)
// ============================================================================
import { useState } from 'react';
import {
  Globe, CheckCircle2, Search, ExternalLink, Terminal, Server,
  Layout, Database, Shield, Layers, Code, Sparkles
} from 'lucide-react';
import { Card, PageHeader, ProgressBar, Badge, Button, Checkbox, Textarea, StatCard } from '../components/ui';
import { useTopics, updateTopicStatus, updateTopicNotes } from '../hooks/useDatabase';
import { percentage, statusBg, cn } from '../utils/helpers';
import type { LearningStatus } from '../types';

export default function WebDevPage() {
  const topics = useTopics('webdev');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'Frontend' | 'Backend'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const completedCount = topics.filter(t => t.status === 'completed').length;
  const learningCount = topics.filter(t => t.status === 'learning').length;
  const progressPct = percentage(completedCount, topics.length);

  const frontendTopics = topics.filter(t => t.section === 'Frontend');
  const backendTopics = topics.filter(t => t.section === 'Backend');

  const frontendDone = frontendTopics.filter(t => t.status === 'completed').length;
  const backendDone = backendTopics.filter(t => t.status === 'completed').length;

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesSec = sectionFilter === 'all' || t.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesSec && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D WEB DEVELOPMENT CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-cyan-500/40 bg-gradient-to-r from-[#071926] via-[#09152a] to-[#070b16] shadow-2xl shadow-cyan-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                PORTAL 02.4 // WEB DEVELOPMENT CHAMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Globe size={11} className="text-cyan-400" /> FULL-STACK PLATFORM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Web Development Track
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Build production full-stack systems — mastering modern React + TypeScript frontends and scalable FastAPI & SQL backends.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-cyan-950/60 border border-cyan-500/40 rounded-2xl shadow-inner text-right">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Progress</span>
              <span className="text-xl font-black text-cyan-300">{progressPct}% Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Frontend Progress" value={`${frontendDone}/${frontendTopics.length}`} icon={<Layout size={20} />} color="cyan" sub={`${percentage(frontendDone, frontendTopics.length)}% Finished`} />
        <StatCard label="Backend Progress" value={`${backendDone}/${backendTopics.length}`} icon={<Server size={20} />} color="violet" sub={`${percentage(backendDone, backendTopics.length)}% Finished`} />
        <StatCard label="Completed Topics" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard label="Active Learning" value={learningCount} icon={<Terminal size={20} />} color="amber" />
      </div>

      {/* Progress Card */}
      <Card className="p-4 bg-slate-900 border-cyan-500/30">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-200 flex items-center gap-2">
              <Globe className="text-cyan-400" size={18} />
              Full-Stack Road to Production: {completedCount} / {topics.length} topics mastered
            </span>
            <span className="text-cyan-400 font-bold">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} color="cyan" size="md" showPct={false} />
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search HTML, React, APIs, SQL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">Frontend & Backend</option>
            <option value="Frontend">Frontend Only (1-22)</option>
            <option value="Backend">Backend Only (23-35)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="not-started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="practising">Practising</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Sections */}
      {['Frontend', 'Backend'].map(sectionName => {
        const secTopics = filteredTopics.filter(t => t.section === sectionName);
        if (secTopics.length === 0) return null;

        const secDone = secTopics.filter(t => t.status === 'completed').length;
        const secPct = percentage(secDone, secTopics.length);

        return (
          <div key={sectionName} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {sectionName === 'Frontend' ? <Layout className="text-cyan-400" size={18} /> : <Server className="text-violet-400" size={18} />}
                {sectionName} Track
              </h3>
              <Badge variant={sectionName === 'Frontend' ? 'info' : 'purple'}>
                {secDone} / {secTopics.length} done ({secPct}%)
              </Badge>
            </div>

            <div className="space-y-2.5">
              {secTopics.map(topic => (
                <div
                  key={topic.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#0d1424] to-[#070b16] border border-slate-800 border-l-[5px] border-l-cyan-400 shadow-md hover:border-cyan-500/50 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <Checkbox
                        checked={topic.status === 'completed'}
                        onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-lg">#{topic.order}</span>
                          <h4 className={cn(
                            'text-base sm:text-lg font-black tracking-tight',
                            topic.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
                          )}>
                            {topic.title}
                          </h4>
                          <span className={cn('px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider', statusBg(topic.status))}>
                            {topic.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <select
                        value={topic.status}
                        onChange={e => updateTopicStatus(topic.id, e.target.value as LearningStatus)}
                        className="text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white cursor-pointer"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="learning">Learning</option>
                        <option value="practising">Practising</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
                        className="px-3 py-1.5 text-xs font-bold text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer transition-all"
                      >
                        {expandedTopicId === topic.id ? 'Hide' : 'Exercises & Notes'}
                      </button>
                    </div>
                  </div>

                  {expandedTopicId === topic.id && (
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs">
                      {topic.exercises && topic.exercises.length > 0 && (
                        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                          <span className="font-extrabold text-cyan-300 block mb-1 text-xs uppercase tracking-wider">
                            Hands-on Mini Tasks:
                          </span>
                          <ul className="list-disc pl-5 space-y-1 text-slate-200 font-medium">
                            {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                          </ul>
                        </div>
                      )}

                      {topic.resources && topic.resources.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-200 block mb-1">
                            Official Docs & Guides:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {topic.resources.map((res, i) => (
                              <a
                                key={i}
                                href={res}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg text-cyan-200 font-bold transition-all duration-200 active:scale-95"
                              >
                                <span>{res}</span>
                                <ExternalLink size={12} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="font-bold text-slate-200 block mb-1">
                          Personal Notes & Snippets:
                        </span>
                        <Textarea
                          placeholder="Note key code patterns, gotchas, architecture choices..."
                          value={topic.notes}
                          onChange={e => updateTopicNotes(topic.id, e.target.value)}
                          className="text-xs font-mono"
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
  );
}
