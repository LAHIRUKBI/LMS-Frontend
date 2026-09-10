"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Video, FileText, BookOpen, Loader2 } from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; subject?: string } | null>(null);
  
  // ගණනය කිරීම් සඳහා State එකක්
  const [counts, setCounts] = useState({ videos: 0, pdfs: 0, papers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
      fetchMyStats(token); // දත්ත ලබා ගැනීමේ function එක call කිරීම
    }
  }, [router]);

  // දත්ත සමුදායෙන් ගුරුවරයාගේ පාඩම් විස්තර ලබා ගැනීම
  const fetchMyStats = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const materials = res.data;
      
      let videoCount = 0;
      let pdfCount = 0;
      let paperCount = 0;

      // එක් එක් වර්ගයට අදාළ ගණන ගණනය කිරීම
      materials.forEach((material: any) => {
        if (material.type === "video") videoCount++;
        if (material.type === "pdf") pdfCount++;
        if (material.type === "paper") paperCount++;
      });

      setCounts({ videos: videoCount, pdfs: pdfCount, papers: paperCount });
    } catch (error) {
      console.error("Dashboard දත්ත ලබා ගැනීමේදී දෝෂයක්:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}!</h1>
      <p className="text-gray-500 mb-8">මෙය ඔබගේ ඉගැන්වීම් පද්ධතියේ සාරාංශයයි.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Videos Count Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Uploaded Videos</h3>
            {loading ? (
              <Loader2 className="animate-spin text-gray-400 mt-2" size={24} />
            ) : (
              <p className="text-3xl font-bold text-gray-800 mt-2">{counts.videos}</p>
            )}
          </div>
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
            <Video size={28} />
          </div>
        </div>

        {/* PDFs Count Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Uploaded PDFs</h3>
            {loading ? (
              <Loader2 className="animate-spin text-gray-400 mt-2" size={24} />
            ) : (
              <p className="text-3xl font-bold text-gray-800 mt-2">{counts.pdfs}</p>
            )}
          </div>
          <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
            <FileText size={28} />
          </div>
        </div>

        {/* Papers Count Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase">Uploaded Papers</h3>
            {loading ? (
              <Loader2 className="animate-spin text-gray-400 mt-2" size={24} />
            ) : (
              <p className="text-3xl font-bold text-gray-800 mt-2">{counts.papers}</p>
            )}
          </div>
          <div className="bg-teal-100 text-teal-600 p-3 rounded-full">
            <BookOpen size={28} />
          </div>
        </div>
      </div>
    </div>
  );
}