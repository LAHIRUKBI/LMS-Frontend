"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // අලුතින් එක් කරන ලදී
import {
  Users,
  GraduationCap,
  Shield, // Admin සඳහා Shield අයිකනය එක් කරන ලදී
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  
  // ගණනය කිරීම් සඳහා State එකක්
  const [counts, setCounts] = useState({
    teachers: 0,
    admins: 0,
    students: 0, // සිසුන්ගේ වෙබ් අඩවිය සෑදූ පසු මෙය යාවත්කාලීන කළ හැක
  });
  
  const { darkMode } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchDashboardStats(token); // දත්ත ලබා ගැනීමේ function එක call කිරීම
    }
  }, [router]);

  // දත්ත සමුදායෙන් ගණනය කිරීම් ලබා ගැනීම
  const fetchDashboardStats = async (token: string) => {
    try {
      // API requests දෙකම එකවර යැවීම (වේගවත් වීම සඳහා)
      const [teachersRes, adminsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ලබාගත් දත්ත වල දිග (length) ගණනය කර state එක යාවත්කාලීන කිරීම
      setCounts({
        teachers: teachersRes.data.length,
        admins: adminsRes.data.length,
        students: 0, 
      });
    } catch (error) {
      console.error("Dashboard දත්ත ලබා ගැනීමේදී දෝෂයක්:", error);
    }
  };

  if (!user) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
          darkMode ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Dynamic දත්ත සහිතව Stats Array එක
  const stats = [
    {
      title: "Total Teachers",
      value: counts.teachers.toString(), // Database එකෙන් එන ගණන
      icon: <Users size={22} />,
      accent: "blue",
      trend: "Active in system",
    },
    {
      title: "Total Admins",
      value: counts.admins.toString(), // Database එකෙන් එන ගණන
      icon: <Shield size={22} />,
      accent: "orange",
      trend: "System administrators",
    },
    {
      title: "Total Students",
      value: counts.students.toString(), 
      icon: <GraduationCap size={22} />,
      accent: "green",
      trend: "Pending student portal",
    },
  ];

  const accentClasses: Record<
    string,
    { light: string; dark: string; iconLight: string; iconDark: string }
  > = {
    blue: {
      light: "border-blue-500 bg-blue-50 text-blue-600",
      dark: "border-blue-500 bg-blue-500/10 text-blue-400",
      iconLight: "bg-blue-100 text-blue-600",
      iconDark: "bg-blue-500/20 text-blue-400",
    },
    green: {
      light: "border-green-500 bg-green-50 text-green-600",
      dark: "border-green-500 bg-green-500/10 text-green-400",
      iconLight: "bg-green-100 text-green-600",
      iconDark: "bg-green-500/20 text-green-400",
    },
    orange: {
      light: "border-orange-500 bg-orange-50 text-orange-600",
      dark: "border-orange-500 bg-orange-500/10 text-orange-400",
      iconLight: "bg-orange-100 text-orange-600",
      iconDark: "bg-orange-500/20 text-orange-400",
    },
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Calendar
              size={16}
              className={darkMode ? "text-slate-500" : "text-slate-400"}
            />
            <span
              className={darkMode ? "text-slate-400" : "text-slate-500"}
            >
              {today}
            </span>
          </div>
          <h1
            className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Welcome back,{" "}
            <span
              className={darkMode ? "text-blue-400" : "text-blue-600"}
            >
              {user.name}
            </span>
            !
          </h1>
          <p
            className={`mt-2 text-base ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            මෙය ඔබගේ පද්ධතියේ සාරාංශ විස්තරයයි.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const accent = accentClasses[stat.accent];
            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* Top accent line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full ${accent.light
                    .split(" ")[0]
                    .replace("border-", "bg-")}`}
                />

                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {stat.title}
                    </h3>
                    <p
                      className={`mt-3 text-3xl font-bold tracking-tight ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                      darkMode ? accent.iconDark : accent.iconLight
                    }`}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium">
                  <TrendingUp
                    size={14}
                    className={
                      darkMode ? "text-green-400" : "text-green-600"
                    }
                  />
                  <span
                    className={
                      darkMode ? "text-green-400" : "text-green-600"
                    }
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions / Info Section */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div
            className={`rounded-2xl border p-6 shadow-sm lg:col-span-2 ${
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Recent Activity
              </h2>
              <button
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                View all
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { text: "නව ගුරුවරයෙක් එකතු කරන ලදී", time: "2 hours ago" },
                { text: "නව පාඨමාලාවක් සාදන ලදී", time: "5 hours ago" },
                { text: "ශිෂ්‍යයෙක් ලියාපදිංචි විය", time: "Yesterday" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    darkMode
                      ? "border-slate-700 hover:bg-slate-700/50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                    <span
                      className={`text-sm ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {activity.text}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      darkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <h2
              className={`mb-5 text-lg font-semibold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              System Status
            </h2>

            <div className="space-y-4">
              {[
                { label: "Server", status: "Online", color: "green" },
                { label: "Database", status: "Healthy", color: "green" },
                { label: "Backups", status: "1 day ago", color: "blue" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`text-sm ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      item.color === "green"
                        ? darkMode
                          ? "text-green-400"
                          : "text-green-600"
                        : darkMode
                        ? "text-blue-400"
                        : "text-blue-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.color === "green"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    />
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