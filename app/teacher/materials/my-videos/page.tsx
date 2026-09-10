"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Film, BookOpen, Loader2, Trash2 } from "lucide-react"; // Trash2 අලුතින් එක් කරන ලදී
import { useTheme } from "@/app/context/ThemeContext";

export default function MyVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredVideos = res.data.filter((m: any) => m.type === "video");
      setVideos(filteredVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Video එකක් ඉවත් කිරීමේ Function එක
  const handleDelete = async (id: string, title: string) => {
    const isConfirmed = window.confirm(`ඔබට විශ්වාසද "${title}" වීඩියෝව ඉවත් කළ යුතුයි කියා?`);
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // සාර්ථකව මැකූ පසු UI එකෙන් අදාළ වීඩියෝව ඉවත් කිරීම
      setVideos(videos.filter((video) => video._id !== id));
      alert("වීඩියෝව සාර්ථකව ඉවත් කරන ලදී.");
    } catch (err) {
      alert("වීඩියෝව ඉවත් කිරීමේදී දෝෂයක් මතු විය.");
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className={`p-3 rounded-lg ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
          <Film size={24} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>මගේ වීඩියෝ පාඩම්</h2>
          <p className={darkMode ? "text-slate-400" : "text-gray-500"}>ඔබ Upload කළ වීඩියෝ මෙතැනින් නැරඹිය හැක.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : videos.length === 0 ? (
        <div className={`p-8 text-center rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-gray-200 text-gray-500"}`}>
          තවමත් කිසිදු වීඩියෝවක් එක් කර නොමැත.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className={`overflow-hidden rounded-xl border shadow-sm transition-transform hover:-translate-y-1 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
              <div className="w-full bg-black aspect-video">
                <video 
                  controls 
                  className="w-full h-full object-contain"
                  src={`http://localhost:5000${video.fileUrl}`} 
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-4 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{video.title}</h3>
                  <div className={`flex items-center gap-2 mt-2 text-sm ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                    <BookOpen size={16} />
                    <span>{video.subject}</span>
                  </div>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(video._id, video.title)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-slate-700 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"}`}
                  title="Delete Video"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}