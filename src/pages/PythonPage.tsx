// ============================================================================
// DevPilot — Python Mastery Page
// ============================================================================
import { useState } from 'react';
import {
  Code2, Sparkles, CheckCircle2, Search, Filter, Terminal, BookOpen,
  HelpCircle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Card, PageHeader, ProgressBar, Badge, Button, Checkbox, Textarea, StatCard } from '../components/ui';
import { useTopics, updateTopicStatus, updateTopicNotes } from '../hooks/useDatabase';
import { percentage, statusBg, cn } from '../utils/helpers';
import type { LearningStatus, LearningTopic } from '../types';

export default function PythonPage() {
  const topics = useTopics('python');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Group by level
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const completedCount = topics.filter(t => t.status === 'completed').length;
  const learningCount = topics.filter(t => t.status === 'learning').length;
  const practisingCount = topics.filter(t => t.status === 'practising').length;
  const progressPct = percentage(completedCount, topics.length);

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || t.section.toLowerCase().includes(levelFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D PYTHON MASTERY CHAMBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-emerald-500/40 bg-gradient-to-r from-[#061d13] via-[#0b1625] to-[#070b16] shadow-2xl shadow-emerald-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                PORTAL 02.1 // PYTHON MASTERY CHAMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Code2 size={11} className="text-emerald-400" /> PRIMARY CORE LANGUAGE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Python Mastery Track
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Master Python from fundamentals to advanced asynchronous engineering and AI agent infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl shadow-inner text-right">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">Progress</span>
              <span className="text-xl font-black text-emerald-300">{progressPct}% Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Topics" value={topics.length} icon={<Code2 size={20} />} color="blue" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard label="Learning / Active" value={learningCount} icon={<Terminal size={20} />} color="violet" />
        <StatCard label="Practising" value={practisingCount} icon={<Sparkles size={20} />} color="amber" />
      </div>

      {/* Progress Bar Card */}
      <Card className="p-4 bg-slate-900 border-emerald-500/30">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Primary Language Progress: {completedCount} / {topics.length} topics completed
            </span>
            <span className="text-emerald-400 font-bold">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} color="emerald" size="md" showPct={false} />
        </div>
      </Card>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Python concepts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner (1-14)</option>
            <option value="intermediate">Intermediate (15-27)</option>
            <option value="advanced">Advanced & Practical (28-37)</option>
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

      {/* Topics by Level */}
      <div className="space-y-6">
        {levels.map(level => {
          const levelTopics = filteredTopics.filter(t => t.section.toLowerCase().includes(level.toLowerCase()));
          if (levelTopics.length === 0) return null;

          const levelDone = levelTopics.filter(t => t.status === 'completed').length;
          const levelPct = percentage(levelDone, levelTopics.length);

          return (
            <div key={level} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {level} Python
                  </h3>
                  <Badge variant={level === 'Beginner' ? 'info' : level === 'Intermediate' ? 'purple' : 'warning'}>
                    {levelDone} / {levelTopics.length} done ({levelPct}%)
                  </Badge>
                </div>
              </div>

              <div className="space-y-2.5">
                {levelTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0d1424] to-[#070b16] border border-slate-800 border-l-[5px] border-l-emerald-400 shadow-md hover:border-emerald-500/50 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <Checkbox
                          checked={topic.status === 'completed'}
                          onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-lg">#{topic.order}</span>
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
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                        {topic.exercises && topic.exercises.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                            <span className="font-semibold text-emerald-500 block mb-1 flex items-center gap-1.5">
                              <Terminal size={14} /> Coding Exercises & Challenges:
                            </span>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-200 font-medium">
                              {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                            </ul>
                          </div>
                        )}

                        {topic.resources && topic.resources.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Recommended Free Learning Resources:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {topic.resources.map((res, i) => (
                                <a
                                  key={i}
                                  href={res}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-1"
                                >
                                  {res} <ExternalLink size={12} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Personal Study Notes & Key Snippets:
                          </span>
                          <Textarea
                            placeholder="Type your notes, code examples, gotchas or questions..."
                            value={topic.notes}
                            onChange={e => updateTopicNotes(topic.id, e.target.value)}
                            className="text-xs"
                            rows={3}
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
