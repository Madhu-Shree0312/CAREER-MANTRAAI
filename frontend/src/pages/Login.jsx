import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, User, Building2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Animated particle canvas background
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      // Draw faint connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'admin', 'signup', 'recruiter'
  const [showOtherLogins, setShowOtherLogins] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isSignup = activeTab === 'signup' || activeTab === 'recruiter';
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';

      let requestData;
      if (isSignup) {
        requestData = { email: formData.email, password: formData.password, name: formData.name };
        if (activeTab === 'recruiter') {
          requestData.role = 'recruiter';
          requestData.company = formData.company;
        }
      } else {
        requestData = { email: formData.email, password: formData.password };
      }

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, requestData);

      if (!isSignup && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (formData.rememberMe) localStorage.setItem('rememberMe', 'true');

        if (activeTab === 'admin' && response.data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        onLogin(response.data.user);
      } else if (isSignup && response.data.message) {
        setError('');
        setActiveTab('user');
        setFormData({ email: formData.email, password: '', name: '', company: '', rememberMe: false });
        alert(`${activeTab === 'recruiter' ? 'Recruiter account' : 'Account'} created successfully! Please login.`);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setShowOtherLogins(false);
    setFormData({ email: '', password: '', name: '', company: '', rememberMe: false });
  };

  const tabColor = {
    user: 'blue',
    signup: 'green',
    admin: 'purple',
    recruiter: 'orange',
  };

  const ringClass = {
    user: 'focus:ring-blue-500',
    signup: 'focus:ring-green-500',
    admin: 'focus:ring-purple-500',
    recruiter: 'focus:ring-orange-500',
  };

  const btnClass = {
    user: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-blue-300/50 focus:ring-blue-300',
    signup: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-green-300/50 focus:ring-green-300',
    admin: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-purple-300/50 focus:ring-purple-300',
    recruiter: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-orange-300/50 focus:ring-orange-300',
  };

  const isSignup = activeTab === 'signup' || activeTab === 'recruiter';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#0a3a70_0%,_#081a30_50%,_#000000_100%)] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      {/* Soft blob accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img src="/logo.svg" alt="Career Mantra AI" className="w-24 h-24 rounded-2xl mb-4 shadow-2xl animate-float mx-auto" />
          <h1 className="text-3xl font-bold text-white mb-1">Career Mantra AI</h1>
          <p className="text-sm text-blue-200 mb-1">Your Intelligent Career Companion</p>
          <p className="text-xs text-blue-300/70 tracking-wide">Built for students. Powered by AI.</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-indigo-900/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">

          {/* Primary tabs: User Login + Sign Up */}
          <div className="grid grid-cols-2 gap-1 mb-3 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => switchTab('user')}
              className={`py-2 px-3 rounded-md font-medium transition-all text-xs flex items-center justify-center gap-2 ${
                activeTab === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-300/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" /> User Login
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`py-2 px-3 rounded-md font-medium transition-all text-xs flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg border border-green-300/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" /> Sign Up
            </button>
          </div>

          {/* Tab header */}
          <div className="mb-4 text-center">
            {activeTab === 'user' && <><h3 className="text-lg font-semibold text-white mb-1">Student Login</h3><p className="text-xs text-blue-200">Access your career guidance dashboard</p></>}
            {activeTab === 'signup' && <><h3 className="text-lg font-semibold text-white mb-1">Create Student Account</h3><p className="text-xs text-green-200">Join Career Mantra AI as a student</p></>}
            {activeTab === 'admin' && <><h3 className="text-lg font-semibold text-white mb-1 flex items-center justify-center gap-2"><Shield className="w-5 h-5 text-purple-400" />Admin Access</h3><p className="text-xs text-purple-200">Administrative panel login</p></>}
            {activeTab === 'recruiter' && <><h3 className="text-lg font-semibold text-white mb-1 flex items-center justify-center gap-2"><Building2 className="w-5 h-5 text-orange-400" />Recruiter Registration</h3><p className="text-xs text-orange-200">Post jobs and find talented candidates</p></>}
          </div>


          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div>
                <label className="block text-white/90 text-xs font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${ringClass[activeTab]}`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {activeTab === 'recruiter' && (
              <div>
                <label className="block text-white/90 text-xs font-medium mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Your company name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/90 text-xs font-medium mb-1.5">
                Email Address
                {activeTab === 'admin' && <span className="text-purple-300 ml-1">(Admin credentials required)</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${ringClass[activeTab]}`}
                  placeholder={activeTab === 'admin' ? 'admin@careermentra.com' : activeTab === 'recruiter' ? 'recruiter@company.com' : 'your.email@example.com'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/90 text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${ringClass[activeTab]}`}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className={`w-4 h-4 rounded border-white/20 bg-white/10 focus:ring-2 ${activeTab === 'admin' ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <label htmlFor="rememberMe" className="ml-2 text-white/80 text-sm">Remember me</label>
              </div>
            )}

            {activeTab === 'recruiter' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2 text-orange-200 mb-1"><Building2 className="w-3 h-3" /><span className="font-medium">Recruiter Account</span></div>
                <p className="text-orange-300/80">Create a recruiter account to post jobs and manage applications. You'll get access to a dedicated recruiter dashboard.</p>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2 text-purple-200 mb-1"><Shield className="w-3 h-3" /><span className="font-medium">Admin Access</span></div>
                <p className="text-purple-300/80">Use admin credentials to access the administrative panel. Only accounts with admin privileges can login here.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2.5 text-red-200 text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 text-white rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border ${btnClass[activeTab]}`}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{activeTab === 'admin' ? 'Authenticating...' : isSignup ? 'Creating account...' : 'Logging in...'}</>
              ) : (
                <>
                  {activeTab === 'admin' && <Shield className="w-4 h-4" />}
                  {activeTab === 'user' && <User className="w-4 h-4" />}
                  {activeTab === 'recruiter' && <Building2 className="w-4 h-4" />}
                  {activeTab === 'admin' ? 'Admin Login' : activeTab === 'signup' ? 'Create Account' : activeTab === 'recruiter' ? 'Create Recruiter Account' : 'Login'}
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-4 text-center text-white/60 text-xs">
            {activeTab === 'user' && <>Don't have an account?{' '}<button onClick={() => switchTab('signup')} className="text-green-300 hover:text-green-200 font-medium transition-colors">Sign up</button></>}
            {activeTab === 'signup' && <>Already have an account?{' '}<button onClick={() => switchTab('user')} className="text-blue-300 hover:text-blue-200 font-medium transition-colors">Login</button></>}
            {(activeTab === 'admin' || activeTab === 'recruiter') && <><button onClick={() => switchTab('user')} className="text-blue-300 hover:text-blue-200 font-medium transition-colors">Back to User Login</button></>}
          </div>

          {/* Other logins — collapsed by default */}
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowOtherLogins(!showOtherLogins)}
              className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 mx-auto transition-colors"
            >
              Other logins <ChevronDown className={`w-3 h-3 transition-transform ${showOtherLogins ? 'rotate-180' : ''}`} />
            </button>
            {showOtherLogins && (
              <div className="mt-2 flex justify-center gap-4">
                <button onClick={() => switchTab('admin')} className={`text-xs flex items-center gap-1 transition-colors ${activeTab === 'admin' ? 'text-purple-300' : 'text-white/40 hover:text-purple-300'}`}>
                  <Shield className="w-3 h-3" /> Admin
                </button>
                <button onClick={() => switchTab('recruiter')} className={`text-xs flex items-center gap-1 transition-colors ${activeTab === 'recruiter' ? 'text-orange-300' : 'text-white/40 hover:text-orange-300'}`}>
                  <Building2 className="w-3 h-3" /> Recruiter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
