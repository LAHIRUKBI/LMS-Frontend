// src/app/teacher/materials/quize_marks/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Clock, FileText, User, Eye, Search, CheckCircle2, AlertCircle, ArrowLeft, Check, X, Calendar, Trash2, Send } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import axios from "axios";

export default function TeacherQuizMarksPage() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentSub, setSelectedStudentSub] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherQuizzes();
  }, []);

  const fetchTeacherQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/quiz/my-quizzes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuizzes(res.data);
      if (res.data.length > 0) {
        setSelectedQuiz(res.data[0]);
        fetchSubmissions(res.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (quizId: string) => {
    setSubLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/quiz/${quizId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setSubmissions([]);
    } finally {
      setSubLoading(false);
    }
  };

  const handleQuizSelect = (quiz: any) => {
    setSelectedQuiz(quiz);
    fetchSubmissions(quiz._id);
  };

  const openStudentPaperModal = (sub: any) => {
    setSelectedStudentSub(sub);
    setModalOpen(true);
  };

  const openDeleteSubModal = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubToDelete(subId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!subToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/quiz/submission/${subToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModalOpen(false);
      setSubToDelete(null);
      if (selectedQuiz) {
        fetchSubmissions(selectedQuiz._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete submission.");
    }
  };

  // Send to Student Function
  const handleSendToStudent = async (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/quiz/submission/${subId}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        alert("Submission successfully sent to student profile!");
        if (selectedQuiz) {
          fetchSubmissions(selectedQuiz._id);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send submission to student.");
    }
  };


  // Send All to Students Function
  const handleSendAllToStudents = async () => {
    if (!selectedQuiz) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/quiz/${selectedQuiz._id}/send-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        alert("All submissions successfully sent to students!");
        fetchSubmissions(selectedQuiz._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send all submissions.");
    }
  };

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000${photoUrl}`;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const student = sub.studentId;
    if (!student) return false;
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-lg">
                <AlertCircle size={22} /> Confirm Submission Deletion
              </div>
              <button onClick={() => setDeleteModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={18} />
              </button>
            </div>
            <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              Are you sure you want to delete this student's submission? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button onClick={confirmDeleteSubmission} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && selectedStudentSub && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-4xl p-6 rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border">
                  {selectedStudentSub.studentId?.profileImage ? (
                    <img src={getStudentProfileImageUrl(selectedStudentSub.studentId.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">{selectedStudentSub.studentId?.name}'s Submission</h3>
                  <p className="text-xs text-slate-400">{selectedStudentSub.studentId?.email} • {selectedStudentSub.timeTaken}</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-2xl">
              <span className="text-xs font-bold text-indigo-400">Total Score Awarded:</span>
              <span className="text-sm font-extrabold text-indigo-500">
                {selectedStudentSub.score} / {selectedStudentSub.maxScore} Marks ({selectedStudentSub.isEvaluated ? "Evaluated" : "Pending"})
              </span>
            </div>

            <div className="space-y-4">
              {selectedQuiz.questions.map((q: any, qIdx: number) => {
                const qId = q._id.toString();
                const studentAnswers = selectedStudentSub.answers instanceof Map ? Object.fromEntries(selectedStudentSub.answers) : (selectedStudentSub.answers || {});
                const studentAns = String(studentAnswers[qId] || "No Answer Given").trim();
                const correctAns = String(q.correctAnswer || "").trim();
                
                const cleanStudent = studentAns.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanCorrect = correctAns.toLowerCase().replace(/[^a-z0-9]/g, '');
                const isCorrect = (q.type === 'mcq' || q.type === 'short') && (cleanStudent === cleanCorrect);

                return (
                  <div key={qId} className={`p-4 rounded-2xl border text-xs space-y-2 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <p className="font-bold text-sm">{qIdx + 1}. {q.questionText} <span className="opacity-60 text-[10px]">({q.type.toUpperCase()} - {q.marks || 5} Marks)</span></p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">Student Answer (Left):</span>
                        {q.type !== 'essay' ? (
                          <span className={isCorrect ? "text-emerald-500 font-bold flex items-center gap-1.5 text-sm" : "text-rose-500 font-bold flex items-center gap-1.5 text-sm"}>
                            {isCorrect ? <Check size={16} /> : <X size={16} />}
                            {studentAns} {isCorrect ? "(Correct ✅)" : "(Incorrect ❌)"}
                          </span>
                        ) : (
                          <span className="text-slate-200 font-medium text-sm">{studentAns}</span>
                        )}
                      </div>

                      {q.type !== 'essay' && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 block font-bold mb-1">Teacher's Answer Key (Right):</span>
                          <span className="text-emerald-400 font-bold text-sm">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Student Quiz Marks & Submissions</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Select a quiz to view student performance, scores, and review their submitted answer papers.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-sm animate-pulse text-blue-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <Award size={48} className="mx-auto mb-3 text-slate-400 opacity-50" />
            <h3 className="text-base font-bold">No quizzes found</h3>
            <p className="text-xs text-slate-400 mt-1">You haven't created any quizzes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            <div className={`lg:col-span-1 p-4 rounded-3xl border space-y-3 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Select Quiz</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {quizzes.map((quiz) => {
                  const isSelected = selectedQuiz?._id === quiz._id;
                  return (
                    <div
                      key={quiz._id}
                      onClick={() => handleQuizSelect(quiz)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" 
                          : (darkMode ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700")
                      }`}
                    >
                      <h4 className="font-bold text-sm line-clamp-1">{quiz.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] opacity-80">
                        <Clock size={12} /> {quiz.duration} mins • {quiz.questions?.length || 0} Qs
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`lg:col-span-3 p-6 rounded-3xl border space-y-6 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
              
              {selectedQuiz && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-extrabold">{selectedQuiz.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedQuiz.description || "No description provided."}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleSendAllToStudents}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Send size={14} /> Send All to Students
                    </button>

                    <div className="relative w-full sm:w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {subLoading ? (
                <div className="text-center py-16">
                  <p className="text-xs animate-pulse text-blue-500">Loading student submissions...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs italic">
                  No student submissions found for this quiz yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                        <th className="pb-3 font-bold">Student Name</th>
                        <th className="pb-3 font-bold">Email</th>
                        <th className="pb-3 font-bold">Time Taken</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Score</th>
                        <th className="pb-3 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredSubmissions.map((sub) => {
                        const student = sub.studentId;
                        if (!student) return null;

                        return (
                          <tr key={sub._id} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-3.5 font-bold flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border shrink-0">
                                {student.profileImage ? (
                                  <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User size={14} className="text-slate-500" />
                                )}
                              </div>
                              <span className="truncate">{student.name}</span>
                            </td>
                            <td className="py-3.5 text-slate-400">{student.email}</td>
                            <td className="py-3.5 opacity-80">{sub.timeTaken}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                sub.isEvaluated 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {sub.isEvaluated ? "Evaluated" : "Pending"}
                              </span>
                            </td>
                            <td className="py-3.5 font-extrabold text-right text-blue-600 dark:text-blue-400">
                              {sub.score} / {sub.maxScore}
                            </td>
                            <td className="py-3.5 text-center flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openStudentPaperModal(sub)}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all inline-flex items-center gap-1 text-[11px]"
                              >
                                <Eye size={12} /> Review
                              </button>
                              
                              {/* Send to Student Button */}
                              <button
                                onClick={(e) => handleSendToStudent(sub._id, e)}
                                disabled={sub.isSentToStudent}
                                title="Send score and paper to student profile"
                                className={`px-2.5 py-1.5 rounded-xl font-bold shadow-sm transition-all inline-flex items-center gap-1 text-[11px] ${
                                  sub.isSentToStudent 
                                    ? "bg-slate-500/20 text-slate-400 cursor-not-allowed" 
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                              >
                                <Send size={12} /> {sub.isSentToStudent ? "Sent" : "Send to Student"}
                              </button>

                              <button
                                onClick={(e) => openDeleteSubModal(sub._id, e)}
                                title="Delete Submission"
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}