import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { hideToast } from '../../store/slices/uiSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { toast } = useSelector(state => state.ui);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.show, dispatch]);

  if (!toast.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 toast-enter">
      <div className={`max-w-sm w-full border rounded-md shadow-lg ${getBgColor()}`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${getTextColor()}`}>
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => dispatch(hideToast())}
                className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;