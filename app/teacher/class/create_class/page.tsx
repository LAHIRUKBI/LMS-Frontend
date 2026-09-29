"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, BookOpen, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import ClassCreateConfirmPopup from "@/app/components/ClassCreateConfirmPopup";
import { useTheme } from "@/app/context/ThemeContext";

export default function CreateClassPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Popup Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form States
  const [grade, setGrade] = useState("Grade 1");
  const [medium, setMedium] = useState("Sinhala Medium");
  const [mode, setMode] = useState("Online");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  // Triggered when clicking Create Class button to open confirmation popup
  const handleFormSubmitTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(true);
  };

  // Actual class creation execution after confirmation
  const handleCreateClass = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("grade", grade);
      formData.append("medium", medium);
      formData.append("mode", mode);
      formData.append("day", day);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      if (description) formData.append("description", description);
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await axios.post("http://localhost:5000/api/classes/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage({ type: "success", text: res.data.message });
      // Reset optional fields
      setDescription("");
      setCoverImage(null);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "An error occurred while creating the class." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-8 transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>

      {/* Class Creation Confirmation Popup */}
      <ClassCreateConfirmPopup
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateClass}
        classData={{
          grade,
          medium,
          mode,
          day,
          startTime,
          endTime,
          description,
          coverImageFile: coverImage
        }}
      />

      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>Create New Class</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Add your teaching classes for Grade 1 to Grade 13 students.</p>
          </div>
          <button
            onClick={() => router.push("/teacher/classes/view_class")}
            className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${darkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
          >
            View All Classes
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Create Class Form Card */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
            <BookOpen className="text-blue-600" size={22} /> Class Information
          </h2>

          <form onSubmit={handleFormSubmitTrigger} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Grade Selection (1 to 13) */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Select Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Medium Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Medium</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              >
                <option value="Sinhala Medium">Sinhala Medium</option>
                <option value="English Medium">English Medium</option>
              </select>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Class Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Day Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Day of the Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Start Time (Time Picker Input) */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              />
            </div>

            {/* End Time (Time Picker Input) */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              />
            </div>

            {/* Optional Description */}
            <div className="sm:col-span-2 space-y-2">
              <label className={`text-xs font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description about this class..."
                rows={3}
                className={`w-full p-3.5 rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 resize-none break-words whitespace-pre-wrap ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              ></textarea>
            </div>

            {/* Optional Cover Photo */}
            <div className="sm:col-span-2 space-y-2">
              <label className={`text-xs font-bold uppercase flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                <ImageIcon size={14} /> Class Cover Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                className={`w-full p-3 rounded-2xl border-none outline-none font-medium text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 flex justify-end pt-4">
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

      </div>
    </div>
  );
}