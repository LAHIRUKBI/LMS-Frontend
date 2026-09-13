"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
      className={`min-h-screen flex items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Dark mode toggle button */}
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
        className={`fixed top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-all duration-300 hover:scale-105 z-50 ${
          darkMode
            ? "border-slate-700 bg-slate-800 text-yellow-400"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Main Card Container */}
      <div
        className={`flex w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl transition-colors duration-300 ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        {/* Left Side - Image & Welcome Text (Hidden on small screens) */}
        <div className="relative hidden w-1/2 bg-slate-900 md:flex flex-col justify-between p-12">
          {/* Replace this URL with any education/LMS related image you like */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold leading-tight text-white mb-4">
              Unlock Your <br /> Learning Potential
            </h2>
            <p className="text-lg text-slate-300 max-w-sm">
              Join our Learning Management System and start exploring the best educational resources today.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-12 lg:px-16">
          <div className="mb-8">
            {/* Logo Icon */}
            <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${darkMode ? "bg-orange-500/20" : "bg-orange-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-8 w-8 ${darkMode ? "text-orange-400" : "text-orange-500"}`}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Login to Your Account
            </h2>
            <p className={`mt-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Access your LMS portal to manage your classes and resources.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                darkMode ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="id" className={`mb-1.5 block text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                Admin ID / Teacher ID
              </label>
              <input
                id="id"
                type="text"
                name="id"
                value={credentials.id}
                onChange={handleChange}
                placeholder="Enter your ID"
                autoComplete="username"
                required
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 ${
                  darkMode
                    ? "border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-orange-500/30"
                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                }`}
              />
            </div>

            <div>
              <label htmlFor="password" className={`mb-1.5 block text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 focus:ring-2 ${
                    darkMode
                      ? "border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-orange-500/30"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors ${
                    darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900/50 ${
                loading
                  ? "cursor-not-allowed bg-slate-600 text-white"
                  : darkMode ? "bg-slate-100 text-slate-900 hover:bg-white" : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {loading && (
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? "Logging in..." : "Login to Account"}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center text-xs">
            <p className={darkMode ? "text-slate-500" : "text-slate-400"}>
              © {new Date().getFullYear()} LMS Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}