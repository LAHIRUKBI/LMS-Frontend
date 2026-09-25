"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Save, CheckCircle, Plus, Trash2, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function AdminDashboardSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [settings, setSettings] = useState({
    heroBadge: "",
    heroTitleLine1: "",
    heroTitleLine2: "",
    heroTitleHighlight: "",
    heroDescription: "",
    primaryBtnText: "",
    secondaryBtnText: "",
    heroImages: [] as { id: number; image: string; title: string }[],
    galleryItems: [] as { image: string; text: string }[],
  });

  const [heroFiles, setHeroFiles] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});

  // නිවැරදි UI සීමාවන්: Hero Carousel සඳහා උපරිම 3 ක් සහ Gallery සඳහා උපරිම 5 ක්
  const MAX_HERO_IMAGES = 3;
  const MAX_GALLERY_ITEMS = 5;

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

  // --- Hero Image Handlers ---
  const handleHeroImageChange = (index: number, field: string, value: string) => {
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
    setHeroFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  // --- Gallery Image Handlers ---
  const handleGalleryChange = (index: number, field: string, value: string) => {
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
    setGalleryFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
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

      const res = await axios.put("http://localhost:5000/api/dashboard/settings", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setSettings(res.data.settings);
      setHeroFiles({});
      setGalleryFiles({});
      setSuccessMessage("Dashboard settings and images updated successfully!");
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
          {/* Text Settings */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <h2 className="text-xl font-bold text-orange-400">Hero Section Texts</h2>
            
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Highlight Title (-Amazing)</label>
                <input 
                  type="text" 
                  name="heroTitleHighlight" 
                  value={settings.heroTitleHighlight} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Title Line 1</label>
                <input 
                  type="text" 
                  name="heroTitleLine1" 
                  value={settings.heroTitleLine1} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Title Line 2</label>
                <input 
                  type="text" 
                  name="heroTitleLine2" 
                  value={settings.heroTitleLine2} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Button Text</label>
                <input 
                  type="text" 
                  name="primaryBtnText" 
                  value={settings.primaryBtnText} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description Paragraph</label>
              <textarea 
                name="heroDescription" 
                rows={3}
                value={settings.heroDescription} 
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Hero Images Settings (Max 3) */}
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-orange-400">Hero Carousel Images</h2>
                <p className="text-xs text-slate-400 mt-0.5">{settings.heroImages.length} / {MAX_HERO_IMAGES} images added (Max 3)</p>
              </div>
              <button 
                type="button"
                onClick={addHeroImage}
                disabled={settings.heroImages.length >= MAX_HERO_IMAGES}
                className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
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
                      {img.image ? (
                        <img 
                          src={getMediaUrl(img.image)} 
                          alt="Hero preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-slate-600" size={24} />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs text-slate-400 mb-1">Upload from Computer</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all text-teal-400">
                      <Upload size={14} /> Select File
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleHeroFileSelect(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-xs text-slate-400 mb-1">Title / Caption</label>
                    <input 
                      type="text" 
                      value={img.title} 
                      onChange={(e) => handleHeroImageChange(idx, "title", e.target.value)}
                      placeholder="Student 1"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button 
                      type="button"
                      onClick={() => removeHeroImage(idx)}
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
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
              <button 
                type="button"
                onClick={addGalleryItem}
                disabled={settings.galleryItems.length >= MAX_GALLERY_ITEMS}
                className="bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
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
                      {item.image ? (
                        <img 
                          src={getMediaUrl(item.image)} 
                          alt="Gallery preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-slate-600" size={24} />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs text-slate-400 mb-1">Upload from Computer</label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all text-teal-400">
                      <Upload size={14} /> Select File
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleGalleryFileSelect(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-xs text-slate-400 mb-1">Label Text</label>
                    <input 
                      type="text" 
                      value={item.text} 
                      onChange={(e) => handleGalleryChange(idx, "text", e.target.value)}
                      placeholder="Student 1"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button 
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
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