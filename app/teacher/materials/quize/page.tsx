"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Send, Image as ImageIcon, CheckCircle, Upload, X, HelpCircle, Award, Clock, FileText } from "lucide-react";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup";

type QuestionType = "mcq" | "short" | "essay";

interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  imageFile?: File | null;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export default function TeacherQuizCreator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentType, setCurrentType] = useState<QuestionType>("mcq");
  const [currentText, setCurrentText] = useState("");
  
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [currentOptions, setCurrentOptions] = useState<string[]>(["", ""]);
  const [currentCorrect, setCurrentCorrect] = useState("");
  const [currentMarks, setCurrentMarks] = useState(5);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ගුරුවරයාට පහසුවීම සඳහා මුළු ලකුණු ගණන සහ ප්‍රශ්න ගණන බලාගැනීමට
  const totalQuizMarks = questions.reduce((sum, q) => sum + q.marks, 0);

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

  const handleAddQuestionToQuiz = () => {
    if (!currentText.trim()) {
      alert("Please enter the question text.");
      return;
    }

    if (currentType === "mcq" && currentOptions.some(opt => !opt.trim())) {
      alert("Please fill all MCQ options or remove empty ones.");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentType,
      questionText: currentText,
      imageFile: currentImageFile,
      imageUrl: currentImageFile ? currentImageFile.name : undefined,
      options: currentType === "mcq" ? currentOptions : [],
      correctAnswer: currentCorrect,
      marks: currentMarks,
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form fields
    setCurrentText("");
    setCurrentImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setCurrentOptions(["", ""]);
    setCurrentCorrect("");
    setCurrentMarks(5);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmitToAdmin = async () => {
    if (!title.trim() || questions.length === 0) {
      alert("Please provide a quiz title and add at least one question.");
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
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Failed to connect with the server.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl space-y-6">
      {/* Header Section */}
      <div className="border-b pb-4 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="text-indigo-600" /> Create New Quiz
          </h1>
          <p className="text-xs text-gray-500 mt-1">Design your quiz questions and submit them seamlessly for admin approval.</p>
        </div>
        
        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Award size={14} /> Total Marks: {totalQuizMarks}
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <HelpCircle size={14} /> Questions: {questions.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. Basic Details */}
          <div className="space-y-3 bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span> 
              Basic Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grade 10 - Science Unit Test"
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Clock size={12} /> Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
              />
            </div>
          </div>

          {/* 2. Add Questions */}
          <div className="space-y-3 bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <h2 className="font-bold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span> 
              Add Questions
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Question Type</label>
                <select
                  value={currentType}
                  onChange={(e) => setCurrentType(e.target.value as QuestionType)}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="short">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Marks</label>
                <input
                  type="number"
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Number(e.target.value))}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Question Text</label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Type your question here clearly..."
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
              />
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                <ImageIcon size={14} /> Upload Question Image (Optional)
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
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-white cursor-pointer"
                />
                {currentImageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentImageFile(null);
                      setImagePreviewUrl(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {imagePreviewUrl && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* MCQ Options */}
            {currentType === "mcq" && (
              <div className="space-y-2 bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Answer Options</label>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
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
                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-1 hover:underline"
                >
                  <Plus size={14} /> Add another option
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Correct Answer</label>
              <input
                type="text"
                value={currentCorrect}
                onChange={(e) => setCurrentCorrect(e.target.value)}
                placeholder={currentType === "mcq" ? "Type the exact correct option text" : "Provide standard correct answer reference"}
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestionToQuiz}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-semibold transition text-xs shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add This Question to Quiz
            </button>
          </div>

        </div>

        {/* Right Column: Added Questions List Preview & Submit Button */}
        <div className="lg:col-span-5 space-y-3 bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-xs text-gray-700 dark:text-gray-200">Added Questions List</h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                {questions.length} Questions
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {questions.length === 0 ? (
                <div className="text-center py-20 text-gray-400 space-y-2">
                  <HelpCircle size={32} className="mx-auto opacity-40" />
                  <p className="text-xs">No questions added yet. Fill out the form on the left to start adding.</p>
                </div>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="p-3 border rounded-xl flex justify-between items-start bg-white dark:bg-gray-900 shadow-sm text-xs gap-2">
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                          {q.type} • {q.marks} Marks
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {index + 1}. {q.questionText}
                      </p>
                      
                      {q.imageUrl && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">📷 Image attached: {q.imageUrl}</span>
                      )}

                      {q.type === "mcq" && q.options && q.options.length > 0 && (
                        <div className="pl-2 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400 border-l-2 border-indigo-200 dark:border-indigo-800">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={opt === q.correctAnswer ? "text-emerald-600 font-semibold" : ""}>
                              • {opt} {opt === q.correctAnswer && " (Correct)"}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                        <span className="text-gray-400">Answer:</span> {q.correctAnswer}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition"
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
            <button
              onClick={handleSubmitToAdmin}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 font-bold flex items-center justify-center gap-2 transition shadow-lg text-xs sm:text-sm"
            >
              <Send size={16} /> Submit to Admin
            </button>
          </div>
        </div>

      </div>

      <QuizUploadSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your quiz has been successfully submitted to the Admin for review and approval!"
      />
    </div>
  );
}