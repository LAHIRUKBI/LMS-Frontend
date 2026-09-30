"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { User, Mail, Phone, Camera, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Windows file paths (\) සහ Base URL එක නිවැරදිව ගැලපීමට මෙම function එක භාවිතා කරයි.
  const formatImageUrl = (path: string) => {
    if (!path) return "";
    const cleanPath = path.replace(/\\/g, '/');
    const baseUrl = `http://localhost:5000/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
    return `${baseUrl}?t=${new Date().getTime()}`; // Cache bypass කිරීම
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const admin = res.data;
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phoneNumber: admin.phoneNumber || "",
      });

      if (admin.profilePhoto) {
        setPreviewImage(formatImageUrl(admin.profilePhoto));
      }
      
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile details.");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phoneNumber", formData.phoneNumber);
      if (profilePhoto) {
        submitData.append("profilePhoto", profilePhoto);
      }

      const res = await axios.put("http://localhost:5000/api/admin/profile", submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });

      setSuccess(res.data.message || "Profile updated successfully!");
      if (res.data.admin.profilePhoto) {
        setPreviewImage(formatImageUrl(res.data.admin.profilePhoto));
      }
      setProfilePhoto(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-base outline-none transition-all duration-200 focus:ring-2 ${
    darkMode
      ? "border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/40"
      : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
  }`;

  const labelClass = `mb-1.5 flex items-center gap-1.5 text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  if (loading) {
    return <div className="p-8 text-center dark:text-white">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${darkMode ? "text-white" : "text-slate-900"}`}>
          My Profile
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Manage your account details and profile image.
        </p>
      </div>

      <div className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4">
            <div className="relative h-28 w-28 shrink-0 rounded-full border-4 border-slate-100 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-slate-400 dark:text-slate-500" />
              )}
              
              <label htmlFor="photoUpload" className="absolute bottom-0 left-0 right-0 flex cursor-pointer items-center justify-center bg-black/50 py-1.5 transition-colors hover:bg-black/70">
                <Camera size={16} className="text-white" />
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div className="text-center sm:text-left mt-2 sm:mt-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Profile Picture</h3>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                JPG, GIF or PNG. Max size of 2MB. Click camera icon to upload.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}><User size={14} /> Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className={labelClass}><Phone size={14} /> Phone Number</label>
              <input
                id="phoneNumber"
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g. 0712345678"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}><Mail size={14} /> Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                saving ? "cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}