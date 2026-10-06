// src/app/components/TeacherUploadModal.tsx

"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { 
  Video, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  UploadCloud, 
  X, 
  AlertCircle, 
  AlignLeft, 
  Loader2 
} from "lucide-react";

interface TeacherUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  showToast: (msg: string) => void;
  onUploadSuccess: () => void;
}

export default function TeacherUploadModal({
  isOpen,
  onClose,
  darkMode,
  showToast,
  onUploadSuccess,
}: TeacherUploadModalProps) {
  if (!isOpen) return null;

  const [newMaterialType, setNewMaterialType] = useState<"video" | "pdf" | "paper">("video");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [subjectCategory, setSubjectCategory] = useState("");
  const [gradeCategory, setGradeCategory] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    description: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type: "video" | "pdf" | "paper") => {
    setNewMaterialType(type);
    setSelectedFile(null); 
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (newMaterialType === "video" && !file.type.startsWith("video/")) {
        setErrorMessage("Please select a valid Video file (MP4, WebM).");
        return;
      }
      if ((newMaterialType === "pdf" || newMaterialType === "paper") && file.type !== "application/pdf") {
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

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage(`Please attach a ${newMaterialType === "video" ? "Video" : "PDF"} file.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const token = localStorage.getItem("token");

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("subject", formData.subject);
    uploadData.append("grade", formData.grade);
    uploadData.append("description", formData.description);
    uploadData.append("type", newMaterialType);
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

      showToast(`"${formData.title}" uploaded successfully!`);
      onClose();
      
      setFormData({ title: "", subject: "", grade: "", description: "" });
      setSubjectCategory(""); 
      setGradeCategory(""); 
      removeFile();
      
      onUploadSuccess(); 

    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "An error occurred during the upload process.");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = `w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;
  
  const inputClassNoIcon = `w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
    darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl transition-all max-h-[90vh] flex flex-col ${
        darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        
        <div className={`p-4 flex items-center justify-between border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <UploadCloud size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Quick Upload</h3>
            </div>
          </div>
          <button onClick={onClose} className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}>
            <X size={14} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] font-medium text-red-700 dark:text-red-300">{errorMessage}</span>
            </div>
          )}

          <form id="quickUploadForm" onSubmit={handleQuickUpload} className="space-y-4">
            
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Material Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "video", label: "Video", icon: <Video size={14} /> },
                    { id: "pdf", label: "PDF Notes", icon: <FileText size={14} /> },
                    { id: "paper", label: "Paper", icon: <BookOpen size={14} /> },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleTypeChange(cat.id as any)}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2 border text-[11px] font-semibold transition-all ${
                      newMaterialType === cat.id
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : darkMode
                        ? "border-slate-800 bg-slate-800/50 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Title</label>
                <div className="relative">
                  <FileText size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <input type="text" name="title" required placeholder="e.g. Modern Physics Summary" value={formData.title} onChange={handleFormChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject</label>
                <div className="relative">
                  <BookOpen size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <select 
                    value={subjectCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubjectCategory(val);
                      if (val !== "other") setFormData({ ...formData, subject: val });
                      else setFormData({ ...formData, subject: "" });
                    }}
                    required
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="" disabled>Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {subjectCategory === "other" && (
                  <div className="mt-2 relative">
                    <input type="text" name="subject" value={formData.subject} onChange={handleFormChange} required placeholder="Type subject" className={inputClassNoIcon} />
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Grade / Batch</label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <GraduationCap size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <select 
                      value={gradeCategory}
                      onChange={(e) => {
                        setGradeCategory(e.target.value);
                        setFormData({ ...formData, grade: "" });
                      }}
                      required
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="school">School</option>
                      <option value="university">University</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {gradeCategory === "school" && (
                    <div>
                      <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                        <option value="" disabled>Select Grade</option>
                        {[...Array(13)].map((_, i) => <option key={`Grade ${i+1}`} value={`Grade ${i+1}`}>Grade {i + 1}</option>)}
                      </select>
                    </div>
                  )}

                  {gradeCategory === "university" && (
                    <div>
                      <select name="grade" value={formData.grade} onChange={handleFormChange} required className={inputClassNoIcon}>
                        <option value="" disabled>Select Semester</option>
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                      </select>
                    </div>
                  )}

                  {gradeCategory === "other" && (
                    <div>
                      <input type="text" name="grade" value={formData.grade} onChange={handleFormChange} required placeholder="Type Grade/Batch" className={inputClassNoIcon} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Description (Optional)</label>
              <div className="relative">
                <AlignLeft size={14} className={`absolute left-2.5 top-2.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                <textarea name="description" rows={2} placeholder="Brief description..." value={formData.description} onChange={handleFormChange} className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}></textarea>
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Upload File</label>
              <div 
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`mt-0.5 border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  selectedFile 
                    ? darkMode ? "border-indigo-500 bg-indigo-500/10" : "border-indigo-400 bg-indigo-50"
                    : darkMode ? "border-slate-700 hover:border-slate-600 cursor-pointer bg-slate-950/40" : "border-slate-200 hover:border-indigo-300 cursor-pointer bg-slate-50/60"
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      {newMaterialType === "video" ? <Video className="text-indigo-500 w-6 h-6" /> : <FileText className="text-indigo-500 w-6 h-6" />}
                      <div>
                        <p className={`text-[11px] font-bold truncate max-w-[150px] sm:max-w-[200px] ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedFile.name}</p>
                        <p className={`text-[9px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={20} className="mx-auto mb-1 text-indigo-500" />
                    <p className={`text-[10px] font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Click to browse file</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={newMaterialType === "video" ? "video/*" : "application/pdf"} className="hidden" />
              </div>
            </div>

            {uploading && (
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Uploading...</span>
                  <span className="text-indigo-500">{uploadProgress}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div className="bg-indigo-500 h-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className={`p-4 border-t flex items-center justify-end gap-2 ${darkMode ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"}`}>
          <button type="button" onClick={onClose} disabled={uploading} className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors ${darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}>
            Cancel
          </button>
          <button type="submit" form="quickUploadForm" disabled={uploading || !selectedFile} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        
      </div>
    </div>
  );
}