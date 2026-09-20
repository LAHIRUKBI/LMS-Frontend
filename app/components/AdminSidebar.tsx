// src/app/admin/components/AdminSidebar.tsx (හෝ අදාළ ගොනුව)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, UserPlus, Users, LogOut, GraduationCap, Sun, Moon, ShieldPlus, Shield, ClipboardCheck, Bell, Trash2, X } from "lucide-react";
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
      setAdminNotifications([]); // UI එකෙන් අයින් කිරීම
    } catch (error) {
      console.error(error);
    }
  };

  // තනි Notification එකක් මකා දැමීම
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Link එක click වීම වැළැක්වීමට
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notifications/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminNotifications(prev => prev.filter(n => n._id !== id)); // UI එකෙන් අයින් කිරීම
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <Home size={18} /> },
    { name: "Add Teacher", path: "/admin/teachers/add", icon: <UserPlus size={18} /> },
    { name: "Teacher List", path: "/admin/teachers/list", icon: <Users size={18} /> },
    { name: "Add Admin", path: "/admin/register", icon: <ShieldPlus size={18} /> }, 
    { name: "Admin List", path: "/admin/list", icon: <Shield size={18} /> }, 
    { name: "Review Materials", path: "/admin/materials/review", icon: <ClipboardCheck size={20} /> },
    { name: "Tickets", path: "/admin/tickets", icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen w-64 flex-col transition-colors duration-300 z-50 ${
        darkMode ? "bg-[#0F172A] border-r border-slate-800" : "bg-white border-r border-slate-200"
      }`}
    >
      {/* Header / Brand Profile Style (Glassmorphism Card Effect Added) */}
      <div className="p-4 pt-6">
        <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
          darkMode 
            ? "bg-slate-900/40 border-slate-800/80" 
            : "bg-slate-50/60 border-slate-200/60"
        }`}>
          <div className={`relative flex h-14 w-14 items-center justify-center rounded-full mb-2.5 shadow-sm ${
              darkMode ? "bg-slate-800 border border-slate-700" : "bg-blue-50 border border-blue-100"
            }`}
          >
            <div className={`flex items-center justify-center ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              <GraduationCap size={24} />
            </div>
            {/* Active dot */}
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-800"></div>
          </div>
          
          <h2 className={`text-base font-bold tracking-tight text-center ${darkMode ? "text-white" : "text-slate-900"}`}>
            LMS Admin
          </h2>
          <p className={`text-[11px] font-semibold mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Control Panel
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pt-2">
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

      {/* Footer: Notifications, Theme Toggle & Logout */}
      <div className="p-4 pb-6 relative">
        <div className={`rounded-2xl p-3 ${darkMode ? "bg-slate-800/80 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
          
          {/* --- Notifications Toggle --- */}
          <div className="relative w-full mb-2">
            <button 
              onClick={handleOpenAdminNotifications}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                isNotifOpen 
                  ? (darkMode ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm")
                  : (darkMode ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-transparent" : "bg-white text-slate-600 shadow-sm hover:bg-slate-100 border border-slate-200")
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="relative">
                  <Bell size={14} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse"></span>
                  )}
                </div>
                <span>Alerts</span>
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </button>

            {/* Notifications Dropdown (Floats to the right of the sidebar) */}
            {isNotifOpen && (
              <div className={`absolute bottom-0 left-[105%] ml-2 w-80 max-h-[350px] flex flex-col rounded-2xl border shadow-2xl z-50 transform transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                <div className={`p-4 border-b z-10 flex justify-between items-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <div>
                    <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>Admin Alerts</h3>
                    {unreadCount === 0 && <span className={`text-[10px] font-semibold mt-0.5 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>All caught up!</span>}
                  </div>
                  
                  {/* Clear All Button */}
                  {adminNotifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                    >
                      <Trash2 size={12} /> Clear All
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {adminNotifications.length === 0 ? (
                  <div className={`p-6 text-center text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    No alerts right now.
                  </div>
                ) : (
                  adminNotifications.map((notif, index) => {
                    
                    // Notification Title එක අනුව යන්න ඕන පිටුව තීරණය කිරීම
                    let targetUrl = "/admin/dashboard"; 
                    if (notif.title.toLowerCase().includes("ticket")) {
                      targetUrl = "/admin/tickets";
                    } else if (notif.title.toLowerCase().includes("material") || notif.title.toLowerCase().includes("video") || notif.title.toLowerCase().includes("pdf")) {
                      targetUrl = "/admin/materials/review";
                    }

                    return (
                      <Link 
                        href={targetUrl}
                        key={index} 
                        onClick={() => setIsNotifOpen(false)} // Click කළාම Dropdown එක වැහෙනවා
                        className={`group relative p-3 rounded-xl mb-1.5 flex items-start gap-3 transition-colors cursor-pointer ${
                          !notif.isRead 
                            ? (darkMode ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100") 
                            : (darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50")
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                          !notif.isRead 
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" 
                            : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500")
                        }`}>
                          <Bell size={12} />
                        </div>
                        <div className="pr-6"> {/* Delete button එකට ඉඩ තැබීමට pr-6 */}
                          <h4 className={`text-xs font-bold ${
                            !notif.isRead 
                              ? (darkMode ? "text-blue-400" : "text-blue-700") 
                              : (darkMode ? "text-slate-300" : "text-slate-800")
                          }`}>
                            {notif.title}
                          </h4>
                          <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {notif.message}
                          </p>
                          <span className={`text-[9px] font-semibold mt-1.5 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Individual Delete Button */}
                        <button 
                          onClick={(e) => handleDeleteNotification(e, notif._id)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${darkMode ? "hover:bg-red-500/20 text-slate-500 hover:text-red-400" : "hover:bg-red-100 text-slate-400 hover:text-red-600"}`}
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </Link>
                    );
                  })
                )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              darkMode ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700" : "bg-white text-slate-600 shadow-sm hover:bg-slate-100 border border-slate-200"
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