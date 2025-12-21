import React from "react";
import {
    FaUserCircle,
    FaMoon,
    FaSun,
    FaComment,
    FaSignOutAlt,
    FaPlusCircle,
    FaHome,
} from "react-icons/fa";

const ProfileDropdown = ({
    darkMode,
    profilePic,
    username,
    realname,
    showProfileDropdown,
    profileDropdownRef,
    toggleDarkMode,
    navigate,
    logout,
    onClose,
    currentPath, // Add currentPath prop to detect current route
}) => {
    const isProfilePage = currentPath === "/profile";
    const isFeedPage = currentPath === "/feed";

    const handleProfileClick = () => {
        navigate("/profile");
        onClose();
    };

    const handleFeedClick = () => {
        navigate("/feed");
        onClose();
    };

    const handleFeedbackClick = () => {
        navigate("/feedback");
        onClose();
    };

    const navigateToCreatePost = () => {
        navigate("/profile");
        onClose();
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    if (!showProfileDropdown) return null;

    return (
        <div
            ref={profileDropdownRef}
            className={`absolute right-0 mt-2 w-72 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } ring-1 ring-black ring-opacity-5 z-50 p-4`}
        >
            {/* User Info */}
            <UserInfo
                profilePic={profilePic}
                username={username}
                realname={realname}
                darkMode={darkMode}
            />

            {/* Navigation Links */}
            <NavigationLinks
                darkMode={darkMode}
                isProfilePage={isProfilePage}
                isFeedPage={isFeedPage}
                onProfileClick={handleProfileClick}
                onFeedClick={handleFeedClick}
                onFeedbackClick={handleFeedbackClick}
            />

            {/* Dark Mode Toggle */}
            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

            {/* Logout Button */}
            <LogoutButton darkMode={darkMode} onLogout={handleLogout} />
        </div>
    );
};

const UserAvatar = ({ profilePic, username, size = "md" }) => {
    const dimensions = size === "sm" ? "w-8 h-8" : "w-12 h-12";
    const textSize = size === "sm" ? "text-sm" : "text-lg";

    return (
        <div
            className={`${dimensions} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400`}
        >
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
                className={`flex items-center justify-center w-full h-full text-white font-semibold ${textSize}`}
                style={profilePic ? { display: "none" } : {}}
            >
                {username?.charAt(0).toUpperCase() || "U"}
            </span>
        </div>
    );
};

const UserInfo = ({ profilePic, username, realname, darkMode }) => (
    <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <UserAvatar profilePic={profilePic} username={username} size="lg" />
        <div>
            <p className="text-sm font-semibold">{realname || username}</p>
            <p
                className={`text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                }`}
            >
                @{username}
            </p>
        </div>
    </div>
);

const NavigationLinks = ({
    darkMode,
    isProfilePage,
    isFeedPage,
    onProfileClick,
    onFeedClick,
    onFeedbackClick,
}) => (
    <div className="space-y-2 mb-4">
        {/* Show Profile button only when NOT on profile page */}
        {!isProfilePage && (
            <DropdownButton
                icon={FaUserCircle}
                label="My Profile"
                darkMode={darkMode}
                onClick={onProfileClick}
            />
        )}

        {/* Show Feed button only when NOT on feed page */}
        {!isFeedPage && (
            <DropdownButton
                icon={FaHome}
                label="Feed"
                darkMode={darkMode}
                onClick={onFeedClick}
            />
        )}

        <DropdownButton
            icon={FaComment}
            label="Feedback"
            darkMode={darkMode}
            onClick={onFeedbackClick}
        />
    </div>
);

const DropdownButton = ({ icon: Icon, label, darkMode, onClick }) => (
    <button
        className={`flex items-center w-full px-3 py-2 text-sm rounded-lg ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        } cursor-pointer`}
        onClick={onClick}
    >
        <Icon className="mr-3" />
        {label}
    </button>
);

const DarkModeToggle = ({ darkMode, onToggle }) => (
    <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
        } mb-4`}
        onClick={onToggle}
    >
        <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
        <div
            className={`p-2 rounded-full ${
                darkMode ? "bg-cyan-500" : "bg-gray-300"
            } transition-colors`}
        >
            {darkMode ? (
                <FaSun className="text-sm text-yellow-400" />
            ) : (
                <FaMoon className="text-sm text-gray-600" />
            )}
        </div>
    </div>
);

const LogoutButton = ({ darkMode, onLogout }) => (
    <button
        className={`flex items-center justify-center w-full px-3 py-2 text-sm rounded-lg ${
            darkMode
                ? "text-red-400 hover:bg-gray-700 border border-red-400"
                : "text-red-600 hover:bg-gray-100 border border-red-600"
        } cursor-pointer transition-colors`}
        onClick={onLogout}
    >
        <FaSignOutAlt className="mr-2" />
        Logout
    </button>
);

export default ProfileDropdown;
