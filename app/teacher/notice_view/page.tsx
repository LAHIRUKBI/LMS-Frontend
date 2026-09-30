"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Calendar, Image as ImageIcon, Loader2, X } from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";

interface NoticeItem {
  _id: string;
  title: string;
  message: string;
  targetType: string;
  image?: string;
  createdAt: string;
}

export default function TeacherNoticeView() {
  const { darkMode } = useTheme();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // සම්පූර්ණ Notice එක බැලීම සඳහා Modal එක පාලනය කරන State එක
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userDataString = localStorage.getItem("user");
      
      if (!token || !userDataString) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataString);
      const teacherId = userData._id || userData.id;

      if (!teacherId) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/admin/teacher/notices/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotices(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 md:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl shadow-sm border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
            <Bell size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Official Notices</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Stay updated with the latest announcements from the administration.
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold text-sm border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
          Total: {notices.length}
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading notices...</p>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => {
            const imgUrl = notice.image ? `http://localhost:5000${notice.image}` : null;
            
            return (
              <div 
                key={notice._id} 
                className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  darkMode ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50" : "bg-white border-slate-200 hover:border-indigo-300"
                }`}
              >
                {/* Image Section - Thumbnail (Card view maintains original design) */}
                {imgUrl ? (
                  <div className="w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={imgUrl} alt={notice.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className={`w-full h-32 flex flex-col items-center justify-center gap-2 ${darkMode ? "bg-slate-800/50 text-slate-600" : "bg-slate-50 text-slate-400"}`}>
                    <ImageIcon size={32} className="opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-widest opacity-60">No Image</span>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      darkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                    }`}>
                      {notice.targetType.replace('_', ' ')}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <Calendar size={14} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {notice.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed flex-1 line-clamp-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {notice.message}
                  </p>

                  {/* Read More Button */}
                  <button 
                    onClick={() => setSelectedNotice(notice)}
                    className={`mt-4 w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                      darkMode 
                        ? "bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white" 
                        : "bg-slate-100 hover:bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    Read Full Notice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center h-64 p-8 text-center rounded-2xl border border-dashed ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-300"}`}>
          <div className={`p-4 rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-500" : "bg-white text-slate-400 shadow-sm"}`}>
            <Bell size={32} />
          </div>
          <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No Notices Yet</h3>
          <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>You don't have any announcements at the moment.</p>
        </div>
      )}

      {/* --- Full Notice Modal (Popup) --- */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
          <div 
            className={`relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col ${
              darkMode ? "bg-slate-900 border border-slate-700" : "bg-white"
            }`}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-rose-600 text-white transition-colors z-20 backdrop-blur-md"
              title="Close"
            >
              <X size={20} />
            </button>
            
            {/* Modal Image - Updated to show full uncropped image nicely */}
            {selectedNotice.image && (
              <div className={`w-full flex items-center justify-center flex-shrink-0 border-b ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                <img 
                  src={`http://localhost:5000${selectedNotice.image}`} 
                  alt={selectedNotice.title} 
                  className="w-full h-auto max-h-[60vh] object-contain" 
                />
              </div>
            )}
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
                  darkMode ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                }`}>
                  {selectedNotice.targetType.replace('_', ' ')}
                </span>
                <span className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <Calendar size={16} />
                  {new Date(selectedNotice.createdAt).toLocaleString()}
                </span>
              </div>
              
              <h2 className={`text-xl md:text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                {selectedNotice.title}
              </h2>
              
              <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                {selectedNotice.message}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}