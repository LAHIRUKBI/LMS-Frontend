// src/app/teacher/materials/my-quize/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Globe, FileText, Trash2, AlertCircle, Image as ImageIcon, X, Check, Eye, User, CheckSquare, Calculator } from "lucide-react";
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
  classIds?: any[];
  questions: Question[];
  createdAt: string;
}

export default function TeacherMyQuizzesPage() {
  const { darkMode } = useTheme();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedQuizForPublish, setSelectedQuizForPublish] = useState<QuizItem | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedQuizSubmissions, setSelectedQuizSubmissions] = useState<any[]>([]);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<any>(null);
  const [essayMarksInput, setEssayMarksInput] = useState<{ [key: string]: { [qId: string]: number } }>({});
  
  const [checkedPapers, setCheckedPapers] = useState<{ [subId: string]: boolean }>({});

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

  const fetchTeacherClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/classes/my-classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeacherClasses(res.data);
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
    fetchTeacherClasses();
  }, []);

  const openPublishModal = (quiz: QuizItem) => {
    setSelectedQuizForPublish(quiz);
    setSelectedClassIds(quiz.classIds ? quiz.classIds.map((c: any) => c._id || c) : []);
    setPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedQuizForPublish) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/quiz/${selectedQuizForPublish._id}/publish`, {
        classIds: selectedClassIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setPublishModalOpen(false);
        setSelectedQuizForPublish(null);
        fetchMyQuizzes();
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || "Failed to publish quiz.");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/quiz/${id}/publish`, {
        classIds: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        fetchMyQuizzes();
      }
    } catch (err: any) {
      console.error("Failed to unpublish quiz.");
    }
  };

  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const openDeleteModal = (id: string) => {
    setQuizToDelete(id);
    setDeleteModalOpen(true);
  };

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

  const openSubmissionsModal = async (quiz: any) => {
    setSelectedQuizDetails(quiz);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/quiz/${quiz._id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedQuizSubmissions(res.data);
      setCheckedPapers({});
      setSubmissionsModalOpen(true);
    } catch (err) {
      alert("ප්‍රතිචාර ලබාගැනීමේ දෝෂයක් මතු විය.");
    }
  };

  // Check MCQ බොත්තම එබූ විට ක්‍රියාත්මක වේ
  const handleCheckMCQ = (subId: string) => {
    setCheckedPapers({ ...checkedPapers, [subId]: true });
  };

  const handleEssayMarkChange = (subId: string, qId: string, val: number) => {
    setEssayMarksInput({
      ...essayMarksInput,
      [subId]: {
        ...(essayMarksInput[subId] || {}),
        [qId]: val
      }
    });
  };

  // Calculate & Finish (Save to DB)
  const calculateAndSaveMarks = async (subId: string) => {
    try {
      const token = localStorage.getItem("token");
      const marks = essayMarksInput[subId] || {};
      const res = await axios.post(`http://localhost:5000/api/quiz/evaluate-essay`, {
        submissionId: subId,
        essayMarks: marks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("ලකුණු සාර්ථකව ගණනය කර දත්ත ගබඩාවේ තැන්පත් කරන ලදී!");
      setSelectedQuizSubmissions(selectedQuizSubmissions.map(s => s._id === subId ? res.data.sub : s));
    } catch (err) {
      alert("ලකුණු ගණනය කිරීම අසාර්ථක විය.");
    }
  };

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000${photoUrl}`;
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Submissions Evaluation Modal */}
      {submissionsModalOpen && selectedQuizDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-4xl p-6 rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-xl font-extrabold">{selectedQuizDetails.title} - Student Papers</h3>
                <p className="text-xs text-slate-400">Click 'Check MCQ' to verify answers, grade essay questions, calculate total score and save.</p>
              </div>
              <button onClick={() => setSubmissionsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>

            {selectedQuizSubmissions.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm italic">No students have submitted this quiz yet.</p>
            ) : (
              <div className="space-y-6">
                {selectedQuizSubmissions.map((sub) => {
                  const student = sub.studentId;
                  if (!student) return null;

                  const isChecked = checkedPapers[sub._id] || false;
                  const studentAnswers = sub.answers instanceof Map ? Object.fromEntries(sub.answers) : (sub.answers || {});

                  return (
                    <div key={sub._id} className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border">
                            {student.profileImage ? (
                              <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={18} className="text-slate-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{student.name}</h4>
                            <p className="text-[11px] text-slate-400">{student.email} • {sub.timeTaken}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Total Score: {sub.score} / {sub.maxScore} Marks
                          </span>
                        </div>
                      </div>

                      {/* Check MCQ Button */}
                      {!isChecked ? (
                        <div className="my-3">
                          <button 
                            onClick={() => handleCheckMCQ(sub._id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                          >
                            <CheckSquare size={16} /> Check MCQ
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pl-2 border-l-2 border-blue-500/40 my-3">
                          <p className="text-xs font-bold text-emerald-500">✔ MCQ Checked against teacher's answer key:</p>
                          {selectedQuizDetails.questions.map((q: any, qIdx: number) => {
                            const qId = q._id.toString();
                            const studentAns = String(studentAnswers[qId] || "No Answer Given").trim();
                            const correctAns = String(q.correctAnswer || "").trim();

                            // පිළිතුරු නිවැරදිව සංසන්දනය කිරීම සඳහා මුල් අකුර හෝ ප්‍රධාන වචනය පරීක්ෂා කිරීම (උදා: 'B' හෝ 'RAM')
                            const studentFirstChar = studentAns.charAt(0).toLowerCase();
                            const correctFirstChar = correctAns.charAt(0).toLowerCase();
                            
                            const cleanStudent = studentAns.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const cleanCorrect = correctAns.toLowerCase().replace(/[^a-z0-9]/g, '');

                            const isCorrect = (q.type === 'mcq' || q.type === 'short') && (
                              studentFirstChar === correctFirstChar || 
                              cleanStudent === cleanCorrect || 
                              cleanStudent.includes(cleanCorrect) || 
                              cleanCorrect.includes(cleanStudent)
                            );

                            return (
                              <div key={qId} className={`p-3 rounded-xl border text-xs space-y-1 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                                <p className="font-bold">{qIdx + 1}. {q.questionText} <span className="opacity-60 text-[10px]">({q.type.toUpperCase()})</span></p>
                                <div className="flex flex-wrap gap-x-4">
                                  {q.type !== 'essay' ? (
                                    <span className={isCorrect ? "text-emerald-500 font-bold flex items-center gap-1" : "text-rose-500 font-bold flex items-center gap-1"}>
                                      {isCorrect ? <Check size={14} /> : <X size={14} />}
                                      Student Answer: {studentAns} {isCorrect ? "(Correct ✅)" : "(Incorrect ❌)"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 font-medium">Student Answer (Essay): {studentAns}</span>
                                  )}

                                  {q.type !== 'essay' && (
                                    <span className="text-emerald-400 font-bold">Teacher's Key: {q.correctAnswer}</span>
                                  )}
                                </div>

                                {/* Essay Evaluation Input */}
                                {q.type === 'essay' && (
                                  <div className="mt-2 pt-2 border-t flex items-center gap-3">
                                    <span className="font-bold text-[11px]">ᲒGive Essay Marks (Max {q.marks || 5}):</span>
                                    <input 
                                      type="number"
                                      max={q.marks || 5}
                                      min={0}
                                      defaultValue={sub.essayMarks?.get ? sub.essayMarks.get(qId) : (sub.essayMarks?.[qId] || 0)}
                                      onChange={(e) => handleEssayMarkChange(sub._id, qId, Number(e.target.value))}
                                      className="w-20 p-1.5 rounded-lg border bg-slate-100 dark:bg-slate-800 text-center font-bold"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Calculate & Finish Button */}
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => calculateAndSaveMarks(sub._id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
                        >
                          <Calculator size={16} /> Calculate & Finish (Save to DB)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Class Selection Modal for Publishing */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl shadow-2xl border ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold">Select Classes to Publish Quiz</h3>
              <button onClick={() => setPublishModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Choose one or more classes where this quiz should be published.</p>

            {teacherClasses.length === 0 ? (
              <p className="text-sm text-center py-6 text-slate-500">No classes found. Please create a class first.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-6">
                {teacherClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls._id);
                  return (
                    <div 
                      key={cls._id}
                      onClick={() => toggleClassSelection(cls._id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected 
                          ? (darkMode ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-indigo-50 border-indigo-300 text-slate-900")
                          : (darkMode ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{cls.grade}</span>
                          <span className="text-xs opacity-70">({cls.medium} - {cls.mode})</span>
                        </div>
                        <p className="text-xs opacity-60 mt-0.5">{cls.day} | {cls.startTime} - {cls.endTime}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-400"}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setPublishModalOpen(false)} className={`px-5 py-2.5 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                Cancel
              </button>
              <button 
                onClick={handleConfirmPublish}
                disabled={selectedClassIds.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow-md"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My Quizzes</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Manage your created quizzes, check admin approval status, view rejection reasons, and publish them.
            </p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-lg">
                  <AlertCircle size={22} /> Confirm Deletion
                </div>
                <button onClick={() => setDeleteModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10">
                  <X size={18} />
                </button>
              </div>
              <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-bold ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                  Cancel
                </button>
                <button onClick={confirmDeleteQuiz} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white">
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
                    {/* View Submissions Button */}
                    {quiz.isPublished && (
                      <button 
                        onClick={() => openSubmissionsModal(quiz)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all mr-2"
                      >
                        <Eye size={16} /> View Submissions
                      </button>
                    )}

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

                {/* Published Classes List Display */}
                {quiz.isPublished && quiz.classIds && quiz.classIds.length > 0 && (
                  <div className={`pt-3 border-t flex flex-wrap items-center gap-2 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Published to Classes:</span>
                    {quiz.classIds.map((cls: any) => (
                      <span key={cls._id || cls} className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border ${darkMode ? "bg-slate-800 border-slate-700 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                        {cls.grade ? `${cls.grade} - ${cls.medium} (${cls.mode})` : "Class"}
                      </span>
                    ))}
                  </div>
                )}

                {/* Questions Preview List */}
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

                  <div className="flex items-center gap-2">
                    {quiz.status === "approved" && (
                      <>
                        {!quiz.isPublished ? (
                          <button
                            onClick={() => openPublishModal(quiz)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                          >
                            <Globe size={14} /> Publish to Classes
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublish(quiz._id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
                          >
                            Unpublish
                          </button>
                        )}
                      </>
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