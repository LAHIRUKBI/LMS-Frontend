"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, BookOpen, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Link as LinkIcon, MapPin, Building } from "lucide-react";
import ClassCreateConfirmPopup from "@/app/components/ClassCreateConfirmPopup";
import { useTheme } from "@/app/context/ThemeContext";

export default function CreateClassPage() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form States
  const [grade, setGrade] = useState("Grade 1");
  const [customGradeName, setCustomGradeName] = useState("");
  const [medium, setMedium] = useState("Sinhala Medium");
  const [mode, setMode] = useState("Online");
  
  // Online Specific States
  const [onlineLink, setOnlineLink] = useState("");
  const [provideLater, setProvideLater] = useState(false);
  const [linkDisplayMode, setLinkDisplayMode] = useState("scheduled");
  const [linkStartDateTime, setLinkStartDateTime] = useState("");
  const [linkEndDateTime, setLinkEndDateTime] = useState("");

  // Offline Specific States
  const [instituteName, setInstituteName] = useState("");
  const [instituteAddress, setInstituteAddress] = useState("");

  // Recurring Day & Time
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

  // Helper to get day index from day name
  const getDayIndex = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  // Helper to calculate min/max datetime for the selected recurring day & class time
  const getScheduledConstraints = () => {
    const targetDayIndex = getDayIndex(day);
    const now = new Date();
    
    const currentDayIndex = now.getDay();
    let dayDifference = targetDayIndex - currentDayIndex;
    if (dayDifference < 0) {
      dayDifference += 7;
    }
    
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayDifference);
    
    const dateString = targetDate.toISOString().split('T')[0];
    
    return {
      min: `${dateString}T${startTime}`,
      max: `${dateString}T${endTime}`
    };
  };

  const constraints = getScheduledConstraints();

  // Strict validator when user picks date/time
  const handleStartDateTimeChange = (val: string) => {
    if (!val) {
      setLinkStartDateTime("");
      return;
    }

    const selectedDate = new Date(val);
    const selectedDayOfWeek = selectedDate.getDay();
    const targetDayIndex = getDayIndex(day);

    if (selectedDayOfWeek !== targetDayIndex) {
      setMessage({ type: "error", text: `You can only select dates that fall on the recurring class day (${day}).` });
      setLinkStartDateTime("");
      return;
    }

    setMessage({ type: "", text: "" });
    setLinkStartDateTime(val);
  };

  const handleEndDateTimeChange = (val: string) => {
    if (!val) {
      setLinkEndDateTime("");
      return;
    }

    const selectedDate = new Date(val);
    const selectedDayOfWeek = selectedDate.getDay();
    const targetDayIndex = getDayIndex(day);

    if (selectedDayOfWeek !== targetDayIndex) {
      setMessage({ type: "error", text: `You can only select dates that fall on the recurring class day (${day}).` });
      setLinkEndDateTime("");
      return;
    }

    setMessage({ type: "", text: "" });
    setLinkEndDateTime(val);
  };

  const handleFormSubmitTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade === "Other" && !customGradeName.trim()) {
      setMessage({ type: "error", text: "Please enter a custom class name for 'Other'." });
      return;
    }

    // Validation for Scheduled Online Links against Recurring Day & Time
    if (mode === "Online" && !provideLater && linkDisplayMode === "scheduled") {
      if (linkStartDateTime && linkEndDateTime) {
        const startDate = new Date(linkStartDateTime);
        const endDate = new Date(linkEndDateTime);

        if (startDate >= endDate) {
          setMessage({ type: "error", text: "Start Date & Time must be earlier than End Date & Time." });
          return;
        }

        const selectedDayOfWeek = startDate.getDay();
        const targetDayIndex = getDayIndex(day);

        if (selectedDayOfWeek !== targetDayIndex) {
          setMessage({ type: "error", text: `The scheduled link start date must fall on the recurring class day (${day}).` });
          return;
        }

        const startHourMin = startDate.getHours() * 60 + startDate.getMinutes();
        const endHourMin = endDate.getHours() * 60 + endDate.getMinutes();
        
        const [classStartH, classStartM] = startTime.split(":").map(Number);
        const [classEndH, classEndM] = endTime.split(":").map(Number);
        const classStartMin = classStartH * 60 + classStartM;
        const classEndMin = classEndH * 60 + classEndM;

        if (endHourMin < classStartMin || startHourMin > classEndMin) {
          setMessage({ type: "error", text: `The scheduled link time must overlap with the class duration (${startTime} - ${endTime}).` });
          return;
        }
      }
    }

    setIsCreateModalOpen(true);
  };

  const handleCreateClass = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("grade", grade);
      if (grade === "Other") formData.append("customGradeName", customGradeName);
      formData.append("medium", medium);
      formData.append("mode", mode);
      
      if (mode === "Online") {
        formData.append("provideLater", String(provideLater));
        if (!provideLater) {
          formData.append("onlineLink", onlineLink);
          formData.append("linkDisplayMode", linkDisplayMode);
          if (linkDisplayMode === 'scheduled') {
            formData.append("linkStartDateTime", linkStartDateTime);
            formData.append("linkEndDateTime", linkEndDateTime);
          }
        }
      } else {
        formData.append("instituteName", instituteName);
        formData.append("instituteAddress", instituteAddress);
      }

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
      setDescription("");
      setCoverImage(null);
      setOnlineLink("");
      setLinkStartDateTime("");
      setLinkEndDateTime("");
      setInstituteName("");
      setInstituteAddress("");
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "An error occurred while creating the class." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen w-full overflow-hidden font-sans p-4 flex flex-col items-center justify-center transition-colors duration-500 box-border ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>

      <ClassCreateConfirmPopup
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateClass}
        classData={{
          grade: grade === "Other" ? customGradeName : grade,
          medium,
          mode,
          day,
          startTime,
          endTime,
          description,
          coverImageFile: coverImage
        }}
      />

      <div className="w-full max-w-3xl mx-auto space-y-3">
        
        {/* Header Section */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
          <div>
            <h1 className={`text-xl font-extrabold flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              <BookOpen className="text-blue-600" size={20} /> Create New Class
            </h1>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Setup classes with immediate or scheduled online link access.</p>
          </div>
          <button
            onClick={() => router.push("/teacher/classes/view_class")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
          >
            View All Classes
          </button>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Form Container */}
        <div className={`rounded-2xl p-5 border shadow-sm transition-colors duration-500 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          
          <form onSubmit={handleFormSubmitTrigger} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">

            {/* Grade Selection */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Select Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
                <option value="Other">Other (Custom Name)</option>
              </select>
            </div>

            {grade === "Other" && (
              <div className="space-y-1 sm:col-span-3">
                <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Custom Class Name</label>
                <input
                  type="text"
                  value={customGradeName}
                  onChange={(e) => setCustomGradeName(e.target.value)}
                  placeholder="e.g. Advanced ICT Revision"
                  required
                  className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                />
              </div>
            )}

            {/* Medium */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Medium</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              >
                <option value="Sinhala Medium">Sinhala Medium</option>
                <option value="English Medium">English Medium</option>
              </select>
            </div>

            {/* Mode */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Class Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Online Configurations */}
            {mode === "Online" ? (
              <div className="sm:col-span-3 space-y-2.5 p-3 rounded-xl border bg-blue-50/40 dark:bg-slate-800/40 border-blue-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                    <LinkIcon size={14} /> Online Meeting Link
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={provideLater}
                      onChange={(e) => setProvideLater(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    Provide Later
                  </label>
                </div>

                {!provideLater && (
                  <>
                    <input
                      type="url"
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      placeholder="https://zoom.us/j/... or Google Meet link"
                      required={!provideLater}
                      className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 shadow-sm"}`}
                    />

                    {/* Display Type Selection */}
                    <div className="space-y-1">
                      <label className={`text-[11px] font-bold uppercase block ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Link Availability Type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="linkDisplayMode"
                            value="immediate"
                            checked={linkDisplayMode === 'immediate'}
                            onChange={(e) => setLinkDisplayMode(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          Open Immediately
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="linkDisplayMode"
                            value="scheduled"
                            checked={linkDisplayMode === 'scheduled'}
                            onChange={(e) => setLinkDisplayMode(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          Schedule
                        </label>
                      </div>
                    </div>

                    {linkDisplayMode === 'scheduled' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className={`text-[11px] font-bold uppercase block mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Start Date & Time (Only {day} allowed)</label>
                          <input
                            type="datetime-local"
                            value={linkStartDateTime}
                            min={constraints.min}
                            onChange={(e) => handleStartDateTimeChange(e.target.value)}
                            required={!provideLater && linkDisplayMode === 'scheduled'}
                            className={`w-full p-2 rounded-xl border-none text-xs font-medium ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 shadow-sm"}`}
                          />
                        </div>
                        <div>
                          <label className={`text-[11px] font-bold uppercase block mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>End Date & Time (Only {day} allowed)</label>
                          <input
                            type="datetime-local"
                            value={linkEndDateTime}
                            min={linkStartDateTime || constraints.min}
                            onChange={(e) => handleEndDateTimeChange(e.target.value)}
                            required={!provideLater && linkDisplayMode === 'scheduled'}
                            className={`w-full p-2 rounded-xl border-none text-xs font-medium ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 shadow-sm"}`}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border bg-orange-50/40 dark:bg-slate-800/40 border-orange-200 dark:border-slate-700">
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${darkMode ? "text-orange-400" : "text-orange-700"}`}>
                    <Building size={14} /> Institute Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    placeholder="e.g. Siyapatha Education Institute"
                    className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 shadow-sm"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${darkMode ? "text-orange-400" : "text-orange-700"}`}>
                    <MapPin size={14} /> Institute Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={instituteAddress}
                    onChange={(e) => setInstituteAddress(e.target.value)}
                    placeholder="e.g. Main Street, Gampaha"
                    className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs ${darkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-700 shadow-sm"}`}
                  />
                </div>
              </div>
            )}

            {/* Recurring Day of the Week */}
            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Recurring Class Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time Slots */}
            <div className="space-y-1 sm:col-span-2">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Class Duration Time</label>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className={`text-[11px] font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description about this class..."
                rows={1}
                className={`w-full p-2.5 rounded-xl border-none outline-none font-medium text-xs resize-none ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              ></textarea>
            </div>

            {/* Cover Photo */}
            <div className="sm:col-span-1 space-y-1">
              <label className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                <ImageIcon size={14} /> Cover Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                className={`w-full p-1.5 rounded-xl border-none outline-none font-medium text-[10px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
              />
            </div>

            {/* Submit */}
            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                <span>{loading ? "Creating..." : "Create Class"}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}