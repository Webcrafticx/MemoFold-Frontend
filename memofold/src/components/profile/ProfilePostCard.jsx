import React from "react";
import {
    FaHeart,
    FaRegHeart,
    FaComment,
    FaEdit,
    FaTrashAlt,
    FaPaperclip,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDate } from "../../services/dateUtils";
import { useNavigate } from "react-router-dom";
import ProfileCommentSection from "./ProfileCommentSection";

const ProfilePostCard = ({
    post,
    isDarkMode,
    username,
    currentUserProfile,
    onLike,
    onEditPost,
    onUpdatePost,
    onCancelEdit,
    onDeletePost,
    onImagePreview,
    navigateToUserProfile,
    activeCommentPostId,
    onToggleCommentDropdown,
    commentContent,
    onCommentSubmit,
    onSetCommentContent,
    isCommenting,
    onDeleteComment,
    isFetchingComments,
    token,
    // Likes modal prop
    onShowLikesModal,
    // Like loading state
    isLiking,
    // Edit state props
    editingPostId,
    editContent,
    onEditContentChange,
    isUpdatingPost,
    isDeletingPost,
    // File upload props
    editFiles = [],
    onEditFileSelect,
    onRemoveEditFile,
    // Existing image prop
    existingImage,
    onRemoveExistingImage,
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
    isDeletingReply,
}) => {
    const isOwner = post.userId?._id === currentUserProfile?._id;
    const isEditing = editingPostId === post._id;
    const navigate = useNavigate();

    // Properly handle like count
    const getLikeCount = () => {
        return post.likeCount || 0;
    };

    // Properly handle comment count
    const getCommentCount = () => {
        return post.commentCount || 0;
    };

    // Profile picture source properly handle karein - multiple fallbacks
    const getProfilePic = () => {
        if (
            post.userId?.profilePic &&
            post.userId.profilePic !==
                "https://ui-avatars.com/api/?name=User&background=random"
        ) {
            return post.userId.profilePic;
        }
        if (
            post.profilePic &&
            post.profilePic !==
                "https://ui-avatars.com/api/?name=User&background=random"
        ) {
            return post.profilePic;
        }
        if (
            currentUserProfile?.profilePic &&
            currentUserProfile.profilePic !==
                "https://ui-avatars.com/api/?name=User&background=random"
        ) {
            return currentUserProfile.profilePic;
        }
        const localStoragePic = localStorage.getItem("profilePic");
        if (
            localStoragePic &&
            localStoragePic !==
                "https://ui-avatars.com/api/?name=User&background=random"
        ) {
            return localStoragePic;
        }
        return null;
    };

    const getUsername = () => {
        return post.userId?.username || post.username || username || "User";
    };

    const getRealName = () => {
        return (
            post.userId?.realname ||
            currentUserProfile?.realname ||
            getUsername()
        );
    };

    const getUserId = () => {
        return post.userId?._id || currentUserProfile?._id;
    };

    // Get liked users for display - same logic as main feed
    const getLikedUsers = () => {
        // Use likesPreview from API
        if (post.likesPreview && post.likesPreview.length > 0) {
            return post.likesPreview;
        }
        return [];
    };

    const likedUsers = getLikedUsers();
    const totalLikes = getLikeCount();
    const isPostLiked = post.isLiked || false;

    const handleEditClick = () => {
        onEditPost(post._id);
    };

    const handleUpdateClick = () => {
        onUpdatePost(post._id);
    };

    const handleCancelClick = () => {
        onCancelEdit();
    };

    // Handle likes modal
    const handleShowLikes = (e) => {
        e.stopPropagation();
        if (onShowLikesModal && totalLikes > 0) {
            onShowLikesModal(post._id);
        }
    };
    const navigateToProfile = (userId) => {
        // Check if this is the current user
        const isCurrentUser = userId === getUserId();

        if (isCurrentUser) {
            navigate("/profile");
        } else {
            navigate(`/user/${userId}`);
        }
    };
    // File preview rendering function
    const renderFilePreview = (file) => {
        if (file.type.startsWith("image/")) {
            return (
                <div className="relative">
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                        onClick={() =>
                            onImagePreview(URL.createObjectURL(file))
                        }
                    />
                    <button
                        onClick={() =>
                            onRemoveEditFile(editFiles.indexOf(file))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
            );
        }
        return (
            <div
                className={`p-2 rounded-lg flex items-center ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                }`}
            >
                <span className="mr-2">📁</span>
                <span className="text-sm truncate max-w-xs">{file.name}</span>
                <button
                    onClick={() => onRemoveEditFile(editFiles.indexOf(file))}
                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    // Render existing image in edit mode
    const renderExistingImage = () => {
        if (!existingImage) return null;

        return (
            <div className="relative mb-3">
                <p
                    className={`text-sm mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                    Current Image:
                </p>
                <div className="relative inline-block">
                    <img
                        src={existingImage}
                        alt="Current post"
                        className="max-h-48 max-w-full object-contain rounded-lg cursor-pointer"
                        onClick={() => onImagePreview(existingImage)}
                    />
                    <button
                        onClick={onRemoveExistingImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
                        title="Remove image"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>
        );
    };

    const likeCount = getLikeCount();
    const commentCount = getCommentCount();

    return (
        <div
            className={`${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
            } border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-default`}
        >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                        onClick={() => navigateToUserProfile(getUserId())}
                    >
                        {getProfilePic() ? (
                            <img
                                src={getProfilePic()}
                                alt={getUsername()}
                                className="w-10 h-10 object-cover"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    const parent = e.target.parentElement;
                                    const fallback =
                                        parent.querySelector(
                                            ".profile-fallback"
                                        );
                                    if (fallback) {
                                        fallback.style.display = "flex";
                                    }
                                }}
                            />
                        ) : (
                            <span className="profile-fallback flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">
                                {getUsername().charAt(0).toUpperCase()}
                            </span>
                        )}
                        {/* Hidden fallback for error case */}
                        <span className="profile-fallback hidden items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">
                            {getUsername().charAt(0).toUpperCase()}
                        </span>
                    </div>

                    <div>
                        <h3
                            className="text-base font-semibold hover:text-blue-500 transition-colors cursor-pointer"
                            onClick={() => navigateToUserProfile(getUserId())}
                        >
                            {getRealName()}
                        </h3>
                        <p
                            className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            } cursor-default`}
                        >
                            @{getUsername()} · {formatDate(post.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Edit/Delete buttons - Only show when not editing */}
                {isOwner && !isEditing && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleEditClick}
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } cursor-pointer`}
                            title="Edit post"
                        >
                            <FaEdit className="text-blue-500 text-sm" />
                        </button>
                        <button
                            onClick={() => onDeletePost(post._id)}
                            disabled={isDeletingPost}
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } cursor-pointer ${
                                isDeletingPost
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            title="Delete post"
                        >
                            <FaTrashAlt className="text-red-500 text-sm" />
                        </button>
                    </div>
                )}

                {/* Edit mode mein Save/Cancel buttons */}
                {isEditing && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleUpdateClick}
                            disabled={isUpdatingPost}
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } cursor-pointer ${
                                isUpdatingPost
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            title="Save changes"
                        >
                            <FaCheck className="text-green-500 text-sm" />
                        </button>
                        <button
                            onClick={handleCancelClick}
                            disabled={isUpdatingPost}
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } cursor-pointer ${
                                isUpdatingPost
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            title="Cancel edit"
                        >
                            <FaTimes className="text-gray-500 text-sm" />
                        </button>
                    </div>
                )}
            </div>

            {/* Post Content - Edit Mode */}
            {isEditing ? (
                <div className="mb-3 sm:mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => onEditContentChange(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${
                            isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-800"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        rows="3"
                        placeholder="Edit your post..."
                        disabled={isUpdatingPost}
                    />

                    {/* Show existing image with remove option */}
                    {renderExistingImage()}

                    {/* File Upload Section */}
                    <div className="mt-3 flex items-center justify-between">
                        <label
                            className={`p-2 rounded-full ${
                                isDarkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } cursor-pointer`}
                        >
                            <input
                                type="file"
                                className="hidden"
                                onChange={onEditFileSelect}
                                accept="image/*"
                                disabled={isUpdatingPost}
                            />
                            <FaPaperclip className="text-gray-500 text-sm" />
                        </label>

                        {/* New File Previews */}
                        {editFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {editFiles.map((file, index) => (
                                    <div key={index}>
                                        {renderFilePreview(file)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save/Cancel Buttons - Niche wala */}
                    <div className="flex space-x-2 mt-3 justify-end">
                        <button
                            onClick={handleUpdateClick}
                            disabled={isUpdatingPost}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isUpdatingPost
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            }`}
                        >
                            {isUpdatingPost ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancelClick}
                            disabled={isUpdatingPost}
                            className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                /* Normal Post View */
                <>
                    <p
                        className={`mb-3 sm:mb-4 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        } text-sm sm:text-base cursor-default whitespace-pre-line`}
                    >
                        {post.content}
                    </p>

                    {/* Post Image */}
                    {post.image && (
                        <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                            <img
                                src={post.image}
                                alt="Post"
                                className="max-h-96 max-w-full object-contain rounded-lg cursor-pointer"
                                onClick={() => onImagePreview(post.image)}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Post Actions - Hide when editing */}
            {!isEditing && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation(); // ✅ ADD THIS LINE
                                onLike(post._id, e);
                            }}
                            disabled={isLiking}
                            className={`flex items-center gap-1 ${
                                isLiking
                                    ? "opacity-50 cursor-not-allowed"
                                    : isPostLiked
                                    ? "text-red-500 hover:text-red-600"
                                    : isDarkMode
                                    ? "text-gray-400 hover:text-gray-300"
                                    : "text-gray-500 hover:text-gray-700"
                            } transition-colors cursor-pointer text-xs sm:text-sm`}
                        >
                            {isLiking ? (
                                <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <motion.div
                                    animate={{
                                        scale: isPostLiked ? [1, 1.2, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                    }}
                                >
                                    {isPostLiked ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                </motion.div>
                            )}
                            <motion.span
                                key={likeCount}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1.2, 1] }}
                                transition={{ duration: 0.2 }}
                                className={`text-sm font-medium ${
                                    isPostLiked
                                        ? "text-red-500"
                                        : "text-gray-400"
                                }`}
                            >
                                {likeCount}
                            </motion.span>
                        </motion.button>

                        {/* Liked by text - turant update hoga - SAME AS MAIN FEED */}
                        {totalLikes > 0 && (
                            <div className="text-sm">
                                <div className="flex items-center flex-wrap">
                                    {likedUsers.length > 0 ? (
                                        <>
                                            {likedUsers
                                                .slice(0, 2)
                                                .map((user, index) => (
                                                    <span
                                                        key={index}
                                                        className={`font-medium mr-1 cursor-pointer hover:underline ${
                                                            isDarkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-700"
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigateToProfile(
                                                                user.id
                                                            );
                                                        }}
                                                    >
                                                        {user.username}
                                                        {index <
                                                        Math.min(
                                                            2,
                                                            likedUsers.length -
                                                                1
                                                        )
                                                            ? ","
                                                            : ""}
                                                    </span>
                                                ))}

                                            {totalLikes > 2 && (
                                                <button
                                                    onClick={handleShowLikes}
                                                    className={`font-medium cursor-pointer ${
                                                        isDarkMode
                                                            ? "text-blue-300"
                                                            : "text-blue-500"
                                                    } hover:underline`}
                                                >
                                                    and {totalLikes - 2} others
                                                </button>
                                            )}

                                            {totalLikes === 2 &&
                                                likedUsers.length === 1 && (
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
                                            onClick={handleShowLikes}
                                            className={`font-medium cursor-pointer ${
                                                isDarkMode
                                                    ? "text-blue-300"
                                                    : "text-blue-500"
                                            } hover:underline`}
                                        >
                                            {totalLikes}{" "}
                                            {totalLikes === 1
                                                ? "like"
                                                : "likes"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() => onToggleCommentDropdown(post._id)}
                        disabled={isFetchingComments}
                    >
                        <FaComment />
                        <span className="text-sm">{commentCount}</span>
                    </button>
                </div>
            )}

            {/* Comments Section */}
            {!isEditing && (
                <ProfileCommentSection
                    post={post}
                    isDarkMode={isDarkMode}
                    username={username}
                    currentUserProfile={currentUserProfile}
                    activeCommentPostId={activeCommentPostId}
                    commentContent={commentContent}
                    isCommenting={isCommenting}
                    isFetchingComments={isFetchingComments}
                    onCommentSubmit={onCommentSubmit}
                    onSetCommentContent={onSetCommentContent}
                    onDeleteComment={onDeleteComment}
                    navigateToUserProfile={navigateToUserProfile}
                    formatDate={formatDate}
                    // Reply functionality props
                    activeReplyInputs={activeReplyInputs}
                    replyContent={replyContent}
                    onToggleReplyInput={onToggleReplyInput}
                    onReplySubmit={onReplySubmit}
                    onSetReplyContent={onSetReplyContent}
                    onToggleReplies={onToggleReplies}
                    onLikeReply={onLikeReply}
                    onDeleteReply={onDeleteReply}
                    isReplying={isReplying}
                    isFetchingReplies={isFetchingReplies}
                    isLikingReply={isLikingReply}
                    isDeletingReply={isDeletingReply}
                />
            )}
        </div>
    );
};

export default ProfilePostCard;