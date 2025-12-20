import React, { useRef, useEffect } from "react";

import {
    FaHeart,
    FaRegHeart,
    FaComment,
    FaEdit,
    FaTrashAlt,
    FaPaperclip,
    FaCheck,
    FaTimes,
    FaVideo,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDate, getTimeDifference } from "../../services/dateUtils";
import { useNavigate } from "react-router-dom";
import ProfileCommentSection from "./ProfileCommentSection";
import {
    compressImage,
    compressVideo,
    shouldCompressFile,
    getFileType,
    checkVideoDuration,
    formatFileSize
} from "../../utils/fileCompression";

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
    onLikeComment,
    isLikingComment,
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
    // Existing media props
    existingImage,
    existingVideo,
    onRemoveExistingMedia,
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
    const editTextareaRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const isOwner = post.userId?._id === currentUserProfile?._id;
    const isEditing = editingPostId === post._id;
    const navigate = useNavigate();

    // Compression states
    const [isCompressing, setIsCompressing] = React.useState(false);
    const [compressionProgress, setCompressionProgress] = React.useState(0);
    const [newVideoUrl, setNewVideoUrl] = React.useState(null);
    const [showMediaAlert, setShowMediaAlert] = React.useState(false);
    const [currentExistingVideo, setCurrentExistingVideo] = React.useState(existingVideo);

    // Properly handle like count
    const getLikeCount = () => {
        return post.likeCount || 0;
    };

    // Properly handle comment count
    const getCommentCount = () => {
        return post.commentCount || 0;
    };

    useEffect(() => {
        if (isEditing && editTextareaRef.current) {
            const textarea = editTextareaRef.current;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [isEditing]);

    // Cleanup video URL on unmount
    useEffect(() => {
        return () => {
            if (newVideoUrl) {
                URL.revokeObjectURL(newVideoUrl);
            }
        };
    }, [newVideoUrl]);

    // Update existing video when prop changes
    useEffect(() => {
        setCurrentExistingVideo(existingVideo);
    }, [existingVideo]);

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
        // Cleanup video URL
        if (newVideoUrl) {
            URL.revokeObjectURL(newVideoUrl);
            setNewVideoUrl(null);
        }
        setIsCompressing(false);
        setCompressionProgress(0);
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

    // Check if existing media is present
    const hasExistingMedia = () => {
        return existingImage || currentExistingVideo;
    };

    // Check if new media is present
    const hasNewMedia = () => {
        return editFiles.length > 0 || newVideoUrl;
    };

    // Handle file selection with compression
    const handleFileSelect = async (e, fileType) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = getFileType(file);
        if (type !== fileType) {
            alert(`Please select a ${fileType} file`);
            return;
        }

        // Check if existing media needs to be removed first
        if (hasExistingMedia()) {
            setShowMediaAlert(true);
            return;
        }

        try {
            setIsCompressing(true);
            setCompressionProgress(10);

            // Validate video duration
            if (type === 'video') {
                const duration = await checkVideoDuration(file);
                if (duration > 15) {
                    alert("Video must be 15 seconds or less");
                    setIsCompressing(false);
                    setCompressionProgress(0);
                    return;
                }
            }

            let processedFile = file;
            
            // Apply compression if needed
            if (shouldCompressFile(file)) {
                try {
                    if (type === 'image') {
                        processedFile = await compressImage(file, (progress) => {
                            setCompressionProgress(progress);
                        });
                    } else if (type === 'video') {
                        processedFile = await compressVideo(file, (progress) => {
                            setCompressionProgress(progress);
                        });
                    }
                } catch (error) {
                    console.error('Compression error:', error);
                    alert('Compression failed. Using original file.');
                }
            }

            // Cleanup previous video URL
            if (newVideoUrl) {
                URL.revokeObjectURL(newVideoUrl);
            }

            // Create preview for video
            if (type === 'video') {
                const videoUrl = URL.createObjectURL(processedFile);
                setNewVideoUrl(videoUrl);
                // Clear any existing edit files (video replaces everything)
                editFiles.forEach((file, index) => {
                    onRemoveEditFile(index);
                });
            } else {
                // For image, clear any video
                if (newVideoUrl) {
                    URL.revokeObjectURL(newVideoUrl);
                    setNewVideoUrl(null);
                }
            }

            if (onEditFileSelect) {
                onEditFileSelect(processedFile);
            }
            
            setTimeout(() => {
                setIsCompressing(false);
                setCompressionProgress(0);
            }, 500);

        } catch (error) {
            console.error('File processing error:', error);
            alert('Error processing file. Please try again.');
            setIsCompressing(false);
            setCompressionProgress(0);
        }
    };

    // Remove existing media
    const handleRemoveExistingMedia = () => {
        if (onRemoveExistingMedia) {
            onRemoveExistingMedia();
        }
        // Also clear any new media
        editFiles.forEach((file, index) => {
            if (onRemoveEditFile) {
                onRemoveEditFile(index);
            }
        });
        if (newVideoUrl) {
            URL.revokeObjectURL(newVideoUrl);
            setNewVideoUrl(null);
        }
        // Clear local existing video state
        setCurrentExistingVideo(null);
        setShowMediaAlert(false);
    };

    // Remove new media
    const handleRemoveNewMedia = () => {
        editFiles.forEach((file, index) => {
            if (onRemoveEditFile) {
                onRemoveEditFile(index);
            }
        });
        if (newVideoUrl) {
            URL.revokeObjectURL(newVideoUrl);
            setNewVideoUrl(null);
        }
    };

    // File preview rendering function
    const renderFilePreview = (file) => {
        if (file && file.type && file.type.startsWith("image/")) {
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
                <span className="text-sm truncate max-w-xs">{file?.name || "File"}</span>
                <button
                    onClick={() => onRemoveEditFile(editFiles.indexOf(file))}
                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    // Render existing media in edit mode
    const renderExistingMedia = () => {
        const hasMedia = hasExistingMedia();
        const hasNew = hasNewMedia();
        
        if (!hasMedia && !hasNew) return null;

        return (
            <div className="relative mb-3">
                <p
                    className={`text-sm mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                    {hasMedia ? "Current Media:" : "New Media:"}
                </p>
                
                {/* Existing Media */}
                {hasMedia && (
                    <div className="relative inline-block mb-2">
                        {existingImage ? (
                            <>
                                <img
                                    src={existingImage}
                                    alt="Current post"
                                    className="max-h-48 max-w-full object-contain rounded-lg cursor-pointer"
                                    onClick={() => onImagePreview(existingImage)}
                                />
                                <button
                                    onClick={handleRemoveExistingMedia}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer hover:bg-red-600 transition-colors"
                                    title="Remove current media"
                                >
                                    <FaTimes />
                                </button>
                                <div className="mt-1 text-xs text-gray-500">
                                    Click ✕ to remove before adding new
                                </div>
                            </>
                        ) : currentExistingVideo ? (
                            <>
                                <div className="relative w-full max-w-full">
                                    <video
                                        src={currentExistingVideo}
                                        className="max-h-48 max-w-full object-contain rounded-lg"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        controls
                                        controlsList="nodownload nofullscreen noplaybackrate"
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            return false;
                                        }}
                                        style={{
                                            backgroundColor: "transparent",
                                            display: "block",
                                        }}
                                        preload="metadata"
                                    />
                                </div>
                                <button
                                    onClick={handleRemoveExistingMedia}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer hover:bg-red-600 transition-colors"
                                    title="Remove current video"
                                >
                                    <FaTimes />
                                </button>
                                <div className="mt-1 text-xs text-gray-500">
                                    Click ✕ to remove before adding new
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
                
                {/* New Media */}
                {hasNew && (
                    <div className="mt-3">
                        {newVideoUrl ? (
                            <div className="relative inline-block mb-2">
                                <div className="relative w-full max-w-full">
                                    <video
                                        src={newVideoUrl}
                                        className="max-h-48 max-w-full object-contain rounded-lg"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        controls
                                        controlsList="nodownload nofullscreen noplaybackrate"
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            return false;
                                        }}
                                        style={{
                                            backgroundColor: "transparent",
                                            display: "block",
                                        }}
                                        preload="metadata"
                                    />
                                </div>
                                <button
                                    onClick={handleRemoveNewMedia}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer hover:bg-red-600 transition-colors"
                                    title="Remove new video"
                                >
                                    <FaTimes />
                                </button>
                                <div className="mt-1 text-xs text-green-500">
                                    New video ready to upload
                                </div>
                            </div>
                        ) : editFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {editFiles.map((file, index) => (
                                    <div key={index}>
                                        {renderFilePreview(file)}
                                    </div>
                                ))}
                                <div className="text-xs text-gray-500 mt-1">
                                    Remove ✕ to add different media
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        );
    };

    // ✅ Handle context menu to prevent download
    const handleVideoContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    // ✅ Handle video touch/click for mobile
    const handleVideoTap = (e) => {
        e.stopPropagation();
        const video = e.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
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
                            <span className="profile-fallback flex items-center cursor-pointer justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">
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
            </div>

            {/* Post Content - Edit Mode */}
            {isEditing ? (
                <div className="mb-3 sm:mb-4">
                    <textarea
                        ref={editTextareaRef}
                        value={editContent}
                        onChange={(e) => {
                            onEditContentChange(e.target.value);

                            const textarea = editTextareaRef.current;
                            if (!textarea) return;

                            textarea.style.height = "auto";
                            textarea.style.height =
                                textarea.scrollHeight + "px";
                        }}
                        rows={3}
                        placeholder="Edit your post..."
                        disabled={isUpdatingPost || isCompressing}
                        className={`w-full p-4 rounded-lg border resize-none max-h-96 overflow-y-auto ${
                            isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-800"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />

                    {/* Media Alert */}
                    {showMediaAlert && (
                        <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                    ⚠️ Remove current media first
                                </p>
                                <button
                                    onClick={() => setShowMediaAlert(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                You can only have one media file at a time. Please remove the current media before adding a new one.
                            </p>
                        </div>
                    )}

                    {/* Compression Progress */}
                    {isCompressing && (
                        <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm">
                                    Processing...
                                </span>
                            </div>
                            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${compressionProgress}%` }}
                                ></div>
                            </div>
                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                Progress: {compressionProgress}%
                            </div>
                        </div>
                    )}

                    {/* Show existing media */}
                    {renderExistingMedia()}

                    {/* File Upload Section */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (hasExistingMedia() && !hasNewMedia()) {
                                        setShowMediaAlert(true);
                                        return;
                                    }
                                    if (imageInputRef.current) {
                                        imageInputRef.current.click();
                                    }
                                }}
                                disabled={isCompressing || isUpdatingPost || (hasNewMedia() && !editFiles.find(f => getFileType(f) === 'image'))}
                                className={`p-2 rounded-lg flex items-center gap-2 ${
                                    isDarkMode
                                        ? "hover:bg-gray-700 bg-gray-800"
                                        : "hover:bg-gray-100 bg-gray-50"
                                } ${isCompressing || isUpdatingPost || (hasNewMedia() && !editFiles.find(f => getFileType(f) === 'image')) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title="Add image"
                            >
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'image')}
                                    accept="image/*"
                                    disabled={isUpdatingPost || isCompressing}
                                />
                                <FaPaperclip className="text-gray-500 text-sm" />
                                <span className="text-xs">Add Image</span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (hasExistingMedia() && !hasNewMedia()) {
                                        setShowMediaAlert(true);
                                        return;
                                    }
                                    if (videoInputRef.current) {
                                        videoInputRef.current.click();
                                    }
                                }}
                                disabled={isCompressing || isUpdatingPost || (hasNewMedia() && !newVideoUrl)}
                                className={`p-2 rounded-lg flex items-center gap-2 ${
                                    isDarkMode
                                        ? "hover:bg-gray-700 bg-gray-800"
                                        : "hover:bg-gray-100 bg-gray-50"
                                } ${isCompressing || isUpdatingPost || (hasNewMedia() && !newVideoUrl) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                title="Add video"
                            >
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'video')}
                                    accept="video/*"
                                    disabled={isUpdatingPost || isCompressing}
                                />
                                <FaVideo className="text-gray-500 text-sm" />
                                <span className="text-xs">Add Video</span>
                            </button>
                        </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex space-x-2 mt-3 justify-end">
                        <button
                            onClick={handleUpdateClick}
                            disabled={isUpdatingPost || isCompressing}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                isUpdatingPost || isCompressing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            }`}
                        >
                            {isUpdatingPost ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancelClick}
                            disabled={isUpdatingPost || isCompressing}
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

                    {/* Post Video */}
                    {post.videoUrl && (
                        <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center relative bg-transparent">
                            <div
                                className="relative w-full max-w-full"
                                style={{ maxHeight: "24rem" }}
                            >
                                <video
                                    src={post.videoUrl}
                                    className="w-full h-auto max-h-96 object-contain rounded-xl"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    controls
                                    controlsList="nodownload nofullscreen noplaybackrate"
                                    onContextMenu={handleVideoContextMenu}
                                    style={{
                                        backgroundColor: "transparent",
                                        display: "block",
                                    }}
                                    preload="metadata"
                                />
                                {/* Mobile tap indicator */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    onClick={handleVideoTap}
                                />
                            </div>
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
                                e.stopPropagation();
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
                        {isFetchingComments && (
                            <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                        )}
                    </button>
                </div>
            )}

            {/* Comments Section */}
            {!isEditing &&
                !isFetchingComments &&
                activeCommentPostId === post._id && (
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
                        formatDate={getTimeDifference}
                        onLikeComment={onLikeComment}
                        isLikingComment={isLikingComment}
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