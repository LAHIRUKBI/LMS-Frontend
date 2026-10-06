// src/app/components/VideoUploadModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import UploadSuccessPopup from "@/app/components/VideoUploadSuccessPopup";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VideoUploadModal({ isOpen, onClose, onSuccess }: VideoUploadModalProps) {
  const { darkMode } = useTheme();
  
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isPopupUploading, setIsPopupUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [subjectCategory, setSubjectCategory] = useState("");
  const [gradeCategory, setGradeCategory] = useState("");
  
  // Custom Dropdown States
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSchoolGradeOpen, setIsSchoolGradeOpen] = useState(false);
  const [isUniSemesterOpen, setIsUniSemesterOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("video/")) {
        setErrorMessage("Please select a valid Video file (MP4, WebM, etc.).");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Please attach a Video file to upload.");
      return;
    }

    setUploading(true);
    setShowPopup(true);
    setIsPopupUploading(true);
    setUploadProgress(0); 

    const token = localStorage.getItem("token");

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("subject", formData.subject);
    uploadData.append("grade", formData.grade); 
    uploadData.append("description", formData.description);
    uploadData.append("type", "video");
    uploadData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:5000/api/materials/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      setTimeout(() => {
        setIsPopupUploading(false);
        setFormData({ title: "", subject: "", grade: "", description: "" });
        setSubjectCategory(""); 
        setGradeCategory("");   
        removeFile();
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

  const inputClass = `w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm outline-none focus:ring-2 pl-9 sm:pl-10 transition-colors ${
    darkMode 
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
                Upload Video Lesson
              </h2>
              <p className={`mt-0.5 text-[11px] sm:text-sm font-medium truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Add recorded lessons or tutorials for your students.
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
                  className={`w-full rounded-xl border py-2.5 px-3.5 pl-9 sm:pl-10 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                    darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                  }`}
                >
                  <span className={!subjectCategory ? "opacity-50" : ""}>{subjectCategory || "Select Subject"}</span>
                  <ChevronDown size={14} className="opacity-60" />
                </div>

                {isSubjectOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                  }`}>
                    {subjectsList.map((subj) => (
                      <div 
                        key={subj}
                        onClick={() => {
                          setSubjectCategory(subj);
                          setFormData({ ...formData, subject: subj });
                          setIsSubjectOpen(false);
                        }}
                        className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                          darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
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
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer font-bold text-indigo-500 ${
                        darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
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
                {/* Category Selector (Custom Dropdown) */}
                <div className="relative">
                  <GraduationCap size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <div 
                    onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsSubjectOpen(false); setIsSchoolGradeOpen(false); setIsUniSemesterOpen(false); }}
                    className={`w-full rounded-xl border py-2.5 px-3.5 pl-9 sm:pl-10 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                      darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                    }`}
                  >
                    <span className={!gradeCategory ? "opacity-50" : ""}>
                      {gradeCategory === "school" ? "School (Grade 1 - 13)" : gradeCategory === "university" ? "University (Semesters)" : gradeCategory === "other" ? "Other" : "Select Category"}
                    </span>
                    <ChevronDown size={14} className="opacity-60" />
                  </div>

                  {isCategoryOpen && (
                    <div className={`absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border shadow-xl p-1 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
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
                      className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                      }`}
                    >
                      <span className={!formData.grade ? "opacity-50" : ""}>{formData.grade || "Select Grade"}</span>
                      <ChevronDown size={14} className="opacity-60" />
                    </div>

                    {isSchoolGradeOpen && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${
                        darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                      }`}>
                        {[...Array(13)].map((_, i) => (
                          <div 
                            key={`Grade ${i+1}`}
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
                      className={`w-full rounded-xl border py-2.5 px-3.5 text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-colors ${
                        darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-300 bg-white text-gray-900"
                      }`}
                    >
                      <span className={!formData.grade ? "opacity-50" : ""}>{formData.grade || "Select Semester"}</span>
                      <ChevronDown size={14} className="opacity-60" />
                    </div>

                    {isUniSemesterOpen && (
                      <div className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl p-1 ${
                        darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-gray-900"
                      }`}>
                        {[...Array(4)].map((_, yearIndex) => (
                          <div key={`Year ${yearIndex+1}`}>
                            <div className="px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase">Year {yearIndex+1}</div>
                            <div 
                              onClick={() => { setFormData({ ...formData, grade: `Year ${yearIndex+1} - Semester 1` }); setIsUniSemesterOpen(false); }}
                              className={`px-4 py-1.5 text-xs rounded-lg cursor-pointer ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                            >
                              Semester 1
                            </div>
                            <div 
                              onClick={() => { setFormData({ ...formData, grade: `Year ${yearIndex+1} - Semester 2` }); setIsUniSemesterOpen(false); }}
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

          {/* Video File Upload Area */}
          <div>
            <label className={labelClass}>Upload Video File</label>
            <div 
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`mt-1 border-2 border-dashed rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center transition-all ${
                selectedFile 
                  ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                  : darkMode ? "border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-800/30" : "border-slate-300 hover:border-indigo-400 cursor-pointer bg-slate-50/50"
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center text-center">
                  <Video className="w-9 h-9 sm:w-10 sm:h-10 text-indigo-500 mb-2" />
                  <p className={`text-xs sm:text-sm font-bold truncate max-w-[220px] sm:max-w-xs ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                  <p className={`text-[10px] sm:text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="mt-2.5 flex items-center gap-1 text-[11px] sm:text-xs text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors font-bold"
                  >
                    <X size={14} /> Remove File
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className={`w-9 h-9 sm:w-10 sm:h-10 mb-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                  <p className={`text-xs sm:text-sm font-bold text-center ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Click to browse or drag and drop
                  </p>
                  <p className={`text-[10px] sm:text-xs mt-1 text-center ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    Supported formats: MP4, WebM (Max 500MB)
                  </p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="video/*" 
                className="hidden" 
              />
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
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Upload Video
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
        progress={uploadProgress}
        message="Your Video lesson has been successfully added to the system and is now pending admin approval."
      />
    </div>
  );
}