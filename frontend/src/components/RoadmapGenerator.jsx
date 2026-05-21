import { useState, useRef, useEffect } from 'react';
import {
  Map, Target, Loader2, CheckCircle2, ChevronDown,
  Download, Sparkles, Clock, TrendingUp, BookOpen, Flag
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// ── Role suggestions ─────────────────────────────────────────────────────────
const ROLE_SUGGESTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
  'Data Scientist', 'Data Analyst', 'ML Engineer', 'AI Engineer',
  'DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer',
  'Product Manager', 'Product Designer', 'UX Designer', 'UI Designer',
  'Mobile Developer', 'iOS Developer', 'Android Developer',
  'QA Engineer', 'Security Engineer', 'Blockchain Developer',
  'Tech Lead', 'Engineering Manager', 'CTO',
  'Fresher / Student', 'Junior Developer', 'Intern',
];

// ── Autocomplete input ───────────────────────────────────────────────────────
function RoleInput({ label, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const matches = value.length > 0
    ? ROLE_SUGGESTIONS.filter(r => r.toLowerCase().includes(value.toLowerCase()) && r.toLowerCase() !== value.toLowerCase())
    : [];

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-white/70 text-xs font-medium mb-1.5">{label} *</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-gray-900 border border-white/20 rounded-lg shadow-xl max-h-44 overflow-y-auto">
          {matches.slice(0, 8).map(r => (
            <li key={r}>
              <button
                type="button"
                onMouseDown={() => { onChange(r); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >{r}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Sample roadmap (blurred preview) ────────────────────────────────────────
const SAMPLE_PHASES = [
  { phase: 1, title: 'Foundation', duration: '3 months', goal: 'Master core concepts', color: 'from-blue-500 to-cyan-500' },
  { phase: 2, title: 'Build Projects', duration: '4 months', goal: 'Create portfolio pieces', color: 'from-purple-500 to-pink-500' },
  { phase: 3, title: 'Apply & Network', duration: '3 months', goal: 'Land your target role', color: 'from-orange-500 to-red-500' },
];

function SamplePreview() {
  return (
    <div className="relative mt-5 rounded-xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900/95 z-10 flex flex-col items-center justify-end pb-6">
        <Sparkles className="w-5 h-5 text-blue-400 mb-2" />
        <p className="text-white font-semibold text-sm">Your roadmap will appear here</p>
        <p className="text-white/50 text-xs mt-1">Fill in the form above and click Generate</p>
      </div>
      <div className="p-5 blur-sm pointer-events-none select-none">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-4">Sample Roadmap Preview</p>
        <div className="space-y-3">
          {SAMPLE_PHASES.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {p.phase}
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{p.title}</span>
                  <span className="text-white/40 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration}</span>
                </div>
                <p className="text-white/50 text-xs mt-0.5">{p.goal}</p>
              </div>
              {i < SAMPLE_PHASES.length - 1 && (
                <div className="absolute left-[2.1rem] mt-9 w-0.5 h-3 bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Phase card ───────────────────────────────────────────────────────────────
const PHASE_COLORS = [
  { ring: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-500/10 border-blue-500/20',    text: 'text-blue-300' },
  { ring: 'from-purple-500 to-pink-500',  bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-300' },
  { ring: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-300' },
  { ring: 'from-green-500 to-emerald-500',bg: 'bg-green-500/10 border-green-500/20',   text: 'text-green-300' },
  { ring: 'from-red-500 to-pink-500',     bg: 'bg-red-500/10 border-red-500/20',       text: 'text-red-300' },
];

function PhaseCard({ phase, index, total }) {
  const [open, setOpen] = useState(index === 0);
  const c = PHASE_COLORS[index % PHASE_COLORS.length];
  const isLast = index === total - 1;

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.ring} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
          {isLast ? <Flag className="w-4 h-4" /> : phase.phase}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-white/10 mt-1 min-h-[2rem]" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 rounded-xl border ${c.bg} overflow-hidden`}>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>Phase {phase.phase}</span>
              <span className="flex items-center gap-1 text-white/40 text-xs"><Clock className="w-3 h-3" />{phase.duration}</span>
            </div>
            <p className="text-white font-semibold text-sm mt-0.5">{phase.title}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
            <p className="text-white/70 text-sm">{phase.goal}</p>

            {phase.skills?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5">Skills to learn</p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.skills.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/10 border border-white/15 rounded-full text-white/70">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {phase.actions?.length > 0 && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5">Action items</p>
                <ul className="space-y-1.5">
                  {phase.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.text}`} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase.milestone && (
              <div className={`rounded-lg px-3 py-2 ${c.bg} border`}>
                <p className="text-xs font-semibold text-white/60 mb-0.5">Milestone</p>
                <p className={`text-sm font-medium ${c.text}`}>{phase.milestone}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PDF export ───────────────────────────────────────────────────────────────
function exportPDF(roadmap, formData) {
  const r = roadmap.recommendedResources;
  const resourceLines = r ? [
    r.platforms?.length  ? `  Platforms: ${r.platforms.join(', ')}`  : '',
    r.books?.length      ? `  Books: ${r.books.join(', ')}`           : '',
    r.youtube?.length    ? `  YouTube: ${r.youtube.join(', ')}`       : '',
    r.practice?.length   ? `  Practice: ${r.practice.join(', ')}`     : '',
  ].filter(Boolean) : (Array.isArray(roadmap.resources) ? roadmap.resources.map(x => `  • ${x}`) : []);

  const lines = [
    `CAREER ROADMAP`,
    `${formData.currentRole} → ${formData.targetRole}`,
    `Total Duration: ${roadmap.totalDuration}`,
    '',
    ...(roadmap.phases ?? []).flatMap(p => [
      `PHASE ${p.phase}: ${p.title} (${p.duration})`,
      `Goal: ${p.goal}`,
      `Skills: ${Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '—'}`,
      `Actions:`,
      ...(Array.isArray(p.actions) ? p.actions : []).map(a => `  • ${a}`),
      `Milestone: ${p.milestone || '—'}`,
      '',
    ]),
    `RESOURCES:`,
    ...resourceLines,
    '',
    roadmap.salaryGrowth ? `SALARY GROWTH: ${roadmap.salaryGrowth}` : '',
  ].join('\n');

  const blob = new Blob([lines], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `career-roadmap-${formData.targetRole.replace(/\s+/g, '-').toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────────────────────
function RoadmapGenerator() {
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    experience: '',
    skills: '',
  });
  const [roadmap, setRoadmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill skills from resume analysis stored in sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('resumeSkills');
      if (saved && !formData.skills) {
        setFormData(f => ({ ...f, skills: saved }));
      }
    } catch { /* ignore */ }
  }, []);

  const update = (field, val) => setFormData(f => ({ ...f, [field]: val }));

  const generate = async () => {
    if (!formData.currentRole || !formData.targetRole) return;
    setIsGenerating(true); setError(''); setRoadmap(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate-roadmap`, formData);
      setRoadmap(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate roadmap. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = formData.currentRole.trim() && formData.targetRole.trim();

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-gray-900/50 via-purple-900/20 to-blue-900/30">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Form card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Career Roadmap Generator</h2>
              <p className="text-white/50 text-xs">Personalized step-by-step path to your dream role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <RoleInput label="Current Role" value={formData.currentRole} onChange={v => update('currentRole', v)} placeholder="e.g., Junior Developer" />
            <RoleInput label="Target Role"  value={formData.targetRole}  onChange={v => update('targetRole', v)}  placeholder="e.g., Senior Engineer" />

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5">Years of Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={e => update('experience', e.target.value)}
                placeholder="e.g., 2 years"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5">
                Current Skills
                {sessionStorage.getItem('resumeSkills') && (
                  <span className="ml-2 text-blue-400 text-xs">· auto-filled from resume</span>
                )}
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={e => update('skills', e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3">{error}</p>}

          <button
            onClick={generate}
            disabled={isGenerating || !canGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
          >
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Roadmap...</>
              : <><Target className="w-4 h-4" /> Generate Career Roadmap</>
            }
          </button>

          {/* Sample preview — only shown before generation */}
          {!roadmap && !isGenerating && <SamplePreview />}
        </div>

        {/* Skeleton while loading */}
        {isGenerating && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/4 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Roadmap output ── */}
        {roadmap && !isGenerating && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs mb-0.5">Your Journey</p>
                <p className="text-white font-semibold text-sm truncate">
                  {formData.currentRole} <span className="text-blue-400">→</span> {formData.targetRole}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{roadmap.totalDuration}</span>
              </div>
              {roadmap.salaryGrowth && (
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs">{roadmap.salaryGrowth}</span>
                </div>
              )}
              <button
                onClick={() => exportPDF(roadmap, formData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>

            {/* Timeline phases */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Roadmap Timeline</p>
              <div>
                {(roadmap.phases ?? []).map((phase, i) => (
                  <PhaseCard key={i} phase={phase} index={i} total={roadmap.phases.length} />
                ))}
              </div>
            </div>

            {/* Resources — 2×2 category cards */}
            {(() => {
              const r = roadmap.recommendedResources;
              // Also handle legacy flat array from old API responses
              if (!r && !roadmap.resources) return null;

              const categories = r ? [
                { icon: '🎓', title: 'Platforms',  items: Array.isArray(r.platforms) ? r.platforms : [] },
                { icon: '📚', title: 'Books',       items: Array.isArray(r.books)     ? r.books     : [] },
                { icon: '▶️', title: 'YouTube',     items: Array.isArray(r.youtube)   ? r.youtube   : [] },
                { icon: '💻', title: 'Practice',    items: Array.isArray(r.practice)  ? r.practice  : [] },
              ].filter(c => c.items.length > 0) : [];

              // Fallback: legacy flat list
              const legacyItems = !r && roadmap.resources
                ? (Array.isArray(roadmap.resources) ? roadmap.resources : [roadmap.resources])
                : [];

              return (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
                  <p className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" /> Recommended Resources
                  </p>

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map(({ icon, title, items }) => (
                        <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-white/80 text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <span>{icon}</span>{title}
                          </p>
                          <ul className="space-y-1.5">
                            {items.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-white/60 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {legacyItems.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => { setRoadmap(null); setFormData({ currentRole:'', targetRole:'', experience:'', skills:'' }); }}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white/60 hover:text-white rounded-xl text-sm transition-all"
            >
              Generate Another Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoadmapGenerator;
