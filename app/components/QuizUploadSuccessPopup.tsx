// src/app/components/QuizUploadSuccessPopup.tsx

"use client";

import React from "react";
import { CheckCircle, X } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface QuizUploadSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function QuizUploadSuccessPopup({ isOpen, onClose, message }: QuizUploadSuccessPopupProps) {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all text-center space-y-4 ${
        darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex justify-end -mb-2">
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={32} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold">Successfully Submitted!</h3>
          <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}