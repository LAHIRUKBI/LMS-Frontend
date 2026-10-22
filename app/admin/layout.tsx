"use client";

import { useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";
import { Menu, Sun, Moon } from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Mobile Top Header */}
      <header
        className={`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors duration-300 ${
          darkMode
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(true)}
          className={`p-2 rounded-xl border transition-colors ${
            darkMode
              ? "border-slate-700 bg-slate-800 text-slate-200"
              : "border-slate-200 bg-slate-100 text-slate-700"
          }`}
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>

        <span className="font-bold text-sm tracking-tight">LMS Admin Panel</span>

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl border transition-colors ${
            darkMode
              ? "border-slate-700 bg-slate-800 text-slate-200"
              : "border-slate-200 bg-slate-100 text-slate-700"
          }`}
          aria-label="Toggle Theme"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Sidebar Component */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Dynamic Margin Main Content - mobile padding reduced to p-3 */}
        <main
          className={`flex-1 w-full min-w-0 max-w-full overflow-x-hidden transition-all duration-300 min-h-screen ${
            isCollapsed ? "lg:ml-28" : "lg:ml-72"
          } ml-0`}
        >
          <div className="p-3 sm:p-5 lg:p-8 w-full max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}