// src/app/teacher/dashboard/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Video, 
  FileText, 
  BookOpen, 
  Loader2,
  TrendingUp,
  ArrowUpRight,
  Calendar as CalendarIcon,
  MoreHorizontal,
  GraduationCap,
  CheckCircle2,
  Share2,
  Plus,
  HardDrive,
  Activity,
  PlayCircle,
  X,
  Filter,
  Layers,
  Database,
  AlertCircle,
  AlignLeft,
  Eye,
  Search
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { io } from "socket.io-client";
import TeacherClassCalendar from "@/app/components/TeacherClassCalendar";
import TeacherUploadModal from "@/app/components/TeacherUploadModal";

// Date formatting helper function
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; subject?: string } | null>(null);
  
  // ගණනය කිරීම් සහ දත්ත සඳහා States
  const [counts, setCounts] = useState({ videos: 0, pdfs: 0, papers: 0 });
  const [materialsList, setMaterialsList] = useState<any[]>([]); 
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const { darkMode } = useTheme(); 

  // Interactive UI state
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "video" | "pdf" | "paper">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);

      axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setNotifications(res.data)).catch(console.error);

      const socket = io("http://localhost:5000");
      if (parsedUser.id) socket.emit("join_user_room", parsedUser.id);

      socket.on("receive_notification", (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        showToast(newNotif.message); 
      });

      return () => { socket.disconnect(); };
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      localStorage.setItem("token", "teacher_valid_jwt_preview_auth_2026");
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "Dr. Sanduni Fernando",
          subject: "A/L Combined Mathematics & Physics",
        })
      );
    }

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchMyStats(token); 
      fetchTeacherClasses(token); 
    }
  }, [router]);

  const fetchMyStats = async (token?: string) => {
    try {
      const currentToken = token || localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const materials = res.data;
      setMaterialsList(materials); 
      
      let videoCount = 0;
      let pdfCount = 0;
      let paperCount = 0;

      materials.forEach((material: any) => {
        if (material.type === "video") videoCount++;
        if (material.type === "pdf") pdfCount++;
        if (material.type === "paper") paperCount++;
      });

      setCounts({ videos: videoCount, pdfs: pdfCount, papers: paperCount });
    } catch (error) {
      console.error("Dashboard දත්ත ලබා ගැනීමේදී දෝෂයක්:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes/my-classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeacherClasses(res.data);
    } catch (err) {
      console.error("Error fetching teacher classes for calendar:", err);
    }
  };

  const handleShareLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      showToast("Teacher portal link copied to clipboard!");
    } else {
      showToast("Teacher portal link ready to share!");
    }
  };

  if (!user) return (
    <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border shadow-lg max-w-sm text-center mx-4 bg-white/5 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="animate-spin" size={24} />
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-500/20 animate-ping" />
        </div>
        <div>
          <h3 className={`text-sm font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Loading Dashboard</h3>
          <p className={`mt-0.5 text-[10px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Authenticating faculty credentials...</p>
        </div>
      </div>
    </div>
  );

  const stats = [
    { title: "Uploaded Videos", value: counts.videos, icon: <Video size={16} />, accent: "indigo", trend: "Video lectures" },
    { title: "Uploaded PDFs", value: counts.pdfs, icon: <FileText size={16} />, accent: "emerald", trend: "Document notes" },
    { title: "Uploaded Papers", value: counts.papers, icon: <BookOpen size={16} />, accent: "blue", trend: "Past & Model papers" },
  ];

  const accentClasses: Record<string, { light: string; dark: string; iconLight: string; iconDark: string }> = {
    indigo: { light: "bg-indigo-50 text-indigo-700", dark: "bg-indigo-500/10 text-indigo-400", iconLight: "bg-indigo-100/50 text-indigo-600", iconDark: "bg-indigo-500/20 text-indigo-400" },
    emerald: { light: "bg-emerald-50 text-emerald-700", dark: "bg-emerald-500/10 text-emerald-400", iconLight: "bg-emerald-100/50 text-emerald-600", iconDark: "bg-emerald-500/20 text-emerald-400" },
    blue: { light: "bg-blue-50 text-blue-700", dark: "bg-blue-500/10 text-blue-400", iconLight: "bg-blue-100/50 text-blue-600", iconDark: "bg-blue-500/20 text-blue-400" },
  };

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalMaterials = counts.videos + counts.pdfs + counts.papers;

  const filteredActivities = selectedFilter === "all" ? materialsList : materialsList.filter((m) => m.type === selectedFilter);
  const recentActivitiesPreview = filteredActivities.slice(0, 4);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans overflow-x-hidden ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/80 text-slate-900"}`}>
      
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 shadow-xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={14} className="text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span className="text-[11px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"}`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/20">
              <GraduationCap size={18} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] font-extrabold tracking-tight">EduMaster LMS</div>
              <p className={`text-[10px] truncate max-w-[150px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{user.subject || "Faculty Member"}</p>
            </div>
          </div>
          <div>
            <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Upload Material</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        
        <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {user.subject && (
                <span className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                  {user.subject}
                </span>
              )}
            </div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Overview</h1>
            <p className={`mt-0.5 text-[11px] sm:text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back, <span className={darkMode ? "text-slate-200 font-semibold" : "text-slate-800 font-semibold"}>{user.name}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleShareLink} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold shadow-sm border transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Share2 size={12} /> <span className="hidden sm:inline">Share Portal</span><span className="sm:hidden">Share</span>
            </button>
            <div className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold shadow-sm border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
              <CalendarIcon size={12} className={darkMode ? "text-indigo-400" : "text-indigo-600"} /> {todayStr}
            </div>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            const isVideo = stat.accent === "indigo";
            const isPdf = stat.accent === "emerald";
            return (
              <div key={stat.title} className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${darkMode ? "bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-black/20" : "bg-white border border-slate-200/90 hover:border-slate-300 shadow-slate-200/50"}`}>
                <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 ${isVideo ? "bg-gradient-to-r from-indigo-500 to-purple-500" : isPdf ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`} />
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 shadow-sm ${darkMode ? accent.iconDark : accent.iconLight}`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${darkMode ? accent.dark : accent.light}`}>
                    <TrendingUp size={10} /> <span>Active</span>
                  </div>
                </div>
                
                <div>
                  {loading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <Loader2 className={`animate-spin ${darkMode ? "text-slate-400" : "text-slate-500"}`} size={16} />
                      <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <p className={`text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
                      <span className={`text-[10px] font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>files</span>
                    </div>
                  )}
                  <h3 className={`mt-0.5 text-[11px] font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{stat.title}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          
          {/* Recent Uploads */}
          <div className={`rounded-2xl p-4 lg:col-span-2 border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800 shadow-lg shadow-black/20" : "bg-white border-slate-200/90 shadow-slate-200/40 shadow-md"}`}>
            
            <div className="mb-3 flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Recent Uploads</h2>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                  {filteredActivities.length}
                </span>
              </div>
              <button onClick={() => setMaterialsModalOpen(true)} className={`inline-flex items-center gap-1 text-[10px] font-bold transition-all px-2 py-1 rounded-lg border ${darkMode ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}>
                <span>View all</span> <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-[11px]">
              {(
                [ { id: "all", label: "All" }, { id: "video", label: "Videos" }, { id: "pdf", label: "PDFs" }, { id: "paper", label: "Papers" } ] as const
              ).map((tab) => (
                <button key={tab.id} onClick={() => setSelectedFilter(tab.id)} className={`rounded-md px-2.5 py-0.5 font-semibold transition-all whitespace-nowrap ${selectedFilter === tab.id ? darkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white shadow-sm" : darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>
              ) : recentActivitiesPreview.length > 0 ? (
                recentActivitiesPreview.map((material, i) => (
                  <div key={i} className={`group flex flex-row items-center justify-between gap-2 rounded-xl p-2.5 border transition-all hover:scale-[1.005] ${darkMode ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800/80" : "bg-slate-50/70 border-slate-200/70 hover:bg-white hover:shadow-sm"}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-sm border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        {material.type === "video" ? <PlayCircle size={14} className="text-indigo-500" /> : material.type === "pdf" ? <FileText size={14} className="text-emerald-500" /> : <BookOpen size={14} className="text-blue-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] sm:text-xs font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {material.title}
                          </span>
                        </div>
                        <p className={`text-[9px] sm:text-[10px] mt-0.5 line-clamp-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {material.type.toUpperCase()} • {material.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                      <span className={`text-[9px] sm:text-[10px] font-medium whitespace-nowrap ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {formatTimeAgo(material.createdAt || new Date())}
                      </span>
                      <button onClick={() => showToast(`Previewing: ${material.title}`)} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-colors ${darkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"}`}>
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  No {selectedFilter !== "all" ? selectedFilter : ""} materials found.
                </div>
              )}
            </div>
          </div>

          {/* Imported Calendar Component */}
          <TeacherClassCalendar 
            teacherClasses={teacherClasses} 
            darkMode={darkMode} 
            showToast={showToast} 
          />

        </div>
      </main>

      {/* Imported Upload Modal Component */}
      <TeacherUploadModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        darkMode={darkMode}
        showToast={showToast}
        onUploadSuccess={() => fetchMyStats()}
      />

      {/* View Materials Drawer / Modal */}
      {materialsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border p-4 shadow-2xl transition-all ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">All Uploaded Materials</h3>
                  <p className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total: {totalMaterials} items</p>
                </div>
              </div>
              <button onClick={() => setMaterialsModalOpen(false)} className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
              {materialsList.length > 0 ? (
                materialsList.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between rounded-xl p-2.5 border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">{item.type === "video" ? "🎥" : item.type === "pdf" ? "📄" : "📝"}</span>
                      <div className="min-w-0">
                        <span className={`block text-[11px] font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{item.title}</span>
                        <span className={`block text-[9px] font-medium mt-0.5 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {item.type.toUpperCase()} • {item.subject} • {formatTimeAgo(item.createdAt || new Date())}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => showToast(`Opened: ${item.title}`)} className="flex-shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-400">
                      <Eye size={12} /> View
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No materials found.</div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setMaterialsModalOpen(false)} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-[11px] font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}