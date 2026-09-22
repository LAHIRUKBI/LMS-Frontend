"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  Users,
  Search,
  BookOpen,
  UserX,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Phone,
  MapPin,
  Globe,
  User,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import DeleteConfirmPopup from "@/app/components/TeacherDeleteConfirmPopup";

interface Qualification {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  address?: string;
  website?: string;
  socialLinks?: SocialLink[];
  createdAt?: string; 
  profilePhoto?: string;
  qualifications?: Qualification[];
}

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchTeachers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/admin/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeachers(res.data);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching teacher data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const executeDelete = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5000/api/admin/teachers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(res.data.message || "Account successfully removed.");
      setTeachers(teachers.filter((t) => t._id !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while removing.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setTeacherToDelete(null);
    }
  };

  // ගුරුවරයාගේ සම්පූර්ණ විස්තර ඇතුළත් PDF එක ඩවුන්ලෝඩ් කිරීමේ ෆන්ෂන් එක
  const downloadTeacherProfilePDF = (t: Teacher) => {
    try {
      const doc = new jsPDF();

      // Header Background
      doc.setFillColor(37, 99, 235); // Blue
      doc.rect(0, 0, 210, 35, "F");

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("LMS Learning Management System", 14, 18);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Teacher Complete Profile Report - ID: ${t.teacherId}`, 14, 27);

      // Date & Time
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleString();
      doc.text(`Generated Date: ${currentDate}`, 14, 45);

      let startY = 55;

      // Basic Information Box
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, startY, 182, 50, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Basic Information", 20, startY + 8);

      let rowY = startY + 18;
      const basicInfo = [
        { label: "Full Name", value: t.name },
        { label: "Teacher ID", value: t.teacherId },
        { label: "Email", value: t.email || "Not Provided" },
        { label: "Subject", value: t.subject },
        { label: "Phone", value: t.phone || "Not Provided" },
        { label: "Address", value: t.address || "Not Provided" },
      ];

      basicInfo.forEach((info, idx) => {
        const colX = idx % 2 === 0 ? 20 : 110;
        if (idx > 0 && idx % 2 === 0) rowY += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${info.label}:`, colX, rowY);
        doc.setFont("helvetica", "normal");
        doc.text(info.value, colX + 25, rowY);
      });

      startY = rowY + 15;

      // Qualifications Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Qualifications & Certificates", 14, startY);
      startY += 6;

      if (t.qualifications && t.qualifications.length > 0) {
        t.qualifications.forEach((q, qIdx) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${qIdx + 1}. ${q.degree} (${q.period})`, 18, startY);
          startY += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Institute: ${q.institution}`, 22, startY);
          if (q.description) {
            startY += 5;
            doc.text(`Details: ${q.description}`, 22, startY);
          }
          startY += 8;
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No qualifications added.", 18, startY);
        startY += 10;
      }

      startY += 5;

      // Social Links Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Website & Social Links", 14, startY);
      startY += 6;

      let socials = [];
      if (t.website) socials.push({ platform: "Website", url: t.website });
      if (t.socialLinks) socials = [...socials, ...t.socialLinks];

      if (socials.length > 0) {
        socials.forEach((s) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`${s.platform}:`, 18, startY);
          doc.setFont("helvetica", "normal");
          doc.text(s.url, 45, startY);
          startY += 6;
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No social links provided.", 18, startY);
      }

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text("System Admin Department - LMS Platform", 14, 285);

      // Save PDF
      doc.save(`Teacher_${t.teacherId}_Profile_Report.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  // Profile Photo එක ක්ලික් කළ විට ඩවුන්ලෝඩ් කරගැනීමේ ෆන්ෂන් එක
  const downloadProfilePhoto = async (photoFilename: string, teacherName: string) => {
    try {
      const imageUrl = `http://localhost:5000/profile_photos/${photoFilename}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${teacherName.replace(/\s+/g, '_')}_Profile_Photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Photo download error:", err);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.teacherId.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Delete Confirmation Popup */}
      {teacherToDelete && (
        <DeleteConfirmPopup
          teacherName={teacherToDelete.name}
          onCancel={() => setTeacherToDelete(null)}
          onConfirm={() => executeDelete(teacherToDelete._id)}
        />
      )}

      <div className="mx-auto max-w-[98%] px-2 py-10 xl:max-w-7xl xl:px-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
              }`}
            >
              <Users size={24} />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight sm:text-3xl ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Registered Teachers List
              </h1>
              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                A total of {teachers.length} teachers are registered
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 ${
                darkMode
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/40"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              }`}
            />
          </div>
        </div>

        {/* Success/Error Banners */}
        {success && (
          <div
            className={`mb-6 flex items-center gap-2.5 rounded-lg border p-4 text-sm font-medium ${
              darkMode
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div
            className={`mb-6 flex items-start gap-2.5 rounded-lg border p-4 text-sm font-medium ${
              darkMode
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Card containing the Table */}
        <div
          className={`rounded-2xl border shadow-sm transition-colors duration-300 ${
            darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Loading...
              </p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-400"
                }`}
              >
                <UserX size={28} />
              </div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No teachers have been registered yet.
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-400"
                }`}
              >
                <Search size={28} />
              </div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No results found for "{search}".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode
                      ? "bg-slate-900/50 text-slate-400"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  <tr>
                    <th className="px-3 py-4 sm:px-4">ID & Subject</th>
                    <th className="px-3 py-4 sm:px-4">Name & Email</th>
                    <th className="px-3 py-4 sm:px-4">Contact Info</th>
                    <th className="px-3 py-4 sm:px-4">Qualifications</th>
                    <th className="px-3 py-4 sm:px-4">Socials</th>
                    <th className="px-3 py-4 sm:px-4">Registered Date</th>
                    <th className="px-3 py-4 sm:px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? "divide-slate-700" : "divide-slate-100"
                  }`}
                >
                  {filteredTeachers.map((t) => (
                    <tr
                      key={t._id}
                      className={`transition-colors ${
                        darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                      }`}
                    >
                      {/* ID & Subject */}
                      <td className="px-3 py-4 sm:px-4 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          <span
                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                              darkMode
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {t.teacherId}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold break-words max-w-[120px] leading-tight ${
                              darkMode
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            <BookOpen size={10} className="flex-shrink-0" />
                            {t.subject}
                          </span>
                        </div>
                      </td>

                      {/* Name, Email & Clickable/Downloadable Profile Photo */}
                      <td
                        className={`px-3 py-4 sm:px-4 align-top font-medium ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            onClick={() => t.profilePhoto && downloadProfilePhoto(t.profilePhoto, t.name)}
                            title={t.profilePhoto ? "Click to download profile photo" : "No photo"}
                            className={`h-10 w-10 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center mt-0.5 cursor-pointer transition-transform hover:scale-110 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
                          >
                            {t.profilePhoto ? (
                              <img 
                                src={`http://localhost:5000/profile_photos/${t.profilePhoto}`} 
                                alt={t.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <User size={20} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold break-words max-w-[140px] leading-tight">{t.name}</span>
                            <span
                              className={`text-xs font-normal mt-1 break-words max-w-[140px] ${
                                darkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                            >
                              {t.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Phone & Address) */}
                      <td className="px-3 py-4 sm:px-4 align-top">
                        <div
                          className={`flex flex-col gap-2 text-xs ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {t.phone ? (
                            <div className="flex items-start gap-1.5">
                              <Phone size={14} className="opacity-70 mt-0.5 flex-shrink-0" /> 
                              <span className="break-words max-w-[120px]">{t.phone}</span>
                            </div>
                          ) : (
                            <span className="opacity-40 italic">No Phone</span>
                          )}
                          
                          {t.address ? (
                            <div className="flex items-start gap-1.5">
                              <MapPin size={14} className="opacity-70 mt-0.5 flex-shrink-0" /> 
                              <span className="break-words max-w-[120px] leading-tight">{t.address}</span>
                            </div>
                          ) : (
                            <span className="opacity-40 italic">No Address</span>
                          )}
                        </div>
                      </td>

                      {/* Qualifications */}
                      <td className="px-3 py-4 sm:px-4 align-top">
                        {t.qualifications && t.qualifications.length > 0 ? (
                          <div className="flex flex-col gap-3 max-w-[180px]">
                            {t.qualifications.map((q, idx) => (
                              <div key={idx} className="flex flex-col text-xs">
                                <span className={`font-semibold leading-tight break-words ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                                  {q.degree}
                                </span>
                                <span className={`opacity-80 leading-tight mt-0.5 break-words ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                  {q.institution}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-xs opacity-40 italic ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                            No Qualifications
                          </span>
                        )}
                      </td>

                      {/* Social Links */}
                      <td className="px-3 py-4 sm:px-4 align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                          {t.website ? (
                            <a
                              href={t.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Website"
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                darkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              <Globe size={11} />
                              Website
                            </a>
                          ) : null}

                          {t.socialLinks && t.socialLinks.length > 0 ? (
                            t.socialLinks.map((s, sIdx) => (
                              <a
                                key={sIdx}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={s.platform}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                                  darkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                              >
                                <ExternalLink size={11} />
                                {s.platform}
                              </a>
                            ))
                          ) : (!t.website && (!t.socialLinks || t.socialLinks.length === 0)) ? (
                            <span className={`text-xs opacity-40 italic ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              N/A
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 py-4 sm:px-4 align-top text-xs">
                        {t.createdAt ? (
                          <div className="flex flex-col">
                            <span
                              className={`font-semibold ${
                                darkMode ? "text-slate-200" : "text-slate-800"
                              }`}
                            >
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`mt-1 ${
                                darkMode ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {new Date(t.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="opacity-40 italic">Unknown Date</span>
                        )}
                      </td>

                      {/* Actions: Profile Download & Delete */}
                      <td className="px-3 py-4 sm:px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => downloadTeacherProfilePDF(t)}
                            className={`p-2 transition-colors rounded-lg flex items-center gap-1 text-xs font-semibold ${
                              darkMode
                                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                            title="Download Profile PDF"
                          >
                            <FileDown size={16} />
                            <span className="hidden xl:inline">PDF</span>
                          </button>
                          
                          <button
                            onClick={() => setTeacherToDelete(t)} 
                            className={`p-2 transition-colors rounded-lg ${
                              darkMode
                                ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                : "text-red-500 hover:bg-red-50 hover:text-red-700"
                            }`}
                            title="Delete Teacher"
                          >
                            <Trash2 size={18} />
                          </button>
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
    </div>
  );
}