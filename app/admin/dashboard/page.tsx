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
  BookOpen,
  User,
  ClipboardCheck,
  HelpCircle,
  Megaphone,
  Bell
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
    classes: 0,
    materials: 0,
    quizzes: 0,
    ads: 0,
    notifications: 0,
  });
  
  // States: Lists for teachers, admins, students, materials, quizzes, ads, notifications, classes, and class requests.
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [classRequestsList, setClassRequestsList] = useState<any[]>([]);
  
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
      const [teachersRes, adminsRes, materialsRes, studentsRes, classesRes, requestsRes, quizzesRes, adsRes, notifRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/materials/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/requests/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/quiz/admin/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/ads/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/system/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ]);

      const sortedTeachers = (teachersRes.data || []).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      const sortedStudents = (studentsRes.data || []).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setTeachersList(sortedTeachers);
      setAdminsList(adminsRes.data || []);
      setStudentsList(sortedStudents);
      setMaterialsList(materialsRes.data || []);
      setQuizzesList(quizzesRes.data || []);
      setAdsList(adsRes.data || []);
      setNotificationsList(notifRes.data || []);
      setClassesList(classesRes.data || []);
      setClassRequestsList(requestsRes.data || []);

      setCounts({
        teachers: teachersRes.data.length,
        admins: adminsRes.data.length,
        students: studentsRes.data.length,
        classes: (classesRes.data || []).length,
        materials: (materialsRes.data || []).length,
        quizzes: (quizzesRes.data || []).length,
        ads: (adsRes.data || []).length,
        notifications: (notifRes.data || []).length,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const getProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    if (photoUrl.startsWith("/")) return `${process.env.NEXT_PUBLIC_API_URL}${photoUrl}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/profile_photos/${photoUrl}`;
  };

  const formatAdminImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
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
    },
    {
      title: "Total Admins",
      value: counts.admins.toString(),
      icon: <Shield size={20} />,
      accent: "indigo",
    },
    {
      title: "Total Students",
      value: counts.students.toString(), 
      icon: <GraduationCap size={20} />,
      accent: "emerald",
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

  const videoCount = materialsList.filter(m => m.type === "video").length;
  const pdfCount = materialsList.filter(m => m.type === "pdf").length;
  const paperCount = materialsList.filter(m => m.type === "paper").length;

  const pendingMaterials = materialsList.filter(m => m.status === "pending").length;
  const approvedMaterials = materialsList.filter(m => m.status === "approved").length;

  const pendingQuizzes = quizzesList.filter(q => q.status === "pending").length;
  const approvedQuizzes = quizzesList.filter(q => q.status === "approved").length;

  const activeAds = adsList.filter(ad => ad.status === "active").length;
  const inactiveAds = adsList.filter(ad => ad.status === "inactive").length;

  const unreadNotifications = notificationsList.filter(n => !n.isRead).length;
  const readNotifications = notificationsList.filter(n => n.isRead).length;

  return (
    <div className={`w-full max-w-full overflow-hidden min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        
        {/* Header - Compact */}
        <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="min-w-0">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Overview
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back, {user.name}. Here is what's happening today.
            </p>
          </div>
          
          <div className={`self-start md:self-auto flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-sm border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
            <Calendar size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} />
            <span className="truncate">{today}</span>
          </div>
        </div>

        {/* Stats Grid - Mobile-First Stacked Structure */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            const isTeacherCard = stat.title === "Total Teachers";
            const isAdminCard = stat.title === "Total Admins";
            const isStudentCard = stat.title === "Total Students";
            
            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:shadow-md w-full ${
                  darkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
                }`}
              >
                {/* Mobile: Column (stacked) / SM+: Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                  
                  {/* Stats Counter Area */}
                  <div className="flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-2 shrink-0">
                    <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${darkMode ? accent.iconDark : accent.iconLight}`}>
                      {stat.icon}
                    </div>
                    <div className="text-right sm:text-left">
                      <p className={`text-2xl font-bold tracking-tight leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {stat.value}
                      </p>
                      <h3 className="mt-1 text-[11px] sm:text-xs font-semibold text-slate-500">
                        {stat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details Area - Mobile: Border Top / Desktop: Border Left */}
                  <div className={`pt-2.5 sm:pt-0 sm:pl-3 border-t sm:border-t-0 sm:border-l flex flex-col justify-center min-w-0 flex-1 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    
                    {/* Teachers Card List */}
                    {isTeacherCard && (
                      <>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                          New Teachers
                        </span>
                        <div className="space-y-1.5 w-full">
                          {teachersList.length > 0 ? (
                            teachersList.slice(0, 2).map((t, idx) => (
                              <div key={idx} className="flex items-center gap-2 w-full min-w-0">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                                  {t.profilePhoto ? (
                                    <img src={getProfileImageUrl(t.profilePhoto) || ""} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={11} className="text-slate-400" />
                                  )}
                                </div>
                                <span className={`text-xs font-medium truncate flex-1 min-w-0 ${darkMode ? "text-slate-200" : "text-slate-700"}`} title={t.name}>
                                  {t.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No teachers yet</span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Admins Card List */}
                    {isAdminCard && (
                      <>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                          System Admins
                        </span>
                        <div className="space-y-1.5 w-full">
                          {adminsList.length > 0 ? (
                            adminsList.slice(0, 2).map((admin, idx) => (
                              <div key={idx} className="flex items-center gap-2 w-full min-w-0">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                                  {admin.profilePhoto ? (
                                    <img src={formatAdminImageUrl(admin.profilePhoto)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={11} className="text-slate-400" />
                                  )}
                                </div>
                                <span className={`text-xs font-medium truncate flex-1 min-w-0 ${darkMode ? "text-slate-200" : "text-slate-700"}`} title={admin.name}>
                                  {admin.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No admins found</span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Students Card List */}
                    {isStudentCard && (
                      <>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                          Latest Students
                        </span>
                        <div className="space-y-1.5 w-full">
                          {studentsList.length > 0 ? (
                            studentsList.slice(0, 2).map((s, idx) => (
                              <div key={idx} className="flex items-center gap-2 w-full min-w-0">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                                  {s.profileImage ? (
                                    <img src={getProfileImageUrl(s.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={11} className="text-slate-400" />
                                  )}
                                </div>
                                <span className={`text-xs font-medium truncate flex-1 min-w-0 ${darkMode ? "text-slate-200" : "text-slate-700"}`} title={s.name}>
                                  {s.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No students yet</span>
                          )}
                        </div>
                      </>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Review Materials & Quizzes Summary Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 w-full">
          
          {/* Materials Approval Summary Card */}
          <div className={`rounded-2xl p-4 border flex flex-col justify-between w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                    <ClipboardCheck size={18} />
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    Materials Approval Review
                  </h3>
                </div>
                <button 
                  onClick={() => router.push('/admin/materials/review')}
                  className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                >
                  Review <ArrowUpRight size={13} />
                </button>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage and approve study materials submitted by teachers.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t dark:border-slate-800 w-full">
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                <span className={`block text-[9px] uppercase font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total</span>
                <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${darkMode ? "text-white" : "text-slate-900"}`}>{counts.materials}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Pending</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{pendingMaterials}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Approved</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{approvedMaterials}</span>
              </div>
            </div>
          </div>

          {/* Quiz Review Summary Card */}
          <div className={`rounded-2xl p-4 border flex flex-col justify-between w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 ${darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                    <HelpCircle size={18} />
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    Teacher Quiz Review
                  </h3>
                </div>
                <button 
                  onClick={() => router.push('/admin/materials/quize_view')}
                  className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                >
                  Review <ArrowUpRight size={13} />
                </button>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Review and approve quizzes submitted by teaching staff.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t dark:border-slate-800 w-full">
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                <span className={`block text-[9px] uppercase font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total</span>
                <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${darkMode ? "text-white" : "text-slate-900"}`}>{counts.quizzes}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Pending</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{pendingQuizzes}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Approved</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{approvedQuizzes}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Advertisements & Notifications Management Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 w-full">
          
          {/* Advertisements Management Summary Card */}
          <div className={`rounded-2xl p-4 border flex flex-col justify-between w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 ${darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                    <Megaphone size={18} />
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    Advertisements Management
                  </h3>
                </div>
                <button 
                  onClick={() => router.push('/admin/Add/view_add')}
                  className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${darkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"}`}
                >
                  Manage <ArrowUpRight size={13} />
                </button>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Overview of active and inactive promotional advertisements in the system.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t dark:border-slate-800 w-full">
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                <span className={`block text-[9px] uppercase font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Ads</span>
                <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${darkMode ? "text-white" : "text-slate-900"}`}>{counts.ads}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Active</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{activeAds}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                <span className="block text-[9px] uppercase font-bold">Inactive</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{inactiveAds}</span>
              </div>
            </div>
          </div>

          {/* System Notifications Summary Card */}
          <div className={`rounded-2xl p-4 border flex flex-col justify-between w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 ${darkMode ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
                    <Bell size={18} />
                  </div>
                  <h3 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    System Notifications
                  </h3>
                </div>
                <button 
                  onClick={() => router.push('/admin/notification')}
                  className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${darkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`}
                >
                  Manage <ArrowUpRight size={13} />
                </button>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Monitor unread and read platform system notifications.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t dark:border-slate-800 w-full">
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                <span className={`block text-[9px] uppercase font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total</span>
                <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${darkMode ? "text-white" : "text-slate-900"}`}>{counts.notifications}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-teal-50 border-teal-100 text-teal-700"}`}>
                <span className="block text-[9px] uppercase font-bold">Unread</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{unreadNotifications}</span>
              </div>
              <div className={`p-2 rounded-xl border text-center ${darkMode ? "bg-slate-800/40 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                <span className="block text-[9px] uppercase font-bold">Read</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 block">{readNotifications}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Classes & Enrollment Summary */}
        <div className={`mt-4 rounded-2xl p-4 border w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className={`text-sm sm:text-base font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
              Classes & Enrollment Summary
            </h2>
            <button 
              onClick={() => router.push('/admin/materials/class_view')} 
              className={`self-start sm:self-auto flex items-center gap-1 text-xs font-semibold ${
                darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              View all ({counts.classes}) <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
              <BookOpen size={12} /> Classes: {counts.classes}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border ${darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}>
              <Users size={12} /> Teachers: {counts.teachers}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
              <GraduationCap size={12} /> Requests: {classRequestsList.length}
            </span>
          </div>

          <div className="space-y-2 w-full">
            {classesList.length > 0 ? (
              classesList.slice(0, 3).map((cls, idx) => {
                const enrolledCount = classRequestsList.filter((req: any) => req.classId?._id === cls._id && req.status === 'Approved').length;

                return (
                  <div
                    key={cls._id || idx}
                    className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-colors w-full ${
                      darkMode ? "bg-slate-800/20 border-slate-800 hover:bg-slate-800/50" : "bg-slate-50 border-slate-100 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs shadow-sm border ${
                        darkMode ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-white border-slate-200 text-blue-600"
                      }`}>
                        📚
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {cls.grade} {cls.medium} ({cls.subject || cls.teacherId?.subject || "Subject"})
                        </p>
                        <p className={`text-[10px] font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          Teacher: <span className="font-semibold text-blue-500">{cls.teacherId?.name || "Unassigned"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {enrolledCount} Students
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`text-center py-4 text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                No classes created yet.
              </div>
            )}
          </div>
        </div>

        {/* System Materials Activity & System Status */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 w-full">
          
          {/* Recent Activity */}
          <div className={`rounded-2xl p-4 lg:col-span-2 border flex flex-col w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h2 className={`text-sm sm:text-base font-bold mb-2.5 ${darkMode ? "text-white" : "text-slate-900"}`}>
              System Materials Activity
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}>
                <Video size={13} /> Videos: {videoCount}
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                <FileText size={13} /> PDFs: {pdfCount}
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                <BookOpen size={13} /> Papers: {paperCount}
              </div>
            </div>

            <div className="space-y-2 flex-1 w-full">
              {materialsList.length > 0 ? (
                materialsList.slice(0, 4).map((material, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl p-2.5 border transition-colors w-full ${
                      darkMode ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm shadow-sm border ${
                        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      }`}>
                        {material.type === "video" ? "🎥" : material.type === "pdf" ? "📄" : "📝"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                          {material.title}
                        </p>
                        <p className={`text-[10px] font-medium mt-0.5 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          By {material.teacherId?.name || "Teacher"} • {material.subject}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] self-end sm:self-auto shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      <Clock size={11} />
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
          <div className={`rounded-2xl p-4 border w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className={`text-sm sm:text-base font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                System Status
              </h2>
              <MoreHorizontal size={18} className={darkMode ? "text-slate-500" : "text-slate-400"} />
            </div>

            <div className="space-y-2 w-full">
              {[
                { label: "Main Server", status: "Online", color: "emerald", desc: "Operational" },
                { label: "Database", status: "Healthy", color: "emerald", desc: "Synced" },
                { label: "Backups", status: "1d ago", color: "blue", desc: "Automated" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl p-2.5 border w-full ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
                  <div>
                    <span className={`block text-xs font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                      {item.label}
                    </span>
                    <span className={`block text-[9px] uppercase tracking-wider mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {item.desc}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold ${
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