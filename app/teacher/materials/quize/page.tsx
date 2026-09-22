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
        setShowSuccessPopup(true); // Default alert වෙනුවට අලංකාර popup එක පෙන්වීම
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
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Quiz</h1>
        <p className="text-sm text-gray-500">Add questions as a teacher and submit them for admin approval.</p>
      </div>

      {/* Quiz Details */}
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">1. Basic Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Grade 10 - Science (Magnetic Fields)"
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="This quiz tests students' understanding of..."
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Duration (in minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Add Questions Section */}
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-dashed border-gray-300">
        <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">2. Add Questions</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Question Type</label>
            <select
              value={currentType}
              onChange={(e) => setCurrentType(e.target.value as QuestionType)}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="short">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Marks</label>
            <input
              type="number"
              value={currentMarks}
              onChange={(e) => setCurrentMarks(Number(e.target.value))}
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Question Text</label>
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Type your question here..."
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <ImageIcon size={16} /> Image URL (Optional)
          </label>
          <input
            type="text"
            value={currentImage}
            onChange={(e) => setCurrentImage(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
          />
        </div>

        {currentType === "mcq" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Answer Options</label>
            {currentOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="text-red-500 p-2 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-1"
            >
              <Plus size={16} /> Add another option
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Correct Answer</label>
          <input
            type="text"
            value={currentCorrect}
            onChange={(e) => setCurrentCorrect(e.target.value)}
            placeholder={currentType === "mcq" ? "Type the correct option here" : "Provide the correct answer or grading guideline"}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-750 dark:border-gray-700 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleAddQuestionToQuiz}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition"
        >
          Add This Question to Quiz
        </button>
      </div>

      {/* Added Questions List Preview */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Added Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-400">No questions added yet.</p>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="p-4 border rounded-lg flex justify-between items-start bg-gray-50 dark:bg-gray-800">
              <div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold uppercase">
                  {q.type}
                </span>
                <p className="font-medium text-gray-800 dark:text-white mt-1">
                  {index + 1}. {q.questionText}
                </p>
                {q.imageUrl && (
                  <span className="text-xs text-gray-500 block mt-1">📷 Contains an image</span>
                )}
                <p className="text-xs text-green-600 mt-1 font-semibold">Correct Answer: {q.correctAnswer}</p>
              </div>
              <button
                onClick={() => handleRemoveQuestion(q.id)}
                className="text-red-500 hover:bg-red-50 p-1.5 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitToAdmin}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition shadow-lg"
      >
        <Send size={18} /> Send Database (Submit to Admin)
      </button>

      {/* Success Popup Component */}
      <QuizUploadSuccessPopup 
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your quiz has been successfully submitted to the Admin for review and approval!"
      />
    </div>
  );
}