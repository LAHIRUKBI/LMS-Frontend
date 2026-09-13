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
  MoreHorizontal
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  
  const [counts, setCounts] = useState({
    teachers: 0,
    admins: 0,
    students: 0, 
  });
  
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
      const [teachersRes, adminsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

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

  // Using professional colors (Blue, Indigo, Emerald) instead of Lime/Orange
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header - Compact */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${darkMode ? "text-white" : "text-slate-900"}`}>
              Overview <span className="inline-block animate-wave text-xl">👋</span>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-md ${
                  darkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${darkMode ? accent.iconDark : accent.iconLight}`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${darkMode ? accent.dark : accent.light}`}>
                    <TrendingUp size={10} />
                    <span>Active</span>
                  </div>
                </div>
                
                <div>
                  <p className={`text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {stat.value}
                  </p>
                  <h3 className={`mt-0.5 text-xs font-semibold text-slate-500`}>
                    {stat.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Info - Compact */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Recent Activity */}
          <div className={`rounded-2xl p-5 lg:col-span-2 border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Recent Activity
              </h2>
              <button className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                  darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                View all <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { text: "A new teacher was added to the system", time: "2 hours ago", icon: "👨‍🏫" },
                { text: "A new course has been successfully created", time: "5 hours ago", icon: "📚" },
                { text: "A new student registered to the portal", time: "Yesterday", icon: "🎓" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                    darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm shadow-sm dark:bg-slate-700">
                      {activity.icon}
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {activity.text}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    <Clock size={12} />
                    {activity.time}
                  </div>
                </div>
              ))}
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