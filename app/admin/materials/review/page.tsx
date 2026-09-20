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
  BookOpen
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

  // 2. Group by Teacher Object (To access photo, email, etc.)
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
    <div className={`p-6 sm:p-8 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50/80"}`}>
      
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
          <div className={`w-full max-w-md p-7 rounded-3xl shadow-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>Reason for Rejection</h3>
            <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Please provide a valid reason so the teacher can correct the material.</p>
            <textarea
              className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:ring-red-500" : "bg-slate-50 border-slate-200 focus:ring-red-500"}`}
              rows={4}
              placeholder="State the reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setRejectItem(null)} className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectItem._id, 'rejected', rejectReason)} className="px-5 py-2.5 font-bold text-sm bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-md shadow-red-600/20 transition-all hover:scale-[1.02]">Reject Material</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section (Modernized) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white text-indigo-600 border border-indigo-100"}`}>
              <ClipboardCheck size={26} strokeWidth={2} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                Materials Approval
              </h2>
              <p className={`mt-1 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Review and manage study materials submitted by teachers.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input 
                type="text" 
                placeholder="Search title or teacher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm focus:bg-slate-50"
                }`}
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <Filter className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full pl-10 pr-8 py-2.5 rounded-xl border font-semibold text-sm outline-none transition-all appearance-none cursor-pointer ${
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
        <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all ${darkMode ? "border-slate-800 bg-[#0F172A] shadow-black/20" : "border-slate-200 bg-white shadow-slate-200/40"}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Loading materials...</span>
            </div>
          ) : Object.keys(groupedMaterials).length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full mb-4 ${darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"}`}>
                <ClipboardCheck size={36} />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>No materials found</h3>
              <p className={`text-sm max-w-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                {searchTerm ? "Try adjusting your search or filter criteria." : "There are no materials waiting for approval right now."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-sm border-collapse">
                <thead className={`text-[11px] uppercase tracking-wider font-bold ${darkMode ? "bg-slate-900/80 text-slate-400 border-b border-slate-800" : "bg-slate-50 text-slate-500 border-b border-slate-200"}`}>
                  <tr>
                    <th className="p-5 font-bold">Material Info</th>
                    <th className="p-5 font-bold whitespace-nowrap">Date & Time</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-slate-800/50" : "divide-slate-100"}`}>
                  {Object.values(groupedMaterials).map((group: any) => (
                    <React.Fragment key={group.teacherInfo._id}>
                      
                      {/* Teacher Group Header Row */}
                      <tr className={`group transition-colors ${darkMode ? "bg-indigo-950/20 hover:bg-indigo-950/40" : "bg-indigo-50/50 hover:bg-indigo-50"}`}>
                        <td colSpan={4} className="p-4 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                          <div className="flex items-center gap-4 pl-2">
                            {/* Profile Photo */}
                            <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border-2 shadow-sm ${darkMode ? "border-slate-700 bg-slate-800" : "border-white bg-slate-200"}`}>
                              {group.teacherInfo.profilePhoto ? (
                                <img 
                                  src={`http://localhost:5000/profile_photos/${group.teacherInfo.profilePhoto}`} 
                                  alt={group.teacherInfo.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={20} className={darkMode ? "text-slate-400" : "text-gray-500"} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 mb-0.5">
                                <span className={`text-sm font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>{group.teacherInfo.name || "Unknown Teacher"}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${darkMode ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white border border-indigo-200 text-indigo-700 shadow-sm"}`}>
                                  {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                                </span>
                              </div>
                              <div className={`text-[11px] font-semibold flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                <span>{group.teacherInfo.teacherId || "ID N/A"}</span>
                                <span className="opacity-50">•</span>
                                <span>{group.teacherInfo.email || "Email N/A"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Material Rows for this Teacher */}
                      {group.items.map((m: any) => (
                        <tr key={m._id} className={`transition-all hover:shadow-md hover:relative hover:z-10 ${darkMode ? "bg-slate-900/50 hover:bg-slate-800/80" : "bg-white hover:bg-slate-50"}`}>
                          <td className="p-5 pl-8 sm:pl-10">
                            
                            <div className="flex items-start sm:items-center gap-5">
                              
                              {/* 
                                  Thumbnail / Video Preview embedded inside the table cell 
                                  Clicking this will open the file in a new tab 
                              */}
                              <a 
                                href={`http://localhost:5000${m.fileUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="Click to view full screen"
                                className={`relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-xl overflow-hidden group/thumb border transition-all cursor-pointer block shadow-sm hover:shadow-md ${
                                  darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-100"
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
                                      <PlayCircle size={32} className="text-white/80 group-hover/thumb:text-white group-hover/thumb:scale-110 transition-all shadow-sm rounded-full" />
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      Video
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center transition-colors group-hover/thumb:bg-indigo-50 dark:group-hover/thumb:bg-indigo-500/10">
                                    {m.type === 'pdf' ? (
                                      <FileText size={28} className="text-emerald-500 mb-1 group-hover/thumb:scale-110 transition-transform" />
                                    ) : (
                                      <BookOpen size={28} className="text-blue-500 mb-1 group-hover/thumb:scale-110 transition-transform" />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                      {m.type === 'paper' ? 'Paper' : 'PDF'}
                                    </span>
                                  </div>
                                )}
                              </a>

                              {/* Material Text Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm sm:text-base line-clamp-2 mb-1.5 ${darkMode ? "text-slate-100" : "text-slate-800"}`} title={m.title}>
                                  {m.title}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                                    m.type === 'video' ? darkMode ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : m.type === 'pdf' ? darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}>
                                    {m.type}
                                  </span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200 shadow-sm"}`}>
                                    {m.subject}
                                  </span>
                                  {m.grade && (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${darkMode ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200 shadow-sm"}`}>
                                      {m.grade}
                                    </span>
                                  )}
                                </div>
                                
                                {m.description && (
                                  <p className={`text-xs mt-1 line-clamp-2 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    {m.description}
                                  </p>
                                )}

                                {/* Reject Reason Warning Box (Inline) */}
                                {m.status === 'rejected' && m.rejectReason && (
                                  <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-fit">
                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <span><strong className="font-bold">Reason:</strong> {m.rejectReason}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Date & Time */}
                          <td className="p-5 align-middle whitespace-nowrap">
                            <div className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{new Date(m.createdAt).toLocaleDateString()}</div>
                            <div className={`text-[11px] font-semibold mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                          </td>
                          
                          {/* Status */}
                          <td className="p-5 align-middle whitespace-nowrap">
                            {m.status === 'pending' && <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${darkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"}`}>Pending</span>}
                            {m.status === 'approved' && <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>Approved</span>}
                            {m.status === 'rejected' && <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${darkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200"}`}>Rejected</span>}
                          </td>
                          
                          {/* Actions */}
                          <td className="p-5 align-middle text-right">
                            <div className="flex justify-end items-center gap-2">
                              
                              {/* Approve/Reject Buttons only if pending */}
                              {m.status === 'pending' && (
                                <>
                                  <button onClick={() => handleStatusUpdate(m._id, 'approved')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${darkMode ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"}`} title="Approve">
                                    <CheckCircle size={14} /> <span className="hidden sm:inline">Approve</span>
                                  </button>
                                  <button onClick={() => setRejectItem(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${darkMode ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30" : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"}`} title="Reject">
                                    <XCircle size={14} /> <span className="hidden sm:inline">Reject</span>
                                  </button>
                                </>
                              )}
                              
                              {/* Vertical Divider if pending */}
                              {m.status === 'pending' && <div className={`h-5 w-px mx-1 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>}
                              
                              {/* Delete Button */}
                              <button onClick={() => setDeleteItem(m)} className={`p-2 rounded-xl transition-colors ${darkMode ? "hover:bg-red-500/10 text-slate-500 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-600"}`} title="Delete Material">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}