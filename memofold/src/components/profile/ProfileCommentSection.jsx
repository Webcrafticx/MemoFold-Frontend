import React from "react";
import { FaTrashAlt, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ReplyItem from "../mainFeed/ReplyItem";

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
  formatDate,
  // Reply functionality props
  activeReplyInputs,
  replyContent,
  onToggleReplyInput,
  onReplySubmit,
  onSetReplyContent,
  onToggleReplies,
  onLikeReply,
  onDeleteReply,
  isReplying,
  isFetchingReplies,
  isLikingReply,
  isDeletingReply
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

  // Improved reply count detection
  const getReplyCount = (comment) => {
    // Priority: API replyCount -> actual replies length -> 0
    return comment.replyCount || (comment.replies && comment.replies.length) || 0;
  };

  // Improved hasReplies check
  const hasReplies = (comment) => {
    return getReplyCount(comment) > 0;
  };

  // Handle chevron click - API hit IMMEDIATELY when clicking UP chevron
  const handleChevronClick = async (postId, commentId, comment) => {
    const isRepliesVisible = comment.showReplies;
    
    if (!isRepliesVisible) {
      // Chevron UP → DOWN: IMMEDIATE API hit to fetch replies
      await onToggleReplies(postId, commentId);
    } else {
      // Chevron DOWN → UP: Just hide replies, no API hit
      await onToggleReplies(postId, commentId);
    }
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
            const replyKey = comment._id;
            
            const replyCount = getReplyCount(comment);
            const isRepliesVisible = comment.showReplies;

            return (
              <div key={comment._id} className="space-y-2">
                {/* Main Comment */}
                <div className="flex items-start space-x-2">
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
                    
                    {/* Comment Actions - Aligned to the right */}
                    <div className="flex items-center justify-end space-x-3 mt-1">
                      {/* Reply Button */}
                      <button
                        onClick={() => onToggleReplyInput(comment._id)}
                        className="text-blue-500 hover:text-blue-700 text-xs flex items-center cursor-pointer"
                      >
                        <FaReply className="mr-1" />
                      </button>

                      {/* View Replies Button - ONLY CHEVRON + COUNT */}
                      {hasReplies(comment) && (
                        <button
                          onClick={() => handleChevronClick(post._id, comment._id, comment)}
                          className="text-gray-500 hover:text-gray-700 text-xs flex items-center cursor-pointer"
                          disabled={isFetchingReplies[comment._id]}
                        >
                          {isRepliesVisible ? (
                            // Chevron DOWN (replies visible) - clicking will hide without API
                            <FaChevronDown className="mr-1" />
                          ) : (
                            // Chevron UP (replies hidden) - clicking will IMMEDIATELY fetch with API
                            <FaChevronUp className="mr-1" />
                          )}
                          <span className="ml-1">{replyCount}</span>
                          {isFetchingReplies[comment._id] && (
                            <div className="ml-1 inline-block h-2 w-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </button>
                      )}

                      {/* Delete button */}
                      {canDeleteComment(comment, post) && (
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
                        </button>
                      )}
                    </div>

                    {/* Reply Input for Main Comment */}
                    {activeReplyInputs[replyKey] && (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          className={`flex-1 px-3 py-1 rounded-full text-xs border ${
                            isDarkMode
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300 text-gray-800"
                          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          placeholder="Write a reply..."
                          value={replyContent[replyKey] || ""}
                          onChange={(e) => onSetReplyContent(replyKey, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              onReplySubmit(post._id, comment._id);
                            }
                          }}
                        />
                        <button
                          className={`px-2 py-1 rounded-full cursor-pointer text-xs ${
                            !replyContent[replyKey]?.trim() || isReplying[replyKey]
                              ? "bg-blue-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                          } text-white transition-colors`}
                          onClick={() => onReplySubmit(post._id, comment._id)}
                          disabled={!replyContent[replyKey]?.trim() || isReplying[replyKey]}
                        >
                          {isReplying[replyKey] ? "Posting..." : "Post"}
                        </button>
                        <button
                          onClick={() => onToggleReplyInput(comment._id)}
                          className="px-2 py-1 rounded-full text-xs bg-gray-500 hover:bg-gray-600 text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Replies Section */}
                    {isRepliesVisible && (
                      <div className="mt-2 space-y-2">
                        {isFetchingReplies[comment._id] ? (
                          <div className="text-center py-2">
                            <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs mt-1">Loading replies...</p>
                          </div>
                        ) : (
                          comment.replies?.map((reply) => (
                            <ReplyItem
                              key={reply._id}
                              reply={reply}
                              commentId={comment._id}
                              username={username}
                              commentOwner={commentUser.username}
                              isDarkMode={isDarkMode}
                              onLikeReply={onLikeReply}
                              onDeleteReply={onDeleteReply}
                              isLikingReply={isLikingReply}
                              isDeletingReply={isDeletingReply}
                              navigateToUserProfile={navigateToUserProfile}
                              onToggleReplyInput={onToggleReplyInput}
                              isReplying={isReplying}
                              replyContent={replyContent}
                              onSetReplyContent={onSetReplyContent}
                              onAddReply={onReplySubmit}
                              postId={post._id}
                              activeReplyInputs={activeReplyInputs}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
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