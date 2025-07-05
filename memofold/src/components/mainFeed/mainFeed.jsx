import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaHome,
    FaBars,
    FaMoon,
    FaSun,
    FaCommentDots,
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

const MainFeed = () => {
    const { token, username, realname, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCommentDropdown, setShowCommentDropdown] = useState(false);
    const [currentTime, setCurrentTime] = useState("--:--:--");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_BASE = "https://memofold1.onrender.com/api";

    // Sample posts data - replace with actual API call
    const samplePosts = [
        {
            id: 1,
            username: "travel_enthusiast",
            profilePic: "/assets/profile1.jpg",
            image: "/assets/post1.jpg",
            content:
                "Beautiful sunset views from my trip to Bali last week. The colors were absolutely breathtaking! 🌅 #travel #bali",
            likes: 42,
            isLiked: false,
            comments: [],
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            username: "food_lover",
            profilePic: "/assets/profile2.jpg",
            image: "/assets/post2.jpg",
            content:
                "Homemade pasta with fresh ingredients from the farmers market. Nothing beats a home-cooked meal! 🍝 #foodie #homecooking",
            likes: 28,
            isLiked: true,
            comments: [],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 3,
            username: "urban_explorer",
            profilePic: "/assets/profile3.jpg",
            image: "/assets/post3.jpg",
            content:
                "Exploring hidden alleys and street art in the city today. So much creativity everywhere you look! 🎨 #streetart #explore",
            likes: 15,
            isLiked: false,
            comments: [],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
    ];

    // Check authentication on mount
    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            // In a real app, you would fetch posts from the API here
            setPosts(samplePosts);
        }
    }, [token, navigate]);

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

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleLike = (postId) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    };
                }
                return post;
            })
        );
    };

    const quickReactions = [
        { text: "Congrats", emoji: "🎉" },
        { text: "Sorrow", emoji: "😭" },
        { text: "LOL", emoji: "😂" },
        { text: "Love", emoji: "❤️" },
        { text: "Interesting", emoji: "🤔" },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            className={`min-h-screen ${
                darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"
            }`}
        >
            {/* Error Message */}
            {error && (
                <div className="fixed top-4 right-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm shadow-lg z-50">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700 font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header
                className={`bg-white shadow-sm px-6 py-4 flex justify-between items-center ${
                    darkMode ? "dark:bg-gray-800" : ""
                }`}
            >
                <h1 className="text-xl font-semibold text-gray-900 tracking-wide dark:text-white">
                    MemoFold
                </h1>

                {/* Settings Dropdown */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } transition-colors`}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <FaBars className="text-xl" />
                        </button>
                        {showDropdown && (
                            <div
                                className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${
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
                                    >
                                        <FaUserCircle className="inline mr-2" />{" "}
                                        Profile
                                    </span>
                                    <span
                                        className={`block px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer flex items-center justify-between`}
                                        onClick={toggleDarkMode}
                                    >
                                        <span>
                                            <FaMoon className="inline mr-2" />{" "}
                                            Dark Mode
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={darkMode}
                                                onChange={toggleDarkMode}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </span>
                                    <span
                                        className={`block px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                    >
                                        <FaCommentDots className="inline mr-2" />{" "}
                                        Feedback
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="flex gap-5">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => navigate("/profile")}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            My Profile
                        </button>
                        <button
                            onClick={logout}
                            className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {/* Posts Grid */}
            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2">Loading posts...</p>
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
                            key={post.id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                                darkMode ? "dark:bg-gray-800" : ""
                            }`}
                        >
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={
                                        post.profilePic ||
                                        `https://ui-avatars.com/api/?name=${post.username}&background=random`
                                    }
                                    alt={post.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${post.username}&background=random`;
                                    }}
                                />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                        @{post.username}
                                    </h3>
                                    <p
                                        className={`text-xs ${
                                            darkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Post Image */}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full rounded-xl mb-3"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            )}

                            {/* Post Content */}
                            <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300">
                                {post.content}
                            </p>

                            {/* Like and Comment Section */}
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1 ${
                                        post.isLiked
                                            ? "text-red-500"
                                            : "text-gray-400"
                                    } dark:text-gray-300`}
                                >
                                    {post.isLiked ? (
                                        <FaHeart className="text-xl animate-pulse" />
                                    ) : (
                                        <FaRegHeart className="text-xl hover:text-red-500" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {post.likes} likes
                                    </span>
                                </button>

                                <div className="relative">
                                    <button
                                        className="flex items-center gap-1 text-gray-400 hover:text-blue-500 dark:text-gray-300"
                                        onClick={() =>
                                            setShowCommentDropdown(
                                                !showCommentDropdown
                                            )
                                        }
                                    >
                                        <FaCommentDots className="text-xl" />
                                        <span className="text-sm font-medium">
                                            {post.comments?.length || 0}{" "}
                                            comments
                                        </span>
                                    </button>
                                    {showCommentDropdown && (
                                        <div
                                            className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
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
                                                                // This would add a comment in a real implementation
                                                                console.log(
                                                                    `Adding reaction: ${reaction.text} to post ${post.id}`
                                                                );
                                                                setShowCommentDropdown(
                                                                    false
                                                                );
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
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Date/Time Display */}
            <div
                className={`mt-6 p-4 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                } text-center mx-auto max-w-2xl`}
            >
                <p className="font-medium dark:text-white">
                    Today: {new Date().toLocaleDateString()}
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
    );
};

export default MainFeed;
