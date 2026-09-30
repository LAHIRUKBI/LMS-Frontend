// src/app/admin/classes/view/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, ShieldAlert, Monitor, UserCheck, UserX, Trash2, Search, GraduationCap, Image as ImageIcon, Edit3, X, Check, FileText, CreditCard, ExternalLink } from "lucide-react";

export default function AdminClassViewPage() {
  const router = useRouter();
  const [groupedClasses, setGroupedClasses] = useState<any[]>([]);
  const [classRequests, setClassRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});

  // Admin Edit Class Modal States
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImage, setEditCoverImage] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Student Details Modal State (Free Card & Profile Info)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any | null>(null);
  const [freeCardData, setFreeCardData] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [classesRes, requestsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes/all", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/classes/requests/all", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setClassRequests(requestsRes.data);

      const teacherMap: { [key: string]: any } = {};

      classesRes.data.forEach((cls: any) => {
        if (!cls.teacherId) return;
        const teacherId = cls.teacherId._id;

        if (!teacherMap[teacherId]) {
          teacherMap[teacherId] = {
            teacher: cls.teacherId,
            classes: []
          };
        }
        teacherMap[teacherId].classes.push(cls);
      });

      setGroupedClasses(Object.values(teacherMap));
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("An error occurred while retrieving data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.put("http://localhost:5000/api/classes/requests/status", { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(token);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDropStudent = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(`http://localhost:5000/api/classes/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(token);
    } catch (err) {
      console.error("Error dropping student:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Admin updating class cover and description
  const handleAdminUpdateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    setEditLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("description", editDescription);
      if (editCoverImage) {
        formData.append("coverImage", editCoverImage);
      }

      await axios.put(`http://localhost:5000/api/classes/admin/update/${editingClass._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      await fetchData(token);
      setEditingClass(null);
      setEditCoverImage(null);
    } catch (err) {
      console.error("Error updating class details:", err);
      alert("Failed to update class details.");
    } finally {
      setEditLoading(false);
    }
  };

  // පන්තියේ ID එක (classId) සමඟ සිසුවාගේ තොරතුරු ලබා ගැනීම
  const handleOpenStudentDetails = async (student: any, classId: string, isFreeCard: boolean) => {
    setSelectedStudentDetails(student);
    setDetailsLoading(true);
    setFreeCardData(null);

    // මෙම ඉල්ලීම Free Card එකක් නොවේ නම්, Free Card API එක Call කිරීම අවශ්‍ය නොවේ
    if (!isFreeCard) {
      setDetailsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/free-card/student/request/${student._id}?classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFreeCardData(res.data);
    } catch (err) {
      console.log("No free card request found for this specific class.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const getProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000/profile_photos/${photoUrl}`;
  };

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    if (photoUrl.startsWith("/")) {
      return `http://localhost:5000${photoUrl}`;
    }
    return `http://localhost:5000/Student_profile_photos/${photoUrl}`;
  };

  const handleSearchChange = (classId: string, value: string) => {
    setSearchQueries(prev => ({ ...prev, [classId]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 font-sans transition-colors duration-500">

      {/* Admin Edit Class Modal (Cover Photo & Description) */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border dark:border-slate-800 p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Class Info (Admin)</h3>
              <button
                onClick={() => setEditingClass(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminUpdateClassSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Class Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter class description..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium text-xs resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <ImageIcon size={14} /> Class Cover Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverImage(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5"
                >
                  {editLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details & Free Card Info Modal */}
      {selectedStudentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border dark:border-slate-800 p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border flex items-center justify-center">
                  {selectedStudentDetails.profileImage ? (
                    <img src={getStudentProfileImageUrl(selectedStudentDetails.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudentDetails.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudentDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Phone:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudentDetails.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">School / Grade:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudentDetails.school || "N/A"} ({selectedStudentDetails.grade || "N/A"})</p>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Address:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudentDetails.address || "N/A"}</p>
                </div>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                </div>
              ) : freeCardData ? (
                <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <CreditCard size={16} /> Free Card Request Details
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Father's Name:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{freeCardData.fatherName || "N/A"} ({freeCardData.fatherOccupation || "No occupation"})</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Mother's Name:</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{freeCardData.motherName || "N/A"} ({freeCardData.motherOccupation || "No occupation"})</p>
                    </div>
                    {freeCardData.hasGuardian && (
                      <div className="col-span-2 mt-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Guardian Details:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{freeCardData.guardianName} ({freeCardData.guardianRelation}) - {freeCardData.guardianPhone}</p>
                      </div>
                    )}
                    <div className="col-span-2 mt-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Family Background Reason:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300 italic mt-0.5 bg-white dark:bg-slate-900 p-2 rounded-lg border">{freeCardData.familyBackground}</p>
                    </div>
                  </div>

                  {freeCardData.files && freeCardData.files.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Uploaded Documents ({freeCardData.files.length}):</span>
                      <div className="space-y-1">
                        {freeCardData.files.map((fileUrl: string, idx: number) => (
                          <a
                            key={idx}
                            href={`http://localhost:5000${fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold text-blue-600 dark:text-blue-400"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={14} className="shrink-0" />
                              <span className="truncate">Document {idx + 1}</span>
                            </div>
                            <ExternalLink size={14} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No Free Card Request submitted by this student.</p>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedStudentDetails(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Teachers, Classes & Student Requests</h1>
          </div>
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20">
            Total Educators: {groupedClasses.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading classes and requests...</p>
          </div>
        ) : groupedClasses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-full mb-5">
              <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No Classes Found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">No teachers have created classes in the system yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedClasses.map((item) => {
              const teacher = item.teacher;
              const classesList = item.classes;

              return (
                <div
                  key={teacher._id}
                  className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 flex flex-col gap-5"
                >

                  {/* Teacher Info Banner */}
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 rounded-2xl px-4 py-3 border border-blue-100/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        {teacher?.profilePhoto ? (
                          <img
                            src={getProfileImageUrl(teacher.profilePhoto) || ""}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User size={24} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">{teacher?.name}</h3>
                        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <BookOpen size={13} /> {teacher?.subject}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <GraduationCap size={14} /> Total Classes: {classesList.length}
                    </div>
                  </div>

                  {/* Classes & Student Requests */}
                  <div className="flex flex-col">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Conducted Classes & Student Requests</h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {classesList.map((cls: any) => {
                        const clsRequests = classRequests.filter((req: any) => req.classId?._id === cls._id);

                        const query = (searchQueries[cls._id] || "").toLowerCase();
                        const filteredRequests = clsRequests.filter((req: any) =>
                          req.studentId?.name?.toLowerCase().includes(query)
                        );

                        return (
                          <div key={cls._id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">

                            <div className="space-y-3">
                              {/* Class Cover Image Display */}
                              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                {cls.coverImage ? (
                                  <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                                    <ImageIcon size={24} />
                                    <span className="text-[10px] italic">No cover photo provided</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingClass(cls);
                                    setEditDescription(cls.description || "");
                                    setEditCoverImage(null);
                                  }}
                                  className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 backdrop-blur-sm transition-all"
                                  title="Manage Cover & Description"
                                >
                                  <Edit3 size={14} /> Edit Info
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">
                                    {cls.grade}
                                  </span>
                                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-extrabold">
                                    {cls.medium}
                                  </span>
                                  <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold flex items-center gap-1">
                                    <Monitor size={12} /> {cls.mode}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={14} className="text-blue-500" /> <span>{cls.day}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} className="text-orange-500" /> <span>{cls.startTime} - {cls.endTime}</span>
                                </div>
                              </div>

                              {cls.description ? (
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                  {cls.description}
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No description provided by teacher.</p>
                              )}
                            </div>

                            {/* Student Requests Section for this Class */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Student Join Requests ({clsRequests.length})
                                </h5>
                              </div>

                              {clsRequests.length > 0 && (
                                <div className="relative mb-3">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Search student by name..."
                                    value={searchQueries[cls._id] || ""}
                                    onChange={(e) => handleSearchChange(cls._id, e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              )}

                              {clsRequests.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No student requests yet.</p>
                              ) : filteredRequests.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-3 text-center">No student found.</p>
                              ) : (
                                <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {filteredRequests.map((req: any) => {
                                      const student = req.studentId;
                                      if (!student) return null;

                                      return (
                                        <div key={req._id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5">
                                          {/* Clickable student card to view full profile & free card details */}
                                          <div
                                            onClick={() => handleOpenStudentDetails(student, cls._id, req.isFreeCard)}
                                            className="flex items-center gap-2.5 cursor-pointer group"
                                            title="Click to view student details"
                                          >
                                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center border group-hover:border-blue-500 transition-colors">
                                              {student.profileImage ? (
                                                <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <User size={16} className="text-slate-400" />
                                              )}
                                            </div>
                                            <div className="overflow-hidden">
                                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p>

                                              {/* Status & Free Card Badge */}
                                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    req.status === 'Blocked' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                  }`}>
                                                  {req.status}
                                                </span>

                                                {/* Free Card Request Indicator Badge */}
                                                {req.isFreeCard && (
                                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                                                    <CreditCard size={10} /> Free Card
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                            {actionLoading === req._id ? (
                                              <Loader2 className="animate-spin text-blue-600 mx-auto" size={14} />
                                            ) : (
                                              <div className="flex items-center gap-1 w-full justify-end">
                                                {req.status !== 'Approved' && (
                                                  <button
                                                    onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                                    title="Approve Student"
                                                  >
                                                    <UserCheck size={12} /> Approve
                                                  </button>
                                                )}
                                                {req.status !== 'Blocked' && (
                                                  <button
                                                    onClick={() => handleStatusUpdate(req._id, 'Blocked')}
                                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                                    title="Block Student"
                                                  >
                                                    <UserX size={12} /> Block
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => handleDropStudent(req._id)}
                                                  className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                                  title="Drop Student"
                                                >
                                                  <Trash2 size={12} /> Drop
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
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
}