"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Megaphone, Trash2, Edit, X, Link as LinkIcon, Plus, Loader2 } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface AdLink {
  _id?: string;
  label: string;
  url: string;
}

interface AdData {
  _id: string;
  headline: string;
  description: string;
  images: string[];
  links: AdLink[];
  status: "active" | "inactive";
  createdAt: string;
}

export default function ViewAdsPage() {
  const { darkMode } = useTheme();
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingAd, setEditingAd] = useState<AdData | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/ads/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(res.data);
    } catch (err) {
      console.error("Failed to fetch ads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Advertisement? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/ads/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(ads.filter(ad => ad._id !== id));
      alert("Advertisement deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete ad", err);
      alert(err.response?.data?.error || "Failed to delete the ad.");
    }
  };

  const handleEditChange = (field: keyof AdData, value: any) => {
    if (editingAd) {
      setEditingAd({ ...editingAd, [field]: value });
    }
  };

  const handleLinkChange = (index: number, field: keyof AdLink, value: string) => {
    if (editingAd) {
      const newLinks = [...editingAd.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      setEditingAd({ ...editingAd, links: newLinks });
    }
  };

  const handleAddLink = () => {
    if (editingAd) {
      setEditingAd({ ...editingAd, links: [...editingAd.links, { label: "", url: "" }] });
    }
  };

  const handleRemoveLink = (index: number) => {
    if (editingAd) {
      const newLinks = editingAd.links.filter((_, i) => i !== index);
      setEditingAd({ ...editingAd, links: newLinks });
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    
    const validLinks = editingAd.links.filter(l => l.label.trim() !== "" && l.url.trim() !== "");

    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/ads/admin/${editingAd._id}`, {
        headline: editingAd.headline,
        description: editingAd.description,
        status: editingAd.status,
        links: validLinks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAds(ads.map(ad => ad._id === editingAd._id ? res.data.ad : ad));
        setEditingAd(null);
        alert("Advertisement updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update ad", err);
      alert("Failed to update the ad.");
    } finally {
      setEditLoading(false);
    }
  };

  // 👇 DB එකේ /advertisement/... කියා සේව් වන නිසා, සෘජුවම එය යොදාගනී
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${cleanPath}?v=${Date.now()}`;
  };

  const inputClass = `w-full rounded-xl border py-2 px-3 text-sm outline-none focus:ring-2 transition-colors ${
    darkMode 
      ? "bg-slate-900 border-slate-700 text-white focus:ring-blue-500 placeholder-slate-500" 
      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500 placeholder-slate-400"
  }`;

  return (
    <div className={`p-4 sm:p-8 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 border-b pb-4 dark:border-slate-800">
          <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Manage Advertisements
            </h1>
            <p className={`text-sm mt-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              View, edit, or remove currently published advertisements.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className={darkMode ? "text-slate-400" : "text-slate-500"}>Loading Advertisements...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${darkMode ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}>
            No advertisements found. Create one from the "Create Ad" page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ads.map((ad) => {
              const validImages = ad.images && Array.isArray(ad.images) 
                ? ad.images.filter(img => img && img.trim() !== "") 
                : [];

              return (
                <div key={ad._id} className={`group flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  
                  <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                    {validImages.length > 0 ? (
                      <>
                        <img 
                          src={getImageUrl(validImages[0])} 
                          alt={ad.headline} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          onError={(e) => { 
                            console.error("Image failed to load:", getImageUrl(validImages[0]));
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/png?text=Image+Not+Found";
                          }}
                        />
                        {validImages.length > 1 && (
                          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                            1 / {validImages.length} Photos
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <Megaphone size={32} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg shadow-sm backdrop-blur-md border ${
                        ad.status === 'active' 
                          ? 'bg-green-500/90 text-white border-green-400/50' 
                          : 'bg-slate-600/90 text-white border-slate-500/50'
                      }`}>
                        {ad.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow z-10 bg-white dark:bg-slate-900">
                    <h3 className={`font-bold text-lg leading-tight mb-2 line-clamp-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {ad.headline}
                    </h3>
                    <p className={`text-xs mb-4 line-clamp-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {ad.description}
                    </p>
                    
                    {ad.links && ad.links.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {ad.links.map((link, idx) => (
                          <span key={idx} className={`text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 border ${darkMode ? "bg-slate-800 text-blue-400 border-slate-700" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                            <LinkIcon size={10} /> {link.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingAd(ad)}
                          className={`p-2 rounded-lg transition-colors border ${darkMode ? "bg-slate-800 text-blue-400 hover:bg-slate-700 border-slate-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"}`}
                          title="Edit Ad"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ad._id)}
                          className={`p-2 rounded-lg transition-colors border ${darkMode ? "bg-slate-800 text-red-400 hover:bg-red-900/40 border-slate-700" : "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"}`}
                          title="Delete Ad"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className={`flex items-center justify-between p-5 sm:p-6 border-b sticky top-0 z-10 ${darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-100 backdrop-blur-md"}`}>
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Edit Advertisement</h2>
              <button 
                onClick={() => setEditingAd(null)}
                className={`p-2 rounded-full transition-colors ${darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Primary Headline</label>
                <input 
                  type="text" 
                  value={editingAd.headline}
                  onChange={(e) => handleEditChange("headline", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Ad Description</label>
                <textarea 
                  value={editingAd.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  className={`${inputClass} min-h-[120px]`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Status</label>
                <select 
                  value={editingAd.status}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                  className={inputClass}
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Action Links</label>
                  <button type="button" onClick={handleAddLink} className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Add Link
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingAd.links.map((link, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row gap-2 p-2.5 rounded-xl border ${darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <input 
                        type="text" 
                        placeholder="Label" 
                        value={link.label}
                        onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                        className={inputClass}
                      />
                      <input 
                        type="url" 
                        placeholder="URL" 
                        value={link.url}
                        onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                        className={inputClass}
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="p-2.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:opacity-80 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingAd(null)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-md"
                >
                  {editLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}