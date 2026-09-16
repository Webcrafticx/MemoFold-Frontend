import React, { useRef, useEffect } from "react";
import {
    FaHeart,
    FaRegHeart,
    FaComment,
    FaEdit,
    FaTrashAlt,
    FaPaperclip,
    FaTimes,
    FaRegPaperPlane,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { formatDate, getTimeDifference } from "../../services/dateUtils";
import { highlightMentionsAndHashtags } from "../../utils/highlightMentionsAndHashtags.jsx";
import { useNavigate } from "react-router-dom";
import ProfileCommentSection from "./ProfileCommentSection";
import PostMediaCarousel from "../mainFeed/PostMediaCarousel";
import MentionInput from "../common/MentionInput";
import PostLocationBadge from "../common/PostLocationBadge";
import ShareModal from "../mainFeed/ShareModal";
import LocationAutocomplete from "../common/LocationAutocomplete";
import {
    compressImage,
    compressVideo,
    shouldCompressFile,
    getFileType,
    checkVideoDuration,
} from "../../utils/fileCompression";
import { MAX_MEDIA_ITEMS, MAX_VIDEO_DURATION_SEC } from "../../utils/mediaLimits";

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
    onShowLikesModal,
    isLiking,
    editingPostId,
    editContent,
    onEditContentChange,
    editLocation = null,
    onEditLocationChange,
    editVisibility = "public",
    onEditVisibilityChange,
    isUpdatingPost,
    isDeletingPost,
    editFiles = [],
    onEditFileSelect,
    onRemoveEditFile,
    existingMedia = [],
    onRemoveExistingMedia,
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
    commentsNextCursor,
    repliesNextCursor,
}) => {
    const editTextareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const isOwner = post.userId?._id === currentUserProfile?._id;
    const isEditing = editingPostId === post._id;
    const navigate = useNavigate();

    const [isCompressing, setIsCompressing] = React.useState(false);
    const [compressionProgress, setCompressionProgress] = React.useState(0);
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const [notification, setNotification] = React.useState({ message: "", visible: false });
    const notificationTimeoutRef = React.useRef(null);

    const showNotification = (message, ms = 6000) => {
        setNotification({ message, visible: true });
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification({ message: "", visible: false });
        }, ms);
    };

    const getLikeCount = () => post.likeCount || 0;
    const getCommentCount = () => post.commentCount || 0;

    useEffect(() => {
        if (isEditing && editTextareaRef.current) {
            const textarea = editTextareaRef.current;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [isEditing]);

    useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

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
        if (isOwner) {
            return username || post.userId?.username || post.username || "User";
        }
        return post.userId?.username || post.username || username || "User";
    };

    const getRealName = () => {
        if (isOwner) {
            return currentUserProfile?.realname || post.userId?.realname || getUsername();
        }
        return post.userId?.realname || currentUserProfile?.realname || getUsername();
    };

    const getUserId = () => post.userId?._id || currentUserProfile?._id;

    const getLikedUsers = () => {
        if (post.likesPreview && post.likesPreview.length > 0) {
            return post.likesPreview;
        }
        return [];
    };

    const likedUsers = getLikedUsers();
    const totalLikes = getLikeCount();
    const isPostLiked = post.isLikedByMe || false;

    const getRenderableImageUrl = (url) => {
        if (!url || typeof url !== "string") return url;
        const isDng = /\.dng(\?|$)/i.test(url);
        const isCloudinary =
            url.includes("res.cloudinary.com") && url.includes("/upload/");
        if (isDng && isCloudinary) {
            return url.replace("/upload/", "/upload/f_auto,q_auto/");
        }
        return url;
    };

    const handleEditClick = () => onEditPost(post._id);
    const handleUpdateClick = () => onUpdatePost(post._id);
    const handleCancelClick = () => {
        setIsCompressing(false);
        setCompressionProgress(0);
        onCancelEdit();
    };

    const handleShowLikes = (e) => {
        e.stopPropagation();
        if (onShowLikesModal && totalLikes > 0) {
            onShowLikesModal(post._id);
        }
    };

    const navigateToProfile = (userId) => {
        if (userId === getUserId()) {
            navigate("/profile");
        } else {
            navigate(`/user/${userId}`);
        }
    };

    const totalEditMediaCount =
        (existingMedia?.length || 0) + (editFiles?.length || 0);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (files.length === 0) return;

        const remaining = MAX_MEDIA_ITEMS - totalEditMediaCount;
        if (remaining <= 0) {
            showNotification(`Maximum ${MAX_MEDIA_ITEMS} media files allowed`);
            return;
        }

        const toProcess = files.slice(0, remaining);
        if (files.length > remaining) {
            showNotification(`Only ${remaining} more media file(s) can be added`);
        }

        setIsCompressing(true);
        setCompressionProgress(0);

        try {
            for (let i = 0; i < toProcess.length; i++) {
                const file = toProcess[i];
                const type = getFileType(file);
                if (type !== "image" && type !== "video") {
                    showNotification("Please select an image or video file");
                    continue;
                }

                if (type === "video") {
                    const duration = await checkVideoDuration(file);
                    if (Math.floor(duration) > MAX_VIDEO_DURATION_SEC) {
                        showNotification(
                            `Video must be ${MAX_VIDEO_DURATION_SEC} seconds or less`
                        );
                        continue;
                    }
                }

                let processedFile = file;
                if (shouldCompressFile(file)) {
                    if (type === "image") {
                        processedFile = await compressImage(
                            file,
                            setCompressionProgress
                        );
                    } else {
                        processedFile = await compressVideo(
                            file,
                            setCompressionProgress
                        );
                    }
                }

                if (onEditFileSelect) {
                    await onEditFileSelect(processedFile);
                }
            }
        } catch (error) {
            showNotification("Error processing file. Please try again.", 3000);
        } finally {
            setTimeout(() => {
                setIsCompressing(false);
                setCompressionProgress(0);
            }, 300);
        }
    };

    const renderEditMediaStrip = () => {
        if (
            (!existingMedia || existingMedia.length === 0) &&
            editFiles.length === 0
        ) {
            return null;
        }

        return (
            <div className="mb-3">
                <p
                    className={`text-sm mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                    Media ({totalEditMediaCount}/{MAX_MEDIA_ITEMS})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {(existingMedia || []).map((item, index) => (
                        <div
                            key={`existing-${item.publicId || item.url}-${index}`}
                            className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-300"
                        >
                            {item.type === "video" ? (
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                />
                            ) : (
                                <img
                                    src={getRenderableImageUrl(item.url)}
                                    alt=""
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() =>
                                        onImagePreview(
                                            getRenderableImageUrl(item.url)
                                        )
                                    }
                                />
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    onRemoveExistingMedia &&
                                    onRemoveExistingMedia(index)
                                }
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
                                title="Remove"
                            >
                                <FaTimes size={10} />
                            </button>
                        </div>
                    ))}
                    {editFiles.map((file, index) => {
                        const type = getFileType(file);
                        const preview = URL.createObjectURL(file);
                        return (
                            <div
                                key={`new-${file.name}-${index}`}
                                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-400"
                            >
                                {type === "video" ? (
                                    <video
                                        src={preview}
                                        className="w-full h-full object-cover"
                                        muted
                                        preload="metadata"
                                    />
                                ) : (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => onRemoveEditFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
                                    title="Remove"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`w-full max-w-2xl mx-auto mb-4 sm:mb-6 ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
            } border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 cursor-default`}
        >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 cursor-pointer"
                        onClick={() => navigateToProfile(getUserId())}
                    >
                        {getProfilePic() ? (
                            <img
                                src={getProfilePic()}
                                alt={getUsername()}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                            />
                        ) : null}
                        <span
                            className="flex items-center justify-center w-full h-full text-white font-semibold text-sm"
                            style={getProfilePic() ? { display: "none" } : {}}
                        >
                            {getUsername()?.charAt(0).toUpperCase() || "U"}
                        </span>
                    </div>
                    <div>
                        <h3
                            className="font-semibold cursor-pointer hover:text-blue-500 text-sm sm:text-base"
                            onClick={() => navigateToProfile(getUserId())}
                        >
                            {getRealName()}
                        </h3>
                        <p
                            className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            @{getUsername()} · {formatDate(post.createdAt)}
                            {post.createdAt && (
                                <span className="ml-1">
                                    ({getTimeDifference(post.createdAt)})
                                </span>
                            )}
                            {isOwner && post.visibility === "friends" && (
                                <span
                                    className={`ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        isDarkMode
                                            ? "bg-gray-700 text-gray-300"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    Friends only
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {isOwner && !isEditing && (
                    <div className="flex gap-1 sm:gap-2">
                        <button
                            onClick={handleEditClick}
                            className={`p-1.5 sm:p-2 rounded-lg ${
                                isDarkMode
                                    ? "hover:bg-gray-700 text-gray-400"
                                    : "hover:bg-gray-100 text-gray-500"
                            } cursor-pointer`}
                            title="Edit post"
                        >
                            <FaEdit className="text-sm sm:text-base" />
                        </button>
                        <button
                            onClick={() => onDeletePost(post._id)}
                            disabled={isDeletingPost}
                            className={`p-1.5 sm:p-2 rounded-lg ${
                                isDeletingPost
                                    ? "opacity-50 cursor-not-allowed"
                                    : isDarkMode
                                      ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                                      : "hover:bg-gray-100 text-gray-500 hover:text-red-500"
                            } cursor-pointer`}
                            title="Delete post"
                        >
                            <FaTrashAlt className="text-sm sm:text-base" />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div>
                    <MentionInput
                        inputRef={editTextareaRef}
                        value={editContent}
                        onChange={(next) => {
                            onEditContentChange(next);
                            const textarea = editTextareaRef.current;
                            if (!textarea) return;
                            textarea.style.height = "auto";
                            textarea.style.height = textarea.scrollHeight + "px";
                        }}
                        disabled={isUpdatingPost || isCompressing}
                        className={`w-full p-4 rounded-lg border resize-none max-h-96 overflow-y-auto ${
                            isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-800"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />

                    <div className="mt-2 mb-2">
                        <LocationAutocomplete
                            value={editLocation}
                            onChange={(loc) => onEditLocationChange?.(loc)}
                            isDarkMode={isDarkMode}
                            disabled={isUpdatingPost || isCompressing}
                            placeholder="Search for a location"
                        />
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            Who can see
                        </span>
                        <div
                            className={`inline-flex rounded-lg border overflow-hidden text-xs ${
                                isDarkMode ? "border-gray-600" : "border-gray-300"
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => onEditVisibilityChange?.("public")}
                                disabled={isUpdatingPost || isCompressing}
                                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                                    editVisibility === "public"
                                        ? "bg-blue-500 text-white"
                                        : isDarkMode
                                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Public
                            </button>
                            <button
                                type="button"
                                onClick={() => onEditVisibilityChange?.("friends")}
                                disabled={isUpdatingPost || isCompressing}
                                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                                    editVisibility === "friends"
                                        ? "bg-blue-500 text-white"
                                        : isDarkMode
                                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                Friends only
                            </button>
                        </div>
                    </div>

                    {isCompressing && (
                        <div
                            className={`mb-3 p-3 rounded-lg ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm">Processing...</span>
                            </div>
                            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${compressionProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {renderEditMediaStrip()}

                    {notification.visible && (
                        <div
                            className={`flex items-center justify-between mb-3 mt-2 p-3 rounded-lg border ${
                                isDarkMode
                                    ? "bg-red-900 border-red-700 text-red-200"
                                    : "bg-red-100 border-red-400 text-red-800"
                            } transition-all`}
                        >
                            <span className="text-sm font-medium">
                                {notification.message}
                            </span>
                            <button
                                onClick={() =>
                                    setNotification({
                                        message: "",
                                        visible: false,
                                    })
                                }
                                className={`ml-4 p-1 rounded-full ${
                                    isDarkMode
                                        ? "hover:bg-red-800"
                                        : "hover:bg-red-200"
                                } focus:outline-none cursor-pointer`}
                                title="Close"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                    )}

                    <div className="mt-3 flex flex-row items-center gap-2 justify-end">
                        <button
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                    fileInputRef.current.click();
                                }
                            }}
                            disabled={
                                isCompressing ||
                                isUpdatingPost ||
                                totalEditMediaCount >= MAX_MEDIA_ITEMS
                            }
                            className={`p-2 rounded-lg flex items-center gap-2 ${
                                isDarkMode
                                    ? "hover:bg-gray-700 bg-gray-800"
                                    : "hover:bg-gray-100 bg-gray-50"
                            } ${
                                isCompressing ||
                                isUpdatingPost ||
                                totalEditMediaCount >= MAX_MEDIA_ITEMS
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                            title="Add Media"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,.dng,.heic,.heif,video/*"
                                multiple
                                disabled={isUpdatingPost || isCompressing}
                            />
                            <FaPaperclip className="text-gray-500 text-sm" />
                            <span className="text-xs">
                                Add Media ({totalEditMediaCount}/
                                {MAX_MEDIA_ITEMS})
                            </span>
                        </button>
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
                <>
                    <p
                        className={`mb-3 sm:mb-4 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        } text-sm sm:text-base cursor-default whitespace-pre-line`}
                    >
                        {highlightMentionsAndHashtags(post.content, post.mentions)}
                    </p>
                    <PostLocationBadge location={post.location} className="mb-3" />

                    <PostMediaCarousel
                        post={post}
                        onImagePreview={onImagePreview}
                    />
                </>
            )}

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
                                    transition={{ duration: 0.3 }}
                                >
                                    {isPostLiked ? (
                                        <FaHeart className="text-lg sm:text-xl" />
                                    ) : (
                                        <FaRegHeart className="text-lg sm:text-xl" />
                                    )}
                                </motion.div>
                            )}
                            <span className="font-medium">{totalLikes}</span>
                        </motion.button>

                        {totalLikes > 0 && (
                            <div className="text-xs sm:text-sm">
                                <div className="flex items-center flex-wrap">
                                    {likedUsers.length > 0 ? (
                                        <>
                                            {likedUsers
                                                .slice(0, 2)
                                                .map((user, index) => (
                                                    <span
                                                        key={user.id || index}
                                                    >
                                                        <span
                                                            className={`font-medium cursor-pointer hover:underline ${
                                                                isDarkMode
                                                                    ? "text-blue-400"
                                                                    : "text-blue-600"
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigateToProfile(
                                                                    user.id
                                                                );
                                                            }}
                                                        >
                                                            {user.username}
                                                        </span>
                                                        {index <
                                                            Math.min(
                                                                likedUsers.length,
                                                                2
                                                            ) -
                                                                1 && ", "}
                                                    </span>
                                                ))}
                                            {totalLikes > 2 && (
                                                <span
                                                    className={`ml-1 cursor-pointer hover:underline ${
                                                        isDarkMode
                                                            ? "text-gray-400"
                                                            : "text-gray-600"
                                                    }`}
                                                    onClick={handleShowLikes}
                                                >
                                                    and{" "}
                                                    {totalLikes -
                                                        Math.min(
                                                            likedUsers.length,
                                                            2
                                                        )}{" "}
                                                    others
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span
                                            className={`cursor-pointer hover:underline ${
                                                isDarkMode
                                                    ? "text-gray-400"
                                                    : "text-gray-600"
                                            }`}
                                            onClick={handleShowLikes}
                                        >
                                            {totalLikes}{" "}
                                            {totalLikes === 1
                                                ? "like"
                                                : "likes"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            className={`flex items-center gap-1 ${
                                isDarkMode
                                    ? "text-gray-400 hover:text-green-400"
                                    : "text-gray-500 hover:text-green-600"
                            } transition-colors cursor-pointer text-xs sm:text-sm`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsShareModalOpen(true);
                            }}
                        >
                            <FaRegPaperPlane className="text-lg sm:text-xl" />
                        </button>
                        <button
                            onClick={() => onToggleCommentDropdown(post._id)}
                            className={`flex items-center gap-1 ${
                                isDarkMode
                                    ? "text-gray-400 hover:text-gray-300"
                                    : "text-gray-500 hover:text-gray-700"
                            } transition-colors cursor-pointer text-xs sm:text-sm`}
                        >
                        <FaComment className="text-lg sm:text-xl" />
                        <span className="font-medium">
                            {getCommentCount()}
                        </span>
                    </button>
                    </div>
                </div>
            )}

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                postId={post._id}
                token={token}
                isDarkMode={isDarkMode}
            />

            {activeCommentPostId === post._id && !isEditing && (
                <ProfileCommentSection
                    post={post}
                    isDarkMode={isDarkMode}
                    username={username}
                    currentUserProfile={currentUserProfile}
                    activeCommentPostId={activeCommentPostId}
                    commentContent={commentContent}
                    onCommentSubmit={onCommentSubmit}
                    onSetCommentContent={onSetCommentContent}
                    isCommenting={isCommenting}
                    onDeleteComment={onDeleteComment}
                    onLikeComment={onLikeComment}
                    isLikingComment={isLikingComment}
                    isFetchingComments={isFetchingComments}
                    navigateToUserProfile={navigateToUserProfile}
                    onToggleCommentDropdown={onToggleCommentDropdown}
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
                    commentsNextCursor={commentsNextCursor}
                    repliesNextCursor={repliesNextCursor}
                />
            )}
        </div>
    );
};

export default ProfilePostCard;
