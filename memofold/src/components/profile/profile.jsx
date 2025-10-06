// components/Post/Post.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import config from "../../hooks/config";
import { motion } from "framer-motion";
import {
    FaHeart,
    FaRegHeart,
    FaComment,
    FaShare,
    FaBookmark,
    FaRegBookmark,
    FaEllipsisH,
    FaArrowLeft,
    FaTimes,
} from "react-icons/fa";
import { formatDate } from "../../services/dateUtils";
import LikesModal from "../mainFeed/LikesModal";
import CommentSection from "../mainFeed/CommentSection";

const Post = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { token, user: currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    // States for interactions
    const [isLiking, setIsLiking] = useState(false);
    const [likeCooldown, setLikeCooldown] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLikingComment, setIsLikingComment] = useState({});
    const [isDeletingComment, setIsDeletingComment] = useState({});
    const [activeReplies, setActiveReplies] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const [isReplying, setIsReplying] = useState({});
    const [isLikingReply, setIsLikingReply] = useState({});
    const [isDeletingReply, setIsDeletingReply] = useState({});

    // Modal states
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        if (postId && token) {
            fetchPost();
        }
        // Detect dark mode
        setIsDarkMode(
            window.matchMedia("(prefers-color-scheme: dark)").matches
        );
    }, [postId, token]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.apiUrl}/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.post) {
                    setPost(result.post);
                } else {
                    setError("Post not found");
                }
            } else {
                setError("Failed to load post");
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            setError("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    // Check if current user has liked the post
    const checkIfUserLiked = () => {
        if (!post || !currentUser || !post.likesPreview) return false;
        return post.likesPreview.some(
            (like) => like.username === currentUser.username
        );
    };

    // Like/Unlike post
    const handleLike = async (e) => {
        if (e) e.stopPropagation();

        if (isLiking || likeCooldown) return;

        setIsLiking(true);
        setLikeCooldown(true);

        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/like`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                // Update local state
                const hasUserLiked = checkIfUserLiked();
                setPost((prev) => ({
                    ...prev,
                    likeCount: hasUserLiked
                        ? prev.likeCount - 1
                        : prev.likeCount + 1,
                    // Update likesPreview to reflect the change
                    likesPreview: hasUserLiked
                        ? prev.likesPreview.filter(
                              (like) => like.username !== currentUser?.username
                          )
                        : [
                              ...prev.likesPreview,
                              {
                                  username: currentUser?.username,
                                  profilePic: currentUser?.profilePic,
                                  realname: currentUser?.realname,
                              },
                          ],
                }));
            }
        } catch (error) {
            console.error("Error liking post:", error);
        } finally {
            setIsLiking(false);
            setTimeout(() => {
                setLikeCooldown(false);
            }, 1000);
        }
    };

    // Toggle comment section
    const handleToggleCommentDropdown = async (e) => {
        if (e) e.stopPropagation();

        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
            if (!post.comments) {
                await fetchComments();
            }
        }
    };

    // Fetch comments
    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const commentsData = await response.json();
                setPost((prev) => ({
                    ...prev,
                    comments: commentsData.comments || [],
                }));
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    // Submit comment
    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!commentContent.trim()) return;

        setIsCommenting(true);
        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comment`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: commentContent }),
                }
            );

            if (response.ok) {
                const newComment = await response.json();
                setPost((prev) => ({
                    ...prev,
                    comments: [newComment, ...(prev.comments || [])],
                    commentCount: (prev.commentCount || 0) + 1,
                }));
                setCommentContent("");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsCommenting(false);
        }
    };

    // Like comment
    const handleLikeComment = async (commentId, e) => {
        if (e) e.stopPropagation();
        if (isLikingComment[commentId]) return;

        setIsLikingComment((prev) => ({ ...prev, [commentId]: true }));
        try {
            const response = await fetch(
                `${config.apiUrl}/comments/${commentId}/like`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setPost((prev) => ({
                    ...prev,
                    comments: prev.comments.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  hasUserLiked: !comment.hasUserLiked,
                                  likeCount: comment.hasUserLiked
                                      ? comment.likeCount - 1
                                      : comment.likeCount + 1,
                              }
                            : comment
                    ),
                }));
            }
        } catch (error) {
            console.error("Error liking comment:", error);
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // Add reply to comment
    const handleAddReply = async (commentId, e) => {
        if (e) e.preventDefault();
        if (!replyContent[commentId]?.trim()) return;

        setIsReplying((prev) => ({ ...prev, [commentId]: true }));
        try {
            const response = await fetch(
                `${config.apiUrl}/comments/${commentId}/reply`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: replyContent[commentId] }),
                }
            );

            if (response.ok) {
                const newReply = await response.json();
                setPost((prev) => ({
                    ...prev,
                    comments: prev.comments.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  replies: [
                                      newReply,
                                      ...(comment.replies || []),
                                  ],
                                  replyCount: (comment.replyCount || 0) + 1,
                              }
                            : comment
                    ),
                }));
                setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
                setActiveReplies((prev) => ({ ...prev, [commentId]: true }));
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        } finally {
            setIsReplying((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // Navigation
    const navigateToUserProfile = (userId, e) => {
        if (e) e.stopPropagation();
        navigate(`/user/${userId}`);
    };

    // Image preview
    const handleImagePreview = (imageUrl) => {
        setPreviewImage(imageUrl);
        setShowImagePreview(true);
    };

    // Get liked users for display
    const getLikedUsers = () => {
        return post?.likesPreview || [];
    };

    // Safe user data access
    const getCurrentUserData = () => {
        return {
            username: currentUser?.username || "user",
            profilePic: currentUser?.profilePic || "",
            realname: currentUser?.realname || currentUser?.username || "User",
        };
    };

    const likedUsers = getLikedUsers();
    const totalLikes = post?.likeCount || 0;
    const hasUserLiked = checkIfUserLiked();
    const currentUserData = getCurrentUserData();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {error || "Post not found"}
                    </h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
        >
            {/* Header */}
            <div
                className={`sticky top-0 z-10 ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                } border-b`}
            >
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full transition-colors mr-3 ${
                            isDarkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                        <FaArrowLeft className="text-lg" />
                    </button>
                    <h1
                        className={`text-xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        Post
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Post Card */}
                <div
                    className={`w-full rounded-2xl p-5 shadow-md ${
                        isDarkMode
                            ? "bg-gray-800 text-gray-100"
                            : "bg-white text-gray-900"
                    }`}
                >
                    {/* Likes Modal */}
                    <LikesModal
                        postId={post._id}
                        isOpen={showLikesModal}
                        onClose={() => setShowLikesModal(false)}
                        token={token}
                        isDarkMode={isDarkMode}
                    />

                    {/* User Info */}
                    <div
                        className="flex items-center gap-3 mb-3 cursor-pointer"
                        onClick={(e) =>
                            navigateToUserProfile(post.userId._id, e)
                        }
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                            {post.userId?.profilePic ? (
                                <img
                                    src={post.userId.profilePic}
                                    alt={post.userId?.username || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : null}
                            <div
                                className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg ${
                                    post.userId?.profilePic ? "hidden" : "flex"
                                }`}
                            >
                                {post.userId?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                            </div>
                        </div>

                        <div>
                            <h3
                                className={`text-base font-semibold hover:text-blue-500 transition-colors ${
                                    isDarkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                                {post.userId?.realname ||
                                    post.userId?.username ||
                                    "Unknown User"}
                            </h3>

                            <p
                                className={`text-xs ${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                @{post.userId?.username || "unknown"} ·{" "}
                                {formatDate(post.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Post Content */}
                    <p
                        className={`leading-relaxed mb-3 ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                    >
                        {post.content || ""}
                    </p>

                    {/* Post Image */}
                    {post.image && (
                        <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                            <img
                                src={post.image}
                                alt="Post"
                                className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl"
                                onClick={() => handleImagePreview(post.image)}
                            />
                        </div>
                    )}

                    {/* Engagement Stats and Actions */}
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLike}
                                disabled={isLiking || likeCooldown}
                                className={`flex items-center gap-1 ${
                                    isLiking || likeCooldown
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                } hover:text-red-500 transition-colors cursor-pointer`}
                            >
                                {isLiking ? (
                                    <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : hasUserLiked ? (
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
                                        hasUserLiked
                                            ? "text-red-500"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {totalLikes}
                                </motion.span>
                            </motion.button>

                            {/* Liked by text */}
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
                                                            className={`font-medium mr-1 ${
                                                                isDarkMode
                                                                    ? "text-gray-300"
                                                                    : "text-gray-700"
                                                            }`}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowLikesModal(
                                                                true
                                                            );
                                                        }}
                                                        className={`font-medium cursor-pointer ${
                                                            isDarkMode
                                                                ? "text-blue-300"
                                                                : "text-blue-500"
                                                        } hover:underline`}
                                                    >
                                                        and {totalLikes - 2}{" "}
                                                        others
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowLikesModal(true);
                                                }}
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
                            onClick={handleToggleCommentDropdown}
                            disabled={loadingComments}
                        >
                            <FaComment />
                            <span className="text-sm">
                                {post.commentCount || 0}
                            </span>
                            {loadingComments && (
                                <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                            )}
                        </button>
                    </div>

                    {/* Comment Section */}
                    <CommentSection
                        post={post}
                        username={currentUserData.username}
                        currentUserProfile={currentUserData}
                        user={currentUserData}
                        isDarkMode={isDarkMode}
                        activeCommentPostId={activeCommentPostId}
                        loadingComments={{ [post._id]: loadingComments }}
                        commentContent={{ [post._id]: commentContent }}
                        isCommenting={{ [post._id]: isCommenting }}
                        isLikingComment={isLikingComment}
                        isDeletingComment={isDeletingComment}
                        activeReplies={activeReplies}
                        replyContent={replyContent}
                        isReplying={isReplying}
                        isLikingReply={isLikingReply}
                        isDeletingReply={isDeletingReply}
                        onToggleCommentDropdown={handleToggleCommentDropdown}
                        onCommentSubmit={handleCommentSubmit}
                        onSetCommentContent={(postId, content) =>
                            setCommentContent(content)
                        }
                        onLikeComment={handleLikeComment}
                        onDeleteComment={() => {}} // Add delete functionality if needed
                        onToggleReplies={setActiveReplies}
                        onToggleReplyInput={() => {}} // Add if needed
                        onAddReply={handleAddReply}
                        onLikeReply={() => {}} // Add if needed
                        onDeleteReply={() => {}} // Add if needed
                        onSetReplyContent={setReplyContent}
                        navigateToUserProfile={navigateToUserProfile}
                    />
                </div>
            </div>

            {/* Image Preview Modal */}
            {showImagePreview && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setShowImagePreview(false)}
                        className="absolute top-4 right-4 text-white text-2xl p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </div>
    );
};

export default Post;
