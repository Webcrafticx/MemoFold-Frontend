import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaComment,
    FaTrashAlt,
    FaTimes,
} from "react-icons/fa";
import config from "../../hooks/config";

const MainFeed = () => {
    const { token, logout, user, username, realname } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [isLiking, setIsLiking] = useState({});
    const [isCommenting, setIsCommenting] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [commentContent, setCommentContent] = useState({});
    const [isLikingComment, setIsLikingComment] = useState({});
    const [isDeletingComment, setIsDeletingComment] = useState({});

    // Image preview states
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });
    const imagePreviewRef = useRef(null);

    // Helper functions to manage localStorage likes
    const getStoredLikes = () => {
        try {
            return JSON.parse(localStorage.getItem("postLikes") || "{}");
        } catch (error) {
            console.error("Error parsing stored likes:", error);
            return {};
        }
    };

    const updateStoredLikes = (postId, likes) => {
        const storedLikes = getStoredLikes();
        storedLikes[postId] = likes;
        localStorage.setItem("postLikes", JSON.stringify(storedLikes));
    };

    // Helper functions for comment likes
    const getStoredCommentLikes = () => {
        try {
            return JSON.parse(localStorage.getItem("commentLikes") || "{}");
        } catch (error) {
            console.error("Error parsing stored comment likes:", error);
            return {};
        }
    };

    const updateStoredCommentLikes = (commentId, likes) => {
        const storedCommentLikes = getStoredCommentLikes();
        storedCommentLikes[commentId] = likes;
        localStorage.setItem(
            "commentLikes",
            JSON.stringify(storedCommentLikes)
        );
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchCurrentUserProfile();
            fetchPosts();
        }
    }, [token, navigate]);

    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedMode);
        document.body.classList.toggle("dark", savedMode);
    }, []);

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const fetchCurrentUserProfile = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setCurrentUserProfile(userData);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchPosts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.apiUrl}/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }

            const data = await response.json();
            const postsData = Array.isArray(data) ? data : data.posts || [];

            // Get stored likes from localStorage
            const storedLikes = getStoredLikes();

            const postsWithLikes = postsData.map((post) => {
                // Get likes from storage or API
                const postLikes = storedLikes[post._id] || post.likes || [];

                // Check if current user has liked this post (handles both user ID and username)
                const hasUserLiked =
                    postLikes.includes(user._id) ||
                    postLikes.includes(username) ||
                    post.likes?.some((like) => like.userId === username);

                return {
                    ...post,
                    likes: postLikes,
                    hasUserLiked: hasUserLiked,
                    createdAt: post.createdAt || new Date().toISOString(),
                    comments: post.comments || [],
                };
            });

            setPosts(postsWithLikes);

            // Update localStorage with current likes
            const likesByPost = {};
            postsData.forEach((post) => {
                const storedPostLikes =
                    storedLikes[post._id] || post.likes || [];
                likesByPost[post._id] = storedPostLikes;
            });

            localStorage.setItem("postLikes", JSON.stringify(likesByPost));
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));

        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const responseData = await response.json();
            const comments = responseData.comments || [];

            // Get stored comment likes from localStorage
            const storedCommentLikes = getStoredCommentLikes();

            const commentsWithLikes = comments.map((comment) => {
                // Get likes from storage or API
                const commentLikes =
                    storedCommentLikes[comment._id] || comment.likes || [];

                // Check if current user has liked this comment
                const hasUserLiked = commentLikes.includes(user._id);

                return {
                    ...comment,
                    likes: commentLikes,
                    hasUserLiked: hasUserLiked,
                };
            });

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: commentsWithLikes,
                              commentCount: commentsWithLikes.length,
                          }
                        : post
                )
            );

            // Update localStorage with current comment likes
            const likesByComment = {};
            comments.forEach((comment) => {
                likesByComment[comment._id] =
                    storedCommentLikes[comment._id] || comment.likes || [];
            });

            localStorage.setItem(
                "commentLikes",
                JSON.stringify(likesByComment)
            );
        } catch (err) {
            setError(err.message);
            console.error("Error fetching comments:", err);
        } finally {
            setLoadingComments((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const handleLikeComment = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!username || !user?._id) {
            setError("You must be logged in to like comments");
            return;
        }

        setIsLikingComment((prev) => ({ ...prev, [commentId]: true }));

        try {
            // Optimistic UI update
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const isLiked = comment.hasUserLiked;
                                    let updatedLikes;

                                    if (isLiked) {
                                        // Remove user ID
                                        updatedLikes = comment.likes.filter(
                                            (likeUserId) =>
                                                likeUserId !== user._id
                                        );
                                    } else {
                                        // Add user ID
                                        updatedLikes = [
                                            ...(comment.likes || []),
                                            user._id,
                                        ];
                                    }

                                    // Update localStorage
                                    updateStoredCommentLikes(
                                        commentId,
                                        updatedLikes
                                    );

                                    return {
                                        ...comment,
                                        likes: updatedLikes,
                                        hasUserLiked: !isLiked,
                                    };
                                }
                                return comment;
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                })
            );

            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}/like`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: user._id,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like comment");
            }

            await fetchComments(postId);
        } catch (err) {
            console.error("Error liking comment:", err);
            setError(err.message);
            await fetchComments(postId);
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleDeleteComment = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const post = posts.find((p) => p._id === postId);
        const comment = post?.comments?.find((c) => c._id === commentId);

        if (!post || !comment) {
            setError("Comment not found");
            return;
        }

        const isCommentOwner = comment.userId?.username === username;
        const isPostOwner = post.userId?.username === username;

        if (!isCommentOwner && !isPostOwner) {
            setError("You don't have permission to delete this comment");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        setIsDeletingComment((prev) => ({ ...prev, [commentId]: true }));

        const originalPosts = [...posts];

        try {
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments =
                            post.comments?.filter(
                                (comment) => comment._id !== commentId
                            ) || [];
                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: updatedComments.length,
                        };
                    }
                    return post;
                })
            );

            // Remove comment likes from localStorage when comment is deleted
            const storedCommentLikes = getStoredCommentLikes();
            delete storedCommentLikes[commentId];
            localStorage.setItem(
                "commentLikes",
                JSON.stringify(storedCommentLikes)
            );

            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ postId }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete comment"
                );
            }

            setSuccessMessage("Comment deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error deleting comment:", err);
            setError(err.message);

            setPosts(originalPosts);
        } finally {
            setIsDeletingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleLike = async (postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!username || !user?._id) {
            console.error("User information not available");
            setError("You must be logged in to like posts");
            return;
        }

        setIsLiking((prev) => ({ ...prev, [postId]: true }));

        try {
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const isLiked = post.hasUserLiked;
                        let updatedLikes;

                        if (isLiked) {
                            // Remove both user ID and username
                            updatedLikes = post.likes.filter(
                                (like) => like !== user._id && like !== username
                            );
                        } else {
                            // Add both user ID and username for compatibility
                            updatedLikes = [
                                ...post.likes,
                                user._id, // Store user ID
                                // username, // Store username for backward compatibility
                            ];
                        }

                        // Update localStorage with both formats
                        updateStoredLikes(postId, updatedLikes);

                        return {
                            ...post,
                            likes: updatedLikes,
                            hasUserLiked: !isLiked,
                        };
                    }
                    return post;
                })
            );

            const response = await fetch(
                `${config.apiUrl}/posts/like/${postId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId: user._id }), // Send user ID to API
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like post");
            }
        } catch (err) {
            console.error("Error liking post:", err);
            setError(err.message);

            // Revert optimistic update on error
            await fetchPosts();
        } finally {
            setIsLiking((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const toggleCommentDropdown = async (postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (activeCommentPostId !== postId) {
            await fetchComments(postId);
        }

        setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
        setCommentContent((prev) => ({
            ...prev,
            [postId]: prev[postId] || "",
        }));
    };

    const handleCommentSubmit = async (postId, e) => {
        if (e) e.preventDefault();

        const content = commentContent[postId] || "";

        if (!content.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        if (!username) {
            setError("You must be logged in to comment");
            navigate("/login");
            return;
        }

        setIsCommenting((prev) => ({ ...prev, [postId]: true }));
        setError(null);

        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        postId: postId,
                        content: content,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to post comment");
            }

            const responseData = await response.json();
            const createdComment = responseData.comment || responseData;

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [
                                  ...(post.comments || []),
                                  {
                                      ...createdComment,
                                      isLiked: false,
                                      userId: {
                                          _id:
                                              currentUserProfile?._id ||
                                              user?._id ||
                                              username,
                                          username: username,
                                          realname:
                                              currentUserProfile?.realname ||
                                              realname ||
                                              username,
                                          profilePic:
                                              currentUserProfile?.profilePic ||
                                              user?.profilePic,
                                      },
                                  },
                              ],
                          }
                        : post
                )
            );

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            console.error("Error posting comment:", err);
            setError(err.message);
        } finally {
            setIsCommenting((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Just now";
            }

            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) {
                return "Just now";
            } else if (diffInSeconds < 3600) {
                return `${Math.floor(diffInSeconds / 60)}m ago`;
            } else if (diffInSeconds < 86400) {
                return `${Math.floor(diffInSeconds / 3600)}h ago`;
            } else {
                return date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            }
        } catch (e) {
            return "Just now";
        }
    };

    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (userId) {
            if (currentUserProfile && userId === currentUserProfile._id) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
    };

    // Function to handle image load and get dimensions
    const handleImageLoad = (e) => {
        const img = e.target;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
    };

    // Calculate the appropriate size for the image preview
    const getImagePreviewStyle = () => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (
            imageDimensions.width > maxWidth ||
            imageDimensions.height > maxHeight
        ) {
            const widthRatio = maxWidth / imageDimensions.width;
            const heightRatio = maxHeight / imageDimensions.height;
            const ratio = Math.min(widthRatio, heightRatio);

            return {
                width: imageDimensions.width * ratio,
                height: imageDimensions.height * ratio,
            };
        }

        return {
            width: imageDimensions.width,
            height: imageDimensions.height,
        };
    };

    return (
        <div
            className={`min-h-screen ${
                darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"
            }`}
        >
            {/* Error Message */}
            {error && (
                <div className="fixed top-4 right-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm shadow-lg z-50 cursor-pointer">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700 font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm shadow-lg z-50 cursor-pointer">
                    {successMessage}
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-2 text-green-700 font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Image Preview Modal */}
            {showImagePreview && (
                <div
                    className="fixed inset-0 backdrop-blur bg-transparent bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    <div
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            ref={imagePreviewRef}
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onLoad={handleImageLoad}
                            style={getImagePreviewStyle()}
                        />
                        <button
                            className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            onClick={() => setShowImagePreview(false)}
                        >
                            <FaTimes />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                            {imageDimensions.width} × {imageDimensions.height}
                        </div>
                    </div>
                </div>
            )}

            <header
                className={`bg-white shadow-sm px-6 py-4 flex justify-between items-center ${
                    darkMode ? "dark:bg-gray-800" : ""
                }`}
            >
                <h1
                    className="text-xl font-semibold text-gray-900 tracking-wide dark:text-white cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => navigate("/dashboard")}
                >
                    MemoFold
                </h1>

                <nav className="flex gap-5">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/dashboard");
                        }}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        Home
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/profile");
                        }}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2">Loading posts...</p>
                    </div>
                ) : error ? (
                    <div
                        className={`text-center py-10 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-lg w-full max-w-2xl`}
                    >
                        <p className="text-lg text-red-500">
                            Error loading posts: {error}
                        </p>
                        <button
                            onClick={fetchPosts}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div
                        className={`text-center py-10 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-lg w-full max-w-2xl`}
                    >
                        <p className="text-lg">
                            No posts yet. Be the first to share something!
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${
                                darkMode ? "dark:bg-gray-800" : ""
                            }`}
                        >
                            <div
                                className="flex items-center gap-3 mb-3 cursor-pointer"
                                onClick={(e) =>
                                    navigateToUserProfile(post.userId._id, e)
                                }
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                                    {post.userId.profilePic ? (
                                        <img
                                            src={post.userId.profilePic}
                                            alt={post.userId.username}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.parentElement.innerHTML = `<span class="text-lg font-semibold text-gray-700">${
                                                    post.userId.username
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"
                                                }</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-lg font-semibold text-gray-700">
                                            {post.userId.username
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white hover:text-blue-500 transition-colors">
                                        {post.userId.realname ||
                                            post.userId.username ||
                                            "Unknown User"}
                                    </h3>
                                    <p
                                        className={`text-xs ${
                                            darkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        @{post.userId.username || "unknown"} ·{" "}
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Text content appears first */}
                            <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300">
                                {post.content || ""}
                            </p>

                            {/* Image appears after text - Fixed container */}
                            {post.image && (
                                <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                                    <img
                                        src={post.image}
                                        alt="Post"
                                        className="max-h-96 max-w-full object-contain cursor-pointer"
                                        onClick={() => {
                                            setPreviewImage(post.image);
                                            setShowImagePreview(true);
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <button
                                    onClick={(e) => handleLike(post._id, e)}
                                    disabled={isLiking[post._id]}
                                    className={`flex items-center gap-1 ${
                                        isLiking[post._id]
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
                                    <span
                                        className={`text-sm font-medium ${
                                            post.hasUserLiked
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {post.likes?.length || 0}
                                    </span>
                                </button>

                                <button
                                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                                    onClick={(e) =>
                                        toggleCommentDropdown(post._id, e)
                                    }
                                    disabled={loadingComments[post._id]}
                                >
                                    <FaComment />
                                    <span className="text-sm">
                                        {post.comments?.length || 0}
                                    </span>
                                    {loadingComments[post._id] && (
                                        <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                                    )}
                                </button>
                            </div>

                            {/* Comments Section */}
                            {activeCommentPostId === post._id && (
                                <div className="mt-4">
                                    {/* Show loading state when fetching */}
                                    {loadingComments[post._id] ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm mt-2">
                                                Loading comments...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Show comments if they exist */}
                                            {post.comments &&
                                            post.comments.length > 0 ? (
                                                <div
                                                    className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${
                                                        darkMode
                                                            ? "bg-gray-700"
                                                            : "bg-gray-100"
                                                    }`}
                                                >
                                                    {post.comments.map(
                                                        (comment) => (
                                                            <div
                                                                key={
                                                                    comment._id
                                                                }
                                                                className="flex items-start space-x-2"
                                                            >
                                                                <div
                                                                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        navigateToUserProfile(
                                                                            comment
                                                                                .userId
                                                                                ?._id,
                                                                            e
                                                                        )
                                                                    }
                                                                >
                                                                    {comment
                                                                        .userId
                                                                        ?.profilePic ? (
                                                                        <img
                                                                            src={
                                                                                comment
                                                                                    .userId
                                                                                    .profilePic
                                                                            }
                                                                            alt={
                                                                                comment
                                                                                    .userId
                                                                                    .username
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.target.style.display =
                                                                                    "none";
                                                                                e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${
                                                                                    comment.userId.username
                                                                                        ?.charAt(
                                                                                            0
                                                                                        )
                                                                                        .toUpperCase() ||
                                                                                    "U"
                                                                                }</span>`;
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-semibold text-gray-700">
                                                                            {comment.userId?.username
                                                                                ?.charAt(
                                                                                    0
                                                                                )
                                                                                .toUpperCase() ||
                                                                                "U"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span
                                                                            className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                navigateToUserProfile(
                                                                                    comment
                                                                                        .userId
                                                                                        ?._id,
                                                                                    e
                                                                                )
                                                                            }
                                                                        >
                                                                            {comment
                                                                                .userId
                                                                                ?.username ||
                                                                                "Unknown"}
                                                                        </span>
                                                                        <span
                                                                            className={`text-xs ${
                                                                                darkMode
                                                                                    ? "text-gray-400"
                                                                                    : "text-gray-500"
                                                                            }`}
                                                                        >
                                                                            {formatDate(
                                                                                comment.createdAt
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm whitespace-pre-line mt-1">
                                                                        {
                                                                            comment.content
                                                                        }
                                                                    </p>
                                                                    <div className="mt-1 flex items-center justify-between">
                                                                        <button
                                                                            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                handleLikeComment(
                                                                                    comment._id,
                                                                                    post._id,
                                                                                    e
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isLikingComment[
                                                                                    comment
                                                                                        ._id
                                                                                ]
                                                                            }
                                                                        >
                                                                            {isLikingComment[
                                                                                comment
                                                                                    ._id
                                                                            ] ? (
                                                                                <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                            ) : comment.hasUserLiked ? (
                                                                                <FaHeart className="text-xs text-red-500" />
                                                                            ) : (
                                                                                <FaRegHeart className="text-xs" />
                                                                            )}
                                                                            <span className="text-xs">
                                                                                {comment
                                                                                    .likes
                                                                                    ?.length ||
                                                                                    0}
                                                                            </span>
                                                                        </button>

                                                                        {/* Updated delete button condition for both comment owner AND post owner */}
                                                                        {(comment
                                                                            .userId
                                                                            ?.username ===
                                                                            username ||
                                                                            post
                                                                                .userId
                                                                                ?.username ===
                                                                                username) && (
                                                                            <button
                                                                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDeleteComment(
                                                                                        comment._id,
                                                                                        post._id,
                                                                                        e
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isDeletingComment[
                                                                                        comment
                                                                                            ._id
                                                                                    ]
                                                                                }
                                                                                title="Delete comment"
                                                                            >
                                                                                {isDeletingComment[
                                                                                    comment
                                                                                        ._id
                                                                                ] ? (
                                                                                    <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                ) : (
                                                                                    <FaTrashAlt />
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    No comments yet. Be the
                                                    first to comment!
                                                </div>
                                            )}

                                            {/* Add Comment Input */}
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    handleCommentSubmit(
                                                        post._id,
                                                        e
                                                    );
                                                }}
                                                className="flex items-center space-x-2"
                                            >
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                                                    {currentUserProfile?.profilePic ||
                                                    user?.profilePic ? (
                                                        <img
                                                            src={
                                                                currentUserProfile?.profilePic ||
                                                                user?.profilePic
                                                            }
                                                            alt={username}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                                e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${
                                                                    username
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() ||
                                                                    "U"
                                                                }</span>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {username
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex space-x-2">
                                                    <input
                                                        type="text"
                                                        className={`flex-1 px-3 py-2 rounded-full text-sm border ${
                                                            darkMode
                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                : "bg-white border-gray-300"
                                                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        placeholder="Write a comment..."
                                                        value={
                                                            commentContent[
                                                                post._id
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            setCommentContent({
                                                                ...commentContent,
                                                                [post._id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={`px-3 py-1 rounded-full text-sm ${
                                                            !commentContent[
                                                                post._id
                                                            ]?.trim() ||
                                                            isCommenting[
                                                                post._id
                                                            ]
                                                                ? "bg-blue-300 cursor-not-allowed"
                                                                : "bg-blue-500 hover:bg-blue-600"
                                                        } text-white transition-colors`}
                                                        disabled={
                                                            !commentContent[
                                                                post._id
                                                            ]?.trim() ||
                                                            isCommenting[
                                                                post._id
                                                            ]
                                                        }
                                                    >
                                                        {isCommenting[
                                                            post._id
                                                        ] ? (
                                                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        ) : (
                                                            "Post"
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
};

export default MainFeed;
