import React, { forwardRef } from "react";
import {
    FaUserCircle,
    FaPlusCircle,
    FaComment,
    FaHome,
    FaBell,
    FaMoon,
    FaSun,
    FaSignOutAlt,
    FaTimes,
} from "react-icons/fa";

const MobileMenu = forwardRef(
    (
        {
            darkMode,
            showMobileMenu,
            profilePic,
            username,
            realname,
            unreadNotifications,
            onNotificationClick,
            onProfileClick,
            onCreatePostClick,
            onFeedbackClick,
            onHomeClick,
            toggleDarkMode,
            logout,
        },
        ref
    ) => {
        if (!showMobileMenu) return null;

        return (
            <div className="sm:hidden">
                {/* Overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

                {/* Menu */}
                <div
                    ref={ref}
                    className={`fixed left-0 top-0 bottom-0 w-80 max-w-full transform transition-transform duration-300 z-50 ${
                        showMobileMenu ? "translate-x-0" : "-translate-x-full"
                    } ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl`}
                >
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400">
                                    {profilePic ? (
                                        <img
                                            src={profilePic}
                                            alt={username}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                    "flex";
                                            }}
                                        />
                                    ) : null}
                                    <span
                                        className="flex items-center justify-center w-full h-full text-white font-semibold text-base"
                                        style={
                                            profilePic
                                                ? { display: "none" }
                                                : {}
                                        }
                                    >
                                        {username?.charAt(0).toUpperCase() ||
                                            "U"}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {realname || username}
                                    </p>
                                    <p
                                        className={`text-xs ${
                                            darkMode
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        @{username}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    document.dispatchEvent(
                                        new Event("mousedown")
                                    )
                                }
                                className={`p-2 rounded-full ${
                                    darkMode
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <FaTimes
                                    className={
                                        darkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                />
                            </button>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <MobileMenuItem
                                icon={FaHome}
                                label="Home"
                                darkMode={darkMode}
                                onClick={onHomeClick}
                            />
                            <MobileMenuItem
                                icon={FaUserCircle}
                                label="Profile"
                                darkMode={darkMode}
                                onClick={onProfileClick}
                            />
                            <MobileMenuItem
                                icon={FaPlusCircle}
                                label="Create Post"
                                darkMode={darkMode}
                                onClick={onCreatePostClick}
                            />
                            <MobileMenuItem
                                icon={FaComment}
                                label="Feedback"
                                darkMode={darkMode}
                                onClick={onFeedbackClick}
                            />

                            {/* Notifications */}
                            <button
                                onClick={onNotificationClick}
                                className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${
                                    darkMode
                                        ? "hover:bg-gray-700"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <div className="relative mr-3">
                                    <FaBell className="text-lg" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                            {unreadNotifications > 99
                                                ? "99+"
                                                : unreadNotifications}
                                        </span>
                                    )}
                                </div>
                                Notifications
                            </button>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                            {/* Dark Mode Toggle */}
                            <div
                                className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                    darkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                            >
                                <span className="text-sm">
                                    {darkMode ? "Light Mode" : "Dark Mode"}
                                </span>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`p-2 rounded-full ${
                                        darkMode ? "bg-cyan-500" : "bg-gray-300"
                                    } transition-colors`}
                                >
                                    {darkMode ? (
                                        <FaSun className="text-sm text-yellow-400" />
                                    ) : (
                                        <FaMoon className="text-sm text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className={`flex items-center justify-center w-full px-3 py-2 text-sm rounded-lg ${
                                    darkMode
                                        ? "text-red-400 hover:bg-gray-700 border border-red-400"
                                        : "text-red-600 hover:bg-gray-100 border border-red-600"
                                } transition-colors`}
                            >
                                <FaSignOutAlt className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

const MobileMenuItem = ({ icon: Icon, label, darkMode, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
    >
        <Icon className="mr-3 text-lg" />
        {label}
    </button>
);

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
