// src/app/teacher/materials/my-pdfs/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  FileStack, 
  BookOpen, 
  Loader2, 
  Download, 
  Eye, 
  Trash2, 
  AlertCircle, 
  Globe, 
  Search, 
  FileText,
  Calendar,
  X,
  Check,
  Gift,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";
import PublishSuccessPopup from "@/app/components/PublishSuccessPopup";
import DeleteConfirmPopup from "@/app/components/MeterialsDeleteConfirmPopup";
import MaterialUploadModal from "@/app/components/MaterialUploadModal";

export default function MyPDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [isPublishPopupOpen, setIsPublishPopupOpen] = useState(false);
  const [publishedItemName, setPublishedItemName] = useState("");
  const [deleteItem, setDeleteItem] = useState<any>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Pagination State (4 items per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Class Selection Modal States
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedPdfForPublish, setSelectedPdfForPublish] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isFreeChecked, setIsFreeChecked] = useState(false);

  useEffect(() => {
    fetchPdfs();
    fetchTeacherClasses();
  }, []);

  // Reset to page 1 whenever search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Fetch materials created by the teacher
  const fetchPdfs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredPdfs = res.data.filter((m: any) => m.type === "pdf" || m.type === "paper");
      setPdfs(filteredPdfs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes belonging to the teacher
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

  // Handle material deletion
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/materials/${deleteItem._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPdfs(pdfs.filter((pdf) => pdf._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) {
      alert("An error occurred while deleting the material.");
    }
  };

  // Open the class selection modal for publishing
  const openPublishModal = (pdf: any) => {
    setSelectedPdfForPublish(pdf);
    setSelectedClassIds(pdf.classIds ? pdf.classIds.map((c: any) => c._id || c) : []);
    setIsFreeChecked(pdf.isFree || false);
    setPublishModalOpen(true);
  };

  // Confirm and publish the material to selected classes and/or free status
  const handleConfirmPublish = async () => {
    if (!selectedPdfForPublish) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${selectedPdfForPublish._id}/publish`, {
        classIds: selectedClassIds,
        isFree: isFreeChecked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPdfs(pdfs.map(pdf => pdf._id === selectedPdfForPublish._id ? res.data.material : pdf));
      setPublishedItemName(selectedPdfForPublish.title);
      setPublishModalOpen(false);
      setSelectedPdfForPublish(null);
      setIsPublishPopupOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred while publishing.");
    }
  };

  // Unpublish material completely
  const handleUnpublish = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${id}/publish`, {
        classIds: [],
        isFree: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPdfs(pdfs.map(pdf => pdf._id === id ? res.data.material : pdf));
    } catch (err: any) {
      alert("Failed to unpublish.");
    }
  };

  // Remove a specific class from published classes list
  const handleRemoveSingleClass = async (pdf: any, classIdToRemove: string) => {
    try {
      const updatedClassIds = (pdf.classIds || []).map((c: any) => c._id || c).filter((id: string) => id !== classIdToRemove);
      const token = localStorage.getItem("token");
      
      const res = await axios.put(`http://localhost:5000/api/materials/${pdf._id}/publish`, {
        classIds: updatedClassIds,
        isFree: pdf.isFree
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPdfs(pdfs.map(item => item._id === pdf._id ? res.data.material : item));
    } catch (err: any) {
      alert("Failed to remove class.");
    }
  };

  // Toggle class selection in the publish modal
  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  // Filter PDFs based on search query and active tab
  const filteredPdfs = useMemo(() => {
    return pdfs.filter((pdf) => {
      const matchesSearch = 
        pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pdf.subject.toLowerCase().includes(searchTerm.toLowerCase());
        
      let matchesTab = true;
      if (activeTab === "published") matchesTab = pdf.isPublished;
      else if (activeTab === "approved") matchesTab = pdf.status === "approved" && !pdf.isPublished;
      else if (activeTab === "pending") matchesTab = pdf.status === "pending";
      else if (activeTab === "rejected") matchesTab = pdf.status === "rejected";

      return matchesSearch && matchesTab;
    });
  }, [pdfs, searchTerm, activeTab]);

  // Pagination Logic (4 items per page)
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);
  const paginatedPdfs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPdfs.slice(start, start + itemsPerPage);
  }, [filteredPdfs, currentPage]);

  // Tab configurations
  const tabs = [
    { id: "all", label: "All Files" },
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
        title="Delete Document"
        itemName={deleteItem?.title}
      />

      {/* Upload Modal Component */}
      <MaterialUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchPdfs();
        }}
      />

      {/* Class Selection & Free Option Modal for Publishing */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-4 sm:p-5 rounded-2xl shadow-2xl border ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm sm:text-base font-extrabold">Select Classes & Access to Publish</h3>
              <button onClick={() => setPublishModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Choose classes where this document should be published, or make it Free for everyone.</p>

            {/* Free Option Toggle Selector */}
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
              <p className="text-xs text-center py-3 text-slate-500">No classes created yet.</p>
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
                          ? (darkMode ? "bg-orange-500/10 border-orange-500/50 text-white" : "bg-orange-50 border-orange-300 text-slate-900")
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
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isSelected ? "bg-orange-600 border-orange-600 text-white" : "border-slate-400"}`}>
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 shadow-md shadow-orange-600/20"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-1 sm:px-0">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm shrink-0 ${darkMode ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-white text-orange-600 border border-orange-100"}`}>
                <FileStack size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className={`text-base sm:text-2xl font-extrabold tracking-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                  My Documents
                </h2>
                <p className={`mt-0.5 text-[10px] sm:text-xs font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Manage, view, and publish your uploaded PDFs and Papers.
                </p>
              </div>
            </div>

            {/* Add PDF and Papers Button for Desktop */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hidden sm:flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all active:scale-[0.98] shrink-0"
            >
              <Plus size={16} /> Add PDF and Papers
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {/* Add PDF and Papers Button for Mobile */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="sm:hidden w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add PDF and Papers
            </button>

            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search documents by title or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
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
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
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
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
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
            <Loader2 className="animate-spin text-orange-500" size={30} />
            <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading documents...</span>
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className={`py-12 px-4 flex flex-col items-center justify-center text-center rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <FileStack size={36} className="text-slate-400 mb-2 opacity-60" />
            <h3 className={`text-sm font-bold mb-0.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No documents found</h3>
            <p className="text-xs text-slate-400">Try changing your search terms or filter tabs.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3.5">
              {paginatedPdfs.map((pdf) => (
                <div 
                  key={pdf._id} 
                  className={`group flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
                    darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      
                      <div className={`relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden flex-shrink-0 border flex items-center justify-center ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        {pdf.coverImage || pdf.thumbnail ? (
                          <img 
                            src={pdf.coverImage ? (pdf.coverImage.startsWith('http') ? pdf.coverImage : `http://localhost:5000${pdf.coverImage}`) : (pdf.thumbnail.startsWith('http') ? pdf.thumbnail : `http://localhost:5000${pdf.thumbnail}`)} 
                            alt={pdf.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-orange-500">
                            <FileText size={18} />
                            <span className="text-[8px] font-bold mt-0.5 uppercase">PDF</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <h3 className={`font-bold text-xs sm:text-sm truncate max-w-full ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{pdf.title}</h3>
                          {pdf.status === 'pending' && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Pending</span>}
                          {pdf.status === 'approved' && !pdf.isPublished && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Ready to Publish</span>}
                          {pdf.status === 'rejected' && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Rejected</span>}
                          {pdf.isPublished && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 flex items-center gap-1"><Globe size={9} /> Published</span>}
                          {pdf.isFree && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><Gift size={9} /> Free</span>}
                        </div>
                        
                        <div className={`flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          <span className="flex items-center gap-1"><BookOpen size={11} className="shrink-0" /> {pdf.subject}</span>
                          {pdf.grade && <span>• {pdf.grade}</span>}
                          <span className="flex items-center gap-1">• <Calendar size={11} className="shrink-0" /> {new Date(pdf.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      {pdf.status === 'approved' && (
                        <>
                          <button 
                            onClick={() => openPublishModal(pdf)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/20"
                          >
                            <Globe size={12} /> {pdf.isPublished ? "Edit" : "Publish"}
                          </button>

                          {pdf.isPublished && (
                            <button 
                              onClick={() => handleUnpublish(pdf._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all border border-rose-500/20"
                              title="Unpublish Completely"
                            >
                              Unpublish
                            </button>
                          )}
                        </>
                      )}

                      <a href={`http://localhost:5000${pdf.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-500/10">
                        <Eye size={13} /> View
                      </a>

                      <button onClick={() => setDeleteItem(pdf)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {pdf.status === 'rejected' && (pdf.rejectReason || pdf.adminRejectReason || pdf.reason) && (
                    <div className={`mt-1 p-2.5 rounded-xl border text-[11px] flex items-start gap-1.5 ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold block mb-0.5">Rejection Reason:</span>
                        <span>{pdf.rejectReason || pdf.adminRejectReason || pdf.reason}</span>
                      </div>
                    </div>
                  )}

                  {pdf.isPublished && ((pdf.classIds && pdf.classIds.length > 0) || pdf.isFree) && (
                    <div className={`mt-1 pt-2.5 border-t flex flex-wrap items-center gap-1.5 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Published to:</span>
                      
                      {pdf.isFree && (
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold border flex items-center gap-1 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                          <Gift size={10} /> Free Page
                          <button 
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const res = await axios.put(`http://localhost:5000/api/materials/${pdf._id}/publish`, {
                                classIds: pdf.classIds.map((c: any) => c._id || c),
                                isFree: false
                              }, { headers: { Authorization: `Bearer ${token}` } });
                              setPdfs(pdfs.map(item => item._id === pdf._id ? res.data.material : item));
                            }}
                            className="hover:bg-emerald-500/20 rounded p-0.5 ml-0.5"
                            title="Remove from Free"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      )}

                      {pdf.classIds && pdf.classIds.map((cls: any) => {
                        const classId = cls._id || cls;
                        const displayTitle = cls.grade ? `${cls.grade} - ${cls.medium} (${cls.mode})` : "Class";
                        return (
                          <span key={classId} className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border flex items-center gap-1 ${darkMode ? "bg-slate-800 border-slate-700 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-700"}`}>
                            {displayTitle}
                            <button 
                              onClick={() => handleRemoveSingleClass(pdf, classId)}
                              className="hover:bg-orange-500/20 rounded p-0.5 ml-0.5"
                              title="Remove from this class"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className={`text-xs font-medium text-center sm:text-left ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span> ({filteredPdfs.length} total items)
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