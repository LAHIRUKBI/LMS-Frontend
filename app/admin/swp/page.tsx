"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Save, CheckCircle, Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Share2, MessageSquare, Palette, Sun, Moon } from "lucide-react";

const POPULAR_SOCIAL_PLATFORMS = [
  "Facebook",
  "YouTube",
  "Instagram",
  "TikTok",
  "WhatsApp",
  "X (Twitter)",
  "LinkedIn",
  "Snapchat",
  "Telegram",
  "Pinterest",
  "Threads"
];

export default function AdminDashboardSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    testimonials: [] as { image: string; name: string; title: string; idea: string; rating: number }[],
  });

  const [heroFiles, setHeroFiles] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [testimonialFiles, setTestimonialFiles] = useState<Record<number, File>>({});
  const [badgeAvatarFiles, setBadgeAvatarFiles] = useState<Record<number, File>>({});

  const MAX_HERO_IMAGES = 3;
  const MAX_GALLERY_ITEMS = 5;
  const MAX_BADGE_AVATARS = 4;

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

  // --- Badge Avatar Handlers ---
  const handleBadgeAvatarChange = (index: number, value: string) => {
    const updated = [...settings.badgeAvatars];
    updated[index] = { image: value };
    setSettings(prev => ({ ...prev, badgeAvatars: updated }));
  };

  const handleBadgeAvatarFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBadgeAvatarFiles(prev => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      handleBadgeAvatarChange(index, previewUrl);
    }
  };

  const addBadgeAvatar = () => {
    if (settings.badgeAvatars.length >= MAX_BADGE_AVATARS) {
      setErrorMessage(`Badge එක සදහා ඇතුළත් කළ හැකි උපරිම පින්තූර සංඛ්‍යාව ${MAX_BADGE_AVATARS} කි.`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }
    setSettings(prev => ({
      ...prev,
      badgeAvatars: [...prev.badgeAvatars, { image: "" }]
    }));
  };

  const removeBadgeAvatar = (index: number) => {
    const updated = settings.badgeAvatars.filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, badgeAvatars: updated }));
  };

  // --- Hero Image Handlers ---
  const handleHeroImageChange = (index: number, field: string, value: any) => {
    const updatedImages = [...settings.heroImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setSettings(prev => ({ ...prev, heroImages: updatedImages }));
  };

  const handleHeroFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroFiles(prev => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      handleHeroImageChange(index, "image", previewUrl);
    }
  };

  const addHeroImage = () => {
    if (settings.heroImages.length >= MAX_HERO_IMAGES) {
      setErrorMessage(`Hero Carousel සඳහා ඇතුළත් කළ හැකි උපරිම පින්තූර සංඛ්‍යාව ${MAX_HERO_IMAGES} කි.`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }
    setSettings(prev => ({
      ...prev,
      heroImages: [...prev.heroImages, { id: Date.now(), image: "", title: "" }]
    }));
  };

  const removeHeroImage = (index: number) => {
    const updatedImages = settings.heroImages.filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, heroImages: updatedImages }));
  };

  // --- Gallery Image Handlers ---
  const handleGalleryChange = (index: number, field: string, value: any) => {
    const updatedGallery = [...settings.galleryItems];
    updatedGallery[index] = { ...updatedGallery[index], [field]: value };
    setSettings(prev => ({ ...prev, galleryItems: updatedGallery }));
  };

  const handleGalleryFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGalleryFiles(prev => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      handleGalleryChange(index, "image", previewUrl);
    }
  };

  const addGalleryItem = () => {
    if (settings.galleryItems.length >= MAX_GALLERY_ITEMS) {
      setErrorMessage(`Gallery සඳහා ඇතුළත් කළ හැකි උපරිම පින්තූර සංඛ්‍යාව ${MAX_GALLERY_ITEMS} කි.`);
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }
    setSettings(prev => ({
      ...prev,
      galleryItems: [...prev.galleryItems, { image: "", text: "" }]
    }));
  };

  const removeGalleryItem = (index: number) => {
    const updatedGallery = settings.galleryItems.filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, galleryItems: updatedGallery }));
  };

  // --- Social Media Handlers ---
  const handleSocialChange = (index: number, field: string, value: string) => {
    const updatedSocial = [...settings.socialLinks];
    updatedSocial[index] = { ...updatedSocial[index], [field]: value };
    setSettings(prev => ({ ...prev, socialLinks: updatedSocial }));
  };

  const addSocialLink = () => {
    setSettings(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: POPULAR_SOCIAL_PLATFORMS[0], url: "" }]
    }));
  };

  const removeSocialLink = (index: number) => {
    const updatedSocial = settings.socialLinks.filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, socialLinks: updatedSocial }));
  };

  // --- Testimonial Handlers ---
  const handleTestimonialChange = (index: number, field: string, value: any) => {
    const updatedTestimonials = [...settings.testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value };
    setSettings(prev => ({ ...prev, testimonials: updatedTestimonials }));
  };

  const handleTestimonialFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTestimonialFiles(prev => ({ ...prev, [index]: file }));
      const previewUrl = URL.createObjectURL(file);
      handleTestimonialChange(index, "image", previewUrl);
    }
  };

  const addTestimonial = () => {
    setSettings(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { image: "", name: "", title: "", idea: "", rating: 5 }]
    }));
  };

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = settings.testimonials.filter((_, idx) => idx !== index);
    setSettings(prev => ({ ...prev, testimonials: updatedTestimonials }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("settingsData", JSON.stringify(settings));

      Object.keys(heroFiles).forEach((key) => {
        formData.append("heroImagesFiles", heroFiles[Number(key)]);
      });

      Object.keys(galleryFiles).forEach((key) => {
        formData.append("galleryImagesFiles", galleryFiles[Number(key)]);
      });

      Object.keys(testimonialFiles).forEach((key) => {
        formData.append("testimonialFiles", testimonialFiles[Number(key)]);
      });

      Object.keys(badgeAvatarFiles).forEach((key) => {
        formData.append("badgeAvatarFiles", badgeAvatarFiles[Number(key)]);
      });

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
      setBadgeAvatarFiles({});
      setSuccessMessage("Dashboard settings and items updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Error updating settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard Customizer</h1>
            <p className="text-slate-400 text-sm mt-1">Manage texts, headings, and images with accurate UI limits.</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Text Settings & Light/Dark Colors */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <h2 className="text-xl font-bold text-orange-400">Hero Section Texts & Light/Dark Colors</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Badge Text</label>
                <input 
                  type="text" 
                  name="heroBadge" 
                  value={settings.heroBadge} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Light Mode Colors */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2"><Sun size={16} /> Light Mode Title Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title Line 1</label>
                  <div className="flex items-center gap-2">
                    <input type="text" name="heroTitleLine1" value={settings.heroTitleLine1} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none" />
                    <input type="color" name="titleColor1" value={settings.titleColor1 || "#0f172a"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title Line 2</label>
                  <div className="flex items-center gap-2">
                    <input type="text" name="heroTitleLine2" value={settings.heroTitleLine2} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none" />
                    <input type="color" name="titleColor2" value={settings.titleColor2 || "#0f172a"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Highlight (-Amazing)</label>
                  <div className="flex items-center gap-2">
                    <input type="text" name="heroTitleHighlight" value={settings.heroTitleHighlight} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none" />
                    <input type="color" name="highlightColor" value={settings.highlightColor || "#f97316"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Colors */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2"><Moon size={16} /> Dark Mode Title Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title Line 1 (Dark)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 truncate">{settings.heroTitleLine1}</span>
                    <input type="color" name="darkTitleColor1" value={settings.darkTitleColor1 || "#ffffff"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer ml-auto" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title Line 2 (Dark)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 truncate">{settings.heroTitleLine2}</span>
                    <input type="color" name="darkTitleColor2" value={settings.darkTitleColor2 || "#ffffff"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer ml-auto" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Highlight (Dark)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 truncate">{settings.heroTitleHighlight}</span>
                    <input type="color" name="darkHighlightColor" value={settings.darkHighlightColor || "#fb923c"} onChange={handleChange} className="w-8 h-8 bg-transparent cursor-pointer ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Button Text</label>
                <input type="text" name="primaryBtnText" value={settings.primaryBtnText} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description Paragraph</label>
              <textarea name="heroDescription" rows={3} value={settings.heroDescription} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" />
            </div>
          </div>

          {/* Badge Avatars & Text Settings */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400">Badge Avatars & Text (Next to Hero Badge)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add up to 4 avatars and custom text (max 20 characters)</p>
              </div>
              <button type="button" onClick={addBadgeAvatar} disabled={settings.badgeAvatars?.length >= 4} className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40">
                <Plus size={16} /> Add Avatar (Max 4)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Badge Subtitle Text (Max 20 chars)</label>
              <input type="text" name="badgeText" maxLength={20} value={settings.badgeText} onChange={handleChange} placeholder="+3000 students worldwide" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>

            {settings.badgeAvatars?.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No badge avatars added yet.</p>
            ) : (
              settings.badgeAvatars.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-700 items-center">
                  <div className="md:col-span-2 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center relative">
                      {item.image ? <img src={getMediaUrl(item.image)} alt="Avatar" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" size={20} />}
                    </div>
                  </div>
                  <div className="md:col-span-9">
                    <label className="block text-xs text-slate-400 mb-1">Avatar Image (/swp)</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-teal-400">
                      <Upload size={14} /> Select File
                      <input type="file" accept="image/*" onChange={(e) => handleBadgeAvatarFileSelect(idx, e)} className="hidden" />
                    </label>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeBadgeAvatar(idx)} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Social Media Links Settings */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                  <Share2 size={20} /> Social Media Links
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Add social media accounts to display under the hero left content</p>
              </div>
              <button type="button" onClick={addSocialLink} className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus size={16} /> Add Social Link
              </button>
            </div>

            {settings.socialLinks?.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No social media links added yet.</p>
            ) : (
              settings.socialLinks.map((social, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-700 items-center">
                  <div className="md:col-span-5">
                    <label className="block text-xs text-slate-400 mb-1">Platform</label>
                    <select value={social.platform} onChange={(e) => handleSocialChange(idx, "platform", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 text-white">
                      {POPULAR_SOCIAL_PLATFORMS.map((plat) => <option key={plat} value={plat}>{plat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-xs text-slate-400 mb-1">Profile / Page URL</label>
                    <input type="text" value={social.url} onChange={(e) => handleSocialChange(idx, "url", e.target.value)} placeholder="https://facebook.com/yourprofile" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeSocialLink(idx)} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* What Our Clients Say (Testimonials) Settings */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                  <MessageSquare size={20} /> What Our Clients Say (Testimonials)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Add unlimited client feedback cards with images and ratings</p>
              </div>
              <button type="button" onClick={addTestimonial} className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus size={16} /> Add Testimonial
              </button>
            </div>

            {settings.testimonials?.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No testimonials added yet.</p>
            ) : (
              settings.testimonials.map((test, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-700 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-2 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center relative">
                        {test.image ? <img src={getMediaUrl(test.image)} alt="Client" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" size={24} />}
                      </div>
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs text-slate-400 mb-1">Client Image (/swp)</label>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer text-teal-400">
                        <Upload size={14} /> Select File
                        <input type="file" accept="image/*" onChange={(e) => handleTestimonialFileSelect(idx, e)} className="hidden" />
                      </label>
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs text-slate-400 mb-1">Client Name</label>
                      <input type="text" value={test.name} onChange={(e) => handleTestimonialChange(idx, "name", e.target.value)} placeholder="Tadhg Gunnigle" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button type="button" onClick={() => removeTestimonial(idx)} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Client Title / Company</label>
                      <input type="text" value={test.title} onChange={(e) => handleTestimonialChange(idx, "title", e.target.value)} placeholder="CEO, Miles Ahead Hosting, Canada" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rating (1 to 5 Stars)</label>
                      <input type="number" min="1" max="5" value={test.rating} onChange={(e) => handleTestimonialChange(idx, "rating", Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Idea / Feedback (~50 words)</label>
                    <textarea rows={3} value={test.idea} onChange={(e) => handleTestimonialChange(idx, "idea", e.target.value)} placeholder="Write client feedback here..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 resize-none text-white" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Hero Images Settings (Max 3) */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400">Hero Carousel Images</h2>
                <p className="text-xs text-slate-400 mt-0.5">{settings.heroImages.length} / {MAX_HERO_IMAGES} images added (Max 3)</p>
              </div>
              <button type="button" onClick={addHeroImage} disabled={settings.heroImages.length >= MAX_HERO_IMAGES} className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={16} /> Add New Hero Image
              </button>
            </div>

            {settings.heroImages.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No hero images added yet.</p>
            ) : (
              settings.heroImages.map((img, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-700 items-center">
                  <div className="md:col-span-2 flex justify-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center relative">
                      {img.image ? <img src={getMediaUrl(img.image)} alt="Hero preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" size={24} />}
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs text-slate-400 mb-1">Upload from Computer</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all text-teal-400">
                      <Upload size={14} /> Select File
                      <input type="file" accept="image/*" onChange={(e) => handleHeroFileSelect(idx, e)} className="hidden" />
                    </label>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs text-slate-400 mb-1">Title / Caption</label>
                    <input type="text" value={img.title} onChange={(e) => handleHeroImageChange(idx, "title", e.target.value)} placeholder="Student 1" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeHeroImage(idx)} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Gallery Images Settings (Max 5) */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400">Our Gallery Items</h2>
                <p className="text-xs text-slate-400 mt-0.5">{settings.galleryItems.length} / {MAX_GALLERY_ITEMS} items added (Max 5)</p>
              </div>
              <button type="button" onClick={addGalleryItem} disabled={settings.galleryItems.length >= MAX_GALLERY_ITEMS} className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={16} /> Add New Gallery Item
              </button>
            </div>

            {settings.galleryItems.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No gallery items added yet.</p>
            ) : (
              settings.galleryItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-700 items-center">
                  <div className="md:col-span-2 flex justify-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center relative">
                      {item.image ? <img src={getMediaUrl(item.image)} alt="Gallery preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" size={24} />}
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs text-slate-400 mb-1">Upload from Computer</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all text-teal-400">
                      <Upload size={14} /> Select File
                      <input type="file" accept="image/*" onChange={(e) => handleGalleryFileSelect(idx, e)} className="hidden" />
                    </label>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs text-slate-400 mb-1">Label Text</label>
                    <input type="text" value={item.text} onChange={(e) => handleGalleryChange(idx, "text", e.target.value)} placeholder="Student 1" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500" />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeGalleryItem(idx)} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}