import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState, useCallback, createContext, useContext } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return context;
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null, type: 'warning' });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        message,
        title: options.title || 'Confirmar accion',
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState(s => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(s => ({ ...s, open: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99998] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 p-2 rounded-full ${state.type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                <ExclamationTriangleIcon className={`w-6 h-6 ${state.type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{state.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{state.message}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition ${
                  state.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-scale-in { animation: scaleIn 0.2s ease-out; }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
