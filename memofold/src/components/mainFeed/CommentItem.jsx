import { FaHeart, FaRegHeart, FaTrashAlt, FaReply, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { formatDate } from "../../services/dateUtils";
import ReplyItem from "./ReplyItem";

const CommentItem = ({
  comment,
  postId,
  username,
  postOwner,
  isDarkMode,
  onLikeComment,
  onDeleteComment,
  onToggleReplyInput,
  onLikeReply,
  onDeleteReply,
  onToggleReplies,
  onAddReply,
  isLikingComment,
  isDeletingComment,
  isLikingReply,
  isDeletingReply,
  replyContent,
  setReplyContent,
  isReplying,
  activeReplies,
  navigateToUserProfile,
}) => {
  const hasReplies = (comment.replyCount && comment.replyCount > 0) || (comment.replies && comment.replies.length > 0);
  const isRepliesVisible = activeReplies[comment._id];

  const handleProfilePicError = (e) => {
    e.target.style.display = "none";
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = "flex";
    }
  };

  return (
    <div className="flex items-start space-x-2">
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
        onClick={(e) => navigateToUserProfile(comment.userId?._id, e)}
      >
        {comment.userId?.profilePic ? (
          <img
            src={comment.userId.profilePic}
            alt={comment.userId.username}
            className="w-full h-full object-cover"
            onError={handleProfilePicError}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm ${comment.userId?.profilePic ? 'hidden' : 'flex'}`}>
          {comment.userId?.username?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span
            className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
            onClick={(e) => navigateToUserProfile(comment.userId?._id, e)}
          >
            {comment.userId?.username || "Unknown"}
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p
          className={`text-sm whitespace-pre-line mt-1 ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {comment.content}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <button
            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
            onClick={(e) => onLikeComment(comment._id, postId, e)}
            disabled={isLikingComment[comment._id]}
          >
            {isLikingComment[comment._id] ? (
              <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : comment.hasUserLiked ? (
              <FaHeart className="text-xs text-red-500" />
            ) : (
              <FaRegHeart className="text-xs" />
            )}
            <span className="text-xs">
              {comment.likes?.length || 0}
            </span>
          </button>

          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-xs"
              onClick={(e) => onToggleReplyInput(comment._id, null, e)}
              title="Reply to comment"
            >
              <FaReply />
            </button>

            {(comment.userId?.username === username || postOwner === username) && (
              <button
                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                onClick={(e) => onDeleteComment(comment._id, postId, e)}
                disabled={isDeletingComment[comment._id]}
                title="Delete comment"
              >
                {isDeletingComment[comment._id] ? (
                  <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaTrashAlt />
                )}
              </button>
            )}

            {hasReplies && (
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-xs flex items-center space-x-1"
                onClick={(e) => onToggleReplies(comment._id, e)}
                title={isRepliesVisible ? "Hide replies" : "Show replies"}
              >
                {isRepliesVisible ? <FaChevronDown /> : <FaChevronRight />}
                <span>{comment.replyCount || comment.replies?.length || 0}</span>
              </button>
            )}
          </div>
        </div>

        {comment.showReplyInput && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
              <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs">
                {username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                className={`flex-1 px-3 py-1 rounded-full text-xs border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Write a reply..."
                value={replyContent[comment._id] || ""}
                onChange={(e) =>
                  setReplyContent({
                    ...replyContent,
                    [comment._id]: e.target.value,
                  })
                }
              />
              <button
                className={`px-2 py-1 rounded-full text-xs ${
                  !replyContent[comment._id]?.trim() || isReplying[comment._id]
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white transition-colors`}
                onClick={(e) => onAddReply(comment._id, postId, e)}
                disabled={
                  !replyContent[comment._id]?.trim() || isReplying[comment._id]
                }
              >
                {isReplying[comment._id] ? (
                  <span className="inline-block h-2 w-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Reply"
                )}
              </button>
            </div>
          </div>
        )}

        {isRepliesVisible && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                commentId={comment._id}
                username={username}
                commentOwner={comment.userId?.username}
                isDarkMode={isDarkMode}
                onLikeReply={onLikeReply}
                onDeleteReply={onDeleteReply}
                onToggleReplyInput={onToggleReplyInput}
                isLikingReply={isLikingReply}
                isDeletingReply={isDeletingReply}
                navigateToUserProfile={navigateToUserProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;