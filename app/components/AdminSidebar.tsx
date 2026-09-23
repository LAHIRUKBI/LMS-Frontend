// src/app/admin/components/AdminSidebar.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  UserPlus, 
  Users, 
  LogOut, 
  GraduationCap, 
  Sun, 
  Moon, 
  ShieldPlus, 
  Shield, 
  ClipboardCheck, 
  Bell, 
  Trash2, 
  X,
  ChevronsLeft,
  ChevronsRight 
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import axios from "axios";
import { io } from "socket.io-client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Notifications States
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = adminNotifications.filter(n => !n.isRead).length;

  // --- Collapsible State ---
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Socket.io සහ Notifications Logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // 1. පරණ Admin Notifications ලබා ගැනීම
      axios.get("http://localhost:5000/api/notifications/admin", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setAdminNotifications(res.data)).catch(console.error);

      // 2. Socket Connect කිරීම සහ admin_room එකට එක් වීම
      const socket = io("http://localhost:5000");
      socket.emit("join_admin_room");

      // 3. අලුත් Notification එකක් එන විට එය State එකට එක් කිරීම
      socket.on("receive_admin_notification", (newNotif) => {
        setAdminNotifications(prev => [newNotif, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Dropdown එක විවෘත කළ විට 'Read' කිරීම
  const handleOpenAdminNotifications = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      try {
        const token = localStorage.getItem("token");
        await axios.put("http://localhost:5000/api/notifications/admin/mark-read", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // සියලුම Notifications මකා දැමීම
  const handleClearAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to clear all notifications?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/notifications/admin/clear-all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminNotifications([]); 
    } catch (error) {
      console.error(error);
    }
  };

  // තනි Notification එකක් මකා දැමීම
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notifications/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminNotifications(prev => prev.filter(n => n._id !== id)); 
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: Home },
    { name: "Add Teacher", path: "/admin/teachers/add", icon: UserPlus },
    { name: "Teacher List", path: "/admin/teachers/list", icon: Users },
    { name: "Add Admin", path: "/admin/register", icon: ShieldPlus }, 
    { name: "Admin List", path: "/admin/list", icon: Shield }, 
    { name: "Review Materials", path: "/admin/materials/review", icon: ClipboardCheck },
    { name: "Review Quiz", path: "/admin/materials/quize_view", icon: ClipboardCheck },
    { name: "Tickets", path: "/admin/tickets", icon: ClipboardCheck },
    { name: "Students", path: "/admin/student/student_view", icon: ClipboardCheck },
  ];

  const notifDropdownRef = useRef<HTMLDivElement>(null);

  return (
    <aside
      className={`fixed left-3 top-3 bottom-3 flex flex-col transition-all duration-300 ease-in-out z-45 shadow-2xl rounded-3xl overflow-visible backdrop-blur-2xl ${
        darkMode 
          ? "bg-[#0F172A]/60 border border-slate-700/40 shadow-black/50" 
          : "bg-white/50 border border-white/80 shadow-indigo-500/10"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3.5 top-8 flex h-7 w-7 items-center justify-center rounded-full border shadow-lg transition-transform duration-300 hover:scale-110 z-[100] ${
          darkMode
            ? "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
        }`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>

      {/* Header / Brand Profile Style */}
      <div className={`p-3.5 pt-4 transition-all duration-300 ${isCollapsed ? "px-2.5" : "px-3.5"}`}>
        <div
          className={`flex items-center gap-3 rounded-2xl cursor-pointer group transition-all duration-300 border backdrop-blur-md shadow-sm ${
            isCollapsed ? "p-2 justify-center" : "p-3"
          } ${
            darkMode
              ? "bg-slate-800/30 border-slate-700/40 hover:bg-slate-800/60 hover:border-blue-500/40"
              : "bg-white/40 border-slate-200/40 hover:bg-white/70 hover:border-blue-200"
          }`}
          title="LMS Admin"
        >
          <div
            className={`relative flex items-center justify-center rounded-full shadow-inner transition-transform group-hover:scale-105 overflow-hidden shrink-0 ${
              isCollapsed ? "h-10 w-10" : "h-11 w-11"
            } ${darkMode ? "bg-slate-800 border border-slate-700" : "bg-blue-50 border border-blue-100"}`}
          >
            <div
              className={`flex items-center justify-center ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              <GraduationCap size={isCollapsed ? 20 : 22} />
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-800"></div>
          </div>

          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            }`}
          >
            <h2
              className={`text-sm font-bold tracking-tight truncate ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              LMS Admin
            </h2>
            <p
              className={`text-[10px] font-medium mt-0.5 opacity-70 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Control Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2.5 pt-1 scrollbar-thin">
        <div
          className={`px-2 font-bold uppercase tracking-wider transition-all duration-300 ${
            darkMode ? "text-slate-500" : "text-slate-400"
          } ${isCollapsed ? "text-[8px] text-center opacity-0 h-0 overflow-hidden" : "text-[9px] opacity-100"}`}
        >
          Main Menu
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link href={item.path} key={item.path} title={item.name}>
              <div
                className={`group flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out border backdrop-blur-sm ${
                  isCollapsed ? "justify-center px-0" : "gap-3"
                } ${
                  isActive
                    ? darkMode
                      ? "bg-blue-600/30 text-blue-300 border-blue-500/40 shadow-md shadow-blue-500/10 -translate-y-0.5"
                      : "bg-blue-50/80 text-blue-700 border-blue-200/70 shadow-md shadow-blue-100/60 -translate-y-0.5"
                    : darkMode
                    ? "text-slate-400 bg-slate-900/10 border-slate-800/30 hover:bg-slate-800/40 hover:text-white hover:-translate-y-0.5"
                    : "text-slate-600 bg-white/30 border-slate-200/30 hover:bg-white/60 hover:text-slate-900 hover:-translate-y-0.5"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-300 shrink-0 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  } ${
                    isActive
                      ? darkMode
                        ? "text-blue-400"
                        : "text-blue-600"
                      : darkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <span
                  className={`truncate transition-all duration-300 ${
                    isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"
                  }`}
                >
                  {item.name}
                </span>

                {isActive && !isCollapsed && (
                  <span
                    className={`ml-auto h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      darkMode ? "bg-blue-400" : "bg-blue-600"
                    }`}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Notifications, Theme Toggle & Logout */}
      <div className="p-2.5 pb-3.5 relative space-y-2">
        {/* --- Notifications Section --- */}
        <div ref={notifDropdownRef} className="relative w-full">
          <button
            onClick={handleOpenAdminNotifications}
            className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 border backdrop-blur-sm shadow-sm ${
              isCollapsed ? "justify-center px-0" : "justify-between"
            } ${
              isNotifOpen
                ? darkMode
                  ? "bg-blue-600/30 text-blue-300 border-blue-500/40"
                  : "bg-blue-50/80 text-blue-700 border-blue-200"
                : darkMode
                ? "bg-slate-800/30 text-slate-300 border-slate-700/40 hover:bg-slate-800/60"
                : "bg-white/40 text-slate-600 border-slate-200/50 hover:bg-white/70"
            }`}
            title="Alerts"
          >
            <span className={`flex items-center ${isCollapsed ? "gap-0" : "gap-3"}`}>
              <div className="relative">
                <Bell size={18} className={darkMode ? "text-slate-400" : "text-slate-500"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm px-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"
                }`}
              >
                Alerts
              </span>
            </span>

            {!isCollapsed && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div
              className={`absolute bottom-full mb-3 w-80 max-h-[400px] flex flex-col rounded-3xl border shadow-2xl z-50 transition-all duration-300 backdrop-blur-2xl ${
                darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/95 border-slate-100"
              } ${isCollapsed ? "left-0" : "left-full ml-3"}`}
            >
              <div
                className={`p-5 border-b flex justify-between items-center ${
                  darkMode ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div>
                  <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>Admin Alerts</h3>
                  {unreadCount === 0 && (
                    <span className={`text-xs font-medium mt-1 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                      All caught up!
                    </span>
                  )}
                </div>

                {adminNotifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {adminNotifications.length === 0 ? (
                  <div className={`p-6 text-center text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    No alerts right now.
                  </div>
                ) : (
                  adminNotifications.map((notif, index) => {
                    let targetUrl = "/admin/dashboard";
                    if (notif.title.toLowerCase().includes("ticket")) {
                      targetUrl = "/admin/tickets";
                    } else if (
                      notif.title.toLowerCase().includes("material") || 
                      notif.title.toLowerCase().includes("video") || 
                      notif.title.toLowerCase().includes("pdf")
                    ) {
                      targetUrl = "/admin/materials/review";
                    }

                    return (
                      <Link
                        href={targetUrl}
                        key={notif._id || index}
                        onClick={() => setIsNotifOpen(false)}
                        className={`group relative p-4 rounded-2xl flex items-start gap-4 transition-colors duration-300 cursor-pointer ${
                          !notif.isRead
                            ? darkMode
                              ? "bg-blue-950/40 hover:bg-blue-950/70"
                              : "bg-blue-50 hover:bg-blue-100"
                            : darkMode
                            ? "hover:bg-slate-900/50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                            !notif.isRead
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : darkMode
                              ? "bg-slate-800 text-slate-400"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Bell size={14} />
                        </div>
                        <div className="pr-8 flex-1 overflow-hidden">
                          <h4
                            className={`text-sm font-bold truncate ${
                              !notif.isRead
                                ? darkMode
                                  ? "text-blue-300"
                                  : "text-blue-700"
                                : darkMode
                                ? "text-slate-300"
                                : "text-slate-800"
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {notif.message}
                          </p>
                          <span className={`text-[10px] font-medium mt-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteNotification(e, notif._id)}
                          className={`absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                            darkMode
                              ? "hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                              : "hover:bg-red-100 text-slate-400 hover:text-red-600"
                          }`}
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme & Logout Container */}
        <div
          className={`rounded-2xl p-2 space-y-1.5 transition-all duration-300 border backdrop-blur-md ${
            darkMode 
              ? "bg-slate-800/30 border-slate-700/40 shadow-lg shadow-black/20" 
              : "bg-white/40 border-slate-200/50 shadow-sm"
          } ${isCollapsed ? "p-1 bg-transparent border-none shadow-none" : ""}`}
        >
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
              isCollapsed ? "justify-center px-0 py-2.5" : "justify-between"
            } ${
              darkMode ? "text-slate-300 hover:bg-slate-700/80" : "text-slate-600 hover:bg-slate-200/50"
            }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className={`flex items-center ${isCollapsed ? "gap-0" : "gap-3"}`}>
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              <span
                className={`transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"
                }`}
              >
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </span>

            {!isCollapsed && (
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                  darkMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                    darkMode ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3"
            } ${
              darkMode ? "bg-red-600/10 text-red-400 hover:bg-red-600/20" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title="Logout"
          >
            <LogOut size={18} />
            <span
              className={`transition-all duration-300 ${
                isCollapsed ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}