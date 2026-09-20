"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios"; 
import { io } from "socket.io-client"; // <--- Socket.io import කර ඇත
import {
  Home, Video, FileText, BookOpen, LogOut, GraduationCap, Sun, Moon, Film, FileStack, Bell
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  
  // ගුරුවරයාගේ නම සහ ඡායාරූපය පෙන්වීමට State
  const [teacherName, setTeacherName] = useState("LMS Teacher");
  const [teacherPhoto, setTeacherPhoto] = useState<string | null>(null);

  // Notifications State 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    // 1. LocalStorage එකෙන් ඉක්මනින් දත්ත පෙන්වීම
    const loadUserDataLocally = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.name) setTeacherName(parsedUser.name);
        
        const photoName = parsedUser.photo || parsedUser.profilePhoto;
        if (photoName) {
          setTeacherPhoto(`http://localhost:5000/profile_photos/${photoName}`);
        }
      }
    };

    // 2. Database එකෙන් අලුත්ම දත්ත ලබාගැනීම
    const fetchLatestProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/teacher/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data;
        if (data.name) setTeacherName(data.name);
        
        if (data.profilePhoto) {
          setTeacherPhoto(`http://localhost:5000/profile_photos/${data.profilePhoto}`);
          const userData = localStorage.getItem("user");
          if (userData) {
            const parsedUser = JSON.parse(userData);
            parsedUser.profilePhoto = data.profilePhoto;
            localStorage.setItem("user", JSON.stringify(parsedUser));
          }
        }
      } catch (error) {
        console.error("Sidebar profile fetch error:", error);
      }
    };

    // 3. Notifications Load කිරීම සහ Socket Connect කිරීම
    const setupNotifications = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);

        // පරණ Notifications Database එකෙන් ලබාගැනීම
        try {
          const res = await axios.get("http://localhost:5000/api/notifications", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(res.data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }

        // Socket Connection එක සෑදීම
        const socket = io("http://localhost:5000");
        
        if (parsedUser.id) {
           // Admin ගේ reply එක ගුරුවරයාගේ ID එකට එන නිසා room එකට join වෙනවා
           socket.emit("join_user_room", parsedUser.id);
        }

        // අලුත් Notification එකක් ආවම List එකට එකතු කිරීම
        socket.on("receive_notification", (newNotif) => {
           console.log("New Notification received:", newNotif); // Debug කිරීම සඳහා
           setNotifications(prev => [newNotif, ...prev]);
        });

        // Component එක Unmount වෙද්දී Socket එක අයින් කිරීම
        return () => {
          socket.disconnect();
        };
      }
    };

    loadUserDataLocally();
    fetchLatestProfile();
    const cleanupSocket = setupNotifications(); // Socket setup එක run කිරීම

    window.addEventListener("profileUpdated", loadUserDataLocally);

    return () => {
      window.removeEventListener("profileUpdated", loadUserDataLocally);
      cleanupSocket.then(cleanup => cleanup && cleanup());
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleOpenNotifications = async () => {
    setIsNotifOpen(!isNotifOpen);
    
    // Dropdown එක Open කරද්දී ඒවා Read කරා යැයි Backend එකට යැවීම
    if (!isNotifOpen && unreadCount > 0) {
      try {
        const token = localStorage.getItem("token");
        await axios.put("http://localhost:5000/api/notifications/mark-read", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Local state එක update කිරීම
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: <Home size={18} /> },
    { name: "Upload Video", path: "/teacher/materials/video", icon: <Video size={18} /> },
    { name: "Upload PDF", path: "/teacher/materials/pdf", icon: <FileText size={18} /> },
    { name: "Upload Paper", path: "/teacher/materials/paper", icon: <BookOpen size={18} /> },
    { name: "My Videos", path: "/teacher/materials/my-videos", icon: <Film size={18} /> },
    { name: "My PDFs & Papers", path: "/teacher/materials/my-pdfs", icon: <FileStack size={18} /> },
    { name: "Ticket", path: "/teacher/tickets", icon: <FileStack size={18} /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen w-64 flex-col transition-colors duration-300 z-50 ${
        darkMode ? "bg-[#0F172A] border-r border-slate-800" : "bg-white border-r border-slate-200"
      }`}
    >
      {/* Header / Brand Profile Style */}
      <Link href="/teacher/profile" className="flex flex-col items-center justify-center pb-4 pt-8 px-4 cursor-pointer group">
        <div className={`relative flex h-14 w-14 items-center justify-center rounded-full mb-3 shadow-sm transition-transform group-hover:scale-105 ${
            darkMode ? "bg-slate-800 border border-slate-700" : "bg-indigo-50 border border-indigo-100"
          }`}
        >
          {teacherPhoto ? (
            <img 
              src={teacherPhoto} 
              alt={teacherName} 
              className="h-full w-full object-cover rounded-full" 
            />
          ) : (
            <div className={`flex items-center justify-center ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              <GraduationCap size={24} />
            </div>
          )}
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-800"></div>
        </div>
        
        <h2 className={`text-lg font-bold tracking-tight text-center ${darkMode ? "text-white" : "text-slate-900"} group-hover:text-indigo-500 transition-colors`}>
          {teacherName}
        </h2>
        <p className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          View Profile
        </p>
      </Link>

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
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-100/50 shadow-sm"
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
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full ${darkMode ? "bg-indigo-400" : "bg-indigo-600"}`} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Notifications, Theme & Logout */}
      <div className="p-4 pb-6 relative">
        <div className={`rounded-2xl p-3 ${darkMode ? "bg-slate-800/80 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
          
          {/* Notifications Toggle */}
          <div className="relative w-full mb-2">
            <button 
              onClick={handleOpenNotifications}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                isNotifOpen 
                  ? (darkMode ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm")
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
                <span>Notifications</span>
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
                  <h3 className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>Notifications</h3>
                  {unreadCount === 0 && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>All caught up!</span>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className={`p-6 text-center text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif, index) => {
                    
                    // Notification Title එක අනුව යන්න ඕන පිටුව තීරණය කිරීම
                    let targetUrl = "/teacher/dashboard"; 
                    if (notif.title.toLowerCase().includes("ticket") || notif.title.toLowerCase().includes("reply")) {
                      targetUrl = notif.ticketId 
                        ? `/teacher/tickets?ticketId=${notif.ticketId}` 
                        : "/teacher/tickets";
                    }
                    // අනාගතයේදී අලුත් Material එකක් Approve වුණොත් යන්න ඕන තැන මෙතනට දාන්න පුළුවන්

                    return (
                      <Link 
                        href={targetUrl}
                        key={index} 
                        onClick={() => setIsNotifOpen(false)} // Click කළාම Dropdown එක වැහෙනවා
                        className={`p-3 rounded-xl mb-1.5 flex items-start gap-3 transition-colors cursor-pointer ${
                          !notif.isRead 
                            ? (darkMode ? "bg-indigo-500/10 hover:bg-indigo-500/20" : "bg-indigo-50 hover:bg-indigo-100") 
                            : (darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50")
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                          !notif.isRead 
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                            : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500")
                        }`}>
                          <Bell size={12} />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${
                            !notif.isRead 
                              ? (darkMode ? "text-indigo-400" : "text-indigo-700") 
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
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${darkMode ? "bg-indigo-500" : "bg-slate-300"}`}>
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