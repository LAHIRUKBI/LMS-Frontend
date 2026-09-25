"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Megaphone, Trash2, Edit, X, Link as LinkIcon, Plus, 
  Loader2, Users, Clock, ChevronLeft, ChevronRight, Film, Image as ImageIcon, ImagePlus 
} from "lucide-react";
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
  mediaType: "image" | "video" | "both";
  images: string[];
  video?: string | null;
  links: AdLink[];
  status: "active" | "inactive";
  targetAudience?: string;
  publishStartDate?: string;
  publishEndDate?: string | null;
  createdAt: string;
}

export default function ViewAdsPage() {
  const { darkMode } = useTheme();
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingAd, setEditingAd] = useState<AdData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [scheduleMode, setScheduleMode] = useState("now");

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [newVideoPreview, setNewVideoPreview] = useState<string | null>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

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

  const formatForDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const openEditModal = (ad: AdData) => {
    const mode = ad.publishEndDate ? "timeframe" : (ad.publishStartDate ? "schedule" : "now");
    setScheduleMode(mode);
    setNewImages([]);
    setNewImagePreviews([]);
    setNewVideo(null);
    setNewVideoPreview(null);
    
    setEditingAd({
      ...ad,
      mediaType: ad.mediaType || "image",
      targetAudience: ad.targetAudience || "all",
      publishStartDate: formatForDateTimeLocal(ad.publishStartDate),
      publishEndDate: formatForDateTimeLocal(ad.publishEndDate)
    });
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

  const handleRemoveExistingImage = (index: number) => {
    if (editingAd) {
      const updatedImages = editingAd.images.filter((_, i) => i !== index);
      setEditingAd({ ...editingAd, images: updatedImages });
    }
  };

  const handleRemoveExistingVideo = () => {
    if (editingAd) {
      setEditingAd({ ...editingAd, video: null });
    }
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewVideo(file);
      setNewVideoPreview(URL.createObjectURL(file));
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    
    if (scheduleMode === "timeframe" && (!editingAd.publishStartDate || !editingAd.publishEndDate)) {
      alert("Please select both start and end date/time for the timeframe.");
      return;
    }

    const validLinks = editingAd.links.filter(l => l.label.trim() !== "" && l.url.trim() !== "");

    let finalStartDate = editingAd.publishStartDate;
    let finalEndDate = editingAd.publishEndDate;

    if (scheduleMode === "now") {
      finalStartDate = new Date().toISOString();
      finalEndDate = null;
    } else if (scheduleMode === "schedule") {
      finalEndDate = null;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("headline", editingAd.headline);
      formData.append("description", editingAd.description);
      formData.append("status", editingAd.status);
      formData.append("mediaType", editingAd.mediaType);
      formData.append("targetAudience", editingAd.targetAudience || "all");
      if (finalStartDate) formData.append("publishStartDate", finalStartDate);
      if (finalEndDate) formData.append("publishEndDate", finalEndDate);
      formData.append("links", JSON.stringify(validLinks));
      
      formData.append("existingImages", JSON.stringify(editingAd.images));
      formData.append("hasVideo", editingAd.video ? "true" : "false");

      newImages.forEach(img => formData.append("images", img));
      
      if (newVideo) formData.append("video", newVideo);

      const res = await axios.put(`http://localhost:5000/api/ads/admin/${editingAd._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
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

  const getMediaUrl = (mediaPath: string) => {
    if (!mediaPath) return "";
    if (mediaPath.startsWith("http")) return mediaPath;
    const cleanPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
    return `http://localhost:5000${cleanPath}?v=${Date.now()}`;
  };

  const nextImage = (adId: string, maxImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) + 1) % maxImages
    }));
  };

  const prevImage = (adId: string, maxImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [adId]: ((prev[adId] || 0) - 1 + maxImages) % maxImages
    }));
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
              
              const currentImageIndex = imageIndexes[ad._id] || 0;

              return (
                <div key={ad._id} className={`group flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  
                  <div className={`h-56 w-full relative overflow-hidden flex items-center justify-center ${darkMode ? "bg-slate-800/80" : "bg-slate-100"}`}>
                    
                    {((ad.mediaType as string) === "video" || ad.mediaType === "both") && ad.video ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video 
                          src={getMediaUrl(ad.video)} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : null}

                    {((ad.mediaType as string) === "image" || ad.mediaType === "both") && validImages.length > 0 && (ad.mediaType as string) !== "video" ? (
                      <div className={`w-full h-full relative flex items-center justify-center ${ad.mediaType === "both" && ad.video ? "absolute inset-0 bg-slate-900/90 hidden group-hover:flex transition-all" : ""}`}>
                        <img 
                          src={getMediaUrl(validImages[currentImageIndex])} 
                          alt={ad.headline} 
                          className="w-full h-full object-contain transition-transform duration-500" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/png?text=Image+Not+Found";
                          }}
                        />

                        {validImages.length > 1 && (
                          <>
                            <button 
                              onClick={() => prevImage(ad._id, validImages.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button 
                              onClick={() => nextImage(ad._id, validImages.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm z-10"
                            >
                              <ChevronRight size={18} />
                            </button>
                            
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm tracking-wider">
                              {currentImageIndex + 1} / {validImages.length}
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}

                    {(!ad.video && validImages.length === 0) && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Megaphone size={32} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Media Provided</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 z-20">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg shadow-sm backdrop-blur-md border ${
                        ad.status === 'active' 
                          ? 'bg-green-500/90 text-white border-green-400/50' 
                          : 'bg-slate-600/90 text-white border-slate-500/50'
                      }`}>
                        {ad.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow z-10 bg-white dark:bg-slate-900 border-t dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                        <Users size={11} /> {ad.targetAudience === "all" ? "All Batches" : `${ad.targetAudience} Batch`}
                      </span>
                    </div>

                    <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {ad.headline}
                    </h3>
                    <p className={`text-xs line-clamp-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {ad.description}
                    </p>
                    
                    {ad.links && ad.links.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ad.links.map((link, idx) => (
                          <span key={idx} className={`text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 border ${darkMode ? "bg-slate-800 text-blue-400 border-slate-700" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                            <LinkIcon size={10} /> {link.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className={`text-[10px] font-medium flex items-center gap-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                        Created: {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(ad)}
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
                  className={`${inputClass} min-h-[100px]`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Media Type</label>
                  <select 
                    value={editingAd.mediaType}
                    onChange={(e) => handleEditChange("mediaType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="image">Images Only</option>
                    <option value="video">Video Only</option>
                    <option value="both">Images & Video</option>
                  </select>
                </div>
                <div>
                  <label className={`flex items-center gap-1 text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    <Users size={14}/> Target Audience
                  </label>
                  <select 
                    value={editingAd.targetAudience} 
                    onChange={(e) => handleEditChange("targetAudience", e.target.value)} 
                    className={inputClass}
                  >
                    <option value="all">All Students</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2026">2026 Batch</option>
                    <option value="2027">2027 Batch</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} space-y-4`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Manage Media</h3>
                
                {(editingAd.mediaType === "image" || editingAd.mediaType === "both") && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-500">Existing Images:</span>
                    <div className="flex flex-wrap gap-3">
                      {editingAd.images && editingAd.images.length > 0 ? (
                        editingAd.images.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl border overflow-hidden bg-slate-200 group">
                            <img src={getMediaUrl(img)} alt="Ad" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveExistingImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-80 hover:opacity-100 transition shadow"
                              title="Remove Image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No existing images.</p>
                      )}
                    </div>

                    {newImagePreviews.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Newly Added Images:</span>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {newImagePreviews.map((src, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-xl border border-teal-500 overflow-hidden bg-slate-200 group">
                              <img src={src} alt="New" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => handleRemoveNewImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-80 hover:opacity-100 transition shadow"
                                title="Remove New Image"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => editImageInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5"
                      >
                        <ImagePlus size={14} /> Add More Images
                      </button>
                      <input type="file" multiple accept="image/*" ref={editImageInputRef} onChange={handleNewImageSelect} className="hidden" />
                    </div>
                  </div>
                )}

                {(editingAd.mediaType === "video" || editingAd.mediaType === "both") && (
                  <div className="space-y-3 pt-3 border-t dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">Video Management:</span>
                    
                    {editingAd.video && !newVideo ? (
                      <div className="relative w-full sm:w-2/3 h-36 bg-black rounded-xl overflow-hidden group">
                        <video src={getMediaUrl(editingAd.video)} controls className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={handleRemoveExistingVideo}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100 transition shadow z-10"
                          title="Remove Video"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : newVideoPreview ? (
                      <div className="relative w-full sm:w-2/3 h-36 bg-black rounded-xl overflow-hidden border border-purple-500 group">
                        <video src={newVideoPreview} controls className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => { setNewVideo(null); setNewVideoPreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100 transition shadow z-10"
                          title="Remove New Video"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No video uploaded.</p>
                    )}

                    {!newVideo && (
                      <div className="pt-1">
                        <button 
                          type="button" 
                          onClick={() => editVideoInputRef.current?.click()}
                          className="px-4 py-2 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
                        >
                          <Film size={14} /> {editingAd.video ? "Replace Video" : "Upload Video"}
                        </button>
                        <input type="file" accept="video/*" ref={editVideoInputRef} onChange={handleNewVideoSelect} className="hidden" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"} space-y-4`}>
                <h3 className={`flex items-center gap-2 text-sm font-bold tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <Clock size={16} /> Publishing & Scheduling
                </h3>
                
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Publishing Option</label>
                  <select value={scheduleMode} onChange={(e) => setScheduleMode(e.target.value)} className={inputClass}>
                    <option value="now">Publish Immediately</option>
                    <option value="schedule">Schedule for Later</option>
                    <option value="timeframe">Set a Timeframe</option>
                  </select>
                </div>

                {scheduleMode !== "now" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Start Date & Time *
                      </label>
                      <input 
                        type="datetime-local" 
                        value={editingAd.publishStartDate || ""}
                        onChange={(e) => handleEditChange("publishStartDate", e.target.value)}
                        className={inputClass}
                        required={scheduleMode !== "now"}
                      />
                    </div>

                    {scheduleMode === "timeframe" && (
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          End Date & Time *
                        </label>
                        <input 
                          type="datetime-local" 
                          value={editingAd.publishEndDate || ""}
                          onChange={(e) => handleEditChange("publishEndDate", e.target.value)}
                          className={inputClass}
                          required={scheduleMode === "timeframe"}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
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

              <div className="pt-6 flex justify-end gap-3 border-t dark:border-slate-800">
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