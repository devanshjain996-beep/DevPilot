// ============================================================================
// DevPilot — C++ & DSA Roadmap + DSA Problem Tracker
// ============================================================================
import { useState } from 'react';
import {
  Binary, CheckCircle2, Search, Plus, ExternalLink, Trash2, Edit2,
  Code, Sparkles, Filter, AlertCircle, BookOpen, Clock, RotateCcw
} from 'lucide-react';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Tabs, Checkbox, Textarea,
  Input, Select, Modal, StatCard, EmptyState
} from '../components/ui';
import {
  useTopics, updateTopicStatus, updateTopicNotes,
  useDSAProblems, addDSAProblem, updateDSAProblem, deleteDSAProblem
} from '../hooks/useDatabase';
import { percentage, statusBg, cn, todayStr, formatDate } from '../utils/helpers';
import type { LearningStatus, DSAProblem, Difficulty } from '../types';

export default function CppDsaPage() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tracker'>('roadmap');

  // Roadmap State
  const topics = useTopics('cpp-dsa');
  const [roadmapSearch, setRoadmapSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // DSA Tracker State
  const dsaProblems = useDSAProblems();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<DSAProblem | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterSolved, setFilterSolved] = useState<string>('all');
  const [trackerSearch, setTrackerSearch] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formTopic, setFormTopic] = useState('Arrays');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('easy');
  const [formPlatform, setFormPlatform] = useState('LeetCode');
  const [formUrl, setFormUrl] = useState('');
  const [formAttempts, setFormAttempts] = useState('1');
  const [formTimeTaken, setFormTimeTaken] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formNeedsRevision, setFormNeedsRevision] = useState(false);

  // Stats
  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const roadmapPct = percentage(completedTopics, topics.length);

  const solvedProblems = dsaProblems.filter(p => p.solved).length;
  const easySolved = dsaProblems.filter(p => p.solved && p.difficulty === 'easy').length;
  const mediumSolved = dsaProblems.filter(p => p.solved && p.difficulty === 'medium').length;
  const hardSolved = dsaProblems.filter(p => p.solved && p.difficulty === 'hard').length;

  const handleOpenAdd = () => {
    setEditingProblem(null);
    setFormName('');
    setFormTopic('Arrays');
    setFormDifficulty('easy');
    setFormPlatform('LeetCode');
    setFormUrl('');
    setFormAttempts('1');
    setFormTimeTaken('25 mins');
    setFormNotes('');
    setFormNeedsRevision(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: DSAProblem) => {
    setEditingProblem(p);
    setFormName(p.name);
    setFormTopic(p.topic);
    setFormDifficulty(p.difficulty);
    setFormPlatform(p.platform);
    setFormUrl(p.url);
    setFormAttempts(String(p.attempts));
    setFormTimeTaken(p.timeTaken || '');
    setFormNotes(p.solutionNotes);
    setFormNeedsRevision(p.needsRevision);
    setModalOpen(true);
  };

  const handleSaveProblem = async () => {
    if (!formName.trim()) return;

    if (editingProblem) {
      await updateDSAProblem(editingProblem.id, {
        name: formName,
        topic: formTopic,
        difficulty: formDifficulty,
        platform: formPlatform,
        url: formUrl,
        attempts: Number(formAttempts) || 1,
        timeTaken: formTimeTaken,
        solutionNotes: formNotes,
        needsRevision: formNeedsRevision,
      });
    } else {
      await addDSAProblem({
        name: formName,
        topic: formTopic,
        difficulty: formDifficulty,
        platform: formPlatform,
        url: formUrl,
        attemptDate: todayStr(),
        solved: true,
        attempts: Number(formAttempts) || 1,
        timeTaken: formTimeTaken,
        solutionNotes: formNotes,
        needsRevision: formNeedsRevision,
      });
    }
    setModalOpen(false);
  };

  const filteredProblems = dsaProblems.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(trackerSearch.toLowerCase()) ||
                          p.topic.toLowerCase().includes(trackerSearch.toLowerCase());
    const matchesDiff = filterDifficulty === 'all' || p.difficulty === filterDifficulty;
    const matchesPlat = filterPlatform === 'all' || p.platform.toLowerCase() === filterPlatform.toLowerCase();
    const matchesSolved = filterSolved === 'all' ||
                          (filterSolved === 'solved' ? p.solved : !p.solved);
    return matchesSearch && matchesDiff && matchesPlat && matchesSolved;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D C++ & DSA CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-violet-500/40 bg-gradient-to-r from-[#170a2c] via-[#0f1128] to-[#070b16] shadow-2xl shadow-violet-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-violet-950/80 text-violet-300 border border-violet-400/50 shadow-sm shadow-violet-500/20">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                PORTAL 02.2 // C++ & DSA CHAMBER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <Binary size={11} className="text-violet-400" /> ALGORITHMIC FOUNDATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              C++ & Data Structures & Algorithms
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Master core C++, algorithmic problem solving, time complexities, and tackle LeetCode/GFG coding interviews.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95',
                activeTab === 'roadmap'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700'
              )}
            >
              <BookOpen size={15} /> Roadmap ({roadmapPct}%)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95',
                activeTab === 'tracker'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700'
              )}
            >
              <Code size={15} /> Problem Tracker ({solvedProblems})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'roadmap' ? (
        <div className="space-y-6">
          {/* Roadmap Header Card */}
          <Card className="bg-slate-900 border-violet-500/30 p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-200 flex items-center gap-2">
                  <Binary className="text-violet-400" size={18} />
                  C++ & DSA Curriculum: {completedTopics} / {topics.length} concepts mastered
                </span>
                <span className="text-violet-400 font-bold">{roadmapPct}%</span>
              </div>
              <ProgressBar value={roadmapPct} color="violet" size="md" showPct={false} />
            </div>
          </Card>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search C++ or DSA topics..."
                value={roadmapSearch}
                onChange={e => setRoadmapSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Sections</option>
              <option value="C++ Fundamentals">C++ Fundamentals (1-19)</option>
              <option value="DSA">Data Structures & Algorithms (20-39)</option>
            </select>
          </div>

          {/* Topics List grouped by section */}
          {['C++ Fundamentals', 'DSA'].map(sec => {
            const secTopics = topics.filter(t =>
              (sectionFilter === 'all' || sectionFilter === sec) &&
              t.section === sec &&
              (t.title.toLowerCase().includes(roadmapSearch.toLowerCase()) ||
               t.description.toLowerCase().includes(roadmapSearch.toLowerCase()))
            );
            if (secTopics.length === 0) return null;

            const secDone = secTopics.filter(t => t.status === 'completed').length;
            const secPct = percentage(secDone, secTopics.length);

            return (
              <div key={sec} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Binary size={18} className="text-violet-400" />
                    {sec}
                  </h3>
                  <Badge variant="purple">
                    {secDone} / {secTopics.length} done ({secPct}%)
                  </Badge>
                </div>

                <div className="space-y-2">
                  {secTopics.map(topic => (
                    <div key={topic.id} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 via-[#0d1424] to-[#070b16] border border-slate-800 border-l-[5px] border-l-violet-400 shadow-md hover:border-violet-500/50 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          <Checkbox
                            checked={topic.status === 'completed'}
                            onChange={checked => updateTopicStatus(topic.id, checked ? 'completed' : 'not-started')}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-mono font-bold text-violet-300 bg-violet-950/70 border border-violet-500/40 px-2 py-0.5 rounded-lg">#{topic.order}</span>
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
                            {expandedTopicId === topic.id ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {expandedTopicId === topic.id && (
                        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs">
                          {topic.exercises && topic.exercises.length > 0 && (
                            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                              <span className="font-extrabold text-violet-300 block mb-1.5 text-xs uppercase tracking-wider">
                                Problem Sets & Exercises:
                              </span>
                              <ul className="list-disc pl-5 space-y-1.5 text-slate-200 font-medium">
                                {topic.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                              </ul>
                            </div>
                          )}

                          <div>
                            <span className="font-bold text-slate-200 block mb-1">
                              Notes & Key Algorithm Patterns:
                            </span>
                            <Textarea
                              placeholder="Add time/space complexity notes, patterns (e.g. sliding window, two pointers)..."
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
      ) : (
        /* ── DSA Problem Tracker Tab ── */
        <div className="space-y-6">
          {/* Tracker Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Solved" value={solvedProblems} icon={<CheckCircle2 size={20} />} color="emerald" sub="Across all platforms" />
            <StatCard label="Easy Problems" value={easySolved} icon={<Code size={20} />} color="cyan" />
            <StatCard label="Medium Problems" value={mediumSolved} icon={<Sparkles size={20} />} color="amber" />
            <StatCard label="Hard Problems" value={hardSolved} icon={<AlertCircle size={20} />} color="rose" />
          </div>

          {/* Tracker Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-md">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search problem name or topic..."
                value={trackerSearch}
                onChange={e => setTrackerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <select
                value={filterDifficulty}
                onChange={e => setFilterDifficulty(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={filterPlatform}
                onChange={e => setFilterPlatform(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Platforms</option>
                <option value="leetcode">LeetCode</option>
                <option value="geeksforgeeks">GeeksforGeeks</option>
                <option value="codeforces">Codeforces</option>
              </select>

              <select
                value={filterSolved}
                onChange={e => setFilterSolved(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>

              <Button onClick={handleOpenAdd} size="sm" className="ml-auto sm:ml-0">
                <Plus size={16} /> Log DSA Problem
              </Button>
            </div>
          </div>

          {/* Problem List */}
          {filteredProblems.length === 0 ? (
            <EmptyState
              icon={<Code size={40} />}
              title="No DSA problems logged yet"
              description="Start solving on LeetCode, GeeksforGeeks or Codeforces and log your progress here with complexity notes!"
              action={
                <Button onClick={handleOpenAdd} size="sm">
                  <Plus size={16} /> Log Your First Problem
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredProblems.map(p => (
                <Card key={p.id} className="p-4 hover:border-violet-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={p.solved}
                        onChange={async (checked) => {
                          await updateDSAProblem(p.id, { solved: checked });
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            'text-base font-extrabold truncate tracking-tight',
                            p.solved ? 'text-emerald-400' : 'text-white'
                          )}>
                            {p.name}
                          </h4>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <Badge
                            variant={p.difficulty === 'easy' ? 'success' : p.difficulty === 'medium' ? 'warning' : 'danger'}
                          >
                            {p.difficulty.toUpperCase()}
                          </Badge>
                          <Badge variant="purple">{p.platform}</Badge>
                          <Badge variant="default">{p.topic}</Badge>
                          {p.needsRevision && (
                            <Badge variant="danger" className="flex items-center gap-1">
                              <RotateCcw size={10} /> Needs Revision
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-300 font-medium mt-1.5">
                          {p.attemptDate && <span>Attempted: <strong className="text-white">{formatDate(p.attemptDate)}</strong></span>}
                          {p.timeTaken && <span>Time: <strong className="text-white">{p.timeTaken}</strong></span>}
                          <span>Attempts: <strong className="text-white">{p.attempts}</strong></span>
                        </div>

                        {p.solutionNotes && (
                          <div className="mt-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-slate-200 font-mono leading-relaxed">
                            {p.solutionNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(p)}
                        className="text-xs p-1.5"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (confirm(`Delete "${p.name}"?`)) {
                            await deleteDSAProblem(p.id);
                          }
                        }}
                        className="text-xs p-1.5 text-red-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Add / Edit Modal */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingProblem ? 'Edit DSA Problem' : 'Log New DSA Problem'}
            size="md"
          >
            <div className="space-y-4">
              <Input
                label="Problem Name"
                placeholder="e.g. Two Sum, Valid Parentheses, Longest Substring"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Topic"
                  value={formTopic}
                  onChange={e => setFormTopic(e.target.value)}
                  options={[
                    { value: 'Arrays', label: 'Arrays' },
                    { value: 'Strings', label: 'Strings' },
                    { value: 'Searching', label: 'Searching / Binary Search' },
                    { value: 'Sorting', label: 'Sorting' },
                    { value: 'Two Pointers', label: 'Two Pointers' },
                    { value: 'Sliding Window', label: 'Sliding Window' },
                    { value: 'Recursion & Backtracking', label: 'Recursion & Backtracking' },
                    { value: 'Linked Lists', label: 'Linked Lists' },
                    { value: 'Stacks & Queues', label: 'Stacks & Queues' },
                    { value: 'Hashing', label: 'Hashing' },
                    { value: 'Trees & BST', label: 'Trees & BST' },
                    { value: 'Heaps', label: 'Heaps' },
                    { value: 'Graphs', label: 'Graphs' },
                    { value: 'Dynamic Programming', label: 'Dynamic Programming' },
                    { value: 'Tries', label: 'Tries' },
                  ]}
                />

                <Select
                  label="Difficulty"
                  value={formDifficulty}
                  onChange={e => setFormDifficulty(e.target.value as Difficulty)}
                  options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Platform"
                  value={formPlatform}
                  onChange={e => setFormPlatform(e.target.value)}
                  options={[
                    { value: 'LeetCode', label: 'LeetCode' },
                    { value: 'GeeksforGeeks', label: 'GeeksforGeeks' },
                    { value: 'Codeforces', label: 'Codeforces' },
                    { value: 'HackerRank', label: 'HackerRank' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />

                <Input
                  label="Time Taken"
                  placeholder="e.g. 20 mins, 45 mins"
                  value={formTimeTaken}
                  onChange={e => setFormTimeTaken(e.target.value)}
                />
              </div>

              <Input
                label="Problem URL"
                placeholder="https://leetcode.com/problems/..."
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Number of Attempts"
                  type="number"
                  value={formAttempts}
                  onChange={e => setFormAttempts(e.target.value)}
                />

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formNeedsRevision}
                      onChange={e => setFormNeedsRevision(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Mark for Revision
                  </label>
                </div>
              </div>

              <Textarea
                label="Solution Approach / Complexity Notes"
                placeholder="e.g. Hash map approach O(N) time O(N) space. Kept running into off-by-one edge cases on empty arrays."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={3}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProblem}>{editingProblem ? 'Save Changes' : 'Log Problem'}</Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
