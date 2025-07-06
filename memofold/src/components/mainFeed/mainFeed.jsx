import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaCommentDots,
} from "react-icons/fa";

const MainFeed = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState("--:--:--");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);

    // Sample posts data
    const samplePosts = [
        {
            id: 1,
            username: "travel_enthusiast",
            profilePic: "/assets/profile1.jpg",
            image: "/assets/post1.jpg",
            content: "Beautiful sunset views from my trip to Bali last week! 🌅 #travel",
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
            content: "Homemade pasta with fresh ingredients! 🍝 #foodie",
            likes: 28,
            isLiked: true,
            comments: [],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
    ];

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            setPosts(samplePosts);
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

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => 
            post.id === postId ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            } : post
        ));
    };

    const toggleCommentDropdown = (postId) => {
        setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    };

    const quickReactions = [
        { text: "Congrats", emoji: "🎉" },
        { text: "LOL", emoji: "😂" },
        { text: "Love", emoji: "❤️" },
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
        <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"}`}>
            {/* Top Navigation Bar */}
            <header className={`bg-white shadow-sm px-6 py-4 flex justify-between items-center ${darkMode ? "dark:bg-gray-800" : ""}`}>
                <h1 className="text-xl font-semibold text-gray-900 tracking-wide dark:text-white cursor-pointer">
                    MemoFold
                </h1>

                <nav className="flex gap-5">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer"
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/profile")}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={logout}
                        className="text-gray-600 font-medium hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 cursor-pointer"
                    >
                        Logout
                    </button>
                </nav>
            </header>

            {/* Posts Grid */}
            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {isLoading ? (
                    <div className="text-center py-10 cursor-pointer">
                        <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl cursor-pointer`}>
                        <p className="text-lg">No posts yet. Be the first to share something!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                                darkMode ? "dark:bg-gray-800" : ""
                            } cursor-pointer`}
                        >
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={post.profilePic || `https://ui-avatars.com/api/?name=${post.username}&background=random`}
                                    alt={post.username}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${post.username}&background=random`;
                                    }}
                                />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white cursor-pointer">
                                        @{post.username}
                                    </h3>
                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} cursor-pointer`}>
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Post Image */}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full rounded-xl mb-3 cursor-pointer"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            )}

                            {/* Post Content */}
                            <p className="text-gray-700 leading-relaxed mb-3 dark:text-gray-300 cursor-pointer">
                                {post.content}
                            </p>

                            {/* Like and Comment Section */}
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1 ${
                                        post.isLiked ? "text-red-500" : "text-gray-400"
                                    } dark:text-gray-300 cursor-pointer`}
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
                                        className="flex items-center gap-1 text-gray-400 hover:text-blue-500 dark:text-gray-300 cursor-pointer"
                                        onClick={() => toggleCommentDropdown(post.id)}
                                    >
                                        <FaCommentDots className="text-xl" />
                                        <span className="text-sm font-medium">
                                            {post.comments?.length || 0} comments
                                        </span>
                                    </button>
                                    
                                    {activeCommentPostId === post.id && (
                                        <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 ${darkMode ? "bg-gray-700" : "bg-white"} ring-1 ring-black ring-opacity-5 z-10`}>
                                            <div className="px-4 py-2">
                                                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Add a comment:</p>
                                                <textarea 
                                                    className={`mt-1 w-full p-2 border rounded ${darkMode ? "bg-gray-600 border-gray-500" : "border-gray-300"}`}
                                                    rows="3"
                                                    placeholder="Write your comment..."
                                                />
                                                <button 
                                                    className={`mt-2 px-3 py-1 text-sm rounded ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                                                >
                                                    Post
                                                </button>
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
            <div className={`mt-6 p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"} text-center mx-auto max-w-2xl cursor-pointer`}>
                <p className="font-medium dark:text-white">
                    Today: {new Date().toLocaleDateString()}
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Current Time: {currentTime}
                </p>
            </div>
        </div>
    );
};

export default MainFeed;