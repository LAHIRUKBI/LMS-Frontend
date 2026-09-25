"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { Megaphone, ImagePlus, Link as LinkIcon, Plus, Trash2, Send, AlertCircle, Users, Clock, Film } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface AdLink {
  label: string;
  url: string;
}

export default function CreateAdPage() {
  const { darkMode } = useTheme();
  
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [targetAudience, setTargetAudience] = useState("all"); 
  
  // Scheduling State variables
  const [scheduleMode, setScheduleMode] = useState("now");
  const [publishStartDate, setPublishStartDate] = useState("");
  const [publishEndDate, setPublishEndDate] = useState("");
  
  // Media Type State
  const [mediaType, setMediaType] = useState("image"); // 'image', 'video', 'both'
  
  const [links, setLinks] = useState<AdLink[]>([{ label: "", url: "" }]);
  
  // Images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Video
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddLink = () => setLinks([...links, { label: "", url: "" }]);
  const handleLinkChange = (index: number, field: keyof AdLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };
  const handleRemoveLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedImages.length + filesArray.length > 5) {
        setErrorMsg("You can only upload up to 5 images per Ad.");
        return;
      }
      setSelectedImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setErrorMsg("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setErrorMsg("Video size should be less than 50MB.");
        return;
      }
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!headline.trim() || !description.trim()) {
      setErrorMsg("Headline and Description are required.");
      return;
    }
    if (scheduleMode !== "now" && !publishStartDate) {
      setErrorMsg("Please select a valid start date and time.");
      return;
    }
    if (scheduleMode === "timeframe" && (!publishStartDate || !publishEndDate)) {
      setErrorMsg("Please select both start and end date/time for the timeframe.");
      return;
    }

    // Media Validation
    if ((mediaType === "image" || mediaType === "both") && selectedImages.length === 0 && !selectedVideo) {
       // Allow text-only ads if nothing is selected, or you can force media selection here.
    }

    const validLinks = links.filter(l => l.label.trim() !== "" && l.url.trim() !== "");

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("headline", headline);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("targetAudience", targetAudience);
      formData.append("mediaType", mediaType);
      
      if (scheduleMode === "schedule" || scheduleMode === "timeframe") {
        formData.append("publishStartDate", publishStartDate);
      }
      if (scheduleMode === "timeframe") {
        formData.append("publishEndDate", publishEndDate);
      }
      formData.append("links", JSON.stringify(validLinks));

      // Append Images
      if (mediaType === "image" || mediaType === "both") {
        selectedImages.forEach((img) => formData.append("images", img));
      }
      
      // Append Video
      if (mediaType === "video" || mediaType === "both") {
        if (selectedVideo) {
          formData.append("video", selectedVideo);
        }
      }

      const res = await axios.post("http://localhost:5000/api/ads/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Advertisement successfully created and published!");
        setHeadline("");
        setDescription("");
        setStatus("active");
        setTargetAudience("all");
        setScheduleMode("now");
        setPublishStartDate("");
        setPublishEndDate("");
        setMediaType("image");
        setLinks([{ label: "", url: "" }]);
        setSelectedImages([]);
        setImagePreviews([]);
        setSelectedVideo(null);
        setVideoPreview(null);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Failed to create Ad.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl border py-2.5 px-3 text-sm outline-none focus:ring-2 transition-colors ${
    darkMode 
      ? "bg-slate-900 border-slate-700 text-white focus:ring-blue-500 placeholder-slate-500" 
      : "bg-white border-slate-300 text-slate-900 focus:ring-blue-500 placeholder-slate-400"
  }`;

  return (
    <div className={`p-4 sm:p-8 min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b pb-4 dark:border-slate-800">
          <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              Create Advertisement
            </h1>
            <p className={`text-sm mt-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Design and publish promotions, announcements, or events to the Student Home Page.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              1. Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Primary Headline *</label>
                <input 
                  type="text" 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Special Revision Seminar 2026!"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Ad Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a compelling description for this advertisement..."
                  className={`${inputClass} min-h-[100px] resize-y`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Ad Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Draft)</option>
                  </select>
                </div>
                
                <div>
                  <label className={`flex items-center gap-1 text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    <Users size={14}/> Target Audience
                  </label>
                  <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className={inputClass}>
                    <option value="all">All Students</option>
                    <option value="2025">2025 Batch</option>
                    <option value="2026">2026 Batch</option>
                    <option value="2027">2027 Batch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Publishing & Scheduling */}
          <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            <h2 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              <Clock size={18} /> 2. Publishing & Scheduling
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Publishing Option</label>
                <select value={scheduleMode} onChange={(e) => setScheduleMode(e.target.value)} className={inputClass}>
                  <option value="now">Publish Immediately</option>
                  <option value="schedule">Schedule for Later</option>
                  <option value="timeframe">Set a Timeframe</option>
                </select>
              </div>

              {scheduleMode !== "now" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      Start Date & Time *
                    </label>
                    <input 
                      type="datetime-local" 
                      value={publishStartDate}
                      onChange={(e) => setPublishStartDate(e.target.value)}
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
                        value={publishEndDate}
                        onChange={(e) => setPublishEndDate(e.target.value)}
                        className={inputClass}
                        required={scheduleMode === "timeframe"}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Media Selection (Images/Video) */}
          <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <label className={`block text-xs font-bold mb-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Select Media Type to Upload</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaType" value="image" checked={mediaType === "image"} onChange={() => setMediaType("image")} className="w-4 h-4 text-blue-600" />
                  <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Images Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaType" value="video" checked={mediaType === "video"} onChange={() => setMediaType("video")} className="w-4 h-4 text-blue-600" />
                  <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Video Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mediaType" value="both" checked={mediaType === "both"} onChange={() => setMediaType("both")} className="w-4 h-4 text-blue-600" />
                  <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Images & Video</span>
                </label>
              </div>
            </div>

            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              3. Ad Media
            </h2>

            <div className="space-y-6">
              {/* Image Upload Zone */}
              {(mediaType === "image" || mediaType === "both") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Images (Max 5)</span>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 px-2.5 py-1 rounded-full">
                      {selectedImages.length} / 5 Added
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedImages.length < 5 && (
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          darkMode ? "border-slate-700 hover:border-blue-500 bg-slate-800/50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                        }`}
                      >
                        <ImagePlus className={darkMode ? "text-slate-400" : "text-slate-400"} size={28} />
                        <span className={`text-[10px] mt-2 font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Add Image</span>
                      </div>
                    )}
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
                </div>
              )}

              {/* Video Upload Zone */}
              {(mediaType === "video" || mediaType === "both") && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Video (Max 1 - 50MB limit)</span>
                    {selectedVideo && (
                      <span className="text-xs font-semibold bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 px-2.5 py-1 rounded-full">
                        1 Video Added
                      </span>
                    )}
                  </div>
                  
                  {!selectedVideo ? (
                    <div 
                      onClick={() => videoInputRef.current?.click()}
                      className={`w-full sm:w-1/2 md:w-1/3 aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        darkMode ? "border-slate-700 hover:border-blue-500 bg-slate-800/50" : "border-slate-300 hover:border-blue-500 bg-slate-50"
                      }`}
                    >
                      <Film className={darkMode ? "text-slate-400" : "text-slate-400"} size={28} />
                      <span className={`text-[10px] mt-2 font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Add Video</span>
                    </div>
                  ) : (
                    <div className="relative w-full sm:w-1/2 md:w-2/3 aspect-video rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group bg-black">
                      <video src={videoPreview!} controls className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => { setSelectedVideo(null); setVideoPreview(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoSelect} className="hidden" />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Action Links */}
          <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              4. Action Links (Optional)
            </h2>
            <p className={`text-xs mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Add buttons to direct students to registration forms, WhatsApp groups, or YouTube videos.
            </p>

            <div className="space-y-3">
              {links.map((link, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="w-full sm:w-1/3">
                    <input 
                      type="text" 
                      placeholder="Button Label (e.g. Join WhatsApp)" 
                      value={link.label}
                      onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-full sm:flex-1 relative">
                    <LinkIcon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input 
                      type="url" 
                      placeholder="URL (https://...)" 
                      value={link.url}
                      onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2.5 sm:p-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl transition-colors shrink-0"
                    title="Remove Link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={handleAddLink}
              className={`mt-4 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                darkMode ? "bg-slate-800 text-blue-400 hover:bg-slate-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              <Plus size={16} /> Add Another Link
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-blue-600/20 disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Publishing Ad...
                </>
              ) : (
                <>
                  <Send size={18} /> Publish Advertisement
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}