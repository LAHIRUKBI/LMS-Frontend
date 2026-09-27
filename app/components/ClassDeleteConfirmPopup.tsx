// src/app/components/ClassDeleteConfirmPopup.tsx

"use client";

import { AlertTriangle, X } from "lucide-react";

interface ClassDeleteConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClassDeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
}: ClassDeleteConfirmPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Class</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Are you sure you want to remove this class? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-xs rounded-xl transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 font-bold text-xs bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-sm transition-all"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}