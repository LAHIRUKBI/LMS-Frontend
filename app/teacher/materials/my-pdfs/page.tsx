// src/app/teacher/materials/my-pdfs/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FileStack, BookOpen, Loader2, Download, Eye, Trash2, AlertCircle, Globe, Search, Filter, FileText } from "lucide-react"; 
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
        title="Delete Document"
        itemName={deleteItem?.title}
      />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl ${darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
            <FileStack size={28} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>My Documents</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Manage, view, and publish your uploaded PDFs.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:ring-2 outline-none text-sm transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-orange-500" : "bg-white border-slate-300 focus:ring-orange-500"}`}
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
                ? (darkMode ? "bg-orange-600 text-white shadow-md" : "bg-orange-600 text-white shadow-md")
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
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      ) : filteredPdfs.length === 0 ? (
        <div className={`p-12 flex flex-col items-center justify-center text-center rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200 shadow-sm"}`}>
          <FileText size={48} className={`mb-4 ${darkMode ? "text-slate-600" : "text-gray-300"}`} />
          <h3 className={`text-lg font-medium mb-1 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>No documents found</h3>
          <p className={`text-sm ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
            {searchTerm ? "Try adjusting your search criteria." : `You don't have any ${activeTab !== 'all' ? activeTab : ''} documents yet.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPdfs.map((pdf) => (
            <div 
              key={pdf._id} 
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${darkMode ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-gray-200 hover:border-orange-200"}`}
            >
              
              {/* Document Info Section */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`mt-1 p-2.5 rounded-lg flex-shrink-0 ${pdf.type === 'paper' ? (darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600') : (darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600')}`}>
                  <FileText size={20} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold text-[15px] truncate max-w-[300px] md:max-w-md ${darkMode ? "text-slate-100" : "text-gray-900"}`} title={pdf.title}>
                      {pdf.title}
                    </h3>
                    
                    {/* Status Badges */}
                    {pdf.status === 'pending' && <span className="text-yellow-700 bg-yellow-100 border border-yellow-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pending</span>}
                    {pdf.status === 'approved' && !pdf.isPublished && <span className="text-green-700 bg-green-100 border border-green-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Approved</span>}
                    {pdf.status === 'rejected' && <span className="text-red-700 bg-red-100 border border-red-200 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Rejected</span>}
                    {pdf.isPublished && <span className="text-blue-700 bg-blue-100 border border-blue-200 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider"><Globe size={10} /> Published</span>}
                  </div>
                  
                  <div className={`flex items-center gap-3 text-[13px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {pdf.subject} {pdf.grade && `• ${pdf.grade}`}</span>
                    <span>•</span>
                    <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Reject Reason (Inline) */}
                  {pdf.status === 'rejected' && pdf.rejectReason && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={12} />
                      <span><strong>Reason:</strong> {pdf.rejectReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-2 pl-12 md:pl-0">
                
                {/* Publish Button */}
                {pdf.status === 'approved' && !pdf.isPublished && (
                  <button 
                    onClick={() => handlePublish(pdf._id, pdf.title)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  >
                    <Globe size={14} /> Publish
                  </button>
                )}

                {/* View Button */}
                <a 
                  href={`http://localhost:5000${pdf.fileUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-gray-100 text-gray-600"}`}
                  title="View Document"
                >
                  <Eye size={18} />
                </a>

                {/* Download Button */}
                <a 
                  href={`http://localhost:5000${pdf.fileUrl}`} 
                  download
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-700 text-indigo-400" : "hover:bg-indigo-50 text-indigo-600"}`}
                  title="Download Document"
                >
                  <Download size={18} />
                </a>

                {/* Vertical Divider */}
                <div className={`h-6 w-px mx-1 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></div>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteItem(pdf)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-600"}`}
                  title="Delete Document"
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