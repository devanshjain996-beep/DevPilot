// ============================================================================
// DevPilot — Project Management Page
// ============================================================================
import { useState } from 'react';
import {
  FolderKanban, Plus, ExternalLink, Trash2, Edit2, Calendar,
  CheckCircle2, Clock, Sparkles, Lightbulb, Tag, ArrowRight, Eye
} from 'lucide-react';
import { GithubIcon } from '../components/ui/SocialIcons';
import {
  Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Select,
  Textarea, Checkbox, StatCard, EmptyState
} from '../components/ui';
import { useProjects, addProject, updateProject, deleteProject } from '../hooks/useDatabase';
import { DEFAULT_PROJECTS } from '../data/roadmapData';
import { formatDate, statusBg, cn, todayStr } from '../utils/helpers';
import type { Project, ProjectStatus } from '../types';

export default function ProjectsPage() {
  const projects = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formLive, setFormLive] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('idea');
  const [formNotes, setFormNotes] = useState('');
  const [formLessons, setFormLessons] = useState('');
  const [formPortfolio, setFormPortfolio] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const ideasCount = projects.filter(p => p.status === 'idea').length;
  const planningCount = projects.filter(p => p.status === 'planning').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  const handleOpenAdd = (starter?: { title: string; description: string; technologies: string[] }) => {
    setEditingProject(null);
    setFormTitle(starter ? starter.title : '');
    setFormDesc(starter ? starter.description : '');
    setFormTech(starter ? starter.technologies.join(', ') : 'Python, React, TypeScript');
    setFormGithub('');
    setFormLive('');
    setFormStartDate(todayStr());
    setFormDeadline('');
    setFormStatus(starter ? 'planning' : 'idea');
    setFormNotes('');
    setFormLessons('');
    setFormPortfolio(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormTech(p.technologies.join(', '));
    setFormGithub(p.githubUrl || '');
    setFormLive(p.liveUrl || '');
    setFormStartDate(p.startDate || '');
    setFormDeadline(p.deadline || '');
    setFormStatus(p.status);
    setFormNotes(p.notes || '');
    setFormLessons(p.lessonsLearned || '');
    setFormPortfolio(p.showInPortfolio);
    setModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!formTitle.trim()) return;

    const techArray = formTech.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProject) {
      await updateProject(editingProject.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        technologies: techArray,
        githubUrl: formGithub.trim() || undefined,
        liveUrl: formLive.trim() || undefined,
        startDate: formStartDate || undefined,
        deadline: formDeadline || undefined,
        completionDate: formStatus === 'completed' ? (editingProject.completionDate || todayStr()) : undefined,
        status: formStatus,
        notes: formNotes,
        lessonsLearned: formLessons,
        showInPortfolio: formPortfolio,
      });
    } else {
      await addProject({
        title: formTitle.trim(),
        description: formDesc.trim(),
        technologies: techArray,
        githubUrl: formGithub.trim() || undefined,
        liveUrl: formLive.trim() || undefined,
        startDate: formStartDate || todayStr(),
        deadline: formDeadline || undefined,
        completionDate: formStatus === 'completed' ? todayStr() : undefined,
        status: formStatus,
        notes: formNotes,
        lessonsLearned: formLessons,
        showInPortfolio: formPortfolio,
      });
    }
    setModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* ── 3D PROJECTS FORGE CYBER PORTAL BANNER ── */}
      <div className="relative rounded-3xl p-5 sm:p-7 border border-orange-500/40 bg-gradient-to-r from-[#211107] via-[#150f1f] to-[#070b16] shadow-2xl shadow-orange-950/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-orange-950/80 text-orange-300 border border-orange-400/50 shadow-sm shadow-orange-500/20">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                DOOR 03 // PROJECT LAB & FORGE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 border border-slate-700">
                <FolderKanban size={11} className="text-orange-400" /> REAL-WORLD BUILDS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Developer Project Tracker
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
              Design, engineer, and deploy real-world full-stack and AI applications proving your production capabilities.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 hover:from-orange-300 hover:to-yellow-300 shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ideas" value={ideasCount} icon={<Lightbulb size={20} />} color="cyan" />
        <StatCard label="Planning" value={planningCount} icon={<Clock size={20} />} color="violet" />
        <StatCard label="In Progress" value={inProgressCount} icon={<FolderKanban size={20} />} color="blue" sub="Active Focus" />
        <StatCard label="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="emerald" sub="Portfolio Ready" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${projects.length})` },
            { id: 'in-progress', label: `In Progress (${inProgressCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'planning', label: `Planning (${planningCount})` },
            { id: 'idea', label: `Ideas (${ideasCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 hover:-translate-y-0.5',
                statusFilter === f.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold shadow-md shadow-orange-500/20 border border-orange-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={44} />}
          title="No projects in this category"
          description="Projects are how you prove your coding skills to employers. Pick a recommended idea below to start!"
          action={
            <Button onClick={() => handleOpenAdd()} size="sm">
              <Plus size={16} /> Create Custom Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#070b16] border border-slate-800 border-l-[6px] border-l-orange-400 hover:border-orange-400/80 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-orange-300 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={cn('px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider', statusBg(project.status))}>
                        {project.status.toUpperCase()}
                      </span>
                      {project.showInPortfolio && (
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                          <Eye size={11} /> Public Portfolio
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete project "${project.title}"?`)) {
                          await deleteProject(project.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-400 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Dates & Links */}
                <div className="pt-2.5 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-3 items-center font-medium">
                  {project.startDate && <span>Started: {formatDate(project.startDate)}</span>}
                  {project.deadline && <span>Deadline: {formatDate(project.deadline)}</span>}
                  {project.completionDate && <span className="text-emerald-400 font-bold">Done: {formatDate(project.completionDate)}</span>}
                </div>

                {/* Notes & Lessons */}
                {project.lessonsLearned && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="font-extrabold text-slate-300 block mb-0.5">Lessons Learned:</span>
                    <p className="text-slate-300 leading-relaxed">{project.lessonsLearned}</p>
                  </div>
                )}
              </div>

              {/* Links Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <GithubIcon size={13} /> Repo
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                </div>

                <select
                  value={project.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as ProjectStatus;
                    await updateProject(project.id, {
                      status: newStatus,
                      completionDate: newStatus === 'completed' ? todayStr() : undefined,
                    });
                  }}
                  className="text-xs bg-slate-100 dark:bg-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="idea">Idea</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Starter Project Ideas Section */}
      <div className="mt-8 space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-amber-400" size={18} />
            Recommended Full-Stack & AI Project Ideas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click "Start Project" to adopt any of these curriculum-recommended projects into your planner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_PROJECTS.map((item, idx) => (
            <Card key={idx} className="p-4 flex flex-col justify-between bg-slate-900/60 border-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                  Recommended Idea #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.technologies.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => handleOpenAdd(item)}
                >
                  <Plus size={14} /> Start This Project
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. AI-Powered PDF Assistant, Full-Stack Task Manager"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Description & Problem Solved"
            placeholder="What does this project do? Who is it for?"
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            rows={2}
          />

          <Input
            label="Technologies & Frameworks (comma separated)"
            placeholder="e.g. React, TypeScript, FastAPI, PostgreSQL, ChromaDB"
            value={formTech}
            onChange={e => setFormTech(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/username/repo"
              value={formGithub}
              onChange={e => setFormGithub(e.target.value)}
            />
            <Input
              label="Live Demo URL (Optional)"
              placeholder="https://myproject.vercel.app"
              value={formLive}
              onChange={e => setFormLive(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formStartDate}
              onChange={e => setFormStartDate(e.target.value)}
            />
            <Input
              label="Target Deadline"
              type="date"
              value={formDeadline}
              onChange={e => setFormDeadline(e.target.value)}
            />
            <Select
              label="Current Status"
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as ProjectStatus)}
              options={[
                { value: 'idea', label: 'Idea' },
                { value: 'planning', label: 'Planning' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>

          <Textarea
            label="Lessons Learned & Engineering Challenges"
            placeholder="What architecture decisions did you make? What was tough to debug?"
            value={formLessons}
            onChange={e => setFormLessons(e.target.value)}
            rows={2}
          />

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formPortfolio}
                onChange={e => setFormPortfolio(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Feature this project on My Public Developer Portfolio
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProject}>{editingProject ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
