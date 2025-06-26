import React from 'react';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = "flex items-center p-4 mb-3 rounded-lg shadow-md border-l-4";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500`;
      case 'warning':
        return `${baseClasses} bg-amber-50 border-amber-500`;
      default:
        return `${baseClasses} bg-blue-50 border-blue-500`;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.type)}
          style={{ 
            animation: 'slide-in-right 0.3s ease-out forwards',
          }}
        >
          <div className="mr-3">{getToastIcon(toast.type)}</div>
          <div className="flex-1 mr-2">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};