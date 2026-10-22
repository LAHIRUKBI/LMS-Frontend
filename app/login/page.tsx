"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  GraduationCap,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Lock,
  IdCard,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import AnalysisLoader from "@/app/components/AnalysisLoader";
import loginCover from "@/app/images/login.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Loading the dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Running the API call and a minimum 3-second delay in parallel
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 3000));

      const [response] = await Promise.all([
        axios.post("http://localhost:5000/api/auth/login", credentials),
        delayPromise,
      ]);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const user = response.data.user;

      // Redirecting to the relevant dashboard based on the role
      if (user.role === "admin") {
        if (user.isDefault) {
          router.push("/admin/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
      } else if (user.role === "teacher") {
        router.push("/teacher/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-0 sm:p-6 transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      {/* Smooth Continuous Image Zoom In & Out Animation Style */}
      <style>{`
        @keyframes smooth-zoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-smooth-zoom {
          animation: smooth-zoom 14s ease-in-out infinite alternate;
          will-change: transform;
        }
      `}</style>

      {/* 3 Seconds Minimum Popup Loader */}
      {loading && (
        <AnalysisLoader
          title="Logging in..."
          subtitle="Verifying credentials & preparing your dashboard"
        />
      )}

      {/* Dark mode toggle button */}
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 z-50 ${
          darkMode
            ? "border-slate-800 bg-slate-900/80 text-amber-300 shadow-black/40 hover:bg-slate-800"
            : "border-slate-200 bg-white/90 text-slate-700 shadow-slate-300/40 hover:bg-white"
        }`}
      >
        {darkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>

      {/* Main Card Container */}
      <div
        className={`relative z-10 flex flex-col w-full min-h-screen sm:min-h-0 sm:max-w-[400px] sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 ${
          darkMode
            ? "bg-slate-900 border border-slate-800 text-white shadow-black/60"
            : "bg-white border border-slate-100 text-slate-800 shadow-xl"
        }`}
      >
        {/* Top Header Graphic with Background Image & Exact Diagonal Curved Wave */}
        <div className="relative h-80 sm:h-64 w-full overflow-hidden bg-slate-900">
          {/* Nature / Foliage Background Image with Smooth In-and-Out Animation */}
          <div
            className="absolute inset-0 bg-cover bg-center animate-smooth-zoom"
            style={{
              backgroundImage: `url(${loginCover.src})`,
            }}
          />

          {/* Deep Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 pointer-events-none" />

          {/* Exact Asymmetrical Smooth Wave Divider matching the image */}
          <div className="absolute -bottom-0.5 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
            <svg
              className={`relative block w-full h-16 sm:h-20 transition-colors duration-300 translate-y-[1px] ${
                darkMode ? "text-slate-900" : "text-white"
              }`}
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,90 Q450,110 800,45 T1200,10 L1200,120 L0,120 Z" />
            </svg>
          </div>
        </div>

        {/* Form Body */}
        <div className="relative z-20 -mt-[1px] flex-1 flex flex-col justify-between px-7 pb-8 pt-8 sm:px-8">
          <div>
            {/* Title Section */}
            <div className="text-center mb-6">
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Welcome Back
              </h2>
              <p
                className={`mt-1 text-xs sm:text-sm font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Login to your account
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                className={`mb-5 flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs ${
                  darkMode
                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Teacher / Admin ID Input */}
              <div className="relative group">
                <IdCard
                  className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-indigo-400"
                      : "text-slate-400 group-focus-within:text-indigo-600"
                  }`}
                />
                <input
                  id="id"
                  type="text"
                  name="id"
                  value={credentials.id}
                  onChange={handleChange}
                  placeholder="Enter ID"
                  autoComplete="username"
                  required
                  className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-xs sm:text-sm font-medium outline-none transition-all duration-200 ${
                    darkMode
                      ? "border-slate-800 bg-slate-950/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                  }`}
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <Lock
                  className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-indigo-400"
                      : "text-slate-400 group-focus-within:text-indigo-600"
                  }`}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className={`w-full rounded-2xl border py-3 pl-11 pr-11 text-xs sm:text-sm font-medium outline-none transition-all duration-200 ${
                    darkMode
                      ? "border-slate-800 bg-slate-950/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Helper Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label
                  className={`flex cursor-pointer select-none items-center gap-2 font-medium ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-indigo-600"
                  />
                  Remember Me
                </label>
              </div>

              {/* Login Pill Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-bold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.98] ${
                  loading
                    ? "cursor-not-allowed bg-slate-500 opacity-80"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-600/40"
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{loading ? "Logging in..." : "Login"}</span>
              </button>
            </form>
          </div>

          {/* Security & Verification Row */}
          <div className="mt-7 space-y-3">
            <div
              className={`flex items-center justify-center gap-3 rounded-2xl border py-2 px-3 text-[11px] font-semibold ${
                darkMode
                  ? "border-slate-800 bg-slate-950/60 text-slate-400"
                  : "border-slate-100 bg-slate-50 text-slate-500"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-500" />
                256-bit encrypted
              </span>
              <span className={darkMode ? "text-slate-700" : "text-slate-300"}>|</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Verified staff only
              </span>
            </div>

            {/* Footer Text */}
            <p className={`text-center text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              © {new Date().getFullYear()} LMS Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}