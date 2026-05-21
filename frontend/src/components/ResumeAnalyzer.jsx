import { useState, useRef } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, CloudUpload,
  Loader2, X, ChevronRight, ChevronLeft, User, Briefcase,
  Code, Eye, Lightbulb, Target, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// ── Circular score ring ──────────────────────────────────────────────────────
function ScoreRing({ score, label }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
          <circle
            cx="64" cy="64" r={r}
            stroke={color} strokeWidth="10" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-white/50">/100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Section bar ──────────────────────────────────────────────────────────────
function SectionBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/70 text-xs w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white/80 text-xs w-8 text-right">{value}%</span>
    </div>
  );
}

// ── What you'll get — empty state ────────────────────────────────────────────
function EmptyState() {
  const features = [
    { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Resume Score', desc: 'Overall ATS compatibility score out of 100' },
    { icon: Target,     color: 'text-green-400', bg: 'bg-green-500/10', label: 'Keyword Match', desc: 'See which job keywords you have or are missing' },
    { icon: Lightbulb,  color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Actionable Tips', desc: 'Specific improvements to boost your chances' },
    { icon: CheckCircle,color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Section Analysis', desc: 'Skills, Experience, Format & Impact scores' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {features.map(({ icon: Icon, color, bg, label, desc }) => (
        <div key={label} className={`flex items-start gap-3 p-4 rounded-xl border border-white/10 ${bg}`}>
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
          <div>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-white/50 text-xs mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Resume Builder multi-step ────────────────────────────────────────────────
const STEPS = ['Personal Info', 'Experience', 'Skills', 'Preview'];

function ResumeBuilder({ onAnalyze }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', email: '', phone: '', location: '', linkedin: '',
    summary: '',
    jobs: [{ title: '', company: '', dates: '', desc: '' }],
    education: [{ degree: '', school: '', year: '' }],
    skills: '',
    projects: '',
  });

  const update = (field, val) => setData(d => ({ ...d, [field]: val }));
  const updateJob = (i, f, v) => setData(d => {
    const jobs = [...d.jobs]; jobs[i] = { ...jobs[i], [f]: v }; return { ...d, jobs };
  });
  const updateEdu = (i, f, v) => setData(d => {
    const education = [...d.education]; education[i] = { ...education[i], [f]: v }; return { ...d, education };
  });

  const inputCls = 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500';
  const labelCls = 'block text-white/70 text-xs mb-1';

  const buildText = () => {
    const j = data.jobs.map(j => `${j.title} at ${j.company} (${j.dates})\n${j.desc}`).join('\n\n');
    const e = data.education.map(e => `${e.degree} — ${e.school} (${e.year})`).join('\n');
    return `${data.name}\n${data.email} | ${data.phone} | ${data.location}\n${data.linkedin}\n\nSUMMARY\n${data.summary}\n\nEXPERIENCE\n${j}\n\nEDUCATION\n${e}\n\nSKILLS\n${data.skills}\n\nPROJECTS\n${data.projects}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i === step ? 'bg-purple-600 text-white' : i < step ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40'
              }`}
            >{i < step ? '✓' : i + 1}</button>
            <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-white/40'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0 — Personal Info */}
      {step === 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4 text-purple-400" /> Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn URL']].map(([f,p]) => (
              <div key={f}>
                <label className={labelCls}>{p}</label>
                <input className={inputCls} placeholder={p} value={data[f]} onChange={e => update(f, e.target.value)} />
              </div>
            ))}
          </div>
          <div>
            <label className={labelCls}>Professional Summary</label>
            <textarea className={`${inputCls} h-20 resize-none`} placeholder="Brief professional summary..." value={data.summary} onChange={e => update('summary', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 1 — Experience */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Experience & Education</h3>
            <button onClick={() => setData(d => ({ ...d, jobs: [...d.jobs, { title:'', company:'', dates:'', desc:'' }] }))} className="text-xs text-blue-300 hover:text-blue-200">+ Add Job</button>
          </div>
          {data.jobs.map((j, i) => (
            <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">Job {i+1}</span>
                {data.jobs.length > 1 && <button onClick={() => setData(d => ({ ...d, jobs: d.jobs.filter((_,x) => x !== i) }))} className="text-red-400 text-xs">Remove</button>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Job Title" value={j.title} onChange={e => updateJob(i,'title',e.target.value)} />
                <input className={inputCls} placeholder="Company" value={j.company} onChange={e => updateJob(i,'company',e.target.value)} />
                <input className={inputCls} placeholder="Dates (e.g. Jan 2023 – Present)" value={j.dates} onChange={e => updateJob(i,'dates',e.target.value)} />
              </div>
              <textarea className={`${inputCls} h-16 resize-none`} placeholder="Key responsibilities & achievements..." value={j.desc} onChange={e => updateJob(i,'desc',e.target.value)} />
            </div>
          ))}
          <div className="flex items-center justify-between mt-2">
            <h4 className="text-white/80 text-sm font-medium">Education</h4>
            <button onClick={() => setData(d => ({ ...d, education: [...d.education, { degree:'', school:'', year:'' }] }))} className="text-xs text-blue-300 hover:text-blue-200">+ Add</button>
          </div>
          {data.education.map((e, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Degree" value={e.degree} onChange={ev => updateEdu(i,'degree',ev.target.value)} />
              <input className={inputCls} placeholder="School" value={e.school} onChange={ev => updateEdu(i,'school',ev.target.value)} />
              <input className={inputCls} placeholder="Year" value={e.year} onChange={ev => updateEdu(i,'year',ev.target.value)} />
            </div>
          ))}
        </div>
      )}

      {/* Step 2 — Skills */}
      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2"><Code className="w-4 h-4 text-green-400" /> Skills & Projects</h3>
          <div>
            <label className={labelCls}>Skills (comma separated)</label>
            <textarea className={`${inputCls} h-20 resize-none`} placeholder="React, Node.js, Python, SQL..." value={data.skills} onChange={e => update('skills', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Projects</label>
            <textarea className={`${inputCls} h-24 resize-none`} placeholder="Project name — description, technologies used..." value={data.projects} onChange={e => update('projects', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3 — Preview */}
      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-orange-400" /> Preview & Analyze</h3>
          <pre className="bg-black/30 border border-white/10 rounded-lg p-4 text-white/80 text-xs whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
            {buildText()}
          </pre>
          <button
            onClick={() => onAnalyze(buildText())}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium text-sm transition-all"
          >
            Analyze This Resume
          </button>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between mt-5">
        <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="flex items-center gap-1 text-sm text-white/60 hover:text-white disabled:opacity-30 transition-all">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < STEPS.length - 1 && (
          <button onClick={() => setStep(s => s+1)} className="flex items-center gap-1 text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-all">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function ResumeAnalyzer() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const SECTION_COLORS = {
    skills: '#8b5cf6', experience: '#3b82f6', keywords: '#22c55e', format: '#f59e0b', impact: '#ef4444'
  };

  const processFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];
    if (!allowed.includes(file.type)) { setError('Please upload a PDF, DOC, DOCX, or TXT file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return; }
    setError('');
    setUploadedFile(file);
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = e => { setResumeText(e.target.result); runAnalysis(e.target.result); };
      reader.readAsText(file);
    } else {
      const text = `File: ${file.name}\n[PDF/DOC content — for best results use the Resume Builder or paste text below]`;
      setResumeText(text);
      runAnalysis(text);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const runAnalysis = async (text, jd) => {
    const t = text ?? resumeText;
    if (!t.trim()) return;
    setIsAnalyzing(true); setAnalysis(null); setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze-resume`, {
        resumeText: t,
        jobDescription: jd ?? (showJobDesc ? jobDesc : undefined),
      });
      setAnalysis(res.data);
      setActiveTab('analyze');
      // Save skills to sessionStorage for roadmap auto-fill
      if (res.data.atsKeywords?.length > 0) {
        const presentSkills = res.data.atsKeywords.filter(k => k.present).map(k => k.word).join(', ');
        if (presentSkills) sessionStorage.setItem('resumeSkills', presentSkills);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => { setAnalysis(null); setResumeText(''); setUploadedFile(null); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-gray-900/50 via-purple-900/20 to-blue-900/30">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header + tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Resume Analyzer</h2>
              <p className="text-white/60 text-sm">Get your ATS score, keyword match & actionable tips</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['analyze','builder'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === t
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >{t === 'analyze' ? 'Analyze Resume' : 'Resume Builder'}</button>
            ))}
          </div>
        </div>

        {/* ── ANALYZE TAB ── */}
        {activeTab === 'analyze' && (
          <>
            {!analysis && !isAnalyzing && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5 space-y-4">
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 hover:border-purple-400/60 hover:bg-white/5'
                  }`}
                >
                  <CloudUpload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-purple-400' : 'text-white/30'}`} />
                  <p className="text-white font-semibold mb-1">Drag & Drop your resume here</p>
                  <p className="text-white/40 text-xs mb-3">PDF, DOC, DOCX or TXT · Max 5MB</p>
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <div className="h-px w-16 bg-white/15" /><span className="text-white/30 text-xs">or</span><div className="h-px w-16 bg-white/15" />
                  </div>
                  <span className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg inline-block transition-all">Browse File</span>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e => processFile(e.target.files[0])} />
                </div>

                {/* Or paste text */}
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Or paste resume text</label>
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here..."
                    className="w-full h-28 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* ATS keyword match toggle */}
                <div>
                  <button onClick={() => setShowJobDesc(v => !v)} className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition-colors">
                    <Target className="w-4 h-4" />
                    {showJobDesc ? 'Hide' : '+ Add'} Job Description for ATS Keyword Match
                  </button>
                  {showJobDesc && (
                    <textarea
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                      placeholder="Paste the job description here to see which keywords you're missing..."
                      className="mt-2 w-full h-24 px-4 py-3 bg-white/10 border border-blue-500/30 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  )}
                </div>

                {error && <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}

                <button
                  onClick={() => runAnalysis()}
                  disabled={!resumeText.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
                >
                  Analyze Resume
                </button>

                <EmptyState />
              </div>
            )}

            {/* Skeleton while loading */}
            {isAnalyzing && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span className="text-white/70 text-sm">Analyzing your resume with AI...</span>
                </div>
                <div className="skeleton h-32 w-32 rounded-full mx-auto" />
                <div className="space-y-3 mt-4">
                  {['w-full','w-5/6','w-4/6','w-full','w-3/4'].map((w,i) => (
                    <div key={i} className={`skeleton h-3 ${w} rounded`} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Results dashboard ── */}
            {analysis && !isAnalyzing && (
              <div className="space-y-4">
                {/* Score + sections */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreRing score={analysis.score ?? 70} label={analysis.label ?? 'Good'} />
                    <div className="flex-1 w-full space-y-2.5">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Section Breakdown</p>
                      {Object.entries(analysis.sections ?? {}).map(([key, val]) => (
                        <SectionBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} color={SECTION_COLORS[key] ?? '#6366f1'} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ATS Keywords */}
                {analysis.atsKeywords?.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-5">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" /> ATS Keyword Match
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.atsKeywords.map(({ word, present }) => (
                        <span key={word} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          present
                            ? 'bg-green-500/15 border-green-500/40 text-green-300'
                            : 'bg-red-500/15 border-red-500/40 text-red-300'
                        }`}>
                          {present ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {present ? '' : 'Missing: '}{word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths + Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.strengths?.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <h3 className="text-green-300 font-semibold text-sm mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.suggestions?.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <h3 className="text-yellow-300 font-semibold text-sm mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button onClick={reset} className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white rounded-xl text-sm transition-all">
                  Analyze Another Resume
                </button>
              </div>
            )}
          </>
        )}

        {/* ── BUILDER TAB ── */}
        {activeTab === 'builder' && (
          <ResumeBuilder onAnalyze={(text) => { setResumeText(text); runAnalysis(text); }} />
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
