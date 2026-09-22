// src/app/teacher/materials/pdf/page.tsx
"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { UploadCloud, FileText, BookOpen, GraduationCap, AlignLeft, X, Image as ImageIcon } from "lucide-react";
import UploadSuccessPopup from "@/app/components/PdfUploadSuccessPopup";

export default function MaterialUploadPage() {
  const { darkMode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Material Type එක තෝරා ගැනීමට (Default එක 'pdf' වේ)
  const [materialType, setMaterialType] = useState<"pdf" | "paper">("pdf");

  const [subjectCategory, setSubjectCategory] = useState("");
  const [gradeCategory, setGradeCategory] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Cover Image States (Max 5MB)
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setErrorMessage("Please select a valid PDF file.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file for the cover.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Cover image must be smaller than 5MB.");
        return;
      }
      setSelectedCover(file);
      setErrorMessage("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCover = () => {
    setSelectedCover(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Please attach a PDF file to upload.");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("subject", formData.subject);
    uploadData.append("grade", formData.grade);
    uploadData.append("description", formData.description);
    uploadData.append("type", materialType); // තෝරාගත් type එක ('pdf' හෝ 'paper') යවනු ලැබේ
    uploadData.append("file", selectedFile);
    
    if (selectedCover) {
      uploadData.append("coverImage", selectedCover);
    }

    try {
      await axios.post("http://localhost:5000/api/materials/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowPopup(true);
      
      setFormData({ title: "", subject: "", grade: "", description: "" });
      setSubjectCategory(""); 
      setGradeCategory(""); 
      removeFile();
      removeCover();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = `w-full rounded-lg border py-1.5 sm:py-2 px-3 text-xs sm:text-sm outline-none focus:ring-2 pl-8 sm:pl-9 transition-colors ${
    darkMode 
      ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" 
      : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"
  }`;

  const inputClassNoIcon = `w-full rounded-lg border py-1.5 sm:py-2 px-3 text-xs sm:text-sm outline-none focus:ring-2 transition-colors ${
    darkMode 
      ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" 
      : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"
  }`;
  
  const labelClass = `block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  return (
    <div className={`p-4 sm:p-6 min-h-screen transition-colors duration-300 flex flex-col justify-center ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg sm:rounded-xl shadow-sm ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
              Upload Study Material or Exam Paper
            </h2>
            <p className={`mt-0.5 text-xs sm:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Add new PDF documents, notes, tutorials, or exam papers for your students.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-[11px] sm:text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <div className={`rounded-2xl border shadow-sm transition-colors ${darkMode ? "border-slate-800 bg-[#0F172A]" : "border-slate-200 bg-white"}`}>
          <form onSubmit={handleUpload} className="p-4 sm:p-5 space-y-4">
            
            {/* Material Type Selection (Radio Buttons) */}
            <div>
              <label className={labelClass}>Select Document Type</label>
              <div className="flex items-center gap-6 mt-1">
                <label className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                  <input 
                    type="radio" 
                    name="materialType" 
                    value="pdf" 
                    checked={materialType === "pdf"} 
                    onChange={() => setMaterialType("pdf")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  Study Note / Tutorial (PDF)
                </label>
                <label className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                  <input 
                    type="radio" 
                    name="materialType" 
                    value="paper" 
                    checked={materialType === "paper"} 
                    onChange={() => setMaterialType("paper")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  Exam Paper (PDF)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Document / Paper Title */}
              <div>
                <label className={labelClass}>{materialType === 'paper' ? 'Paper Title' : 'Document Title'}</label>
                <div className="relative">
                  <FileText size={14} className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder={materialType === 'paper' ? "e.g. 2024 - 1st Term Paper" : "e.g. Chapter 1 - Cloud Computing"} className={inputClass} />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className={labelClass}>Subject</label>
                <div className="relative">
                  <BookOpen size={14} className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <select 
                    value={subjectCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubjectCategory(val);
                      if (val !== "other") {
                        setFormData({ ...formData, subject: val });
                      } else {
                        setFormData({ ...formData, subject: "" });
                      }
                    }}
                    required
                    className={inputClass}
                  >
                    <option value="" disabled>Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="IT">IT</option>
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Commerce">Commerce</option>
                    <option value="other">Other (Type Subject)</option>
                  </select>
                </div>
                {subjectCategory === "other" && (
                  <div className="mt-2 relative">
                    <BookOpen size={14} className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <GraduationCap size={14} className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <select 
                      value={gradeCategory}
                      onChange={(e) => {
                        setGradeCategory(e.target.value);
                        setFormData({ ...formData, grade: "" });
                      }}
                      required
                      className={inputClass}
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="school">School (Grade 1 - 13)</option>
                      <option value="university">University (Semesters)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {gradeCategory === "school" && (
                    <div>
                      <select name="grade" value={formData.grade} onChange={handleChange} required className={inputClassNoIcon}>
                        <option value="" disabled>Select Grade</option>
                        {[...Array(13)].map((_, i) => (
                          <option key={`Grade ${i+1}`} value={`Grade ${i+1}`}>Grade {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {gradeCategory === "university" && (
                    <div>
                      <select name="grade" value={formData.grade} onChange={handleChange} required className={inputClassNoIcon}>
                        <option value="" disabled>Select Semester</option>
                        {[...Array(4)].map((_, yearIndex) => (
                          <optgroup key={`Year ${yearIndex+1}`} label={`Year ${yearIndex+1}`}>
                            <option value={`Year ${yearIndex+1} - Semester 1`}>Semester 1</option>
                            <option value={`Year ${yearIndex+1} - Semester 2`}>Semester 2</option>
                          </optgroup>
                        ))}
                      </select>
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
                        className={inputClassNoIcon} 
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
                <AlignLeft size={14} className={`absolute left-2.5 sm:left-3 top-2.5 sm:top-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={2}
                  placeholder="Provide a brief overview of this document..." 
                  className={`w-full rounded-lg border py-1.5 sm:py-2 px-3 text-xs sm:text-sm outline-none focus:ring-2 pl-8 sm:pl-9 transition-colors ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                ></textarea>
              </div>
            </div>

            {/* Cover Image Upload Area (Max 5MB) */}
            <div>
              <label className={labelClass}>Cover Image (Optional - Max 5MB)</label>
              <div 
                onClick={() => !selectedCover && coverInputRef.current?.click()}
                className={`mt-1 border-2 border-dashed rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all ${
                  selectedCover 
                    ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                    : darkMode ? "border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-800/30" : "border-slate-300 hover:border-indigo-400 cursor-pointer bg-slate-50/50"
                }`}
              >
                {selectedCover ? (
                  <div className="flex flex-col items-center text-center">
                    <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500 mb-1" />
                    <p className={`text-xs sm:text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedCover.name}</p>
                    <p className={`text-[10px] sm:text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {(selectedCover.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeCover(); }}
                      className="mt-2 flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md font-bold transition-colors"
                    >
                      <X size={12} /> Remove Cover
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className={`w-7 h-7 sm:w-8 sm:h-8 mb-1.5 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                    <p className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                      Click to upload cover image (JPG, PNG)
                    </p>
                    <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                      Must be smaller than 5MB
                    </p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  onChange={handleCoverChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* PDF File Upload Area */}
            <div>
              <label className={labelClass}>Upload PDF File</label>
              <div 
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`mt-1 border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center transition-all ${
                  selectedFile 
                    ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                    : darkMode ? "border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-800/30" : "border-slate-300 hover:border-indigo-400 cursor-pointer bg-slate-50/50"
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 mb-2" />
                    <p className={`text-xs sm:text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                    <p className={`text-[10px] sm:text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="mt-2.5 flex items-center gap-1 text-[11px] sm:text-xs text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 rounded-md transition-colors font-bold"
                    >
                      <X size={14} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                    <p className={`text-xs sm:text-sm font-bold ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                      Click to browse or drag and drop
                    </p>
                    <p className={`text-[10px] sm:text-xs mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                      Only PDF documents are supported (Max 20MB)
                    </p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all disabled:bg-indigo-400 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UploadSuccessPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        message="Your document has been successfully added to the system and is now pending admin approval."
      />
    </div>
  );
}