import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      className: 'bg-slate-800 border-green-500/30 text-slate-200'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      className: 'bg-slate-800 border-red-500/30 text-slate-200'
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-400" />,
      className: 'bg-slate-800 border-blue-500/30 text-slate-200'
    }
  };

  const style = styles[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-fade-in backdrop-blur-md ${style.className}`}>
      {style.icon}
      <p className="text-sm font-medium">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-2 text-slate-500 hover:text-slate-300 transition-colors rounded-full p-1 hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;