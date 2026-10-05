// src/app/teacher/classes/view/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, Calendar, Clock, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Users, User, Mail, Phone, Building, MapPin, Edit3, Link as LinkIcon, X, Save, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import ClassDeleteConfirmPopup from "@/app/components/ClassDeleteConfirmPopup";
import { useTheme } from "@/app/context/ThemeContext";

export default function ViewClassesPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [classRequests, setClassRequests] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 4;

  // Edit Form State
  const [editOnlineLink, setEditOnlineLink] = useState("");
  const [editProvideLater, setEditProvideLater] = useState(false);
  const [editLinkDisplayMode, setEditLinkDisplayMode] = useState("scheduled");
  const [editLinkStart, setEditLinkStart] = useState("");
  const [editLinkEnd, setEditLinkEnd] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

  const handleOpenEdit = (cls: any) => {
    setEditingClassId(cls._id);
    setEditOnlineLink(cls.onlineLink || "");
    setEditProvideLater(cls.provideLater || false);
    setEditLinkDisplayMode(cls.linkDisplayMode || "scheduled");
    setEditLinkStart(cls.linkStartDateTime ? new Date(cls.linkStartDateTime).toISOString().slice(0, 16) : "");
    setEditLinkEnd(cls.linkEndDateTime ? new Date(cls.linkEndDateTime).toISOString().slice(0, 16) : "");
    setEditDescription(cls.description || "");
  };

  const handleForceOpenNow = async (cls: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/classes/teacher/update/${cls._id}`, {
        onlineLink: cls.onlineLink,
        provideLater: false,
        linkDisplayMode: 'immediate',
        linkStartDateTime: null,
        linkEndDateTime: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClasses(classes.map(c => c._id === cls._id ? res.data.classData : c));
      setMessage({ type: "success", text: "Class link opened immediately! Students can join now." });
    } catch (err) {
      console.error("Error opening class immediately:", err);
      setMessage({ type: "error", text: "Failed to open class." });
    }
  };

  const handleUpdateClassSubmit = async (classId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/classes/teacher/update/${classId}`, {
        onlineLink: editProvideLater ? "" : editOnlineLink,
        provideLater: editProvideLater,
        linkDisplayMode: editLinkDisplayMode,
        linkStartDateTime: (editProvideLater || editLinkDisplayMode === 'immediate') ? null : editLinkStart,
        linkEndDateTime: (editProvideLater || editLinkDisplayMode === 'immediate') ? null : editLinkEnd,
        description: editDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClasses(classes.map(c => c._id === classId ? res.data.classData : c));
      setMessage({ type: "success", text: "Class updated successfully!" });
      setEditingClassId(null);
    } catch (err) {
      console.error("Error updating class:", err);
      setMessage({ type: "error", text: "Failed to update class." });
    }
  };

  const handleCloseLink = async (classId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/classes/teacher/update/${classId}`, {
        onlineLink: "",
        provideLater: true,
        linkStartDateTime: null,
        linkEndDateTime: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setClasses(classes.map(c => c._id === classId ? res.data.classData : c));
      setMessage({ type: "success", text: "Online link closed and removed successfully." });
    } catch (err) {
      console.error("Error closing link:", err);
      setMessage({ type: "error", text: "Failed to close the link." });
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

  // Pagination Calculations
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = classes.slice(indexOfFirstClass, indexOfLastClass);
  const totalPages = Math.ceil(classes.length / classesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-8 transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Class Delete Confirmation Popup */}
      <ClassDeleteConfirmPopup
        isOpen={!!deleteClassId}
        onClose={() => setDeleteClassId(null)}
        onConfirm={handleDeleteClass}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <button 
              onClick={() => router.push("/teacher/classes/create")}
              className={`flex items-center gap-2 text-sm font-bold mb-2 transition-colors ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
            >
              <ArrowLeft size={16} /> Back to Create Class
            </button>
            <h1 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-800"}`}>Your Created Classes</h1>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Manage your classes, early class startup, and active online links.</p>
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
              {currentClasses.map((cls) => {
                const enrolledStudents = classRequests.filter(
                  (req: any) => req.classId?._id === cls._id && req.status === 'Approved'
                );
                const isEditing = editingClassId === cls._id;

                return (
                  <div key={cls._id} className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col gap-6 transition-all duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      {cls.coverImage && (
                        <div className={`w-full md:w-64 h-40 rounded-2xl overflow-hidden border flex-shrink-0 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                          <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">
                            {cls.grade === 'Other' ? cls.customGradeName : cls.grade}
                          </span>
                          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                          <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                        </div>

                        <h3 className={`text-xl font-bold flex items-center gap-2 pt-1 ${darkMode ? "text-white" : "text-slate-800"}`}>
                          <Calendar size={18} className="text-slate-400" /> Every {cls.day}
                        </h3>

                        <p className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          <Clock size={14} className="text-slate-400" /> {cls.startTime} - {cls.endTime}
                        </p>

                        {/* Online Link Display with Quick Start / Force Open Button */}
                        {cls.mode === 'Online' ? (
                          <div className="text-xs space-y-1.5">
                            {cls.provideLater || !cls.onlineLink ? (
                              <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-xl font-bold">Online Link: Provide Later</span>
                            ) : (
                              <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-slate-800/60 border-blue-200 dark:border-slate-700 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap justify-between">
                                  <a 
                                    href={cls.onlineLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                                  >
                                    <LinkIcon size={13} /> Join Class Link
                                  </a>

                                  <div className="flex items-center gap-2">
                                    {cls.linkDisplayMode === 'scheduled' && (
                                      <button 
                                        onClick={() => handleForceOpenNow(cls)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                                        title="Open class immediately before scheduled time"
                                      >
                                        <PlayCircle size={12} /> Open Now
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleCloseLink(cls._id)}
                                      className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-200 transition-colors"
                                    >
                                      Close Link
                                    </button>
                                  </div>
                                </div>
                                {cls.linkDisplayMode === 'immediate' ? (
                                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    🟢 Status: Open Immediately (දැන්ම ඕපන් කර ඇත)
                                  </p>
                                ) : cls.linkStartDateTime && cls.linkEndDateTime ? (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    ⏳ Scheduled: {new Date(cls.linkStartDateTime).toLocaleString()} සිට {new Date(cls.linkEndDateTime).toLocaleString()} දක්වා.
                                  </p>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`text-xs space-y-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                            {cls.instituteName && <p className="flex items-center gap-1"><Building size={13} className="text-orange-500" /> {cls.instituteName}</p>}
                            {cls.instituteAddress && <p className="flex items-center gap-1"><MapPin size={13} className="text-orange-500" /> {cls.instituteAddress}</p>}
                          </div>
                        )}

                        {cls.description && (
                          <p className={`text-xs pt-1 line-clamp-3 break-all whitespace-pre-wrap ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{cls.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-auto">
                        <button 
                          onClick={() => handleOpenEdit(cls)}
                          className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-2xl transition-colors"
                          title="Update Class Details"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteClassId(cls._id)}
                          className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Edit Panel */}
                    {isEditing && (
                      <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <Edit3 size={16} className="text-blue-500" /> Update Online Link & Availability
                          </h4>
                          <button onClick={() => setEditingClassId(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={18} />
                          </button>
                        </div>

                        {cls.mode === 'Online' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase">Online Meeting Link</label>
                              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editProvideLater}
                                  onChange={(e) => setEditProvideLater(e.target.checked)}
                                  className="rounded text-blue-600 w-4 h-4"
                                />
                                Provide Later
                              </label>
                            </div>
                            {!editProvideLater && (
                              <>
                                <input
                                  type="url"
                                  value={editOnlineLink}
                                  onChange={(e) => setEditOnlineLink(e.target.value)}
                                  placeholder="Enter updated meeting link"
                                  className={`w-full p-3 rounded-xl border text-sm ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                                />

                                <div className="space-y-2 pt-1">
                                  <label className="text-[11px] font-bold uppercase block">Link Availability Type</label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                      <input
                                        type="radio"
                                        name="editLinkDisplayMode"
                                        value="immediate"
                                        checked={editLinkDisplayMode === 'immediate'}
                                        onChange={(e) => setEditLinkDisplayMode(e.target.value)}
                                        className="text-blue-600"
                                      />
                                      Open Immediately (දැන්ම ඕපන් කරන්න)
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                      <input
                                        type="radio"
                                        name="editLinkDisplayMode"
                                        value="scheduled"
                                        checked={editLinkDisplayMode === 'scheduled'}
                                        onChange={(e) => setEditLinkDisplayMode(e.target.value)}
                                        className="text-blue-600"
                                      />
                                      Schedule
                                    </label>
                                  </div>
                                </div>

                                {editLinkDisplayMode === 'scheduled' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div>
                                      <label className="text-[11px] font-bold uppercase block mb-1">Start Date & Time</label>
                                      <input
                                        type="datetime-local"
                                        value={editLinkStart}
                                        onChange={(e) => setEditLinkStart(e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-bold uppercase block mb-1">End Date & Time</label>
                                      <input
                                        type="datetime-local"
                                        value={editLinkEnd}
                                        onChange={(e) => setEditLinkEnd(e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold uppercase block mb-1">Description</label>
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingClassId(null)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateClassSubmit(cls._id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Save size={14} /> Save Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Enrolled Students */}
                    <div className={`pt-6 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                      <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        <Users size={16} className="text-blue-500" /> Enrolled Students ({enrolledStudents.length})
                      </h4>

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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentPage === 1 
                        ? "opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400" 
                        : darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    }`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span className={`text-xs font-bold px-3 py-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentPage === totalPages 
                        ? "opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400" 
                        : darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}