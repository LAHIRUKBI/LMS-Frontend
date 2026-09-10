"use client";

import { useState } from "react";
import axios from "axios";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadPaperPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("කරුණාකර PDF ප්‍රශ්න පත්‍රයක් තෝරන්න.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("type", "paper"); // වර්ගය 'paper' ලෙස යවයි
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/materials/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(res.data.message || "ප්‍රශ්න පත්‍රය සාර්ථකව Upload කරන ලදී!");
      setTitle("");
      setSubject("");
      setFile(null);
      (document.getElementById('paperFile') as HTMLInputElement).value = ""; 

    } catch (err: any) {
      setError(err.response?.data?.message || "Upload කිරීමේදී දෝෂයක් මතු විය.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ප්‍රශ්න පත්‍රයක් එක් කරන්න</h2>
      
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">ප්‍රශ්න පත්‍රයේ නම</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-indigo-400" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">විෂය</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-indigo-400" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ප්‍රශ්න පත්‍ර ගොනුව (PDF)</label>
          <input id="paperFile" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full px-4 py-2 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-indigo-400" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400">
          {loading ? "Uploading..." : "Upload Paper"}
        </button>
      </form>
    </div>
  );
}