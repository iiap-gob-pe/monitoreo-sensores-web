import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}

const ICONS = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <XCircleIcon className="w-5 h-5 text-red-500" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />
};

const BG = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200'
};

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg ${BG[toast.type] || BG.info} animate-slide-in max-w-sm w-full`}>
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type] || ICONS.info}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-gray-900">{toast.title}</p>}
        <p className="text-sm text-gray-700">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  let counter = 0;

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + (counter++);
    setToasts(prev => [...prev, { id, message, type, ...options }]);
    return id;
  }, []);

  const toast = {
    success: (msg, opts) => addToast(msg, 'success', opts),
    error: (msg, opts) => addToast(msg, 'error', { duration: 5000, ...opts }),
    warning: (msg, opts) => addToast(msg, 'warning', opts),
    info: (msg, opts) => addToast(msg, 'info', opts)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[99999] space-y-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}
