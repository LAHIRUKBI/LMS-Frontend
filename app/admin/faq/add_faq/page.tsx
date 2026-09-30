"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "@/app/context/ThemeContext";
import { HelpCircle, CheckCircle2, AlertCircle, Plus, Loader2, Trash2, Send, MessageSquare } from "lucide-react";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  studentName?: string;
  studentEmail?: string;
}

export default function AddFAQPage() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({ question: "", answer: "" });
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  
  // ඇඩ්මින් විසින් තාවකාලිකව ලියන replies ගබඩා කිරීමට (FAQ ID එක මඟින් මාව දැක්වීමට)
  const [replies, setReplies] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/faqs/admin-all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(res.data);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReplyChange = (id: string, text: string) => {
    setReplies({ ...replies, [id]: text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/faqs/add", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(res.data.message || "FAQ added successfully!");
      setFormData({ question: "", answer: "" });
      fetchFAQs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add FAQ.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishMessage = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const replyText = replies[id] || ""; // ඇඩ්මින් ලියූ reply එක

      const res = await axios.put(`http://localhost:5000/api/faqs/${id}/publish`, { answer: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(res.data.message || "Successfully posted to FAQ!");
      fetchFAQs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish.");
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Deleted successfully!");
      fetchFAQs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete.");
    }
  };

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-base outline-none transition-all duration-200 focus:ring-2 ${
    darkMode
      ? "border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/40"
      : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
  }`;

  const studentInquiries = faqs.filter(f => !f.isPublished);
  const publishedFAQs = faqs.filter(f => f.isPublished);

  return (
    <div className={`mx-auto max-w-4xl p-6 lg:p-8 min-h-screen ${darkMode ? "text-white" : "text-slate-900"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Manage FAQs & Messages</h1>
          <p className={`mt-1 text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Create FAQs and reply to student inquiries.
          </p>
        </div>
      </div>

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

      {/* Add FAQ Form Card */}
      <div className={`rounded-2xl border p-6 shadow-sm sm:p-8 mb-10 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <h2 className="text-lg font-bold mb-4">Add New FAQ</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Question</label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="e.g. How do I access course materials?"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Answer</label>
            <textarea
              name="answer"
              rows={4}
              value={formData.answer}
              onChange={handleChange}
              placeholder="Provide a clear answer..."
              className={inputClass}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-700 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {loading ? "Adding..." : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>

      {/* Student Inquiries Section with Reply Option */}
      <div className={`rounded-2xl border p-6 shadow-sm sm:p-8 mb-10 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-orange-500" /> Student Inquiries / Messages
        </h2>

        {fetching ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : studentInquiries.length === 0 ? (
          <p className="text-sm text-slate-400">No new student inquiries.</p>
        ) : (
          <div className="space-y-6">
            {studentInquiries.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-xl border transition-colors ${
                  darkMode ? "border-slate-800 bg-slate-800/40" : "border-orange-100 bg-orange-50/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-orange-600">Q: {item.question}</h3>
                    <p className="text-xs text-slate-500">From: <span className="font-semibold">{item.studentName}</span> ({item.studentEmail})</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFAQ(item._id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors self-start sm:self-auto"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className={`text-sm mt-2 mb-4 leading-relaxed p-3 rounded-lg ${darkMode ? "bg-slate-900/60 text-slate-300" : "bg-white text-slate-700 border border-slate-100"}`}>
                  <span className="font-bold block text-xs text-slate-400 uppercase mb-1">Student Message:</span>
                  {item.answer}
                </p>

                {/* Reply Input Box */}
                <div className="mt-3 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Write Admin Reply / Answer for FAQ</label>
                  <textarea
                    rows={3}
                    value={replies[item._id] !== undefined ? replies[item._id] : ""}
                    onChange={(e) => handleReplyChange(item._id, e.target.value)}
                    placeholder="Type the official answer to be published on the FAQ page..."
                    className={inputClass}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handlePublishMessage(item._id)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-green-700 transition-all active:scale-95"
                    >
                      <Send size={14} /> Post to FAQ with Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published FAQs List Section */}
      <div className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <h2 className="text-lg font-bold mb-6">Published FAQs in System</h2>

        {fetching ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : publishedFAQs.length === 0 ? (
          <p className="text-sm text-slate-400">No published FAQs found.</p>
        ) : (
          <div className="space-y-4">
            {publishedFAQs.map((faq) => (
              <div
                key={faq._id}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${
                  darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"
                }`}
              >
                <div>
                  <h3 className="font-bold text-base mb-1">{faq.question}</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {faq.answer}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteFAQ(faq._id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}