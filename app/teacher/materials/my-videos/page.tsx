// src/app/teacher/materials/my-videos/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Film, BookOpen, Loader2, PlayCircle, Trash2, AlertCircle, Globe, Search, Video } from "lucide-react"; 
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
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      
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

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <Film size={28} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>My Video Lessons</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Manage, view, and publish your uploaded video lessons.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
          <input 
            type="text" 
            placeholder="Search videos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:ring-2 outline-none text-sm transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-indigo-500" : "bg-white border-slate-300 focus:ring-indigo-500"}`}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? (darkMode ? "bg-indigo-600 text-white shadow-md" : "bg-indigo-600 text-white shadow-md")
                : (darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200")
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className={`p-12 flex flex-col items-center justify-center text-center rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200 shadow-sm"}`}>
          <Video size={48} className={`mb-4 ${darkMode ? "text-slate-600" : "text-gray-300"}`} />
          <h3 className={`text-lg font-medium mb-1 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>No videos found</h3>
          <p className={`text-sm ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
            {searchTerm ? "Try adjusting your search criteria." : `You don't have any ${activeTab !== 'all' ? activeTab : ''} video lessons yet.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredVideos.map((video) => (
            <div 
              key={video._id} 
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${darkMode ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-gray-200 hover:border-indigo-200"}`}
            >
              
              {/* Video Info Section */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`mt-1 p-2.5 rounded-lg flex-shrink-0 ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Film size={20} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold text-[15px] truncate max-w-[300px] md:max-w-md ${darkMode ? "text-slate-100" : "text-gray-900"}`} title={video.title}>
                      {video.title}
                    </h3>
                    
                    {/* Status Badges */}
                    {video.status === 'pending' && <span className="text-yellow-700 bg-yellow-100 border border-yellow-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pending</span>}
                    {video.status === 'approved' && !video.isPublished && <span className="text-green-700 bg-green-100 border border-green-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Approved</span>}
                    {video.status === 'rejected' && <span className="text-red-700 bg-red-100 border border-red-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Rejected</span>}
                    {video.isPublished && <span className="text-blue-700 bg-blue-100 border border-blue-200 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider"><Globe size={10} /> Published</span>}
                  </div>
                  
                  <div className={`flex items-center gap-3 text-[13px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {video.subject} {video.grade && `• ${video.grade}`}</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Reject Reason (Inline) */}
                  {video.status === 'rejected' && video.rejectReason && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={12} />
                      <span><strong>Reason:</strong> {video.rejectReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-2 pl-12 md:pl-0">
                
                {/* Publish Button */}
                {video.status === 'approved' && !video.isPublished && (
                  <button 
                    onClick={() => handlePublish(video._id, video.title)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  >
                    <Globe size={14} /> Publish
                  </button>
                )}

                {/* Watch Button */}
                <a 
                  href={`http://localhost:5000${video.fileUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors font-medium text-sm ${darkMode ? "hover:bg-slate-700 text-indigo-400" : "hover:bg-indigo-50 text-indigo-600"}`}
                  title="Watch Video"
                >
                  <PlayCircle size={18} /> <span className="hidden sm:inline text-xs">Watch</span>
                </a>

                {/* Vertical Divider */}
                <div className={`h-6 w-px mx-1 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteItem(video)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-600"}`}
                  title="Delete Video"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}