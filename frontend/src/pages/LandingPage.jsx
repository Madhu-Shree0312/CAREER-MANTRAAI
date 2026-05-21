import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, FileText, Map, Briefcase, Send, Loader2,
  ArrowRight, Star, Zap, ChevronDown, Lock, Sparkles
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const FREE_LIMIT = 3;

const QUICK_QUESTIONS = [
  "How do I switch to Web Development?",
  "What skills do I need for Data Science?",
  "How should I prepare for interviews?",
];

const FEATURES = [
  { icon: FileText, label: 'Resume Analyzer', desc: 'ATS score + keyword match', color: 'from-purple-500 to-pink-500' },
  { icon: MessageSquare, label: 'AI Career Chat', desc: '24/7 career mentor', color: 'from-blue-500 to-cyan-500' },
  { icon: Map, label: 'Roadmap Generator', desc: 'Phase-by-phase career path', color: 'from-orange-500 to-red-500' },
  { icon: Briefcase, label: 'Job Search', desc: 'AI match % on every listing', color: 'from-green-500 to-emerald-500' },
];

const TESTIMONIALS = [
  { name: 'Arjun Reddy', college: 'VIT Vellore', text: 'Went from 45 to 88 ATS score in one afternoon. Got 3 interview calls the next week!', stars: 5 },
  { name: 'Priya Sharma', college: 'Amity University', text: 'The roadmap generator gave me a 10-month plan. Followed it and got placed at a top MNC!', stars: 5 },
  { name: 'Karthik Menon', college: 'IIM Kozhikode', text: 'Used the AI chat to prep for Infosys. Cleared it in the first attempt.', stars: 5 },
];

// ── Typing effect hook ───────────────────────────────────────────────────────
function useTyping(phrases) {
  const [text, setText] = useState('');
  const [pi, setPi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const phrase = phrases[pi];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(phrase.slice(0, text.length + 1));
        if (text.length + 1 === phrase.length) setTimeout(() => setDeleting(true), 1600);
      } else {
        setText(phrase.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDeleting(false); setPi(p => (p + 1) % phrases.length); }
      }
    }, deleting ? 50 : 90);
    return () => clearTimeout(timeout);
  }, [text, deleting, pi, phrases]);
  return text;
}

// ── Demo chat component ──────────────────────────────────────────────────────
function DemoChat({ onLoginRequired }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Career Mantra AI 👋 Ask me anything about your career — I'll give you 3 free answers. No sign-up needed!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedCount, setUsedCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading || locked) return;
    if (usedCount >= FREE_LIMIT) { setLocked(true); return; }

    setMessages(p => [...p, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    const newCount = usedCount + 1;
    setUsedCount(newCount);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        messages: [{ role: 'user', content }]
      });
      const reply = res.data.message || "Sorry, I couldn't respond right now.";
      setMessages(p => [...p, { role: 'assistant', content: reply }]);
      if (newCount >= FREE_LIMIT) {
        setTimeout(() => {
          setMessages(p => [...p, {
            role: 'assistant',
            content: '🔒 You\'ve used your 3 free messages! Sign up free to unlock unlimited AI career guidance, resume analysis, roadmaps, and job search.',
            isLockMessage: true
          }]);
          setLocked(true);
        }, 800);
      }
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Connection error — please try again.' }]);
      setUsedCount(c => c - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-b border-white/10">
        <img src="/logo.svg" alt="AI" className="w-8 h-8 rounded-lg" />
        <div>
          <p className="text-white font-semibold text-sm">Career Mantra AI</p>
          <p className="text-green-400 text-xs">● Live demo</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-white/50">
          <Zap className="w-3 h-3 text-yellow-400" />
          {Math.max(0, FREE_LIMIT - usedCount)} free {FREE_LIMIT - usedCount === 1 ? 'message' : 'messages'} left
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <img src="/logo.svg" alt="AI" className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                : m.isLockMessage
                  ? 'bg-gradient-to-br from-purple-900/80 to-blue-900/80 border border-purple-500/40 text-white rounded-bl-sm'
                  : 'bg-white/8 border border-white/10 text-white/90 rounded-bl-sm'
            }`}>
              {m.content}
              {m.isLockMessage && (
                <button
                  onClick={onLoginRequired}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Sign up free — unlock everything
                </button>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <img src="/logo.svg" alt="AI" className="w-7 h-7 rounded-full flex-shrink-0" />
            <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0,150,300].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {!locked && usedCount === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="text-xs px-3 py-1.5 bg-white/8 hover:bg-white/15 border border-white/15 rounded-full text-white/70 hover:text-white transition-all">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10">
        {locked ? (
          <button onClick={onLoginRequired}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all">
            <Lock className="w-4 h-4" /> Sign up free to continue chatting
          </button>
        ) : (
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-40 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main landing page ────────────────────────────────────────────────────────
function LandingPage({ onLogin, onShowLogin }) {
  const typingText = useTyping(['AI Career Guide', 'Smart Job Mentor', 'Resume Expert', 'Career Compass']);
  const demoRef = useRef(null);

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Career Mantra AI" className="w-9 h-9 rounded-xl animate-[float_3s_ease-in-out_infinite]" />
            <span className="font-bold text-lg">Career Mantra <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <button onClick={scrollToDemo} className="hover:text-white transition-colors">Demo</button>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onShowLogin}
              className="text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-full transition-all">
              Log in
            </button>
            <button onClick={onShowLogin}
              className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-purple-900/40">
              Sign up free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero: Design 1 (grid bg + glows) + Design 2 (split layout) ── */}
      <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden">

        {/* Design 1 — dot grid background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize:'32px 32px' }} />

        {/* Design 1 — radial glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-700/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-700/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Design 2 — split layout */}
        <div className="relative flex-1 flex items-center max-w-6xl mx-auto px-6 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

            {/* LEFT — headline + CTA + trust avatars */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 text-xs text-white/70 mb-6">
                <Zap className="w-3.5 h-3.5 text-yellow-400" /> AI-powered career platform for students
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
                Your Personal<br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                  {typingText}<span className="animate-pulse">|</span>
                </span>
              </h1>

              <p className="text-base text-white/55 leading-relaxed mb-8 max-w-lg">
                Career Mantra AI helps students land dream jobs with AI-powered resume analysis, personalized roadmaps, smart job matching, and 24/7 career mentorship.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={onShowLogin}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all shadow-xl shadow-purple-900/50 text-sm">
                  🚀 Get started free
                </button>
                <button onClick={scrollToDemo}
                  className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 text-white/80 hover:text-white rounded-full transition-all text-sm">
                  Try live demo <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Trust avatars + stats */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center">
                  {['AR','PS','KM','RV','SN'].map((init, i) => (
                    <div key={init} className="w-9 h-9 rounded-full border-2 border-[#0a0e1a] flex items-center justify-center text-xs font-bold text-white"
                      style={{ marginLeft: i === 0 ? 0 : -10, background: ['#7c3aed','#2563eb','#0891b2','#059669','#d97706'][i], zIndex: 5 - i }}>
                      {init}
                    </div>
                  ))}
                  <span className="ml-3 text-white/50 text-xs">10,000+ students</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  <span className="text-white/50 text-xs ml-1">4.8 rating</span>
                </div>
              </div>
            </div>

            {/* RIGHT — phone mockup with animated chat + floating badges */}
            <div className="relative flex justify-center items-center">

              {/* Phone frame */}
              <div className="relative w-[280px] h-[520px] bg-gradient-to-b from-gray-900 to-gray-950 rounded-[40px] border border-white/15 shadow-2xl shadow-purple-900/30 overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
                {/* Screen header */}
                <div className="flex items-center gap-2 px-4 pt-8 pb-3 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-b border-white/10">
                  <img src="/logo.svg" alt="AI" className="w-7 h-7 rounded-lg" />
                  <div>
                    <p className="text-white text-xs font-semibold">Career Mantra AI</p>
                    <p className="text-green-400 text-[10px]">● Online</p>
                  </div>
                </div>
                {/* Chat bubbles */}
                <div className="flex-1 px-3 py-3 space-y-3 overflow-hidden">
                  {/* AI bubble 1 */}
                  <div className="flex gap-2 items-end">
                    <img src="/logo.svg" alt="AI" className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] text-white/85 max-w-[80%] leading-relaxed">
                      Hi! I'm your AI career mentor 👋 What's your dream role?
                    </div>
                  </div>
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl rounded-br-sm px-3 py-2 text-[11px] text-white max-w-[75%]">
                      I want to become a Data Scientist
                    </div>
                  </div>
                  {/* AI bubble 2 — animated typing then reveal */}
                  <div className="flex gap-2 items-end">
                    <img src="/logo.svg" alt="AI" className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] text-white/85 max-w-[80%] leading-relaxed">
                      Great choice! Start with Python, statistics & ML basics. I'll build you a roadmap 🗺️
                    </div>
                  </div>
                  {/* User bubble 2 */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl rounded-br-sm px-3 py-2 text-[11px] text-white max-w-[75%]">
                      Can you check my resume too?
                    </div>
                  </div>
                  {/* Typing dots */}
                  <div className="flex gap-2 items-end">
                    <img src="/logo.svg" alt="AI" className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                      {[0,150,300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Input bar */}
                <div className="px-3 py-3 border-t border-white/10">
                  <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-3 py-2">
                    <span className="text-[10px] text-white/30 flex-1">Ask anything...</span>
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge — ATS Score */}
              <div className="absolute -left-6 top-16 bg-gray-900/95 border border-purple-500/40 rounded-2xl px-4 py-3 shadow-xl shadow-purple-900/30 animate-[float_4s_ease-in-out_infinite]">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">ATS Score</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-extrabold text-white">88</span>
                  <span className="text-white/40 text-xs mb-1">/100</span>
                </div>
                <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1.5">
                  <div className="h-full w-[88%] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full" />
                </div>
              </div>

              {/* Floating badge — Roadmap */}
              <div className="absolute -right-4 top-28 bg-gray-900/95 border border-blue-500/40 rounded-2xl px-4 py-3 shadow-xl shadow-blue-900/30 animate-[float_5s_ease-in-out_infinite_0.5s]">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1.5">Roadmap</p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                  <span className="w-2 h-2 rounded-full bg-green-400" />Learn Python
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/70 mt-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />Build Projects
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-1">
                  <span className="w-2 h-2 rounded-full bg-white/20" />Apply & Win
                </div>
              </div>

              {/* Floating badge — Job Match */}
              <div className="absolute -left-4 bottom-24 bg-gray-900/95 border border-teal-500/40 rounded-2xl px-4 py-3 shadow-xl shadow-teal-900/30 animate-[float_3.5s_ease-in-out_infinite_1s]">
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-1">Job Match</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-white">94%</span>
                  <span className="text-[10px] text-teal-400 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 rounded-full">⚡ Top fit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design 1 — 5 floating mini feature cards at the bottom */}
        <div className="relative w-full pb-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
            {[
              { icon:'📄', label:'Resume Analyzer', sub:'ATS score in seconds', delay:'0s' },
              { icon:'💬', label:'AI Career Chat', sub:'24/7 mentor', delay:'0.15s' },
              { icon:'🗺️', label:'Roadmap Generator', sub:'Phase-by-phase path', delay:'0.3s' },
              { icon:'💼', label:'Job Search', sub:'AI match % badges', delay:'0.45s' },
              { icon:'🎯', label:'Goal Tracker', sub:'Stay on track', delay:'0.6s' },
            ].map(({ icon, label, sub, delay }) => (
              <button key={label} onClick={onShowLogin}
                className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-2xl px-5 py-3 transition-all hover:-translate-y-1 cursor-pointer"
                style={{ animation:`float 4s ease-in-out ${delay} infinite` }}>
                <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                <div className="text-left">
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-white/40 text-[10px]">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">✦ Powerful Tools</p>
            <h2 className="text-3xl font-bold">Everything you need to <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">land your dream job</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} onClick={onShowLogin}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">{label}</p>
                <p className="text-white/50 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo Chat ── */}
      <section ref={demoRef} className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">✦ Try it now — no sign up needed</p>
            <h2 className="text-3xl font-bold mb-3">Chat with Career Mantra AI <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">live</span></h2>
            <p className="text-white/50 text-sm">Ask 3 free questions. See the magic. Then unlock everything.</p>
          </div>
          <DemoChat onLoginRequired={onShowLogin} />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">✦ Student Stories</p>
            <h2 className="text-3xl font-bold">Loved by <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">students across India</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, college, text, stars }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/80 text-sm italic leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-white/40 text-xs">{college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-4xl font-extrabold mb-4">Your dream career is <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">one click away</span></h2>
          <p className="text-white/60 mb-8">Join 10,000+ students already using Career Mantra AI.</p>
          <button onClick={onShowLogin}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-full text-base transition-all shadow-2xl shadow-purple-900/50">
            <Sparkles className="w-5 h-5" /> Get started free — it's ₹0
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Career Mantra AI" className="w-6 h-6 rounded-lg" />
            <span className="text-white/50 text-sm font-semibold">Career Mantra AI</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            {['Features','Demo','Reviews'].map(l => (
              <button key={l} onClick={l === 'Demo' ? scrollToDemo : undefined} className="hover:text-white/70 transition-colors">{l}</button>
            ))}
            <button onClick={onShowLogin} className="hover:text-white/70 transition-colors">Sign up</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
