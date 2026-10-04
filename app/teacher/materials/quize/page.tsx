"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Send, Image as ImageIcon, CheckCircle, Upload, X, HelpCircle, Award, Clock, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Step management state: 1 for Basic Details, 2 for Add Questions
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
      
      {/* Header Section */}
      <div className="border-b pb-4 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="text-gray-700 dark:text-gray-300" /> Create New Quiz
          </h1>
          <p className="text-xs text-gray-500 mt-1">Design your quiz questions cleanly and submit them seamlessly for admin approval.</p>
        </div>
        
        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Award size={14} /> Total Marks: {totalQuizMarks}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <HelpCircle size={14} /> Questions: {questions.length}
          </div>
        </div>
      </div>

      {/* Step Indicator Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            step === 1
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-[10px]">1</span>
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
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
            step === 2
              ? "border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-[10px]">2</span>
          Add Questions & Submit
        </button>
      </div>

      {/* STEP 1: Basic Details */}
      {step === 1 && (
        <div className="space-y-4 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            Step 1: Enter Basic Quiz Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Grade 10 - Science Unit Test"
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Clock size={12} /> Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
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
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this quiz tests..."
              className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
              rows={3}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNextToQuestions}
              className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-5 py-2.5 rounded-lg hover:opacity-90 font-medium transition text-xs flex items-center gap-2"
            >
              Next: Add Questions <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Add Questions & Review */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 space-y-4 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                Step 2: Add Questions
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:underline flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Edit Basic Details
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Question Type</label>
                <select
                  value={currentType}
                  onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="single">Single Choice (MCQ)</option>
                  <option value="short">Short Answer</option>
                  <option value="essay">Essay / Structured Questions</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Marks</label>
                <input
                  type="number"
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Number(e.target.value))}
                  disabled={currentType === "essay" && hasSubQuestions}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none disabled:opacity-60"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {currentType === "essay" ? "Essay Question / Main Passage / Instructions" : "Question Text"}
              </label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder={currentType === "essay" ? "Enter paragraph, essay question or instructions..." : "Type your question here clearly..."}
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
                rows={currentType === "essay" ? 3 : 2}
              />
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                <ImageIcon size={14} /> Upload Question / Passage Image (Optional)
              </label>
              <div className="flex items-center gap-2">
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
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-white cursor-pointer"
                />
                {currentImageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentImageFile(null);
                      setImagePreviewUrl(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className="text-gray-500 hover:text-red-500 p-1.5 rounded-lg transition"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {imagePreviewUrl && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* MCQ Options */}
            {currentType === "mcq" && (
              <div className="space-y-2 bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Answer Options (Check all correct answers)</label>
                  <span className="text-[10px] text-gray-500">Multiple selections allowed</span>
                </div>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={currentCorrectMultiple.includes(opt) && opt.trim() !== ""}
                      onChange={() => handleToggleMultipleCorrect(opt)}
                      className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-medium text-gray-400 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    {currentOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 mt-1 hover:underline"
                >
                  <Plus size={14} /> Add another option
                </button>
              </div>
            )}

            {/* Single Choice Options */}
            {currentType === "single" && (
              <div className="space-y-2 bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Answer Options (Select 1 correct answer)</label>
                </div>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="singleCorrectRadio"
                      checked={currentCorrect === opt && opt.trim() !== ""}
                      onChange={() => setCurrentCorrect(opt)}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-medium text-gray-400 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    {currentOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 mt-1 hover:underline"
                >
                  <Plus size={14} /> Add another option
                </button>
              </div>
            )}

            {/* Essay Sub-questions Toggle & Builder */}
            {currentType === "essay" && (
              <div className="space-y-3 bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={hasSubQuestions}
                      onChange={(e) => setHasSubQuestions(e.target.checked)}
                      className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-0"
                    />
                    Add Sub-Questions (Optional parts like i, ii, iii)
                  </label>
                  <span className="text-[10px] text-gray-400">Optional</span>
                </div>

                {hasSubQuestions && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {currentSubQuestions.map((sq, sIdx) => (
                      <div key={sq.id} className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Part {sIdx + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-gray-500">Marks:</label>
                            <input
                              type="number"
                              value={sq.marks}
                              onChange={(e) => handleSubQuestionChange(sIdx, "marks", Number(e.target.value))}
                              className="w-16 p-1 text-xs border rounded bg-white dark:bg-gray-800"
                              min={1}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubQuestion(sq.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={sq.subQuestionText}
                          onChange={(e) => handleSubQuestionChange(sIdx, "subQuestionText", e.target.value)}
                          placeholder={`Enter sub-question ${sIdx + 1} (e.g., Explain the process shown in Figure 1)`}
                          className="w-full p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSubQuestion}
                      className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1 mt-1 hover:underline"
                    >
                      <Plus size={14} /> Add sub-question part
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Correct Answer input for Short Answer */}
            {currentType === "short" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Correct Answer Reference</label>
                <input
                  type="text"
                  value={currentCorrect as string}
                  onChange={(e) => setCurrentCorrect(e.target.value)}
                  placeholder="Provide standard correct answer reference"
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddQuestionToQuiz}
              className="w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-2.5 rounded-lg hover:opacity-90 font-medium transition text-xs flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add This Question to Quiz
            </button>
          </div>

          {/* Right Column: Added Questions List Preview & Submit Button */}
          <div className="lg:col-span-5 space-y-3 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-xs text-gray-800 dark:text-gray-200">Added Questions List</h3>
                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                  {questions.length} Questions
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
                {questions.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 space-y-2">
                    <HelpCircle size={28} className="mx-auto opacity-40" />
                    <p className="text-xs">No questions added yet. Use the form on the left to add questions.</p>
                  </div>
                ) : (
                  questions.map((q, index) => {
                    let effectiveMarks = q.marks;
                    if (q.type === "essay" && q.subQuestions) {
                      effectiveMarks = q.subQuestions.reduce((s, sq) => s + sq.marks, 0);
                    }

                    return (
                      <div key={q.id} className="p-3 border rounded-xl flex justify-between items-start bg-white dark:bg-gray-900 shadow-sm text-xs gap-2">
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                              {q.type} • {effectiveMarks} Marks
                            </span>
                          </div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {index + 1}. {q.questionText}
                          </p>
                          
                          {q.imageUrl && (
                            <span className="text-[10px] text-gray-500 block font-medium">📷 Image attached: {q.imageUrl}</span>
                          )}

                          {q.type === "mcq" && q.options && q.options.length > 0 && (
                            <div className="pl-2 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400 border-l-2 border-gray-200 dark:border-gray-700">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt);
                                return (
                                  <div key={oIdx} className={isCorrect ? "text-gray-900 dark:text-white font-medium" : ""}>
                                    • {opt} {isCorrect && " (Correct)"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "single" && q.options && q.options.length > 0 && (
                            <div className="pl-2 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400 border-l-2 border-gray-200 dark:border-gray-700">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = opt === q.correctAnswer;
                                return (
                                  <div key={oIdx} className={isCorrect ? "text-gray-900 dark:text-white font-medium" : ""}>
                                    • {opt} {isCorrect && " (Correct)"}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "essay" && q.subQuestions && (
                            <div className="pl-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-300 border-l-2 border-gray-200 dark:border-gray-700">
                              {q.subQuestions.map((sq, sqIdx) => (
                                <div key={sq.id} className="font-medium">
                                  ({sqIdx + 1}) {sq.subQuestionText} <span className="text-gray-500">[{sq.marks} marks]</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type !== "mcq" && q.type !== "single" && q.type !== "essay" && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium pt-1">
                              <span className="text-gray-400">Answer:</span> {String(q.correctAnswer)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition"
                          title="Delete Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSubmitToAdmin}
                className="w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-3 rounded-xl hover:opacity-90 font-medium flex items-center justify-center gap-2 transition text-xs sm:text-sm"
              >
                <Send size={16} /> Submit Quiz to Admin
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