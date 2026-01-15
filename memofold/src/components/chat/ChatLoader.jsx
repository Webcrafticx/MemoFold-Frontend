import { useEffect, useState } from "react";
import { localStorageService } from "../../services/localStorage";

// components/ChatLoader.jsx
const ChatLoader = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check dark mode on mount
    setDarkMode(localStorageService.getDarkMode());
  }, []);

  return (
    <div className={`flex justify-center items-center h-[93vh] ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} mx-auto mb-4`}></div>
        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading chat...</p>
      </div>
    </div>
  );
};

export default ChatLoader;