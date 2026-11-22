// ============================================================================
// DevPilot — My Public Developer Portfolio Page
// ============================================================================
import { useState } from 'react';
import {
  Briefcase, Mail, ExternalLink, Code2, Sparkles,
  Award, CheckCircle2, AlertCircle, Edit2, Eye, EyeOff, Terminal, Rocket
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/ui/SocialIcons';
import { Card, PageHeader, ProgressBar, Badge, Button, Modal, Input, Textarea } from '../components/ui';
import { useProfile } from '../store/useStore';
import { useProjects } from '../hooks/useDatabase';
import { useTrackProgress } from '../hooks/useDatabase';
import { formatDate } from '../utils/helpers';

export default function PortfolioPage() {
  const { profile, setProfile } = useProfile();
  const projects = useProjects();
  const { tracks, overallPercentage } = useTrackProgress();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState(profile.name || 'Developer');
  const [bio, setBio] = useState(profile.bio || '');
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal || '');
  const [college, setCollege] = useState(profile.college || '');
  const [github, setGithub] = useState(profile.github || '');
  const [linkedin, setLinkedin] = useState(profile.linkedin || '');
  const [email, setEmail] = useState(profile.email || '');

  // Filter projects explicitly marked to show in portfolio
  const featuredProjects = projects.filter(p => p.showInPortfolio);

  const handleSaveProfile = () => {
    setProfile(prev => ({
      ...prev,
      name,
      bio,
      careerGoal,
      college,
      github,
      linkedin,
      email,
    }));
    setEditModalOpen(false);
  };

  const isPlaceholder = bio.includes('[Your bio here') || !profile.college;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Portfolio Header / Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Briefcase className="text-amber-400" />
            Developer Identity Chamber
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            An authentic, verified developer portfolio reflecting genuine curriculum mastery and real production builds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setProfile(p => ({ ...p, portfolioVisible: !p.portfolioVisible }))}
          >
            {profile.portfolioVisible ? <><Eye size={15} className="text-emerald-400" /> Public View Active</> : <><EyeOff size={15} /> Private Draft</>}
          </Button>
          <Button size="sm" onClick={() => setEditModalOpen(true)}>
            <Edit2 size={15} /> Edit Profile Info
          </Button>
        </div>
      </div>

      {/* Notice on Placeholder Content */}
      {isPlaceholder && (
        <Card className="bg-amber-950/20 border-amber-500/40 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-300">Notice: Customizable Profile Attributes</span>
              <p className="text-slate-300 leading-relaxed">
                Text in brackets <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200 font-mono">[like this]</code> is temporary placeholder text. Click <strong>Edit Profile Info</strong> above to customize with your genuine background. DevPilot never fabricates qualifications.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Profile Hero Card */}
      <Card className="p-8 bg-gradient-to-br from-amber-950/25 via-slate-900/90 to-[#070b14] border-amber-500/30 text-white relative overflow-hidden shadow-2xl shadow-amber-500/5">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Aspiring AI-Powered Software Developer
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">{profile.name}</h2>
              {profile.college && (
                <p className="text-sm text-slate-400 mt-1">Student at {profile.college}</p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <GithubIcon size={18} />
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <LinkedinIcon size={18} />
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {profile.bio || '[Your bio here - tell the world about yourself, your learning journey, and what drives you to build software.]'}
          </p>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 max-w-2xl shadow-xs">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">
              North Star Career Goal:
            </span>
            <p className="text-xs font-medium text-slate-200">
              {profile.careerGoal}
            </p>
          </div>
        </div>
      </Card>

      {/* Verified Real Learning Track Skills */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="text-emerald-500" />
            Verified Curriculum Progress & Technical Skills
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Skills are mathematically calculated from your completed topics in the DevPilot command center.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tracks.map(track => (
            <Card key={track.id} className="p-4 bg-slate-900 border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white">{track.name}</span>
                <span className="text-xs font-bold text-blue-400">{track.percentage}%</span>
              </div>
              <ProgressBar value={track.percentage} color={track.color} size="sm" showPct={false} />
              <p className="text-[11px] text-slate-400">
                {track.completed} of {track.total} verified concepts mastered
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Rocket className="text-cyan-500" />
            Featured Software & AI Projects
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real projects built with modern frameworks and AI technologies.
          </p>
        </div>

        {featuredProjects.length === 0 ? (
          <Card className="p-6 text-center text-slate-500 text-sm">
            No projects featured yet. Go to the <strong>Projects</strong> tab and check "Feature this project on My Public Developer Portfolio".
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredProjects.map(p => (
              <Card key={p.id} className="p-5 flex flex-col justify-between bg-slate-900 border-slate-800">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-base font-bold text-white">{p.title}</h4>
                    <Badge variant={p.status === 'completed' ? 'success' : 'info'}>
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.technologies.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.lessonsLearned && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                      " {p.lessonsLearned} "
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <GithubIcon size={13} /> Source Code
                    </a>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={13} /> Live Application
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Portfolio Profile Details"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            label="College / University"
            placeholder="e.g. State Engineering College, Computer Science & Engineering"
            value={college}
            onChange={e => setCollege(e.target.value)}
          />

          <Textarea
            label="Bio / Summary"
            placeholder="A short introduction about who you are, what you are passionate about, and what you build..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
          />

          <Input
            label="Career Ambition"
            value={careerGoal}
            onChange={e => setCareerGoal(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/yourusername"
              value={github}
              onChange={e => setGithub(e.target.value)}
            />
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/yourusername"
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
            />
          </div>

          <Input
            label="Contact Email"
            type="email"
            placeholder="youremail@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
