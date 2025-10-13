import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDarkMode = false,
  isLoading = false,
  type = "delete"
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'delete':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-red-500';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-300';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300';
      default:
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Container - Mobile responsive */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl mx-4 ${
                isDarkMode 
                  ? "bg-gray-800 text-white border border-gray-700" 
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {/* Icon and Title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                    <FaExclamationTriangle className={`text-lg sm:text-xl ${getIconColor()}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold break-words">{title}</h3>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4 sm:mb-6">
                  <p className={`text-sm sm:text-base leading-relaxed break-words ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {message}
                  </p>
                </div>
                
                {/* Actions - Stack vertically on mobile */}
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
                    } cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400`}
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-200 ${getConfirmButtonColor()} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="sm:inline">Deleting...</span>
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;