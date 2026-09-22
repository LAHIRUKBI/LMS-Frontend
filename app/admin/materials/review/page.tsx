// src/app/admin/materials/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import axios from "axios";
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Trash2, 
  Search, 
  Filter, 
  User, 
  AlertCircle,
  PlayCircle,
  FileText,
  BookOpen,
  Calendar,
  Clock
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import DeleteConfirmPopup from "@/app/components/MeterialsDeleteConfirmPopup";

export default function ReviewMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals States
  const [rejectItem, setRejectItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const fetchMaterials = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string, reason: string = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/materials/admin/${id}/status`, 
        { status: newStatus, rejectReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectItem(null);
      setRejectReason("");
      fetchMaterials(); 
    } catch (err) {
      alert("An error occurred while updating the status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/materials/admin/${deleteItem._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteItem(null);
      fetchMaterials();
    } catch (err) {
      alert("An error occurred while deleting the material.");
    }
  };

  // 1. Data Filter
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || m.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [materials, searchTerm, filterStatus]);

  // 2. Group by Teacher Object
  const groupedMaterials = useMemo(() => {
    return filteredMaterials.reduce((acc: any, material: any) => {
      const teacher = material.teacherId || { _id: 'unknown', name: "Unknown Teacher" };
      if (!acc[teacher._id]) {
        acc[teacher._id] = {
          teacherInfo: teacher,
          items: []
        };
      }
      acc[teacher._id].items.push(material);
      return acc;
    }, {});
  }, [filteredMaterials]);

  return (
    <div className={`p-3 sm:p-5 lg:p-6 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmPopup 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={handleDelete}
        title="Delete Material"
        itemName={deleteItem?.title}
      />

      {/* Rejection Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-lg font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>Reason for Rejection</h3>
            <p className={`text-xs mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Please provide a valid reason so the teacher can correct the material.</p>
            <textarea
              className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-xs transition-all ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-red-500" : "bg-slate-50 border-slate-200 focus:ring-red-500"}`}
              rows={3}
              placeholder="State the reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2.5 mt-4">
              <button onClick={() => setRejectItem(null)} className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectItem._id, 'rejected', rejectReason)} className="px-4 py-2 font-bold text-xs bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-sm transition-all">Reject Material</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm flex-shrink-0 ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100"}`}>
              <ClipboardCheck size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Materials Approval
              </h2>
              <p className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Review and manage study materials submitted by teachers.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search title or teacher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm"
                }`}
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full pl-9 pr-7 py-2 rounded-xl border font-semibold text-xs outline-none transition-all appearance-none cursor-pointer ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 focus:ring-2 focus:ring-indigo-500/50" : "bg-white border-slate-200 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/50"
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={30} />
            <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading materials...</span>
          </div>
        ) : Object.keys(groupedMaterials).length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center ${darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`flex h-14 w-14 mx-auto items-center justify-center rounded-full mb-2.5 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
              <ClipboardCheck size={26} />
            </div>
            <h3 className={`text-sm font-bold mb-0.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No materials found</h3>
            <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              {searchTerm ? "Try adjusting your search or filter criteria." : "There are no materials waiting for approval right now."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(groupedMaterials).map((group: any) => (
              <div key={group.teacherInfo._id} className={`rounded-xl border p-3 sm:p-4 transition-all shadow-sm ${darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"}`}>
                
                {/* Teacher Header Bar */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border shadow-sm ${darkMode ? "border-slate-700 bg-slate-800" : "border-white bg-slate-200"}`}>
                      {group.teacherInfo.profilePhoto ? (
                        <img 
                          src={`http://localhost:5000/profile_photos/${group.teacherInfo.profilePhoto}`} 
                          alt={group.teacherInfo.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} className={darkMode ? "text-slate-400" : "text-gray-500"} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {group.teacherInfo.name || "Unknown Teacher"}
                        </h3>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${darkMode ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                          {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      <p className={`text-[9px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        ID: {group.teacherInfo.teacherId || "N/A"} • {group.teacherInfo.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Grid Cards (කාඩ්පත් පළල මදක් වැඩි කර ඇත: lg:grid-cols-3 xl:grid-cols-4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {group.items.map((m: any) => (
                    <div 
                      key={m._id} 
                      className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:shadow-md ${
                        darkMode ? "bg-slate-950/60 border-slate-800 hover:border-slate-700" : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Thumbnail / Media Preview with Cover Image Support */}
                        <a 
                          href={`http://localhost:5000${m.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="Click to view full screen"
                          className={`relative aspect-video w-full rounded-lg overflow-hidden border block transition-transform group-hover:scale-[1.01] shadow-sm ${
                            darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-100"
                          }`}
                        >
                          {m.type === 'video' ? (
                            <>
                              <video 
                                src={`http://localhost:5000${m.fileUrl}#t=0.1`} 
                                className="w-full h-full object-cover"
                                preload="metadata"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/50 flex items-center justify-center transition-colors">
                                <PlayCircle size={22} className="text-white drop-shadow" />
                              </div>
                              <span className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                                Video
                              </span>
                            </>
                          ) : m.coverImage ? (
                            <>
                              <img 
                                src={`http://localhost:5000${m.coverImage}`} 
                                alt={m.title} 
                                className="w-full h-full object-cover" 
                              />
                              <span className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                                {m.type}
                              </span>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              {m.type === 'pdf' ? (
                                <FileText size={22} className="text-emerald-500 mb-1" />
                              ) : (
                                <BookOpen size={22} className="text-blue-500 mb-1" />
                              )}
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                {m.type === 'paper' ? 'Paper' : 'PDF'}
                              </span>
                            </div>
                          )}
                        </a>

                        {/* Title & Badges */}
                        <h4 className={`text-xs font-bold line-clamp-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={m.title}>
                          {m.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1">
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                            m.type === 'video' ? darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : m.type === 'pdf' ? darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {m.type}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${darkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}>
                            {m.subject}
                          </span>
                          {m.grade && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${darkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}>
                              {m.grade}
                            </span>
                          )}
                        </div>

                        {/* Description සමඟ Scroll එකක් එකතු කර ඇත (Max Height: 24) */}
                        {m.description && (
                          <div className={`mt-2 p-2 rounded-lg border text-[11px] font-normal leading-relaxed max-h-24 overflow-y-auto scrollbar-thin ${
                            darkMode ? "bg-slate-900/90 border-slate-800 text-slate-300 scrollbar-thumb-slate-700" : "bg-white border-slate-200/70 text-slate-700 scrollbar-thumb-slate-300"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.description}</p>
                          </div>
                        )}

                        {/* Reject Reason Box */}
                        {m.status === 'rejected' && m.rejectReason && (
                          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 flex items-start gap-1.5">
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                            <span><strong>Reason:</strong> {m.rejectReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Date, Time, Status & Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className={`flex items-center gap-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              <Calendar size={11} /> {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              <Clock size={11} /> {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="mt-1">
                            {m.status === 'pending' && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 block text-center">Pending</span>}
                            {m.status === 'approved' && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 block text-center">Approved</span>}
                            {m.status === 'rejected' && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/15 text-red-500 border border-red-500/30 block text-center">Rejected</span>}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          {m.status === 'pending' ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <button onClick={() => handleStatusUpdate(m._id, 'approved')} className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 text-xs font-bold transition-all shadow-sm" title="Approve">
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button onClick={() => setRejectItem(m)} className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold transition-all shadow-sm" title="Reject">
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] font-bold italic text-slate-400 w-full text-center py-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                              Processed
                            </div>
                          )}
                          <button onClick={() => setDeleteItem(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0 border border-slate-200 dark:border-slate-800" title="Delete Material">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}