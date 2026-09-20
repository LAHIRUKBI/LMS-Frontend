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
  Calendar
} from "lucide-react"; 
import { useTheme } from "@/app/context/ThemeContext";
import PublishSuccessPopup from "@/app/components/PublishSuccessPopup";
import DeleteConfirmPopup from "@/app/components/MeterialsDeleteConfirmPopup"; // Make sure this path is correct

export default function MyPDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([]);
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
    fetchPdfs();
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

  const handlePublish = async (id: string, title: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/materials/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPdfs(pdfs.map(pdf => pdf._id === id ? { ...pdf, isPublished: true } : pdf));
      setPublishedItemName(title);
      setIsPublishPopupOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "An error occurred while publishing.");
    }
  };

  // 1. Filter Data based on Search and Active Tab
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

  // Tab Definitions
  const tabs = [
    { id: "all", label: "All Files" },
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
        title="Delete Document"
        itemName={deleteItem?.title}
      />

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section (Modernized) */}
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

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
            <input 
              type="text" 
              placeholder="Search documents by title or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
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
                  ? (darkMode ? "bg-orange-600 text-white shadow-md shadow-orange-900/50" : "bg-orange-600 text-white shadow-md shadow-orange-200")
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
            <Loader2 className="animate-spin text-orange-500" size={36} />
            <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading documents...</span>
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className={`py-16 flex flex-col items-center justify-center text-center rounded-3xl border transition-colors ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
              <FileStack size={36} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No documents found</h3>
            <p className={`text-sm max-w-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              {searchTerm ? "Try adjusting your search criteria to find what you are looking for." : `You don't have any ${activeTab !== 'all' ? activeTab : ''} documents yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPdfs.map((pdf) => (
              <div 
                key={pdf._id} 
                className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.005] ${
                  darkMode 
                    ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700 shadow-xl shadow-black/10" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                
                {/* Document Info Section */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    pdf.type === 'paper' 
                      ? (darkMode ? 'bg-slate-800 text-teal-400 border border-slate-700' : 'bg-slate-50 text-teal-600 border border-slate-100') 
                      : (darkMode ? 'bg-slate-800 text-orange-400 border border-slate-700' : 'bg-slate-50 text-orange-600 border border-slate-100')
                  }`}>
                    <FileText size={22} className={pdf.isPublished ? "opacity-80" : ""} />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className={`font-bold text-sm sm:text-base truncate max-w-[280px] md:max-w-md ${darkMode ? "text-slate-200" : "text-slate-800"}`} title={pdf.title}>
                        {pdf.title}
                      </h3>
                      
                      {/* Status Badges */}
                      {pdf.status === 'pending' && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Pending</span>}
                      {pdf.status === 'approved' && !pdf.isPublished && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>Approved</span>}
                      {pdf.status === 'rejected' && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200"}`}>Rejected</span>}
                      {pdf.isPublished && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"}`}><Globe size={10} /> Published</span>}
                    </div>
                    
                    <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      <span className="flex items-center gap-1.5"><BookOpen size={13} /> {pdf.subject}</span>
                      {pdf.grade && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>{pdf.grade}</span>
                        </>
                      )}
                      <span className="opacity-50">•</span>
                      <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(pdf.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Reject Reason (Inline) */}
                    {pdf.status === 'rejected' && pdf.rejectReason && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-fit">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <span><strong className="font-bold">Reason:</strong> {pdf.rejectReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2.5 sm:justify-end pl-16 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0 border-slate-200 dark:border-slate-800">
                  
                  {/* Publish Button */}
                  {pdf.status === 'approved' && !pdf.isPublished && (
                    <button 
                      onClick={() => handlePublish(pdf._id, pdf.title)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                        darkMode 
                          ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20" 
                          : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20"
                      }`}
                    >
                      <Globe size={14} /> Publish
                    </button>
                  )}

                  {/* View Button */}
                  <a 
                    href={`http://localhost:5000${pdf.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors font-bold text-xs ${
                      darkMode 
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                    }`}
                    title="View Document"
                  >
                    <Eye size={14} /> <span className="hidden sm:inline">View</span>
                  </a>

                  {/* Download Button */}
                  <a 
                    href={`http://localhost:5000${pdf.fileUrl}`} 
                    download
                    className={`p-1.5 rounded-xl transition-colors ${
                      darkMode 
                        ? "hover:bg-slate-800 text-orange-400" 
                        : "hover:bg-orange-50 text-orange-600"
                    }`}
                    title="Download Document"
                  >
                    <Download size={16} />
                  </a>

                  <div className={`h-5 w-px mx-0.5 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}></div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteItem(pdf)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      darkMode 
                        ? "hover:bg-red-500/10 text-slate-500 hover:text-red-400" 
                        : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                    }`}
                    title="Delete Document"
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