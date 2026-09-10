"use client";

import AdminSidebar from "@/app/components/AdminSidebar";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";

// Inner component එකක් — useTheme hook එක පාවිච්චි කරන්න
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <AdminSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
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