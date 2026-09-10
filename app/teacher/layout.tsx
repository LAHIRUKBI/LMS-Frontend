"use client";

import TeacherSidebar from "@/app/components/TeacherSidebar";
import { ThemeProvider, useTheme } from "@/app/context/ThemeContext";

function TeacherLayoutContent({ children }: { children: React.ReactNode }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <TeacherSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TeacherLayoutContent>{children}</TeacherLayoutContent>
    </ThemeProvider>
  );
}