const Notification = ({ message, type, onClose }) => {
  const bgColor = type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
  const textColor = type === "error" ? "text-red-700" : "text-green-700";
  
  return (
    <div className={`fixed top-4 right-4 p-3 rounded-lg text-sm shadow-lg z-50 cursor-pointer ${bgColor}`}>
      {message}
      <button
        onClick={onClose}
        className={`ml-2 font-bold cursor-pointer ${textColor}`}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;