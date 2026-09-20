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
  Calendar,
  Clock,
  MoreHorizontal,
  GraduationCap,
  CheckCircle2,
  Share2,
  Plus,
  UploadCloud,
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
  const [loading, setLoading] = useState(true);

  const { darkMode } = useTheme(); 

  // Interactive UI state
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "video" | "pdf" | "paper">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);

      // 1. පරණ Notifications Database එකෙන් ලබාගැනීම
      axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setNotifications(res.data)).catch(console.error);

      // 2. Socket Connection එක සෑදීම
      const socket = io("http://localhost:5000");
      if (parsedUser.id) socket.emit("join_user_room", parsedUser.id);

      // 3. අලුත් Notification එකක් ආවම List එකේ උඩටම එකතු කිරීම
      socket.on("receive_notification", (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        showToast(newNotif.message); 
      });

      return () => { socket.disconnect(); };
    }
  }, []);

  const handleOpenNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      const token = localStorage.getItem("token");
      axios.put("http://localhost:5000/api/notifications/mark-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }).catch(console.error);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Upload Modal States & Logic
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newMaterialType, setNewMaterialType] = useState<"video" | "pdf" | "paper">("video");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [subjectCategory, setSubjectCategory] = useState("");
  const [gradeCategory, setGradeCategory] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    description: "",
  });

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

  const handleShareLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      showToast("Teacher portal link copied to clipboard!");
    } else {
      showToast("Teacher portal link ready to share!");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type: "video" | "pdf" | "paper") => {
    setNewMaterialType(type);
    setSelectedFile(null); 
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (newMaterialType === "video" && !file.type.startsWith("video/")) {
        setErrorMessage("Please select a valid Video file (MP4, WebM).");
        return;
      }
      if ((newMaterialType === "pdf" || newMaterialType === "paper") && file.type !== "application/pdf") {
        setErrorMessage("Please select a valid PDF file.");
        return;
      }
      
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage(`Please attach a ${newMaterialType === "video" ? "Video" : "PDF"} file.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const token = localStorage.getItem("token");

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("subject", formData.subject);
    uploadData.append("grade", formData.grade);
    uploadData.append("description", formData.description);
    uploadData.append("type", newMaterialType);
    uploadData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:5000/api/materials/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      showToast(`"${formData.title}" uploaded successfully!`);
      setUploadModalOpen(false);
      
      setFormData({ title: "", subject: "", grade: "", description: "" });
      setSubjectCategory(""); 
      setGradeCategory(""); 
      removeFile();
      
      fetchMyStats(token!); 

    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalMaterials = counts.videos + counts.pdfs + counts.papers;

  const filteredActivities = selectedFilter === "all" ? materialsList : materialsList.filter((m) => m.type === selectedFilter);
  const recentActivitiesPreview = filteredActivities.slice(0, 4); // Show 4 instead of 5 for compactness

  const inputClass = `w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;
  
  const inputClassNoIcon = `w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;

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
              <Calendar size={12} className={darkMode ? "text-indigo-400" : "text-indigo-600"} /> {today}
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

        {/* Quick Action Shortcuts Bar */}
        <div className={`mt-4 rounded-xl p-3 border transition-colors ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Quick Actions:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button onClick={() => { handleTypeChange("video"); setUploadModalOpen(true); }} className={`flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30" : "border-slate-200 bg-slate-50 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200"}`}>
                <Video size={12} /> <span>Video</span>
              </button>
              <button onClick={() => { handleTypeChange("pdf"); setUploadModalOpen(true); }} className={`flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30" : "border-slate-200 bg-slate-50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"}`}>
                <FileText size={12} /> <span>PDF</span>
              </button>
              <button onClick={() => { handleTypeChange("paper"); setUploadModalOpen(true); }} className={`flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30" : "border-slate-200 bg-slate-50 text-blue-700 hover:bg-blue-50 hover:border-blue-200"}`}>
                <BookOpen size={12} /> <span>Paper</span>
              </button>
              <button onClick={() => setMaterialsModalOpen(true)} className={`flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>
                <Layers size={12} /> <span>View All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
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

            {/* REAL DATA MAPPING FOR RECENT UPLOADS */}
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

          <div className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${darkMode ? "bg-slate-900/90 border-slate-800 shadow-lg shadow-black/20" : "bg-white border-slate-200/90 shadow-slate-200/40 shadow-md"}`}>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Storage Status</h2>
                </div>
                <button aria-label="Storage Options" className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <div className={`mb-4 rounded-xl p-3 border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                <div className="flex items-center justify-between text-[10px] mb-1 font-bold">
                  <span className={darkMode ? "text-slate-300" : "text-slate-700"}>Used Storage</span>
                  <span className="text-indigo-600 dark:text-indigo-400">32.4 / 50 GB</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: "42%" }} />
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: "16%" }} />
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: "6%" }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[8px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Vid</span>
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> PDF</span>
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Doc</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Cloud Storage", status: "Healthy", color: "emerald", icon: <HardDrive size={12} className="text-emerald-500" /> },
                  { label: "Video Servers", status: "Online", color: "emerald", icon: <Activity size={12} className="text-emerald-500" /> },
                  { label: "Data Sync", status: "Updated", color: "blue", icon: <Database size={12} className="text-blue-500" /> },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-xl p-2 border transition-all ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-white border-slate-200/70 shadow-sm"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>{item.icon}</div>
                      <span className={`text-[10px] font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{item.label}</span>
                    </div>
                    <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${item.color === "emerald" ? darkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200" : darkMode ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                      <span className={`h-1 w-1 rounded-full ${item.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`} />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QUICK UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl transition-all max-h-[90vh] flex flex-col ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            <div className={`p-4 flex items-center justify-between border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <UploadCloud size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Quick Upload</h3>
                </div>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
                <X size={14} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {errorMessage && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-red-700 dark:text-red-300">{errorMessage}</span>
                </div>
              )}

              <form id="quickUploadForm" onSubmit={handleQuickUpload} className="space-y-4">
                
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Material Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "video", label: "Video", icon: <Video size={14} /> },
                        { id: "pdf", label: "PDF Notes", icon: <FileText size={14} /> },
                        { id: "paper", label: "Paper", icon: <BookOpen size={14} /> },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleTypeChange(cat.id as any)}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 border text-[11px] font-semibold transition-all ${
                          newMaterialType === cat.id
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : darkMode
                            ? "border-slate-800 bg-slate-800/50 text-slate-300"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Title</label>
                    <div className="relative">
                      <FileText size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                      <input type="text" name="title" required placeholder="e.g. Modern Physics Summary" value={formData.title} onChange={handleFormChange} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject</label>
                    <div className="relative">
                      <BookOpen size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                      <select 
                        value={subjectCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjectCategory(val);
                          if (val !== "other") setFormData({ ...formData, subject: val });
                          else setFormData({ ...formData, subject: "" });
                        }}
                        required
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="" disabled>Select Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {subjectCategory === "other" && (
                      <div className="mt-2 relative">
                        <input type="text" name="subject" value={formData.subject} onChange={handleFormChange} required placeholder="Type subject" className={inputClassNoIcon} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Grade / Batch</label>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <GraduationCap size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                        <select 
                          value={gradeCategory}
                          onChange={(e) => {
                            setGradeCategory(e.target.value);
                            setFormData({ ...formData, grade: "" });
                          }}
                          required
                          className={`${inputClass} appearance-none`}
                        >
                          <option value="" disabled>Select Category</option>
                          <option value="school">School</option>
                          <option value="university">University</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {gradeCategory === "school" && (
                        <div>
                          <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                            <option value="" disabled>Select Grade</option>
                            {[...Array(13)].map((_, i) => <option key={`Grade ${i+1}`} value={`Grade ${i+1}`}>Grade {i + 1}</option>)}
                          </select>
                        </div>
                      )}

                      {gradeCategory === "university" && (
                        <div>
                          <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                            <option value="" disabled>Select Semester</option>
                            <option value="Semester 1">Semester 1</option>
                            <option value="Semester 2">Semester 2</option>
                          </select>
                        </div>
                      )}

                      {gradeCategory === "other" && (
                        <div>
                          <input type="text" name="grade" value={formData.grade} onChange={handleFormChange} required placeholder="Type Grade/Batch" className={inputClassNoIcon} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description (Optional)</label>
                  <div className="relative">
                    <AlignLeft size={14} className={`absolute left-2.5 top-2.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <textarea name="description" rows={2} placeholder="Brief description..." value={formData.description} onChange={handleFormChange} className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}></textarea>
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Upload File</label>
                  <div 
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                    className={`mt-0.5 border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      selectedFile 
                        ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                        : darkMode ? "border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-950/40" : "border-slate-200 hover:border-indigo-300 cursor-pointer bg-slate-50/60"
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-2">
                          {newMaterialType === "video" ? <Video className="text-indigo-500 w-6 h-6" /> : <FileText className="text-indigo-500 w-6 h-6" />}
                          <div>
                            <p className={`text-[11px] font-bold truncate max-w-[150px] sm:max-w-[200px] ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedFile.name}</p>
                            <p className={`text-[9px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="mx-auto mb-1 text-indigo-500" />
                        <p className={`text-[10px] font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Click to browse file</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={newMaterialType === "video" ? "video/*" : "application/pdf"} className="hidden" />
                  </div>
                </div>

                {uploading && (
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Uploading...</span>
                      <span className="text-indigo-500">{uploadProgress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div className="bg-indigo-500 h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className={`p-4 border-t flex items-center justify-end gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
              <button type="button" onClick={() => setUploadModalOpen(false)} disabled={uploading} className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button type="submit" form="quickUploadForm" disabled={uploading || !selectedFile} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            
          </div>
        </div>
      )}

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