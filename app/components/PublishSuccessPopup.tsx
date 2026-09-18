// src/app/components/PublishSuccessPopup.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CloudUpload, FileText, ArrowUp } from "lucide-react";

interface PublishSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
}

export default function PublishSuccessPopup({ isOpen, onClose, itemName = "Material" }: PublishSuccessPopupProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // තත්පර 2.5ක් animation එක පෙන්වා ඉන්පසු success පණිවිඩය පෙන්වයි
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border dark:border-slate-700 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isAnimating ? (
                // 1. Publishing Cloud Animation
                <motion.div
                  key="publishing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center w-full py-4"
                >
                  <div className="relative flex flex-col items-center justify-center h-32 w-full mb-4">
                    {/* Cloud Icon */}
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute top-0 text-blue-500 dark:text-blue-400"
                    >
                      <CloudUpload size={64} strokeWidth={1.5} />
                    </motion.div>

                    {/* Moving Arrow */}
                    <motion.div
                      animate={{ y: [20, -10], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      className="absolute top-12 text-blue-400 dark:text-blue-300"
                    >
                      <ArrowUp size={24} />
                    </motion.div>

                    {/* File Icon */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute bottom-0 bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm"
                    >
                      <FileText size={28} className="text-slate-600 dark:text-slate-300" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4">
                    Publishing to Students...
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
                    Making "{itemName}" available live
                  </p>
                </motion.div>
              ) : (
                // 2. Success Status Animation
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center w-full"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Published Live!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                    Students can now view and access this material in their portals.
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  >
                    Awesome
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}