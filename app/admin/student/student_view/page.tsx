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
  Clock, 
  Users, 
  Trash2, 
  Download 
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StudentDeleteConfirmPopup from "@/app/components/StudentDeleteConfirmPopup";

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

  // Popup States for Deletion
  const [singleDeleteStudent, setSingleDeleteStudent] = useState<Student | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
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
      ["Grade", student.grade || "N/A"],
      ["School", student.school || "N/A"],
      ["Medium", student.medium || "N/A"],
      ["Parent Name", student.parentName || "N/A"],
      ["Parent Phone", student.parentPhone || "N/A"],
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

    const tableColumns = ["Name", "Email", "Phone", "Grade", "School", "Joined Date"];
    const tableRows = students.map(s => [
      s.name,
      s.email,
      s.phone || "N/A",
      s.grade || "N/A",
      s.school || "N/A",
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-500 font-sans overflow-x-hidden">
      
      {/* Delete Single Student Confirmation Popup */}
      <StudentDeleteConfirmPopup
        isOpen={!!singleDeleteStudent}
        onClose={() => setSingleDeleteStudent(null)}
        onConfirm={handleDeleteSingleStudent}
        title="Delete Student Account"
        message={`Are you sure you want to delete "${singleDeleteStudent?.name}"? This action cannot be undone.`}
      />

      {/* Delete All Students Confirmation Popup */}
      <StudentDeleteConfirmPopup
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllStudents}
        title="Delete All Students"
        message="Are you sure you want to delete all student records permanently? This action is irreversible."
      />

      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Registered Students</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage and view all students in the system.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all shadow-sm"
              />
            </div>

            {/* Download All Students PDF Button */}
            <button
              onClick={handleDownloadAllStudentsPDF}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Download size={14} /> Download All Student Info
            </button>

            {/* Delete All Students Button */}
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm"
            >
              <Trash2 size={14} /> Delete All Student
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-500">
          <div className="w-full max-w-full overflow-x-hidden">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact & Parent</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Academic & Medium</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location & Timezone</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student._id} 
                      onClick={() => student.isNewForTable && handleClearRowDot(student._id)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group relative ${student.isNewForTable ? "cursor-pointer bg-red-50/30 dark:bg-red-900/10" : ""}`}
                    >
                      {/* Name & Image */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {student.isNewForTable && (
                            <span 
                              className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-3 w-3"
                              title="New Student"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-sm"></span>
                            </span>
                          )}
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-shrink-0 items-center justify-center">
                            {student.profileImage ? (
                              <img src={getProfileImageUrl(student.profileImage) || ""} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white text-xs truncate max-w-[120px] sm:max-w-[160px]">{student.name}</p>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full mt-0.5 inline-block ${student.authProvider === 'google' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'}`}>
                              {student.authProvider === 'google' ? 'Google' : 'Email'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info & Parent Details */}
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[200px]" title={student.email}>
                            <Mail size={13} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Phone size={13} className="text-slate-400 flex-shrink-0" />
                            <span>{student.phone || <span className="text-slate-400 italic">No phone</span>}</span>
                          </div>
                          {student.parentName && (
                            <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[150px]">
                              <Users size={12} className="flex-shrink-0" />
                              <span className="truncate">Parent: {student.parentName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Academic Info & Medium */}
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <GraduationCap size={13} className="text-indigo-400 flex-shrink-0" />
                            <span>{student.grade || <span className="text-slate-400 italic">N/A</span>}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate max-w-[130px]" title={student.school}>
                            <Building size={13} className="text-indigo-400 flex-shrink-0" />
                            <span className="truncate">{student.school || <span className="text-slate-400 italic">N/A</span>}</span>
                          </div>
                          {student.medium && (
                            <span className="inline-block text-[9px] px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-full font-medium">
                              {student.medium}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Country & TimeZone */}
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Globe size={13} className="text-teal-500 flex-shrink-0" />
                            <span className="truncate">{student.country || <span className="text-slate-400 italic">N/A</span>}</span>
                          </div>
                          {student.timeZone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]" title={student.timeZone}>
                              <Clock size={12} className="text-amber-500 flex-shrink-0" />
                              <span className="truncate">{student.timeZone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                          <span>{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions (Download Info & Delete Button) */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadStudentPDF(student)}
                            title="Download Student Info"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <Download size={13} /> Info
                          </button>
                          <button
                            onClick={() => setSingleDeleteStudent(student)}
                            title="Delete Student"
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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