// src/app/admin/materials/quize_view/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Image as ImageIcon, User } from "lucide-react";

interface QuizSubmission {
  _id: string;
  teacherId: string | { _id: string; name: string; teacherId?: string; email?: string; profilePhoto?: string };
  title: string;
  description: string;
  duration: number;
  questions: Array<{
    id: string;
    type: string;
    questionText: string;
    imageUrl?: string;
    options: string[];
    correctAnswer: string;
    marks: number;
  }>;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  createdAt: string;
}

export default function AdminQuizViewPage() {
  const [quizzes, setQuizzes] = useState<QuizSubmission[]>([]);

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

  const handleUpdateStatus = async (quizId: string, status: "approved" | "rejected") => {
    let rejectReason = "";
    if (status === "rejected") {
      rejectReason = prompt("Please provide a reason for rejection:") || "No reason provided";
      if (!rejectReason) return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/quiz/admin/quizzes/${quizId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectReason }),
      });

      if (res.ok) {
        setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, status, rejectReason } : q));
        alert(`Quiz has been successfully ${status}.`);
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Quiz Review (Admin Quiz View)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review quizzes submitted by teachers, grant approval, or delete them.</p>
        </div>
      </div>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-gray-500 text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow">
            No quizzes available.
          </p>
        ) : (
          quizzes.map((quiz) => {
            const teacherObj = typeof quiz.teacherId === 'object' && quiz.teacherId !== null ? quiz.teacherId : null;
            const tName = teacherObj?.name || "Unknown Teacher";
            const tId = teacherObj?.teacherId || "N/A";
            const tPhoto = teacherObj?.profilePhoto;

            return (
              <div key={quiz._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-gray-700">
                      {tPhoto ? (
                        <img 
                          src={`http://localhost:5000/profile_photos/${tPhoto}`} 
                          alt={tName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-500 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <User size={12} /> Teacher: {tName} ({tId})
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{quiz.title}</h2>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{quiz.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Duration: {quiz.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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

                {/* Questions Preview */}
                <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Question List ({quiz.questions.length} available):</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {quiz.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg text-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {idx + 1}. {q.questionText}
                          </p>
                          <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded uppercase">
                            {q.type} ({q.marks} marks)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons for Pending */}
                {quiz.status === "pending" && (
                  <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                    <button
                      onClick={() => handleUpdateStatus(quiz._id, "rejected")}
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
            );
          })
        )}
      </div>
    </div>
  );
}