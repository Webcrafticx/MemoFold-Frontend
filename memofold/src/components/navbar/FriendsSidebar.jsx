import React, { useState, useEffect } from "react";
import { FiMessageCircle, FiPhone, FiX, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import config from "../../hooks/config";
import { apiService } from "../../services/api";

const FriendsSidebar = ({ isOpen, onClose, darkMode, token }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [chatLoading, setChatLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && token) {
            fetchFriends();
        }
    }, [isOpen, token]);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${config.apiUrl}/friends/friends-list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setFriends(result.friends || []);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFriends = friends.filter(
        (friend) =>
            friend.username
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            friend.realname?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChat = async (friendId, username) => {
        try {
            setChatLoading(friendId);
            console.log("Starting chat with:", friendId, username);

            const tokenData = await apiService.getStreamToken(token);

            if (tokenData && tokenData.token) {
                navigate(`/chat/${friendId}`);
                onClose();
            } else {
                console.error("Failed to get stream token");
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setChatLoading(null);
        }
    };

    const handleCall = (friendId, username) => {
        console.log("Call:", friendId, username);
    };

    const UserAvatar = ({ profilePic, username }) => {
        return (
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                {profilePic ? (
                    <img
                        src={profilePic}
                        alt={username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                        }}
                    />
                ) : null}
                <span
                    className="flex items-center justify-center w-full h-full text-white font-semibold text-lg"
                    style={profilePic ? { display: "none" } : {}}
                >
                    {username?.charAt(0).toUpperCase() || "U"}
                </span>
            </div>
        );
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0  bg-opacity-50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 md:w-96 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                } shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                >
                    <h2
                        className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        Friends
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${
                            darkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                        <FiSearch
                            className={`w-5 h-5 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent outline-none ${
                                darkMode
                                    ? "text-white placeholder-gray-400"
                                    : "text-gray-800 placeholder-gray-500"
                            }`}
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="overflow-y-auto h-[calc(100%-140px)] px-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div
                                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                                    darkMode
                                        ? "border-cyan-400"
                                        : "border-blue-600"
                                }`}
                            />
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div
                            className={`text-center py-8 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            {searchQuery
                                ? "No friends found"
                                : "No friends yet"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredFriends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        darkMode
                                            ? "hover:bg-gray-700"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() =>
                                                handleChat(
                                                    friend._id,
                                                    friend.username
                                                )
                                            }
                                >
                                    {/* Avatar */}
                                    <UserAvatar
                                        profilePic={friend.profilePic}
                                        username={friend.username}
                                    />

                                    {/* Friend Info */}
                                    <div className="flex-1 min-w-0 cursor-pointer">
                                        <h3
                                            className={`font-semibold truncate ${
                                                darkMode
                                                    ? "text-white"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            {friend.realname || friend.username}
                                        </h3>
                                        <p
                                            className={`text-sm truncate ${
                                                darkMode
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Click to chat
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {/* <div className="flex gap-2">
                                        <button
                                            
                                            disabled={
                                                chatLoading === friend._id
                                            }
                                            className={`p-2 rounded-full transition-colors ${
                                                darkMode
                                                    ? "hover:bg-cyan-600 text-cyan-400"
                                                    : "hover:bg-blue-100 text-blue-600"
                                            } ${
                                                chatLoading === friend._id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            title="Chat"
                                        >
                                            {chatLoading === friend._id ? (
                                                <div
                                                    className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
                                                        darkMode
                                                            ? "border-cyan-400"
                                                            : "border-blue-600"
                                                    }`}
                                                />
                                            ) : (
                                                <FiMessageCircle className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleCall(
                                                    friend._id,
                                                    friend.username
                                                )
                                            }
                                            className={`p-2 rounded-full transition-colors ${
                                                darkMode
                                                    ? "hover:bg-green-600 text-green-400"
                                                    : "hover:bg-green-100 text-green-600"
                                            }`}
                                            title="Call"
                                        >
                                            <FiPhone className="w-5 h-5" />
                                        </button>
                                    </div> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FriendsSidebar;
