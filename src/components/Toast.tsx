import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgClass = {
    success: 'bg-emerald-900 border-emerald-500 text-emerald-100',
    error: 'bg-rose-900 border-rose-500 text-rose-100',
    info: 'bg-blue-900 border-blue-500 text-blue-100',
  }[type];

  const icon = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" id="toast-success-icon" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" id="toast-error-icon" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" id="toast-info-icon" />,
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-sm w-full sm:w-auto ${bgClass}`}
      id="custom-toast-container"
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-sm font-medium flex-grow leading-snug font-sans">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
        id="toast-close-btn"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
