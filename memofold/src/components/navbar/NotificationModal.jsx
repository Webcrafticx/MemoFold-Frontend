import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import config from "../../hooks/config";
import {
    FaTimes,
    FaHeart,
    FaUserPlus,
    FaComment,
    FaShare,
    FaUserCheck,
    FaUserTimes,
    FaCheck,
    FaTrash,
    FaBell,
    FaCircle,
    FaSpinner,
    FaClock,
    FaImage,
} from "react-icons/fa";

const NotificationModal = ({
    showModal,
    onClose,
    darkMode,
    unreadNotifications,
}) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [processingRequest, setProcessingRequest] = useState(null);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const { token, username } = useAuth();
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const contentRef = useRef(null);
    const memoryModalRef = useRef(null);

    useEffect(() => {
        if (showModal) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";

            return () => {
                const scrollY = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.overflow = "";
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            };
        }
    }, [showModal]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                if (selectedMemory) {
                    setSelectedMemory(null);
                } else {
                    onClose();
                }
            }
        };

        if (showModal) {
            document.addEventListener("keydown", handleEscapeKey);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [showModal, onClose, selectedMemory]);

    // ================== 🔥 FIXED OUTSIDE CLICK (MAIN MODAL) ==================
    useEffect(() => {
        const handleClickOutside = (event) => {
            // ✅ If memory modal open → ignore main modal close
            if (selectedMemory) return;
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showModal, onClose, selectedMemory]);

    // ================== 🔥 FIXED MEMORY OUTSIDE CLICK ==================
    useEffect(() => {
        const handleMemoryClickOutside = (event) => {
            // ✅ Ignore clicks inside memory modal
            if (memoryModalRef.current?.contains(event.target)) return;
            // ✅ Close only memory modal
            setSelectedMemory(null);
        };
        document.addEventListener("mousedown", handleMemoryClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleMemoryClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showModal && token) {
            fetchNotifications(true);
        }
    }, [showModal, token]);

    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement || !hasMore || isLoading) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = contentElement;
            if (scrollHeight - scrollTop <= clientHeight + 100) {
                fetchNotifications(false);
            }
        };

        contentElement.addEventListener("scroll", handleScroll);
        return () => contentElement.removeEventListener("scroll", handleScroll);
    }, [hasMore, isLoading, cursor]);

    const fetchNotifications = async (reset = false) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", "15");

            if (!reset && cursor) {
                params.append("cursor", cursor);
            }

            const response = await fetch(
                `${config.apiUrl}/notifications?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.ok) {
                const result = await response.json();
                const notificationsData = result.notifications || [];
                const nextCursor = result.nextCursor || null;

                if (reset) {
                    setNotifications(notificationsData);
                } else {
                    setNotifications((prev) => [...prev, ...notificationsData]);
                }

                setCursor(nextCursor);
                setHasMore(!!nextCursor);

                const unread = reset
                    ? notificationsData.filter((notif) => !notif.read).length
                    : unreadCount +
                      notificationsData.filter((notif) => !notif.read).length;
                setUnreadCount(unread);
            } else {
                if (reset) {
                    setNotifications([]);
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            if (reset) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationIds) => {
        try {
            const ids = Array.isArray(notificationIds)
                ? notificationIds
                : [notificationIds];

            const endpointId = ids.length === 1 ? ids[0] : "bulk";

            const response = await fetch(
                `${config.apiUrl}/notifications/notification/read/${endpointId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ notificationIds: ids }),
                },
            );

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        ids.includes(notif._id)
                            ? { ...notif, read: true }
                            : notif,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - ids.length));
            } else {
                console.error("Failed to mark notifications as read");
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(
                (notif) => !notif.read,
            );

            if (unreadNotifications.length === 0) return;

            const unreadNotificationIds = unreadNotifications.map(
                (notif) => notif._id,
            );

            await markAsRead(unreadNotificationIds);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleFriendRequest = async (notificationId, action) => {
        try {
            setProcessingRequest({ notificationId, action });

            const notification = notifications.find(
                (notif) => notif._id === notificationId,
            );

            if (!notification) {
                return;
            }

            const senderUserId = notification.sender?._id;

            if (!senderUserId) {
                return;
            }

            const response = await fetch(
                `${config.apiUrl}/friends/friend-request/${senderUserId}/respond`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ action }),
                },
            );

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === notificationId
                            ? { ...notif, isHandled: true, status: action }
                            : notif,
                    ),
                );
            }
        } catch (error) {
        } finally {
            setProcessingRequest(null);
        }
    };

    const isButtonLoading = (notificationId, action) => {
        return (
            processingRequest &&
            processingRequest.notificationId === notificationId &&
            processingRequest.action === action
        );
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Handle memory notification type
        if (notification.type === "memory") {
            setSelectedMemory(notification);
            return;
        }

        switch (notification.type) {
            case "like":
            case "comment":
            case "comment_like":
            case "share":
                if (notification.postid && notification.postid._id) {
                    navigate(`/post/${notification.postid._id}`);
                    onClose();
                } else if (notification.postId) {
                    navigate(`/post/${notification.postId}`);
                    onClose();
                } else {
                    if (notification.sender?._id) {
                        navigate(`/user/${notification.sender._id}`);
                        onClose();
                    }
                }
                break;

            case "friend_request":
            case "friend_accept":
                if (notification.sender?._id) {
                    navigate(`/user/${notification.sender._id}`);
                    onClose();
                }
                break;

            default:
                if (notification.sender?._id) {
                    navigate(`/user/${notification.sender._id}`);
                    onClose();
                }
                break;
        }
    };

    const getNotificationIcon = (type) => {
        const iconProps = { className: "text-lg flex-shrink-0 cursor-pointer" };

        switch (type) {
            case "comment_like":
            case "like":
                return <FaHeart {...iconProps} style={{ color: "#ef4444" }} />;
            case "comment":
                return (
                    <FaComment {...iconProps} style={{ color: "#3b82f6" }} />
                );
            case "friend_request":
                return (
                    <FaUserPlus {...iconProps} style={{ color: "#10b981" }} />
                );
            case "friend_accept":
                return (
                    <FaUserCheck {...iconProps} style={{ color: "#059669" }} />
                );
            case "share":
                return <FaShare {...iconProps} style={{ color: "#8b5cf6" }} />;
            case "memory":
                return <FaClock {...iconProps} style={{ color: "#f59e0b" }} />;
            default:
                return <FaBell {...iconProps} style={{ color: "#6b7280" }} />;
        }
    };

    const getNotificationMessage = (notification) => {
        // For memory notifications, use metadata
        if (notification.type === "memory") {
            const yearsAgo = notification.metadata?.yearsAgo || 1;
            const postContent =
                notification.metadata?.post?.content ||
                notification.postid?.content ||
                "";

            return (
                <>
                    <span className="font-semibold text-amber-500">
                        🎉 On This Day
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {" "}
                        {yearsAgo} year{yearsAgo > 1 ? "s" : ""} ago today
                    </span>
                    {postContent && (
                        <span className="block text-sm mt-1 italic text-gray-500 dark:text-gray-400">
                            "
                            {postContent.length > 50
                                ? postContent.substring(0, 50) + "..."
                                : postContent}
                            "
                        </span>
                    )}
                </>
            );
        }

        const senderName =
            notification.metadata?.realname ||
            notification.sender?.realname ||
            notification.metadata?.username ||
            notification.sender?.username ||
            "Someone";

        const commentContent = notification.metadata?.content;

        switch (notification.type) {
            case "comment_like":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        liked your comment
                        {commentContent && (
                            <span className="italic text-gray-600 dark:text-gray-400">
                                : "
                                {commentContent.length > 30
                                    ? commentContent.substring(0, 30) + "..."
                                    : commentContent}
                                "
                            </span>
                        )}
                    </>
                );
            case "comment":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        commented on your post
                        {commentContent && (
                            <span className="italic text-gray-600 dark:text-gray-400">
                                : "
                                {commentContent.length > 30
                                    ? commentContent.substring(0, 30) + "..."
                                    : commentContent}
                                "
                            </span>
                        )}
                    </>
                );
            case "friend_request":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        sent you a friend request
                    </>
                );
            case "friend_accept":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        accepted your friend request
                    </>
                );
            case "share":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        shared your post
                    </>
                );
            case "like":
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        liked your post
                    </>
                );
            default:
                return (
                    <>
                        <span
                            className="font-semibold hover:underline cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (notification.sender?._id) {
                                    navigate(
                                        `/user/${notification.sender._id}`,
                                    );
                                    onClose();
                                }
                            }}
                        >
                            {senderName}
                        </span>{" "}
                        sent you a notification
                    </>
                );
        }
    };

    const formatNotificationTime = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const hasPostData = (notification) => {
        return notification.postid && notification.postid._id;
    };

    const getProfilePic = (notification) => {
        return (
            notification.metadata?.profilePic || notification.sender?.profilePic
        );
    };

    const getUsernameForAvatar = (notification) => {
        return (
            notification.metadata?.username ||
            notification.sender?.username ||
            "U"
        );
    };

    // Handle memory post click
    const handleMemoryPostClick = (e) => {
        e.stopPropagation();
        if (selectedMemory?.postid?._id) {
            navigate(`/post/${selectedMemory.postid._id}`);
            setSelectedMemory(null);
            onClose();
        }
    };

    // ================== 🔥 FIXED VIEW MORE BUTTON ==================
    const handleViewMoreMemories = (e) => {
        e?.stopPropagation();
        const path = selectedMemory?.sender?._id
            ? `/user/${selectedMemory.sender._id}`
            : "/profile";
        // ✅ Direct navigation (no delay, no race)
        navigate(path);
        // ✅ Close after navigation
        setSelectedMemory(null);
        onClose();
    };

    // Get memory post from either postid or metadata
    const getMemoryPost = (memory) => {
        return memory.postid || memory.metadata?.post || null;
    };

    // Format the memory date
    const formatMemoryDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Unknown date";
        }
    };

    if (!showModal) return null;

    return (
        <>
            {/* Main Notification Modal */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-4 px-2 sm:pt-20 sm:px-4 backdrop-blur-sm cursor-default">
                <div
                    ref={modalRef}
                    className={`w-full max-w-2xl rounded-xl shadow-2xl ${
                        darkMode
                            ? "bg-gray-800 text-white border border-gray-700"
                            : "bg-white text-gray-800 border border-gray-200"
                    } max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 cursor-default`}
                    style={{
                        minHeight: "300px",
                        height: "auto",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-inherit cursor-default">
                        <div className="flex items-center space-x-3 cursor-default">
                            <div className="flex items-center space-x-2 cursor-default">
                                <FaBell
                                    className={`text-lg cursor-pointer ${
                                        darkMode
                                            ? "text-cyan-400"
                                            : "text-blue-600"
                                    }`}
                                />
                                <h3 className="text-lg sm:text-xl font-bold cursor-default">
                                    Notifications
                                </h3>
                            </div>
                            {unreadNotifications > 0 && (
                                <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1 min-w-[20px] text-center cursor-default">
                                    {unreadNotifications > 99
                                        ? "99+"
                                        : unreadNotifications}{" "}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 cursor-default">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className={`text-sm px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                                        darkMode
                                            ? "text-cyan-400 hover:bg-gray-700 active:bg-gray-600"
                                            : "text-blue-600 hover:bg-gray-100 active:bg-gray-200"
                                    }`}
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-all cursor-pointer ${
                                    darkMode
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700 active:bg-gray-600"
                                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200"
                                }`}
                                aria-label="Close notifications"
                            >
                                <FaTimes className="text-lg cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        ref={contentRef}
                        className="flex-1 overflow-y-auto cursor-default"
                        style={{ scrollbarWidth: "thin" }}
                    >
                        {isLoading && notifications.length === 0 && (
                            <div className="flex items-center justify-center py-12 cursor-default">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 cursor-default"></div>
                            </div>
                        )}

                        {!isLoading && notifications.length === 0 && (
                            <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400 cursor-default">
                                <div className="text-5xl mb-4 opacity-60 cursor-default">
                                    🔔
                                </div>
                                <p className="text-lg font-medium mb-2 cursor-default">
                                    No notifications yet
                                </p>
                                <p className="text-sm cursor-default">
                                    When you get notifications, they'll show up
                                    here
                                </p>
                            </div>
                        )}

                        {notifications.length > 0 && (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700 cursor-default">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 sm:p-6 transition-all duration-200 cursor-pointer group ${
                                            !notification.read
                                                ? darkMode
                                                    ? "bg-cyan-900/20"
                                                    : "bg-blue-50"
                                                : ""
                                        } ${
                                            darkMode
                                                ? "hover:bg-gray-700/50"
                                                : "hover:bg-gray-50"
                                        } ${
                                            notification.type === "memory"
                                                ? "border-l-4 border-amber-500"
                                                : hasPostData(notification)
                                                  ? "border-l-4 border-blue-500"
                                                  : ""
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification,
                                            )
                                        }
                                    >
                                        <div className="flex items-start space-x-3 sm:space-x-4">
                                            {/* Notification Icon */}
                                            <div className="flex-shrink-0 mt-1 cursor-pointer">
                                                {getNotificationIcon(
                                                    notification.type,
                                                )}
                                            </div>

                                            {/* User Avatar and Content */}
                                            <div className="flex-1 min-w-0 flex items-start space-x-3 cursor-pointer">
                                                {/* User Avatar - Only show if not memory type */}
                                                {notification.type !==
                                                    "memory" && (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0 cursor-pointer">
                                                        {getProfilePic(
                                                            notification,
                                                        ) ? (
                                                            <img
                                                                src={getProfilePic(
                                                                    notification,
                                                                )}
                                                                alt={getUsernameForAvatar(
                                                                    notification,
                                                                )}
                                                                className="w-full h-full object-cover cursor-pointer"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    if (
                                                                        notification
                                                                            .sender
                                                                            ?._id
                                                                    ) {
                                                                        navigate(
                                                                            `/user/${notification.sender._id}`,
                                                                        );
                                                                        onClose();
                                                                    }
                                                                }}
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    e.target.style.display =
                                                                        "none";
                                                                    e.target.nextSibling.style.display =
                                                                        "flex";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span
                                                            className="flex items-center justify-center w-full h-full text-white font-semibold text-sm cursor-pointer"
                                                            style={
                                                                getProfilePic(
                                                                    notification,
                                                                )
                                                                    ? {
                                                                          display:
                                                                              "none",
                                                                      }
                                                                    : {}
                                                            }
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    notification
                                                                        .sender
                                                                        ?._id
                                                                ) {
                                                                    navigate(
                                                                        `/user/${notification.sender._id}`,
                                                                    );
                                                                    onClose();
                                                                }
                                                            }}
                                                        >
                                                            {getUsernameForAvatar(
                                                                notification,
                                                            )
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "U"}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 cursor-pointer">
                                                    <p className="text-sm sm:text-base leading-relaxed cursor-pointer">
                                                        {getNotificationMessage(
                                                            notification,
                                                        )}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-1 cursor-pointer ${
                                                            darkMode
                                                                ? "text-gray-400"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        {formatNotificationTime(
                                                            notification.createdAt,
                                                        )}
                                                    </p>

                                                    {/* Friend Request Actions */}
                                                    {notification.type ===
                                                        "friend_request" &&
                                                        !notification.isHandled && (
                                                            <div className="flex space-x-2 mt-3 cursor-pointer">
                                                                {/* Accept Button */}
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFriendRequest(
                                                                            notification._id,
                                                                            "accept",
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "accept",
                                                                        ) ||
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "decline",
                                                                        )
                                                                    }
                                                                    className={`px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center space-x-2 cursor-pointer ${
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "accept",
                                                                        ) ||
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "decline",
                                                                        )
                                                                            ? "opacity-70 cursor-not-allowed"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {isButtonLoading(
                                                                        notification._id,
                                                                        "accept",
                                                                    ) ? (
                                                                        <>
                                                                            <FaSpinner className="animate-spin cursor-pointer" />
                                                                            <span>
                                                                                Accepting...
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        "Accept"
                                                                    )}
                                                                </button>

                                                                {/* Decline Button */}
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFriendRequest(
                                                                            notification._id,
                                                                            "decline",
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "accept",
                                                                        ) ||
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "decline",
                                                                        )
                                                                    }
                                                                    className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center space-x-2 cursor-pointer ${
                                                                        darkMode
                                                                            ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                    } ${
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "accept",
                                                                        ) ||
                                                                        isButtonLoading(
                                                                            notification._id,
                                                                            "decline",
                                                                        )
                                                                            ? "opacity-70 cursor-not-allowed"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {isButtonLoading(
                                                                        notification._id,
                                                                        "decline",
                                                                    ) ? (
                                                                        <>
                                                                            <FaSpinner className="animate-spin cursor-pointer" />
                                                                            <span>
                                                                                Declining...
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        "Decline"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>

                                            {/* Unread Indicator and Actions */}
                                            <div className="flex items-center space-x-2 flex-shrink-0 cursor-pointer">
                                                {/* Mark as read button — ONLY if unread */}
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(
                                                                notification._id,
                                                            );
                                                        }}
                                                        className={`p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer ${
                                                            darkMode
                                                                ? "text-gray-400 hover:text-cyan-400 hover:bg-gray-700"
                                                                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                                                        }`}
                                                        title="Mark as read"
                                                    >
                                                        <FaCheck className="text-sm cursor-pointer" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator for infinite scroll */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-6 cursor-default">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 cursor-default"></div>
                                    </div>
                                )}

                                {/* End of notifications message */}
                                {!hasMore && notifications.length > 0 && (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm cursor-default">
                                        You're all caught up! 🎉
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Memory Popup Modal */}
            {selectedMemory && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 cursor-default"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <div
                        ref={memoryModalRef}
                        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl cursor-default"
                        style={{
                            background: darkMode
                                ? "linear-gradient(160deg, #1e2535 0%, #16202f 100%)"
                                : "linear-gradient(160deg, #ffffff 0%, #f0f4ff 100%)",
                            border: darkMode
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "1px solid rgba(0,0,0,0.1)",
                        }}
                    >
                        {/* Header — centered */}
                        <div className="relative pt-6 pb-3 px-6 text-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMemory(null);
                                }}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
                                style={{
                                    background: darkMode
                                        ? "rgba(255,255,255,0.12)"
                                        : "rgba(0,0,0,0.08)",
                                    color: darkMode ? "#cbd5e1" : "#475569",
                                }}
                            >
                                <FaTimes className="text-sm" />
                            </button>

                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-2xl">📅</span>
                                <h3
                                    className="text-2xl font-bold tracking-tight"
                                    style={{
                                        color: darkMode ? "#f1f5f9" : "#0f172a",
                                    }}
                                >
                                    On This Day
                                </h3>
                            </div>
                            <p
                                className="text-sm"
                                style={{
                                    color: darkMode ? "#94a3b8" : "#64748b",
                                }}
                            >
                                {selectedMemory.metadata?.yearsAgo === 1
                                    ? "One year ago today..."
                                    : selectedMemory.metadata?.yearsAgo
                                      ? `${selectedMemory.metadata.yearsAgo} years ago today...`
                                      : "Recently..."}
                            </p>
                        </div>

                        {/* Content — no stopPropagation so button clicks flow freely */}
                        <div className="px-5 pb-5 pt-2">
                            {getMemoryPost(selectedMemory) && (
                                <div
                                    onClick={handleMemoryPostClick}
                                    className="rounded-xl overflow-hidden cursor-pointer transition-all"
                                    style={{
                                        border: darkMode
                                            ? "1px solid rgba(255,255,255,0.07)"
                                            : "1px solid rgba(0,0,0,0.08)",
                                        boxShadow: darkMode
                                            ? "0 4px 24px rgba(0,0,0,0.5)"
                                            : "0 4px 20px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {selectedMemory.postid?.image ||
                                    selectedMemory.metadata?.post?.image ? (
                                        <div
                                            className="relative w-full"
                                            style={{ height: "280px" }}
                                        >
                                            <img
                                                src={
                                                    selectedMemory.postid
                                                        ?.image ||
                                                    selectedMemory.metadata
                                                        ?.post?.image
                                                }
                                                alt="Memory"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 transition-opacity opacity-0 hover:opacity-100 flex items-center justify-center"
                                                style={{
                                                    background:
                                                        "rgba(0,0,0,0.25)",
                                                }}
                                            >
                                                <span className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-full">
                                                    View Post
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col items-center justify-center gap-3">
                                            <p className="text-sm px-6 text-center line-clamp-3">
                                                {selectedMemory.postid
                                                    ?.content ||
                                                    selectedMemory.metadata
                                                        ?.post?.content ||
                                                    "A memory from the past"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ================== 🔥 FIXED VIEW MORE BUTTON ================== */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMoreMemories(e);
                                }}
                                className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #2563eb, #3b82f6)",
                                    color: "#ffffff",
                                    boxShadow:
                                        "0 4px 14px rgba(37,99,235,0.45)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "linear-gradient(90deg, #1d4ed8, #2563eb)";
                                    e.currentTarget.style.boxShadow =
                                        "0 6px 18px rgba(37,99,235,0.55)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "linear-gradient(90deg, #2563eb, #3b82f6)";
                                    e.currentTarget.style.boxShadow =
                                        "0 4px 14px rgba(37,99,235,0.45)";
                                }}
                            >
                                <span>View More Posts</span>
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationModal;
