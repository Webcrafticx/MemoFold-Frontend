import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaCommentDots, FaMoon, FaSun } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import PostSkeleton from "./PostSkeleton";

const MainFeed = () => {
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => 
        localStorage.getItem("darkMode") === "true"
    );
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const API_BASE = process.env.REACT_APP_API_BASE || "https://memofold1.onrender.com/api";

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? 'Session expired' : 'Failed to fetch posts');
            }

            const data = await response.json();
            const postsWithLikes = data.map(post => ({
                ...post,
                isLiked: post.likes?.some(like => like.userId === user?.id) || false
            }));
            setPosts(postsWithLikes);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            if (err.message === 'Session expired') {
                logout();
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token, user?.id, logout, navigate, API_BASE]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchPosts();
        }
    }, [token, navigate, fetchPosts]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode);
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const handleLike = async (postId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            // Optimistic UI update
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    const isLiked = post.likes?.some(like => like.userId === user.id) || false;
                    return {
                        ...post,
                        isLiked: !isLiked,
                        likes: isLiked
                            ? post.likes?.filter(like => like.userId !== user.id) || []
                            : [...(post.likes || []), { userId: user.id }]
                    };
                }
                return post;
            }));

            const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update like status');
            }
        } catch (err) {
            console.error("Error liking post:", err);
            fetchPosts(); // Revert to server state on error
        }
    };

    const toggleCommentDropdown = (postId) => {
        setActiveCommentPostId(prevId => prevId === postId ? null : postId);
        if (!commentTexts[postId]) {
            setCommentTexts(prev => ({ ...prev, [postId]: "" }));
        }
    };

    const handleCommentSubmit = async (postId) => {
        const text = commentTexts[postId]?.trim();
        if (!text || !user) return;

        try {
            const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: text }),
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const updatedPost = await response.json();
            setPosts(posts.map(post => 
                post.id === postId ? {
                    ...post,
                    comments: updatedPost.comments
                } : post
            ));

            setCommentTexts(prev => ({ ...prev, [postId]: "" }));
            setActiveCommentPostId(null);
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"}`}>
            <header className={`sticky top-0 z-10 bg-white shadow-sm px-6 py-4 flex justify-between items-center ${darkMode ? "dark:bg-gray-800" : ""}`}>
                <h1 
                    className="text-xl font-semibold text-gray-900 tracking-wide dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    onClick={() => navigate("/dashboard")}
                >
                    MemoFold
                </h1>

                <div className="flex items-center gap-5">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
                    </button>
                    
                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${refreshing ? "animate-spin" : ""}`}
                        aria-label="Refresh posts"
                        disabled={refreshing}
                    >
                        <IoMdRefresh />
                    </button>

                    <nav className="hidden md:flex gap-5">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => navigate("/profile")}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                        >
                            Profile
                        </button>
                        <button
                            onClick={logout}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <main className="py-8 px-4 sm:px-6 flex flex-col items-center gap-8">
                {isLoading ? (
                    <div className="w-full max-w-2xl space-y-6">
                        {[...Array(3)].map((_, i) => <PostSkeleton key={i} darkMode={darkMode} />)}
                    </div>
                ) : error ? (
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
                        <p className="text-lg text-red-500">{error}</p>
                        <button 
                            onClick={fetchPosts}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
                        <p className="text-lg">No posts yet. Be the first to share something!</p>
                        <button
                            onClick={() => navigate("/create-post")}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Create Post
                        </button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <article
                            key={post.id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                                darkMode ? "dark:bg-gray-800" : ""
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={post.profilePic || `https://ui-avatars.com/api/?name=${post.username}&background=random`}
                                    alt={post.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${post.username}&background=random`;
                                    }}
                                />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                        {post.username}
                                    </h3>
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full max-h-96 object-contain rounded-xl mb-3 bg-gray-100 dark:bg-gray-700"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                    loading="lazy"
                                />
                            )}

                            <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300 whitespace-pre-line">
                                {post.content}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1 ${
                                        post.isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                                    } dark:text-gray-300 transition-colors`}
                                    aria-label={post.isLiked ? "Unlike post" : "Like post"}
                                >
                                    {post.isLiked ? (
                                        <FaHeart className="text-xl" />
                                    ) : (
                                        <FaRegHeart className="text-xl" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {post.likes?.length || 0}
                                    </span>
                                </button>

                                <div className="relative">
                                    <button
                                        className="flex items-center gap-1 text-gray-400 hover:text-blue-500 dark:text-gray-300 cursor-pointer transition-colors"
                                        onClick={() => toggleCommentDropdown(post.id)}
                                        aria-label="Toggle comments"
                                    >
                                        <FaCommentDots className="text-xl" />
                                        <span className="text-sm font-medium">
                                            {post.comments?.length || 0}
                                        </span>
                                    </button>
                                    
                                    {activeCommentPostId === post.id && (
                                        <div className={`absolute right-0 mt-2 w-64 sm:w-80 rounded-md shadow-lg py-1 ${darkMode ? "bg-gray-700" : "bg-white"} ring-1 ring-black ring-opacity-5 z-10`}>
                                            <div className="px-4 py-2">
                                                {post.comments?.length > 0 ? (
                                                    <div className="mb-3 max-h-40 overflow-y-auto">
                                                        {post.comments.map((comment) => (
                                                            <div key={comment.id} className="mb-2 text-sm">
                                                                <span className="font-semibold">{comment.username}:</span> {comment.content}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>No comments yet</p>
                                                )}
                                                <textarea 
                                                    className={`mt-1 w-full p-2 border rounded ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "border-gray-300"}`}
                                                    rows="3"
                                                    placeholder="Write your comment..."
                                                    value={commentTexts[post.id] || ""}
                                                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button 
                                                        type="button"
                                                        className={`px-3 py-1 text-sm rounded ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
                                                        onClick={() => handleCommentSubmit(post.id)}
                                                        disabled={!commentTexts[post.id]?.trim()}
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </main>

            <footer className={`mt-6 p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"} text-center mx-auto max-w-2xl mb-6`}>
                <p className="font-medium dark:text-white">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Current Time: {currentTime}
                </p>
            </footer>
        </div>
    );
};

export default MainFeed;