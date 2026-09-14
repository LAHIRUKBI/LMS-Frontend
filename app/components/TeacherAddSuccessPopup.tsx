import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface SuccessPopupProps {
  title?: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessPopup({
  title = "Congratulation",
  message,
  onClose,
  duration = 5000, // මදක් හෙමින් ලෝඩ් වීමට කාලය තත්පර 5කට (5000ms) සකසා ඇත
}: SuccessPopupProps) {
  const [progress, setProgress] = useState(0);
  const [showCloseBtn, setShowCloseBtn] = useState(false); // කතිරය පෙන්වීමට අදාල state එක

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        // ඉර ලෝඩ් වී අවසන් වූ පසු ස්වයංක්‍රීයව close වීම නවතා, කතිරය පමණක් පෙන්වයි
        setShowCloseBtn(true); 
      } else {
        setProgress(newProgress);
      }
    }, 16); // Smooth animation සඳහා

    return () => clearInterval(interval);
  }, [duration]);

  return (
    // පිටුපස අඳුරු කර Popup එක තිරයේ හරි මැදට ගැනීමට අදාල කොටස
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Popup Box එක */}
      <div className="flex w-105 flex-col overflow-hidden rounded-[14px] bg-gradient-to-br from-[#166534] via-[#15803d] to-[#16a34a] text-white shadow-[0_12px_35px_rgba(34,197,94,0.35)] animate-in zoom-in-95 duration-300">
        <div className="flex items-center p-4 min-h-[72px]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-[17px] font-semibold leading-tight">{title}</h4>
            <p className="mt-1 text-sm text-green-50">{message}</p>
          </div>
          
          {/* ඉර ලෝඩ් වී අවසන් වූ පසු පමණක් කතිරය (Close button) පෙන්වීම */}
          {showCloseBtn && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 cursor-pointer text-white/70 transition-colors hover:text-white animate-in fade-in duration-300"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Progress Bar (ලෝඩ් වන ඉර) */}
        <div className="h-2 w-full bg-black/20">
          <div
            className="h-full bg-[#7ed49e]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
    </div>
  );
}