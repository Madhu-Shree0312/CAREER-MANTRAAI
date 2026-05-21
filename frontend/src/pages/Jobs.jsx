import { useState, useEffect, useMemo } from 'react';
import {
  Search, MapPin, Briefcase, DollarSign, Clock, Building,
  ExternalLink, Filter, Star, Bookmark, BookmarkPlus, X,
  ChevronDown, ChevronUp, Zap, CheckCircle, Wifi, WifiOff,
  Monitor, Loader2
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import JobApplicationForm from '../components/JobApplicationForm';

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: 1, title: 'Frontend Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA',
    type: 'Full-time', workMode: 'Hybrid', experience: 'Mid-level',
    salary: '$80,000 – $120,000',
    description: 'Build user-facing features using React, TypeScript, and modern web technologies for our flagship SaaS product.',
    requirements: ['3+ years React', 'TypeScript', 'CSS/SCSS', 'REST APIs'],
    posted: '2 days ago', logo: '🏢', featured: true, matchScore: 87,
    applyUrl: 'https://techcorp.com/careers/frontend-developer',
    skills: ['React', 'TypeScript', 'CSS', 'Node.js'],
  },
  {
    id: 2, title: 'Data Scientist', company: 'DataFlow Analytics', location: 'Remote',
    type: 'Full-time', workMode: 'Remote', experience: 'Senior',
    salary: '$90,000 – $140,000',
    description: 'Build predictive models and extract insights from large datasets using Python, SQL, and ML frameworks.',
    requirements: ['Python/R', 'Machine Learning', 'SQL', 'TensorFlow/PyTorch'],
    posted: '1 day ago', logo: '📊', featured: false, matchScore: 62,
    applyUrl: 'https://dataflow.com/jobs/data-scientist',
    skills: ['Python', 'SQL', 'ML', 'Statistics'],
  },
  {
    id: 3, title: 'UX Designer', company: 'Design Studio Pro', location: 'New York, NY',
    type: 'Contract', workMode: 'On-site', experience: 'Mid-level',
    salary: '$60 – $80/hr',
    description: 'Design intuitive user experiences for mobile and web applications. Own the full design process from research to handoff.',
    requirements: ['Figma/Sketch', 'User research', 'Prototyping', 'Portfolio required'],
    posted: '3 days ago', logo: '🎨', featured: false, matchScore: 74,
    applyUrl: 'https://designstudiopro.com/careers/ux-designer',
    skills: ['Figma', 'UX Research', 'Prototyping'],
  },
  {
    id: 4, title: 'DevOps Engineer', company: 'CloudTech Solutions', location: 'Austin, TX',
    type: 'Full-time', workMode: 'Remote', experience: 'Senior',
    salary: '$95,000 – $130,000',
    description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure system reliability at scale.',
    requirements: ['AWS/Azure', 'Docker/Kubernetes', 'CI/CD', 'Terraform'],
    posted: '1 week ago', logo: '☁️', featured: true, matchScore: 55,
    applyUrl: 'https://cloudtech.com/careers/devops-engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    id: 5, title: 'Product Manager', company: 'Innovation Labs', location: 'Seattle, WA',
    type: 'Full-time', workMode: 'Hybrid', experience: 'Senior',
    salary: '$110,000 – $150,000',
    description: 'Lead product strategy for our cutting-edge SaaS platform. Work with cross-functional teams to ship great products.',
    requirements: ['5+ years PM', 'Agile', 'Technical background', 'Data-driven'],
    posted: '4 days ago', logo: '🚀', featured: false, matchScore: 41,
    applyUrl: 'https://innovationlabs.com/jobs/product-manager',
    skills: ['Product Strategy', 'Agile', 'Roadmapping'],
  },
  {
    id: 6, title: 'Backend Developer', company: 'ServerSide Systems', location: 'Remote',
    type: 'Part-time', workMode: 'Remote', experience: 'Entry-level',
    salary: '$50,000 – $70,000',
    description: 'Build and maintain scalable backend services using Node.js, Python, and cloud technologies.',
    requirements: ['Node.js/Python', 'Database design', 'API development', 'Git'],
    posted: '5 days ago', logo: '⚙️', featured: false, matchScore: 79,
    applyUrl: 'https://serverside.com/careers/backend-developer',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'REST'],
  },
];

// ── Match badge ──────────────────────────────────────────────────────────────
function MatchBadge({ score }) {
  const color = score >= 80 ? 'bg-green-500/20 border-green-500/50 text-green-300'
    : score >= 60 ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
    : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Zap className="w-3 h-3" />{score}% Match
    </span>
  );
}

// ── Work mode icon ───────────────────────────────────────────────────────────
function WorkModeChip({ mode }) {
  const map = {
    Remote:  { icon: Wifi,    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    Hybrid:  { icon: Monitor, cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    'On-site':{ icon: WifiOff, cls: 'bg-gray-500/15 text-gray-300 border-gray-500/30' },
  };
  const { icon: Icon, cls } = map[mode] ?? map['On-site'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      <Icon className="w-3 h-3" />{mode}
    </span>
  );
}

// ── Applied chip ─────────────────────────────────────────────────────────────
function AppliedChip() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 border border-green-500/40 text-green-300">
      <CheckCircle className="w-3 h-3" /> Applied
    </span>
  );
}

// ── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ job, saved, applied, onSave, onApply, onGetTips, onApplyNow }) {
  const [expanded, setExpanded] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tips, setTips] = useState('');

  const handleTips = async () => {
    setTipsLoading(true);
    setExpanded(true);
    const result = await onGetTips(job.title);
    setTips(result);
    setTipsLoading(false);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl border transition-all duration-200 overflow-hidden
      ${expanded ? 'border-white/30' : 'border-white/15 hover:border-white/30'}`}>

      {/* Compact header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            {job.logo}
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-sm">{job.title}</h3>
              {job.featured && (
                <span className="inline-flex items-center gap-0.5 bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5 rounded-full text-xs border border-yellow-500/40">
                  <Star className="w-2.5 h-2.5" /> Featured
                </span>
              )}
              <MatchBadge score={job.matchScore} />
              {applied && <AppliedChip />}
            </div>
            <div className="flex items-center gap-3 text-white/50 text-xs mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Building className="w-3 h-3" />{job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onSave(job.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors">
              {saved ? <Bookmark className="w-4 h-4 text-yellow-400 fill-current" /> : <BookmarkPlus className="w-4 h-4 text-white/50" />}
            </button>
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors text-white/50">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chips row */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/60">{job.type}</span>
          <WorkModeChip mode={job.workMode} />
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/60">{job.experience}</span>
          <span className="flex items-center gap-1 text-xs text-green-300 font-medium ml-auto">
            <DollarSign className="w-3 h-3" />{job.salary}
          </span>
        </div>

        {/* Footer buttons — always visible */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleTips}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition-all"
          >
            <Zap className="w-3 h-3" /> AI Tips
          </button>
          <button
            onClick={() => onApplyNow(job)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium rounded-lg transition-all"
          >
            Apply Now <ExternalLink className="w-3 h-3" />
          </button>
          <button onClick={() => setExpanded(v => !v)} className="ml-auto text-xs text-white/40 hover:text-white/70 transition-colors">
            {expanded ? 'Less' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Expanded drawer */}
      {expanded && (
        <div className="border-t border-white/10 px-4 py-4 space-y-3 bg-white/5">
          <p className="text-white/70 text-sm leading-relaxed">{job.description}</p>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Requirements</p>
            <div className="flex flex-wrap gap-1.5">
              {job.requirements.map((r, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-white/10 border border-white/15 rounded-lg text-white/70">{r}</span>
              ))}
            </div>
          </div>

          {/* AI Tips section */}
          {(tipsLoading || tips) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AI Application Tips
              </p>
              {tipsLoading
                ? <div className="flex items-center gap-2 text-white/50 text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Generating tips...</div>
                : <p className="text-white/70 text-xs whitespace-pre-wrap leading-relaxed">{tips}</p>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved'
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/jobs`);
        setJobs([...(res.data.jobs || []), ...MOCK_JOBS]);
      } catch {
        setJobs(MOCK_JOBS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = activeTab === 'saved' ? jobs.filter(j => savedJobs.has(j.id)) : jobs;
    if (searchTerm) list = list.filter(j =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (typeFilter) list = list.filter(j => j.type === typeFilter);
    if (modeFilter) list = list.filter(j => j.workMode === modeFilter);
    if (expFilter)  list = list.filter(j => j.experience === expFilter);
    return list;
  }, [jobs, searchTerm, typeFilter, modeFilter, expFilter, savedJobs, activeTab]);

  const toggleSave = (id) => setSavedJobs(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const getApplicationTips = async (jobTitle) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        messages: [{ role: 'user', content: `Give me 3 concise, actionable tips for applying to a ${jobTitle} position.` }]
      });
      return res.data.message || 'No tips available.';
    } catch {
      return 'Could not load tips — make sure the backend is running.';
    }
  };

  const handleApplyNow = (job) => { setSelectedJob(job); setShowApplyModal(true); };

  const handleApplyConfirm = (method) => {
    if (!selectedJob) return;
    setShowApplyModal(false);
    if (method === 'form') { setShowApplicationForm(true); return; }
    if (method === 'save') { toggleSave(selectedJob.id); return; }
    const q = encodeURIComponent(`${selectedJob.title} ${selectedJob.company}`);
    const urls = {
      direct: selectedJob.applyUrl,
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      indeed: `https://www.indeed.com/jobs?q=${q}`,
    };
    window.open(urls[method] || selectedJob.applyUrl, '_blank');
    setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
  };

  const selectCls = 'pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="flex items-center gap-3 text-white/70"><Loader2 className="w-5 h-5 animate-spin" /> Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-green-400" /> Job Search & Listings
          </h1>
          <p className="text-blue-200/70 text-sm mt-0.5">AI-powered match scores based on your profile</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[['all','All Jobs'],['saved','Saved Jobs']].map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'
              }`}
            >
              {label}
              {t === 'saved' && savedJobs.size > 0 && (
                <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{savedJobs.size}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 space-y-3">
          {/* Search row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
            {/* Job type */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
                <option value="">All Types</option>
                {['Full-time','Part-time','Contract'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {/* Work mode */}
            <div className="relative">
              <Wifi className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className={selectCls}>
                <option value="">All Modes</option>
                {['Remote','Hybrid','On-site'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {/* Experience */}
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <select value={expFilter} onChange={e => setExpFilter(e.target.value)} className={selectCls}>
                <option value="">All Levels</option>
                {['Entry-level','Mid-level','Senior'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {/* Clear */}
            {(typeFilter || modeFilter || expFilter || searchTerm) && (
              <button onClick={() => { setTypeFilter(''); setModeFilter(''); setExpFilter(''); setSearchTerm(''); }}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 px-2 transition-colors">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Results count — below search, not a button */}
          <p className="text-white/40 text-xs">
            Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {searchTerm ? ` for "${searchTerm}"` : ''}
          </p>
        </div>

        {/* Job cards */}
        <div className="space-y-3">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedJobs.has(job.id)}
              applied={appliedJobs.has(job.id)}
              onSave={toggleSave}
              onApplyNow={handleApplyNow}
              onGetTips={getApplicationTips}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">
              {activeTab === 'saved' ? 'No saved jobs yet — bookmark some to track them here.' : 'No jobs match your filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl border border-white/20 p-5 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">{selectedJob.title}</h3>
                <p className="text-blue-200 text-sm">{selectedJob.company} · {selectedJob.location}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {[
                { method: 'form',     label: 'Apply with Form',    sub: 'Upload resume & fill form',    cls: 'border-green-500/40 text-green-200 hover:bg-green-600/20' },
                { method: 'direct',   label: 'Apply Directly',     sub: 'Visit company website',        cls: 'border-blue-500/40 text-blue-200 hover:bg-blue-600/20' },
                { method: 'linkedin', label: 'Apply via LinkedIn',  sub: 'Search on LinkedIn Jobs',      cls: 'border-blue-500/40 text-blue-200 hover:bg-blue-600/20' },
                { method: 'indeed',   label: 'Apply via Indeed',    sub: 'Search on Indeed',             cls: 'border-purple-500/40 text-purple-200 hover:bg-purple-600/20' },
              ].map(({ method, label, sub, cls }) => (
                <button key={method} onClick={() => handleApplyConfirm(method)}
                  className={`w-full p-3 bg-white/5 border rounded-lg text-left transition-all ${cls}`}>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs opacity-70">{sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showApplicationForm && selectedJob && (
        <JobApplicationForm
          job={selectedJob}
          onClose={() => { setShowApplicationForm(false); setSelectedJob(null); }}
          onSuccess={() => setAppliedJobs(prev => new Set([...prev, selectedJob.id]))}
        />
      )}
    </div>
  );
}

export default Jobs;
