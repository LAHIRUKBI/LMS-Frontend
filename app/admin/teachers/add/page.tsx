"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  IdCard,
  User,
  Mail,
  BookOpen,
  Key,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function AddTeacherPage() {
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    email: "",
    subject: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode } = useTheme();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/add-teacher",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({
        type: "success",
        text: res.data.message || "සාර්ථකව ඇතුළත් කරන ලදී!",
      });
      setFormData({
        teacherId: "",
        name: "",
        email: "",
        subject: "",
        password: "",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "දෝෂයක් මතු විය.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reusable input class (light + dark)
  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-base font-medium outline-none transition-all duration-200 focus:ring-2 ${
    darkMode
      ? "border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/40"
      : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
  }`;

  const labelClass = `mb-1.5 flex items-center gap-1.5 text-sm font-medium ${
    darkMode ? "text-slate-300" : "text-slate-700"
  }`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                darkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <UserPlus size={24} />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight sm:text-3xl ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                නව ගුරුවරයෙකු ලියාපදිංචි කිරීම
              </h1>
              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                ගුරුවරයෙකුගේ තොරතුරු පහත පුරවන්න
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 sm:p-8 ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-white"
          }`}
        >
          {/* Message Banner */}
          {message.text && (
            <div
              className={`mb-6 flex items-start gap-2.5 rounded-lg border p-4 text-sm font-medium ${
                message.type === "success"
                  ? darkMode
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-green-200 bg-green-50 text-green-700"
                  : darkMode
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleAddTeacher} className="space-y-5">
            {/* Row 1: Teacher ID + Full Name */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="teacherId" className={labelClass}>
                  <IdCard size={14} />
                  Teacher ID
                </label>
                <input
                  id="teacherId"
                  type="text"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  placeholder="උදා: TCH-001"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className={labelClass}>
                  <User size={14} />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="උදා: Kamal Perera"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                <Mail size={14} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="teacher@example.com"
                className={inputClass}
                required
              />
            </div>

            {/* Row 3: Subject + Password */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="subject" className={labelClass}>
                  <BookOpen size={14} />
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="උදා: Mathematics"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>
                  <Key size={14} />
                  Temporary Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors ${
                      darkMode
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  loading
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Add Teacher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer hint */}
        <p
          className={`mt-5 text-center text-xs ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          ලියාපදිංචි කිරීමෙන් පසු ගුරුවරයාට email මගින් තොරතුරු ලැබේ.
        </p>
      </div>
    </div>
  );
}