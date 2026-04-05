import { createContext, useContext, useCallback } from 'react';
import Toast, { showToast as toastifyShowToast } from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'success', options = {}) => {
    // Map the type to match our design system
    let toastType;
    switch (type) {
      case 'success':
        toastType = 'success';
        break;
      case 'error':
        toastType = 'error';
        break;
      case 'alert':
        toastType = 'alert';
        break;
      case 'delete':
        toastType = 'delete';
        break;
      default:
        toastType = type === 'success' ? 'success' : 'error';
    }

    // Use the appropriate toastify method based on type
    const title = options.title;
    toastifyShowToast[toastType](message, title);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};
