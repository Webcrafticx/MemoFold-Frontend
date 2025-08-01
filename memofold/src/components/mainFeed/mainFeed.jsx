import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import config from "../../hooks/config";

const MainFeed = () => {
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState("--:--:--");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [openCommentPostId, setOpenCommentPostId] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
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
            
            // Handle case where response is not an array
            const postsData = Array.isArray(data) ? data : data.posts || [];
            
            const postsWithLikes = postsData.map((post) => ({
                ...post,
                isLiked: post.likes?.some((like) => like.userId === user?.id) || false,
                createdAt: post.createdAt || new Date().toISOString() // Fallback for createdAt
            }));
            
            setPosts(postsWithLikes);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts([]); // Ensure posts is always an array
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleLike = async (postId) => {
        if (!user) {
            console.error("User not available");
            return;
        }

        try {
            setPosts(
                posts.map((post) => {
                    if (post.id === postId) {
                        const isLiked = post.likes?.some(
                            (like) => like.userId === user.id
                        ) || false;
                        return {
                            ...post,
                            isLiked: !isLiked,
                            likes: isLiked
                                ? post.likes?.filter(
                                      (like) => like.userId !== user.id
                                  ) || []
                                : [...(post.likes || []), { userId: user.id }],
                        };
                    }
                    return post;
                })
            );

            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/like`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update like status");
            }
        } catch (err) {
            console.error("Error liking post:", err);
            fetchPosts();
        }
    };

    const toggleCommentDropdown = (postId) => {
        setOpenCommentPostId((prevId) => (prevId === postId ? null : postId));
        setCommentTexts((prev) => ({
            ...prev,
            [postId]: prev[postId] || "",
        }));
    };

    const handleCommentSubmit = async (postId) => {
        const text = commentTexts[postId] || "";
        if (!text.trim() || !user) return;

        try {
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: text }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to post comment");
            }

            const updatedPost = await response.json();
            setPosts(
                posts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: updatedPost.comments || [],
                          }
                        : post
                )
            );

            setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
            setOpenCommentPostId(null);
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const handleCommentTextChange = (postId, text) => {
        setCommentTexts((prev) => ({ ...prev, [postId]: text }));
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Just now";
            }
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return "Just now";
        }
    };

    return (
        <div
            className={`min-h-screen ${
                darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6]"
            }`}
        >
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
                            key={post.id}
                            className={`w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${
                                darkMode ? "dark:bg-gray-800" : ""
                            }`}
                        >
<div
  className="flex items-center gap-3 mb-3 cursor-pointer"
  onClick={() => navigate(`/profile/${post.userId._id}`)}
>
  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
    {post.userId.profilePic ? (
      <img
        src={post.userId.profilePic}
        alt={post.userId.username}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = 
            `<span class="text-lg font-semibold text-gray-700">
              ${post.userId.username?.charAt(0).toUpperCase() || 'U'}
            </span>`;
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
                                    onClick={() =>
                                        window.open(post.image, "_blank")
                                    }
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
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1 ${
                                        post.isLiked
                                            ? "text-red-500"
                                            : "text-gray-400"
                                    } dark:text-gray-300 hover:text-red-500 transition-colors cursor-pointer`}
                                >
                                    {post.isLiked ? (
                                        <FaHeart className="text-xl animate-pulse" />
                                    ) : (
                                        <FaRegHeart className="text-xl" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {post.likes?.length || 0} likes
                                    </span>
                                </button>

                                <div className="relative">
                                    <button
                                        className="flex items-center gap-1 text-gray-400 hover:text-blue-500 dark:text-gray-300 transition-colors cursor-pointer"
                                        onClick={() =>
                                            toggleCommentDropdown(post.id)
                                        }
                                    >
                                        <FaCommentDots className="text-xl" />
                                        <span className="text-sm font-medium">
                                            {post.comments?.length || 0}{" "}
                                            comments
                                        </span>
                                    </button>

                                    {openCommentPostId === post.id && (
                                        <div
                                            className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 ${
                                                darkMode
                                                    ? "bg-gray-700"
                                                    : "bg-white"
                                            } ring-1 ring-black ring-opacity-5 z-10`}
                                        >
                                            <div className="px-4 py-2">
                                                {post.comments?.length > 0 ? (
                                                    <div className="mb-3 max-h-40 overflow-y-auto">
                                                        {post.comments.map(
                                                            (
                                                                comment,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="mb-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/profile/${comment.userId}`
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="font-semibold hover:text-blue-500">
                                                                        {
                                                                            comment.username ||
                                                                            "Unknown"
                                                                        }
                                                                        :
                                                                    </span>{" "}
                                                                    {
                                                                        comment.content ||
                                                                        ""
                                                                    }
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p
                                                        className={`text-sm mb-3 ${
                                                            darkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        No comments yet
                                                    </p>
                                                )}

                                                <p
                                                    className={`text-sm ${
                                                        darkMode
                                                            ? "text-gray-300"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    Add a comment:
                                                </p>
                                                <textarea
                                                    className={`mt-1 w-full p-2 border rounded ${
                                                        darkMode
                                                            ? "bg-gray-600 border-gray-500"
                                                            : "border-gray-300"
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                    rows="3"
                                                    placeholder="Write your comment..."
                                                    value={
                                                        commentTexts[post.id] ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleCommentTextChange(
                                                            post.id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <button
                                                    className={`mt-2 px-3 py-1 text-sm rounded ${
                                                        darkMode
                                                            ? "bg-blue-600 hover:bg-blue-700"
                                                            : "bg-blue-500 hover:bg-blue-600"
                                                    } text-white transition-colors cursor-pointer`}
                                                    onClick={() =>
                                                        handleCommentSubmit(
                                                            post.id
                                                        )
                                                    }
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
        </div>
    );
};

export default MainFeed;