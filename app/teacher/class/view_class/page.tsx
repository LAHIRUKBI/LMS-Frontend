"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, Calendar, Clock, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import ClassDeleteConfirmPopup from "@/app/components/ClassDeleteConfirmPopup";
import { useTheme } from "@/app/context/ThemeContext";

export default function ViewClassesPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Popup Modal State for Delete
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  // Synchronize ThemeContext with HTML root class dynamically
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchClasses(token);
  }, [router]);

  // Fetch classes belonging to the teacher
  const fetchClasses = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes/my-classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setFetching(false);
    }
  };

  // Actual class deletion execution after confirmation
  const handleDeleteClass = async () => {
    if (!deleteClassId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/classes/${deleteClassId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(classes.filter((c) => c._id !== deleteClassId));
      setMessage({ type: "success", text: "Class successfully removed." });
      setDeleteClassId(null);
    } catch (err) {
      console.error("Error deleting class:", err);
      setMessage({ type: "error", text: "Failed to remove the class." });
    }
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-8 transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Class Delete Confirmation Popup */}
      <ClassDeleteConfirmPopup
        isOpen={!!deleteClassId}
        onClose={() => setDeleteClassId(null)}
        onConfirm={handleDeleteClass}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <button 
              onClick={() => router.push("/teacher/classes/create")}
              className={`flex items-center gap-2 text-sm font-bold mb-2 transition-colors ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
            >
              <ArrowLeft size={16} /> Back to Create Class
            </button>
            <h1 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-800"}`}>Your Created Classes</h1>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>View and manage all your active teaching classes.</p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Existing Classes List */}
        <div>
          {fetching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={36} />
            </div>
          ) : classes.length === 0 ? (
            <div className={`rounded-3xl p-12 text-center border shadow-sm transition-colors duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <p className="text-slate-400 font-medium">No classes created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <div key={cls._id} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  {cls.coverImage && (
                    <div className={`w-full h-40 rounded-2xl overflow-hidden border ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                      <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">{cls.grade}</span>
                        <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                        <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                      </div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 pt-1 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        <Calendar size={16} className="text-slate-400" /> {cls.day}
                      </h3>
                      <p className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        <Clock size={14} className="text-slate-400" /> {cls.startTime} - {cls.endTime}
                      </p>
                      {cls.description && (
                        <p className={`text-xs pt-1 line-clamp-2 break-all whitespace-pre-wrap ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{cls.description}</p>
                      )}
                    </div>

                    <button 
                      onClick={() => setDeleteClassId(cls._id)}
                      className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl transition-colors flex-shrink-0"
                      title="Delete Class"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}