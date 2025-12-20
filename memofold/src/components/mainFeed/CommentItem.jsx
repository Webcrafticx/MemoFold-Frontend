import {
    FaHeart,
    FaRegHeart,
    FaTrashAlt,
    FaReply,
    FaChevronDown,
    FaChevronRight,
} from "react-icons/fa";
import { formatDate, getTimeDifference } from "../../services/dateUtils";
import ReplyItem from "./ReplyItem";
import { highlightMentionsAndHashtags } from "../../utils/highlightMentionsAndHashtags.jsx";

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
    onSetReplyContent,
    isReplying,
    activeReplies,
    navigateToUserProfile,
    activeReplyInputs, // ✅ PROFILE-MATCHING: Active reply inputs state
}) => {
    const hasReplies =
        (comment.replyCount && comment.replyCount > 0) ||
        (comment.replies && comment.replies.length > 0);
    const isRepliesVisible = activeReplies[comment._id];

    const handleProfilePicError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
    };

    // ✅ PROFILE-MATCHING: Same key generation as profile
    const commentReplyKey = comment._id;

    // ✅ PROFILE-MATCHING: Check if THIS specific comment's reply input is active
    const isReplyInputActive = activeReplyInputs
        ? typeof activeReplyInputs === "object"
            ? activeReplyInputs[commentReplyKey] || false
            : false
        : false;

    // ✅ PROFILE-MATCHING: Properly handle loading state for this comment's reply
    const isCurrentlyReplying = isReplying
        ? typeof isReplying === "object"
            ? isReplying[commentReplyKey] || false
            : false
        : false;

    // ✅ PROFILE-MATCHING: Properly handle reply content for this specific comment
    const currentReplyContent = replyContent
        ? typeof replyContent === "object"
            ? replyContent[commentReplyKey] || ""
            : ""
        : "";

    const handleReplySubmit = () => {
        if (!currentReplyContent?.trim()) {
            console.error("❌ Reply content is empty");
            return;
        }

        if (onAddReply && postId && comment._id) {
            // ✅ PROFILE-MATCHING: Pass the replyInputKey to identify which comment we're replying to
            onAddReply(postId, comment._id, commentReplyKey);
        } else {
            console.error("❌ Missing required parameters for reply:", {
                onAddReply: !!onAddReply,
                postId,
                commentId: comment._id,
                replyInputKey: commentReplyKey,
            });
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
            handleReplySubmit();
        }
    };

    const handleInputChange = (e) => {
        if (onSetReplyContent) {
            if (typeof onSetReplyContent === "function") {
                // ✅ PROFILE-MATCHING: Use commentReplyKey for main comment replies
                onSetReplyContent(commentReplyKey, e.target.value);
            }
        }
    };

    const handleToggleReply = () => {
        if (onToggleReplyInput) {
            // ✅ PROFILE-MATCHING: Use commentReplyKey to toggle THIS specific comment's reply input
            onToggleReplyInput(commentReplyKey);
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
                <div
                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm ${
                        comment.userId?.profilePic ? "hidden" : "flex"
                    }`}
                >
                    {comment.userId?.username?.charAt(0).toUpperCase() || "U"}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span
                        className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                        onClick={(e) =>
                            navigateToUserProfile(comment.userId?._id, e)
                        }
                    >
                        {comment.userId?.username || "Unknown"}
                    </span>
                    <span
                        className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                        {getTimeDifference(comment.createdAt)}
                    </span>
                </div>
                <p
                    className={`text-sm whitespace-pre-line mt-1 ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                >
                    {highlightMentionsAndHashtags(comment.content)}
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
                            // ✅ PROFILE-MATCHING: Use same toggle function as profile
                            onClick={handleToggleReply}
                            title="Reply to comment"
                        >
                            <FaReply />
                        </button>

                        {(comment.userId?.username === username ||
                            postOwner === username) && (
                            <button
                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                onClick={(e) =>
                                    onDeleteComment(comment._id, postId, e)
                                }
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
                                className={`flex items-center space-x-1 transition-colors cursor-pointer text-xs ${
                                    isDarkMode
                                        ? "text-gray-200 hover:text-gray-200"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={(e) => onToggleReplies(comment._id, e)}
                                title={
                                    isRepliesVisible
                                        ? "Hide replies"
                                        : "Show replies"
                                }
                            >
                                {isRepliesVisible ? (
                                    <FaChevronDown />
                                ) : (
                                    <FaChevronRight />
                                )}
                                <span>
                                    {comment.replyCount ||
                                        comment.replies?.length ||
                                        0}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ PROFILE-MATCHING: ENHANCED REPLY INPUT - SAME AS PROFILE */}
                {isReplyInputActive && (
                    <div className="mt-2 ml-2">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                                type="text"
                                className={`flex-1 px-3 py-1 rounded-full text-xs border ${
                                    isDarkMode
                                        ? "bg-gray-600 border-gray-500 text-white"
                                        : "bg-white border-gray-300 text-gray-800"
                                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                placeholder="Write a reply..."
                                value={currentReplyContent || ""}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyPress}
                            />
                            <div className="flex space-x-2">
                                <button
                                    className={`px-3 py-1 rounded-full cursor-pointer text-xs ${
                                        !currentReplyContent?.trim() ||
                                        isCurrentlyReplying
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                    } text-white transition-colors flex-1`}
                                    onClick={handleReplySubmit}
                                    disabled={
                                        !currentReplyContent?.trim() ||
                                        isCurrentlyReplying
                                    }
                                >
                                    {isCurrentlyReplying
                                        ? "Posting..."
                                        : "Post"}
                                </button>
                                <button
                                    onClick={handleToggleReply}
                                    className="px-3 py-1 rounded-full text-xs bg-gray-500 hover:bg-gray-600 text-white cursor-pointer flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ PROFILE-MATCHING: REPLIES SECTION - USING SAME REPLYITEM COMPONENT AS PROFILE */}
                {isRepliesVisible &&
                    comment.replies &&
                    comment.replies.length > 0 && (
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
                                    isReplying={isReplying}
                                    replyContent={replyContent}
                                    onSetReplyContent={onSetReplyContent}
                                    onAddReply={onAddReply}
                                    onReplySubmit={onAddReply}
                                    navigateToUserProfile={
                                        navigateToUserProfile
                                    }
                                    postId={postId}
                                    activeReplyInputs={activeReplyInputs}
                                />
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
};

export default CommentItem;
