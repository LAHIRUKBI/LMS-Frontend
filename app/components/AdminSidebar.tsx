"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    { name: "Dashboard", path: "/admin/dashboard", icon: <Home size={18} /> },
    { name: "Add Teacher", path: "/admin/teachers/add", icon: <UserPlus size={18} /> },
    { name: "Teacher List", path: "/admin/teachers/list", icon: <Users size={18} /> },
    { name: "Add Admin", path: "/admin/register", icon: <ShieldPlus size={18} /> }, 
    { name: "Admin List", path: "/admin/list", icon: <Shield size={18} /> }, 
  ];

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen w-64 flex-col transition-colors duration-300 z-50 ${
        darkMode ? "bg-[#0F172A] border-r border-slate-800" : "bg-white border-r border-slate-200"
      }`}
    >
      {/* Header / Brand Profile Style */}
      <div className="flex flex-col items-center justify-center pb-4 pt-8 px-4">
        <div className={`relative flex h-14 w-14 items-center justify-center rounded-full mb-3 shadow-sm ${
            darkMode ? "bg-slate-800 border border-slate-700" : "bg-blue-50 border border-blue-100"
          }`}
        >
          <div className={`flex items-center justify-center ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
            <GraduationCap size={24} />
          </div>
          {/* Active dot */}
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-800"></div>
        </div>
        
        <h2 className={`text-lg font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
          LMS Admin
        </h2>
        <p className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Control Panel
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pt-4">
        <div className={`mb-2 px-2 text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.path}>
              <div
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? darkMode
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-blue-50 text-blue-700 border border-blue-100/50 shadow-sm"
                    : darkMode
                    ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                
                {isActive && (
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full ${darkMode ? "bg-blue-400" : "bg-blue-600"}`} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Compact Settings/Logout */}
      <div className="p-4 pb-6">
        <div className={`rounded-2xl p-3 ${darkMode ? "bg-slate-800/80 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
          
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              darkMode ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700" : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon size={14} /> : <Sun size={14} />}
              <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${darkMode ? "bg-blue-500" : "bg-slate-300"}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${darkMode ? "translate-x-3.5" : "translate-x-0.5"}`} />
            </span>
          </button>

          <button
            onClick={handleLogout}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-transform hover:scale-[1.02] active:scale-95 ${
              darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-white text-red-600 shadow-sm border border-red-100 hover:bg-red-50"
            }`}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}