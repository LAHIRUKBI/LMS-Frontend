// src/app/teacher/classes/view/page.tsx (හෝ අදාළ ගොනුව)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, Calendar, Clock, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Users, User, Mail, Phone, Building, MapPin } from "lucide-react";
import ClassDeleteConfirmPopup from "@/app/components/ClassDeleteConfirmPopup";
import { useTheme } from "@/app/context/ThemeContext";

export default function ViewClassesPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [classRequests, setClassRequests] = useState<any[]>([]); // 👈 සිසුන්ගේ ඉල්ලීම්/සහභාගීත්වය ලබා ගැනීම සඳහා
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
    fetchClassesAndStudents(token);
  }, [router]);

  // Fetch classes and approved students belonging to the teacher
  const fetchClassesAndStudents = async (token: string) => {
    try {
      const [classesRes, requestsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes/my-classes", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // ගුරුවරයාගේ පන්තිවල සිසුන්ගේ ඉල්ලීම් ලබා ගැනීම (Admin/Teacher requests API)
        axios.get("http://localhost:5000/api/classes/requests/all", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setClasses(classesRes.data);
      setClassRequests(requestsRes.data);
    } catch (err) {
      console.error("Error fetching classes or students:", err);
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

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    if (photoUrl.startsWith("/")) {
      return `http://localhost:5000${photoUrl}`;
    }
    return `http://localhost:5000/Student_profile_photos/${photoUrl}`;
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
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>View and manage all your active teaching classes and enrolled students.</p>
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
            <div className="space-y-6">
              {classes.map((cls) => {
                // මෙම පන්තිය සඳහා 'Approved' වී ඇති සිසුන් පමණක් lọc කර ගැනීම
                const enrolledStudents = classRequests.filter(
                  (req: any) => req.classId?._id === cls._id && req.status === 'Approved'
                );

                return (
                  <div key={cls._id} className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col gap-6 transition-all duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      {cls.coverImage && (
                        <div className={`w-full md:w-64 h-40 rounded-2xl overflow-hidden border flex-shrink-0 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                          <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">{cls.grade}</span>
                          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                          <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                        </div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 pt-1 ${darkMode ? "text-white" : "text-slate-800"}`}>
                          <Calendar size={18} className="text-slate-400" /> {cls.day}
                        </h3>
                        <p className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          <Clock size={14} className="text-slate-400" /> {cls.startTime} - {cls.endTime}
                        </p>
                        {cls.description && (
                          <p className={`text-xs pt-1 line-clamp-3 break-all whitespace-pre-wrap ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{cls.description}</p>
                        )}
                      </div>

                      <button 
                        onClick={() => setDeleteClassId(cls._id)}
                        className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl transition-colors flex-shrink-0 self-start md:self-auto"
                        title="Delete Class"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Enrolled Students Section */}
                    <div className={`pt-6 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          <Users size={16} className="text-blue-500" /> Enrolled Students ({enrolledStudents.length})
                        </h4>
                      </div>

                      {enrolledStudents.length === 0 ? (
                        <p className={`text-xs italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No students have joined this class yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enrolledStudents.map((req: any) => {
                            const student = req.studentId;
                            if (!student) return null;

                            return (
                              <div key={req._id} className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${darkMode ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200/80"}`}>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center border">
                                  {student.profileImage ? (
                                    <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={18} className="text-slate-400" />
                                  )}
                                </div>
                                
                                <div className="space-y-1 text-xs flex-1 overflow-hidden">
                                  <p className={`font-bold truncate ${darkMode ? "text-white" : "text-slate-800"}`}>{student.name}</p>
                                  <p className={`flex items-center gap-1 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    <Mail size={12} className="shrink-0 text-slate-400" /> {student.email}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <span className={`flex items-center gap-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                      <Phone size={11} className="text-slate-400" /> {student.phone || "No Phone"}
                                    </span>
                                    <span className={`flex items-center gap-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                                      <Building size={11} className="text-slate-400" /> {student.school || "No School"} ({student.grade || "N/A"})
                                    </span>
                                  </div>
                                  {student.address && (
                                    <p className={`flex items-center gap-1 pt-0.5 truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                      <MapPin size={11} className="shrink-0 text-slate-400" /> {student.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}