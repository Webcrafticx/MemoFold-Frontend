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
} from "react-icons/fa";

const NotificationModal = ({ showModal, onClose, darkMode }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const { token, username } = useAuth();
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (showModal) {
            // Store current scroll position
            const scrollY = window.scrollY;

            // Add styles to prevent scrolling
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";

            return () => {
                // Restore scrolling when modal closes
                const scrollY = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.overflow = "";
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            };
        }
    }, [showModal]); // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (showModal) {
            document.addEventListener("keydown", handleEscapeKey);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [showModal, onClose]);

    // Handle outside clicks to close modal
    useEffect(() => {
        const handleClickOutside = (event) => {
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
    }, [showModal, onClose]);

    // Fetch notifications when modal opens
    useEffect(() => {
        if (showModal && token) {
            fetchNotifications(true);
        }
    }, [showModal, token]);

    // Handle infinite scroll
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
                }
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

                // Calculate unread count
                const unread = reset
                    ? notificationsData.filter((notif) => !notif.read).length
                    : unreadCount +
                      notificationsData.filter((notif) => !notif.read).length;
                setUnreadCount(unread);
            } else {
                console.error("Failed to fetch notifications");
                if (reset) {
                    setNotifications([]);
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            if (reset) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/notifications/notification/read/${notificationId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        notificationId: notificationId,
                    }),
                }
            );

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === notificationId
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } else {
                console.error("Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markMultipleAsRead = async (notificationIds) => {
        try {
            // Use Promise.all to mark multiple notifications as read
            const markPromises = notificationIds.map((notificationId) =>
                fetch(
                    `${config.apiUrl}/notifications/notification/read/${notificationId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            notificationId: notificationId,
                        }),
                    }
                )
            );

            const results = await Promise.all(markPromises);
            const allSuccessful = results.every((response) => response.ok);

            if (allSuccessful) {
                // Update local state for all marked notifications
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notificationIds.includes(notif._id)
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setUnreadCount((prev) =>
                    Math.max(0, prev - notificationIds.length)
                );
            } else {
                console.error("Failed to mark some notifications as read");
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // Get all unread notification IDs
            const unreadNotifications = notifications.filter(
                (notif) => !notif.read
            );

            if (unreadNotifications.length === 0) return;

            const unreadNotificationIds = unreadNotifications.map(
                (notif) => notif._id
            );

            // Use the multiple mark function
            await markMultipleAsRead(unreadNotificationIds);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const handleFriendRequest = async (notificationId, action) => {
        try {
            const notification = notifications.find(
                (notif) => notif._id === notificationId
            );

            if (!notification) {
                console.error("Notification not found");
                return;
            }

            const senderUserId = notification.sender?._id;

            if (!senderUserId) {
                console.error("Sender user ID not found in notification");
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
                }
            );

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === notificationId
                            ? { ...notif, isHandled: true, status: action }
                            : notif
                    )
                );
            } else {
                console.error(`Failed to ${action} friend request`);
            }
        } catch (error) {
            console.error(`Error ${action} friend request:`, error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Handle post redirection based on notification type and available data
        switch (notification.type) {
            case "like":
            case "comment":
            case "comment_like":
            case "share":
                // Check if postid is available in the notification
                if (notification.postid && notification.postid._id) {
                    // Redirect to post page with post ID
                    navigate(`/post/${notification.postid._id}`);
                    onClose();
                } else if (notification.postId) {
                    // Alternative field name for post ID
                    navigate(`/post/${notification.postId}`);
                    onClose();
                } else {
                    // Fallback: navigate to sender's profile
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
                // Default behavior for unknown notification types
                if (notification.sender?._id) {
                    navigate(`/user/${notification.sender._id}`);
                    onClose();
                }
                break;
        }
    };

    const getNotificationIcon = (type) => {
        const iconProps = { className: "text-lg flex-shrink-0" };

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
            default:
                return <FaBell {...iconProps} style={{ color: "#6b7280" }} />;
        }
    };

    const getNotificationMessage = (notification) => {
        const senderName =
            notification.sender?.realname ||
            notification.sender?.username ||
            "Someone";

        switch (notification.type) {
            case "comment_like":
                return `${senderName} liked your comment`;
            case "comment":
                return `${senderName} commented on your post`;
            case "friend_request":
                return `${senderName} sent you a friend request`;
            case "friend_accept":
                return `${senderName} accepted your friend request`;
            case "share":
                return `${senderName} shared your post`;
            case "like":
                return `${senderName} liked your post`;
            default:
                return `${senderName} sent you a notification`;
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

    // Check if notification has post data for redirection
    const hasPostData = (notification) => {
        return notification.postid && notification.postid._id;
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-4 px-2 sm:pt-20 sm:px-4 backdrop-blur-sm">
            <div
                ref={modalRef}
                className={`w-full max-w-2xl rounded-xl shadow-2xl ${
                    darkMode
                        ? "bg-gray-800 text-white border border-gray-700"
                        : "bg-white text-gray-800 border border-gray-200"
                } max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100`}
                style={{
                    minHeight: "300px",
                    height: "auto",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-inherit">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <FaBell
                                className={`text-lg ${
                                    darkMode ? "text-cyan-400" : "text-blue-600"
                                }`}
                            />
                            <h3 className="text-lg sm:text-xl font-bold">
                                Notifications
                            </h3>
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className={`text-sm px-3 py-1.5 rounded-lg transition-all font-medium ${
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
                            className={`p-2 rounded-full transition-all ${
                                darkMode
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700 active:bg-gray-600"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200"
                            }`}
                            aria-label="Close notifications"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {isLoading && notifications.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && (
                        <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
                            <div className="text-5xl mb-4 opacity-60">🔔</div>
                            <p className="text-lg font-medium mb-2">
                                No notifications yet
                            </p>
                            <p className="text-sm">
                                When you get notifications, they'll show up here
                            </p>
                        </div>
                    )}

                    {notifications.length > 0 && (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                                        hasPostData(notification)
                                            ? "border-l-4 border-blue-500"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div className="flex items-start space-x-3 sm:space-x-4">
                                        {/* Notification Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </div>

                                        {/* User Avatar and Content */}
                                        <div className="flex-1 min-w-0 flex items-start space-x-3">
                                            {/* User Avatar */}
                                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0">
                                                {notification.sender
                                                    ?.profilePic ? (
                                                    <img
                                                        src={
                                                            notification.sender
                                                                .profilePic
                                                        }
                                                        alt={
                                                            notification.sender
                                                                .username
                                                        }
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.nextSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />
                                                ) : null}
                                                <span
                                                    className="flex items-center justify-center w-full h-full text-white font-semibold text-sm"
                                                    style={
                                                        notification.sender
                                                            ?.profilePic
                                                            ? {
                                                                  display:
                                                                      "none",
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {notification.sender?.username
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base leading-relaxed">
                                                    {getNotificationMessage(
                                                        notification
                                                    )}
                                                </p>
                                                <p
                                                    className={`text-xs mt-1 ${
                                                        darkMode
                                                            ? "text-gray-400"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {formatNotificationTime(
                                                        notification.createdAt
                                                    )}
                                                </p>

                                                {/* Show post preview for notifications with post data */}
                                                {hasPostData(notification) && (
                                                    <div
                                                        className={`mt-2 p-2 rounded-lg text-xs ${
                                                            darkMode
                                                                ? "bg-gray-700 text-gray-300"
                                                                : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    >
                                                        <p className="truncate">
                                                            {notification.postid
                                                                .content ||
                                                                "View post"}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Friend Request Actions */}
                                                {notification.type ===
                                                    "friend_request" &&
                                                    !notification.isHandled && (
                                                        <div className="flex space-x-2 mt-3">
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleFriendRequest(
                                                                        notification._id,
                                                                        "accept"
                                                                    );
                                                                }}
                                                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleFriendRequest(
                                                                        notification._id,
                                                                        "decline"
                                                                    );
                                                                }}
                                                                className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                                                                    darkMode
                                                                        ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                }`}
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Unread Indicator and Actions */}
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            {!notification.read && (
                                                <FaCircle className="text-blue-500 text-xs animate-pulse" />
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(
                                                        notification._id
                                                    );
                                                }}
                                                className={`p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                                                    darkMode
                                                        ? "text-gray-400 hover:text-cyan-400 hover:bg-gray-700"
                                                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                                                }`}
                                                title="Mark as read"
                                            >
                                                <FaCheck className="text-sm" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator for infinite scroll */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            )}

                            {/* End of notifications message */}
                            {!hasMore && notifications.length > 0 && (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                    You're all caught up! 🎉
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
