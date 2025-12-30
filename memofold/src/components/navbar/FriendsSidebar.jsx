import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSearch, FiMessageSquare, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import config from "../../hooks/config";
import { apiService } from "../../services/api";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const FriendsSidebar = ({
    isOpen,
    onClose,
    darkMode,
    token,
    onUnreadCountUpdate,
}) => {
    // UI State
    const [activeTab, setActiveTab] = useState("friends"); // 'friends' | 'chats'
    const [searchQuery, setSearchQuery] = useState("");

    // Data State
    const [chatList, setChatList] = useState([]);       // ONLY active conversations from Stream
    const [friendsList, setFriendsList] = useState([]); // ONLY friends list from Backend

    // Loading & Pagination State
    const [chatsLoading, setChatsLoading] = useState(true);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false); // Profile pic sync loading
    
    // Pagination Controls
    const [nextCursor, setNextCursor] = useState(null); 
    const [fetchingMoreFriends, setFetchingMoreFriends] = useState(false);
    
    // Prevent duplicate API calls
    const isFetchingRef = useRef(false);
    const hasFetchedFriendsRef = useRef(false);

    // Stream Chat client state
    const [chatClient, setChatClient] = useState(null);
    const [streamToken, setStreamToken] = useState(null);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    const navigate = useNavigate();
    const listRef = useRef();
    const debounceTimerRef = useRef(null);
    const eventListenersAttached = useRef(false);

    // User avatar component
    const UserAvatar = ({ image, name, size = "w-12 h-12", isOnline = false }) => {
        const [imgError, setImgError] = useState(false);
        const initial = name ? name.charAt(0).toUpperCase() : "?";

        return (
            <div className={`relative ${size} flex-shrink-0`}>
                {image && !imgError ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full rounded-full object-cover bg-gray-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 ${size === "w-12 h-12" ? "text-lg" : "text-sm"}`}>
                        {initial}
                    </div>
                )}
                
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
            </div>
        );
    };

    // Lock scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            hasFetchedFriendsRef.current = false; // Reset when sidebar closes
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Reset state on token change (user isolation)
    useEffect(() => {
        setChatList([]);
        setFriendsList([]);
        setNextCursor(null);
        setTotalUnreadCount(0);
        setChatsLoading(true);
        setFriendsLoading(false);
        setChatClient(null);
        eventListenersAttached.current = false;
        isFetchingRef.current = false;
        hasFetchedFriendsRef.current = false;
    }, [token]);

    // Initialize Stream client
    useEffect(() => {
        // Only run when token and STREAM_API_KEY are present
        if (!token || !STREAM_API_KEY) {
            setChatsLoading(false);
            return;
        }

        let cancelled = false;
        const initStream = async () => {
            try {
                // Get user info from localStorage (for Stream)
                const storedUserObj = JSON.parse(localStorage.getItem("user") || "{}");
                
                const userId = localStorage.getItem("userId") || storedUserObj._id;
                const username = localStorage.getItem("username") || storedUserObj.username;
                const realname = localStorage.getItem("realname") || storedUserObj.realname;
                const profilePic = localStorage.getItem("profilePic") || storedUserObj.profilePic;

                // If userId not found, exit
                if (!userId) {
                    console.log("User ID not found yet, waiting...");
                    return;
                }

                const tokenData = await apiService.getStreamToken(token);
                if (!tokenData?.token) return;

                const client = StreamChat.getInstance(STREAM_API_KEY);

                // Disconnect previous user if not current
                if (client.userID && client.userID !== userId) {
                    await client.disconnectUser();
                }

                if (!client.userID) {
                    await client.connectUser(
                        {
                            id: userId,
                            name: realname || username,
                            image: profilePic,
                        },
                        tokenData.token
                    );
                }

                if (!cancelled) {
                    setChatClient(client);
                    setStreamToken(tokenData.token);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Stream init failed:", err);
                    setChatsLoading(false);
                }
            }
        };

        const timer = setTimeout(initStream, 100); // Slight delay for safety
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [token]);

    // Chats tab logic (real-time)
    useEffect(() => {
        if (!chatClient || !chatClient.userID) return;

        const fetchActiveChats = async () => {
            setSyncLoading(true);
            try {
                // Sync all profile pics to Stream whenever channels are fetched
                await apiService.syncAllProfilePics(token).catch(() => {});
                setSyncLoading(false);

                const filter = { type: "messaging", members: { $in: [chatClient.userID] } };
                const sort = { last_message_at: -1 };

                const channels = await chatClient.queryChannels(filter, sort, {
                    watch: true, // Real-time connection
                    state: true,
                    limit: 30,
                });

                processChats(channels);
            } catch (error) {
                setSyncLoading(false);
                console.error("Error fetching chats:", error);
            } finally {
                setChatsLoading(false);
            }
        };

        const processChats = (channels) => {
            if (!channels) return;
            const currentUserId = chatClient.userID;
            let unread = 0;

            const processed = channels.map((channel) => {
                const count = channel.countUnread();
                unread += count;

                const otherMember = Object.values(channel.state.members).find(
                    (m) => m.user.id !== currentUserId
                );

                const lastMsg = channel.state.messages[channel.state.messages.length - 1];
                if (!lastMsg) return null;

                const cleanText = lastMsg.text
                    ?.replace(/\*\*/g, "")
                    ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
                    ?.replace(/https?:\/\/\S+/g, "Link")
                    ?.trim();

                return {
                    channelId: channel.id,
                    targetUserId: otherMember?.user?.id,
                    displayName: otherMember?.user?.name || otherMember?.user?.id || "Unknown",
                    avatar: otherMember?.user?.image,
                    isOnline: otherMember?.user?.online || false,
                    lastMessage: cleanText || "Attachment",
                    lastMessageTime: lastMsg.created_at,
                    unreadCount: count,
                };
            }).filter(Boolean);

            setChatList(processed);
            setTotalUnreadCount(unread);
            onUnreadCountUpdate?.(unread);
        };

        const handleEvent = () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(fetchActiveChats, 500);
        };

        // Attach event listeners
        if (!eventListenersAttached.current) {
            chatClient.on("message.new", handleEvent);
            chatClient.on("notification.message_new", handleEvent);
            chatClient.on("message.read", handleEvent);
            chatClient.on("user.presence.changed", handleEvent); // Added: Online status updates ke liye
            eventListenersAttached.current = true;
        }

        fetchActiveChats();

        // Cleanup: remove listeners on user change or unmount
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            
            // Remove listeners to prevent data leak or errors
            if (chatClient) {
                chatClient.off("message.new", handleEvent);
                chatClient.off("notification.message_new", handleEvent);
                chatClient.off("message.read", handleEvent);
                chatClient.off("user.presence.changed", handleEvent);
                eventListenersAttached.current = false;
            }
        };
    }, [chatClient]);

    // Friends tab logic
    useEffect(() => {
        if (isOpen && activeTab === "friends" && token && !hasFetchedFriendsRef.current) {
            hasFetchedFriendsRef.current = true;
            fetchFriendsBackend(null, true);
        }
    }, [isOpen, activeTab, token]);

    const fetchFriendsBackend = async (cursor = null, isFresh = false) => {
        if (!token) return;
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;

            if (isFresh) setFriendsLoading(true);
            else setFetchingMoreFriends(true);

            const url = new URL(`${config.apiUrl}/friends/friends-list`);
            if (cursor) url.searchParams.append("cursor", cursor);

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setFriendsList((prev) => {
                    const newFriends = data.friends || [];
                    if (isFresh) return newFriends;
                    
                    const existingIds = new Set(prev.map(f => f.id));
                    const uniqueNew = newFriends.filter(f => !existingIds.has(f.id));
                    return [...prev, ...uniqueNew];
                });
                
                setNextCursor(data.nextCursor || null);
            }
        } catch (error) {
            console.error("Backend friends fetch error:", error);
        } finally {
            isFetchingRef.current = false;
            setFriendsLoading(false);
            setFetchingMoreFriends(false);
        }
    };

    const handleScroll = () => {
        if (activeTab !== "friends" || !nextCursor || isFetchingRef.current) return;

        const container = listRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight <= clientHeight) return;

            if (scrollTop + clientHeight >= scrollHeight - 20) {
                fetchFriendsBackend(nextCursor);
            }
        }
    };

    // Helper functions
    const handleStartChat = (targetId) => {
        if (!targetId || !streamToken) return;
        navigate(`/chat/${targetId}`);
        onClose();
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDisplayList = () => {
        const list = activeTab === "chats" ? chatList : friendsList;
        return list.filter(item => {
            const name = activeTab === "chats" ? item.displayName : (item.realname || item.username);
            return name?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    };

    const displayList = getDisplayList();
    const isLoading = activeTab === "chats" ? (chatsLoading || syncLoading) : friendsLoading;

    // Render
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            )}

            <div className={`fixed top-0 right-0 h-full w-80 md:w-96 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                
                {/* Header */}
                <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                            Messaging
                        </h2>
                        <button onClick={onClose} className={`p-2 rounded-full cursor-pointer ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <FiSearch className={darkMode ? "text-gray-400" : "text-gray-500"} />
                        <input
                            type="text"
                            placeholder={activeTab === 'chats' ? "Search chats..." : "Search friends..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent outline-none ${darkMode ? "text-white" : "text-gray-800"}`}
                        />
                    </div>

                    <div className="flex mt-4 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("friends")}
                            className={`flex-1 flex cursor-pointer items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === "friends"
                                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-cyan-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            <FiUsers /> Friends
                        </button>
                        <button
                            onClick={() => setActiveTab("chats")}
                            className={`flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === "chats"
                                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-cyan-400"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            <FiMessageSquare /> Chats
                            {totalUnreadCount > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {totalUnreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div 
                    ref={listRef} 
                    onScroll={handleScroll}
                    className="overflow-y-auto h-[calc(100%-180px)] px-2 py-2"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center py-10">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? "border-cyan-400" : "border-blue-600"}`} />
                            {syncLoading && (
                                <span className={`mt-2 text-xs ${darkMode ? "text-cyan-400" : "text-blue-600"}`}>Loading Chats...</span>
                            )}
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className={`text-center py-10 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {activeTab === 'chats' ? "No conversations yet." : "No friends found."}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {displayList.map((item) => {
                                // --- CHATS RENDER ---
                                if (activeTab === "chats") {
                                    return (
                                        <div
                                            key={item.channelId}
                                            onClick={() => handleStartChat(item.targetUserId)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                            } ${item.unreadCount > 0 ? (darkMode ? "bg-gray-700/50" : "bg-blue-50") : ""}`}
                                        >
                                            <UserAvatar 
                                                image={item.avatar} 
                                                name={item.displayName} 
                                                isOnline={item.isOnline} 
                                            />
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <h4 className={`font-semibold truncate ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                        {item.displayName}
                                                    </h4>
                                                    <span className={`text-xs ${item.unreadCount > 0 ? "text-blue-500 font-bold" : "text-gray-400"}`}>
                                                        {formatTime(item.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate w-4/5 ${item.unreadCount > 0 ? (darkMode ? "text-gray-200 font-medium" : "text-gray-800 font-medium") : "text-gray-500"}`}>
                                                        {item.lastMessage}
                                                    </p>
                                                    {item.unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                            {item.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } 
                                
                                // --- FRIENDS RENDER ---
                                else {
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleStartChat(item.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <UserAvatar 
                                                image={item.profilePic} 
                                                name={item.realname || item.username} 
                                            />

                                            <div className="flex-1">
                                                <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                    {item.realname || item.username}
                                                </h4>
                                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    @{item.username}
                                                </p>
                                            </div>
                                            
                                            <button 
                                                className={`p-2 rounded-full transition-colors cursor-pointer ${
                                                    darkMode ? "bg-gray-600 text-cyan-400" : "bg-blue-100 text-blue-600"
                                                }`}
                                            >
                                                <FiMessageSquare size={18} />
                                            </button>
                                        </div>
                                    );
                                }
                            })}

                            {/* Pagination Loading */}
                            {activeTab === "friends" && fetchingMoreFriends && (
                                <div className="py-2 flex justify-center">
                                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${darkMode ? "border-cyan-400" : "border-blue-600"}`} />
                                </div>
                            )}

                            {/* End of List Message */}
                            {activeTab === "friends" && !fetchingMoreFriends && !nextCursor && displayList.length > 0 && (
                                <div className={`text-center py-4 text-xs italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    No more friends
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FriendsSidebar;
