// src/app/teacher/materials/pdf/page.tsx
"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { UploadCloud, FileText, BookOpen, GraduationCap, AlignLeft, X } from "lucide-react";
import UploadSuccessPopup from "@/app/components/PdfUploadSuccessPopup";

export default function PDFUploadPage() {
  const { darkMode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "", // New Field
    description: "", // New Field
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

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    uploadData.append("type", "pdf");
    uploadData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:5000/api/materials/upload", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success animated popup
      setShowPopup(true);
      
      // Reset form
      setFormData({ title: "", subject: "", grade: "", description: "" });
      removeFile();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = `w-full rounded-lg border py-2.5 px-4 outline-none focus:ring-2 pl-10 ${
    darkMode 
      ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" 
      : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"
  }`;
  
  const labelClass = `block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
            Upload Study Material (PDF)
          </h2>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Add new PDF documents, notes, or tutorials for your students to access.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <div className={`rounded-2xl border shadow-sm ${darkMode ? "border-slate-800 bg-[#0F172A]" : "border-slate-200 bg-white"}`}>
          <form onSubmit={handleUpload} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Title */}
              <div>
                <label className={labelClass}>Document Title</label>
                <div className="relative">
                  <FileText size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Chapter 1 - Cloud Computing" className={inputClass} />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className={labelClass}>Subject</label>
                <div className="relative">
                  <BookOpen size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="e.g. IT4090" className={inputClass} />
                </div>
              </div>

              {/* Grade / Class */}
              <div>
                <label className={labelClass}>Grade / Batch</label>
                <div className="relative">
                  <GraduationCap size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input type="text" name="grade" value={formData.grade} onChange={handleChange} required placeholder="e.g. Year 4 / Grade 11" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Short Description (Optional)</label>
              <div className="relative">
                <AlignLeft size={18} className={`absolute left-3 top-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3}
                  placeholder="Provide a brief overview of this document..." 
                  className={`w-full rounded-lg border py-2.5 px-4 outline-none focus:ring-2 pl-10 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                ></textarea>
              </div>
            </div>

            {/* PDF File Upload Area */}
            <div>
              <label className={labelClass}>Upload PDF File</label>
              <div 
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`mt-1 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                  selectedFile 
                    ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                    : darkMode ? "border-slate-600 hover:border-indigo-500 cursor-pointer" : "border-slate-300 hover:border-indigo-400 cursor-pointer"
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-12 h-12 text-indigo-500 mb-3" />
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                    <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="mt-4 flex items-center gap-1 text-sm text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X size={16} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={`w-12 h-12 mb-3 ${darkMode ? "text-slate-400" : "text-gray-400"}`} />
                    <p className={`font-medium ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                      Click to browse or drag and drop
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
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

            <div className="pt-6 border-t dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-indigo-400 flex items-center gap-2 shadow-md"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} />
                    Upload PDF
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup component */}
      <UploadSuccessPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        message="Your PDF document has been successfully added to the system and is now pending admin approval."
      />
    </div>
  );
}