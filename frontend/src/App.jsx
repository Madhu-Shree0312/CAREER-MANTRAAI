import { useState, useEffect } from 'react';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Jobs from './pages/Jobs';
import ChatInterface from './components/ChatInterface';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import RoadmapGenerator from './components/RoadmapGenerator';
import Sidebar from './components/Sidebar';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeSession, setActiveSession] = useState('new');
  const [sessions, setSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // landing → login transition
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    setUser(null);
    setShowLogin(false); // go back to landing page
    setCurrentPage('dashboard');
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
  };

  const updateSessionTitle = (sessionId, firstMessage) => {
    setSessions(sessions.map((s) =>
      s.id === sessionId ? { ...s, title: firstMessage.slice(0, 50) } : s
    ));
  };

  const navigateToTool = (toolId) => {
    setCurrentPage(toolId);
    setIsSidebarOpen(false);
  };

  // Show landing page first, then login, then app
  if (!user && !showLogin) {
    return <LandingPage onLogin={handleLogin} onShowLogin={() => setShowLogin(true)} />;
  }
  if (!user) return <Login onLogin={handleLogin} />;

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${
      isDark
        ? 'bg-[radial-gradient(circle_at_center,_#0a3a70_0%,_#081a30_50%,_#000000_100%)]'
        : 'bg-gray-100'
    }`}>

      {/* Mobile hamburger */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border backdrop-blur-lg ${
          isDark
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white border-gray-200 text-gray-700 shadow-sm'
        }`}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Theme toggle — always visible top-right */}
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 z-50 p-2 rounded-lg border backdrop-blur-lg transition-all ${
          isDark
            ? 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
        }`}
        aria-label="Toggle theme"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={setActiveSession}
          onNewSession={createNewSession}
          activeTab={currentPage}
          user={user}
          onNavigate={navigateToTool}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage !== 'dashboard' && (
          <header className={`border-b px-4 lg:px-6 py-3 shadow-sm flex items-center justify-between backdrop-blur-lg ${
            isDark
              ? 'bg-white/10 border-white/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 pl-10 lg:pl-0">
              <img
                src="/logo.svg"
                alt="Career Mantra AI"
                className="w-9 h-9 rounded-lg cursor-pointer"
                onClick={() => setCurrentPage('dashboard')}
              />
              <div>
                <h1 className={`text-lg lg:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Career Mantra AI
                </h1>
                <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>
                  Your intelligent career companion
                </p>
              </div>
            </div>
          </header>
        )}

        {currentPage === 'dashboard' && <Dashboard onNavigate={navigateToTool} user={user} />}
        {currentPage === 'admin' && <AdminPanel />}
        {currentPage === 'recruiter' && <RecruiterDashboard />}
        {currentPage === 'jobs' && <Jobs />}
        {currentPage === 'chat' && (
          <ChatInterface sessionId={activeSession} onFirstMessage={updateSessionTitle} />
        )}
        {currentPage === 'resume' && <ResumeAnalyzer />}
        {currentPage === 'roadmap' && <RoadmapGenerator />}
      </div>
    </div>
  );
}

export default App;
