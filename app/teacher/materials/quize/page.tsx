"use client";

import React, { useState } from "react";
import { Plus, Trash2, Send, Image as ImageIcon, CheckCircle } from "lucide-react";
import axios from "axios";
import QuizUploadSuccessPopup from "@/app/components/QuizUploadSuccessPopup";

type QuestionType = "mcq" | "short" | "essay";

interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
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
  const [currentImage, setCurrentImage] = useState("");
  const [currentOptions, setCurrentOptions] = useState<string[]>(["", ""]);
  const [currentCorrect, setCurrentCorrect] = useState("");
  const [currentMarks, setCurrentMarks] = useState(5);

  // Success Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentType,
      questionText: currentText,
      imageUrl: currentImage,
      options: currentType === "mcq" ? currentOptions : [],
      correctAnswer: currentCorrect,
      marks: currentMarks,
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form fields
    setCurrentText("");
    setCurrentImage("");
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

    const quizData = {
      title,
      description,
      duration: Number(duration),
      questions,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/quiz/quizzes", quizData, {
        headers: { 
          "Content-Type": "application/json",
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
    <div className="max-w-6xl mx-auto p-3 sm:p-5 bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Create New Quiz</h1>
        <p className="text-xs text-gray-500">Add questions as a teacher and submit them for admin approval.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Form Inputs (Width: 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Quiz Details */}
          <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-200">1. Basic Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grade 10 - Science"
                  className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="30" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">30 Mins (0.5 Hour)</option>
                  <option value="60" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">1 Hour</option>
                  <option value="90" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">1.5 Hours</option>
                  <option value="120" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">2 Hours</option>
                  <option value="150" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">2.5 Hours</option>
                  <option value="180" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">3 Hours</option>
                  <option value="210" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">3.5 Hours</option>
                  <option value="240" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">4 Hours</option>
                  <option value="270" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">4.5 Hours</option>
                  <option value="300" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">5 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="This quiz tests students' understanding of..."
                className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                rows={1}
              />
            </div>
          </div>

          {/* Add Questions Section */}
          <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-200">2. Add Questions</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Question Type</label>
                <select
                  value={currentType}
                  onChange={(e) => setCurrentType(e.target.value as QuestionType)}
                  className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="mcq" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Multiple Choice (MCQ)</option>
                  <option value="short" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Short Answer</option>
                  <option value="essay" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Essay</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Marks</label>
                <input
                  type="number"
                  value={currentMarks}
                  onChange={(e) => setCurrentMarks(Number(e.target.value))}
                  className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Question Text</label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <ImageIcon size={12} /> Image URL (Optional)
              </label>
              <input
                type="text"
                value={currentImage}
                onChange={(e) => setCurrentImage(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {currentType === "mcq" && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Answer Options</label>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full p-1 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5"
                >
                  <Plus size={12} /> Add another option
                </button>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300">Correct Answer</label>
              <input
                type="text"
                value={currentCorrect}
                onChange={(e) => setCurrentCorrect(e.target.value)}
                placeholder={currentType === "mcq" ? "Type correct option" : "Provide correct answer"}
                className="w-full mt-0.5 p-1.5 text-xs border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestionToQuiz}
              className="w-full bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 font-medium transition text-xs shadow-sm"
            >
              Add This Question to Quiz
            </button>
          </div>

        </div>

        {/* Right Column: Added Questions List Preview & Submit Button (Width: 5 Cols) */}
        <div className="lg:col-span-5 space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-200">Added Questions</h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {questions.length} Total
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1">
              {questions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12">No questions added yet.</p>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="p-2.5 border rounded-lg flex justify-between items-start bg-white dark:bg-gray-900 shadow-sm text-xs">
                    <div className="space-y-1 pr-2">
                      <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold uppercase">
                        {q.type} ({q.marks}m)
                      </span>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {index + 1}. {q.questionText}
                      </p>
                      {q.imageUrl && (
                        <span className="text-[9px] text-gray-400 block">📷 Contains image</span>
                      )}
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Answer: {q.correctAnswer}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button at the bottom of the right column */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
            <button
              onClick={handleSubmitToAdmin}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition shadow text-xs sm:text-sm"
            >
              <Send size={16} /> Submit to Admin
            </button>
          </div>
        </div>

      </div>

      {/* Success Popup Component */}
      <QuizUploadSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your quiz has been successfully submitted to the Admin for review and approval!"
      />
    </div>
  );
}