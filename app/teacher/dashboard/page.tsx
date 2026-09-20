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
  Bell,
  Search,
  Plus,
  UploadCloud,
  HardDrive,
  Activity,
  CheckCircle2,
  Share2,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  FileCode,
  Download,
  Eye,
  X,
  Filter,
  Layers,
  Database,
  AlertCircle,
  AlignLeft
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

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
  const [materialsList, setMaterialsList] = useState<any[]>([]); // API එකෙන් එන දත්ත සඳහා
  const [loading, setLoading] = useState(true);

  const { darkMode, toggleDarkMode } = useTheme(); 

  // Interactive UI state
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "video" | "pdf" | "paper">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Quick Upload Modal States & Logic
  // -------------------------------------------------------------
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newMaterialType, setNewMaterialType] = useState<"video" | "pdf" | "paper">("video");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // අලුතින් එක් කළ States (Subject සහ Grade Categories සඳහා)
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
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
    }
  }, [router]);

  const fetchMyStats = async (token?: string) => {
    try {
      const currentToken = token || localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const materials = res.data;
      setMaterialsList(materials); // API දත්ත state එකට දාගැනීම
      
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

  // --- Quick Upload Handlers ---
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
      setSubjectCategory(""); // අලුතින් එක් කළ dropdown resets
      setGradeCategory("");   // අලුතින් එක් කළ dropdown resets
      removeFile();
      
      fetchMyStats(token!); // Upload වූ පසු දත්ත අලුත් කිරීම

    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return (
    <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border shadow-xl max-w-sm text-center mx-4 bg-white/5 backdrop-blur border-slate-200 dark:border-slate-800">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
          <Loader2 className="animate-spin" size={32} />
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 animate-ping" />
        </div>
        <div>
          <h3 className={`text-sm font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Loading Dashboard
          </h3>
          <p className={`mt-1 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Authenticating faculty credentials and syncing lessons...
          </p>
        </div>
      </div>
    </div>
  );

  const stats = [
    { title: "Uploaded Videos", value: counts.videos, icon: <Video size={20} />, accent: "indigo", trend: "Video lectures" },
    { title: "Uploaded PDFs", value: counts.pdfs, icon: <FileText size={20} />, accent: "emerald", trend: "Document notes" },
    { title: "Uploaded Papers", value: counts.papers, icon: <BookOpen size={20} />, accent: "blue", trend: "Past & Model papers" },
  ];

  const accentClasses: Record<string, { light: string; dark: string; iconLight: string; iconDark: string }> = {
    indigo: { light: "bg-indigo-50 text-indigo-700", dark: "bg-indigo-500/10 text-indigo-400", iconLight: "bg-indigo-100/50 text-indigo-600", iconDark: "bg-indigo-500/20 text-indigo-400" },
    emerald: { light: "bg-emerald-50 text-emerald-700", dark: "bg-emerald-500/10 text-emerald-400", iconLight: "bg-emerald-100/50 text-emerald-600", iconDark: "bg-emerald-500/20 text-emerald-400" },
    blue: { light: "bg-blue-50 text-blue-700", dark: "bg-blue-500/10 text-blue-400", iconLight: "bg-blue-100/50 text-blue-600", iconDark: "bg-blue-500/20 text-blue-400" },
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const totalMaterials = counts.videos + counts.pdfs + counts.papers;

  // -------------------------------------------------------------
  // Filter API data for Recent Uploads (Real Data Mapping)
  // -------------------------------------------------------------
  const filteredActivities = selectedFilter === "all" 
    ? materialsList 
    : materialsList.filter((m) => m.type === selectedFilter);

  // Take only the latest 5 items for the dashboard preview
  const recentActivitiesPreview = filteredActivities.slice(0, 5);

  const inputClass = `w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;
  
  const inputClassNoIcon = `w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/80 text-slate-900"}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 shadow-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
              <GraduationCap size={22} />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight">EduMaster LMS</span>
              </div>
              <p className={`text-[11px] truncate max-w-[200px] md:max-w-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{user.subject || "Faculty Member"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-3.5 py-2 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">Upload Material</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
          
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {user.subject && (
                <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                  {user.subject}
                </span>
              )}
            </div>
            <h1 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${darkMode ? "text-white" : "text-slate-900"}`}>Overview</h1>
            <p className={`mt-1.5 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back, <span className={darkMode ? "text-slate-200 font-semibold" : "text-slate-800 font-semibold"}>{user.name}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button onClick={handleShareLink} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm border transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Share2 size={13} /> <span>Share Portal</span>
            </button>
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
              <Calendar size={14} className={darkMode ? "text-indigo-400" : "text-indigo-600"} /> {today}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            const isVideo = stat.accent === "indigo";
            const isPdf = stat.accent === "emerald";
            return (
              <div key={stat.title} className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${darkMode ? "bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-black/20" : "bg-white border border-slate-200/90 hover:border-slate-300 shadow-slate-200/50"}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${isVideo ? "bg-gradient-to-r from-indigo-500 to-purple-500" : isPdf ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`} />
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm ${darkMode ? accent.iconDark : accent.iconLight}`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${darkMode ? accent.dark : accent.light}`}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVideo ? "bg-indigo-400" : isPdf ? "bg-emerald-400" : "bg-blue-400"}`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isVideo ? "bg-indigo-500" : isPdf ? "bg-emerald-500" : "bg-blue-500"}`} />
                    </span>
                    <TrendingUp size={11} /> <span>Active</span>
                  </div>
                </div>
                
                <div>
                  {loading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className={`animate-spin ${darkMode ? "text-slate-400" : "text-slate-500"}`} size={24} />
                      <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Fetching count...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
                      <span className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>files uploaded</span>
                    </div>
                  )}
                  <h3 className={`mt-1 text-sm font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{stat.title}</h3>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className={`font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{stat.trend}</span>
                    <span className={`text-[11px] font-semibold ${isVideo ? "text-indigo-500" : isPdf ? "text-emerald-500" : "text-blue-500"}`}>Live on Portal →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Shortcuts Bar */}
        <div className={`mt-6 rounded-2xl p-4 border transition-colors ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Quick Actions:</span>
              <span className={`text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Upload or publish materials</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { handleTypeChange("video"); setUploadModalOpen(true); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30" : "border-slate-200 bg-slate-50 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200"}`}>
                <Video size={13} /> <span>+ Video Lesson</span>
              </button>
              <button onClick={() => { handleTypeChange("pdf"); setUploadModalOpen(true); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30" : "border-slate-200 bg-slate-50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"}`}>
                <FileText size={13} /> <span>+ PDF Notes</span>
              </button>
              <button onClick={() => { handleTypeChange("paper"); setUploadModalOpen(true); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30" : "border-slate-200 bg-slate-50 text-blue-700 hover:bg-blue-50 hover:border-blue-200"}`}>
                <BookOpen size={13} /> <span>+ Model Paper</span>
              </button>
              <button onClick={() => setMaterialsModalOpen(true)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${darkMode ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>
                <Layers size={13} /> <span>View All Materials</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`rounded-3xl p-6 lg:col-span-2 border transition-all ${darkMode ? "bg-slate-900/90 border-slate-800 shadow-xl shadow-black/20" : "bg-white border-slate-200/90 shadow-slate-200/40 shadow-lg"}`}>
            
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Recent Uploads</h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                    {filteredActivities.length} updates
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Lectures and learning documents recently made available to enrolled students.</p>
              </div>
              <button onClick={() => setMaterialsModalOpen(true)} className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl border ${darkMode ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}>
                <span>View materials</span> <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(
                [ { id: "all", label: "All Items" }, { id: "video", label: "Videos" }, { id: "pdf", label: "PDF Notes" }, { id: "paper", label: "Papers" } ] as const
              ).map((tab) => (
                <button key={tab.id} onClick={() => setSelectedFilter(tab.id)} className={`rounded-lg px-3 py-1 font-semibold transition-all ${selectedFilter === tab.id ? darkMode ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white shadow-sm" : darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* REAL DATA MAPPING FOR RECENT UPLOADS */}
            <div className="space-y-3">
              {loading ? (
                 <div className="flex justify-center p-6"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : recentActivitiesPreview.length > 0 ? (
                recentActivitiesPreview.map((material, i) => (
                  <div key={i} className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 border transition-all hover:scale-[1.005] ${darkMode ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700" : "bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-md"}`}>
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg shadow-sm border transition-transform group-hover:scale-105 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        {material.type === "video" ? <PlayCircle size={18} className="text-indigo-500" /> : material.type === "pdf" ? <FileText size={18} className="text-emerald-500" /> : <BookOpen size={18} className="text-blue-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {material.title}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${material.type === "video" ? darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-700" : material.type === "pdf" ? darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700" : darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"}`}>
                            {material.type === "paper" ? "Model Paper" : material.type === "pdf" ? "PDF Note" : "Video"}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {material.subject} • {material.grade}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <Clock size={13} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                        <span>{formatTimeAgo(material.createdAt || new Date())}</span>
                      </div>
                      <button onClick={() => showToast(`Previewing: ${material.title}`)} className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors opacity-90 group-hover:opacity-100 ${darkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200" : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"}`}>
                        Preview
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  No {selectedFilter !== "all" ? selectedFilter : ""} materials found.
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${darkMode ? "bg-slate-900/90 border-slate-800 shadow-xl shadow-black/20" : "bg-white border-slate-200/90 shadow-slate-200/40 shadow-lg"}`}>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Storage Status</h2>
                  <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>System resources and server sync</p>
                </div>
                <button aria-label="Storage Options" className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className={`mb-5 rounded-2xl p-4 border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className={darkMode ? "text-slate-300" : "text-slate-700"}>Used Storage</span>
                  <span className="text-indigo-600 dark:text-indigo-400">32.4 GB / 50 GB</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: "42%" }} title="Videos: 21 GB" />
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: "16%" }} title="PDFs: 8 GB" />
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: "6%" }} title="Papers: 3.4 GB" />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Videos (42%)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> PDFs (16%)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Papers (6%)</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Cloud Storage", status: "Healthy", color: "emerald", desc: "Available (17.6 GB free)", icon: <HardDrive size={16} className="text-emerald-500" /> },
                  { label: "Video Servers", status: "Online", color: "emerald", desc: "Streaming active (Asia-South)", icon: <Activity size={16} className="text-emerald-500" /> },
                  { label: "Data Sync", status: "Updated", color: "blue", desc: "Just now (PostgreSQL)", icon: <Database size={16} className="text-blue-500" /> },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all hover:scale-[1.01] ${darkMode ? "bg-slate-800/30 border-slate-800 hover:bg-slate-800/60" : "bg-white border-slate-200/70 shadow-sm hover:shadow"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>{item.icon}</div>
                      <div>
                        <span className={`block text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{item.label}</span>
                        <span className={`block text-[11px] font-medium mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.color === "emerald" ? darkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200" : darkMode ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`} />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* REAL API INTEGRATED QUICK UPLOAD MODAL */}
      {/* ========================================================================= */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl transition-all max-h-[90vh] flex flex-col ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 flex items-center justify-between border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Quick Upload Material</h3>
                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Upload securely directly to the system</p>
                </div>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">{errorMessage}</span>
                </div>
              )}

              <form id="quickUploadForm" onSubmit={handleQuickUpload} className="space-y-5">
                
                {/* Type selector */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Material Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "video", label: "Video", icon: <Video size={16} /> },
                        { id: "pdf", label: "PDF Notes", icon: <FileText size={16} /> },
                        { id: "paper", label: "Paper", icon: <BookOpen size={16} /> },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleTypeChange(cat.id as any)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 border text-xs font-semibold transition-all ${
                          newMaterialType === cat.id
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : darkMode
                            ? "border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Title</label>
                    <div className="relative">
                      <FileText size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                      <input type="text" name="title" required placeholder="e.g. Modern Physics Summary" value={formData.title} onChange={handleFormChange} className={inputClass} />
                    </div>
                  </div>

                  {/* Subject and Grade with Generic Dropdowns */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject</label>
                    <div className="relative">
                      <BookOpen size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                      <select 
                        value={subjectCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjectCategory(val);
                          if (val !== "other") {
                            setFormData({ ...formData, subject: val });
                          } else {
                            setFormData({ ...formData, subject: "" });
                          }
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
                        <option value="IT">IT</option>
                        <option value="English">English</option>
                        <option value="Sinhala">Sinhala</option>
                        <option value="History">History</option>
                        <option value="Geography">Geography</option>
                        <option value="Commerce">Commerce</option>
                        <option value="other">Other (Type Subject)</option>
                      </select>
                    </div>
                    {subjectCategory === "other" && (
                      <div className="mt-3 relative">
                        <BookOpen size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                        <input 
                          type="text" 
                          name="subject" 
                          value={formData.subject} 
                          onChange={handleFormChange} 
                          required 
                          placeholder="Type your subject" 
                          className={inputClass} 
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Grade / Batch</label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <GraduationCap size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
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
                          <option value="school">School (Grade 1 - 13)</option>
                          <option value="university">University (Semesters)</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {gradeCategory === "school" && (
                        <div>
                          <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                            <option value="" disabled>Select Grade</option>
                            {[...Array(13)].map((_, i) => (
                              <option key={`Grade ${i+1}`} value={`Grade ${i+1}`}>Grade {i + 1}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {gradeCategory === "university" && (
                        <div>
                          <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                            <option value="" disabled>Select Semester</option>
                            {[...Array(4)].map((_, yearIndex) => (
                              <optgroup key={`Year ${yearIndex+1}`} label={`Year ${yearIndex+1}`}>
                                <option value={`Year ${yearIndex+1} - Semester 1`}>Semester 1</option>
                                <option value={`Year ${yearIndex+1} - Semester 2`}>Semester 2</option>
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}

                      {gradeCategory === "other" && (
                        <div>
                          <input 
                            type="text" 
                            name="grade" 
                            value={formData.grade} 
                            onChange={handleFormChange} 
                            required 
                            placeholder="Type Grade/Batch name" 
                            className={inputClassNoIcon} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description (Optional)</label>
                  <div className="relative">
                    <AlignLeft size={16} className={`absolute left-3 top-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <textarea name="description" rows={2} placeholder="Add a brief description..." value={formData.description} onChange={handleFormChange} className={`w-full rounded-xl border pl-9 pr-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}></textarea>
                  </div>
                </div>

                {/* File Attachment Zone */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Upload File ({newMaterialType === "video" ? "MP4, WebM" : "PDF"})
                  </label>
                  <div 
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                    className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      selectedFile 
                        ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                        : darkMode ? "border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-950/40" : "border-slate-200 hover:border-indigo-300 cursor-pointer bg-slate-50/60"
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                          {newMaterialType === "video" ? <Video className="text-indigo-500 w-8 h-8" /> : <FileText className="text-indigo-500 w-8 h-8" />}
                          <div>
                            <p className={`text-sm font-bold truncate max-w-[200px] sm:max-w-[280px] ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedFile.name}</p>
                            <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={24} className="mx-auto mb-2 text-indigo-500" />
                        <p className={`text-xs font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          Click to browse file from computer
                        </p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={newMaterialType === "video" ? "video/*" : "application/pdf"} className="hidden" />
                  </div>
                </div>

                {/* Progress Bar (Visible during upload) */}
                {uploading && (
                  <div className="w-full">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Uploading {newMaterialType}...</span>
                      <span className="text-indigo-500">{uploadProgress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div className="bg-indigo-500 h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className={`p-5 sm:p-6 border-t flex items-center justify-end gap-3 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
              <button type="button" onClick={() => setUploadModalOpen(false)} disabled={uploading} className={`rounded-xl border px-5 py-2.5 text-xs font-bold transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button type="submit" form="quickUploadForm" disabled={uploading || !selectedFile} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {uploading ? "Uploading..." : "Confirm & Upload"}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* View Materials Drawer / Modal */}
      {materialsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border p-6 shadow-2xl transition-all ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">All Uploaded Materials ({totalMaterials})</h3>
                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Course materials library for {user.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMaterialsModalOpen(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-2">
              {materialsList.length > 0 ? (
                materialsList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-2xl p-3 border ${
                      darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {item.type === "video" ? "🎥" : item.type === "pdf" ? "📄" : "📝"}
                      </span>
                      <div>
                        <span className={`block text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {item.title}
                        </span>
                        <span className={`block text-[10px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {item.type.toUpperCase()} • {item.subject} • {formatTimeAgo(item.createdAt || new Date())}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast(`Opened: ${item.title}`)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-400"
                    >
                      <Eye size={12} /> View
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  No materials found in library.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setMaterialsModalOpen(false)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}