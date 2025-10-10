import { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LikesModal = ({
    postId,
    isOpen,
    onClose,
    token,
    isDarkMode,
    currentUserProfile,
    user,
    username,
}) => {
    const [likes, setLikes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // ✅ CURSOR PAGINATION STATES - Added new states for pagination
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchAllLikes();
        } else {
            // ✅ RESET STATES - Reset when modal closes
            setLikes([]);
            setNextCursor(null);
            setHasMore(true);
        }
    }, [isOpen, postId]);

    const fetchAllLikes = async () => {
        setIsLoading(true);
        setError(null);
        setLikes([]); // ✅ Reset likes on new fetch
        setNextCursor(null);
        setHasMore(true);

        try {
            const responseData = await apiService.fetchPostLikes(postId, token);
            processLikesResponse(responseData);
        } catch (err) {
            console.error("Error fetching all likes:", err);
            setError(err.message || "Failed to fetch likes");
        } finally {
            setIsLoading(false);
        }
    };

    const processLikesResponse = (responseData) => {
        let likesData = [];

        if (responseData.likes && responseData.likes.data) {
            likesData = responseData.likes.data;
        } else if (responseData.userIds) {
            likesData = responseData.userIds;
        } else if (Array.isArray(responseData)) {
            likesData = responseData;
        } else {
            likesData = [];
        }

        const cursor =
            responseData.nextCursor ||
            (responseData.likes && responseData.likes.nextCursor) ||
            null;

        setNextCursor(cursor);
        setHasMore(!!cursor);
        setLikes(likesData);
    };

    const loadMoreLikes = async () => {
        if (!hasMore || isLoadingMore || !nextCursor) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            // ✅ PASS CURSOR TO API - Need to update apiService to accept cursor
            const responseData = await apiService.fetchPostLikes(
                postId,
                token,
                nextCursor
            );
            let newLikesData = [];

            if (responseData.likes && responseData.likes.data) {
                newLikesData = responseData.likes.data;
            } else if (responseData.userIds) {
                newLikesData = responseData.userIds;
            } else if (Array.isArray(responseData)) {
                newLikesData = responseData;
            }

            const cursor =
                responseData.nextCursor ||
                (responseData.likes && responseData.likes.nextCursor) ||
                null;

            setNextCursor(cursor);
            setHasMore(!!cursor);

            // ✅ APPEND NEW LIKES - Add new likes to existing ones
            setLikes((prevLikes) => [...prevLikes, ...newLikesData]);
        } catch (err) {
            console.error("Error loading more likes:", err);
            setError("Failed to load more likes: " + err.message);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // ✅ SCROLL HANDLER - New function to handle scroll for infinite loading
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // ✅ LOAD MORE WHEN NEAR BOTTOM - Trigger when 100px from bottom
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            loadMoreLikes();
        }
    };

    // ✅ ADDED: navigateToUserProfile function to handle user navigation
    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (userId) {
            // Check if this is the current logged-in user's profile
            const isCurrentUser =
                (currentUserProfile && userId === currentUserProfile._id) ||
                (user && userId === user._id) || // Compare with auth user ID
                (username && userId === username); // Compare with username

            if (isCurrentUser) {
                navigate("/profile");
                onClose();
            } else {
                navigate(`/user/${userId}`);
                onClose();
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm md:backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl ${
                            isDarkMode
                                ? "bg-gray-800 text-gray-100 border border-gray-700"
                                : "bg-white text-gray-900 border border-gray-200"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className={`flex justify-between items-center p-6 border-b ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <h3 className="text-xl font-bold">Likes</h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${
                                    isDarkMode
                                        ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                                        : "hover:bg-gray-100 text-gray-500 hover:text-black"
                                }`}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div
                            className="max-h-[calc(80vh-120px)] overflow-y-auto"
                            onScroll={handleScroll} // ✅ ADDED SCROLL HANDLER
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                                    />
                                    <p className="text-lg font-medium">
                                        Loading likes...
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Please wait
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 px-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-red-600 mb-2">
                                        Error loading likes
                                    </p>
                                    <p className="text-gray-500 mb-4">
                                        {error}
                                    </p>
                                    <button
                                        onClick={fetchAllLikes}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : likes.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">
                                        No likes yet
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Be the first to like this post
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4">
                                    {likes.map((user, index) => (
                                        <motion.div
                                            key={user._id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center py-4 px-3 rounded-lg transition-colors hover:bg-opacity-50 cursor-pointer"
                                            onClick={(e) =>
                                                navigateToUserProfile(
                                                    user._id || user.username,
                                                    e
                                                )
                                            } // ✅ ADDED CLICK HANDLER
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 mr-4">
                                                {user.profilePic ? (
                                                    <img
                                                        src={user.profilePic}
                                                        alt={user.username}
                                                        className="w-10 h-10 object-cover rounded-full"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.parentElement.innerHTML = `<span class="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">${
                                                                user.username
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                "U"
                                                            }</span>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="flex items-center justify-center w-full h-full rounded-full text-white font-semibold text-lg">
                                                        {user.username
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            "U"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-base truncate hover:text-blue-500 transition-colors">
                                                    {" "}
                                                    {/* ✅ ADDED HOVER EFFECT */}
                                                    {user.username}
                                                </p>
                                                {user.realname && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {user.realname}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoadingMore && (
                                        <div className="flex justify-center items-center py-4">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                                            />
                                            <span className="ml-2 text-sm text-gray-500">
                                                Loading more...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className={`p-4 border-t ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <p className="text-center text-sm text-gray-500">
                                {likes.length}{" "}
                                {likes.length === 1 ? "like" : "likes"}
                                {hasMore && " • Scroll to load more"}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LikesModal;
