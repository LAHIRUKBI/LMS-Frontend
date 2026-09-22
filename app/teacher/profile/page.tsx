"use client";

import { useEffect, useState, useRef } from "react";
import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BookOpen,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  IdCard,
  Info,
  Key,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/app/components/BrandIcons";

interface Qualification {
  institution: string;
  degree: string;
  period: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Presentation helpers (UI only — no page logic)                    */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  icon: Icon,
  hint,
  required,
  darkMode,
  ...inputProps
}: {
  id: string;
  label: string;
  icon?: LucideIcon;
  hint?: string;
  required?: boolean;
  darkMode?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  const dynamicInputClass = darkMode
    ? "h-11 w-full rounded-xl border border-slate-700 bg-slate-950/40 pl-10 pr-4 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
    : "h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-[13px] font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="group relative">
        {Icon ? (
          <Icon
            size={16}
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              darkMode ? "text-slate-500 group-focus-within:text-teal-300" : "text-slate-400 group-focus-within:text-teal-600"
            }`}
          />
        ) : null}
        <input id={id} className={dynamicInputClass} {...inputProps} />
      </div>
      {hint ? (
        <p className={`mt-1.5 text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{hint}</p>
      ) : null}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  delay = 0,
  darkMode,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  delay?: number;
  darkMode?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`animate-rise overflow-hidden rounded-2xl border shadow-sm transition-colors duration-300 ${
        darkMode 
          ? "border-slate-800 bg-slate-900 text-slate-100" 
          : "border-slate-200/90 bg-white text-slate-900"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5 sm:px-7 ${
        darkMode ? "border-slate-800/70" : "border-slate-100"
      }`}>
        <div className="flex items-center gap-3.5">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${
            darkMode 
              ? "bg-teal-400/10 text-teal-300 ring-teal-300/10" 
              : "bg-teal-50 text-teal-700 ring-teal-600/10"
          }`}>
            <Icon size={19} />
          </span>
          <div>
            <h3 className={`font-display text-[15px] font-semibold tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {title}
            </h3>
            <p className={`mt-0.5 text-[13px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-6 sm:px-7 sm:py-7">{children}</div>
    </section>
  );
}

function Stat({ label, value, darkMode }: { label: string; value: string | number; darkMode: boolean }) {
  return (
    <div className="px-4 py-3.5 text-center sm:px-5">
      <p className={`font-display text-lg font-bold leading-none ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
        {value}
      </p>
      <p className={`mt-1.5 text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Teacher Profile Page                                              */
/* ------------------------------------------------------------------ */

export default function TeacherProfilePage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

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
        const res = await axios.get(`http://localhost:5000/api/teacher/profile`, {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

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

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("token");
    
    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      updateData.append(key, value);
    });
    
    updateData.append('qualifications', JSON.stringify(qualifications));
    
    if (photoFile) {
      updateData.append('profilePhoto', photoFile);
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/teacher/profile`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      setMessage({ type: "success", text: res.data.message });
      setFormData(prev => ({ ...prev, password: "" }));
      setPhotoFile(null); 

      const updatedTeacher = res.data.teacher;
      if (updatedTeacher?.profilePhoto) {
        setPhotoPreview(`http://localhost:5000/profile_photos/${updatedTeacher.profilePhoto}`);
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.name = formData.name;
      if(updatedTeacher?.profilePhoto) {
        userData.photo = updatedTeacher.profilePhoto;
        userData.profilePhoto = updatedTeacher.profilePhoto;
      }
      localStorage.setItem("user", JSON.stringify(userData));

      window.dispatchEvent(new Event("profileUpdated"));

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

  /* Derived presentation values (no logic changes) */
  const socialCount = [formData.website, formData.facebook, formData.instagram].filter(
    (v) => v.trim() !== ""
  ).length;
  const profileStrength = Math.round(
    (
      [formData.name, formData.email, formData.subject, formData.phone, formData.address].filter(
        (v) => v.trim() !== ""
      ).length +
      socialCount +
      (qualifications.length > 0 ? 1 : 0)
    ) / 9 * 100
  );

  const dynamicQualInputClass = darkMode
    ? "h-10 w-full rounded-lg border border-slate-700 bg-slate-950/40 px-3.5 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10"
    : "h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

  if (loading) {
    return (
      <div className={`flex min-h-[75vh] items-center justify-center transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#f4f6f8] text-slate-900"}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={`animate-spin ${darkMode ? "text-teal-400" : "text-teal-600"}`} size={36} />
          <p className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full transition-colors duration-300 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[#f4f6f8] text-slate-900"}`}>
      {/* Success / error toast */}
      {message.text && (
        <div
          className="fixed right-4 top-4 z-50 w-[min(92vw,380px)] animate-toast-in sm:right-6 sm:top-6"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md ${
              message.type === "success"
                ? "border-teal-200 bg-teal-50/95 text-teal-900 dark:border-teal-500/30 dark:bg-teal-950/90 dark:text-teal-100"
                : "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-500/30 dark:bg-rose-950/90 dark:text-rose-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-300" />
            ) : (
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-300" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {message.type === "success" ? "Profile saved" : "Something went wrong"}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug opacity-90">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page header */}
        <header className="mb-7 animate-rise">
          <h2 className={`font-display text-2xl font-bold tracking-tight sm:text-[28px] ${darkMode ? "text-white" : "text-slate-900"}`}>
            My Profile
          </h2>
          <p className={`mt-1.5 max-w-2xl text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Update your account information, login credentials, qualifications, and social
            media accounts here.
          </p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Profile hero */}
          <section
            className={`animate-rise overflow-hidden rounded-2xl border shadow-sm transition-colors duration-300 ${
              darkMode ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200/90 bg-white text-slate-900"
            }`}
            style={{ animationDelay: "40ms" }}
          >
            <div className="relative h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 sm:h-32">
              <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
            </div>

            <div className="px-6 pb-6 sm:px-8 sm:pb-7">
              <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
                <div className="relative group shrink-0 self-center sm:self-auto">
                  <div className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 shadow-lg ${
                    darkMode ? "border-slate-900 bg-slate-800" : "border-white bg-slate-100"
                  }`}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User size={44} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                    className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full bg-teal-600 text-white shadow-md ring-2 ring-white transition hover:scale-105 hover:bg-teal-700 dark:ring-slate-900"
                  >
                    <Camera size={17} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="min-w-0 flex-1 self-center pb-1 sm:pb-3 sm:self-auto">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className={`font-display text-xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {formData.name || "Teacher Name"}
                    </h3>
                    {formData.subject && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        darkMode ? "bg-teal-400/10 text-teal-300 ring-teal-300/10" : "bg-teal-50 text-teal-700 ring-teal-600/15"
                      }`}>
                        {formData.subject}
                      </span>
                    )}
                  </div>
                  <div className={`mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{formData.email || "—"}</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}>
                      <IdCard size={13} />
                      {formData.teacherId || "TCH-0000"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-sm transition ${
                      darkMode 
                        ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-teal-400 hover:text-teal-300" 
                        : "border-slate-300 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700"
                    }`}
                  >
                    <Camera size={13} />
                    Change photo
                    <span className={`font-normal ${darkMode ? "text-slate-500" : "text-slate-400"}`}>· JPG or PNG</span>
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className={`mt-6 grid grid-cols-3 divide-x overflow-hidden rounded-xl border ${
                darkMode ? "divide-slate-800 border-slate-800 bg-slate-950/40" : "divide-slate-200/80 border-slate-200/80 bg-slate-50/80"
              }`}>
                <Stat label="Qualifications" value={qualifications.length} darkMode={darkMode} />
                <Stat label="Social links" value={`${socialCount}/3`} darkMode={darkMode} />
                <div className="px-4 py-3.5 text-center sm:px-5">
                  <p className={`font-display text-lg font-bold leading-none ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {profileStrength}%
                  </p>
                  <div className={`mx-auto mt-2 h-1 w-full max-w-[72px] overflow-hidden rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>
                  <p className={`mt-1.5 text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Profile strength
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <SectionCard
            icon={User}
            title="Basic Information"
            description="Your core details, as they appear to students and administrators."
            delay={90}
            darkMode={darkMode}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                id="name"
                label="Full Name"
                icon={User}
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                darkMode={darkMode}
              />
              <Field
                id="email"
                label="Email Address"
                icon={Mail}
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                hint="Used for sign-in and important notifications."
                darkMode={darkMode}
              />
              <Field
                id="subject"
                label="Subject"
                icon={BookOpen}
                required
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                darkMode={darkMode}
              />
            </div>
          </SectionCard>

          {/* Login Credentials */}
          <SectionCard
            icon={Key}
            title="Login Credentials"
            description="Your teacher ID and account password."
            delay={140}
            darkMode={darkMode}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                id="teacherId"
                label="Teacher ID"
                icon={IdCard}
                required
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                hint="Your unique identifier in the LMS."
                darkMode={darkMode}
              />
              <div>
                <label
                  htmlFor="password"
                  className={`mb-1.5 block text-[13px] font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  New Password
                </label>
                <div className="group relative">
                  <Key
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      darkMode ? "text-slate-500 group-focus-within:text-teal-300" : "text-slate-400 group-focus-within:text-teal-600"
                    }`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep unchanged"
                    className={`${darkMode ? "h-11 w-full rounded-xl border border-slate-700 bg-slate-950/40 pl-10 pr-11 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10" : "h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition ${
                      darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Qualifications & Certificates (Dynamic Section) */}
          <SectionCard
            icon={GraduationCap}
            title="Qualifications & Certificates"
            description="Degrees, diplomas, and professional certifications."
            delay={190}
            darkMode={darkMode}
            action={
              <button
                type="button"
                onClick={addQualification}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold shadow-sm transition ${
                  darkMode 
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-teal-400 hover:bg-teal-400/10 hover:text-teal-300" 
                    : "border-slate-300 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50/60 hover:text-teal-700"
                }`}
              >
                <Plus size={15} />
                Add New
              </button>
            }
          >
            {qualifications.length === 0 ? (
              <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center ${
                darkMode ? "border-slate-700" : "border-slate-300"
              }`}>
                <span className={`grid h-12 w-12 place-items-center rounded-full ${
                  darkMode ? "bg-teal-400/10 text-teal-300" : "bg-teal-50 text-teal-600"
                }`}>
                  <GraduationCap size={22} />
                </span>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    No qualifications added yet.
                  </p>
                  <p className={`mt-1 text-[13px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Add your degrees and certificates so students can see your background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQualification}
                  className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700"
                >
                  <Plus size={15} />
                  Add your first qualification
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {qualifications.map((qual, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-5 ${
                      darkMode ? "border-slate-700/70 bg-slate-950/30" : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                          darkMode ? "bg-teal-400/15 text-teal-300" : "bg-teal-100 text-teal-700"
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`text-[13px] font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          Qualification {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className={`rounded-lg p-2 transition ${
                          darkMode ? "text-slate-400 hover:bg-rose-500/10 hover:text-rose-400" : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                        title="Remove"
                        aria-label={`Remove qualification ${index + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={`mb-1.5 block text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          University / Institute
                        </label>
                        <input
                          type="text"
                          value={qual.institution}
                          onChange={(e) => handleQualChange(index, "institution", e.target.value)}
                          placeholder="e.g. University of Colombo"
                          className={dynamicQualInputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Degree / Course
                        </label>
                        <input
                          type="text"
                          value={qual.degree}
                          onChange={(e) => handleQualChange(index, "degree", e.target.value)}
                          placeholder="e.g. BSc in Computer Science"
                          className={dynamicQualInputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Time Period
                        </label>
                        <input
                          type="text"
                          value={qual.period}
                          onChange={(e) => handleQualChange(index, "period", e.target.value)}
                          placeholder="e.g. 2018 - 2022"
                          className={dynamicQualInputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={qual.description}
                          onChange={(e) => handleQualChange(index, "description", e.target.value)}
                          placeholder="Additional details..."
                          className={dynamicQualInputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Additional Information & Socials */}
          <SectionCard
            icon={Globe}
            title="Contact & Social Media"
            description="How students and parents can reach you outside the LMS."
            delay={240}
            darkMode={darkMode}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                id="phone"
                label="Phone Number"
                icon={Phone}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07X XXX XXXX"
                darkMode={darkMode}
              />
              <Field
                id="address"
                label="Address"
                icon={MapPin}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Town, City"
                darkMode={darkMode}
              />
              <Field
                id="website"
                label="Personal Website"
                icon={Globe}
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                darkMode={darkMode}
              />
              <Field
                id="facebook"
                label="Facebook Link"
                icon={FacebookIcon as unknown as LucideIcon}
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                darkMode={darkMode}
              />
              <Field
                id="instagram"
                label="Instagram Link"
                icon={InstagramIcon as unknown as LucideIcon}
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                darkMode={darkMode}
              />
            </div>
          </SectionCard>

          {/* Sticky save bar */}
          <div className="sticky bottom-4 z-20">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-3 pl-5 shadow-lg backdrop-blur-md ${
              darkMode ? "border-slate-800 bg-slate-900/90 shadow-black/40" : "border-slate-200/90 bg-white/90 shadow-[0_12px_32px_rgba(2,6,23,0.10)]"
            }`}>
              <div className={`hidden items-center gap-2.5 text-[13px] sm:flex ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                <Info size={15} className={`shrink-0 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
                <span>
                  Your changes are stored securely once you click{" "}
                  <span className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Save</span>.
                </span>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}