// src/app/components/VideoUploadSuccessPopup.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Video, Server, ArrowRight, Film, Radio } from "lucide-react";

interface VideoUploadSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  isUploading: boolean;
  progress: number;
}

export default function VideoUploadSuccessPopup({ 
  isOpen, 
  onClose, 
  message = "Video lesson uploaded successfully!",
  isUploading,
  progress 
}: VideoUploadSuccessPopupProps) {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border dark:border-slate-700 overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {isUploading ? (
                // 1. Video Uploading Progress Animation
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center w-full py-2"
                >
                  {/* Live/Recording Indicator */}
                  <div className="absolute top-4 left-5 flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-500/20">
                    <motion.div 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Uploading</span>
                  </div>

                  <div className="flex items-center justify-between w-full px-2 mb-8 mt-8">
                    {/* Video Source Icon */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 relative"
                    >
                      <Film className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"
                      >
                        <Video className="w-4 h-4 text-indigo-500" />
                      </motion.div>
                    </motion.div>

                    {/* Data Transfer Arrows */}
                    <div className="flex space-x-1.5 overflow-hidden w-20 justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ x: [-15, 15], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25, ease: "linear" }}
                        >
                          <ArrowRight className="text-slate-400 dark:text-slate-500 w-5 h-5" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Server Destination Icon */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                      className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600"
                    >
                      <Server className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 text-center">
                    Processing Video...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                    Please keep this window open
                  </p>
                  
                  {/* Real-time Percentage */}
                  <div className="flex justify-between w-full mb-1.5 px-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear", duration: 0.3 }}
                    >
                      {/* Shimmer Effect inside progress bar */}
                      <motion.div 
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-white/30 skew-x-12 w-1/2"
                      />
                    </motion.div>
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
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                    <CheckCircle2 className="w-24 h-24 text-green-500 mb-4 relative z-10" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Upload Complete!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm text-center mb-8 leading-relaxed px-2">
                    {message}
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 active:scale-[0.98]"
                  >
                    Done
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