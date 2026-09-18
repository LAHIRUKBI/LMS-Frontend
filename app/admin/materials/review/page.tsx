// src/app/admin/materials/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import axios from "axios";
import { ClipboardCheck, CheckCircle, XCircle, Eye, Loader2, Trash2, Search, Filter, User, AlertCircle } from "lucide-react";
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
    <div className={`p-8 min-h-screen ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Reason for Rejection</h3>
            <textarea
              className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 ${darkMode ? "bg-slate-700/50 border-slate-600 text-white focus:ring-red-500" : "bg-gray-50 border-gray-300 focus:ring-red-500"}`}
              rows={4}
              placeholder="State the reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setRejectItem(null)} className={`px-5 py-2.5 font-medium rounded-xl ${darkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectItem._id, 'rejected', rejectReason)} className="px-5 py-2.5 font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md">Reject Material</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Materials Approval</h2>
            <p className={`mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Review and manage study materials submitted by teachers.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
            <input 
              type="text" 
              placeholder="Search title or teacher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border focus:ring-2 outline-none text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-indigo-500" : "bg-white border-slate-300 focus:ring-indigo-500"}`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pl-9 pr-8 py-2.5 rounded-lg border focus:ring-2 outline-none text-sm appearance-none ${darkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-indigo-500" : "bg-white border-slate-300 focus:ring-indigo-500"}`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "border-slate-800 bg-[#0F172A]" : "border-gray-200 bg-white"}`}>
        {loading ? (
          <div className="flex justify-center p-16"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : Object.keys(groupedMaterials).length === 0 ? (
          <div className="p-16 text-center text-slate-500">No materials found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase tracking-wider ${darkMode ? "bg-slate-800/80 text-slate-400" : "bg-gray-50 text-gray-500"}`}>
                <tr>
                  <th className="p-4">Material Info</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-700/50" : "divide-gray-100"}`}>
                {Object.values(groupedMaterials).map((group: any) => (
                  <React.Fragment key={group.teacherInfo._id}>
                    
                    {/* Teacher Group Header Row with Photo */}
                    <tr className={`${darkMode ? "bg-slate-800/60 border-l-4 border-indigo-500" : "bg-indigo-50/70 border-l-4 border-indigo-500"}`}>
                      <td colSpan={4} className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Profile Photo */}
                          <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${darkMode ? "border-slate-600 bg-slate-700" : "border-white bg-slate-200 shadow-sm"}`}>
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
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{group.teacherInfo.name || "Unknown Teacher"}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-slate-700 text-indigo-300" : "bg-white border border-indigo-100 text-indigo-700"}`}>
                                {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                              </span>
                            </div>
                            <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                              {group.teacherInfo.teacherId} • {group.teacherInfo.email}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Material Rows for this Teacher */}
                    {group.items.map((m: any) => (
                      <tr key={m._id} className={`transition-colors ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}>
                        <td className="p-4 pl-10">
                          <div className={`font-semibold text-base ${darkMode ? "text-slate-200" : "text-gray-800"}`}>{m.title}</div>
                          
                          {/* Tags: Type, Subject, Grade */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${darkMode ? "bg-slate-700 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}>
                              {m.type}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${darkMode ? "bg-slate-700/50 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                              {m.subject}
                            </span>
                            {m.grade && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${darkMode ? "bg-slate-700/50 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                                {m.grade}
                              </span>
                            )}
                          </div>
                          
                          {/* Description */}
                          {m.description && (
                            <p className={`text-xs mt-2 italic ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                              "{m.description}"
                            </p>
                          )}

                          {/* Reject Reason Warning Box */}
                          {m.status === 'rejected' && m.rejectReason && (
                            <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/50">
                              <AlertCircle size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-semibold block">Reason for Rejection:</span>
                                {m.rejectReason}
                              </div>
                            </div>
                          )}
                        </td>
                        
                        <td className={`p-4 text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                          <div className="font-medium">{new Date(m.createdAt).toLocaleDateString()}</div>
                          <div>{new Date(m.createdAt).toLocaleTimeString()}</div>
                        </td>
                        
                        <td className="p-4">
                          {m.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-200">Pending</span>}
                          {m.status === 'approved' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">Approved</span>}
                          {m.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">Rejected</span>}
                        </td>
                        
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-1.5">
                            <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"}`} title="View File">
                              <Eye size={16} />
                            </a>
                            
                            {m.status === 'pending' && (
                              <>
                                <button onClick={() => handleStatusUpdate(m._id, 'approved')} className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-green-900/30 hover:bg-green-900/50 text-green-400" : "bg-green-50 hover:bg-green-100 text-green-600"}`} title="Approve">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => setRejectItem(m)} className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400" : "bg-yellow-50 hover:bg-yellow-100 text-yellow-600"}`} title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            
                            <button onClick={() => setDeleteItem(m)} className={`p-2 rounded-lg transition-colors ml-2 ${darkMode ? "bg-red-900/20 hover:bg-red-900/40 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`} title="Delete Material">
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
  );
}