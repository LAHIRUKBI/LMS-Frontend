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
  PlayCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dark mode preference එක localStorage එකෙන් load කිරීම
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
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        credentials
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const user = response.data.user;

      // === Role එක අනුව අදාළ Dashboard එකට යැවීම ===
      if (user.role === "admin") {
        if (user.isDefault) {
          router.push("/admin/register");
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
      className={`relative min-h-screen flex items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      {/* Ambient background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl ${
            darkMode ? "bg-indigo-600/15" : "bg-indigo-400/20"
          }`}
        />
        <div
          className={`absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full blur-3xl ${
            darkMode ? "bg-violet-600/15" : "bg-violet-400/20"
          }`}
        />
        <div
          className={`absolute inset-0 ${darkMode ? "opacity-[0.10]" : "opacity-[0.16]"}`}
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(100 116 139 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(100 116 139 / 0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 45%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 45%, black 40%, transparent 100%)",
          }}
        />
      </div>

      {/* Dark mode toggle button */}
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
        className={`fixed top-5 right-5 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 z-50 ${
          darkMode
            ? "border-slate-800 bg-slate-900/80 text-amber-300 shadow-black/40 hover:bg-slate-800"
            : "border-slate-200 bg-white/80 text-slate-700 shadow-slate-300/40 hover:bg-white"
        }`}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Main Card Container */}
      <div
        className={`relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border shadow-2xl transition-colors duration-300 ${
          darkMode
            ? "border-slate-800 bg-slate-900 shadow-black/60"
            : "border-slate-200/80 bg-white shadow-slate-400/20"
        }`}
      >
        {/* Left Side - Image & Welcome Text (Hidden on small screens) */}
        <div className="relative hidden w-1/2 bg-slate-950 md:flex flex-col justify-between p-10 lg:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: "url('/images/login-hero.jpg')" }}
          />
          {/* Layered cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-950/85 to-violet-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
          <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

          {/* Brand lockup */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-900/50 ring-1 ring-white/20">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-white">EduMaster LMS</p>
              <p className="text-[11px] font-medium text-slate-300/80">
                Learning Management System
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="relative z-10 py-8">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-indigo-100 backdrop-blur">
              Academic Year 2026 Portal
            </span>

            <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white mb-4">
              Unlock Your <br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                Learning Potential
              </span>
            </h2>

            <p className="max-w-sm text-sm leading-relaxed text-slate-300">
              Join our Learning Management System and start exploring the best educational
              resources today.
            </p>

            {/* Feature highlights */}
            <ul className="mt-7 space-y-3">
              {[
                { icon: <PlayCircle size={15} />, label: "HD video lectures and lesson archives" },
                { icon: <FileText size={15} />, label: "Instant PDF notes and paper distribution" },
                { icon: <ShieldCheck size={15} />, label: "Role based secure access for staff" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-indigo-200 backdrop-blur">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-200">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
            {[
              { value: "12.4k", label: "Students" },
              { value: "860+", label: "Lessons" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-extrabold tracking-tight text-white">{stat.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full flex-col justify-center px-7 py-10 sm:px-10 md:w-1/2 md:px-12 lg:px-14">
          <div className="mb-7">
            {/* Logo Icon */}
            <div className="mb-6 flex items-center gap-3">
              <div className="md:hidden">
                <p
                  className={`text-sm font-extrabold tracking-tight ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  EduMaster LMS
                </p>
                <p className={`text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Learning Management System
                </p>
              </div>
            </div>

            <h2
              className={`text-3xl font-extrabold tracking-tight ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Login to Your Account
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Access your LMS portal to manage your classes and resources.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                darkMode
                  ? "border-red-500/25 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${
                  darkMode ? "bg-red-500/15 text-red-300" : "bg-red-100 text-red-600"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Login failed
                </p>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group">
              <label
                htmlFor="id"
                className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Admin ID / Teacher ID
              </label>
              <div className="relative">
                <IdCard
                  className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
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
                  placeholder="Enter your ID"
                  autoComplete="username"
                  required
                  className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:ring-4 ${
                    darkMode
                      ? "border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/15"
                  }`}
                />
              </div>
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`w-full rounded-2xl border py-3 pl-11 pr-12 text-sm font-medium outline-none transition-all duration-200 focus:ring-4 ${
                    darkMode
                      ? "border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 transition-colors ${
                    darkMode
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Helper row */}
            <div className="flex items-center justify-between pt-0.5">
              <label
                className={`flex cursor-pointer select-none items-center gap-2 text-xs font-medium ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-indigo-600"
                />
                Keep me signed in
              </label>
              <span
                className={`cursor-pointer text-xs font-semibold transition-colors ${
                  darkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
                loading
                  ? "cursor-not-allowed bg-slate-500 text-white shadow-none"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-600/40 active:scale-[0.99]"
              }`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Logging in..." : "Login to Account"}
              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          {/* Trust row */}
          <div
            className={`mt-6 flex items-center justify-center gap-4 rounded-2xl border px-4 py-2.5 text-[11px] font-semibold ${
              darkMode
                ? "border-slate-800 bg-slate-950/60 text-slate-400"
                : "border-slate-200 bg-slate-50 text-slate-500"
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
          <div className="mt-6 text-center text-xs">
            <p className={darkMode ? "text-slate-500" : "text-slate-400"}>
              © {new Date().getFullYear()} LMS Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
