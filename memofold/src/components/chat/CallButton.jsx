// components/CallButton.jsx
const CallButton = ({ handleVideoCall, isSending = false }) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10"> {/* Sticky positioning */}
      <div className="flex justify-end">
        <button 
          onClick={handleVideoCall} 
          disabled={isSending}
          className={`flex items-center gap-2 ${
            isSending 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 cursor-pointer'
          } text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
        >
          <VideoIcon className="size-5" />
          {isSending ? 'Sending...' : 'Video Call'}
        </button>
      </div>
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