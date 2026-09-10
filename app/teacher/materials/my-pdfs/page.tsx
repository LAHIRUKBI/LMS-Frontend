"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FileStack, BookOpen, Loader2, Download, Eye, Trash2 } from "lucide-react"; // Trash2 අලුතින් එක් කරන ලදී
import { useTheme } from "@/app/context/ThemeContext";

export default function MyPDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredPdfs = res.data.filter((m: any) => m.type === "pdf" || m.type === "paper");
      setPdfs(filteredPdfs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // PDF එකක් ඉවත් කිරීමේ Function එක
  const handleDelete = async (id: string, title: string) => {
    const isConfirmed = window.confirm(`ඔබට විශ්වාසද "${title}" නිබන්ධනය ඉවත් කළ යුතුයි කියා?`);
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPdfs(pdfs.filter((pdf) => pdf._id !== id));
      alert("නිබන්ධනය සාර්ථකව ඉවත් කරන ලදී.");
    } catch (err) {
      alert("ඉවත් කිරීමේදී දෝෂයක් මතු විය.");
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className={`p-3 rounded-lg ${darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
          <FileStack size={24} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>මගේ නිබන්ධන සහ ප්‍රශ්න පත්‍ර</h2>
          <p className={darkMode ? "text-slate-400" : "text-gray-500"}>ඔබ Upload කළ PDF ගොනු මෙතැනින් කියවිය හැක.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      ) : pdfs.length === 0 ? (
        <div className={`p-8 text-center rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          තවමත් කිසිදු නිබන්ධනයක් එක් කර නොමැත.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className={`p-5 rounded-xl border shadow-sm transition-transform hover:-translate-y-1 flex flex-col justify-between ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={`w-fit px-2.5 py-1 text-xs font-semibold rounded-full ${pdf.type === 'paper' ? (darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700') : (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700')}`}>
                      {pdf.type.toUpperCase()}
                    </span>
                    <span className={darkMode ? "text-slate-400 text-xs" : "text-gray-400 text-xs"}>
                      {new Date(pdf.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(pdf._id, pdf.title)}
                    className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-slate-700 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
                    title="Delete PDF"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${darkMode ? "text-white" : "text-gray-800"}`}>{pdf.title}</h3>
                
                <div className={`flex items-center gap-2 mb-6 text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                  <BookOpen size={16} />
                  <span>{pdf.subject}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href={`http://localhost:5000${pdf.fileUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md font-medium text-sm transition-colors ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                >
                  <Eye size={16} /> View
                </a>
                <a 
                  href={`http://localhost:5000${pdf.fileUrl}`} 
                  download
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md font-medium text-sm transition-colors ${darkMode ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}