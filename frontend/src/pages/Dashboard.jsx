import { MessageSquare, FileText, Map, Zap, Shield, Briefcase, ArrowRight } from "lucide-react";
import bgVideo from "../assets/bg2.mp4";

// Mock stats — swap with real API data when available
const STATS = [
  { label: "Resumes Analyzed", value: 2 },
  { label: "Roadmaps Created", value: 1 },
  { label: "Chats", value: 5 },
];

function Dashboard({ onNavigate, user }) {
  const tools = [
    {
      id: "chat",
      title: "AI Career Q&A Chat",
      description: "Get instant answers to all your career questions from our AI mentor",
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      features: ["Real-time responses", "Career guidance", "Interview prep"],
    },
    {
      id: "resume",
      title: "AI Resume Analyzer",
      description: "Upload your resume and get AI-powered feedback and improvement tips",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      features: ["Instant analysis", "ATS optimization", "Score & feedback"],
    },
    {
      id: "jobs",
      title: "Job Search & Listings",
      description: "Discover relevant job opportunities and get AI-powered application tips",
      icon: Briefcase,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      features: ["Job matching", "Application tips", "Salary insights"],
    },
    {
      id: "roadmap",
      title: "Career Roadmap Generator",
      description: "Create a personalized career path based on your skills and goals",
      icon: Map,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/20 to-red-500/20",
      features: ["Step-by-step plan", "Skill mapping", "Timeline estimates"],
    },
  ];

  const adminTools =
    user?.role === "admin"
      ? [
          {
            id: "admin",
            title: "Admin Panel",
            description: "Manage users, view analytics, and control system settings",
            icon: Shield,
            gradient: "from-purple-600 to-indigo-600",
            bgGradient: "from-purple-600/20 to-indigo-600/20",
            features: ["User management", "System analytics", "Role controls"],
            isAdmin: true,
          },
        ]
      : [];

  const recruiterTools =
    user?.email?.includes("recruiter") || user?.role === "recruiter"
      ? [
          {
            id: "recruiter",
            title: "Recruiter Dashboard",
            description: "Post jobs, manage applications, and review candidate profiles",
            icon: Briefcase,
            gradient: "from-indigo-600 to-purple-600",
            bgGradient: "from-indigo-600/20 to-purple-600/20",
            features: ["Post jobs", "Review applications", "Download resumes"],
            isRecruiter: true,
          },
        ]
      : [];

  const allTools = [...tools, ...adminTools, ...recruiterTools];

  return (
    <div className="relative min-h-screen overflow-y-auto text-white">
      {/* Background video */}
      <video
        src={bgVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div className="fixed inset-0 bg-black/70 z-10" />

      <div className="relative z-20">
        <div className="container mx-auto px-4 py-5 lg:py-8">

          {/* ── Compact hero ── */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/20 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs lg:text-sm">
                Welcome back, {user?.name || "Student"}
                {user?.role === "admin" && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-purple-500/30 px-2 py-0.5 rounded-full border border-purple-400/50">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-1">Your AI Career Tools</h1>
            <p className="text-blue-200 text-sm max-w-xl mx-auto">
              Choose a tool below to start your career journey with AI-powered guidance
            </p>
          </div>

          {/* ── Stats strip ── */}
          <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
            {STATS.map((s, i) => (
              <span key={s.label} className="flex items-center gap-1 text-xs text-white/60">
                <span className="text-white font-semibold">{s.value}</span>
                <span>{s.label}</span>
                {i < STATS.length - 1 && <span className="mx-2 text-white/20">·</span>}
              </span>
            ))}
          </div>

          {/* ── 2×2 tool card grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {allTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className={`group relative backdrop-blur-xl rounded-xl p-5 border transition-all duration-300 text-left overflow-hidden
                  hover:-translate-y-1.5 hover:shadow-[0_0_24px_2px_rgba(99,179,237,0.25)]
                  focus:outline-none focus:ring-2 focus:ring-white/30
                  ${
                    tool.isAdmin
                      ? "bg-purple-500/10 border-purple-500/30 hover:border-purple-400/60"
                      : tool.isRecruiter
                      ? "bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400/60"
                      : "bg-white/10 border-white/20 hover:border-white/40"
                  }`}
              >
                {/* Hover gradient fill */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${tool.gradient} shadow-lg`}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    {(tool.isAdmin || tool.isRecruiter) && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/30 bg-white/10">
                        {tool.isAdmin ? "Admin" : "Recruiter"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold mb-1">{tool.title}</h3>
                  <p className="text-white/70 text-xs mb-3 line-clamp-2">{tool.description}</p>

                  <ul className="space-y-1 mb-4 flex-1">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${tool.gradient} flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Get Started button */}
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r ${tool.gradient} bg-opacity-20 text-white/70 group-hover:text-white group-hover:shadow-md transition-all duration-200 w-fit`}>
                    Get Started <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
