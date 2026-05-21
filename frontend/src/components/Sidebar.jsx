import { useState } from 'react';
import { Plus, MessageSquare, Clock, Home, User, LogOut, Shield, Search, FileText, Map, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_TOOLS = [
  { id: 'chat',    label: 'Career Q&A Chat',    icon: MessageSquare, color: 'text-blue-400' },
  { id: 'resume',  label: 'Resume Analyzer',     icon: FileText,      color: 'text-purple-400' },
  { id: 'jobs',    label: 'Job Search',          icon: Briefcase,     color: 'text-green-400' },
  { id: 'roadmap', label: 'Career Roadmap',      icon: Map,           color: 'text-orange-400' },
];

function Sidebar({ sessions, activeSession, onSelectSession, onNewSession, activeTab, user, onNavigate, onLogout }) {
  const [search, setSearch] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  const base = isDark
    ? 'bg-[radial-gradient(circle_at_center,_#0a3a70_0%,_#081a30_50%,_#000000_100%)] border-white/20 text-white'
    : 'bg-white border-gray-200 text-gray-800';

  const navBtn = (id) => {
    const isActive = activeTab === id;
    if (isDark) {
      return isActive
        ? 'bg-white/20 border border-white/30 text-white shadow-md'
        : 'text-white/70 hover:bg-white/10 hover:text-white';
    }
    return isActive
      ? 'bg-blue-50 border border-blue-200 text-blue-700 font-semibold'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  };

  const dashActive = activeTab === 'dashboard';

  return (
    <div className={`w-64 h-full border-r flex flex-col shadow-2xl ${base}`}>

      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-white/20' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.svg" alt="Career Mantra AI" className="w-10 h-10 rounded-xl shadow-lg" />
          <div>
            <h2 className="font-bold text-sm">Career Mantra AI</h2>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-400'}`}>Your AI Guide</p>
          </div>
        </div>

        {/* User info */}
        <div className={`rounded-lg p-3 mb-3 border ${isDark ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Student'}</p>
              <p className={`text-xs truncate ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Dashboard link */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all mb-1 text-sm ${navBtn('dashboard')}`}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Dashboard</span>
          {dashActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>

        {/* Admin link */}
        {user?.role === 'admin' && (
          <button
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all mb-1 text-sm ${
              activeTab === 'admin'
                ? isDark ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200' : 'bg-purple-50 border border-purple-200 text-purple-700 font-semibold'
                : isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Admin Panel</span>
            {activeTab === 'admin' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
          </button>
        )}

        {/* New Chat button */}
        {activeTab === 'chat' && (
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        )}
      </div>

      {/* Tool nav links — shown when not in chat */}
      {activeTab !== 'chat' && (
        <div className={`px-3 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Tools</p>
          {NAV_TOOLS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all mb-0.5 text-sm ${navBtn(id)}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === id ? '' : color}`} />
              <span className="font-medium">{label}</span>
              {activeTab === id && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />}
            </button>
          ))}
        </div>
      )}

      {/* Chat history */}
      {activeTab === 'chat' && (
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1.5">
          <div className="relative px-1 mb-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-white/10 border border-white/15 text-white/80 placeholder-white/30 focus:ring-white/30'
                  : 'bg-gray-100 border border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-blue-300'
              }`}
            />
          </div>

          <p className={`text-xs font-semibold uppercase tracking-wider px-2 mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            Recent Chats
          </p>

          {filteredSessions.length === 0 ? (
            <div className={`px-3 py-8 text-center text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              {search ? 'No matching chats' : 'No conversations yet'}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                  activeSession === session.id
                    ? isDark ? 'bg-white/20 border border-white/30 text-white shadow-md' : 'bg-blue-50 border border-blue-200 text-blue-800'
                    : isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-xs">{session.title}</div>
                    <div className={`flex items-center gap-1 text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm border ${
            isDark
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 border-red-500/30'
              : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
