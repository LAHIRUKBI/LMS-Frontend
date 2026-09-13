"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardCheck, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function ReviewMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  // Reject කිරීම සඳහා Modal State
  const [rejectItem, setRejectItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

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
      fetchMaterials(); // Table එක අප්ඩේට් කිරීම
      alert(`පාඩම ${newStatus} කරන ලදී.`);
    } catch (err) {
      alert("දෝෂයක් මතු විය.");
    }
  };

  return (
    <div className={`p-8 min-h-screen ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      
      {/* Rejection Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>ප්‍රතික්ෂේප කිරීමට හේතුව</h3>
            <textarea
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 ${darkMode ? "bg-slate-700 border-slate-600 text-white focus:ring-red-500" : "bg-gray-50 border-gray-300 focus:ring-red-500"}`}
              rows={4}
              placeholder="හේතුව සඳහන් කරන්න..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectItem(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectItem._id, 'rejected', rejectReason)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject Material</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center gap-3">
        <div className={`p-3 rounded-lg ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
          <ClipboardCheck size={24} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Materials Approval</h2>
          <p className={darkMode ? "text-slate-400" : "text-gray-500"}>ගුරුවරුන් විසින් යොමු කරන ලද පාඩම් අනුමත කරන්න.</p>
        </div>
      </div>

      <div className={`rounded-xl border shadow-sm ${darkMode ? "border-slate-800 bg-slate-800" : "border-gray-200 bg-white"}`}>
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase tracking-wider ${darkMode ? "bg-slate-900/50 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                <tr>
                  <th className="p-4">Material Info</th>
                  <th className="p-4">Uploaded By (Teacher)</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-slate-700" : "divide-gray-100"}`}>
                {materials.map(m => (
                  <tr key={m._id} className={darkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-50"}>
                    <td className="p-4">
                      <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>{m.title}</div>
                      <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${darkMode ? "bg-slate-700 text-slate-300" : "bg-gray-200 text-gray-700"}`}>
                        {m.type.toUpperCase()} • {m.subject}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-medium ${darkMode ? "text-slate-200" : "text-gray-800"}`}>{m.teacherId?.name || "Unknown"}</div>
                      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{m.teacherId?.teacherId} • {m.teacherId?.email}</div>
                    </td>
                    <td className={`p-4 text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {m.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-200">Pending</span>}
                      {m.status === 'approved' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">Approved</span>}
                      {m.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">Rejected</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`} title="View File">
                          <Eye size={18} />
                        </a>
                        {m.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(m._id, 'approved')} className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => setRejectItem(m)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}