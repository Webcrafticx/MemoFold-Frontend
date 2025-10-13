import { FaHeart, FaRegHeart, FaTrashAlt, FaReply } from "react-icons/fa";
import { formatDate } from "../../services/dateUtils";

const ReplyItem = ({
    reply,
    commentId,
    username,
    commentOwner,
    isDarkMode,
    onLikeReply,
    onDeleteReply,
    isLikingReply,
    isDeletingReply,
    navigateToUserProfile,
    onToggleReplyInput,
    isReplying,
    replyContent,
    onSetReplyContent,
    onAddReply,
}) => {
    const handleProfilePicError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
    };

    const handleReplySubmit = (e) => {
        if (e) e.preventDefault();
        onAddReply(commentId, reply.postId || reply._id, e);
    };

    return (
        <div className="ml-6 mt-2 pl-2 border-l-2 border-gray-300">
            <div className="flex items-start space-x-2">
                <div
                    className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                    onClick={(e) => navigateToUserProfile(reply.userId?._id, e)}
                >
                    {reply.userId?.profilePic ? (
                        <img
                            src={reply.userId.profilePic}
                            alt={reply.userId.username}
                            className="w-full h-full object-cover"
                            onError={handleProfilePicError}
                        />
                    ) : null}
                    <div
                        className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs ${
                            reply.userId?.profilePic ? "hidden" : "flex"
                        }`}
                    >
                        {reply.userId?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span
                            className="font-semibold text-xs hover:text-blue-500 cursor-pointer"
                            onClick={(e) =>
                                navigateToUserProfile(reply.userId?._id, e)
                            }
                        >
                            {reply.userId?.username || "Unknown"}
                        </span>
                        <span
                            className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            {formatDate(reply.createdAt)}
                        </span>
                    </div>
                    <p
                        className={`text-xs whitespace-pre-line mt-1 ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                    >
                        {reply.content}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                        <button
                            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                            onClick={(e) =>
                                onLikeReply(reply._id, commentId, e)
                            }
                            disabled={isLikingReply[reply._id]}
                        >
                            {isLikingReply[reply._id] ? (
                                <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : reply.hasUserLiked ? (
                                <FaHeart className="text-xs text-red-500" />
                            ) : (
                                <FaRegHeart className="text-xs" />
                            )}
                            <span className="text-xs">
                                {reply.likes?.length || 0}
                            </span>
                        </button>

                        <div className="flex space-x-2">
                            {/* Reply to reply functionality */}
                            <button
                                className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-xs"
                                onClick={(e) => onToggleReplyInput(commentId, reply._id, e)}
                                title="Reply to this reply"
                            >
                                <FaReply />
                            </button>

                            {(reply.userId?.username === username ||
                                commentOwner === username) && (
                                <button
                                    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                    onClick={(e) =>
                                        onDeleteReply(reply._id, commentId, e)
                                    }
                                    disabled={isDeletingReply[reply._id]}
                                    title="Delete reply"
                                >
                                    {isDeletingReply[reply._id] ? (
                                        <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaTrashAlt />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reply input for replying to replies */}
                    {reply.showReplyInput && (
                        <div className="mt-2 ml-2">
                            <form onSubmit={handleReplySubmit} className="flex flex-col space-y-2">
                                <textarea
                                    value={replyContent[commentId] || ""}
                                    onChange={(e) => onSetReplyContent(commentId, e.target.value)}
                                    placeholder={`Reply to ${reply.userId?.username || "this reply"}...`}
                                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                                        isDarkMode 
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                                    rows="2"
                                    maxLength="500"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={(e) => onToggleReplyInput(commentId, reply._id, e)}
                                        className={`px-3 py-1 text-xs rounded-lg ${
                                            isDarkMode 
                                                ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        } transition-colors cursor-pointer`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isReplying[commentId] || !replyContent[commentId]?.trim()}
                                        className={`px-3 py-1 text-xs rounded-lg text-white ${
                                            isReplying[commentId] || !replyContent[commentId]?.trim()
                                                ? "bg-blue-400 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                        } transition-colors`}
                                    >
                                        {isReplying[commentId] ? (
                                            <div className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            "Reply"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Nested replies (replies to this reply) */}
                    {reply.replies && reply.replies.length > 0 && (
                        <div className="mt-2">
                            {reply.replies.map((nestedReply) => (
                                <ReplyItem
                                    key={nestedReply._id}
                                    reply={nestedReply}
                                    commentId={commentId}
                                    username={username}
                                    commentOwner={commentOwner}
                                    isDarkMode={isDarkMode}
                                    onLikeReply={onLikeReply}
                                    onDeleteReply={onDeleteReply}
                                    onToggleReplyInput={onToggleReplyInput}
                                    isLikingReply={isLikingReply}
                                    isDeletingReply={isDeletingReply}
                                    isReplying={isReplying}
                                    replyContent={replyContent}
                                    onSetReplyContent={onSetReplyContent}
                                    onAddReply={onAddReply}
                                    navigateToUserProfile={navigateToUserProfile}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;