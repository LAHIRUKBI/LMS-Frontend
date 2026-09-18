// src/app/components/DeleteConfirmPopup.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
}

export default function DeleteConfirmPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Document",
  itemName = "this document"
}: DeleteConfirmPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border dark:border-slate-700 relative overflow-hidden"
          >
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2 relative z-10">
              
              {/* Animated Warning Icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="bg-red-100 dark:bg-red-500/20 p-4 rounded-full mb-5 border border-red-200 dark:border-red-500/30"
              >
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
              </motion.div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-white">"{itemName}"</span>? This action cannot be undone.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white flex justify-center items-center gap-2 rounded-xl font-semibold transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 active:scale-[0.98]"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}