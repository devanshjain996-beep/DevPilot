// ============================================================================
// DevPilot — Weekly Review & ChatGPT Progress-Sharing Page
// ============================================================================
import { useState, useMemo } from 'react';
import {
  CalendarCheck, Copy, Download, Share2, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, Brain, Clock, Code2, Binary, Globe, Server,
  GraduationCap, FolderKanban, Check, Save
} from 'lucide-react';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Textarea, StatCard, Modal
} from '../components/ui';
import {
  useAllTopics, useDSAProblems, useProjects, useSubjects, useTasks,
  useStudyLogs, useWeeklyReviews
} from '../hooks/useDatabase';
import { useProfile } from '../store/useStore';
import {
  todayStr, formatDate, copyToClipboard, exportMarkdown, exportData, weekRange, cn
} from '../utils/helpers';
import { db } from '../store/db';

export default function WeeklyReviewPage() {
  const { profile } = useProfile();
  const allTopics = useAllTopics();
  const dsaProblems = useDSAProblems();
  const projects = useProjects();
  const subjects = useSubjects();
  const tasks = useTasks();
  const studyLogs = useStudyLogs();

  const { start: weekStart, end: weekEnd } = weekRange();

  // Weekly Review State
  const [difficulties, setDifficulties] = useState('');
  const [achievements, setAchievements] = useState('');
  const [nextWeekPlan, setNextWeekPlan] = useState('');
  const [chatgptFeedback, setChatgptFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedReview, setSavedReview] = useState(false);

  // Computed metrics
  const pythonDone = allTopics.filter(t => t.trackId === 'python' && t.status === 'completed').length;
  const pythonTotal = allTopics.filter(t => t.trackId === 'python').length;

  const dsaSolved = dsaProblems.filter(p => p.solved).length;
  const dsaTotal = dsaProblems.length;

  const webdevDone = allTopics.filter(t => t.trackId === 'webdev' && t.status === 'completed').length;
  const webdevTotal = allTopics.filter(t => t.trackId === 'webdev').length;

  const sysDesignDone = allTopics.filter(t => t.trackId === 'system-design' && t.status === 'completed').length;
  const sysDesignTotal = allTopics.filter(t => t.trackId === 'system-design').length;

  const aimlDone = allTopics.filter(t => t.trackId === 'ai-ml' && t.status === 'completed').length;
  const aimlTotal = allTopics.filter(t => t.trackId === 'ai-ml').length;

  const cDone = allTopics.filter(t => t.trackId === 'c' && t.status === 'completed').length;
  const cTotal = allTopics.filter(t => t.trackId === 'c').length;

  // Active / in-progress projects
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'completed');
  const missedTasks = tasks.filter(t => t.status === 'skipped');

  // Study hours this week (default ~15-20h estimated from timetable/logs)
  const loggedHours = studyLogs.reduce((sum, l) => sum + (l.hours || 0), 0);
  const estimatedHours = loggedHours > 0 ? loggedHours : 18;

  // Auto-generate suggested priorities for next week based on next uncompleted topics
  const suggestedPriorities = useMemo(() => {
    const list: string[] = [];
    const nextPy = allTopics.find(t => t.trackId === 'python' && t.status !== 'completed');
    if (nextPy) list.push(`Python: Master "${nextPy.title}" (${nextPy.section})`);

    const nextDsa = allTopics.find(t => t.trackId === 'cpp-dsa' && t.status !== 'completed');
    if (nextDsa) list.push(`C++ & DSA: Study "${nextDsa.title}" & solve 3 related LeetCode problems`);

    const nextWeb = allTopics.find(t => t.trackId === 'webdev' && t.status !== 'completed');
    if (nextWeb) list.push(`Web Dev: Practice "${nextWeb.title}" (${nextWeb.section})`);

    const nextSys = allTopics.find(t => t.trackId === 'system-design' && t.status !== 'completed');
    if (nextSys) list.push(`System Design: Blueprint "${nextSys.title}"`);

    const pendingAssignment = subjects.flatMap(s => s.assignments || []).find(a => !a.completed);
    if (pendingAssignment) list.push(`College Priority: Complete "${pendingAssignment.title}"`);

    return list;
  }, [allTopics, subjects]);

  // Construct structured Markdown report for ChatGPT
  const chatGptReport = useMemo(() => {
    return `# DevPilot Weekly Engineering Progress Report
**Student Developer:** ${profile.name}
**Career Goal:** ${profile.careerGoal}
**Reporting Week:** ${weekStart} to ${weekEnd}
**Generated At:** ${new Date().toLocaleString()}

---

## 1. Study Hours & Daily Timetable
- **Weekly Study Hours Completed:** ${estimatedHours} hours
- **Daily Routine:** Followed personal timetable with dedicated study & break blocks

## 2. Technical Curriculum Progress
- **Python Mastery:** ${pythonDone} / ${pythonTotal} topics completed (${Math.round((pythonDone/pythonTotal)*100)}%)
- **C++ & DSA Practice:** ${dsaSolved} problems solved out of ${dsaTotal} attempted
- **Web Development (Frontend & Backend):** ${webdevDone} / ${webdevTotal} topics completed
- **System Design & Architecture:** ${sysDesignDone} / ${sysDesignTotal} topics completed
- **AI/ML Application Development:** ${aimlDone} / ${aimlTotal} topics completed
- **College C Programming Track:** ${cDone} / ${cTotal} topics completed

## 3. Real Projects Under Development
${activeProjects.length > 0 ? activeProjects.map(p => `- **${p.title}** [Status: ${p.status.toUpperCase()}]: ${p.description} (Tech: ${p.technologies.join(', ')})`).join('\n') : '- No active projects this week.'}

## 4. College Academics & Commitments
- **Enrolled Subjects:** ${subjects.map(s => s.name).join(', ') || 'C Programming, Engineering Mathematics'}
- **Assignments Pending:** ${subjects.flatMap(s => s.assignments || []).filter(a => !a.completed).length} items

## 5. Missed Tasks or Backlog
${missedTasks.length > 0 ? missedTasks.map(t => `- [Skipped] ${t.title} (${t.category})`).join('\n') : '- Zero skipped critical tasks.'}

## 6. Biggest Difficulties & Blockers
${difficulties || '- Balancing college practical exams with evening C++ pointer/tree recursion practice.'}

## 7. Weekly Wins & Achievements
${achievements || '- Completed foundational syntax and solved first batch of array manipulation problems.'}

## 8. Suggested Priorities for Next Week
${suggestedPriorities.map(p => `- ${p}`).join('\n')}

---
*Prompt for ChatGPT: "Please review my weekly progress as a beginner programmer aiming to become an AI-powered software developer. Give me constructive feedback on my pace, advice on resolving my blockers, and suggest optimization for next week\'s timetable."*
`;
  }, [profile, weekStart, weekEnd, estimatedHours, pythonDone, pythonTotal, dsaSolved, dsaTotal, webdevDone, webdevTotal, sysDesignDone, sysDesignTotal, aimlDone, aimlTotal, cDone, cTotal, activeProjects, subjects, missedTasks, difficulties, achievements, suggestedPriorities]);

  const handleCopyReport = async () => {
    await copyToClipboard(chatGptReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveReview = async () => {
    await db.weeklyReviews.add({
      id: `${weekStart}-${Date.now()}`,
      weekStart,
      weekEnd,
      studyHours: estimatedHours,
      pythonTopics: pythonDone,
      dsaProblems: dsaSolved,
      webdevProgress: `${webdevDone}/${webdevTotal}`,
      systemDesignTopics: sysDesignDone,
      aimlProgress: `${aimlDone}/${aimlTotal}`,
      academicProgress: `${cDone}/${cTotal}`,
      projectsWorkedOn: activeProjects.map(p => p.title).join(', '),
      missedTasks: missedTasks.map(t => t.title).join(', '),
      difficulties,
      achievements,
      nextWeekPlan,
      chatgptFeedback,
      createdAt: todayStr(),
    });
    setSavedReview(true);
    setTimeout(() => setSavedReview(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* ── 3D WEEKLY REVIEW CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-cyan-500/30 bg-gradient-to-r from-[#0b1429] via-[#0d1c3a] to-[#080e1e] shadow-2xl shadow-cyan-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                DOOR 01.3 // WEEKLY REVIEW & TELEMETRY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <CalendarCheck size={11} className="text-cyan-400" /> SUNDAY AUDIT ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Weekly Engineering Review
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Reflect on weekly milestones, audit multi-track curriculum metrics, and synthesize your progress report for AI mentorship.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/40 shadow-inner">
              Week: {formatDate(weekStart)} – {formatDate(weekEnd)}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Estimated Study Hours" value={`${estimatedHours}h`} icon={<Clock size={20} />} color="blue" sub="Planned vs logged" />
        <StatCard label="Python Topics Done" value={`${pythonDone}/${pythonTotal}`} icon={<Code2 size={20} />} color="emerald" />
        <StatCard label="DSA Problems Solved" value={dsaSolved} icon={<Binary size={20} />} color="violet" sub="LeetCode / GFG" />
        <StatCard label="Active Projects" value={activeProjects.length} icon={<FolderKanban size={20} />} color="cyan" />
      </div>

      {/* Curriculum Snapshot Table */}
      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" size={18} />
          Current Multi-Track Learning Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-emerald-300 block mb-1">Python Mastery</span>
            <ProgressBar value={pythonDone} max={pythonTotal} color="emerald" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{pythonDone} of {pythonTotal} topics completed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-violet-300 block mb-1">C++ & Algorithms</span>
            <ProgressBar value={dsaSolved} max={Math.max(dsaTotal, 1)} color="violet" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{dsaSolved} problems solved</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-cyan-300 block mb-1">Web Development</span>
            <ProgressBar value={webdevDone} max={webdevTotal} color="cyan" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{webdevDone} of {webdevTotal} topics completed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-amber-300 block mb-1">System Design</span>
            <ProgressBar value={sysDesignDone} max={sysDesignTotal} color="amber" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{sysDesignDone} of {sysDesignTotal} concepts completed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-rose-300 block mb-1">AI/ML Development</span>
            <ProgressBar value={aimlDone} max={aimlTotal} color="rose" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{aimlDone} of {aimlTotal} topics completed</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-bold text-blue-300 block mb-1">College C Programming</span>
            <ProgressBar value={cDone} max={cTotal} color="blue" size="sm" />
            <span className="text-slate-300 font-medium mt-1.5 block">{cDone} of {cTotal} syllabus items completed</span>
          </div>
        </div>
      </Card>

      {/* SECTION 14: SHARE MY PROGRESS WITH CHATGPT FEATURE */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-indigo-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={20} />
              <h3 className="text-lg font-bold text-white">Share My Progress with ChatGPT</h3>
            </div>
            <p className="text-xs text-slate-300">
              Export your structured weekly engineering progress report to receive personalized advice, code review, and learning optimizations from ChatGPT.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopyReport}
              size="sm"
              className={cn('text-xs', copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700')}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Report'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportMarkdown(chatGptReport, `DevPilot_Progress_${weekStart}.md`)}
              className="text-xs"
            >
              <Download size={14} /> Export Markdown
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportData({
                reportingWeek: { weekStart, weekEnd },
                profile,
                python: { completed: pythonDone, total: pythonTotal },
                dsa: { solved: dsaSolved, total: dsaTotal },
                webdev: { completed: webdevDone, total: webdevTotal },
                systemDesign: { completed: sysDesignDone, total: sysDesignTotal },
                aiml: { completed: aimlDone, total: aimlTotal },
                projects: activeProjects,
                difficulties,
                suggestedPriorities,
              }, `DevPilot_Progress_${weekStart}.json`)}
              className="text-xs"
            >
              <Download size={14} /> Export JSON
            </Button>
          </div>
        </div>

        {/* Security / Privacy Disclaimer as explicitly mandated by Section 14 */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacy & Data Control:</strong> ChatGPT cannot automatically access your computer, local files, or DevPilot command center account. Data is exported only when you choose to copy or download it.
          </p>
        </div>

        {/* Preview of Report */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Generated Structured Report Preview (Ready to Paste):
          </span>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
            {chatGptReport}
          </pre>
        </div>

        {/* Field to Paste ChatGPT Feedback */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-indigo-300 block">
            Optional: Paste ChatGPT's Feedback & Recommendations Below
          </span>
          <Textarea
            placeholder="Paste recommendations from ChatGPT here (e.g., suggested focus areas, study optimizations, explanations of tricky concepts)..."
            value={chatgptFeedback}
            onChange={e => setChatgptFeedback(e.target.value)}
            rows={3}
            className="text-xs font-mono"
          />
        </div>
      </Card>

      {/* Editable Reflections & Next Week Planner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 space-y-4 bg-slate-900/90 border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            Difficulties & Engineering Blockers
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            What was the hardest concept this week? What caused errors or took longer than expected?
          </p>
          <Textarea
            placeholder="e.g. Struggled with C++ pointer dereferencing in dynamic arrays, or CSS Grid layout alignment..."
            value={difficulties}
            onChange={e => setDifficulties(e.target.value)}
            rows={4}
            className="text-xs"
          />
        </Card>

        <Card className="p-5 space-y-4 bg-slate-900/90 border-slate-800">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={18} />
            Weekly Wins & Milestones
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            Celebrate tangible progress. What did you successfully build or solve this week?
          </p>
          <Textarea
            placeholder="e.g. Solved 5 LeetCode array problems on my own, wrote clean functions in Python, completed college lab 1..."
            value={achievements}
            onChange={e => setAchievements(e.target.value)}
            rows={4}
            className="text-xs"
          />
        </Card>
      </div>

      {/* Next Week Plan & Auto-priorities */}
      <Card className="p-5 space-y-4 bg-slate-900/90 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CalendarCheck className="text-blue-400" size={18} />
              Next Week Execution Plan
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Generated suggestions based on your unfinished curriculum topics and scheduled college dates.
            </p>
          </div>
          <Button onClick={handleSaveReview} size="sm" className="text-xs">
            <Save size={14} />
            {savedReview ? 'Review Saved!' : 'Save Weekly Review'}
          </Button>
        </div>

        {/* Suggested Priorities */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
            Algorithm-Generated Next Steps:
          </span>
          <div className="space-y-1.5">
            {suggestedPriorities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <ArrowRight size={13} className="text-blue-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Custom Weekly Goals & Adjustments:
          </span>
          <Textarea
            placeholder="Enter your personal commitments for next week (e.g. Finish Python OOP, prepare for Friday Math exam)..."
            value={nextWeekPlan}
            onChange={e => setNextWeekPlan(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </div>
      </Card>
    </div>
  );
}
