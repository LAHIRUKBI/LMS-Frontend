// src/app/teacher/materials/submission/page.tsx

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X, Eye, User, CheckSquare, Send, ArrowLeft, Award, AlertCircle } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup";

function TeacherQuizSubmissionContent() {
  const { darkMode } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quizId");

  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentSub, setSelectedStudentSub] = useState<any | null>(null);

  const [essayMarksInput, setEssayMarksInput] = useState<{ [key: string]: { [qId: string]: any } }>({});
  const [teacherCorrectionInputs, setTeacherCorrectionInputs] = useState<{ [subId: string]: { [qId: string]: string } }>({});
  const [checkedPapers, setCheckedPapers] = useState<{ [subId: string]: boolean }>({});
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);

  const fetchData = async () => {
    if (!quizId) return;
    try {
      const token = localStorage.getItem("token");
      const quizRes = await axios.get(`http://localhost:5000/api/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizDetails(quizRes.data);

      const subRes = await axios.get(`http://localhost:5000/api/quiz/${quizId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(subRes.data);
    } catch (err) {
      console.error("Error loading submission data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const handleCheckMCQ = (subId: string) => {
    setCheckedPapers({ ...checkedPapers, [subId]: true });
  };

  const handleEssayMarkChange = (subId: string, qId: string, val: any) => {
    setEssayMarksInput({
      ...essayMarksInput,
      [subId]: {
        ...(essayMarksInput[subId] || {}),
        [qId]: val
      }
    });
  };

  const handleTeacherCorrectionChange = (subId: string, qId: string, text: string) => {
    setTeacherCorrectionInputs({
      ...teacherCorrectionInputs,
      [subId]: {
        ...(teacherCorrectionInputs[subId] || {}),
        [qId]: text
      }
    });
  };

  const handleSendMarksToDB = async (subId: string, currentCalculatedScore?: number) => {
    try {
      const token = localStorage.getItem("token");
      const marks = essayMarksInput[subId] || {};
      const corrections = teacherCorrectionInputs[subId] || {};
      
      const res = await axios.post(`http://localhost:5000/api/quiz/evaluate-essay`, {
        submissionId: subId,
        essayMarks: marks,
        teacherCorrections: corrections,
        overrideScore: currentCalculatedScore
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowSaveSuccessPopup(true);
      const updatedSub = res.data.sub;
      setSubmissions(submissions.map(s => s._id === subId ? updatedSub : s));
      if (selectedStudentSub && selectedStudentSub._id === subId) {
        setSelectedStudentSub(updatedSub);
      }

      setTimeout(() => {
        setShowSaveSuccessPopup(false);
        setSelectedStudentSub(null);
      }, 2000);
    } catch (err) {
      alert("Failed to send marks to database.");
    }
  };

  const handleCheckAllStudentMCQAndSend = async () => {
    if (!quizDetails) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:5000/api/quiz/${quizDetails._id}/evaluate-all-mcq`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setShowSaveSuccessPopup(true);
        setTimeout(() => {
          setShowSaveSuccessPopup(false);
          fetchData();
        }, 2000);
      }
    } catch (err) {
      alert("Failed to evaluate and send all marks.");
    }
  };

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000${photoUrl}`;
  };

  const isPureObjectiveQuiz = quizDetails?.questions?.every((q: any) => q.type === 'mcq' || q.type === 'single' || q.type === 'short');

  if (loading) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <p className="text-sm animate-pulse text-indigo-500 font-bold">Loading student submissions...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      <QuizUploadSuccessPopup 
        isOpen={showSaveSuccessPopup}
        onClose={() => setShowSaveSuccessPopup(false)}
        message="Marks successfully saved to Database and paper evaluated!"
      />

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
          <div>
            <button 
              onClick={() => router.push("/teacher/materials/my-quize")}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:underline mb-2"
            >
              <ArrowLeft size={16} /> Back to My Quizzes
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              Submissions for: 
              <span 
                onClick={() => router.push("/teacher/materials/my-quize")} 
                className="text-indigo-500 cursor-pointer hover:underline"
                title="Click to go back to quiz list"
              >
                {quizDetails?.title || "Quiz"}
              </span>
            </h1>
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Review individual student submissions, evaluate answers, and record final scores directly to the database.
            </p>
          </div>

          {isPureObjectiveQuiz && submissions.length > 0 && !selectedStudentSub && (
            <button 
              onClick={handleCheckAllStudentMCQAndSend}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
            >
              <CheckSquare size={16} /> Check All Objective Papers & Save
            </button>
          )}
        </div>

        {/* If a student is selected for review */}
        {selectedStudentSub ? (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedStudentSub(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-2"
            >
              <ArrowLeft size={16} /> Back to Student List
            </button>

            {(() => {
              const sub = selectedStudentSub;
              const student = sub.studentId;
              if (!student) return <p className="text-xs text-rose-500">Student record not found.</p>;

              const isChecked = checkedPapers[sub._id] || false;
              const studentAnswers = sub.answers instanceof Map ? Object.fromEntries(sub.answers) : (sub.answers || {});

              const getSavedEssayMark = (qIdStr: string) => {
                if (!sub.essayMarks) return 0;
                if (typeof sub.essayMarks.get === 'function') {
                  return Number(sub.essayMarks.get(qIdStr)) || 0;
                }
                return Number(sub.essayMarks[qIdStr]) || 0;
              };

              let calculatedTotalScore = 0;
              
              quizDetails.questions.forEach((q: any) => {
                const qId = q._id.toString();
                const studentAns = studentAnswers[qId];

                // 1. MCQ සහ Single ප්‍රශ්න සඳහා
                if (q.type === 'single' || q.type === 'mcq') {
                  let isCorrect = false;
                  if (q.type === 'single') {
                    const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/\s+/g, '');
                    const cleanCorrect = String(q.correctAnswer || "").trim().toLowerCase().replace(/\s+/g, '');
                    isCorrect = cleanStudent === cleanCorrect && cleanStudent !== "";
                  } else if (q.type === 'mcq') {
                    const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                    if (Array.isArray(studentAns)) {
                      isCorrect = correctArr.every((a: string) => studentAns.includes(a)) && studentAns.every((a: string) => correctArr.includes(a));
                    }
                  }

                  if (isCorrect) {
                    calculatedTotalScore += Number(q.marks) || 0;
                  } else {
                    const manualMark = essayMarksInput[sub._id]?.[qId] !== undefined 
                      ? essayMarksInput[sub._id][qId] 
                      : getSavedEssayMark(qId);
                    calculatedTotalScore += Number(manualMark) || 0;
                  }
                } 
                // 2. Short Answers සහ Essay ප්‍රශ්න සඳහා
                else if (q.type === 'short' || q.type === 'essay') {
                  const hasSubQ = q.subQuestions && Array.isArray(q.subQuestions) && q.subQuestions.length > 0;
                  
                  if (hasSubQ) {
                    const inputSubObj = essayMarksInput[sub._id]?.[qId];
                    if (inputSubObj && typeof inputSubObj === 'object') {
                      calculatedTotalScore += Object.values(inputSubObj).reduce((s: number, m: any) => s + (Number(m) || 0), 0);
                    } else {
                      const savedSubObj = sub.essayMarks ? (typeof sub.essayMarks.get === 'function' ? sub.essayMarks.get(qId) : sub.essayMarks[qId]) : null;
                      if (savedSubObj && typeof savedSubObj === 'object') {
                        const subValues = typeof savedSubObj.values === 'function' ? Array.from(savedSubObj.values()) : Object.values(savedSubObj);
                        calculatedTotalScore += subValues.reduce((s: number, m: any) => s + (Number(m) || 0), 0);
                      }
                    }
                  } else {
                    const inputVal = essayMarksInput[sub._id]?.[qId];
                    if (inputVal !== undefined && inputVal !== null && inputVal !== "") {
                      calculatedTotalScore += Number(inputVal) || 0;
                    } else {
                      calculatedTotalScore += getSavedEssayMark(qId);
                    }
                  }
                }
              });

              const displayTotalScore = sub.isEvaluated && (!essayMarksInput[sub._id] || Object.keys(essayMarksInput[sub._id]).length === 0) 
                ? (Number(sub.score) || 0) 
                : calculatedTotalScore;

              return (
                <div className={`p-6 rounded-3xl border space-y-6 ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border">
                        {student.profileImage ? (
                          <img src={getStudentProfileImageUrl(student.profileImage) || ""} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={22} className="text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base">{student.name}</h4>
                        <p className="text-xs text-slate-400">{student.email} • Time Taken: {sub.timeTaken || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-2">
                      <Award size={16} /> Total Score: {displayTotalScore} / {sub.maxScore} Marks
                    </span>
                  </div>

                  {!isChecked ? (
                    <div className="my-4">
                      <button 
                        onClick={() => handleCheckMCQ(sub._id)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                      >
                        <CheckSquare size={16} /> Check Paper & Mark Right/Wrong
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pl-3 border-l-2 border-blue-500/40 my-4">
                      <p className="text-xs font-bold text-emerald-500">✔ Auto-evaluation active (Review right/wrong marks & give custom marks/feedback if needed):</p>
                      
                      {quizDetails.questions.map((q: any, qIdx: number) => {
                        const qId = q._id.toString();
                        const studentAns = studentAnswers[qId];

                        let isCorrect = false;
                        if (q.type === 'single') {
                          const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/\s+/g, '');
                          const cleanCorrect = String(q.correctAnswer || "").trim().toLowerCase().replace(/\s+/g, '');
                          isCorrect = cleanStudent === cleanCorrect && cleanStudent !== "";
                        } else if (q.type === 'short') {
                          const cleanCorrect = String(q.correctAnswer || "").trim();
                          if (cleanCorrect) {
                            const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/\s+/g, '');
                            const cleanRef = cleanCorrect.toLowerCase().replace(/\s+/g, '');
                            isCorrect = cleanStudent === cleanRef;
                          }
                        } else if (q.type === 'mcq') {
                          const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                          if (Array.isArray(studentAns)) {
                            isCorrect = correctArr.every((a: string) => studentAns.includes(a)) && studentAns.every((a: string) => correctArr.includes(a));
                          }
                        }

                        let questionEarnedMarks = 0;
                        if (q.type !== 'essay') {
                          if (isCorrect) {
                            questionEarnedMarks = q.marks;
                          } else {
                            const manualMark = (essayMarksInput[sub._id] || {})[qId];
                            questionEarnedMarks = manualMark !== undefined ? Number(manualMark) : getSavedEssayMark(qId);
                          }
                        } else {
                          if (q.subQuestions && Array.isArray(q.subQuestions) && q.subQuestions.length > 0) {
                            const savedSub = sub.essayMarks?.get ? sub.essayMarks.get(qId) : (sub.essayMarks?.[qId] || {});
                            const currentInputSub = (essayMarksInput[sub._id] || {})[qId] || savedSub || {};
                            questionEarnedMarks = Object.values(currentInputSub).reduce((s: number, m: any) => s + (Number(m) || 0), 0);
                          } else {
                            const inputVal = (essayMarksInput[sub._id] || {})[qId];
                            questionEarnedMarks = inputVal !== undefined ? Number(inputVal) : getSavedEssayMark(qId);
                          }
                        }

                        const hasSubQ = q.subQuestions && Array.isArray(q.subQuestions) && q.subQuestions.length > 0;
                        let formattedStudentAnswer = "";
                        if (Array.isArray(studentAns)) {
                          formattedStudentAnswer = studentAns.join(', ');
                        } else if (typeof studentAns === 'object' && studentAns !== null) {
                          formattedStudentAnswer = Object.entries(studentAns)
                            .map(([k, v]) => `Part (${Number(k) + 1}): ${v}`)
                            .join(' | ');
                        } else {
                          formattedStudentAnswer = String(studentAns || "No Answer Given");
                        }

                        return (
                          <div key={qId} className={`p-4 rounded-xl border text-xs space-y-3 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                            <div className="flex justify-between items-center">
                              <p className="font-bold text-sm">
                                {qIdx + 1}. {q.questionText} <span className="opacity-60 text-[11px]">({q.type.toUpperCase()})</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  Score: {questionEarnedMarks} / {hasSubQ ? q.subQuestions.reduce((s: number, sq: any) => s + sq.marks, 0) : q.marks} Marks
                                </span>

                                {q.type !== 'essay' && q.type !== 'short' && (
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                    isCorrect ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                  }`}>
                                    {isCorrect ? <Check size={14} /> : <X size={14} />}
                                    {isCorrect ? "Correct" : "Incorrect"}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border">
                                <span className="text-[10px] text-slate-400 block font-bold mb-1">Student Answer:</span>
                                <span className="text-slate-200 font-medium">{formattedStudentAnswer}</span>
                              </div>

                              {q.type !== 'essay' && (
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="text-[10px] text-emerald-400 block font-bold mb-1">Teacher's Answer Key Reference:</span>
                                  <span className="text-emerald-400 font-bold">
                                    {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || 'None specified')}
                                  </span>
                                </div>
                              )}
                            </div>

                            {q.type === 'short' && (
                              <div className="mt-3 pt-2 border-t flex items-center justify-between bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                                <span className="font-bold text-xs text-amber-500">Give Short Answer Marks (Max {q.marks}):</span>
                                <input 
                                  type="number"
                                  max={q.marks}
                                  min={0}
                                  defaultValue={getSavedEssayMark(qId)}
                                  onChange={(e) => handleEssayMarkChange(sub._id, qId, Number(e.target.value))}
                                  className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm"
                                />
                              </div>
                            )}

                            {q.type === 'mcq' && !isCorrect && (
                              <div className="mt-3 pt-2 border-t flex items-center justify-between bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                                <span className="font-bold text-xs text-amber-500">Give Custom/Partial Marks (Max {q.marks}):</span>
                                <input 
                                  type="number"
                                  max={q.marks}
                                  min={0}
                                  defaultValue={getSavedEssayMark(qId)}
                                  onChange={(e) => handleEssayMarkChange(sub._id, qId, Number(e.target.value))}
                                  className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm"
                                />
                              </div>
                            )}

                            {q.type === 'essay' && hasSubQ && (
                              <div className="mt-3 pt-2 border-t space-y-2">
                                <span className="font-bold text-[11px] text-indigo-400 block">Give Marks for Essay Sub-Questions:</span>
                                {q.subQuestions.map((sq: any, sqIdx: number) => (
                                  <div key={sq._id || sqIdx} className="flex justify-between items-center gap-2 bg-slate-800/40 p-2.5 rounded-lg">
                                    <span>({sqIdx + 1}) {sq.subQuestionText} [Max {sq.marks}]</span>
                                    <input 
                                      type="number"
                                      max={sq.marks}
                                      min={0}
                                      defaultValue={sub.essayMarks?.get ? sub.essayMarks.get(qId)?.[sqIdx] : (sub.essayMarks?.[qId]?.[sqIdx] || 0)}
                                      onChange={(e) => {
                                        const currentEssayObj: { [key: string]: any } = essayMarksInput[sub._id] || sub.essayMarks || {};
                                        const currentSubMarks: { [key: number]: number } = { ...(currentEssayObj[qId] || {}) };
                                        currentSubMarks[sqIdx] = Number(e.target.value);
                                        handleEssayMarkChange(sub._id, qId, currentSubMarks);
                                      }}
                                      className="w-20 p-1.5 rounded border bg-slate-800 text-center font-bold text-white"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.type === 'essay' && !hasSubQ && (
                              <div className="mt-3 pt-2 border-t flex items-center justify-between bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/20">
                                <span className="font-bold text-xs text-indigo-400">Give Essay Marks (Max {q.marks}):</span>
                                <input 
                                  type="number"
                                  max={q.marks}
                                  min={0}
                                  defaultValue={getSavedEssayMark(qId)}
                                  onChange={(e) => handleEssayMarkChange(sub._id, qId, Number(e.target.value))}
                                  className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm"
                                />
                              </div>
                            )}

                            <div className="mt-3 pt-2 border-t">
                              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                Teacher's Correction / Feedback for Student:
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Write explanation or feedback here..."
                                defaultValue={sub.teacherCorrections?.get ? sub.teacherCorrections.get(qId) : (sub.teacherCorrections?.[qId] || "")}
                                onChange={(e) => handleTeacherCorrectionChange(sub._id, qId, e.target.value)}
                                className="w-full p-2.5 text-xs rounded-xl border bg-slate-800/80 border-slate-700 text-white outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                      <Award size={20} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        Final Calculated Score: <strong className="text-sm">{displayTotalScore} / {sub.maxScore}</strong>
                      </span>
                    </div>

                    <button 
                      onClick={() => handleSendMarksToDB(sub._id, displayTotalScore)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 transition"
                    >
                      <Send size={16} /> Save Marks to Database
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* Student List View */
          submissions.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <AlertCircle size={36} className="mx-auto mb-2 text-slate-400 opacity-50" />
              <p className="text-sm font-bold">No student submissions found for this quiz yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400">Total Submissions Received: {submissions.length}. Click on any student to evaluate:</p>
              
              {submissions.map((sub) => {
                const student = sub.studentId;
                if (!student) return null;

                return (
                  <div 
                    key={sub._id}
                    onClick={() => setSelectedStudentSub(sub)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      darkMode ? "bg-slate-900 border-slate-800 hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm"
                    }`}
                  >
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
                        <p className="text-[11px] text-slate-400">{student.email} • Submitted: {sub.timeTaken || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sub.isEvaluated ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {sub.isEvaluated ? `Score: ${sub.score}/${sub.maxScore}` : "Pending Evaluation"}
                      </span>
                      <span className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        Review Paper <Eye size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>
    </div>
  );
}

export default function TeacherQuizSubmissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <TeacherQuizSubmissionContent />
    </Suspense>
  );
}