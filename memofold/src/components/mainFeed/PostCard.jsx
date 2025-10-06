import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import { formatDate } from "../../services/dateUtils";
import CommentSection from "./CommentSection";
import { useState } from "react";
import LikesModal from "./LikesModal";

const PostCard = ({
    post,
    isDarkMode,
    username,
    user,
    currentUserProfile,
    activeCommentPostId,
    loadingComments,
    commentContent,
    isCommenting,
    isLiking,
    likeCooldown,
    isLikingComment,
    isDeletingComment,
    activeReplies,
    replyContent,
    isReplying,
    isLikingReply,
    isDeletingReply,
    onLike,
    onToggleCommentDropdown,
    onCommentSubmit,
    onSetCommentContent,
    onLikeComment,
    onDeleteComment,
    onToggleReplies,
    onToggleReplyInput,
    onAddReply,
    onLikeReply,
    onDeleteReply,
    onSetReplyContent,
    navigateToUserProfile,
    onImagePreview,
    token,
}) => {
    const [showLikesModal, setShowLikesModal] = useState(false);

    // Updated function to get liked users based on API response
    const getLikedUsers = () => {
        // Use likesPreview from API
        if (post.likesPreview && post.likesPreview.length > 0) {
            return post.likesPreview;
        }
        return [];
    };

    const likedUsers = getLikedUsers();
    const totalLikes = post.likeCount || 0; // Use likeCount from API

    const handleShowAllLikes = (e) => {
        e.stopPropagation();
        setShowLikesModal(true);
    };

    const handleHideAllLikes = () => {
        setShowLikesModal(false);
    };

    // FIXED: Image error handler without optional chaining issue
    const handleImageError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
    };

    // FIXED: Profile pic error handler without optional chaining issue
    const handleProfilePicError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
    };

    return (
        <div
            className={`w-full max-w-2xl rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${
                isDarkMode
                    ? "bg-gray-800 text-gray-100"
                    : "bg-white text-gray-900"
            }`}
        >
            {/* Likes Modal */}
            <LikesModal
                postId={post._id}
                isOpen={showLikesModal}
                onClose={handleHideAllLikes}
                token={token}
                isDarkMode={isDarkMode}
            />

            <div
                className="flex items-center gap-3 mb-3 cursor-pointer"
                onClick={(e) => navigateToUserProfile(post.userId._id, e)}
            >
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {post.userId.profilePic ? (
                        <img
                            src={post.userId.profilePic}
                            alt={post.userId.username}
                            className="w-full h-full object-cover"
                            onError={handleProfilePicError}
                        />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg ${post.userId.profilePic ? 'hidden' : 'flex'}`}>
                        {post.userId.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                </div>

                <div>
                    <h3
                        className={`text-base font-semibold hover:text-blue-500 transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        {post.userId.realname ||
                            post.userId.username ||
                            "Unknown User"}
                    </h3>

                    <p
                        className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                        @{post.userId.username || "unknown"} ·{" "}
                        {formatDate(post.createdAt)}
                    </p>
                </div>
            </div>

            <p
                className={`leading-relaxed mb-3 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
            >
                {post.content || ""}
            </p>

            {post.image && (
                <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                    <img
                        src={post.image}
                        alt="Post"
                        className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl"
                        onClick={() => onImagePreview(post.image)}
                        onError={handleImageError}
                    />
                </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => onLike(post._id, e)}
                        disabled={isLiking[post._id] || likeCooldown[post._id]}
                        className={`flex items-center gap-1 ${
                            isLiking[post._id] || likeCooldown[post._id]
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        } hover:text-red-500 transition-colors cursor-pointer`}
                    >
                        {isLiking[post._id] ? (
                            <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : post.hasUserLiked ? (
                            <FaHeart className="text-xl text-red-500" />
                        ) : (
                            <FaRegHeart className="text-xl text-gray-400" />
                        )}
                        <motion.span
                            key={totalLikes}
                            initial={{ scale: 1 }}
                            animate={{ scale: [1.2, 1] }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm font-medium ${
                                post.hasUserLiked
                                    ? "text-red-500"
                                    : "text-gray-400"
                            }`}
                        >
                            {totalLikes}
                        </motion.span>
                    </motion.button>

                    {/* Liked by text - turant update hoga */}
                    {totalLikes > 0 && (
                        <div className="text-sm">
                            <div className="flex items-center flex-wrap">
                                {likedUsers.length > 0 ? (
                                    <>
                                        {likedUsers.slice(0, 2).map((user, index) => (
                                            <span
                                                key={index}
                                                className={`font-medium mr-1 ${
                                                    isDarkMode
                                                        ? "text-gray-300"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {user.username}
                                                {index < Math.min(2, likedUsers.length - 1) ? "," : ""}
                                            </span>
                                        ))}

                                        {totalLikes > 2 && (
                                            <button
                                                onClick={handleShowAllLikes}
                                                className={`font-medium cursor-pointer ${
                                                    isDarkMode
                                                        ? "text-blue-300"
                                                        : "text-blue-500"
                                                } hover:underline`}
                                            >
                                                and {totalLikes - 2} others
                                            </button>
                                        )}

                                        {totalLikes === 2 && likedUsers.length === 1 && (
                                            <span
                                                className={`font-medium mr-1 ${
                                                    isDarkMode
                                                        ? "text-gray-300"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                and 1 other
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleShowAllLikes}
                                        className={`font-medium cursor-pointer ${
                                            isDarkMode
                                                ? "text-blue-300"
                                                : "text-blue-500"
                                        } hover:underline`}
                                    >
                                        {totalLikes} {totalLikes === 1 ? "like" : "likes"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                    onClick={(e) => onToggleCommentDropdown(post._id, e)}
                    disabled={loadingComments[post._id]}
                >
                    <FaComment />
                    {/* FIXED: Use commentCount from API */}
                    <span className="text-sm">
                        {post.commentCount || 0}
                    </span>
                    {loadingComments[post._id] && (
                        <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                    )}
                </button>
            </div>

            <CommentSection
                post={post}
                username={username}
                currentUserProfile={currentUserProfile}
                user={user}
                isDarkMode={isDarkMode}
                activeCommentPostId={activeCommentPostId}
                loadingComments={loadingComments}
                commentContent={commentContent}
                isCommenting={isCommenting}
                isLikingComment={isLikingComment}
                isDeletingComment={isDeletingComment}
                activeReplies={activeReplies}
                replyContent={replyContent}
                isReplying={isReplying}
                isLikingReply={isLikingReply}
                isDeletingReply={isDeletingReply}
                onToggleCommentDropdown={onToggleCommentDropdown}
                onCommentSubmit={onCommentSubmit}
                onSetCommentContent={onSetCommentContent}
                onLikeComment={onLikeComment}
                onDeleteComment={onDeleteComment}
                onToggleReplies={onToggleReplies}
                onToggleReplyInput={onToggleReplyInput}
                onAddReply={onAddReply}
                onLikeReply={onLikeReply}
                onDeleteReply={onDeleteReply}
                onSetReplyContent={onSetReplyContent}
                navigateToUserProfile={navigateToUserProfile}
            />
        </div>
    );
};

export default PostCard;