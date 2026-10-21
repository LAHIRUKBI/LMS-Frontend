// src/app/components/VideoUploadModal.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import {
  UploadCloud,
  Video,
  BookOpen,
  GraduationCap,
  AlignLeft,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Link as LinkIcon,
  PlaySquare
} from "lucide-react";
import UploadSuccessPopup from "@/app/components/VideoUploadSuccessPopup";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper to extract the Video ID from a YouTube link
const extractYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
};

export default function VideoUploadModal({ isOpen, onClose, onSuccess }: VideoUploadModalProps) {
  const { darkMode } = useTheme();

  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPopupUploading, setIsPopupUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [subjectCategory, setSubjectCategory] = useState("");
  const [gradeCategory, setGradeCategory] = useState("");

  // Custom Dropdown States
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSchoolGradeOpen, setIsSchoolGradeOpen] = useState(false);
  const [isUniSemesterOpen, setIsUniSemesterOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    description: "",
    youtubeUrl: ""
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.youtubeUrl.trim()) {
      setErrorMessage("Please enter a valid YouTube video link.");
      return;
    }

    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      setErrorMessage("Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=xxxx).");
      return;
    }

    setUploading(true);
    setShowPopup(true);
    setIsPopupUploading(true);

    const token = localStorage.getItem("token");

    // Sending a JSON request to the backend instead of file uploads
    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("subject", formData.subject);
    uploadData.append("grade", formData.grade);
    uploadData.append("description", formData.description);
    uploadData.append("type", "video");
    uploadData.append("youtubeUrl", formData.youtubeUrl.trim());

    try {
      await axios.post("http://localhost:5000/api/materials/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTimeout(() => {
        setIsPopupUploading(false);
        setFormData({ title: "", subject: "", grade: "", description: "", youtubeUrl: "" });
        setSubjectCategory("");
        setGradeCategory("");
        onSuccess();
      }, 500);

    } catch (err: any) {
      setShowPopup(false);
      setIsPopupUploading(false);
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
    }
  };

  const previewId = extractYouTubeId(formData.youtubeUrl);

  const inputClass = `w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 pl-9 sm:pl-10 transition-colors ${darkMode
      ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500"
      : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"
    }`;

  const labelClass = `block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  const subjectsList = [
    "Mathematics", "Science", "Physics", "Chemistry", "Biology",
    "IT", "English", "Sinhala", "History", "Geography", "Commerce"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-lg sm:max-w-2xl rounded-3xl shadow-2xl border p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-gray-900"}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-2xl shadow-sm shrink-0 ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base sm:text-xl font-extrabold tracking-tight truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                Add Video Lesson
              </h2>
              <p className={`mt-0.5 text-[11px] sm:text-sm font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Add recorded YouTube lessons or tutorials for your students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors shrink-0 ${darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-red-700 dark:text-red-300">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Video Title */}
            <div>
              <label className={labelClass}>Video Title</label>
              <div className="relative">
                <Video size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Intro to Cytology" className={inputClass} />
              </div>
            </div>

            {/* Subject (Custom Dropdown) */}
            <div className="relative">
              <label className={labelClass}>Subject</label>
              <div className="relative">
                <BookOpen size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <div
                  onClick={() => { setIsSubjectOpen(!isSubjectOpen); setIsCategoryOpen(false); setIsSchoolGradeOpen(false); setIsUniSemesterOpen(false); }}
                  className={`w-full rounded-xl border py-2.5 px-3.5 pl-9 sm:pl-10 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                    }`}
                >
                  <span className={!subjectCategory ? "opacity-50" : ""}>{subjectCategory || "Select Subject"}</span>
                  <ChevronDown size={14} className="opacity-60" />
                </div>

                {isSubjectOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                    }`}>
                    {subjectsList.map((subj) => (
                      <div
                        key={subj}
                        onClick={() => {
                          setSubjectCategory(subj);
                          setFormData({ ...formData, subject: subj });
                          setIsSubjectOpen(false);
                        }}
                        className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                          }`}
                      >
                        {subj}
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        setSubjectCategory("other");
                        setFormData({ ...formData, subject: "" });
                        setIsSubjectOpen(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer font-bold text-indigo-500 ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                        }`}
                    >
                      Other (Type Subject)
                    </div>
                  </div>
                )}
              </div>

              {subjectCategory === "other" && (
                <div className="mt-2.5 relative">
                  <BookOpen size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Type your subject"
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {/* Grade / Batch */}
            <div className="md:col-span-2">
              <label className={labelClass}>Grade / Batch</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Category Selector */}
                <div className="relative">
                  <GraduationCap size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <div
                    onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsSubjectOpen(false); setIsSchoolGradeOpen(false); setIsUniSemesterOpen(false); }}
                    className={`w-full rounded-xl border py-2.5 px-3.5 pl-9 sm:pl-10 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                      }`}
                  >
                    <span className={!gradeCategory ? "opacity-50" : ""}>
                      {gradeCategory === "school" ? "School (Grade 1 - 13)" : gradeCategory === "university" ? "University (Semesters)" : gradeCategory === "other" ? "Other" : "Select Category"}
                    </span>
                    <ChevronDown size={14} className="opacity-60" />
                  </div>

                  {isCategoryOpen && (
                    <div className={`absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border shadow-xl p-1 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                      }`}>
                      <div
                        onClick={() => { setGradeCategory("school"); setFormData({ ...formData, grade: "" }); setIsCategoryOpen(false); }}
                        className={`px-3 py-2 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                      >
                        School (Grade 1 - 13)
                      </div>
                      <div
                        onClick={() => { setGradeCategory("university"); setFormData({ ...formData, grade: "" }); setIsCategoryOpen(false); }}
                        className={`px-3 py-2 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                      >
                        University (Semesters)
                      </div>
                      <div
                        onClick={() => { setGradeCategory("other"); setFormData({ ...formData, grade: "" }); setIsCategoryOpen(false); }}
                        className={`px-3 py-2 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                      >
                        Other
                      </div>
                    </div>
                  )}
                </div>

                {/* School Grade Custom Dropdown */}
                {gradeCategory === "school" && (
                  <div className="relative">
                    <div
                      onClick={() => setIsSchoolGradeOpen(!isSchoolGradeOpen)}
                      className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                        }`}
                    >
                      <span className={!formData.grade ? "opacity-50" : ""}>{formData.grade || "Select Grade"}</span>
                      <ChevronDown size={14} className="opacity-60" />
                    </div>

                    {isSchoolGradeOpen && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                        }`}>
                        {[...Array(13)].map((_, i) => (
                          <div
                            key={`Grade ${i + 1}`}
                            onClick={() => {
                              setFormData({ ...formData, grade: `Grade ${i + 1}` });
                              setIsSchoolGradeOpen(false);
                            }}
                            className={`px-3 py-2 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                          >
                            Grade {i + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* University Semester Custom Dropdown */}
                {gradeCategory === "university" && (
                  <div className="relative">
                    <div
                      onClick={() => setIsUniSemesterOpen(!isUniSemesterOpen)}
                      className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                        }`}
                    >
                      <span className={!formData.grade ? "opacity-50" : ""}>{formData.grade || "Select Semester"}</span>
                      <ChevronDown size={14} className="opacity-60" />
                    </div>

                    {isUniSemesterOpen && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                        }`}>
                        {[...Array(4)].map((_, yearIndex) => (
                          <div key={`Year ${yearIndex + 1}`}>
                            <div className="px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase">Year {yearIndex + 1}</div>
                            <div
                              onClick={() => { setFormData({ ...formData, grade: `Year ${yearIndex + 1} Semester 1` }); setIsUniSemesterOpen(false); }}
                              className={`px-4 py-1.5 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                            >
                              Semester 1
                            </div>
                            <div
                              onClick={() => { setFormData({ ...formData, grade: `Year ${yearIndex + 1} Semester 2` }); setIsUniSemesterOpen(false); }}
                              className={`px-4 py-1.5 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                            >
                              Semester 2
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {gradeCategory === "other" && (
                  <div>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      placeholder="Type Grade/Batch name"
                      className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* YouTube Video URL Input Field */}
          <div>
            <label className={labelClass}>YouTube Video URL (Public or Unlisted)</label>
            <div className="relative">
              <LinkIcon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                required
                placeholder="https://www.youtube.com/watch?v=... හෝ https://youtu.be/..."
                className={inputClass}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Upload the video to YouTube and paste the link here (it is best to set the video to <b>Unlisted</b> on YouTube).
            </p>

            {/* Live Video Preview if URL is valid */}
            {previewId && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video relative max-w-sm mx-auto shadow-sm">
                <img
                  src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlaySquare size={36} className="text-red-500 drop-shadow" />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Short Description (Optional)</label>
            <div className="relative">
              <AlignLeft size={16} className={`absolute left-3 top-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide a brief overview of this video lesson..."
                className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 pl-9 sm:pl-10 transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Video...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Save Video Lesson
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <UploadSuccessPopup
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          onClose();
        }}
        isUploading={isPopupUploading}
        progress={100}
        message="Your Video lesson has been successfully added to the system and is now pending admin approval."
      />
    </div>
  );
}