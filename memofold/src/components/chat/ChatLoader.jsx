// components/ChatLoader.jsx
const ChatLoader = () => {
  return (
    <div className="flex justify-center items-center h-[93vh] bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading chat...</p>
      </div>
    </div>
  );
};

export default ChatLoader;