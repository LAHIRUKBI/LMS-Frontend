//src/app/admin/student/student_view/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, User, Mail, Phone, GraduationCap, Building, Calendar, Loader2, MoreVertical, Globe, Clock, BookOpen, Users } from "lucide-react";

// Student Interface
interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  school: string;
  profileImage: string;
  createdAt: string;
  authProvider?: string;
  country?: string;
  timeZone?: string;
  medium?: string;
  parentName?: string;
  parentPhone?: string;
  isNewForTable?: boolean;
}

export default function AdminStudentView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while retrieving student information.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearRowDot = async (studentId: string) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`http://localhost:5000/api/admin/students/${studentId}/clear-dot`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Updating the local state upon success (so the dot disappears from the UI immediately).
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student._id === studentId ? { ...student, isNewForTable: false } : student
      )
    );
  } catch (error) {
    console.error("Error clearing dot:", error);
  }
};

  // Search Filter
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Setting the Profile Image URL
  const getProfileImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={44} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Registered Students</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage and view all students in the system.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-xl font-semibold text-sm border border-blue-100 dark:border-blue-500/20 whitespace-nowrap shadow-sm">
              Total: {filteredStudents.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact & Parent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Academic & Medium</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location & Timezone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr 
        key={student._id} 
        onClick={() => student.isNewForTable && handleClearRowDot(student._id)} // 👈 අලුතින් එකතු කලා
        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${student.isNewForTable ? "cursor-pointer bg-red-50/30 dark:bg-red-900/10" : ""}`}
      >
                      
                      {/* Name & Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {student.isNewForTable && (
              <span 
                className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-3 w-3"
                title="New Student"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-sm"></span>
              </span>
            )}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-shrink-0 items-center justify-center">
                            {student.profileImage ? (
                              <img src={getProfileImageUrl(student.profileImage) || ""} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{student.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${student.authProvider === 'google' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'}`}>
                              {student.authProvider === 'google' ? 'Google Auth' : 'Email Auth'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info & Parent Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Mail size={14} className="text-slate-400" />
                            {student.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Phone size={14} className="text-slate-400" />
                            {student.phone || <span className="text-slate-400 text-xs italic">No phone</span>}
                          </div>
                          {student.parentName && (
                            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                              <Users size={13} />
                              Parent: {student.parentName} ({student.parentPhone || 'N/A'})
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Academic Info & Medium */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <GraduationCap size={14} className="text-indigo-400" />
                            {student.grade || <span className="text-slate-400 text-xs italic">N/A</span>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Building size={14} className="text-indigo-400" />
                            {student.school || <span className="text-slate-400 text-xs italic">N/A</span>}
                          </div>
                          {student.medium && (
                            <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-full font-medium">
                              Medium: {student.medium}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Country & TimeZone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Globe size={14} className="text-teal-500" />
                            {student.country || <span className="text-slate-400 text-xs italic">Not specified</span>}
                          </div>
                          {student.timeZone && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Clock size={13} className="text-amber-500" />
                              {student.timeZone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <User size={32} className="text-slate-300 dark:text-slate-600" />
                        <p>No student was found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}