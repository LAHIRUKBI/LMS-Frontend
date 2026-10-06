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
      
      {/* Mobile responsive margin and padding adjustments */}
      <main className="ml-0 md:ml-64 flex-1 min-h-screen pt-20 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
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