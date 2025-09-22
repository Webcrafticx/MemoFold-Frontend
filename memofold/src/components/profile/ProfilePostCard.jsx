import React from "react";
import { FaHeart, FaRegHeart, FaComment, FaEdit, FaTrashAlt, FaCheck, FaTimes, FaPaperclip } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDate } from "../../services/dateUtils";
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
}) => {
  const isOwner = post.userId?._id === currentUserProfile?._id;
  const isEditing = editingPostId === post._id;

  const handleEditClick = () => {
    onEditPost(post._id);
  };

  const handleUpdateClick = () => {
    onUpdatePost(post._id);
  };

  const handleCancelClick = () => {
    onCancelEdit();
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
            onClick={() => onImagePreview(URL.createObjectURL(file))}
          />
          <button
            onClick={() => onRemoveEditFile(editFiles.indexOf(file))}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>
      );
    }
    return (
      <div className={`p-2 rounded-lg flex items-center ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
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
            onClick={() => navigateToUserProfile(post.userId?._id)}
          >
            {post.userId?.profilePic ? (
              <img
                src={post.userId.profilePic}
                alt={post.userId.username}
                className="w-10 h-10 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">
              {post.userId?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>

          <div>
            <h3
              className="text-base font-semibold hover:text-blue-500 transition-colors cursor-pointer"
              onClick={() => navigateToUserProfile(post.userId?._id)}
            >
              {post.userId?.realname || post.userId?.username || "Unknown User"}
            </h3>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } cursor-default`}
            >
              @{post.userId?.username || "unknown"} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Edit/Delete buttons - Only show when not editing */}
        {isOwner && !isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } cursor-pointer`}
              title="Edit post"
            >
              <FaEdit className="text-blue-500 text-sm" />
            </button>
            <button
              onClick={() => onDeletePost(post._id)}
              disabled={isDeletingPost}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } cursor-pointer ${isDeletingPost ? "opacity-50 cursor-not-allowed" : ""}`}
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
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } cursor-pointer ${isUpdatingPost ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Save changes"
            >
              <FaCheck className="text-green-500 text-sm" />
            </button>
            <button
              onClick={handleCancelClick}
              disabled={isUpdatingPost}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } cursor-pointer ${isUpdatingPost ? "opacity-50 cursor-not-allowed" : ""}`}
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
          
          {/* File Upload Section */}
          <div className="mt-3 flex items-center justify-between">
            <label className={`p-2 rounded-full ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } cursor-pointer`}>
              <input
                type="file"
                className="hidden"
                onChange={onEditFileSelect}
                accept="image/*"
              />
              <FaPaperclip className="text-gray-500 text-sm" />
            </label>
            
            {/* File Previews */}
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
                className="max-h-96 max-w-full object-contain cursor-pointer"
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
        <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={(e) => onLike(post._id, e)}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-1 ${
              post.isLiked
                ? "text-red-500 hover:text-red-600"
                : isDarkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors cursor-pointer text-xs sm:text-sm`}
          >
            <motion.div
              animate={{
                scale: post.isLiked ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              {post.isLiked ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
            </motion.div>
            <motion.span
              key={post.likes}
              initial={{ scale: 1 }}
              animate={{
                scale: [1.2, 1],
              }}
              transition={{
                duration: 0.2,
              }}
            >
              {post.likes || 0}
            </motion.span>
          </motion.button>

          <button
            onClick={() => onToggleCommentDropdown(post._id)}
            className={`flex items-center gap-1 ${
              isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
            } transition-colors cursor-pointer text-xs sm:text-base`}
          >
            <FaComment />
            <span>{post.commentCount || post.comments?.length || 0}</span>
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
        />
      )}
    </div>
  );
};

export default ProfilePostCard;