import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaCommentDots, FaTrashAlt } from "react-icons/fa";
import config from "../../hooks/config";

const MainFeed = () => {
    const { token, logout, user, username, realname } = useAuth();
    const navigate = useNavigate();
    
    const [darkMode, setDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState("--:--:--");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [isLiking, setIsLiking] = useState({});
    const [isCommenting, setIsCommenting] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [commentContent, setCommentContent] = useState({});
    const [isLikingComment, setIsLikingComment] = useState({});

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchCurrentUserProfile();
            fetchPosts();
        }
    }, [token, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

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

            const postsWithLikes = postsData.map((post) => ({
                ...post,
                isLiked: post.likes?.some((like) => like.userId === username) || false,
                createdAt: post.createdAt || new Date().toISOString(),
                comments: post.comments || []
            }));

            setPosts(postsWithLikes);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        
        try {
            const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const responseData = await response.json();
            const comments = responseData.comments || [];

            const commentsWithLikes = comments.map(comment => ({
                ...comment,
                isLiked: comment.likes?.some(like => like.userId === username) || false
            }));

            setPosts(posts.map(post =>
                post._id === postId ? { 
                    ...post, 
                    comments: commentsWithLikes, 
                    commentCount: commentsWithLikes.length 
                } : post
            ));
        } catch (err) {
            setError(err.message);
            console.error("Error fetching comments:", err);
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleLikeComment = async (commentId, postId) => {
        if (!username) {
            setError("You must be logged in to like comments");
            return;
        }

        setIsLikingComment(prev => ({ ...prev, [commentId]: true }));

        try {
            // Optimistic UI update
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const updatedComments = post.comments?.map(comment => {
                        if (comment._id === commentId) {
                            const isLiked = comment.isLiked;
                            return {
                                ...comment,
                                isLiked: !isLiked,
                                likes: isLiked
                                    ? comment.likes?.filter(like => like.userId !== username) || []
                                    : [...(comment.likes || []), { userId: username }]
                            };
                        }
                        return comment;
                    });
                    return { ...post, comments: updatedComments };
                }
                return post;
            }));

            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}/like`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ 
                        userId: username // Send userId instead of content and parentCommentId
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like comment");
            }

            // Refresh comments to get updated like count from server
            await fetchComments(postId);
        } catch (err) {
            console.error("Error liking comment:", err);
            setError(err.message);
            // Revert optimistic update on error
            await fetchComments(postId);
        } finally {
            setIsLikingComment(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleLike = async (postId) => {
        if (!username) {
            console.error("Username not available");
            setError("You must be logged in to like posts");
            return;
        }

        setIsLiking(prev => ({ ...prev, [postId]: true }));

        try {
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.isLiked;
                    return {
                        ...post,
                        isLiked: !isLiked,
                        likes: isLiked
                            ? post.likes?.filter(like => like.userId !== username) || []
                            : [...(post.likes || []), { userId: username }]
                    };
                }
                return post;
            }));

            const response = await fetch(`${config.apiUrl}/posts/like/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update like status");
            }

            const updatedPost = await response.json();
            setPosts(posts.map(post => 
                post._id === postId ? {
                    ...post,
                    ...updatedPost,
                    isLiked: updatedPost.likes?.some(like => like.userId === username) || false
                } : post
            ));
        } catch (err) {
            console.error("Error liking post:", err);
            setError(err.message);
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked, 
                        likes: post.isLiked
                            ? post.likes?.filter(like => like.userId !== username) || []
                            : [...(post.likes || []), { userId: username }]
                    };
                }
                return post;
            }));
        } finally {
            setIsLiking(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleCommentDropdown = async (postId) => {
        if (activeCommentPostId !== postId) {
            await fetchComments(postId);
        }
        
        setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
        setCommentContent((prev) => ({
            ...prev,
            [postId]: prev[postId] || "",
        }));
    };

    const handleCommentSubmit = async (postId) => {
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

        setIsCommenting(prev => ({ ...prev, [postId]: true }));
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
            
            // Update the post with the new comment from the server response
            setPosts(posts.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        comments: [...(post.comments || []), {
                            ...createdComment,
                            isLiked: false,
                            userId: {
                                _id: currentUserProfile?._id || user?._id || username,
                                username: username,
                                realname: currentUserProfile?.realname || realname || username,
                                profilePic: currentUserProfile?.profilePic || user?.profilePic
                            }
                        }]
                    }
                    : post
            ));

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            console.error("Error posting comment:", err);
            setError(err.message);
        } finally {
            setIsCommenting(prev => ({ ...prev, [postId]: false }));
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

    const navigateToUserProfile = (userId) => {
        if (userId) {
            // Check if this is the current user's profile
            if (currentUserProfile && userId === currentUserProfile._id) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"}`}>
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

            <header className={`bg-white shadow-sm px-6 py-4 flex justify-between items-center ${darkMode ? "dark:bg-gray-800" : ""}`}>
                <h1
                    className="text-xl font-semibold text-gray-900 tracking-wide dark:text-white cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => navigate("/dashboard")}
                >
                    MemoFold
                </h1>

                <nav className="flex gap-5">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={logout}
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
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
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
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
                        <p className="text-lg">
                            No posts yet. Be the first to share something!
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${darkMode ? "dark:bg-gray-800" : ""}`}
                        >
                            <div
                                className="flex items-center gap-3 mb-3 cursor-pointer"
                                onClick={() => navigateToUserProfile(post.userId._id)}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                                    {post.userId.profilePic ? (
                                        <img
                                            src={post.userId.profilePic}
                                            alt={post.userId.username}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<span class="text-lg font-semibold text-gray-700">${post.userId.username?.charAt(0).toUpperCase() || 'U'}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-lg font-semibold text-gray-700">
                                            {post.userId.username?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white hover:text-blue-500 transition-colors">
                                        {post.userId.realname || post.userId.username || "Unknown User"}
                                    </h3>
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        @{post.userId.username || "unknown"} · {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full rounded-xl mb-3 cursor-pointer"
                                    onClick={() => window.open(post.image, "_blank")}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            )}

                            <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300">
                                {post.content || ""}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(post._id);
                                    }}
                                    disabled={isLiking[post._id]}
                                    className={`flex items-center gap-1 ${isLiking[post._id] ? "opacity-50 cursor-not-allowed" : ""} hover:text-red-500 transition-colors cursor-pointer`}
                                >
                                    {isLiking[post._id] ? (
                                        <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : post.isLiked ? (
                                        <FaHeart className="text-xl text-red-500" />
                                    ) : (
                                        <FaRegHeart className="text-xl text-gray-400" />
                                    )}
                                    <span className={`text-sm font-medium ${post.isLiked ? "text-red-500" : "text-gray-400"}`}>
                                        {post.likes?.length || 0} likes
                                    </span>
                                </button>

                                <button
                                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                                    onClick={() => toggleCommentDropdown(post._id)}
                                    disabled={loadingComments[post._id]}
                                >
                                    <FaCommentDots />
                                    <span className="text-sm">
                                        {post.comments?.length || 0}
                                    </span>
                                    {loadingComments[post._id] && (
                                        <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                                    )}
                                </button>
                            </div>

                            {/* Comments Section - Updated to match dashboard */}
                            {activeCommentPostId === post._id && (
                                <div className="mt-4">
                                    {/* Show loading state when fetching */}
                                    {loadingComments[post._id] ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm mt-2">Loading comments...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Show comments if they exist */}
                                            {post.comments && post.comments.length > 0 ? (
                                                <div className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                                    {post.comments.map((comment) => (
                                                        <div key={comment._id} className="flex items-start space-x-2">
                                                            <div 
                                                                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigateToUserProfile(comment.userId?._id);
                                                                }}
                                                            >
                                                                {comment.userId?.profilePic ? (
                                                                    <img
                                                                        src={comment.userId.profilePic}
                                                                        alt={comment.userId.username}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${comment.userId.username?.charAt(0).toUpperCase() || 'U'}</span>`;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-gray-700">
                                                                        {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span 
                                                                        className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigateToUserProfile(comment.userId?._id);
                                                                        }}
                                                                    >
                                                                        {comment.userId?.username || "Unknown"}
                                                                    </span>
                                                                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                        {formatDate(comment.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm whitespace-pre-line mt-1">
                                                                    {comment.content}
                                                                </p>
                                                                <div className="mt-1 flex items-center">
                                                                    <button
                                                                        className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                                                        onClick={() => handleLikeComment(comment._id, post._id)}
                                                                        disabled={isLikingComment[comment._id]}
                                                                    >
                                                                        {isLikingComment[comment._id] ? (
                                                                            <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                        ) : comment.isLiked ? (
                                                                            <FaHeart className="text-xs text-red-500" />
                                                                        ) : (
                                                                            <FaRegHeart className="text-xs" />
                                                                        )}
                                                                        <span className="text-xs">
                                                                            {comment.likes?.length || 0}
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    No comments yet. Be the first to comment!
                                                </div>
                                            )}

                                            {/* Add Comment Input */}
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                                                    {currentUserProfile?.profilePic || user?.profilePic ? (
                                                        <img
                                                            src={currentUserProfile?.profilePic || user?.profilePic}
                                                            alt={username}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${username?.charAt(0).toUpperCase() || 'U'}</span>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {username?.charAt(0).toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex space-x-2">
                                                    <input
                                                        type="text"
                                                        className={`flex-1 px-3 py-2 rounded-full text-sm border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                        placeholder="Write a comment..."
                                                        value={commentContent[post._id] || ""}
                                                        onChange={(e) => 
                                                            setCommentContent({
                                                                ...commentContent,
                                                                [post._id]: e.target.value
                                                            })
                                                        }
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleCommentSubmit(post._id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        className={`px-3 py-1 rounded-full text-sm ${!commentContent[post._id]?.trim() || isCommenting[post._id] ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
                                                        onClick={() => handleCommentSubmit(post._id)}
                                                        disabled={!commentContent[post._id]?.trim() || isCommenting[post._id]}
                                                    >
                                                        {isCommenting[post._id] ? (
                                                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        ) : (
                                                            "Post"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
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