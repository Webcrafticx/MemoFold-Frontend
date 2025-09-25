import React from "react";
import { FaBell } from "react-icons/fa";

const NotificationBell = ({
    darkMode,
    unreadNotifications,
    onNotificationClick,
}) => {
    return (
        <button
            className={`relative p-2 rounded-full transition-colors ${
                darkMode
                    ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
            onClick={onNotificationClick}
            title="Notifications"
        >
            <FaBell className="text-lg" />
            {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;
