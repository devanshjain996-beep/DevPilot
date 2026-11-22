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

      {/* 3D Dimensional Track Selection Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tracks.map(track => {
          const Icon = TRACK_ICONS[track.id] || BookOpen;
          const link = TRACK_LINKS[track.id];

          return (
            <Card
              key={track.id}
              className="flex flex-col justify-between hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {track.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {track.completed} of {track.total} concepts ({track.percentage}%)
                      </p>
                    </div>
                  </div>
                  <Badge variant={track.percentage === 100 ? 'success' : track.percentage > 0 ? 'purple' : 'default'}>
                    {track.percentage}%
                  </Badge>
                </div>

                <ProgressBar value={track.percentage} color={track.color || 'violet'} size="md" showPct={false} />

                {track.nextTopic ? (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5 tracking-wider">NEXT UP IN SEQUENCE:</span>
                    <span className="text-slate-200 font-semibold truncate block">
                      {track.nextTopic.order}. {track.nextTopic.title}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 size={15} /> Track Complete!
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                {link ? (
                  <Link
                    to={link}
                    className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-white px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-200 active:scale-95 group/btn"
                  >
                    <span>Enter Subject Chamber</span>
                    <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setSelectedTrack(track.id)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-white px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-200 active:scale-95 group/btn cursor-pointer"
                  >
                    <span>View Curriculum Matrix</span>
                    <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
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
