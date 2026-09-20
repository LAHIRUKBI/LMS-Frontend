// src/app/teacher/materials/my-videos/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Film, BookOpen, Loader2, PlayCircle, Trash2, AlertCircle, Globe, Search, Video, Calendar, Clock, CheckCircle2, MoreVertical } from "lucide-react"; 
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

      <div className="max-w-7xl mx-auto">
        
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
          <div className="grid grid-cols-1 gap-4">
            {filteredVideos.map((video) => (
              <div 
                key={video._id} 
                className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.005] ${
                  darkMode 
                    ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700 shadow-xl shadow-black/10" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                
                {/* Video Info Section */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    darkMode ? 'bg-slate-800 text-indigo-400 border border-slate-700' : 'bg-slate-50 text-indigo-600 border border-slate-100'
                  }`}>
                    <PlayCircle size={22} className={video.isPublished ? "fill-indigo-500/20" : ""} />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className={`font-bold text-sm sm:text-base truncate max-w-[280px] md:max-w-md ${darkMode ? "text-slate-200" : "text-slate-800"}`} title={video.title}>
                        {video.title}
                      </h3>
                      
                      {/* Status Badges */}
                      {video.status === 'pending' && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Pending</span>}
                      {video.status === 'approved' && !video.isPublished && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>Approved</span>}
                      {video.status === 'rejected' && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200"}`}>Rejected</span>}
                      {video.isPublished && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"}`}><Globe size={10} /> Published</span>}
                    </div>
                    
                    <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="flex items-center gap-1.5"><BookOpen size={13} /> {video.subject}</span>
                      {video.grade && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>{video.grade}</span>
                        </>
                      )}
                      <span className="opacity-50">•</span>
                      <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Reject Reason (Inline) */}
                    {video.status === 'rejected' && video.rejectReason && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-fit">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <span><strong className="font-bold">Reason:</strong> {video.rejectReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2.5 sm:justify-end pl-16 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0 border-slate-200 dark:border-slate-800">
                  
                  {/* Publish Button */}
                  {video.status === 'approved' && !video.isPublished && (
                    <button 
                      onClick={() => handlePublish(video._id, video.title)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                        darkMode 
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" 
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                      }`}
                    >
                      <Globe size={14} /> Publish
                    </button>
                  )}

                  {/* Watch Button */}
                  <a 
                    href={`http://localhost:5000${video.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors font-bold text-xs ${
                      darkMode 
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                    }`}
                    title="Watch Video"
                  >
                    <PlayCircle size={14} /> <span>Watch</span>
                  </a>

                  <div className={`h-5 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}></div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteItem(video)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      darkMode 
                        ? "hover:bg-red-500/10 text-slate-500 hover:text-red-400" 
                        : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                    }`}
                    title="Delete Video"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}