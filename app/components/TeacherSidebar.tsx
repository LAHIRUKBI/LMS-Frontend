"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Video,
  FileText,
  BookOpen,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  Film, // අලුතින් එක් කරන ලදී
  FileStack // අලුතින් එක් කරන ලදී
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: <Home size={20} /> },
    { name: "Upload Video", path: "/teacher/materials/video", icon: <Video size={20} /> },
    { name: "Upload PDF", path: "/teacher/materials/pdf", icon: <FileText size={20} /> },
    { name: "Upload Paper", path: "/teacher/materials/paper", icon: <BookOpen size={20} /> },
    // අලුතින් එකතු කළ ලින්ක් දෙක
    { name: "My Videos", path: "/teacher/materials/my-videos", icon: <Film size={20} /> },
    { name: "My PDFs & Papers", path: "/teacher/materials/my-pdfs", icon: <FileStack size={20} /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen w-64 flex-col border-r transition-colors duration-300 ${
        darkMode
          ? "border-slate-700 bg-slate-900 text-slate-100"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      {/* Header / Brand */}
      <div
        className={`flex items-center gap-3 border-b px-5 py-5 transition-colors duration-300 ${
          darkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
            darkMode
              ? "bg-indigo-500/20 text-indigo-400"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <GraduationCap size={22} />
        </div>
        <div className="flex flex-col leading-tight">
          <span
            className={`text-base font-bold tracking-wide ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            LMS Teacher
          </span>
          <span
            className={`text-xs ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Teacher Panel
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p
          className={`px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Main Menu
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.path}>
              <div
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? darkMode
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {/* Active indicator bar */}
                <span
                  className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 transition-all duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive
                      ? darkMode
                        ? "text-indigo-400"
                        : "text-indigo-600"
                      : darkMode
                      ? "text-slate-400 group-hover:text-slate-200"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Dark mode toggle + Logout */}
      <div
        className={`space-y-2 border-t p-3 transition-colors duration-300 ${
          darkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
            darkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center gap-3">
            {darkMode ? (
              <Moon size={20} className="text-slate-400" />
            ) : (
              <Sun size={20} className="text-slate-500" />
            )}
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </span>
          <span
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
              darkMode ? "bg-indigo-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                darkMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <button
          onClick={handleLogout}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
            darkMode
              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
              : "text-red-600 hover:bg-red-50 hover:text-red-700"
          }`}
        >
          <LogOut
            size={20}
            className={`transition-colors ${
              darkMode
                ? "text-red-400 group-hover:text-red-300"
                : "text-red-500 group-hover:text-red-600"
            }`}
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}