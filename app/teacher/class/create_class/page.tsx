"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Trash2, Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form States
  const [grade, setGrade] = useState("Grade 1");
  const [medium, setMedium] = useState("Sinhala Medium");
  const [mode, setMode] = useState("Online");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endTime, setEndTime] = useState("10:00");
  const [endAmPm, setEndAmPm] = useState("AM");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchClasses(token);
  }, [router]);

  const fetchClasses = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes/my-classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const classData = {
        grade,
        medium,
        mode,
        day,
        startTime: `${startTime} ${startAmPm}`,
        endTime: `${endTime} ${endAmPm}`
      };

      const res = await axios.post("http://localhost:5000/api/classes/create", classData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: res.data.message });
      setClasses([res.data.classData, ...classes]);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "පන්තිය නිර්මාණය කිරීමේදී දෝෂයක් මතු විය." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("මෙම පන්තිය ඉවත් කිරීමට අවශ්‍ය බව নিশ্চিতද?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(classes.filter((c) => c._id !== id));
      setMessage({ type: "success", text: "පන්තිය සාර්ථකව ඉවත් කරන ලදී." });
    } catch (err) {
      console.error("Error deleting class:", err);
      setMessage({ type: "error", text: "පන්තිය ඉවත් කිරීම අසාර්ථක විය." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Manage & Create Classes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your teaching classes for Grade 1 to Grade 13 students.</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Create Class Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={22} /> Add New Class
          </h2>

          <form onSubmit={handleCreateClass} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Grade Selection (1 to 13) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Grade</label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Medium Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Medium</label>
              <select 
                value={medium} 
                onChange={(e) => setMedium(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sinhala Medium">Sinhala Medium</option>
                <option value="English Medium">English Medium</option>
              </select>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Class Mode</label>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Day Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Day of the Week</label>
              <select 
                value={day} 
                onChange={(e) => setDay(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium focus:ring-2 focus:ring-blue-500"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Start Time</label>
              <div className="flex gap-2">
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium"
                />
                <select 
                  value={startAmPm} 
                  onChange={(e) => setStartAmPm(e.target.value)}
                  className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
              <div className="flex gap-2">
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium"
                />
                <select 
                  value={endAmPm} 
                  onChange={(e) => setEndAmPm(e.target.value)}
                  className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-bold"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span>{loading ? "Creating..." : "Create Class"}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Existing Classes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Created Classes</h2>

          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">No classes created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold">{cls.grade}</span>
                      <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-extrabold">{cls.medium}</span>
                      <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-extrabold">{cls.mode}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 pt-1">
                      <Calendar size={16} className="text-slate-400" /> {cls.day}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> {cls.startTime} - {cls.endTime}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleDeleteClass(cls._id)}
                    className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-2xl transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}