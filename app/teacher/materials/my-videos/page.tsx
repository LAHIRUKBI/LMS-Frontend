// src/app/teacher/materials/my-videos/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Film, BookOpen, Loader2, PlayCircle, Trash2, AlertCircle, Globe, Search, Video, Calendar, Clock, CheckCircle2, MoreVertical, ExternalLink, X, Check, Gift, ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";
import PublishSuccessPopup from "@/app/components/PublishSuccessPopup";
import DeleteConfirmPopup from "@/app/components/VideoDeleteConfirmPopup";
import VideoUploadModal from "@/app/components/VideoUploadModal";

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

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Pagination State (4 items per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Class Selection Modal States (Publish කිරීම සඳහා)
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedVideoForPublish, setSelectedVideoForPublish] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isFreeChecked, setIsFreeChecked] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchTeacherClasses();
  }, []);

  // Reset to page 1 whenever search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredVideos = res.data.filter((m: any) => m.type === "video");
      setVideos(filteredVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/classes/my-classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeacherClasses(res.data);
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
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

  const openPublishModal = (video: any) => {
    setSelectedVideoForPublish(video);
    setSelectedClassIds(video.classIds ? video.classIds.map((c: any) => c._id || c) : []);
    setIsFreeChecked(video.isFree || false);
    setPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedVideoForPublish) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${selectedVideoForPublish._id}/publish`, {
        classIds: selectedClassIds,
        isFree: isFreeChecked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVideos(videos.map(video => video._id === selectedVideoForPublish._id ? res.data.material : video));
      setPublishedItemName(selectedVideoForPublish.title);
      setPublishModalOpen(false);
      setSelectedVideoForPublish(null);
      setIsPublishPopupOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred while publishing.");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${id}/publish`, {
        classIds: [],
        isFree: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.map(video => video._id === id ? res.data.material : video));
    } catch (err: any) {
      alert("Failed to unpublish.");
    }
  };

  const handleRemoveSingleClass = async (video: any, classIdToRemove: string) => {
    try {
      const updatedClassIds = (video.classIds || []).map((c: any) => c._id || c).filter((id: string) => id !== classIdToRemove);
      const token = localStorage.getItem("token");
      
      const res = await axios.put(`http://localhost:5000/api/materials/${video._id}/publish`, {
        classIds: updatedClassIds,
        isFree: video.isFree
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVideos(videos.map(item => item._id === video._id ? res.data.material : item));
    } catch (err: any) {
      alert("Failed to remove class.");
    }
  };

  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

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

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(start, start + itemsPerPage);
  }, [filteredVideos, currentPage]);

  const tabs = [
    { id: "all", label: "All Videos" },
    { id: "published", label: "Published" },
    { id: "approved", label: "Ready to Publish" },
    { id: "pending", label: "Pending" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className={`p-4 sm:p-6 min-h-screen transition-colors duration-300 font-sans w-full overflow-x-hidden ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      
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

      <VideoUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchVideos();
        }}
      />

      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-4 sm:p-5 rounded-2xl shadow-2xl border ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm sm:text-base font-extrabold">Select Classes & Access to Publish Video</h3>
              <button onClick={() => setPublishModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Choose classes where this video should be published, or make it Free for everyone.</p>

            <div 
              onClick={() => setIsFreeChecked(!isFreeChecked)}
              className={`mb-4 p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                isFreeChecked 
                  ? (darkMode ? "bg-emerald-500/10 border-emerald-500/50 text-white" : "bg-emerald-50 border-emerald-300 text-slate-900")
                  : (darkMode ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isFreeChecked ? "bg-emerald-600 text-white" : "bg-slate-500/20 text-slate-400"}`}>
                  <Gift size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Make it Free (Public)</h4>
                  <p className="text-[10px] opacity-70">Visible to registered and unregistered students.</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isFreeChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-400"}`}>
                {isFreeChecked && <Check size={12} />}
              </div>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Select Classes</div>
            {teacherClasses.length === 0 ? (
              <p className="text-xs text-center py-3 text-slate-500">No classes created yet. Please create a class first.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 mb-4">
                {teacherClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls._id);
                  return (
                    <div 
                      key={cls._id}
                      onClick={() => toggleClassSelection(cls._id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? (darkMode ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-indigo-50 border-indigo-300 text-slate-900")
                          : (darkMode ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{cls.grade}</span>
                          <span className="text-[10px] opacity-70">({cls.medium} - {cls.mode})</span>
                        </div>
                        <p className="text-[10px] opacity-60 mt-0.5">{cls.day} | {cls.startTime} - {cls.endTime}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-400"}`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setPublishModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button 
                onClick={handleConfirmPublish}
                disabled={selectedClassIds.length === 0 && !isFreeChecked}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-md"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-2 sm:px-0">
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm shrink-0 ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100"}`}>
                <Film size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className={`text-base sm:text-2xl font-extrabold tracking-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                  My Video Lessons
                </h2>
                <p className={`mt-0.5 text-[10px] sm:text-xs font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Manage, view, and publish your uploaded video lessons.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hidden sm:flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] shrink-0"
            >
              <Plus size={16} /> Upload Video
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="sm:hidden w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Upload Video
            </button>

            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search videos by title or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Responsive Filter Options (Grid for Mobile & Scrollable Tabs for Desktop) */}
        <div className="mb-5">
          {/* Mobile View: Grid Layout (පේළියකට 2 බැගින් තිරය ඇතුළටම ලස්සනට පෙන්වයි) */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center truncate ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : (darkMode ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-white text-slate-600 border border-slate-200 shadow-sm")
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop/Tablet View: Horizontal Scrollable Tabs */}
          <div className="hidden sm:flex overflow-x-auto gap-1.5 pb-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : (darkMode ? "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm")
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={30} />
            <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading videos...</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className={`py-12 px-4 flex flex-col items-center justify-center text-center rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <Video size={36} className="text-slate-400 mb-2 opacity-60" />
            <h3 className={`text-sm font-bold mb-0.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No videos found</h3>
            <p className="text-xs text-slate-400">Try changing your search terms or filter tabs.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedVideos.map((video) => (
                <div 
                  key={video._id} 
                  className={`group flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-xl ${
                    darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  
                  <a 
                    href={`http://localhost:5000${video.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`relative w-full aspect-video overflow-hidden group/thumb cursor-pointer block ${
                      darkMode ? "bg-black border-b border-slate-800" : "bg-slate-100 border-b border-slate-200"
                    }`}
                  >
                    <video 
                      src={`http://localhost:5000${video.fileUrl}#t=0.1`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    
                    <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 flex items-center justify-center transition-colors">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover/thumb:bg-indigo-600 transition-all shadow-md">
                        <PlayCircle size={20} className="text-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <div className="bg-black/70 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-widest shadow-sm">
                        MP4
                      </div>
                      {video.status === 'pending' && <span className="bg-amber-500/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Pending</span>}
                      {video.status === 'approved' && !video.isPublished && <span className="bg-emerald-500/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Approved</span>}
                      {video.status === 'rejected' && <span className="bg-red-500/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Rejected</span>}
                      {video.isPublished && <span className="bg-blue-600/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5"><Globe size={8} /> Published</span>}
                      {video.isFree && <span className="bg-emerald-600/90 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5"><Gift size={8} /> Free</span>}
                    </div>
                  </a>
                  
                  <div className="flex-1 p-3.5 flex flex-col">
                    <h3 className={`font-bold text-xs sm:text-sm line-clamp-2 mb-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={video.title}>
                      {video.title}
                    </h3>
                    
                    <div className={`mt-auto flex flex-col gap-1 text-[11px] font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <BookOpen size={13} className="shrink-0" /> 
                        <span className="truncate">{video.subject} {video.grade && `• ${video.grade}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0" /> 
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {video.isPublished && ((video.classIds && video.classIds.length > 0) || video.isFree) && (
                      <div className={`mt-2.5 pt-2.5 border-t flex flex-wrap gap-1 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase w-full">Published to:</span>
                        
                        {video.isFree && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border flex items-center gap-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                            <Gift size={9} /> Free Page
                            <button 
                              onClick={async () => {
                                const token = localStorage.getItem("token");
                                const res = await axios.put(`http://localhost:5000/api/materials/${video._id}/publish`, {
                                  classIds: video.classIds.map((c: any) => c._id || c),
                                  isFree: false
                                }, { headers: { Authorization: `Bearer ${token}` } });
                                setVideos(videos.map(item => item._id === video._id ? res.data.material : item));
                              }}
                              className="hover:bg-emerald-500/20 rounded p-0.5 ml-0.5"
                              title="Remove from Free"
                            >
                              <X size={9} />
                            </button>
                          </span>
                        )}

                        {video.classIds && video.classIds.map((cls: any) => {
                          const classId = cls._id || cls;
                          const displayTitle = cls.grade ? `${cls.grade} - ${cls.medium}` : "Class";
                          return (
                            <span key={classId} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border flex items-center gap-1 ${darkMode ? "bg-slate-800 border-slate-700 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                              {displayTitle}
                              <button 
                                onClick={() => handleRemoveSingleClass(video, classId)}
                                className="hover:bg-indigo-500/20 rounded p-0.5 ml-0.5"
                                title="Remove from this class"
                              >
                                <X size={9} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {video.status === 'rejected' && video.rejectReason && (
                      <div className="mt-2.5 flex items-start gap-1 text-[10px] font-medium text-red-500 bg-red-500/10 px-2 py-1.5 rounded-xl border border-red-500/20">
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2"><strong className="font-bold">Reason:</strong> {video.rejectReason}</span>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 border-t flex items-center justify-between gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
                    <div className="flex-1 flex gap-1.5">
                      {video.status === 'approved' && (
                        <>
                          <button 
                            onClick={() => openPublishModal(video)}
                            className="flex items-center justify-center flex-1 gap-1 py-1.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                          >
                            <Globe size={12} /> {video.isPublished ? "Edit" : "Publish"}
                          </button>

                          {video.isPublished && (
                            <button 
                              onClick={() => handleUnpublish(video._id)}
                              className="flex items-center justify-center px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all border border-rose-500/20"
                              title="Unpublish All"
                            >
                              Unpublish
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <a href={`http://localhost:5000${video.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-slate-700/20 text-slate-400" title="Open in new tab">
                        <ExternalLink size={15} />
                      </a>
                      <button onClick={() => setDeleteItem(video)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400" title="Delete Video">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className={`text-xs font-medium text-center sm:text-left ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> ({filteredVideos.length} total videos)
                </span>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex-1 sm:flex-initial ${
                      currentPage === 1 
                        ? "opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-800" 
                        : (darkMode ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm")
                    }`}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex-1 sm:flex-initial ${
                      currentPage === totalPages 
                        ? "opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-800" 
                        : (darkMode ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm")
                    }`}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}