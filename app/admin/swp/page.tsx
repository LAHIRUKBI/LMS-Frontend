"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Save, CheckCircle, Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Share2, MessageSquare, Palette, Sun, Moon, LayoutDashboard, Star, Image as ImgIcon } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

const POPULAR_SOCIAL_PLATFORMS = [
  "Facebook", "YouTube", "Instagram", "TikTok", "WhatsApp", 
  "X (Twitter)", "LinkedIn", "Snapchat", "Telegram", "Pinterest", "Threads"
];

export default function AdminDashboardSettings() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [activeTab, setActiveTab] = useState("hero"); 

  const [settings, setSettings] = useState({
    heroBadge: "",
    titleColor1: "#0f172a",
    titleColor2: "#0f172a",
    highlightColor: "#f97316",
    darkTitleColor1: "#ffffff",
    darkTitleColor2: "#ffffff",
    darkHighlightColor: "#fb923c",
    heroTitleLine1: "",
    heroTitleLine2: "",
    heroTitleHighlight: "",
    heroDescription: "",
    primaryBtnText: "",
    secondaryBtnText: "",
    badgeText: "",
    badgeAvatars: [] as { image: string }[],
    heroImages: [] as { id: number; image: string; title: string }[],
    galleryItems: [] as { image: string; text: string }[],
    socialLinks: [] as { platform: string; url: string }[],
    testimonialBgImage: "", 
    testimonials: [] as { image: string; name: string; title: string; idea: string; rating: number }[],
    
    featureBadge: "",
    featureTitleLine1: "",
    featureTitleHighlight: "",
    featureDescription: "",
    featureItems: [] as { title: string; description: string; iconType: string; iconImage: string }[]
  });

  const [heroFiles, setHeroFiles] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [testimonialFiles, setTestimonialFiles] = useState<Record<number, File>>({});
  const [testimonialBgFile, setTestimonialBgFile] = useState<File | null>(null);
  const [badgeAvatarFiles, setBadgeAvatarFiles] = useState<Record<number, File>>({});
  const [featureIconFiles, setFeatureIconFiles] = useState<Record<number, File>>({});

  const MAX_HERO_IMAGES = 3;
  const MAX_GALLERY_ITEMS = 5;
  const MAX_BADGE_AVATARS = 4;
  const MAX_FEATURE_ITEMS = 6;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (mediaPath: string) => {
    if (!mediaPath) return "";
    if (mediaPath.startsWith("http") || mediaPath.startsWith("blob:")) return mediaPath;
    const cleanPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleBadgeAvatarFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBadgeAvatarFiles(prev => ({ ...prev, [index]: file }));
      const updated = [...settings.badgeAvatars];
      updated[index] = { image: URL.createObjectURL(file) };
      setSettings(prev => ({ ...prev, badgeAvatars: updated }));
    }
  };

  const addBadgeAvatar = () => {
    if (settings.badgeAvatars.length >= MAX_BADGE_AVATARS) return;
    setSettings(prev => ({ ...prev, badgeAvatars: [...prev.badgeAvatars, { image: "" }] }));
  };

  const removeBadgeAvatar = (index: number) => {
    setSettings(prev => ({ ...prev, badgeAvatars: settings.badgeAvatars.filter((_, idx) => idx !== index) }));
  };

  const handleHeroFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFiles(prev => ({ ...prev, [index]: file }));
      const updated = [...settings.heroImages];
      updated[index] = { ...updated[index], image: URL.createObjectURL(file) };
      setSettings(prev => ({ ...prev, heroImages: updated }));
    }
  };

  const handleHeroImageChange = (index: number, field: string, value: any) => {
    const updatedImages = [...settings.heroImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setSettings(prev => ({ ...prev, heroImages: updatedImages }));
  };

  const addHeroImage = () => {
    if (settings.heroImages.length >= MAX_HERO_IMAGES) return;
    setSettings(prev => ({ ...prev, heroImages: [...prev.heroImages, { id: Date.now(), image: "", title: "" }] }));
  };

  const removeHeroImage = (index: number) => {
    setSettings(prev => ({ ...prev, heroImages: settings.heroImages.filter((_, idx) => idx !== index) }));
  };

  const handleGalleryFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGalleryFiles(prev => ({ ...prev, [index]: file }));
      const updated = [...settings.galleryItems];
      updated[index] = { ...updated[index], image: URL.createObjectURL(file) };
      setSettings(prev => ({ ...prev, galleryItems: updated }));
    }
  };

  const handleGalleryChange = (index: number, field: string, value: any) => {
    const updatedGallery = [...settings.galleryItems];
    updatedGallery[index] = { ...updatedGallery[index], [field]: value };
    setSettings(prev => ({ ...prev, galleryItems: updatedGallery }));
  };

  const addGalleryItem = () => {
    if (settings.galleryItems.length >= MAX_GALLERY_ITEMS) return;
    setSettings(prev => ({ ...prev, galleryItems: [...prev.galleryItems, { image: "", text: "" }] }));
  };

  const removeGalleryItem = (index: number) => {
    setSettings(prev => ({ ...prev, galleryItems: settings.galleryItems.filter((_, idx) => idx !== index) }));
  };

  const handleFeatureItemChange = (index: number, field: string, value: any) => {
    const updatedFeatures = [...settings.featureItems];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setSettings(prev => ({ ...prev, featureItems: updatedFeatures }));
  };

  const handleFeatureIconFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFeatureIconFiles(prev => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      handleFeatureItemChange(index, "iconImage", previewUrl);
    }
  };

  const addFeatureItem = () => {
    if (settings.featureItems?.length >= MAX_FEATURE_ITEMS) return;
    setSettings(prev => ({
      ...prev,
      featureItems: [...(prev.featureItems || []), { title: "", description: "", iconType: "image", iconImage: "" }]
    }));
  };

  const removeFeatureItem = (index: number) => {
    setSettings(prev => ({ ...prev, featureItems: settings.featureItems.filter((_, idx) => idx !== index) }));
  };

  const handleSocialChange = (index: number, field: string, value: string) => {
    const updatedSocial = [...settings.socialLinks];
    updatedSocial[index] = { ...updatedSocial[index], [field]: value };
    setSettings(prev => ({ ...prev, socialLinks: updatedSocial }));
  };
  const addSocialLink = () => setSettings(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: POPULAR_SOCIAL_PLATFORMS[0], url: "" }] }));
  const removeSocialLink = (index: number) => setSettings(prev => ({ ...prev, socialLinks: settings.socialLinks.filter((_, idx) => idx !== index) }));

  const handleTestimonialChange = (index: number, field: string, value: any) => {
    const updatedTestimonials = [...settings.testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value };
    setSettings(prev => ({ ...prev, testimonials: updatedTestimonials }));
  };
  const handleTestimonialFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTestimonialFiles(prev => ({ ...prev, [index]: file }));
      handleTestimonialChange(index, "image", URL.createObjectURL(file));
    }
  };

  const handleTestimonialBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTestimonialBgFile(file);
      setSettings(prev => ({ ...prev, testimonialBgImage: URL.createObjectURL(file) }));
    }
  };

  const addTestimonial = () => setSettings(prev => ({ ...prev, testimonials: [...prev.testimonials, { image: "", name: "", title: "", idea: "", rating: 5 }] }));
  const removeTestimonial = (index: number) => setSettings(prev => ({ ...prev, testimonials: settings.testimonials.filter((_, idx) => idx !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("settingsData", JSON.stringify(settings));

      Object.keys(heroFiles).forEach((key) => formData.append("heroImagesFiles", heroFiles[Number(key)]));
      Object.keys(galleryFiles).forEach((key) => formData.append("galleryImagesFiles", galleryFiles[Number(key)]));
      Object.keys(testimonialFiles).forEach((key) => formData.append(`testimonialFile_${key}`, testimonialFiles[Number(key)]));
      if (testimonialBgFile) {
        formData.append("testimonialBgFile", testimonialBgFile);
      }
      Object.keys(badgeAvatarFiles).forEach((key) => formData.append("badgeAvatarFiles", badgeAvatarFiles[Number(key)]));
      Object.keys(featureIconFiles).forEach((key) => formData.append(`featureIconFile_${key}`, featureIconFiles[Number(key)]));

      const res = await axios.put("http://localhost:5000/api/dashboard/settings", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setSettings(res.data.settings);
      setHeroFiles({});
      setGalleryFiles({});
      setTestimonialFiles({});
      setTestimonialBgFile(null);
      setBadgeAvatarFiles({});
      setFeatureIconFiles({});
      setSuccessMessage("Dashboard settings and items updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Error updating settings:", err);
      setErrorMessage("Failed to update settings. Please try again.");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
        activeTab === id 
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" 
        : darkMode 
          ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" 
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen p-6 lg:p-12 font-sans transition-colors duration-300 ${darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b gap-4 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Settings</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Manage texts, features, gallery and hero sections easily.</p>
          </div>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save All Changes
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-semibold text-sm">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-semibold text-sm">{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="hero" icon={LayoutDashboard} label="Hero Section" />
          <TabButton id="features" icon={Star} label="Features Section" />
          <TabButton id="gallery" icon={ImgIcon} label="Gallery & Hero Images" />
          <TabButton id="reviews" icon={MessageSquare} label="Testimonials" />
          <TabButton id="social" icon={Share2} label="Social Links" />
        </div>

        <form onSubmit={handleSubmit} className={`p-6 md:p-8 rounded-[2rem] border transition-colors duration-300 ${darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-white/80 border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-md"}`}>
          
          {/* ================= TAB: HERO SECTION ================= */}
          {activeTab === "hero" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-teal-400">Hero Texts & Colors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Badge Text</label>
                    <input type="text" name="heroBadge" value={settings.heroBadge} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Primary Button Text</label>
                    <input type="text" name="primaryBtnText" value={settings.primaryBtnText} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-2xl border space-y-4 ${darkMode ? "bg-slate-900/60 border-slate-700/60" : "bg-slate-50 border-slate-200"}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}><Sun size={16} /> Light Mode Colors</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="text" name="heroTitleLine1" value={settings.heroTitleLine1} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} placeholder="Title Line 1" />
                        <input type="color" name="titleColor1" value={settings.titleColor1 || "#0f172a"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" name="heroTitleLine2" value={settings.heroTitleLine2} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} placeholder="Title Line 2" />
                        <input type="color" name="titleColor2" value={settings.titleColor2 || "#0f172a"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" name="heroTitleHighlight" value={settings.heroTitleHighlight} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} placeholder="Highlight Text" />
                        <input type="color" name="highlightColor" value={settings.highlightColor || "#f97316"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-4 ${darkMode ? "bg-slate-900/60 border-slate-700/60" : "bg-slate-50 border-slate-200"}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}><Moon size={16} /> Dark Mode Colors</h3>
                    <div className="space-y-3">
                      <div className={`flex justify-between items-center border rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}>
                        <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Line 1 (Dark)</span>
                        <input type="color" name="darkTitleColor1" value={settings.darkTitleColor1 || "#ffffff"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                      <div className={`flex justify-between items-center border rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}>
                        <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Line 2 (Dark)</span>
                        <input type="color" name="darkTitleColor2" value={settings.darkTitleColor2 || "#ffffff"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                      <div className={`flex justify-between items-center border rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"}`}>
                        <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Highlight (Dark)</span>
                        <input type="color" name="darkHighlightColor" value={settings.darkHighlightColor || "#fb923c"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Hero Description</label>
                  <textarea name="heroDescription" rows={3} value={settings.heroDescription} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                </div>
              </div>

              <div className={`pt-6 border-t ${darkMode ? "border-slate-700/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-teal-400">Badge Avatars (Next to Hero Badge)</h2>
                  <button type="button" onClick={addBadgeAvatar} disabled={settings.badgeAvatars?.length >= MAX_BADGE_AVATARS} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Avatar</button>
                </div>
                <div>
                  <input type="text" name="badgeText" maxLength={20} value={settings.badgeText} onChange={handleChange} placeholder="+3000 students worldwide" className={`w-full border rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none mb-4 ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.badgeAvatars?.map((item, idx) => (
                    <div key={idx} className={`flex gap-4 p-3 rounded-xl border items-center ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className={`w-10 h-10 rounded-full border overflow-hidden flex-shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        {item.image ? <img src={getMediaUrl(item.image)} alt="Avatar" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600 m-auto mt-2" size={20} />}
                      </div>
                      <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-xs cursor-pointer text-teal-400 ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-600" : "bg-slate-100 hover:bg-slate-200 border-slate-300"}`}>
                        <Upload size={14} /> Select
                        <input type="file" accept="image/*" onChange={(e) => handleBadgeAvatarFileSelect(idx, e)} className="hidden" />
                      </label>
                      <button type="button" onClick={() => removeBadgeAvatar(idx)} className="text-rose-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: FEATURES SECTION ================= */}
          {activeTab === "features" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-orange-400">Why Choose Us (Second Section)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Section Badge</label>
                    <input type="text" name="featureBadge" value={settings.featureBadge || "Why Choose Us"} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Title Highlight Word</label>
                    <input type="text" name="featureTitleHighlight" value={settings.featureTitleHighlight || "excel"} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Main Title Text</label>
                    <input type="text" name="featureTitleLine1" value={settings.featureTitleLine1 || "Everything you need to"} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Section Description</label>
                    <textarea name="featureDescription" rows={2} value={settings.featureDescription || ""} onChange={handleChange} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                  </div>
                </div>

                <div className={`pt-6 border-t ${darkMode ? "border-slate-700/50" : "border-slate-200"}`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-teal-400">Feature Carousel Items</h2>
                      <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Add custom features with your own images (Max {MAX_FEATURE_ITEMS})</p>
                    </div>
                    <button type="button" onClick={addFeatureItem} disabled={settings.featureItems?.length >= MAX_FEATURE_ITEMS} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Feature</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {settings.featureItems?.map((item, idx) => (
                      <div key={idx} className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                        <div className={`w-20 h-20 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center relative ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                          {item.iconImage ? <img src={getMediaUrl(item.iconImage)} alt="Icon" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-500" size={24} />}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input type="text" value={item.title} onChange={(e) => handleFeatureItemChange(idx, "title", e.target.value)} placeholder="Feature Title" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                          <textarea rows={2} value={item.description} onChange={(e) => handleFeatureItemChange(idx, "description", e.target.value)} placeholder="Feature Description..." className={`w-full border rounded-lg px-3 py-2 text-xs outline-none resize-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                          <div className="flex items-center gap-3">
                             <label className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs cursor-pointer text-teal-400 transition-colors ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-600" : "bg-slate-100 hover:bg-slate-200 border-slate-300"}`}>
                              <Upload size={14} /> Upload Custom Image Icon
                              <input type="file" accept="image/*" onChange={(e) => handleFeatureIconFileSelect(idx, e)} className="hidden" />
                             </label>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFeatureItem(idx)} className="text-rose-400 p-2 md:self-start"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {(!settings.featureItems || settings.featureItems.length === 0) && (
                      <p className={`text-sm italic py-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No custom feature items added. (Will show default ones in the UI)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: GALLERY & HERO IMAGES ================= */}
          {activeTab === "gallery" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-teal-400">Hero Carousel Images</h2>
                  <button type="button" onClick={addHeroImage} disabled={settings.heroImages?.length >= MAX_HERO_IMAGES} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Image</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.heroImages?.map((img, idx) => (
                    <div key={idx} className={`flex gap-4 p-3 rounded-xl border items-center ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className={`w-14 h-14 rounded-lg border overflow-hidden flex-shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        {img.image ? <img src={getMediaUrl(img.image)} alt="Hero" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600 m-auto mt-4" size={24} />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="text" value={img.title} onChange={(e) => handleHeroImageChange(idx, "title", e.target.value)} placeholder="Title / Alt Text" className={`w-full border rounded-lg px-2 py-1.5 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                        <label className={`flex items-center justify-center gap-2 px-2 py-1.5 border rounded-lg text-xs cursor-pointer text-teal-400 ${darkMode ? "bg-slate-800 border-slate-600" : "bg-slate-100 border-slate-300"}`}>
                          <Upload size={12} /> Upload
                          <input type="file" accept="image/*" onChange={(e) => handleHeroFileSelect(idx, e)} className="hidden" />
                        </label>
                      </div>
                      <button type="button" onClick={() => removeHeroImage(idx)} className="text-rose-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`pt-6 border-t ${darkMode ? "border-slate-700/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-teal-400">Our Gallery Section</h2>
                  <button type="button" onClick={addGalleryItem} disabled={settings.galleryItems?.length >= MAX_GALLERY_ITEMS} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Gallery Image</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.galleryItems?.map((item, idx) => (
                    <div key={idx} className={`flex gap-4 p-3 rounded-xl border items-center ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className={`w-14 h-14 rounded-lg border overflow-hidden flex-shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        {item.image ? <img src={getMediaUrl(item.image)} alt="Gallery" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600 m-auto mt-4" size={24} />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="text" value={item.text} onChange={(e) => handleGalleryChange(idx, "text", e.target.value)} placeholder="Label Text" className={`w-full border rounded-lg px-2 py-1.5 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                        <label className={`flex items-center justify-center gap-2 px-2 py-1.5 border rounded-lg text-xs cursor-pointer text-teal-400 ${darkMode ? "bg-slate-800 border-slate-600" : "bg-slate-100 border-slate-300"}`}>
                          <Upload size={12} /> Upload
                          <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(idx, e)} className="hidden" />
                        </label>
                      </div>
                      <button type="button" onClick={() => removeGalleryItem(idx)} className="text-rose-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: TESTIMONIALS ================= */}
          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                <h2 className="text-lg font-bold text-teal-400">Testimonials Section Background Image</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className={`w-full sm:w-48 h-28 rounded-xl border overflow-hidden flex items-center justify-center relative ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                    {settings.testimonialBgImage ? (
                      <img src={getMediaUrl(settings.testimonialBgImage)} alt="Testimonial Background" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-500" size={32} />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Upload a background image for the testimonials section with curved arrows.</p>
                    <label className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs cursor-pointer text-teal-400 transition-colors ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-600" : "bg-slate-100 hover:bg-slate-200 border-slate-300"}`}>
                      <Upload size={16} /> Upload Background Image
                      <input type="file" accept="image/*" onChange={handleTestimonialBgFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t ${darkMode ? "border-slate-700/50" : "border-slate-200"}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-teal-400">Client Testimonials Cards</h2>
                  <button type="button" onClick={addTestimonial} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Review</button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {settings.testimonials?.map((test, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border grid md:grid-cols-12 gap-4 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className={`md:col-span-3 flex flex-col items-center gap-3 pb-4 md:pb-0 md:pr-4 ${darkMode ? "border-slate-700" : "border-slate-200"} md:border-r border-b md:border-b-0`}>
                         <div className={`w-16 h-16 rounded-full border overflow-hidden flex-shrink-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                          {test.image ? <img src={getMediaUrl(test.image)} alt="Client" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600 m-auto mt-5" size={24} />}
                        </div>
                        <label className={`flex items-center justify-center gap-2 px-2 py-1.5 border rounded-lg text-[11px] cursor-pointer text-teal-400 w-full ${darkMode ? "bg-slate-800 border-slate-600" : "bg-slate-100 border-slate-300"}`}>
                          <Upload size={12} /> Upload Image
                          <input type="file" accept="image/*" onChange={(e) => handleTestimonialFileSelect(idx, e)} className="hidden" />
                        </label>
                      </div>
                      <div className="md:col-span-8 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={test.name} onChange={(e) => handleTestimonialChange(idx, "name", e.target.value)} placeholder="Client Name" className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                          <input type="text" value={test.title} onChange={(e) => handleTestimonialChange(idx, "title", e.target.value)} placeholder="Company / Role" className={`w-full border rounded-lg px-3 py-2 text-xs outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                        </div>
                        <textarea rows={2} value={test.idea} onChange={(e) => handleTestimonialChange(idx, "idea", e.target.value)} placeholder="Review feedback..." className={`w-full border rounded-lg px-3 py-2 text-xs outline-none resize-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                        <div>
                           <label className={`text-xs mr-3 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Rating (1-5 Stars)</label>
                           <input type="number" min="1" max="5" value={test.rating} onChange={(e) => handleTestimonialChange(idx, "rating", Number(e.target.value))} className={`w-16 border rounded-lg px-2 py-1 text-xs outline-none text-center ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                        </div>
                      </div>
                      <div className="md:col-span-1 flex items-start justify-end">
                        <button type="button" onClick={() => removeTestimonial(idx)} className="text-rose-400 p-2"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {(!settings.testimonials || settings.testimonials.length === 0) && (
                    <p className={`text-sm italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No testimonials added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: SOCIAL LINKS ================= */}
          {activeTab === "social" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-teal-400">Social Media Links</h2>
                <button type="button" onClick={addSocialLink} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${darkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"}`}><Plus size={14} /> Add Link</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {settings.socialLinks?.map((social, idx) => (
                  <div key={idx} className={`flex gap-4 p-4 rounded-2xl border items-center ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                    <div className="w-40">
                      <select value={social.platform} onChange={(e) => handleSocialChange(idx, "platform", e.target.value)} className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}>
                        {POPULAR_SOCIAL_PLATFORMS.map((plat) => <option key={plat} value={plat}>{plat}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input type="text" value={social.url} onChange={(e) => handleSocialChange(idx, "url", e.target.value)} placeholder="Profile URL" className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`} />
                    </div>
                    <button type="button" onClick={() => removeSocialLink(idx)} className="text-rose-400 p-2"><Trash2 size={18} /></button>
                  </div>
                ))}
                {(!settings.socialLinks || settings.socialLinks.length === 0) && (
                   <p className={`text-sm italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No social media links added yet.</p>
                )}
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}