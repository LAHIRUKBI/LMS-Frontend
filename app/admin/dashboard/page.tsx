"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock,
  MoreHorizontal,
  Video,
  FileText,
  BookOpen
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

// Time formatting helper for Recent Activity
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "Just now";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  
  const [counts, setCounts] = useState({
    teachers: 0,
    admins: 0,
    students: 0, 
  });
  
  // අලුතින් එකතු කළ States: ගුරුවරුන්ගේ ලැයිස්තුව සහ Materials ලැයිස්තුව
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  
  const { darkMode } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchDashboardStats(token);
    }
  }, [router]);

  const fetchDashboardStats = async (token: string) => {
    try {
      // Teachers, Admins සහ Materials එකවර ලබා ගැනීම
      const [teachersRes, adminsRes, materialsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/materials/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Error එකක් ආවොත් හිස් array එකක් යවයි
      ]);

      setTeachersList(teachersRes.data || []);
      setMaterialsList(materialsRes.data || []);

      setCounts({
        teachers: teachersRes.data.length,
        admins: adminsRes.data.length,
        students: 0, 
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  if (!user) {
    return (
      <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-blue-600" />
          <p className={`text-xs font-semibold tracking-wide ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Teachers",
      value: counts.teachers.toString(),
      icon: <Users size={20} />,
      accent: "blue",
      trend: "Active users",
    },
    {
      title: "Total Admins",
      value: counts.admins.toString(),
      icon: <Shield size={20} />,
      accent: "indigo",
      trend: "System admins",
    },
    {
      title: "Total Students",
      value: counts.students.toString(), 
      icon: <GraduationCap size={20} />,
      accent: "emerald",
      trend: "Pending portal",
    },
  ];

  const accentClasses: Record<string, { light: string; dark: string; iconLight: string; iconDark: string }> = {
    blue: {
      light: "bg-blue-50 text-blue-700",
      dark: "bg-blue-500/10 text-blue-400",
      iconLight: "bg-blue-100/50 text-blue-600",
      iconDark: "bg-blue-500/20 text-blue-400",
    },
    indigo: {
      light: "bg-indigo-50 text-indigo-700",
      dark: "bg-indigo-500/10 text-indigo-400",
      iconLight: "bg-indigo-100/50 text-indigo-600",
      iconDark: "bg-indigo-500/20 text-indigo-400",
    },
    emerald: {
      light: "bg-emerald-50 text-emerald-700", 
      dark: "bg-emerald-500/10 text-emerald-400",
      iconLight: "bg-emerald-100/50 text-emerald-600",
      iconDark: "bg-emerald-500/20 text-emerald-400",
    },
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Materials ගණනය කිරීම
  const videoCount = materialsList.filter(m => m.type === "video").length;
  const pdfCount = materialsList.filter(m => m.type === "pdf").length;
  const paperCount = materialsList.filter(m => m.type === "paper").length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header - Compact */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${darkMode ? "text-white" : "text-slate-900"}`}>
              Overview
            </h1>
            <p className={`mt-1.5 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back, {user.name}. Here is what's happening today.
            </p>
          </div>
          
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
            <Calendar size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} />
            {today}
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            const isTeacherCard = stat.title === "Total Teachers";
            
            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-md ${
                  darkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
                } ${isTeacherCard ? "sm:col-span-3 lg:col-span-1" : ""}`}
              >
                <div className="flex h-full items-center justify-between gap-4">
                  
                  {/* Left Side: Original Stats Info */}
                  <div className="flex flex-col flex-1 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${darkMode ? accent.iconDark : accent.iconLight}`}>
                        {stat.icon}
                      </div>
                      {!isTeacherCard && (
                        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${darkMode ? accent.dark : accent.light}`}>
                          <TrendingUp size={10} />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <p className={`text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {stat.value}
                      </p>
                      <h3 className={`mt-0.5 text-xs font-semibold text-slate-500`}>
                        {stat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right Side: Added Teachers List Summary (Only for Teachers Card) */}
                  {isTeacherCard && teachersList.length > 0 && (
                    <div className={`flex-1 pl-4 border-l flex flex-col justify-center h-full ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                        Recent Faculties
                      </span>
                      <div className="space-y-1.5 text-xs font-medium">
                        {teachersList.slice(0, 3).map((t, idx) => (
                          <div key={idx} className={`truncate ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                            • {t.name}
                          </div>
                        ))}
                        {teachersList.length > 3 && (
                          <div className={`text-[10px] italic mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                            +{teachersList.length - 3} more teachers...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Info - Compact */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Recent Activity (Materials Real Data) */}
          <div className={`rounded-2xl p-5 lg:col-span-2 border flex flex-col ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                System Materials Activity
              </h2>
              <button onClick={() => router.push('/admin/materials')} className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                  darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                View all <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Separated Material Counts */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}>
                <Video size={14} /> Videos: {videoCount}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                <FileText size={14} /> PDFs: {pdfCount}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                <BookOpen size={14} /> Papers: {paperCount}
              </div>
            </div>

            {/* Recent Uploads List (Real Data) */}
            <div className="space-y-2.5 flex-1">
              {materialsList.length > 0 ? (
                materialsList.slice(0, 4).map((material, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl p-3 border transition-colors ${
                      darkMode ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm shadow-sm border ${
                        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      }`}>
                        {material.type === "video" ? "🎥" : material.type === "pdf" ? "📄" : "📝"}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {material.title}
                        </p>
                        <p className={`text-[11px] font-medium mt-0.5 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          By {material.teacherId?.name || "Teacher"} • {material.subject}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs flex-shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      <Clock size={12} />
                      {formatTimeAgo(material.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-6 text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  No materials uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className={`rounded-2xl p-5 border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                System Status
              </h2>
              <MoreHorizontal size={18} className={darkMode ? "text-slate-500" : "text-slate-400"} />
            </div>

            <div className="space-y-3">
              {[
                { label: "Main Server", status: "Online", color: "emerald", desc: "Operational" },
                { label: "Database", status: "Healthy", color: "emerald", desc: "Synced" },
                { label: "Backups", status: "1d ago", color: "blue", desc: "Automated" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl p-3 border ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
                  <div>
                    <span className={`block text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                      {item.label}
                    </span>
                    <span className={`block text-[10px] uppercase tracking-wider mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {item.desc}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                    item.color === "emerald"
                      ? darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                      : darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}