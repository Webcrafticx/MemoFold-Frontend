// src/components/mainFeed/MessageBanner.jsx
const MessageBanner = ({ type, message, onClose }) => {
  const styles = {
    error: "bg-red-100 text-red-700",
    success: "bg-green-100 text-green-700",
  };

  return (
    <div
      className={`fixed top-4 right-4 p-3 rounded-lg text-sm shadow-lg z-50 cursor-pointer ${styles[type]}`}
    >
      {message}
      <button
        onClick={onClose}
        className={`ml-2 font-bold cursor-pointer ${
          type === "error" ? "text-red-700" : "text-green-700"
        }`}
      >
        ×
      </button>
    </div>
  );
};

export default MessageBanner;