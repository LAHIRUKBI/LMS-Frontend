"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import {
  Users, Search, Mail, BookOpen, IdCard, UserX, AlertCircle, Trash2, CheckCircle2,
  Phone, MapPin, Globe, X, Eye, Loader2, Key, User, Camera, GraduationCap, Plus
} from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/app/components/BrandIcons";

interface Qualification {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

export default function TeacherProfilePage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    email: "",
    subject: "",
    phone: "",
    address: "",
    website: "",
    facebook: "",
    instagram: "",
    password: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        setFormData({
          teacherId: data.teacherId || "",
          name: data.name || "",
          email: data.email || "",
          subject: data.subject || "",
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          password: ""
        });

        if (data.qualifications) {
          setQualifications(data.qualifications);
        }

        if (data.profilePhoto) {
          // Backend එකෙන් image එක ගන්නා URL එක
          setPhotoPreview(`http://localhost:5000/profile_photos/${data.profilePhoto}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); // Show preview instantly
    }
  };

  // Qualifications functions
  const addQualification = () => {
    setQualifications([...qualifications, { institution: "", degree: "", period: "", description: "" }]);
  };

  const removeQualification = (index: number) => {
    const updated = [...qualifications];
    updated.splice(index, 1);
    setQualifications(updated);
  };

  const handleQualChange = (index: number, field: keyof Qualification, value: string) => {
    const updated = [...qualifications];
    updated[index][field] = value;
    setQualifications(updated);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("token");
    
    // File upload එකක් ඇති නිසා FormData භාවිතා කිරීම අනිවාර්යයි
    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      updateData.append(key, value);
    });
    
    updateData.append('qualifications', JSON.stringify(qualifications));
    
    if (photoFile) {
      updateData.append('profilePhoto', photoFile);
    }

    try {
      const res = await axios.put("http://localhost:5000/api/teacher/profile", updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      setMessage({ type: "success", text: res.data.message });
      setFormData(prev => ({ ...prev, password: "" }));
      setPhotoFile(null); // Clear file input state after success

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.name = formData.name;
      if(res.data.teacher?.profilePhoto) userData.photo = res.data.teacher.profilePhoto;
      localStorage.setItem("user", JSON.stringify(userData));

      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "An error occurred while updating."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const inputClass = `w-full rounded-lg border py-2.5 px-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`;
  const labelClass = `block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
            My Profile
          </h2>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Update your account information, login credentials, qualifications, and social media accounts here.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 flex items-center gap-2.5 rounded-lg border p-4 text-sm font-medium ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className={`rounded-2xl border shadow-sm ${darkMode ? "border-slate-800 bg-[#0F172A]" : "border-slate-200 bg-white"}`}>
          <form onSubmit={handleUpdate} className="p-8 space-y-10">
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b pb-8 border-gray-200 dark:border-slate-700">
              <div className="relative group">
                <div className={`h-32 w-32 rounded-full overflow-hidden border-4 flex items-center justify-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-white shadow-lg bg-gray-100'}`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={48} className={darkMode ? "text-slate-500" : "text-gray-400"} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left mt-2 sm:mt-4">
                <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{formData.name || "Teacher Name"}</h3>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{formData.email}</p>
                <p className={`text-xs mt-2 px-2.5 py-1 rounded-full inline-block ${darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                  Profile Photo (JPG, PNG)
                </p>
              </div>
            </div>

            {/* Login Credentials */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-700" : "text-gray-800 border-gray-100"}`}>
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Teacher ID</label>
                  <div className="relative">
                    <IdCard size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="teacherId" value={formData.teacherId} onChange={handleChange} required className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <Key size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep unchanged" className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-700" : "text-gray-800 border-gray-100"}`}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <div className="relative">
                    <BookOpen size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications & Certificates (Dynamic Section) */}
            <div>
              <div className={`flex items-center justify-between mb-4 border-b pb-2 ${darkMode ? "border-slate-700" : "border-gray-100"}`}>
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  <GraduationCap size={20} /> Qualifications & Certificates
                </h3>
                <button type="button" onClick={addQualification} className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  <Plus size={16} /> Add New
                </button>
              </div>

              {qualifications.length === 0 ? (
                <p className={`text-sm italic ${darkMode ? "text-slate-500" : "text-gray-500"}`}>No qualifications added yet.</p>
              ) : (
                <div className="space-y-6">
                  {qualifications.map((qual, index) => (
                    <div key={index} className={`relative p-5 rounded-xl border ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-gray-50"}`}>
                      <button type="button" onClick={() => removeQualification(index)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors p-1" title="Remove">
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>University / Institute</label>
                          <input type="text" value={qual.institution} onChange={(e) => handleQualChange(index, "institution", e.target.value)} placeholder="e.g. University of Colombo" className={inputClass} required />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Degree / Course</label>
                          <input type="text" value={qual.degree} onChange={(e) => handleQualChange(index, "degree", e.target.value)} placeholder="e.g. BSc in Computer Science" className={inputClass} required />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Time Period</label>
                          <input type="text" value={qual.period} onChange={(e) => handleQualChange(index, "period", e.target.value)} placeholder="e.g. 2018 - 2022" className={inputClass} required />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Description (Optional)</label>
                          <input type="text" value={qual.description} onChange={(e) => handleQualChange(index, "description", e.target.value)} placeholder="Additional details..." className={inputClass} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-700" : "text-gray-800 border-gray-100"}`}>
                Additional Information & Socials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="07X XXX XXXX" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <div className="relative">
                    <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Town, City" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Personal Website</label>
                  <div className="relative">
                    <Globe size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Facebook Link</label>
                  <div className="relative">
                    <FacebookIcon size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Instagram Link</label>
                  <div className="relative">
                    <InstagramIcon size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-indigo-400 shadow-md"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}