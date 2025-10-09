// components/CallButton.jsx
const CallButton = ({ handleVideoCall, isSending = false }) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
      <div className="flex-1"></div>
      <button 
        onClick={handleVideoCall} 
        disabled={isSending}
        className={`flex items-center gap-2 ${
          isSending 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium`}
      >
        <VideoIcon className="size-5" />
        {isSending ? 'Sending...' : 'Send Video Call Link'}
      </button>
    </div>
  );
};

const VideoIcon = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
    />
  </svg>
);

export default CallButton;