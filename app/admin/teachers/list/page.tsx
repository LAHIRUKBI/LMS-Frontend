"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
} from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/app/components/BrandIcons";
import { useTheme } from "@/app/context/ThemeContext";
import DeleteConfirmPopup from "@/app/components/TeacherDeleteConfirmPopup"; // Popup component එක import කර ඇත

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  createdAt?: string; // දවස සහ වෙලාව පෙන්වීමට 
}

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete Popup සඳහා අවශ්‍ය State
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

  // Popup එකෙන් Confirm (Yes) කළ පසු ක්‍රියාත්මක වන function එක
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
      setTeacherToDelete(null); // Popup එක close කිරීම
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

      <div className="mx-auto max-w-[95%] px-4 py-10 xl:max-w-7xl xl:px-6">
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
              <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode
                      ? "bg-slate-900/50 text-slate-400"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  <tr>
                    <th className="px-6 py-4">ID & Subject</th>
                    <th className="px-6 py-4">Name & Email</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Socials</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
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
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              darkMode
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            <BookOpen size={10} />
                            {t.subject}
                          </span>
                        </div>
                      </td>

                      {/* Name & Email */}
                      <td
                        className={`px-6 py-4 font-medium ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-base">{t.name}</span>
                          <span
                            className={`text-xs font-normal mt-0.5 ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {t.email}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info (Phone & Address) */}
                      <td className="px-6 py-4">
                        <div
                          className={`flex flex-col gap-1.5 text-xs ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {t.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone size={14} className="opacity-70" /> {t.phone}
                            </div>
                          ) : (
                            <span className="opacity-40 italic">No Phone</span>
                          )}
                          
                          {t.address ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="opacity-70" /> {t.address}
                            </div>
                          ) : (
                            <span className="opacity-40 italic">No Address</span>
                          )}
                        </div>
                      </td>

                      {/* Social Links */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {t.website ? (
                            <a
                              href={t.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-md transition-colors ${
                                darkMode
                                  ? "text-indigo-400 hover:bg-indigo-500/20"
                                  : "text-indigo-600 hover:bg-indigo-50"
                              }`}
                            >
                              <Globe size={18} />
                            </a>
                          ) : null}

                          {t.facebook ? (
                            <a
                              href={t.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-md transition-colors ${
                                darkMode
                                  ? "text-blue-400 hover:bg-blue-500/20"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              <FacebookIcon size={18} />
                            </a>
                          ) : null}

                          {t.instagram ? (
                            <a
                              href={t.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-md transition-colors ${
                                darkMode
                                  ? "text-pink-400 hover:bg-pink-500/20"
                                  : "text-pink-600 hover:bg-pink-50"
                              }`}
                            >
                              <InstagramIcon size={18} />
                            </a>
                          ) : null}

                          {!t.website && !t.facebook && !t.instagram && (
                            <span
                              className={`text-xs opacity-40 italic ${
                                darkMode ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              N/A
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 text-xs">
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
                              className={`mt-0.5 ${
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

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTeacherToDelete(t)} // මෙතැනින් Popup එක Open වේ
                          className={`p-2 transition-colors rounded-lg ${
                            darkMode
                              ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              : "text-red-500 hover:bg-red-50 hover:text-red-700"
                          }`}
                          title="Delete Teacher"
                        >
                          <Trash2 size={18} />
                        </button>
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