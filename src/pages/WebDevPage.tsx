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
      <PageHeader
        title="Web Development Track"
        subtitle="Complete modern full-stack development — master both frontend (React + TS) and backend (FastAPI, Node, SQL)."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1 font-semibold text-sm">
              {progressPct}% Completed
            </Badge>
          </div>
        }
      />

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

            <div className="space-y-2">
              {secTopics.map(topic => (
                <Card key={topic.id} className="p-4 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={topic.status === 'completed'}
                        onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-400">#{topic.order}</span>
                          <h4 className={cn(
                            'text-sm font-semibold truncate',
                            topic.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                          )}>
                            {topic.title}
                          </h4>
                          <Badge className={statusBg(topic.status)}>
                            {topic.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={topic.status}
                        onChange={e => updateTopicStatus(topic.id, e.target.value as LearningStatus)}
                        className="text-xs bg-slate-100 dark:bg-slate-700 border-none rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
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
                        className="text-xs"
                      >
                        {expandedTopicId === topic.id ? 'Hide' : 'Exercises & Notes'}
                      </Button>
                    </div>
                  </div>

                  {expandedTopicId === topic.id && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                      {topic.exercises && topic.exercises.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          <span className="font-semibold text-cyan-400 block mb-1">
                            Hands-on Mini Tasks:
                          </span>
                          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                            {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                          </ul>
                        </div>
                      )}

                      {topic.resources && topic.resources.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Official Docs & Guides:
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
                          Personal Notes & Snippets:
                        </span>
                        <Textarea
                          placeholder="Note key code patterns, gotchas, architecture choices..."
                          value={topic.notes}
                          onChange={e => updateTopicNotes(topic.id, e.target.value)}
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
