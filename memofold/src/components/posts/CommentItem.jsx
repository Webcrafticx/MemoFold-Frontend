import { FaHeart, FaRegHeart, FaTrashAlt } from "react-icons/fa";
import { formatDate } from "../../utils/dateFormatter";

const CommentItem = ({ 
  comment, 
  post, 
  isDarkMode, 
  isLikingComment, 
  isDeletingComment, 
  onLikeComment, 
  onDeleteComment, 
  username, 
  navigateToUserProfile 
}) => {
  return (
    <div key={comment._id} className="flex items-start space-x-2">
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
        onClick={(e) => navigateToUserProfile(comment.userId?._id, e)}
      >
        {comment.userId?.profilePic ? (
          <img
            src={comment.userId.profilePic}
            alt={comment.userId.username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${
                comment.userId.username?.charAt(0).toUpperCase() || "U"
              }</span>`;
            }}
          />
        ) : (
          <span className="text-xs font-semibold text-gray-700">
            {comment.userId?.username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
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
            onClick={(e) => onLikeComment(comment._id, post._id, e)}
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

          {(comment.userId?.username === username ||
            post.userId?.username === username) && (
            <button
              className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
              onClick={(e) => onDeleteComment(comment._id, post._id, e)}
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
        </div>
      </div>
    </div>
  );
};

export default CommentItem;