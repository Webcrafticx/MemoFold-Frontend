import React, { useState, useEffect } from "react";
import { FaTimes, FaCopy, FaCheck } from "react-icons/fa";
import { apiService } from "../../services/api";

const ShareModal = ({ isOpen, onClose, postId, token, isDarkMode }) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchShareLink();
            fetchFriends();
        } else {
            setFriends([]);
            setSelectedFriends([]);
            setShareLink("");
            setCopied(false);
        }
    }, [isOpen, token, postId]);

    const fetchShareLink = async () => {
        try {
            const data = await apiService.getShareLink(postId, token);
            if (data.success && data.shareToken) {
                setShareLink(`${window.location.origin}/shared/${data.shareToken}`);
            }
        } catch (error) {
            console.error("Error fetching share link:", error);
        }
    };

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const data = await apiService.fetchFriendsList(token);
            if (data.success) {
                setFriends(data.friends || []);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const toggleFriend = (friendId) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleShare = async () => {
        if (selectedFriends.length === 0 || !shareLink) return;
        setSharing(true);
        try {
            const data = await apiService.sharePostToDMs(selectedFriends, shareLink, token);
            if (data.success) {
                alert("Post shared successfully!");
                onClose();
            } else {
                alert("Failed to share post.");
            }
        } catch (error) {
            console.error("Error sharing post:", error);
            alert("Error sharing post.");
        } finally {
            setSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div
                className={`w-full max-w-md rounded-2xl p-5 shadow-2xl relative ${
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                >
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4">Share Post</h2>

                {shareLink && (
                    <div className="mb-6 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 bg-transparent outline-none text-sm px-2 text-gray-700 dark:text-gray-200 cursor-pointer"
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            {copied ? <FaCheck /> : <FaCopy />}
                        </button>
                    </div>
                )}

                <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">
                    Send to DM
                </h3>
                <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {loading ? (
                        <div className="p-4 text-center">Loading friends...</div>
                    ) : friends.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No friends found to share with.
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend._id}
                                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                                    selectedFriends.includes(friend._id) ? "bg-blue-50 dark:bg-gray-700/50" : ""
                                }`}
                                onClick={() => toggleFriend(friend._id)}
                            >
                                <img
                                    src={
                                        friend.profilePic ||
                                        "https://ui-avatars.com/api/?name=U&background=random"
                                    }
                                    alt={friend.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">
                                        {friend.realname || friend.username}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        @{friend.username}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.includes(friend._id)}
                                        readOnly
                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={selectedFriends.length === 0 || sharing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                            selectedFriends.length === 0 || sharing
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        }`}
                    >
                        {sharing ? "Sending..." : `Send to ${selectedFriends.length} friends`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

