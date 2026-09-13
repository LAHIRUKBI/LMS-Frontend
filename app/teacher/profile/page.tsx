"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import {
  Users, Search, Mail, BookOpen, IdCard, UserX, AlertCircle, Trash2, CheckCircle2,
  Phone, MapPin, Globe, X, Eye, Loader2, Key, User
} from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/app/components/BrandIcons";

export default function TeacherProfilePage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("token");
    try {
      const res = await axios.put("http://localhost:5000/api/teacher/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: res.data.message });

      setFormData(prev => ({ ...prev, password: "" }));

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.name = formData.name;
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

  return (
    <div className={`p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
            My Profile
          </h2>
          <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Update your account information, login credentials, and social media accounts here.
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
          <form onSubmit={handleUpdate} className="p-8 space-y-8">

            {/* Login Credentials */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-700" : "text-gray-800 border-gray-100"}`}>
                Login Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Teacher ID</label>
                  <div className="relative">
                    <IdCard size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="teacherId" value={formData.teacherId} onChange={handleChange} required
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>New Password</label>
                  <div className="relative">
                    <Key size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep unchanged"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500"}`}
                    />
                  </div>
                  <p className={`mt-1.5 text-xs ${darkMode ? "text-slate-500" : "text-gray-500"}`}>For security reasons, the password is not displayed here.</p>
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
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Full Name</label>
                  <div className="relative">
                    <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Email Address</label>
                  <div className="relative">
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Subject</label>
                  <div className="relative">
                    <BookOpen size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-700" : "text-gray-800 border-gray-100"}`}>
                Additional Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="07X XXX XXXX"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Address</label>
                  <div className="relative">
                    <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Town, City"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Personal Website</label>
                  <div className="relative">
                    <Globe size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..."
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Facebook Link</label>
                  <div className="relative">
                    <FacebookIcon size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..."
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Instagram Link</label>
                  <div className="relative">
                    <InstagramIcon size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..."
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:ring-2 ${darkMode ? "border-slate-700 bg-slate-800 text-white focus:ring-indigo-500" : "border-slate-300 bg-white text-gray-900 focus:ring-indigo-500"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors disabled:bg-indigo-400"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}