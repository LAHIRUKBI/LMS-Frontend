"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// Shield කියන Icon එක අලුතින් import කරගත්තා Admin List එකට
import { Home, UserPlus, Users, LogOut, GraduationCap, Sun, Moon, ShieldPlus, Shield } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <Home size={20} /> },
    { name: "Add Teacher", path: "/admin/teachers/add", icon: <UserPlus size={20} /> },
    { name: "Teacher List", path: "/admin/teachers/list", icon: <Users size={20} /> },
    { name: "Add Admin", path: "/admin/register", icon: <ShieldPlus size={20} /> }, 
    // අලුතින් එකතු කරන ලද Admin List ලින්ක් එක
    { name: "Admin List", path: "/admin/list", icon: <Shield size={20} /> }, 
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
            darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
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
            LMS Admin
          </span>
          <span
            className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Control Panel
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
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-blue-50 text-blue-700"
                    : darkMode
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-500 transition-all duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive
                      ? darkMode
                        ? "text-blue-400"
                        : "text-blue-600"
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
              darkMode ? "bg-blue-500" : "bg-slate-300"
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