// src/app/teacher/classes/create/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Trash2, Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import ClassCreateConfirmPopup from "@/app/components/ClassCreateConfirmPopup";
import ClassDeleteConfirmPopup from "@/app/components/ClassDeleteConfirmPopup";

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Popup Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  // Form States
  const [grade, setGrade] = useState("Grade 1");
  const [medium, setMedium] = useState("Sinhala Medium");
  const [mode, setMode] = useState("Online");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchClasses(token);
  }, [router]);

  // Fetch classes belonging to the teacher
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
      setClasses([res.data.classData, ...classes]);
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

  // Actual class deletion execution after confirmation
  const handleDeleteClass = async () => {
    if (!deleteClassId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/classes/${deleteClassId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(classes.filter((c) => c._id !== deleteClassId));
      setMessage({ type: "success", text: "Class successfully removed." });
      setDeleteClassId(null);
    } catch (err) {
      console.error("Error deleting class:", err);
      setMessage({ type: "error", text: "Failed to remove the class." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8 transition-colors duration-500">
      
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

      {/* Class Delete Confirmation Popup */}
      <ClassDeleteConfirmPopup
        isOpen={!!deleteClassId}
        onClose={() => setDeleteClassId(null)}
        onConfirm={handleDeleteClass}
      />

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

          <form onSubmit={handleFormSubmitTrigger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
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
              <input 
                type="text" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 08:00 AM"
                required
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium"
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
              <input 
                type="text" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                required
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium"
              />
            </div>

            {/* Optional Description */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description about this class..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Optional Cover Photo */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <ImageIcon size={14} /> Class Cover Photo (Optional)
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none font-medium text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
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
                <div key={cls._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
                  {cls.coverImage && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={`http://localhost:5000${cls.coverImage}`} alt={cls.grade} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
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
                      {cls.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 line-clamp-2">{cls.description}</p>
                      )}
                    </div>

                    <button 
                      onClick={() => setDeleteClassId(cls._id)}
                      className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-2xl transition-colors flex-shrink-0"
                      title="Delete Class"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}