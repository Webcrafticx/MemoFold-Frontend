import React from "react";
import { FaTrashAlt } from "react-icons/fa";

const ProfileCommentSection = ({
  post,
  isDarkMode,
  username,
  currentUserProfile,
  activeCommentPostId,
  commentContent,
  isCommenting,
  isFetchingComments,
  onCommentSubmit,
  onSetCommentContent,
  onDeleteComment,
  navigateToUserProfile,
  formatDate
}) => {
  if (activeCommentPostId !== post._id) return null;

  // Safe comment user data access
  const getCommentUser = (comment) => {
    return comment.userId || { 
      _id: 'unknown', 
      username: 'unknown', 
      realname: 'Unknown User',
      profilePic: null 
    };
  };

  const getCommentUsername = (comment) => {
    const userData = getCommentUser(comment);
    return userData.realname || userData.username || 'Unknown User';
  };

  const getCommentUserProfilePic = (comment) => {
    const userData = getCommentUser(comment);
    return userData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(getCommentUsername(comment))}&background=random`;
  };

  const getCommentUserId = (comment) => {
    const userData = getCommentUser(comment);
    return userData._id || 'unknown';
  };

  // Check if current user can delete comment
  const canDeleteComment = (comment, post) => {
    const commentUser = getCommentUser(comment);
    const postUser = post.userId || {};
    
    return (
      commentUser._id === currentUserProfile?._id ||
      commentUser.username === username ||
      postUser._id === currentUserProfile?._id ||
      post.username === username
    );
  };

  if (isFetchingComments) {
    return (
      <div className="text-center py-4">
        <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm mt-2">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Existing Comments */}
      {post.comments && post.comments.length > 0 ? (
        <div
          className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          {post.comments.map((comment) => {
            const commentUser = getCommentUser(comment);
            const commentUsername = getCommentUsername(comment);
            const commentUserProfilePic = getCommentUserProfilePic(comment);
            const commentUserId = getCommentUserId(comment);

            return (
              <div key={comment._id} className="flex items-start space-x-2">
                <img
                  src={commentUserProfilePic}
                  alt={commentUsername}
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(commentUsername)}&background=random`;
                  }}
                  onClick={() => navigateToUserProfile(commentUserId)}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                      onClick={() => navigateToUserProfile(commentUserId)}
                    >
                      {commentUsername}
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {comment.createdAt ? formatDate(comment.createdAt) : 'Recently'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line mt-1">
                    {comment.content}
                  </p>
                  
                  {/* Delete button */}
                  {canDeleteComment(comment, post) && (
                    <div className="mt-1 flex justify-end">
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this comment?")) {
                            onDeleteComment(comment._id, post._id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center cursor-pointer"
                        title="Delete comment"
                      >
                        <FaTrashAlt className="mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}

      {/* Add Comment Input */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 border border-gray-200 dark:border-gray-600 cursor-pointer">
          {currentUserProfile?.profilePic ? (
            <img
              src={currentUserProfile.profilePic}
              alt={username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
              onClick={() => navigateToUserProfile(currentUserProfile?._id)}
            />
          ) : null}
          <span
            className="flex items-center justify-center w-full h-full text-white font-semibold text-sm"
            style={
              currentUserProfile?.profilePic
                ? { display: "none" }
                : {}
            }
            onClick={() => navigateToUserProfile(currentUserProfile?._id)}
          >
            {username?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            className={`flex-1 px-3 py-2 rounded-full text-sm border ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800"
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="Write a comment..."
            value={commentContent[post._id] || ""}
            onChange={(e) =>
              onSetCommentContent({
                ...commentContent,
                [post._id]: e.target.value,
              })
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onCommentSubmit(post._id);
              }
            }}
          />
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              !commentContent[post._id]?.trim() || isCommenting[post._id]
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
            } text-white transition-colors`}
            onClick={() => onCommentSubmit(post._id)}
            disabled={!commentContent[post._id]?.trim() || isCommenting[post._id]}
          >
            {isCommenting[post._id] ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCommentSection;