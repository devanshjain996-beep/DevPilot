// ============================================================================
// DevPilot — Learning Roadmap Page
// ============================================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map, Sparkles, ArrowRight, CheckCircle2, BookOpen, Filter, Search,
  Code2, Binary, Globe, Server, Brain, GraduationCap
} from 'lucide-react';
import { Card, PageHeader, ProgressBar, Badge, Button, Tabs, Accordion, Checkbox, Textarea } from '../components/ui';
import { useTrackProgress, useTopics, updateTopicStatus, updateTopicNotes } from '../hooks/useDatabase';
import { ALL_TRACKS } from '../data/roadmapData';
import { cn, statusBg } from '../utils/helpers';
import type { LearningStatus, LearningTopic } from '../types';

const TRACK_ICONS: Record<string, any> = {
  c: GraduationCap,
  python: Code2,
  'cpp-dsa': Binary,
  webdev: Globe,
  'system-design': Server,
  'ai-ml': Brain,
};

const TRACK_LINKS: Record<string, string> = {
  python: '/python',
  'cpp-dsa': '/cpp-dsa',
  webdev: '/webdev',
  'system-design': '/system-design',
  'ai-ml': '/ai-ml',
};

export default function LearningRoadmapPage() {
  const { tracks, overallPercentage } = useTrackProgress();
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // For C track detailed view on this page
  const cTopics = useTopics('c');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const filteredCTopics = cTopics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complete Learning Roadmap"
        subtitle="Your structured path from beginner to professional AI-powered software developer."
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Progress:</span>
            <Badge variant="purple" className="text-sm px-3 py-1 font-bold">
              {overallPercentage}% Completed
            </Badge>
          </div>
        }
      />

      {/* Overall Progress Banner */}
      <Card className="bg-gradient-to-r from-blue-900/30 via-violet-900/30 to-purple-900/30 border-blue-500/20">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Mastery Progress across all 6 tracks
            </span>
            <span className="text-blue-500 dark:text-blue-400 font-bold">{overallPercentage}%</span>
          </div>
          <ProgressBar value={overallPercentage} color="violet" size="lg" showPct={false} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated automatically from your real topic completions. Every topic completed moves you closer to your career goal.
          </p>
        </div>
      </Card>

      {/* Track Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tracks.map(track => {
          const Icon = TRACK_ICONS[track.id] || BookOpen;
          const link = TRACK_LINKS[track.id];

          return (
            <Card key={track.id} className="flex flex-col justify-between hover:border-blue-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{track.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {track.completed} of {track.total} topics ({track.percentage}%)
                      </p>
                    </div>
                  </div>
                  <Badge variant={track.percentage === 100 ? 'success' : track.percentage > 0 ? 'info' : 'default'}>
                    {track.percentage}%
                  </Badge>
                </div>

                <ProgressBar value={track.percentage} color={track.color} size="md" showPct={false} />

                {track.nextTopic ? (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-400 font-medium block mb-0.5">NEXT UP:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                      {track.nextTopic.order}. {track.nextTopic.title}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Track Complete!
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                {link ? (
                  <Link
                    to={link}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 group"
                  >
                    Open Track Workspace <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setSelectedTrack(track.id)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 group"
                  >
                    View C Programming Topics <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* TRACK A: C Programming Details Section (College Curriculum) */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="text-amber-500" />
              Track A: C Programming (College Academic Curriculum)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Covers your mandatory college curriculum and forms the foundation for systems programming and C++.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search C topics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="learning">Learning</option>
              <option value="practising">Practising</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCTopics.map(topic => (
            <Card key={topic.id} className="p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={topic.status === 'completed'}
                    onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">#{topic.order}</span>
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

                <div className="flex items-center gap-2">
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
                    {expandedTopicId === topic.id ? 'Close' : 'Details'}
                  </Button>
                </div>
              </div>

              {expandedTopicId === topic.id && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  {topic.exercises && topic.exercises.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Recommended Exercises:
                      </span>
                      <ul className="list-disc pl-5 space-y-0.5 text-slate-600 dark:text-slate-400">
                        {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                      </ul>
                    </div>
                  )}

                  {topic.resources && topic.resources.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Free Learning Resources:
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
                            Resource {i + 1} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      My Learning Notes:
                    </span>
                    <Textarea
                      placeholder="Write your notes, key takeaways, code snippets or college questions..."
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
    </div>
  );
}
