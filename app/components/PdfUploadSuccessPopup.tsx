"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, Database, ArrowRight } from "lucide-react";

interface UploadSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function UploadSuccessPopup({ isOpen, onClose, message = "Document uploaded successfully!" }: UploadSuccessPopupProps) {
  // Animation state එක පාලනය කිරීම සඳහා
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // තත්පර 2.5 කට පසු Uploading Animation එක අවසන් කර Success එක පෙන්වයි
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2500); 
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border dark:border-slate-700 overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {isAnimating ? (
                // 1. Uploading Data Transfer Animation
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center w-full py-2"
                >
                  <div className="flex items-center justify-between w-full px-4 mb-8 mt-2">
                    {/* UI/Document Side */}
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>

                    {/* Transferring Arrows */}
                    <div className="flex space-x-2 overflow-hidden w-20 justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ x: [-15, 15], opacity: [0, 1, 0] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.2, 
                            delay: i * 0.3,
                            ease: "linear"
                          }}
                        >
                          <ArrowRight className="text-slate-400 dark:text-slate-500 w-5 h-5" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Database Side */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600"
                    >
                      <Database className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Uploading to Database...
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.3, ease: "easeInOut" }}
                      className="bg-indigo-600 h-full"
                    />
                  </div>
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
                    Success!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                    {message}
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 active:scale-[0.98]"
                  >
                    Continue
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