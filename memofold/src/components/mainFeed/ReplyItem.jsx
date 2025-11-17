import React from "react";
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
    // onAddReply,
    onReplySubmit,
    postId,
    activeReplyInputs,
}) => {
    // ✅ ADDED: State for profile pic errors
    const [profilePicError, setProfilePicError] = React.useState(false);

    const handleProfilePicError = (e) => {
        setProfilePicError(true);
        e.target.style.display = "none";
    };

    // Safe access to all props with fallbacks
    const replyKey = reply?._id || "unknown";

    // FIXED: Unique key for each reply's input box
    const replyInputKey = `${commentId}-${replyKey}`;

    // FIXED: Properly handle replyContent for this specific reply
    const currentReplyContent = replyContent
        ? typeof replyContent === "object"
            ? replyContent[replyInputKey] || ""
            : ""
        : "";

    // FIXED: Check if THIS specific reply's input is active
    const isReplyInputActive = activeReplyInputs
        ? typeof activeReplyInputs === "object"
            ? activeReplyInputs[replyInputKey] || false
            : false
        : false;

    // FIXED: Properly handle loading states for this reply
    const isCurrentlyReplying = isReplying
        ? typeof isReplying === "object"
            ? isReplying[replyInputKey] || false
            : false
        : false;

    const isCurrentlyLiking = isLikingReply
        ? typeof isLikingReply === "object"
            ? isLikingReply[replyKey] || false
            : false
        : false;

    const isCurrentlyDeleting = isDeletingReply
        ? typeof isDeletingReply === "object"
            ? isDeletingReply[replyKey] || false
            : false
        : false;

// Safe user data access
const replyUser = reply?.user || reply?.userId || {};

const replyUserId =
    reply?.user?.id ||        // case: reply.user.id
    reply?.userId?._id ||     // case: reply.userId._id
    replyUser?._id ||         // backup
    "unknown";

const replyUsername =
    replyUser?.username ||
    reply?.username ||
    "Unknown";

const replyUserProfilePic =
    replyUser?.profilePic ||
    replyUser?.profilepic ||
    reply?.profilePic ||
    reply?.profilepic ||
    "";


    // console.log(replyUserId)
    // console.log(reply)

    // Check if current user can delete reply
    const canDeleteReply = () => {
        const currentUserId = localStorage.getItem("userId");
        const currentUsername = localStorage.getItem("username");

        return (
            replyUser?._id === currentUserId ||
            replyUsername === currentUsername ||
            commentOwner === currentUsername ||
            replyUser?.id === currentUserId
        );
    };

    const handleReplySubmit = () => {
        if (!currentReplyContent?.trim()) {
            console.error("❌ Reply content is empty");
            return;
        }

        // if (onAddReply && postId && commentId) {
        //     // FIXED: Pass the replyInputKey to identify which reply we're replying to
        //     onAddReply(postId, commentId, replyInputKey);
        // } 
         if (onReplySubmit && postId && commentId) {
            onReplySubmit(postId, commentId, replyInputKey);
        }
        else {
            console.error("❌ Missing required parameters for reply:", {
                onAddReply: !!onAddReply,
                postId,
                commentId,
                replyInputKey,
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
                // FIXED: Use replyInputKey for reply-to-reply
                onSetReplyContent(replyInputKey, e.target.value);
            }
        }
    };

    const handleToggleReply = () => {
        if (onToggleReplyInput) {
            // FIXED: Use replyInputKey to toggle THIS specific reply's input
            onToggleReplyInput(replyInputKey);
        }
    };

    const handleLikeClick = (e) => {
        if (onLikeReply && replyKey && commentId) {
            onLikeReply(replyKey, commentId, e);
        }
    };

    const handleDeleteClick = () => {
        if (onDeleteReply && replyKey && commentId) {
            onDeleteReply(replyKey, commentId);
        }
    };

    const handleNavigateToProfile = () => {
        if (navigateToUserProfile && replyUserId && replyUserId !== "unknown") {
            navigateToUserProfile(replyUserId);
        } else {
            console.warn("Cannot navigate: Missing user ID", { replyUserId });
        }
    };

    if (!reply) {
        return null;
    }

    return (
        <div className="ml-4 md:ml-6 mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-start space-x-2">
                <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-600 cursor-pointer flex-shrink-0"
                    onClick={handleNavigateToProfile}
                >
                    {/* ✅ FIXED: Only show image if profilePic exists AND no error */}
                    {replyUserProfilePic && !profilePicError ? (
                        <img
                            src={replyUserProfilePic}
                            alt={replyUsername}
                            className="w-full h-full object-cover"
                            onError={handleProfilePicError}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs">
                            {replyUsername?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <span
                            className="font-semibold text-xs hover:text-blue-500 cursor-pointer truncate"
                            onClick={handleNavigateToProfile}
                        >
                            {replyUsername}
                        </span>
                        <span
                            className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            } whitespace-nowrap`}
                        >
                            {reply?.createdAt
                                ? formatDate(reply.createdAt)
                                : "Recently"}
                        </span>
                    </div>
                    <p
                        className={`text-xs whitespace-pre-line mt-1 break-words ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                    >
                        {reply?.content || ""}
                    </p>

                    <div className="mt-1 flex items-center justify-between flex-wrap gap-2">
                        <button
                            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                            onClick={handleLikeClick}
                            disabled={isCurrentlyLiking}
                        >
                            {isCurrentlyLiking ? (
                                <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : reply?.hasUserLiked ? (
                                <FaHeart className="text-xs text-red-500" />
                            ) : (
                                <FaRegHeart className="text-xs" />
                            )}
                            <span className="text-xs">
                                {reply?.likes?.length || 0}
                            </span>
                        </button>

                        <div className="flex space-x-2">
                            {/* Reply to reply functionality */}
                            <button
                                className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-xs"
                                onClick={handleToggleReply}
                                title="Reply to this reply"
                            >
                                <FaReply />
                            </button>

                            {canDeleteReply() && (
                                <button
                                    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                    onClick={handleDeleteClick}
                                    disabled={isCurrentlyDeleting}
                                    title="Delete reply"
                                >
                                    {isCurrentlyDeleting ? (
                                        <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaTrashAlt />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reply input for replying to replies - ONLY FOR THIS SPECIFIC REPLY */}
                    {isReplyInputActive && (
                        <div className="mt-2 ml-0 sm:ml-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <input
                                    type="text"
                                    className={`flex-1 px-3 py-1 rounded-full text-xs border ${
                                        isDarkMode
                                            ? "bg-gray-600 border-gray-500 text-white"
                                            : "bg-white border-gray-300 text-gray-800"
                                    } focus:outline-none focus:ring-1 focus:ring-blue-500 w-full`}
                                    placeholder={`Reply to ${replyUsername}...`}
                                    value={currentReplyContent || ""}
                                    onChange={handleInputChange}
                                    onKeyDownPress={handleInputKeyPress}
                                />
                                <div className="flex space-x-2 self-end sm:self-auto">
                                    <button
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            !currentReplyContent?.trim() ||
                                            isCurrentlyReplying
                                                ? "bg-blue-300 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                        } text-white transition-colors whitespace-nowrap`}
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
                                        className="px-2 py-1 rounded-full text-xs bg-gray-500 hover:bg-gray-600 text-white cursor-pointer whitespace-nowrap"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplyItem;
