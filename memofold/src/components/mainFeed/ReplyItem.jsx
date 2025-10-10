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
}) => {
    const handleProfilePicError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
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
                            {/* FIXED: Removed reply to reply functionality to simplify */}

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
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
