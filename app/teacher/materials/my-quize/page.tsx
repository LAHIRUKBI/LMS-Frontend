// src/app/teacher/materials/my-quize/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Globe, FileText, Trash2, AlertCircle, Image as ImageIcon, X, Check, Eye, User, CheckSquare, Send, Calendar, ArrowLeft, Download, Award } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup"; // 👈 Popup සංරචකය ආනයනය කර ඇත

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

interface ClassSchedule {
  classId: any;
  publishType: "now" | "schedule";
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
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
  classSchedules?: ClassSchedule[];
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
  
  const [publishModes, setPublishModes] = useState<{ [classId: string]: "now" | "schedule" }>({});
  const [classScheduleData, setClassScheduleData] = useState<{ 
    [classId: string]: { startDate: string; startTime: string; endDate: string; endTime: string } 
  }>({});

  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedQuizSubmissions, setSelectedQuizSubmissions] = useState<any[]>([]);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<any>(null);
  
  const [selectedStudentSub, setSelectedStudentSub] = useState<any | null>(null);

  const [essayMarksInput, setEssayMarksInput] = useState<{ [key: string]: { [qId: string]: any } }>({});
  const [checkedPapers, setCheckedPapers] = useState<{ [subId: string]: boolean }>({});
  
  // Essay සඳහා ගුරුවරයා ලබාදෙන Corrective Feedback / Text Box සඳහා වන state එක
  const [teacherCorrectionInputs, setTeacherCorrectionInputs] = useState<{ [subId: string]: { [qId: string]: string } }>({});

  // Save Marks to Database බටන් එක එබූ විට පෙන්වන Popup state එක
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);

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
    const existingIds = quiz.classIds ? quiz.classIds.map((c: any) => c._id || c) : [];
    setSelectedClassIds(existingIds);

    const modes: { [key: string]: "now" | "schedule" } = {};
    const schedules: any = {};
    
    quiz.classSchedules?.forEach((sch) => {
      const cId = sch.classId?._id || sch.classId;
      modes[cId] = sch.publishType || "now";
      schedules[cId] = {
        startDate: sch.startDate ? sch.startDate.split('T')[0] : "",
        startTime: sch.startTime || "",
        endDate: sch.endDate ? sch.endDate.split('T')[0] : "",
        endTime: sch.endTime || ""
      };
    });

    setPublishModes(modes);
    setClassScheduleData(schedules);
    setPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedQuizForPublish) return;
    try {
      const token = localStorage.getItem("token");
      
      const formattedSchedules = selectedClassIds.map(cId => ({
        classId: cId,
        publishType: publishModes[cId] || "now",
        startDate: classScheduleData[cId]?.startDate || null,
        startTime: classScheduleData[cId]?.startTime || null,
        endDate: classScheduleData[cId]?.endDate || null,
        endTime: classScheduleData[cId]?.endTime || null,
      }));

      const res = await axios.put(`http://localhost:5000/api/quiz/${selectedQuizForPublish._id}/publish`, {
        classIds: selectedClassIds,
        classSchedules: formattedSchedules
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
        classIds: [],
        classSchedules: []
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

  const handleRemoveClassFromQuiz = async (quiz: QuizItem, classIdToRemove: string) => {
    try {
      const token = localStorage.getItem("token");
      const updatedClassIds = (quiz.classIds || [])
        .map((c: any) => c._id || c)
        .filter((id: string) => id !== classIdToRemove);

      const updatedSchedules = (quiz.classSchedules || []).filter((sch: any) => {
        const cId = sch.classId?._id || sch.classId;
        return cId !== classIdToRemove;
      });

      const res = await axios.put(`http://localhost:5000/api/quiz/${quiz._id}/publish`, {
        classIds: updatedClassIds,
        classSchedules: updatedSchedules
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        fetchMyQuizzes();
      }
    } catch (err: any) {
      console.error("Failed to remove class from quiz.");
    }
  };

  const toggleClassSelection = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
      if (!publishModes[classId]) {
        setPublishModes({ ...publishModes, [classId]: "now" });
      }
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
    setSelectedStudentSub(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/quiz/${quiz._id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedQuizSubmissions(res.data);
      setCheckedPapers({});
      setSubmissionsModalOpen(true);
    } catch (err) {
      alert("Error retrieving student submissions.");
    }
  };

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
      setSelectedQuizSubmissions(selectedQuizSubmissions.map(s => s._id === subId ? updatedSub : s));
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
    if (!selectedQuizDetails) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:5000/api/quiz/${selectedQuizDetails._id}/evaluate-all-mcq`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setShowSaveSuccessPopup(true);
        setTimeout(() => {
          setShowSaveSuccessPopup(false);
          openSubmissionsModal(selectedQuizDetails);
        }, 2000);
      }
    } catch (err) {
      alert("Failed to evaluate and send all marks.");
    }
  };

  const handleDownloadPDFAnswerKey = (quiz: QuizItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the PDF.");
      return;
    }

    let htmlContent = `
      <html>
        <head>
          <title>${quiz.title} - Answer Key</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 22px; color: #0f172a; margin-bottom: 5px; }
            p { font-size: 13px; color: #64748b; margin-bottom: 20px; }
            .question-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .q-title { font-weight: bold; font-size: 14px; margin-bottom: 8px; }
            .badge { background: #e0e7ff; color: #3730a3; padding: 3px 8px; font-size: 11px; border-radius: 4px; font-weight: bold; }
            ul { margin: 8px 0; padding-left: 20px; font-size: 13px; }
            li { margin-bottom: 4px; }
            .correct-ans { background: #d1fae5; color: #065f46; padding: 6px 10px; border-radius: 6px; font-weight: bold; margin-top: 8px; display: inline-block; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${quiz.title} - Teacher's Answer Key</h1>
          <p>${quiz.description || 'No description provided.'} | Duration: ${quiz.duration} Minutes</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
    `;

    quiz.questions.forEach((q, idx) => {
      let totalQMarks = q.marks;
      if (q.type === 'essay' && q.subQuestions && q.subQuestions.length > 0) {
        totalQMarks = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
      }

      htmlContent += `
        <div class="question-box">
          <div class="q-title">${idx + 1}. ${q.questionText} <span class="badge">${q.type.toUpperCase()} (${totalQMarks} Marks)</span></div>
      `;

      if ((q.type === 'mcq' || q.type === 'single') && q.options && q.options.length > 0) {
        htmlContent += `<ul>`;
        q.options.forEach((opt, oIdx) => {
          htmlContent += `<li><strong>(${oIdx + 1})</strong> ${opt}</li>`;
        });
        htmlContent += `</ul>`;
      }

      if (q.type === 'essay' && q.subQuestions && q.subQuestions.length > 0) {
        htmlContent += `<ul>`;
        q.subQuestions.forEach((sq, sqIdx) => {
          htmlContent += `<li><strong>(${sqIdx + 1})</strong> ${sq.subQuestionText} [${sq.marks} marks]</li>`;
        });
        htmlContent += `</ul>`;
      }

      if (q.type === 'mcq') {
        const correctStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || '');
        htmlContent += `<div class="correct-ans">✅ Correct Answers: ${correctStr}</div>`;
      } else if (q.type === 'single' || q.type === 'short') {
        const ansRef = String(q.correctAnswer || '').trim();
        htmlContent += `<div class="correct-ans">✅ Correct Answer Reference: ${ansRef || 'None specified (Manual evaluation)'}</div>`;
      } else {
        htmlContent += `<div class="correct-ans">📝 Essay / Structured Question (Evaluated by Teacher)</div>`;
      }

      htmlContent += `</div>`;
    });

    htmlContent += `
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getStudentProfileImageUrl = (photoUrl: string) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http")) return photoUrl;
    return `http://localhost:5000${photoUrl}`;
  };

  const isPureObjectiveQuiz = selectedQuizDetails?.questions?.every((q: any) => q.type === 'mcq' || q.type === 'single' || q.type === 'short');

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Save Success Popup Message */}
      <QuizUploadSuccessPopup 
        isOpen={showSaveSuccessPopup}
        onClose={() => setShowSaveSuccessPopup(false)}
        message="Marks successfully saved to Database and paper evaluated!"
      />

      {/* Submissions Evaluation Modal */}
      {submissionsModalOpen && selectedQuizDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-4xl p-6 rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-xl font-extrabold">{selectedQuizDetails.title} - Student Submissions</h3>
                <p className="text-xs text-slate-400">
                  {selectedStudentSub ? "Reviewing individual student paper and answer key." : "Click on any student to review their submission."}
                </p>
              </div>
              <button onClick={() => { setSubmissionsModalOpen(false); setSelectedStudentSub(null); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>

            {/* If a student is selected, show side-by-side paper view. Otherwise, show student list. */}
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
                  if (!student) return null;
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
                  selectedQuizDetails.questions.forEach((q: any) => {
                    const qId = q._id.toString();
                    const studentAns = studentAnswers[qId];

                    if (q.type === 'single') {
                      const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                      const cleanCorrect = String(q.correctAnswer || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                      if (cleanCorrect && cleanStudent === cleanCorrect) {
                        calculatedTotalScore += Number(q.marks) || 0;
                      } else {
                        const manualVal = (essayMarksInput[sub._id] || {})[qId] !== undefined ? Number((essayMarksInput[sub._id] || {})[qId]) : 0;
                        calculatedTotalScore += manualVal;
                      }
                    } else if (q.type === 'short') {
                      const cleanCorrect = String(q.correctAnswer || "").trim();
                      if (cleanCorrect) {
                        const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                        const cleanRef = cleanCorrect.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (cleanStudent === cleanRef) {
                          calculatedTotalScore += Number(q.marks) || 0;
                        } else {
                          const manualVal = (essayMarksInput[sub._id] || {})[qId] !== undefined ? Number((essayMarksInput[sub._id] || {})[qId]) : 0;
                          calculatedTotalScore += manualVal;
                        }
                      } else {
                        const manualVal = (essayMarksInput[sub._id] || {})[qId] !== undefined ? Number((essayMarksInput[sub._id] || {})[qId]) : getSavedEssayMark(qId);
                        calculatedTotalScore += manualVal;
                      }
                    } else if (q.type === 'mcq') {
                      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                      if (Array.isArray(studentAns)) {
                        const isAllCorrect = correctArr.every((a: string) => studentAns.includes(a)) && studentAns.every((a: string) => correctArr.includes(a));
                        if (isAllCorrect) {
                          calculatedTotalScore += Number(q.marks) || 0;
                        } else {
                          const manualMcqMarks = (essayMarksInput[sub._id] || {})[qId] !== undefined ? Number((essayMarksInput[sub._id] || {})[qId]) : 0;
                          calculatedTotalScore += manualMcqMarks;
                        }
                      }
                    }
                  });

                  const currentEssayMarks = essayMarksInput[sub._id] || {};
                  Object.entries(currentEssayMarks).forEach(([qIdKey, val]: [string, any]) => {
                    const targetQ = selectedQuizDetails.questions.find((q: any) => q._id.toString() === qIdKey);
                    if (targetQ && (targetQ.type === 'mcq' || targetQ.type === 'single' || targetQ.type === 'short')) return;

                    if (typeof val === 'object' && val !== null) {
                      calculatedTotalScore += Object.values(val).reduce((s: number, m: any) => s + (Number(m) || 0), 0);
                    } else {
                      calculatedTotalScore += Number(val) || 0;
                    }
                  });

                  const displayTotalScore = sub.isEvaluated && (!essayMarksInput[sub._id] || Object.keys(essayMarksInput[sub._id]).length === 0) 
                    ? (Number(sub.score) || 0) 
                    : calculatedTotalScore;

                  return (
                    <div className={`p-5 rounded-2xl border space-y-5 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
                        <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                          <Award size={14} /> Total Score: {displayTotalScore} / {sub.maxScore} Marks
                        </span>
                      </div>

                      {!isChecked ? (
                        <div className="my-3">
                          <button 
                            onClick={() => handleCheckMCQ(sub._id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                          >
                            <CheckSquare size={16} /> Check Paper & Mark Right/Wrong
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 pl-2 border-l-2 border-blue-500/40 my-3">
                          <p className="text-xs font-bold text-emerald-500">✔ Auto-evaluation completed (Review right/wrong marks & give custom marks/feedback if needed):</p>
                          
                          {selectedQuizDetails.questions.map((q: any, qIdx: number) => {
                            const qId = q._id.toString();
                            const studentAns = studentAnswers[qId];

                            let isCorrect = false;
                            if (q.type === 'single') {
                              const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                              const cleanCorrect = String(q.correctAnswer || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                              isCorrect = cleanStudent === cleanCorrect && cleanStudent !== "";
                            } else if (q.type === 'short') {
                              const cleanCorrect = String(q.correctAnswer || "").trim();
                              if (cleanCorrect) {
                                const cleanStudent = String(studentAns || "").trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                                const cleanRef = cleanCorrect.toLowerCase().replace(/[^a-z0-9]/g, '');
                                isCorrect = cleanStudent === cleanRef;
                              } else {
                                isCorrect = false;
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
                              <div key={qId} className={`p-4 rounded-xl border text-xs space-y-2.5 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                                <div className="flex justify-between items-center">
                                  <p className="font-bold text-sm">
                                    {qIdx + 1}. {q.questionText} <span className="opacity-60 text-[10px]">({q.type.toUpperCase()})</span>
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
                                    <span className="text-slate-200 font-medium">
                                      {formattedStudentAnswer}
                                    </span>
                                  </div>

                                  {q.type !== 'essay' && (
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                      <span className="text-[10px] text-emerald-400 block font-bold mb-1">Teacher's Answer Key Reference:</span>
                                      <span className="text-emerald-400 font-bold">
                                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || 'None specified (Manual grading)')}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {q.type === 'short' && (
                                  <div className="mt-3 pt-2 border-t flex items-center justify-between bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                                    <span className="font-bold text-xs text-amber-500">Give Short Answer Marks (Max {q.marks} Marks):</span>
                                    <input 
                                      type="number"
                                      max={q.marks}
                                      min={0}
                                      defaultValue={getSavedEssayMark(qId)}
                                      onChange={(e) => {
                                        handleEssayMarkChange(sub._id, qId, Number(e.target.value));
                                      }}
                                      className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm focus:ring-2 focus:ring-amber-500"
                                    />
                                  </div>
                                )}

                                {q.type === 'mcq' && !isCorrect && (
                                  <div className="mt-3 pt-2 border-t flex items-center justify-between bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                                    <span className="font-bold text-xs text-amber-500">Give Custom/Partial Marks (Max {q.marks} Marks):</span>
                                    <input 
                                      type="number"
                                      max={q.marks}
                                      min={0}
                                      defaultValue={getSavedEssayMark(qId)}
                                      onChange={(e) => {
                                        handleEssayMarkChange(sub._id, qId, Number(e.target.value));
                                      }}
                                      className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm focus:ring-2 focus:ring-amber-500"
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
                                    <span className="font-bold text-xs text-indigo-400">Give Essay Marks (Max {q.marks} Marks):</span>
                                    <input 
                                      type="number"
                                      max={q.marks}
                                      min={0}
                                      defaultValue={getSavedEssayMark(qId)}
                                      onChange={(e) => {
                                        handleEssayMarkChange(sub._id, qId, Number(e.target.value));
                                      }}
                                      className="w-24 p-2 rounded-lg border bg-slate-800 text-center font-extrabold text-white text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                )}

                                <div className="mt-3 pt-2 border-t">
                                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                    Teacher's Correction / What is correct for this question (Feedback for student):
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Write the correct explanation or advice for the student here..."
                                    defaultValue={sub.teacherCorrections?.get ? sub.teacherCorrections.get(qId) : (sub.teacherCorrections?.[qId] || "")}
                                    onChange={(e) => handleTeacherCorrectionChange(sub._id, qId, e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl border bg-slate-800/80 border-slate-700 text-white outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Bottom Total Score Display & Save Button */}
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
              selectedQuizSubmissions.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm italic">No students have submitted this quiz yet.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <p className="text-xs font-bold text-slate-400">Click on a student to review their paper:</p>
                    
                    {isPureObjectiveQuiz && (
                      <button 
                        onClick={handleCheckAllStudentMCQAndSend}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
                      >
                        <CheckSquare size={16} /> Check All Objective Papers & Save Marks
                      </button>
                    )}
                  </div>

                  {selectedQuizSubmissions.map((sub) => {
                    const student = sub.studentId;
                    if (!student) return null;

                    return (
                      <div 
                        key={sub._id}
                        onClick={() => setSelectedStudentSub(sub)}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          darkMode ? "bg-slate-950 border-slate-800 hover:border-blue-500/50" : "bg-slate-50 border-slate-200 hover:border-blue-300"
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
                            <p className="text-[11px] text-slate-400">{student.email} • {sub.timeTaken}</p>
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
      )}

      {/* Class Selection & Scheduling Modal for Publishing */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl p-6 rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold">Select Classes & Schedule Quiz Publication</h3>
              <button onClick={() => setPublishModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Choose classes and select either "Publish Now" or configure a custom date-time schedule.</p>

            {teacherClasses.length === 0 ? (
              <p className="text-sm text-center py-6 text-slate-500">No classes found. Please create a class first.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 mb-6">
                {teacherClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls._id);
                  const mode = publishModes[cls._id] || "now";
                  const sched = classScheduleData[cls._id] || { startDate: "", startTime: "", endDate: "", endTime: "" };

                  return (
                    <div 
                      key={cls._id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? (darkMode ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-indigo-50 border-indigo-300 text-slate-900")
                          : (darkMode ? "bg-slate-800/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                      }`}
                    >
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleClassSelection(cls._id)}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">
                              {cls.grade === 'Other' ? cls.customGradeName : `Grade ${cls.grade}`}
                            </span>
                            <span className="text-xs opacity-70">({cls.medium} - {cls.mode})</span>
                          </div>
                          <p className="text-xs opacity-60 mt-0.5">{cls.day} | {cls.startTime} - {cls.endTime}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-400"}`}>
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/20 space-y-3">
                          <div className="flex items-center gap-4 text-xs font-bold">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`pub-mode-${cls._id}`} 
                                checked={mode === "now"} 
                                onChange={() => setPublishModes({ ...publishModes, [cls._id]: "now" })}
                              />
                              Publish Now
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`pub-mode-${cls._id}`} 
                                checked={mode === "schedule"} 
                                onChange={() => setPublishModes({ ...publishModes, [cls._id]: "schedule" })}
                              />
                              Schedule Publication
                            </label>
                          </div>

                          {mode === "schedule" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-xl border border-indigo-500/20 text-xs">
                              <div>
                                <label className="block font-semibold mb-1 text-[11px] text-slate-300">Start Date & Time:</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="date" 
                                    value={sched.startDate}
                                    onChange={(e) => setClassScheduleData({
                                      ...classScheduleData,
                                      [cls._id]: { ...sched, startDate: e.target.value }
                                    })}
                                    className="p-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white flex-1"
                                  />
                                  <input 
                                    type="time" 
                                    value={sched.startTime}
                                    onChange={(e) => setClassScheduleData({
                                      ...classScheduleData,
                                      [cls._id]: { ...sched, startTime: e.target.value }
                                    })}
                                    className="p-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block font-semibold mb-1 text-[11px] text-slate-300">End Date & Time (Close):</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="date" 
                                    value={sched.endDate}
                                    onChange={(e) => setClassScheduleData({
                                      ...classScheduleData,
                                      [cls._id]: { ...sched, endDate: e.target.value }
                                    })}
                                    className="p-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white flex-1"
                                  />
                                  <input 
                                    type="time" 
                                    value={sched.endTime}
                                    onChange={(e) => setClassScheduleData({
                                      ...classScheduleData,
                                      [cls._id]: { ...sched, endTime: e.target.value }
                                    })}
                                    className="p-1.5 rounded-lg border bg-slate-800 border-slate-700 text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My Quizzes</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Manage your created quizzes, check admin approval status, view rejection reasons, and publish them with flexible schedules.
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

                {quiz.status === "rejected" && quiz.rejectReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Rejection Reason:</strong> {quiz.rejectReason}</span>
                  </div>
                )}

                {quiz.isPublished && quiz.classSchedules && quiz.classSchedules.length > 0 && (
                  <div className={`pt-3 border-t space-y-2 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Published Classes & Schedules:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quiz.classSchedules.map((sch, sIdx) => {
                        const cls = sch.classId;
                        const classIdVal = cls?._id || cls;

                        let isCurrentlyOpen = true;
                        if (sch.publishType === 'schedule') {
                          const now = new Date();
                          const startDateTime = sch.startDate && sch.startTime 
                            ? new Date(`${sch.startDate.split('T')[0]}T${sch.startTime}`)
                            : (sch.startDate ? new Date(sch.startDate) : null);
                          const endDateTime = sch.endDate && sch.endTime 
                            ? new Date(`${sch.endDate.split('T')[0]}T${sch.endTime}`)
                            : (sch.endDate ? new Date(sch.endDate) : null);

                          const isAfterStart = startDateTime ? now >= startDateTime : true;
                          const isBeforeEnd = endDateTime ? now <= endDateTime : true;
                          isCurrentlyOpen = isAfterStart && isBeforeEnd;
                        }

                        return (
                          <div key={sIdx} className={`p-3 rounded-xl border text-xs space-y-2 relative ${darkMode ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="font-bold text-indigo-400 text-sm">
                                  {cls?.grade === 'Other' ? cls.customGradeName : (cls?.grade ? `Grade ${cls.grade}` : (cls?.name || "Class"))} - {cls?.medium || ""} ({cls?.mode || ""})
                                </div>
                                <div className="text-[11px] opacity-70 mt-0.5">
                                  {cls?.day || ""} {cls?.startTime ? `| ${cls.startTime} - ${cls?.endTime}` : ""}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  isCurrentlyOpen 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  {isCurrentlyOpen ? "Open" : "Scheduled"}
                                </span>

                                <button
                                  onClick={() => handleRemoveClassFromQuiz(quiz, classIdVal)}
                                  title="Remove from this class"
                                  className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/20 text-rose-500 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="text-[11px] opacity-80 flex items-center gap-1 pt-1 border-t border-slate-500/10">
                              <Calendar size={12} />
                              {sch.publishType === 'now' ? (
                                <span className="text-emerald-400 font-semibold">Published Immediately (Now)</span>
                              ) : (
                                <span>
                                  Scheduled: {sch.startDate?.split('T')[0]} ({sch.startTime}) ➔ {sch.endDate?.split('T')[0]} ({sch.endTime})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`border-t pt-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions & Answers Details:</h3>
                    <button
                      onClick={() => handleDownloadPDFAnswerKey(quiz)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={14} /> Download PDF Answer Key
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {quiz.questions.map((q, idx) => {
                      let totalQMarks = q.marks;
                      if (q.type === 'essay' && q.subQuestions && q.subQuestions.length > 0) {
                        totalQMarks = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
                      }

                      return (
                        <div key={`${quiz._id}-question-${idx}`} className={`p-4 rounded-xl border text-xs space-y-2 ${darkMode ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm">
                              {idx + 1}. {q.questionText}
                            </p>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {q.type} ({totalQMarks} marks)
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

                          {(q.type === 'mcq' || q.type === 'single') && q.options && q.options.length > 0 && (
                            <div className="space-y-1 mt-2 pl-2 border-l-2 border-indigo-500/40">
                              <p className="text-[11px] font-semibold text-slate-400">Options:</p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect = q.type === 'mcq' 
                                    ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))
                                    : (q.correctAnswer === opt);

                                  return (
                                    <li key={optIdx} className={`p-2 rounded border text-xs ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : (darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700")}`}>
                                      <span className="font-bold mr-1">({optIdx + 1})</span> {opt} {isCorrect && "✅"}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {q.type === 'essay' && q.subQuestions && q.subQuestions.length > 0 && (
                            <div className="space-y-1 mt-2 pl-2 border-l-2 border-indigo-500/40">
                              <p className="text-[11px] font-semibold text-slate-400">Sub-Questions:</p>
                              <div className="space-y-1">
                                {q.subQuestions.map((sq, sqIdx) => (
                                  <div key={sq._id || sqIdx} className="p-2 rounded border text-xs bg-slate-900/40 flex justify-between items-center">
                                    <span><strong>({sqIdx + 1})</strong> {sq.subQuestionText}</span>
                                    <span className="text-indigo-400 font-bold">[{sq.marks} marks]</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-slate-500/25 flex items-center justify-between">
                            {q.type === 'mcq' && (
                              <span className="font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded inline-block text-[11px]">
                                ✅ Correct Answers: <strong className="text-emerald-400">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || '')}</strong>
                              </span>
                            )}
                            {q.type === 'single' && (
                              <span className="font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded inline-block text-[11px]">
                                ✅ Correct Answer: <strong className="text-emerald-400">{String(q.correctAnswer || '')}</strong>
                              </span>
                            )}
                            {q.type === 'short' && (
                              <span className="font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded inline-block text-[11px]">
                                ✅ Correct Reference: <strong className="text-emerald-400">{String(q.correctAnswer || 'None (Manual grading)')}</strong>
                              </span>
                            )}
                            {q.type === 'essay' && (
                              <span className="font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded inline-block text-[11px]">
                                📝 Structured Essay Question (Evaluated by Teacher)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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