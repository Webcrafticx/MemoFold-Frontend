import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaHeart,
    FaRegHeart,
    FaTrashAlt,
    FaBars,
    FaHome,
    FaMoon,
    FaSun,
    FaCommentDots,
    FaSignOutAlt,
} from "react-icons/fa";

const MainDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentTime, setCurrentTime] = useState("--:--:--");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null); // Changed from showCommentDropdown
    const { token, username, realname, logout } = useAuth();
    const navigate = useNavigate();
    const API_BASE = "https://memofold1.onrender.com/api";

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Check for saved dark mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedMode);
        document.body.classList.toggle("dark", savedMode);
    }, []);

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    // Fetch posts on component mount and when token changes
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/posts/user/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const data = await response.json();
                setPosts(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching posts:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchPosts();
        } else {
            navigate("/login");
        }
    }, [token, navigate, username]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handlePostSubmit = async () => {
        if (!postContent.trim()) {
            setError("Post content cannot be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: postContent,
                    date: selectedDate || new Date().toISOString().split("T")[0],
                    time: new Date().toLocaleTimeString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create post");
            }

            const result = await response.json();
            setPosts([result, ...posts]);
            setPostContent("");
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Post error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to like post");
            }

            const data = await response.json();
            setPosts(
                posts.map((post) =>
                    post._id === postId ? { ...post, likes: data.likes } : post
                )
            );
        } catch (err) {
            setError(err.message);
            console.error("Error liking post:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?"))
            return;

        try {
            const response = await fetch(`${API_BASE}/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            setPosts(posts.filter((post) => post._id !== postId));
        } catch (err) {
            setError(err.message);
            console.error("Error deleting post:", err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const quickReactions = [
        { text: "Congrats", emoji: "🎉" },
        { text: "Sorrow", emoji: "😭" },
        { text: "LOL", emoji: "😂" },
        { text: "Love", emoji: "❤️" },
        { text: "Interesting", emoji: "🤔" },
    ];

    const addReaction = (reaction) => {
        setPostContent((prev) =>
            `${prev} ${reaction.text} ${reaction.emoji}`.trim()
        );
    };

    const toggleCommentDropdown = (postId) => {
        setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    };

    const handleProfileClick = () => {
        navigate("/profile");
        setShowDropdown(false);
    };

    const handleFeedbackClick = () => {
        navigate("/feedback");
        setShowDropdown(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            setError("Failed to logout. Please try again.");
            console.error("Logout error:", err);
        }
    };

    return (
        <div
            className={`min-h-screen ${
                darkMode
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-gradient-to-r from-gray-100 to-gray-200"
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

            <div className="container mx-auto px-4 py-4">
                {/* Topbar */}
                <div
                    className={`flex justify-between items-center mb-6 p-4 rounded-xl ${
                        darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-md`}
                >
                    {/* Settings Dropdown */}
                    <div className="relative">
                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } transition-colors cursor-pointer`}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <FaBars className="text-xl" />
                        </button>
                        {showDropdown && (
                            <div
                                className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${
                                    darkMode ? "bg-gray-800" : "bg-white"
                                } ring-1 ring-black ring-opacity-5 z-50`}
                            >
                                <div className="py-1">
                                    <span
                                        className={`block px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                        onClick={handleProfileClick}
                                    >
                                        <FaUserCircle className="inline mr-2" />{" "}
                                        Profile
                                    </span>
                                    <div
                                        className={`flex justify-between items-center px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                    >
                                        <div 
                                            className="flex items-center"
                                            onClick={toggleDarkMode}
                                        >
                                            <FaMoon className="inline mr-2" />{" "}
                                            Dark Mode
                                        </div>
                                        <label 
                                            className="relative inline-flex items-center cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={darkMode}
                                                onChange={toggleDarkMode}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <span
                                        className={`block px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                        onClick={handleFeedbackClick}
                                    >
                                        <FaCommentDots className="inline mr-2" />{" "}
                                        Feedback
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                            } shadow-md transition-all hover:scale-110 cursor-pointer`}
                            title="Home"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt className="text-xl" />
                        </button>

                        <input
                            type="date"
                            className={`px-3 py-1 rounded-lg text-sm border ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-300"
                            } cursor-pointer`}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min="1950-01-01"
                            max="2025-12-31"
                        />

                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : "bg-white hover:bg-gray-100"
                            } shadow-md cursor-pointer`}
                            title="Main Feed"
                            onClick={() => navigate("/feed")}
                        >
                            <span className="text-xl">📰</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                    {/* Post Box */}
                    <div
                        className={`mb-6 p-4 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-md`}
                    >
                        <textarea
                            className={`w-full p-4 rounded-xl border ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-white border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none cursor-text`}
                            placeholder={`What's on your mind, ${
                                realname || username
                            }?`}
                            rows="4"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            maxLength="500"
                        />
                        <div className="flex justify-between items-center mt-3">
                            <div className="flex space-x-3">
                                <button
                                    className={`p-2 rounded-xl ${
                                        darkMode
                                            ? "bg-gray-700 hover:bg-gray-600"
                                            : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                                    } shadow-md transition-all cursor-pointer`}
                                    title="Like"
                                >
                                    <span className="text-xl">❤️</span>
                                </button>

                                <div className="relative">
                                    <button
                                        className={`p-2 rounded-xl ${
                                            darkMode
                                                ? "bg-gray-700 hover:bg-gray-600"
                                                : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                                        } shadow-md transition-all cursor-pointer`}
                                        onClick={() =>
                                            setActiveCommentPostId(
                                                activeCommentPostId === "new" ? null : "new"
                                            )
                                        }
                                    >
                                        <span className="text-xl">💬</span>
                                    </button>
                                    {activeCommentPostId === "new" && (
                                        <div
                                            className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg ${
                                                darkMode
                                                    ? "bg-gray-800"
                                                    : "bg-white"
                                            } ring-1 ring-black ring-opacity-5 z-50`}
                                        >
                                            <div className="py-1">
                                                {quickReactions.map(
                                                    (reaction, index) => (
                                                        <span
                                                            key={index}
                                                            className={`block px-4 py-2 text-sm ${
                                                                darkMode
                                                                    ? "text-gray-200 hover:bg-gray-700"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            } cursor-pointer`}
                                                            onClick={() => {
                                                                addReaction(
                                                                    reaction
                                                                );
                                                                setActiveCommentPostId(null);
                                                            }}
                                                        >
                                                            {reaction.text}{" "}
                                                            {reaction.emoji}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {postContent && (
                                    <button
                                        className={`p-2 rounded-xl ${
                                            darkMode
                                                ? "bg-gray-700 hover:bg-gray-600"
                                                : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                                        } shadow-md transition-all cursor-pointer`}
                                        title="Delete"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    "Delete this draft?"
                                                )
                                            ) {
                                                setPostContent("");
                                            }
                                        }}
                                    >
                                        <span className="text-xl">🗑</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <span
                                    className={`text-xs ${
                                        darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {postContent.length}/500 characters
                                </span>
                                <button
                                    className={`px-4 py-2 rounded-lg ${
                                        !postContent.trim() || isLoading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                    } text-white font-medium transition-all cursor-pointer`}
                                    onClick={handlePostSubmit}
                                    disabled={!postContent.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        "Post"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    {isLoading && posts.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div
                            className={`p-4 rounded-xl ${
                                darkMode ? "bg-gray-800" : "bg-white"
                            } shadow-md text-center`}
                        >
                            <p>
                                No posts yet. Be the first to share something!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div
                                    key={post._id}
                                    className={`p-4 rounded-xl ${
                                        darkMode ? "bg-gray-800" : "bg-white"
                                    } shadow-md`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-3">
                                            <FaUserCircle
                                                className="text-3xl text-gray-400 cursor-pointer"
                                                onClick={() =>
                                                    navigate(
                                                        `/profile/${post.userId}`
                                                    )
                                                }
                                            />
                                            <div>
                                                <h3
                                                    className="font-semibold cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/profile/${post.userId}`
                                                        )
                                                    }
                                                >
                                                    {post.username || "Unknown"}
                                                </h3>
                                                <p
                                                    className={`text-xs ${
                                                        darkMode
                                                            ? "text-gray-400"
                                                            : "text-gray-500"
                                                    } cursor-pointer`}
                                                >
                                                    {formatDate(post.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {post.userId === username && (
                                            <button
                                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                onClick={() =>
                                                    handleDeletePost(post._id)
                                                }
                                                title="Delete post"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>

                                    <p className="mb-4 whitespace-pre-line">
                                        {post.content}
                                    </p>

                                    <div className="flex justify-between items-center border-t border-b py-2 my-2 border-gray-200">
                                        <button
                                            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                            onClick={() =>
                                                handleLikePost(post._id)
                                            }
                                        >
                                            {post.likes?.includes(username) ? (
                                                <FaHeart className="text-red-500" />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                            <span className="text-sm">
                                                {post.likes?.length || 0}
                                            </span>
                                        </button>

                                        <div className="relative">
                                            <button
                                                className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                                                onClick={() =>
                                                    toggleCommentDropdown(post._id)
                                                }
                                            >
                                                <FaCommentDots />
                                                <span className="text-sm">
                                                    {post.comments?.length || 0}
                                                </span>
                                            </button>
                                            {activeCommentPostId === post._id && (
                                                <div
                                                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                                                        darkMode
                                                            ? "bg-gray-800"
                                                            : "bg-white"
                                                    } ring-1 ring-black ring-opacity-5 z-50`}
                                                >
                                                    <div className="py-1">
                                                        {quickReactions.map(
                                                            (
                                                                reaction,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={index}
                                                                    className={`block px-4 py-2 text-sm ${
                                                                        darkMode
                                                                            ? "text-gray-200 hover:bg-gray-700"
                                                                            : "text-gray-700 hover:bg-gray-100"
                                                                    } cursor-pointer`}
                                                                    onClick={() => {
                                                                        console.log(
                                                                            `Adding reaction: ${reaction.text} to post ${post._id}`
                                                                        );
                                                                        setActiveCommentPostId(null);
                                                                    }}
                                                                >
                                                                    {
                                                                        reaction.text
                                                                    }{" "}
                                                                    {
                                                                        reaction.emoji
                                                                    }
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Date/Time Display */}
                    <div
                        className={`mt-6 p-4 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-gray-100"
                        } text-center cursor-pointer`}
                    >
                        <p className="font-medium">
                            {selectedDate
                                ? `Selected Date: ${selectedDate}`
                                : `Today: ${new Date().toLocaleDateString()}`}
                        </p>
                        <p
                            className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                        >
                            Current Time: {currentTime}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;