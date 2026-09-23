"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Clock, BookOpen, User, Loader2, ShieldAlert, Monitor, CheckCircle2, XCircle, UserCheck, UserX } from "lucide-react";

export default function AdminClassViewPage() {
  const router = useRouter();
  const [groupedClasses, setGroupedClasses] = useState<any[]>([]);
  const [classRequests, setClassRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

      // ගුරුවරයා අනුව පන්ති එකතු කිරීම (Group classes by teacher)
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
      setError("දත්ත ලබාගැනීමේදී දෝෂයක් මතු විය.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/classes/requests/status", { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // නැවත දත්ත ලබාගෙන යාවත්කාලීන කිරීම..
      await fetchData(token);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
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
    return `http://localhost:5000/Student_profile_photos/${photoUrl}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-block bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-sm mb-2">
              Admin Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Teachers, Classes & Student Requests</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage classes and approve/block student join requests.</p>
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
          <div className="space-y-6">
            {groupedClasses.map((item) => {
              const teacher = item.teacher;
              const classesList = item.classes;

              return (
                <div 
                  key={teacher._id} 
                  className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 flex flex-col lg:flex-row gap-8 items-stretch"
                >
                  
                  {/* වම් පස: ගුරුවරයාගේ තොරතුරු (Profile Photo, Name, Subject) */}
                  <div className="lg:w-80 shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl p-6 border border-blue-100/50 dark:border-slate-700/50 text-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-md mb-4">
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
                        <User size={40} className="text-slate-400" />
                      )}
                    </div>

                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">{teacher?.name}</h3>
                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 flex items-center justify-center gap-1">
                      <BookOpen size={14} /> {teacher?.subject}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium mt-1">ID: {teacher?.teacherId}</span>
                    
                    <div className="mt-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      Total Classes: {classesList.length}
                    </div>
                  </div>

                  {/* දකුණු පස: අදාළ ගුරුවරයාගේ පන්ති ලැයිස්තුව සහ සිසුන්ගේ ඉල්ලීම් */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Conducted Classes & Student Requests</h4>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {classesList.map((cls: any) => {
                        // මෙම පන්තිය සඳහා පැමිණ ඇති ඉල්ලීම් පෙරහන් කර ගැනීම
                        const clsRequests = classRequests.filter((req: any) => req.classId?._id === cls._id);

                        return (
                          <div key={cls._id} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                              <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={14} className="text-blue-500" /> <span>{cls.day}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} className="text-orange-500" /> <span>{cls.startTime} - {cls.endTime}</span>
                                </div>
                              </div>
                            </div>

                            {/* Student Requests Section for this Class */}
                            <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Student Join Requests ({clsRequests.length})
                              </h5>

                              {clsRequests.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No student requests for this class yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {clsRequests.map((req: any) => {
                                    const student = req.studentId;
                                    if (!student) return null;

                                    return (
                                      <div key={req._id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center border">
                                            {student.profileImage ? (
                                              <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <User size={16} className="text-slate-400" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white">{student.name}</p>
                                            <p className="text-[10px] text-slate-500">{student.email} {student.school ? `• ${student.school}` : ''}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                            req.status === 'Blocked' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                          }`}>
                                            {req.status}
                                          </span>

                                          {actionLoading === req._id ? (
                                            <Loader2 className="animate-spin text-blue-600" size={16} />
                                          ) : (
                                            <div className="flex items-center gap-1.5">
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