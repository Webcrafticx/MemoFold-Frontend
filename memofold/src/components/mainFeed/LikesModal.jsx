// src/components/mainFeed/LikesModal.jsx
import { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import config from "../../hooks/config";

const LikesModal = ({ postId, isOpen, onClose, token, isDarkMode }) => {
  const [likes, setLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && postId) {
      fetchAllLikes();
    }
  }, [isOpen, postId]);

  const fetchAllLikes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the existing API endpoint that returns likesPreview
      const response = await fetch(`${config.apiUrl}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch likes');
      }
      
      const data = await response.json();
      const postsData = Array.isArray(data) ? data : data.posts || [];
      const currentPost = postsData.find(post => post._id === postId);
      
      if (currentPost && currentPost.likesPreview) {
        setLikes(currentPost.likesPreview);
      } else {
        setLikes([]);
      }
    } catch (err) {
      console.error("Error fetching all likes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md rounded-xl p-6 ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Liked by</h3>
          <button
            onClick={onClose}
            className={`text-2xl ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
          >
            &times;
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2">Loading likes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              <p>Error loading likes: {error}</p>
              <button
                onClick={fetchAllLikes}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : likes.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No likes yet</p>
          ) : (
            likes.map((user, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-200 last:border-b-0">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 mr-3">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.username}
                      className="w-8 h-8 object-cover rounded-full"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.realname || user.username}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;