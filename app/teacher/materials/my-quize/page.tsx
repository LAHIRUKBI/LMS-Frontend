// src/app/teacher/materials/my-quize/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Globe, FileText, Trash2, AlertCircle, Image as ImageIcon, X } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import axios from "axios";

interface Question {
  id: string;
  type: string;
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  duration: number;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  isPublished: boolean;
  questions: Question[];
  createdAt: string;
}

export default function TeacherMyQuizzesPage() {
  const { darkMode } = useTheme();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete Popup Modal සඳහා State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const fetchMyQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/quiz/my-quizzes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching my quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const handlePublishQuiz = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/quiz/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        fetchMyQuizzes();
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || "Failed to publish quiz.");
    }
  };

  // Delete Popup එක විවෘත කිරීම
  const openDeleteModal = (id: string) => {
    setQuizToDelete(id);
    setDeleteModalOpen(true);
  };

  // Delete කිරීම තහවුරු කිරීම (Browser alert වෙනුවට Modal හරහා ක්‍රියාත්මක වේ)
  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/quiz/${quizToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModalOpen(false);
      setQuizToDelete(null);
      fetchMyQuizzes();
    } catch (err: any) {
      console.error(err.response?.data?.message || "Failed to delete quiz.");
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My Quizzes</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Manage your created quizzes, check admin approval status, view rejection reasons, and publish them.
            </p>
          </div>
        </div>

        {/* Delete Confirmation Modal (පිටුව මැද පෙන්වන Pop-up එක - localhost says ඉවත් කර ඇත) */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-lg">
                  <AlertCircle size={22} /> Confirm Deletion
                </div>
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Are you sure you want to delete this quiz? This action cannot be undone and it will be permanently removed from the system.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <p className="text-sm animate-pulse text-indigo-500">Loading your quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <FileText size={40} className="mx-auto mb-3 text-slate-400 opacity-50" />
            <h3 className="text-base font-bold">No quizzes found</h3>
            <p className="text-xs text-slate-400 mt-1">You haven't created any quizzes yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div 
                key={quiz._id} 
                className={`p-6 rounded-2xl border shadow-sm transition-all space-y-4 ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{quiz.title}</h2>
                    <p className={`text-xs mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {quiz.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {quiz.duration} minutes
                      </span>
                      <span>•</span>
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      quiz.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      quiz.status === "rejected" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                      "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      Admin: {quiz.status}
                    </span>

                    {quiz.status === "approved" && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        quiz.isPublished 
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {quiz.isPublished ? "Published" : "Draft (Unpublished)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reject Reason Box */}
                {quiz.status === "rejected" && quiz.rejectReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Rejection Reason:</strong> {quiz.rejectReason}</span>
                  </div>
                )}

                {/* Questions and Answers Preview List */}
                <div className={`border-t pt-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Questions & Answers Details:</h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {quiz.questions.map((q, idx) => (
                      <div key={`${quiz._id}-question-${idx}`} className={`p-4 rounded-xl border text-xs space-y-2 ${darkMode ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm">
                            {idx + 1}. {q.questionText}
                          </p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {q.type} ({q.marks} marks)
                          </span>
                        </div>

                        {/* Image Preview if available (සර්වර් එකේ ඇති Quize_images ෆෝල්ඩරයෙන් රූපය පෙන්වීම) */}
                        {q.imageUrl && (
                          <div className="mt-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                              <ImageIcon size={12} /> Attached Image:
                            </span>
                            <img 
                              src={`http://localhost:5000${q.imageUrl}`} 
                              alt="Question Visual" 
                              className="max-h-32 rounded border border-slate-700 object-contain" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                        )}

                        {/* MCQ Options */}
                        {q.type === 'mcq' && q.options && q.options.length > 0 && (
                          <div className="space-y-1 mt-2 pl-2 border-l-2 border-indigo-500/40">
                            <p className="text-[11px] font-semibold text-slate-400">Options:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, optIdx) => (
                                <li key={optIdx} className={`p-2 rounded border text-xs ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                                  <span className="font-bold mr-1">({optIdx + 1})</span> {opt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Correct Answer */}
                        <div className="mt-2 pt-2 border-t border-slate-500/20">
                          <span className="font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded inline-block text-[11px]">
                            ✅ Correct Answer: <strong className="text-emerald-400">{q.correctAnswer}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={`flex justify-between items-center pt-3 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <button
                    onClick={() => openDeleteModal(quiz._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>

                  <div>
                    {quiz.status === "approved" && !quiz.isPublished && (
                      <button
                        onClick={() => handlePublishQuiz(quiz._id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                      >
                        <Globe size={14} /> Publish to Students
                      </button>
                    )}

                    {quiz.isPublished && (
                      <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                        <CheckCircle size={14} /> Live for Students
                      </span>
                    )}

                    {quiz.status === "pending" && (
                      <span className="text-xs italic text-amber-500">
                        Waiting for admin review & approval...
                      </span>
                    )}

                    {quiz.status === "rejected" && (
                      <span className="text-xs italic text-rose-500">
                        Please update and re-submit based on feedback.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}