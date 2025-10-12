import React, { useState, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import config from "../../hooks/config";
import { apiService } from "../../services/api";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const FriendsSidebar = ({ isOpen, onClose, darkMode, token, onUnreadCountUpdate }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [friendsWithUnread, setFriendsWithUnread] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const navigate = useNavigate();

  // ✅ Initialize Stream Chat Client
  useEffect(() => {
    const initStreamClient = async () => {
      if (!token || !isOpen) return;

      try {
        const tokenData = await apiService.getStreamToken(token);
        const authUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (tokenData?.token && authUser._id) {
          const client = StreamChat.getInstance(STREAM_API_KEY);

          if (!client.userID) {
            await client.connectUser(
              {
                id: authUser._id,
                name: authUser.realname || authUser.username,
                image: authUser.profilePic,
              },
              tokenData.token
            );
          }

          setChatClient(client);
        }
      } catch (error) {
        console.error("Error initializing Stream client:", error);
      }
    };

    initStreamClient();

    return () => {
      if (chatClient && isOpen === false) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [token, isOpen]);

  // ✅ Fetch Friends List
  useEffect(() => {
    if (isOpen && token) {
      fetchFriends();
    }
  }, [isOpen, token]);

  // ✅ Fetch Unread Messages Count & Presence
  useEffect(() => {
    if (chatClient && friends.length > 0) {
      fetchUnreadMessages();

      // Poll every 5 seconds for updates
      const interval = setInterval(fetchUnreadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatClient, friends]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/friends/friends-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const fetchUnreadMessages = async () => {
    if (!chatClient) return;

    try {
      const authUserId = chatClient.userID;
      const unreadData = {};
      let totalUnread = 0;

      for (const friend of friends) {
        const channelId = [authUserId, friend._id].sort().join("-");
        try {
          const channel = chatClient.channel("messaging", channelId);
          const state = await channel.watch();

          const unreadCount = channel.countUnread();
          const lastMessage = state.messages[state.messages.length - 1];

          // ✅ Clean the message text to remove URLs / Markdown
          const cleanText = lastMessage?.text
            ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
            ?.replace(/https?:\/\/\S+/g, "")
            ?.trim() || "";

          // ✅ Check presence (online/offline)
          const friendUser = chatClient.state?.users?.[friend._id];
          const isOnline = friendUser?.online ?? false;

          unreadData[friend._id] = {
            count: unreadCount,
            lastMessage: cleanText,
            lastMessageTime: lastMessage?.created_at || null,
            isFromFriend: lastMessage?.user?.id === friend._id,
            online: isOnline,
          };

          totalUnread += unreadCount;
        } catch (err) {
          console.error(`Error fetching channel ${channelId}:`, err);
        }
      }

      setFriendsWithUnread(unreadData);
      setTotalUnreadCount(totalUnread);

      if (onUnreadCountUpdate) {
        onUnreadCountUpdate(totalUnread);
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // ✅ Sort friends: by last message time + unread
  const sortedFriends = [...friends].sort((a, b) => {
    const aData = friendsWithUnread[a._id];
    const bData = friendsWithUnread[b._id];

    const aTime = aData?.lastMessageTime ? new Date(aData.lastMessageTime).getTime() : 0;
    const bTime = bData?.lastMessageTime ? new Date(bData.lastMessageTime).getTime() : 0;

    if (aTime !== bTime) return bTime - aTime;
    if (aData?.count > 0 && bData?.count === 0) return -1;
    if (bData?.count > 0 && aData?.count === 0) return 1;
    return 0;
  });

  const filteredFriends = sortedFriends.filter(
    (friend) =>
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.realname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChat = async (friendId, username) => {
    try {
      setChatLoading(friendId);
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

  const truncateMessage = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const UserAvatar = ({ profilePic, username, online }) => {
  const firstLetter = username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative w-12 h-12">
      {/* Avatar Circle */}
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
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
        ) : (
          <span className="flex items-center justify-center w-full h-full text-white font-semibold text-lg">
            {firstLetter}
          </span>
        )}
      </div>

      {/* ✅ Always-visible Online Indicator */}
      {online && (
        <>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white animate-ping"></span>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></span>
        </>
      )}
    </div>
  );
};


  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-40 transition-opacity cursor-pointer"
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
          <div className="flex items-center gap-2">
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Messages
            </h2>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
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
                  darkMode ? "border-cyan-400" : "border-blue-600"
                }`}
              />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div
              className={`text-center py-8 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {searchQuery ? "No friends found" : "No friends yet"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => {
                const unreadData = friendsWithUnread[friend._id];
                const hasUnread = unreadData?.count > 0;
                const lastMessage = unreadData?.lastMessage;
                const lastTime = unreadData?.lastMessageTime;
                const online = unreadData?.online;

                return (
                  <div
                    key={friend._id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      hasUnread
                        ? darkMode
                          ? "bg-gray-700 border-l-4 border-cyan-400"
                          : "bg-blue-50 border-l-4 border-blue-500"
                        : darkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handleChat(friend._id, friend.username)
                    }
                  >
                    {/* Avatar + Online Indicator */}
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        profilePic={friend.profilePic}
                        username={friend.username}
                        online={online}
                      />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unreadData.count > 9 ? "9+" : unreadData.count}
                        </span>
                      )}
                    </div>

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            hasUnread ? "font-bold" : ""
                          } ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          {friend.realname || friend.username}
                        </h3>
                        {lastTime && (
                          <span
                            className={`text-xs ml-2 flex-shrink-0 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formatTime(lastTime)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate ${
                          hasUnread
                            ? darkMode
                              ? "text-cyan-300 font-medium"
                              : "text-blue-600 font-medium"
                            : darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {lastMessage ? truncateMessage(lastMessage) : "Click to start chatting"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendsSidebar;
