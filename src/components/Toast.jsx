import React from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast component that matches our design
const CustomToast = ({ type, title, message, closeToast }) => {
  const typeStyles = {
    success: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      icon: <CheckCircle className="text-green-500" size={24} />,
      title: 'Success',
      text: 'text-green-700',
      subtext: 'text-green-400',
      ring: 'ring-green-100',
    },
    error: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      icon: <AlertCircle className="text-red-500" size={24} />,
      title: 'Remove',
      text: 'text-red-700',
      subtext: 'text-red-400',
      ring: 'ring-red-100',
    },
    alert: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      icon: <AlertCircle className="text-yellow-500" size={24} />,
      title: 'Alert',
      text: 'text-yellow-700',
      subtext: 'text-yellow-400',
      ring: 'ring-yellow-100',
    },
    delete: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      icon: <AlertCircle className="text-red-500" size={24} />,
      title: 'Delete',
      text: 'text-red-700',
      subtext: 'text-red-400',
      ring: 'ring-red-100',
    },
  };

  const style = typeStyles[type] || typeStyles.success;
  const displayTitle = title || style.title;
  
  // Helper function to truncate message to one line
  const truncateMessage = (message, maxLength = 55) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  };

  // Helper function to truncate title if too long
  const truncateTitle = (title, maxLength = 20) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const displayMessage = truncateMessage(message);
  const displayTitleText = truncateTitle(displayTitle);

  return (
    <div className={`flex items-start gap-3 sm:gap-4 rounded-xl border ${style.border} ${style.bg} shadow ring-1 ${style.ring} p-3 sm:p-4 max-w-[calc(100vw-2rem)] sm:max-w-sm mx-2 sm:mx-0`}>
      <div className="mt-0.5 sm:mt-1 flex-shrink-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6">
          {React.cloneElement(style.icon, { size: 20, className: style.icon.props.className.replace('size={24}', '') })}
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className={`font-semibold text-sm sm:text-base ${style.text} truncate`} title={displayTitle}>
          {displayTitleText}
        </div>
        <div className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${style.subtext} truncate break-words`} title={message}>
          {displayMessage}
        </div>
      </div>
      <button
        className="ml-1 sm:ml-2 mt-0.5 sm:mt-1 text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
        onClick={closeToast}
        aria-label="Close"
        tabIndex={0}
      >
        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  );
};

// Toast utility functions
export const showToast = {
  success: (message, title) => {
    toast(<CustomToast type="success" title={title} message={message} />, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "!bg-transparent !p-0 !shadow-none",
      bodyClassName: "!p-0",
    });
  },
  error: (message, title) => {
    toast(<CustomToast type="error" title={title} message={message} />, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "!bg-transparent !p-0 !shadow-none",
      bodyClassName: "!p-0",
    });
  },
  alert: (message, title) => {
    toast(<CustomToast type="alert" title={title} message={message} />, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "!bg-transparent !p-0 !shadow-none",
      bodyClassName: "!p-0",
    });
  },
  delete: (message, title) => {
    toast(<CustomToast type="delete" title={title} message={message} />, {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      closeButton: false,
      className: "!bg-transparent !p-0 !shadow-none",
      bodyClassName: "!p-0",
    });
  },
};

// Toast Container component to be added to App.jsx
const Toast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar
      newestOnTop
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
      className="!top-4 sm:!top-6 !right-2 sm:!right-6 !w-auto !max-w-[calc(100vw-1rem)] sm:!max-w-sm"
      toastClassName="!bg-transparent !p-0 !shadow-none !mb-3 sm:!mb-4 !max-w-[calc(100vw-1rem)] sm:!max-w-sm !w-auto"
      bodyClassName="!p-0 !overflow-hidden"
      closeButton={false}
      style={{
        width: 'auto',
        maxWidth: 'calc(100vw - 1rem)', // Mobile: full width minus margins
      }}
    />
  );
};

export default Toast;