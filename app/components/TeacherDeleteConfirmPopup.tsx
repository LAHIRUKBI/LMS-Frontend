import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

interface DeleteConfirmPopupProps {
  teacherName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmPopup({
  teacherName,
  onConfirm,
  onCancel,
}: DeleteConfirmPopupProps) {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { darkMode } = useTheme();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isCountingDown && countdown === 0) {
      onConfirm(); // තත්පර 10 අවසන් වූ පසු Delete වීම සිදුවේ
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${
          darkMode
            ? "bg-slate-800 border-slate-700 text-white"
            : "bg-white border-slate-200 text-slate-900"
        } border`}
      >
        {!isCountingDown ? (
          // පළමු අවස්ථාව: Delete කරනවාද යන්න තහවුරු කිරීම
          <>
            <div className="flex items-start gap-4 mb-2">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                  darkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                }`}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Teacher?</h3>
                <p
                  className={`text-sm mt-2 leading-relaxed ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-current">"{teacherName}"</span>{" "}
                  from the system?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                No, Keep it
              </button>
              <button
                onClick={() => setIsCountingDown(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </>
        ) : (
          // දෙවන අවස්ථාව: තත්පර 10 ආපස්සට ගණනය කිරීම
          <div className="flex flex-col items-center py-6 text-center">
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
              <svg
                className="absolute h-full w-full -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={darkMode ? "#334155" : "#f1f5f9"}
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * countdown) / 10}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-3xl font-bold text-red-500">{countdown}</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Deleting Account...</h3>
            <p
              className={`text-sm mb-8 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              The account will be permanently removed.
            </p>
            <button
              onClick={onCancel}
              className={`w-full max-w-[200px] px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                darkMode
                  ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}