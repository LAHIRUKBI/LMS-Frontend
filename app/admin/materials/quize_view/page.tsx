// src/app/admin/materials/quize_view/page.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { CheckCircle, XCircle, Trash2, Image as ImageIcon, User, Eye, X } from "lucide-react";
import axios from "axios";

interface SubQuestion {
  _id?: string;
  subQuestionText: string;
  marks: number;
}

interface Question {
  id: string;
  type: "mcq" | "single" | "short" | "essay";
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: any;
  marks: number;
  subQuestions?: SubQuestion[];
}

interface QuizSubmission {
  _id: string;
  teacherId: string | { _id: string; name: string; teacherId?: string; email?: string; profilePhoto?: string };
  title: string;
  description: string;
  duration: number;
  questions: Question[];
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  createdAt: string;
  isNewForTable?: boolean;
}

export default function AdminQuizViewPage() {
  const [quizzes, setQuizzes] = useState<QuizSubmission[]>([]);
  // State for controlling the popup modal to view questions
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<QuizSubmission | null>(null);

  // States for Rejection Modal
  const [rejectQuizItem, setRejectQuizItem] = useState<QuizSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/quiz/admin/quizzes", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Error fetching quizzes:", err));
  };

  // The function to remove the dot
  const handleClearQuizDot = async (quizId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/quiz/admin/${quizId}/clear-dot`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, isNewForTable: false } : q));
    } catch (error) {
      console.error("Error clearing quiz dot:", error);
    }
  };

  const handleUpdateStatus = async (quizId: string, status: "approved") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/quiz/admin/quizzes/${quizId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectReason: "" }),
      });

      if (res.ok) {
        setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, status, rejectReason: "" } : q));
        alert(`Quiz has been successfully ${status}.`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handler for confirming quiz rejection with reason
  const handleConfirmReject = async () => {
    if (!rejectQuizItem) return;
    const finalReason = rejectReason.trim() || "No reason provided";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/quiz/admin/quizzes/${rejectQuizItem._id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "rejected", rejectReason: finalReason }),
      });

      if (res.ok) {
        setQuizzes(quizzes.map(q => q._id === rejectQuizItem._id ? { ...q, status: "rejected", rejectReason: finalReason } : q));
        setRejectQuizItem(null);
        setRejectReason("");
        alert("Quiz has been successfully rejected.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/quiz/admin/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setQuizzes(quizzes.filter(q => q._id !== quizId));
        alert("Quiz deleted successfully by Admin.");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  // Group quizzes by Teacher Object so teacher details are not repeated for each quiz
  const groupedQuizzes = useMemo(() => {
    return quizzes.reduce((acc: any, quiz: any) => {
      const teacherObj = typeof quiz.teacherId === 'object' && quiz.teacherId !== null ? quiz.teacherId : { _id: 'unknown', name: "Unknown Teacher" };
      const teacherKey = teacherObj._id || 'unknown';
      if (!acc[teacherKey]) {
        acc[teacherKey] = {
          teacherInfo: teacherObj,
          items: []
        };
      }
      acc[teacherKey].items.push(quiz);
      return acc;
    }, {});
  }, [quizzes]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Quiz Review (Admin Quiz View)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review quizzes submitted by teachers, grant approval, or delete them.</p>
        </div>
      </div>

      {/* Questions Popup Modal */}
      {selectedQuizForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Question List</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedQuizForQuestions.title} ({selectedQuizForQuestions.questions.length} questions)</p>
              </div>
              <button 
                onClick={() => setSelectedQuizForQuestions(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {selectedQuizForQuestions.questions.map((q, idx) => {
                let totalQMarks = q.marks;
                if (q.type === 'essay' && q.subQuestions) {
                  totalQMarks = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
                }

                return (
                  <div key={q.id || idx} className="p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {idx + 1}. {q.questionText}
                      </p>
                      <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded uppercase flex-shrink-0 ml-2">
                        {q.type} ({totalQMarks} marks)
                      </span>
                    </div>

                    {q.imageUrl && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <ImageIcon size={14} /> Attached Image:
                        </span>
                        <img 
                          src={`http://localhost:5000${q.imageUrl}`} 
                          alt="Question Visual" 
                          className="max-h-40 rounded border border-gray-700 object-contain" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* MCQ or Single Options */}
                    {(q.type === 'mcq' || q.type === 'single') && q.options && q.options.length > 0 && (
                      <div className="space-y-1 mt-2 pl-2 border-l-2 border-blue-400">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Options:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.type === 'mcq' 
                              ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))
                              : (q.correctAnswer === opt);

                            return (
                              <li key={optIdx} className={`text-xs p-2 rounded border dark:border-gray-700 ${isCorrect ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                                <span className="font-bold mr-1">({optIdx + 1})</span> {opt} {isCorrect && "✅"}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Essay Sub-questions */}
                    {q.type === 'essay' && q.subQuestions && (
                      <div className="space-y-1 mt-2 pl-2 border-l-2 border-blue-400">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sub-Questions:</p>
                        <div className="space-y-1">
                          {q.subQuestions.map((sq, sqIdx) => (
                            <div key={sq._id || sqIdx} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700 flex justify-between items-center text-gray-700 dark:text-gray-300">
                              <span><strong>({sqIdx + 1})</strong> {sq.subQuestionText}</span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">[{sq.marks} marks]</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t dark:border-gray-800">
                      {q.type === 'mcq' && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-800 border dark:border-gray-700 px-2 py-1 rounded inline-block">
                          🔒 Correct Answers: <span className="font-semibold text-gray-900 dark:text-white">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                        </p>
                      )}
                      {(q.type === 'single' || q.type === 'short') && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-800 border dark:border-gray-700 px-2 py-1 rounded inline-block">
                          🔒 Correct Answer: <span className="font-semibold text-gray-900 dark:text-white">{q.correctAnswer}</span>
                        </p>
                      )}
                      {q.type === 'essay' && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-800 border dark:border-gray-700 px-2 py-1 rounded inline-block">
                          📝 Structured Essay Question (Evaluated by Teacher)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t dark:border-gray-700">
              <button 
                onClick={() => setSelectedQuizForQuestions(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold transition hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectQuizItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Reason for Rejection</h3>
            <p className="text-xs mb-3 text-slate-500 dark:text-slate-400">Please provide a valid reason so the teacher can correct the quiz.</p>
            <textarea
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-xs transition-all bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:ring-red-500"
              rows={3}
              placeholder="State the reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2.5 mt-4">
              <button 
                onClick={() => { setRejectQuizItem(null); setRejectReason(""); }} 
                className="px-4 py-2 font-bold text-xs rounded-xl transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReject} 
                className="px-4 py-2 font-bold text-xs bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-sm transition-all"
              >
                Reject Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedQuizzes).length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow">
            No quizzes available.
          </p>
        ) : (
          Object.values(groupedQuizzes).map((group: any) => {
            const tName = group.teacherInfo.name || "Unknown Teacher";
            const tId = group.teacherInfo.teacherId || "N/A";
            const tEmail = group.teacherInfo.email || "N/A";
            const tPhoto = group.teacherInfo.profilePhoto;

            return (
              <div key={group.teacherInfo._id || 'unknown'} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm p-6 space-y-4">
                {/* Teacher Header Bar (Rendered only once per teacher) */}
                <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-gray-700">
                      {tPhoto ? (
                        <img 
                          src={`http://localhost:5000/profile_photos/${tPhoto}`} 
                          alt={tName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-gray-500 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{tName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {group.items.length} {group.items.length === 1 ? 'Quiz' : 'Quizzes'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {tId} • {tEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Quizzes List under this teacher */}
                <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                  {group.items.map((quiz: QuizSubmission) => (
                    <div 
                      key={quiz._id} 
                      onClick={() => quiz.isNewForTable && handleClearQuizDot(quiz._id)} 
                      className={`relative transition-all border dark:border-gray-700 rounded-xl shadow-sm p-5 space-y-4 ${
                        quiz.isNewForTable 
                          ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 cursor-pointer" 
                          : "bg-gray-50/50 dark:bg-gray-900/50"
                      }`}
                    >
                      {/* The red Pulse Dot */}
                      {quiz.isNewForTable && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-10" title="New Quiz">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-sm border-2 border-white dark:border-slate-900"></span>
                        </span>
                      )}

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{quiz.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Duration: {quiz.duration} minutes</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            quiz.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                            quiz.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                          }`}>
                            {quiz.status}
                          </span>
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg transition"
                            title="Delete Quiz"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* View Questions Button to open modal */}
                      <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total Questions: <strong>{quiz.questions.length}</strong>
                        </span>
                        <button
                          onClick={() => setSelectedQuizForQuestions(quiz)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
                        >
                          <Eye size={14} /> View Questions
                        </button>
                      </div>

                      {/* Action Buttons for Pending */}
                      {quiz.status === "pending" && (
                        <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                          <button
                            onClick={() => setRejectQuizItem(quiz)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-100 font-medium flex items-center gap-1 text-sm transition"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(quiz._id, "approved")}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-1 text-sm transition shadow"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}