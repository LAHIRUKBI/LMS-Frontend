// src/app/admin/student/student_view/page.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Calendar, 
  Loader2, 
  Globe, 
  Users, 
  Trash2, 
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StudentDeleteConfirmPopup from "@/app/components/StudentDeleteConfirmPopup";
import { io } from "socket.io-client";
import { useTheme } from "@/app/context/ThemeContext";

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
  fatherName?: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  hasGuardian?: boolean;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  isNewForTable?: boolean;
  isOnline?: boolean;
}

export default function AdminStudentView() {
  const { darkMode } = useTheme(); // Get global theme state

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const [singleDeleteStudent, setSingleDeleteStudent] = useState<Student | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();

    const socket = io("http://localhost:5000");

    socket.on("student_online", (data: { studentId: string; isOnline: boolean }) => {
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === data.studentId ? { ...student, isOnline: data.isOnline } : student
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch all students from the backend
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

  // Clear the new notification dot for a specific student row
  const handleClearRowDot = async (studentId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/students/${studentId}/clear-dot`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === studentId ? { ...student, isNewForTable: false } : student
        )
      );
    } catch (error) {
      console.error("Error clearing dot:", error);
    }
  };

  // Delete a single student
  const handleDeleteSingleStudent = async () => {
    if (!singleDeleteStudent) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/students/${singleDeleteStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.filter(s => s._id !== singleDeleteStudent._id));
      setSingleDeleteStudent(null);
    } catch (err: any) {
      alert("An error occurred while deleting the student.");
    }
  };

  // Delete all students
  const handleDeleteAllStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents([]);
      setIsDeleteAllModalOpen(false);
    } catch (err: any) {
      alert("An error occurred while deleting all students.");
    }
  };

  // Download Individual Student Info as PDF
  const handleDownloadStudentPDF = (student: Student) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Information Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const studentData = [
      ["Full Name", student.name || "N/A"],
      ["Email Address", student.email || "N/A"],
      ["Phone Number", student.phone || "N/A"],
      ["Home Address", student.address || "N/A"],
      ["Grade", student.grade || "N/A"],
      ["School", student.school || "N/A"],
      ["Medium", student.medium || "N/A"],
      ["Father's Name", student.fatherName || "N/A"],
      ["Father's Occupation", student.fatherOccupation || "N/A"],
      ["Father's Phone", student.fatherPhone || "N/A"],
      ["Mother's Name", student.motherName || "N/A"],
      ["Mother's Occupation", student.motherOccupation || "N/A"],
      ["Mother's Phone", student.motherPhone || "N/A"],
      ["Has Guardian", student.hasGuardian ? "Yes" : "No"],
      ["Guardian Name", student.guardianName || "N/A"],
      ["Guardian Relationship", student.guardianRelation || "N/A"],
      ["Guardian Phone", student.guardianPhone || "N/A"],
      ["Country", student.country || "N/A"],
      ["Timezone", student.timeZone || "N/A"],
      ["Auth Provider", student.authProvider || "N/A"],
      ["Joined Date", new Date(student.createdAt).toLocaleDateString()],
    ];

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Details"]],
      body: studentData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${student.name.replace(/\s+/g, "_")}_info.pdf`);
  };

  // Download All Students Info as PDF
  const handleDownloadAllStudentsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("All Registered Students Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Students: ${students.length}`, 14, 28);

    const tableColumns = ["Name", "Email", "Phone", "Grade", "School", "Father", "Mother", "Joined Date"];
    const tableRows = students.map(s => [
      s.name,
      s.email,
      s.phone || "N/A",
      s.grade || "N/A",
      s.school || "N/A",
      s.fatherName || "N/A",
      s.motherName || "N/A",
      new Date(s.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("All_Students_Report.pdf");
  };

  // Search Filter
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineStudentsCount = students.filter(student => student.isOnline).length;

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // Resetting to the home page (Page 1) when the search changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Setting the Profile Image URL
  const getProfileImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-500 font-sans overflow-x-hidden ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      <StudentDeleteConfirmPopup
        isOpen={!!singleDeleteStudent}
        onClose={() => setSingleDeleteStudent(null)}
        onConfirm={handleDeleteSingleStudent}
        title="Delete Student Account"
        message={`Are you sure you want to delete "${singleDeleteStudent?.name}"? This action cannot be undone.`}
      />

      <StudentDeleteConfirmPopup
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllStudents}
        title="Delete All Students"
        message="Are you sure you want to delete all student records permanently? This action is irreversible."
      />

      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            
            <div className={`flex justify-between items-center border-b pb-3 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full overflow-hidden border flex items-center justify-center shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                  {viewingStudent.profileImage ? (
                    <img src={getProfileImageUrl(viewingStudent.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className={`text-base font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{viewingStudent.name}</h3>
                  <p className="text-xs text-slate-500">{viewingStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className={`p-1.5 rounded-xl transition-colors ${darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`p-3.5 rounded-2xl border space-y-2 ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                <h4 className="font-bold text-slate-500 uppercase text-[11px] tracking-wider">Personal & Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Phone Number:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Home Address:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.address || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Country / Timezone:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.country || "N/A"} ({viewingStudent.timeZone || "N/A"})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Auth Provider:</span>
                    <p className={`font-semibold capitalize ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.authProvider || "Local"}</p>
                  </div>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-2 ${darkMode ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px] tracking-wider">Academic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Grade / Class:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.grade || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">School:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.school || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px]">Medium:</span>
                    <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{viewingStudent.medium || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${darkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[11px]">Father's Details</h4>
                  <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Name: {viewingStudent.fatherName || "N/A"}</p>
                  <p className="text-slate-500 text-[11px]">Occupation: {viewingStudent.fatherOccupation || "N/A"}</p>
                  <p className="text-slate-500 text-[11px]">Phone: {viewingStudent.fatherPhone || "N/A"}</p>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${darkMode ? "bg-pink-500/10 border-pink-500/20" : "bg-pink-50 border-pink-200"}`}>
                  <h4 className="font-bold text-pink-700 dark:text-pink-400 uppercase text-[11px]">Mother's Details</h4>
                  <p className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Name: {viewingStudent.motherName || "N/A"}</p>
                  <p className="text-slate-500 text-[11px]">Occupation: {viewingStudent.motherOccupation || "N/A"}</p>
                  <p className="text-slate-500 text-[11px]">Phone: {viewingStudent.motherPhone || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-2 pt-3 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
              <button
                onClick={() => handleDownloadStudentPDF(viewingStudent)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                <Download size={14} /> Download PDF Report
              </button>
              <button
                onClick={() => setViewingStudent(null)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${darkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-5 w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Registered Students</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${darkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {onlineStudentsCount} Online Now
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage and view all students in the system.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search name/email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all shadow-sm ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
              />
            </div>

            <button
              onClick={handleDownloadAllStudentsPDF}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Download size={13} /> Export All
            </button>

            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Trash2 size={13} /> Delete All
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className={`border-b text-[11px] ${darkMode ? "bg-slate-800/40 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Student</th>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Contact & Parents</th>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Academic & Medium</th>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Location & Timezone</th>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Joined Date</th>
                  <th className="px-3.5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${darkMode ? "divide-slate-800/60" : "divide-slate-200"}`}>
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr 
                      key={student._id} 
                      onClick={() => student.isNewForTable && handleClearRowDot(student._id)}
                      className={`transition-colors group relative ${student.isNewForTable ? (darkMode ? "cursor-pointer bg-red-900/10" : "cursor-pointer bg-red-50") : (darkMode ? "hover:bg-slate-800/20" : "hover:bg-slate-50")}`}
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          {student.isNewForTable && (
                            <span className="absolute -left-1 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5" title="New Student">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm"></span>
                            </span>
                          )}
                          <div className={`relative w-8 h-8 rounded-full overflow-hidden border flex flex-shrink-0 items-center justify-center shadow-xs ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                            {student.profileImage ? (
                              <img src={getProfileImageUrl(student.profileImage) || ""} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={15} className="text-slate-400" />
                            )}
                            
                            {student.isOnline && (
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 rounded-full ${darkMode ? "border-slate-900" : "border-white"}`} title="Online Now"></span>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`font-bold text-xs truncate max-w-[120px] sm:max-w-[150px] ${darkMode ? "text-white" : "text-slate-900"}`}>{student.name}</p>
                              {student.isOnline && (
                                <span className="text-[8px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-500 rounded-full font-bold uppercase tracking-wider animate-pulse">
                                  Online
                                </span>
                              )}
                            </div>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded-md font-medium mt-0.5 inline-block border ${student.authProvider === 'google' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                              {student.authProvider === 'google' ? 'Google' : 'Email'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className={`flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px] ${darkMode ? "text-slate-300" : "text-slate-700"}`} title={student.email}>
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>{student.phone || <span className="text-slate-400 italic text-[10px]">No phone</span>}</span>
                          </div>
                          {student.fatherName && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium truncate max-w-[150px]">
                              <Users size={11} className="shrink-0" />
                              <span className="truncate">F: {student.fatherName}</span>
                            </div>
                          )}
                          {student.motherName && (
                            <div className="flex items-center gap-1 text-[10px] text-pink-500 font-medium truncate max-w-[150px]">
                              <Users size={11} className="shrink-0" />
                              <span className="truncate">M: {student.motherName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className={`flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                            <GraduationCap size={12} className="text-indigo-400 shrink-0" />
                            <span>{student.grade || <span className="text-slate-400 italic text-[10px]">N/A</span>}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 truncate max-w-[120px] ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                            <Building size={12} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{student.school || <span className="text-slate-400 italic text-[10px]">N/A</span>}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <div className={`flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                            <Globe size={12} className="text-teal-500 shrink-0" />
                            <span className="truncate">{student.country || <span className="text-slate-400 italic text-[10px]">N/A</span>}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <div className={`flex items-center gap-1.5 text-[11px] whitespace-nowrap ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingStudent(student)}
                            title="View Full Details"
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => handleDownloadStudentPDF(student)}
                            title="Download Student Info"
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            <Download size={12} /> PDF
                          </button>
                          <button
                            onClick={() => setSingleDeleteStudent(student)}
                            title="Delete Student"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center gap-1.5">
                        <User size={28} className="text-slate-500" />
                        <p>No student was found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3 text-xs ${darkMode ? "bg-slate-800/20 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
              <div className="text-slate-400 text-[11px]">
                Showing <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{filteredStudents.length > 0 ? startIndex + 1 : 0}</span> to <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</span> of <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{filteredStudents.length}</span> students
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 border rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px] ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl font-bold text-[11px]">
                  {currentPage} / {totalPages || 1}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 border rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[11px] ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}