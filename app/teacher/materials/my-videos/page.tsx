// src/app/teacher/materials/my-videos/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Film, BookOpen, Loader2, PlayCircle, Trash2, AlertCircle, Globe, Search, Video, Calendar, Clock, CheckCircle2, MoreVertical, ExternalLink } from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";
import PublishSuccessPopup from "@/app/components/PublishSuccessPopup";
import DeleteConfirmPopup from "@/app/components/VideoDeleteConfirmPopup";

export default function MyVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Popups States
  const [isPublishPopupOpen, setIsPublishPopupOpen] = useState(false);
  const [publishedItemName, setPublishedItemName] = useState("");
  const [deleteItem, setDeleteItem] = useState<any>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only videos
      const filteredVideos = res.data.filter((m: any) => m.type === "video");
      setVideos(filteredVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/materials/${deleteItem._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(videos.filter((video) => video._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) {
      alert("An error occurred while deleting the video.");
    }
  };

  const handlePublish = async (id: string, title: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/materials/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state to reflect published status
      setVideos(videos.map(video => video._id === id ? { ...video, isPublished: true } : video));
      
      // Trigger success animation popup
      setPublishedItemName(title);
      setIsPublishPopupOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred while publishing.");
    }
  };

  // Filter Data based on Search and Active Tab
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        video.subject.toLowerCase().includes(searchTerm.toLowerCase());
        
      let matchesTab = true;
      if (activeTab === "published") matchesTab = video.isPublished;
      else if (activeTab === "approved") matchesTab = video.status === "approved" && !video.isPublished;
      else if (activeTab === "pending") matchesTab = video.status === "pending";
      else if (activeTab === "rejected") matchesTab = video.status === "rejected";

      return matchesSearch && matchesTab;
    });
  }, [videos, searchTerm, activeTab]);

  // Tab Definitions
  const tabs = [
    { id: "all", label: "All Videos" },
    { id: "published", label: "Published" },
    { id: "approved", label: "Ready to Publish" },
    { id: "pending", label: "Pending" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className={`p-6 sm:p-8 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      
      {/* Popups */}
      <PublishSuccessPopup 
        isOpen={isPublishPopupOpen} 
        onClose={() => setIsPublishPopupOpen(false)} 
        itemName={publishedItemName}
      />

      <DeleteConfirmPopup 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={handleDeleteConfirm}
        title="Delete Video Lesson"
        itemName={deleteItem?.title}
      />

      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section (Modernized) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100"}`}>
              <Film size={26} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                My Video Lessons
              </h2>
              <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage, view, and publish your uploaded video lessons.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
            <input 
              type="text" 
              placeholder="Search videos by title or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                darkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" 
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm focus:bg-slate-50"
              }`}
            />
          </div>
        </div>

        {/* Tabs Navigation (Pill style) */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? (darkMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50" : "bg-indigo-600 text-white shadow-md shadow-indigo-200")
                  : (darkMode ? "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm")
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading videos...</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className={`py-16 flex flex-col items-center justify-center text-center rounded-3xl border transition-colors ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
              <Video size={36} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No videos found</h3>
            <p className={`text-sm max-w-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              {searchTerm ? "Try adjusting your search criteria to find what you are looking for." : `You don't have any ${activeTab !== 'all' ? activeTab : ''} video lessons yet.`}
            </p>
          </div>
        ) : (
          /* Grid Layout Setup */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredVideos.map((video) => (
              <div 
                key={video._id} 
                className={`group flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 ${
                  darkMode 
                    ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-black/10" 
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                
                {/* 1. Video Preview Area (Top) */}
                <a 
                  href={`http://localhost:5000${video.fileUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`relative w-full aspect-video overflow-hidden group/thumb cursor-pointer block ${
                    darkMode ? "bg-black border-b border-slate-800" : "bg-slate-100 border-b border-slate-200"
                  }`}
                  title="Click to view enlarged in new tab"
                >
                  <video 
                    src={`http://localhost:5000${video.fileUrl}#t=0.1`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  
                  {/* Dark Overlay with Play Icon */}
                  <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover/thumb:bg-indigo-600 group-hover/thumb:border-indigo-500 transition-all shadow-lg">
                      <PlayCircle size={24} className="text-white ml-1" />
                    </div>
                  </div>

                  {/* Top Right Labels */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                    {/* File Format Label */}
                    <div className="bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md font-bold tracking-widest shadow-sm">
                      MP4
                    </div>
                    {/* Status Badge Overlaid on Video */}
                    {video.status === 'pending' && <span className="bg-amber-500/90 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Pending</span>}
                    {video.status === 'approved' && !video.isPublished && <span className="bg-emerald-500/90 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Approved</span>}
                    {video.status === 'rejected' && <span className="bg-red-500/90 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm">Rejected</span>}
                    {video.isPublished && <span className="bg-blue-600/90 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"><Globe size={10} /> Published</span>}
                  </div>
                </a>
                
                {/* 2. Text Information Area (Middle) */}
                <div className="flex-1 p-4 flex flex-col">
                  <h3 className={`font-bold text-sm line-clamp-2 mb-3 group-hover:text-indigo-500 transition-colors ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={video.title}>
                    {video.title}
                  </h3>
                  
                  <div className={`mt-auto flex flex-col gap-1.5 text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <BookOpen size={14} className={darkMode ? "text-slate-500" : "text-slate-400"} /> 
                      <span className="truncate">{video.subject} {video.grade && `• ${video.grade}`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className={darkMode ? "text-slate-500" : "text-slate-400"} /> 
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Reject Reason */}
                  {video.status === 'rejected' && video.rejectReason && (
                    <div className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2"><strong className="font-bold">Reason:</strong> {video.rejectReason}</span>
                    </div>
                  )}
                </div>

                {/* 3. Actions Area (Bottom) */}
                <div className={`p-3 border-t flex items-center justify-between gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
                  
                  {/* Left Side Action (Publish if approved) */}
                  <div className="flex-1">
                    {video.status === 'approved' && !video.isPublished && (
                      <button 
                        onClick={() => handlePublish(video._id, video.title)}
                        className={`flex items-center justify-center w-full gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
                          darkMode 
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" 
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                        }`}
                      >
                        <Globe size={14} /> Publish
                      </button>
                    )}
                  </div>

                  {/* Right Side Actions (Open & Delete) */}
                  <div className="flex items-center gap-1.5">
                    <a 
                      href={`http://localhost:5000${video.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded-lg transition-colors ${
                        darkMode 
                          ? "hover:bg-slate-700 text-slate-400 hover:text-indigo-400" 
                          : "hover:bg-slate-200 text-slate-500 hover:text-indigo-600"
                      }`}
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => setDeleteItem(video)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        darkMode 
                          ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" 
                          : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                      }`}
                      title="Delete Video"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}