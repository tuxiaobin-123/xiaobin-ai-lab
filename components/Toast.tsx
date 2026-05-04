'use client';

import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />,
    error: <XCircle size={16} className="text-rose-400 flex-shrink-0" />,
    info: <AlertCircle size={16} className="text-indigo-400 flex-shrink-0" />,
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 shadow-2xl shadow-black/50 animate-in slide-in-from-right-4 duration-300">
      {icons[toast.type]}
      <span className="text-sm text-gray-200">{toast.message}</span>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-gray-500 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
