"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Mail,
  BookOpen,
  IdCard,
  UserX,
  AlertCircle,
  Trash2, // අලුතින් එකතු කළ අයිකනය
  CheckCircle2 // සාර්ථක වූ බව පෙන්වීමට
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  subject: string;
}

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // සාර්ථක මැසේජ් එක සඳහා
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchTeachers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/teachers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeachers(res.data);
      } catch (err) {
        console.error(err);
        setError("ගුරුවරුන්ගේ දත්ත ලබා ගැනීමේදී දෝෂයක් මතු විය.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Teacher කෙනෙක්ව Delete කිරීමේ Function එක
  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(`ඔබට විශ්වාසද "${name}" ගුරු ගිණුම ඉවත් කළ යුතුයි කියා?`);
    if (!isConfirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:5000/api/admin/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(res.data.message || "ගිණුම සාර්ථකව ඉවත් කරන ලදී.");
      setTeachers(teachers.filter((t) => t._id !== id));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "ඉවත් කිරීමේදී දෝෂයක් මතු විය.");
      setTimeout(() => setError(""), 3000);
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
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                darkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
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
                ලියාපදිංචි ගුරුවරුන්ගේ ලැයිස්තුව
              </h1>
              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                මුළු ගුරුවරුන් {teachers.length} දෙනෙක් ලියාපදිංචි වී ඇත
              </p>
            </div>
          </div>

          {/* Search */}
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
              placeholder="සොයන්න..."
              className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:ring-2 ${
                darkMode
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/40"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
              }`}
            />
          </div>
        </div>

        {/* Success Message Banner */}
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

        {/* Card */}
        <div
          className={`rounded-2xl border shadow-sm transition-colors duration-300 ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-white"
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
          ) : error ? (
            <div
              className={`m-6 flex items-start gap-2.5 rounded-lg border p-4 text-sm font-medium ${
                darkMode
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  darkMode
                    ? "bg-slate-700 text-slate-400"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <UserX size={28} />
              </div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                තවමත් ගුරුවරුන් ලියාපදිංචි කර නොමැත.
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  darkMode
                    ? "bg-slate-700 text-slate-400"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Search size={28} />
              </div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                "{search}" සඳහා ප්‍රතිඵල හමු නොවීය.
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
                    <th className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <IdCard size={14} />
                        Teacher ID
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <Users size={14} />
                        Name
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <Mail size={14} />
                        Email
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <BookOpen size={14} />
                        Subject
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      Action
                    </th>
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
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                            darkMode
                              ? "bg-slate-700 text-slate-300"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.teacherId}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {t.name}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {t.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            darkMode
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <BookOpen size={12} />
                          {t.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(t._id, t.name)}
                          className={`p-2 transition-colors rounded-lg ${
                            darkMode
                              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
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

        {/* Footer */}
        {!loading && !error && teachers.length > 0 && (
          <p
            className={`mt-5 text-center text-xs ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            මුළු ගුරුවරුන් {filteredTeachers.length} / {teachers.length} ක් පෙන්වයි
          </p>
        )}
      </div>
    </div>
  );
}