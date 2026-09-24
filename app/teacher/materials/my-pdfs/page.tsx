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
  Check
} from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";
import PublishSuccessPopup from "@/app/components/PublishSuccessPopup";
import DeleteConfirmPopup from "@/app/components/MeterialsDeleteConfirmPopup";

export default function MyPDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [isPublishPopupOpen, setIsPublishPopupOpen] = useState(false);
  const [publishedItemName, setPublishedItemName] = useState("");
  const [deleteItem, setDeleteItem] = useState<any>(null);

  // Class Selection Modal States
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedPdfForPublish, setSelectedPdfForPublish] = useState<any>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  useEffect(() => {
    fetchPdfs();
    fetchTeacherClasses();
  }, []);

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
      setPdfs(pdfs.filter((pdf) => pdf._id !== deleteItem._id));
      setDeleteItem(null);
    } catch (err) {
      alert("An error occurred while deleting the material.");
    }
  };

  const openPublishModal = (pdf: any) => {
    setSelectedPdfForPublish(pdf);
    setSelectedClassIds(pdf.classIds ? pdf.classIds.map((c: any) => c._id || c) : []);
    setPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedPdfForPublish) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${selectedPdfForPublish._id}/publish`, {
        classIds: selectedClassIds
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

  const handleUnpublish = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/materials/${id}/publish`, {
        classIds: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPdfs(pdfs.map(pdf => pdf._id === id ? res.data.material : pdf));
    } catch (err: any) {
      alert("Failed to unpublish.");
    }
  };

  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

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

  const tabs = [
    { id: "all", label: "All Files" },
    { id: "published", label: "Published" },
    { id: "approved", label: "Ready to Publish" },
    { id: "pending", label: "Pending" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className={`p-6 sm:p-8 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      
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

      {/* Class Selection Modal for Publishing */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl border ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold">Select Classes to Publish</h3>
              <button onClick={() => setPublishModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Choose one or more classes where this document should be published.</p>

            {teacherClasses.length === 0 ? (
              <p className="text-sm text-center py-6 text-slate-500">No classes created yet. Please create a class first.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-6">
                {teacherClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls._id);
                  return (
                    <div 
                      key={cls._id}
                      onClick={() => toggleClassSelection(cls._id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? (darkMode ? "bg-orange-500/10 border-orange-500/50 text-white" : "bg-orange-50 border-orange-300 text-slate-900")
                          : (darkMode ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{cls.grade}</span>
                          <span className="text-xs opacity-70">({cls.medium} - {cls.mode})</span>
                        </div>
                        <p className="text-xs opacity-60 mt-0.5">{cls.day} | {cls.startTime} - {cls.endTime}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${isSelected ? "bg-orange-600 border-orange-600 text-white" : "border-slate-400"}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setPublishModalOpen(false)} className={`px-5 py-2.5 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button 
                onClick={handleConfirmPublish}
                disabled={selectedClassIds.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 shadow-md shadow-orange-600/20"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-white text-orange-600 border border-orange-100"}`}>
              <FileStack size={26} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                My Documents
              </h2>
              <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage, view, and publish your uploaded PDFs and Papers.
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
            <input 
              type="text" 
              placeholder="Search documents by title or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                darkMode ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm"
              }`}
            />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                  : (darkMode ? "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm")
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="animate-spin text-orange-500" size={36} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading documents...</span>
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className={`py-16 flex flex-col items-center justify-center text-center rounded-3xl border ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <FileStack size={36} className="text-slate-400 mb-3" />
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No documents found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPdfs.map((pdf) => (
              <div 
                key={pdf._id} 
                className={`group flex flex-col gap-3 p-5 rounded-2xl border transition-all ${
                  darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className={`font-bold text-sm sm:text-base truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{pdf.title}</h3>
                        {pdf.status === 'pending' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">Pending</span>}
                        {pdf.status === 'approved' && !pdf.isPublished && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">Ready to Publish</span>}
                        {pdf.status === 'rejected' && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-400">Rejected</span>}
                        {pdf.isPublished && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 flex items-center gap-1"><Globe size={10} /> Published</span>}
                      </div>
                      
                      <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <span className="flex items-center gap-1.5"><BookOpen size={13} /> {pdf.subject}</span>
                        {pdf.grade && <span>• {pdf.grade}</span>}
                        <span>• <Calendar size={13} className="inline" /> {new Date(pdf.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5">
                    {pdf.status === 'approved' && (
                      <>
                        {!pdf.isPublished ? (
                          <button 
                            onClick={() => openPublishModal(pdf)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20"
                          >
                            <Globe size={14} /> Publish
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUnpublish(pdf._id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                          >
                            Unpublish
                          </button>
                        )}
                      </>
                    )}

                    <a href={`http://localhost:5000${pdf.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1">
                      <Eye size={14} /> View
                    </a>

                    <button onClick={() => setDeleteItem(pdf)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Published Classes List Display under the item */}
                {pdf.isPublished && pdf.classIds && pdf.classIds.length > 0 && (
                  <div className={`mt-2 pt-3 border-t flex flex-wrap items-center gap-2 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Published to Classes:</span>
                    {pdf.classIds.map((cls: any) => (
                      <span key={cls._id || cls} className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border ${darkMode ? "bg-slate-800 border-slate-700 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-700"}`}>
                        {cls.grade ? `${cls.grade} - ${cls.medium} (${cls.mode})` : "Class"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}