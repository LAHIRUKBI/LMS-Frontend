"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Send, Image as ImageIcon, CheckCircle, Upload, X, HelpCircle, Award, Clock, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup";
import { useTheme } from "@/app/context/ThemeContext";

type QuestionType = "mcq" | "single" | "short" | "essay";

interface SubQuestion {
  id: string;
  subQuestionText: string;
  marks: number;
}

interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  imageFile?: File | null;
  imageUrl?: string;
  options: string[];
  correctAnswer: string | string[];
  marks: number;
  subQuestions?: SubQuestion[];
}

export default function TeacherQuizCreator() {
  const { darkMode } = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([]);

  const [step, setStep] = useState<1 | 2>(1);

  const [currentType, setCurrentType] = useState<QuestionType>("mcq");
  const [currentText, setCurrentText] = useState("");
  
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [currentOptions, setCurrentOptions] = useState<string[]>(["", ""]);
  const [currentCorrect, setCurrentCorrect] = useState<string>("");
  const [currentCorrectMultiple, setCurrentCorrectMultiple] = useState<string[]>([]);
  const [currentMarks, setCurrentMarks] = useState(3);

  const [hasSubQuestions, setHasSubQuestions] = useState(false);
  const [currentSubQuestions, setCurrentSubQuestions] = useState<SubQuestion[]>([
    { id: Date.now().toString(), subQuestionText: "", marks: 5 }
  ]);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleTypeChange = (newType: QuestionType) => {
    setCurrentType(newType);
    if (newType === "mcq") {
      setCurrentMarks(3);
    } else if (newType === "single") {
      setCurrentMarks(2);
    } else if (newType === "essay") {
      setCurrentMarks(10);
    } else {
      setCurrentMarks(5);
    }
  };

  const totalQuizMarks = questions.reduce((sum, q) => {
    if (q.type === "essay" && q.subQuestions && q.subQuestions.length > 0) {
      const subTotal = q.subQuestions.reduce((subSum, sq) => subSum + sq.marks, 0);
      return sum + subTotal;
    }
    return sum + q.marks;
  }, 0);

  const handleAddOption = () => {
    setCurrentOptions([...currentOptions, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...currentOptions];
    updated[index] = value;
    setCurrentOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    setCurrentOptions(currentOptions.filter((_, i) => i !== index));
  };

  const handleToggleMultipleCorrect = (option: string) => {
    if (currentCorrectMultiple.includes(option)) {
      setCurrentCorrectMultiple(currentCorrectMultiple.filter(item => item !== option));
    } else {
      setCurrentCorrectMultiple([...currentCorrectMultiple, option]);
    }
  };

  const handleAddSubQuestion = () => {
    setCurrentSubQuestions([
      ...currentSubQuestions,
      { id: Date.now().toString(), subQuestionText: "", marks: 5 }
    ]);
  };

  const handleSubQuestionChange = (index: number, field: keyof SubQuestion, value: any) => {
    const updated = [...currentSubQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentSubQuestions(updated);
  };

  const handleRemoveSubQuestion = (id: string) => {
    if (currentSubQuestions.length === 1) {
      setCurrentSubQuestions([]);
      setHasSubQuestions(false);
      return;
    }
    setCurrentSubQuestions(currentSubQuestions.filter(sq => sq.id !== id));
  };

  const handleNextToQuestions = () => {
    if (!title.trim()) {
      alert("Please enter the quiz title.");
      return;
    }
    setStep(2);
  };

  const handleAddQuestionToQuiz = () => {
    if (!currentText.trim()) {
      alert("Please enter the question text or main description.");
      return;
    }

    if (currentType === "mcq" && currentOptions.some(opt => !opt.trim())) {
      alert("Please fill all MCQ options or remove empty ones.");
      return;
    }

    let finalCorrectAnswer: any = currentCorrect;
    if (currentType === "mcq") {
      if (currentCorrectMultiple.length === 0) {
        alert("Please select at least one correct answer for Multiple Choice (MCQ).");
        return;
      }
      finalCorrectAnswer = currentCorrectMultiple;
    } else if (currentType === "single") {
      if (!currentCorrect.trim()) {
        alert("Please provide the correct answer for Single Choice.");
        return;
      }
    } else if (currentType === "short") {
      // Short Answer සඳහා Correct Answer Reference එක විකල්ප වේ (Optional)
      finalCorrectAnswer = currentCorrect.trim() ? currentCorrect : "";
    }

    let calculatedMarks = currentMarks;
    let finalSubQuestions: SubQuestion[] = [];

    if (currentType === "essay") {
      if (hasSubQuestions && currentSubQuestions.length > 0) {
        if (currentSubQuestions.some(sq => !sq.subQuestionText.trim())) {
          alert("Please fill all essay sub-question texts.");
          return;
        }
        finalSubQuestions = currentSubQuestions;
        calculatedMarks = currentSubQuestions.reduce((sum, sq) => sum + sq.marks, 0);
      } else {
        calculatedMarks = currentMarks;
      }
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentType,
      questionText: currentText,
      imageFile: currentImageFile,
      imageUrl: currentImageFile ? currentImageFile.name : undefined,
      options: (currentType === "mcq" || currentType === "single") ? currentOptions : [],
      correctAnswer: finalCorrectAnswer,
      marks: calculatedMarks,
      subQuestions: (currentType === "essay" && hasSubQuestions && finalSubQuestions.length > 0) ? finalSubQuestions : undefined,
    };

    setQuestions([...questions, newQuestion]);
    
    setCurrentText("");
    setCurrentImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setCurrentOptions(["", ""]);
    setCurrentCorrect("");
    setCurrentCorrectMultiple([]);
    setHasSubQuestions(false);
    setCurrentSubQuestions([{ id: Date.now().toString(), subQuestionText: "", marks: 5 }]);
    setCurrentMarks(3);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmitToAdmin = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("duration", duration);

    const questionsForServer = questions.map(({ imageFile, ...rest }) => rest);
    formData.append("questions", JSON.stringify(questionsForServer));

    questions.forEach((q, index) => {
      if (q.imageFile) {
        formData.append(`questionImage_${index}`, q.imageFile);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/quiz/quizzes", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      if (response.status === 201) {
        setShowSuccessPopup(true);
        setTitle("");
        setDescription("");
        setQuestions([]);
        setStep(1);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Failed to connect with the server.");
    }
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-300 space-y-8 ${
      darkMode ? "bg-slate-900 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"
    }`}>
      
      {/* Header Section */}
      <div className={`pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b ${
        darkMode ? "border-slate-800" : "border-slate-200"
      }`}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 tracking-tight">
            <div className={`p-2.5 rounded-2xl border shadow-inner ${
              darkMode ? "bg-indigo-950/50 text-indigo-400 border-indigo-900/50" : "bg-indigo-50 text-indigo-600 border-indigo-100"
            }`}>
              <FileText size={24} />
            </div>
            Create New Quiz
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Design your quiz questions cleanly and submit them seamlessly for admin approval.
          </p>
        </div>
        
        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold shadow-sm border ${
            darkMode ? "bg-slate-800/80 border-slate-700/60 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <Award size={16} className="text-indigo-500" /> Total Marks: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalQuizMarks}</span>
          </div>
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold shadow-sm border ${
            darkMode ? "bg-slate-800/80 border-slate-700/60 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <HelpCircle size={16} className="text-indigo-500" /> Questions: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Step Indicator Tabs */}
      <div className={`flex border-b text-sm font-semibold ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`pb-4 px-6 border-b-2 transition-all flex items-center gap-2.5 ${
            step === 1
              ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
          }`}>1</span>
          Basic Details
        </button>
        <button
          type="button"
          onClick={() => {
            if (!title.trim()) {
              alert("Please enter the quiz title first.");
              return;
            }
            setStep(2);
          }}
          className={`pb-4 px-6 border-b-2 transition-all flex items-center gap-2.5 ${
            step === 2
              ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 2 ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
          }`}>2</span>
          Add Questions & Submit
        </button>
      </div>

      {/* STEP 1: Basic Details */}
      {step === 1 && (
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm backdrop-blur-md space-y-6 ${
          darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
        }`}>
          <h2 className={`font-bold text-base ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
            Step 1: Enter Basic Quiz Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Grade 10 - Science Unit Test"
                className={`w-full p-3 text-sm border rounded-xl outline-none transition-all shadow-sm ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white focus:border-indigo-400" : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                <Clock size={14} className="text-indigo-500" /> Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={`w-full p-3 text-sm border rounded-xl outline-none transition-all shadow-sm cursor-pointer ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                }`}
              >
                <option value="30">30 Mins</option>
                <option value="60">1 Hour</option>
                <option value="90">1.5 Hours</option>
                <option value="120">2 Hours</option>
                <option value="150">2.5 Hours</option>
                <option value="180">3 Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this quiz tests..."
              className={`w-full p-3 text-sm border rounded-xl outline-none transition-all shadow-sm ${
                darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
              }`}
              rows={4}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNextToQuestions}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              Next: Add Questions <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Add Questions & Review */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Inputs */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border shadow-sm backdrop-blur-md space-y-6 ${
            darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <h2 className={`font-bold text-base ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                Step 2: Add Questions
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Edit Basic Details
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Question Type</label>
                <select
                  value={currentType}
                  onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  className={`w-full p-2.5 text-xs sm:text-sm border rounded-xl outline-none shadow-sm cursor-pointer ${
                    darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="single">Single Choice (MCQ)</option>
                  <option value="short">Short Answer</option>
                  <option value="essay">Essay / Structured Questions</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Marks</label>
                <input
                  type="number"
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Number(e.target.value))}
                  disabled={currentType === "essay" && hasSubQuestions}
                  className={`w-full p-2.5 text-xs sm:text-sm border rounded-xl outline-none disabled:opacity-50 shadow-sm ${
                    darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                {currentType === "essay" ? "Essay Question / Main Passage / Instructions" : "Question Text"}
              </label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={currentType === "essay" ? "Enter paragraph, essay question or instructions..." : "Type your question here clearly..."}
                className={`w-full p-3 text-xs sm:text-sm border rounded-xl outline-none shadow-sm ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                }`}
                rows={currentType === "essay" ? 3 : 2}
              />
            </div>

            {/* Image Upload with Preview */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                <ImageIcon size={14} className="text-indigo-500" /> Upload Question / Passage Image (Optional)
              </label>
              <div className={`flex items-center gap-3 p-3 rounded-xl border border-dashed ${
                darkMode ? "border-slate-600 bg-slate-800/60" : "border-slate-300 bg-white"
              }`}>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setCurrentImageFile(file);
                      setImagePreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold cursor-pointer ${
                    darkMode ? "text-slate-400 file:bg-indigo-950 file:text-indigo-300" : "text-slate-500 file:bg-indigo-50 file:text-indigo-700"
                  }`}
                />
                {currentImageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentImageFile(null);
                      setImagePreviewUrl(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className={`p-2 rounded-xl transition shrink-0 ${darkMode ? "text-slate-400 hover:text-red-400 bg-slate-700" : "text-slate-400 hover:text-red-500 bg-slate-100"}`}
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {imagePreviewUrl && (
                <div className="mt-3 relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-md">
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* MCQ Options */}
            {currentType === "mcq" && (
              <div className={`p-4 rounded-2xl border shadow-sm space-y-3 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex justify-between items-center">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Answer Options (Check all correct answers)</label>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${darkMode ? "bg-indigo-950/60 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>Multiple selections allowed</span>
                </div>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={currentCorrectMultiple.includes(opt) && opt.trim() !== ""}
                      onChange={() => handleToggleMultipleCorrect(opt)}
                      className={`w-4 h-4 text-indigo-600 rounded cursor-pointer ${darkMode ? "border-slate-600 bg-slate-800" : "border-slate-300"}`}
                    />
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className={`w-full p-2.5 text-xs sm:text-sm border rounded-xl shadow-sm ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                    />
                    {currentOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 mt-2 hover:underline p-1"
                >
                  <Plus size={16} /> Add another option
                </button>
              </div>
            )}

            {/* Single Choice Options */}
            {currentType === "single" && (
              <div className={`p-4 rounded-2xl border shadow-sm space-y-3 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex justify-between items-center">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Answer Options (Select 1 correct answer)</label>
                </div>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="radio"
                      name="singleCorrectRadio"
                      checked={currentCorrect === opt && opt.trim() !== ""}
                      onChange={() => setCurrentCorrect(opt)}
                      className={`w-4 h-4 text-indigo-600 cursor-pointer ${darkMode ? "border-slate-600 bg-slate-800" : "border-slate-300"}`}
                    />
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className={`w-full p-2.5 text-xs sm:text-sm border rounded-xl shadow-sm ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                    />
                    {currentOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 mt-2 hover:underline p-1"
                >
                  <Plus size={16} /> Add another option
                </button>
              </div>
            )}

            {/* Essay Sub-questions Toggle & Builder */}
            {currentType === "essay" && (
              <div className={`p-4 rounded-2xl border shadow-sm space-y-4 ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold flex items-center gap-2.5 cursor-pointer ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <input 
                      type="checkbox"
                      checked={hasSubQuestions}
                      onChange={(e) => setHasSubQuestions(e.target.checked)}
                      className={`w-4 h-4 text-indigo-600 rounded ${darkMode ? "border-slate-600 bg-slate-800" : "border-slate-300"}`}
                    />
                    Add Sub-Questions (Optional parts like i, ii, iii)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                </div>

                {hasSubQuestions && (
                  <div className={`space-y-3 pt-3 border-t ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
                    {currentSubQuestions.map((sq, sIdx) => (
                      <div key={sq.id} className={`p-3 rounded-xl border space-y-2 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex justify-between items-center gap-2">
                          <span className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Part {sIdx + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-slate-500">Marks:</label>
                            <input
                              type="number"
                              value={sq.marks}
                              onChange={(e) => handleSubQuestionChange(sIdx, "marks", Number(e.target.value))}
                              className={`w-16 p-1.5 text-xs font-bold border rounded-lg text-center ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                              min={1}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubQuestion(sq.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={sq.subQuestionText}
                          onChange={(e) => handleSubQuestionChange(sIdx, "subQuestionText", e.target.value)}
                          placeholder={`Enter sub-question ${sIdx + 1} (e.g., Explain the process shown in Figure 1)`}
                          className={`w-full p-2.5 text-xs sm:text-sm border rounded-xl shadow-sm ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSubQuestion}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 mt-2 hover:underline p-1"
                    >
                      <Plus size={16} /> Add sub-question part
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Correct Answer input for Short Answer (Optional reference) */}
            {currentType === "short" && (
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Correct Answer Reference <span className="text-slate-400 font-normal lowercase">(optional - teacher can grade manually without this)</span>
                </label>
                <input
                  type="text"
                  value={currentCorrect as string}
                  onChange={(e) => setCurrentCorrect(e.target.value)}
                  placeholder="Provide standard correct answer reference (optional)"
                  className={`w-full p-3 text-xs sm:text-sm border rounded-xl shadow-sm outline-none ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddQuestionToQuiz}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Plus size={18} /> Add This Question to Quiz
            </button>
          </div>

          {/* Right Column: Added Questions List Preview & Submit Button */}
          <div className={`lg:col-span-5 p-6 rounded-2xl border shadow-sm flex flex-col justify-between backdrop-blur-md ${
            darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <div className={`flex justify-between items-center mb-4 pb-3 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
                <h3 className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Added Questions List</h3>
                <span className={`text-xs px-3 py-1 rounded-xl font-extrabold shadow-inner ${darkMode ? "bg-indigo-950/60 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                  {questions.length} Questions
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
                {questions.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 space-y-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-400"}`}>
                      <HelpCircle size={24} />
                    </div>
                    <p className="text-xs font-semibold">No questions added yet. Use the form on the left to add questions.</p>
                  </div>
                ) : (
                  questions.map((q, index) => {
                    let effectiveMarks = q.marks;
                    if (q.type === "essay" && q.subQuestions) {
                      effectiveMarks = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
                    }

                    return (
                      <div key={q.id} className={`p-4 border rounded-2xl flex justify-between items-start shadow-sm text-xs gap-3 transition-all ${
                        darkMode ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}>
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${
                              darkMode ? "bg-indigo-950/80 text-indigo-400 border-indigo-900/50" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }`}>
                              {q.type} • {effectiveMarks} Marks
                            </span>
                          </div>
                          <p className={`font-bold text-sm leading-snug ${darkMode ? "text-white" : "text-slate-800"}`}>
                            {index + 1}. {q.questionText}
                          </p>
                          
                          {q.imageUrl && (
                            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">📷 Image attached: {q.imageUrl}</span>
                          )}

                          {q.type === "mcq" && q.options && q.options.length > 0 && (
                            <div className="pl-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 border-l-2 border-indigo-500/40">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt);
                                return (
                                  <div key={oIdx} className={isCorrect ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""}>
                                    • {opt} {isCorrect && " (Correct)"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "single" && q.options && q.options.length > 0 && (
                            <div className="pl-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 border-l-2 border-indigo-500/40">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = opt === q.correctAnswer;
                                return (
                                  <div key={oIdx} className={isCorrect ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""}>
                                    • {opt} {isCorrect && " (Correct)"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "essay" && q.subQuestions && (
                            <div className="pl-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-300 border-l-2 border-indigo-500/40">
                              {q.subQuestions.map((sq, sqIdx) => (
                                <div key={sq.id} className="font-semibold">
                                  ({sqIdx + 1}) {sq.subQuestionText} <span className="text-indigo-500 font-bold">[{sq.marks} marks]</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type !== "mcq" && q.type !== "single" && q.type !== "essay" && (
                            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium pt-1">
                              <span className="text-slate-400 font-bold">Answer Ref:</span> {String(q.correctAnswer || "None specified (Manual grading)")}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition shrink-0"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`pt-4 border-t ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <button
                onClick={handleSubmitToAdmin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Send size={18} /> Submit Quiz to Admin
              </button>
            </div>
          </div>

        </div>
      )}

      <QuizUploadSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your quiz has been successfully submitted to the Admin for review and approval!"
      />
    </div>
  );
}