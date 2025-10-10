import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import config from "../../hooks/config";
import { FiUsers } from "react-icons/fi";
import NotificationModal from "./NotificationModal";
import FriendsSidebar from "./FriendsSidebar";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropDown";
import NotificationBell from "./NotificationBell";
import Logo from "./Logo";

const Navbar = ({ onDarkModeChange }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showFriendsSidebar, setShowFriendsSidebar] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const { token, username, realname, logout } = useAuth();
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") || ""
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const profileTriggerRef = useRef(null);

    // Handle dark mode
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    // Outside click handling
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Profile dropdown close
            if (
                showProfileDropdown &&
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target) &&
                !event.target.closest(".profile-trigger")
            ) {
                setShowProfileDropdown(false);
            }

            // Mobile search close
            if (
                showMobileSearch &&
                mobileSearchRef.current &&
                !mobileSearchRef.current.contains(event.target) &&
                !event.target.closest(".mobile-search-icon")
            ) {
                setShowMobileSearch(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMobileSearch, showProfileDropdown]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    const userData = result.user;

                    setCurrentUserProfile(userData);

                    localStorage.setItem("userId", userData._id);
                    localStorage.setItem("realname", userData.realname);
                    localStorage.setItem("username", userData.username);
                    localStorage.setItem("email", userData.email);
                    localStorage.setItem("createdAt", userData.createdAt);
                    localStorage.setItem("updatedAt", userData.updatedAt);

                    if (userData.profilePic) {
                        setProfilePic(userData.profilePic);
                        localStorage.setItem("profilePic", userData.profilePic);
                    } else {
                        setProfilePic("");
                        localStorage.removeItem("profilePic");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);

        if (onDarkModeChange) {
            onDarkModeChange(newMode);
        }
    };

    const handleNotificationClick = () => {
        setShowNotificationModal(true);
        setShowProfileDropdown(false);
        setShowMobileSearch(false);
        setShowFriendsSidebar(false);
    };

    const handleFriendsClick = () => {
        setShowFriendsSidebar(!showFriendsSidebar);
        setShowProfileDropdown(false);
        setShowMobileSearch(false);
    };

    const handleNotificationModalClose = () => {
        setShowNotificationModal(false);
        fetchUnreadCount();
    };

    const handleFriendsSidebarClose = () => {
        setShowFriendsSidebar(false);
    };

    const fetchUnreadCount = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${config.apiUrl}/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setUnreadNotifications(result.count || 0);
            }
        } catch (error) {
            console.error("Error fetching unread notifications count:", error);
        }
    };

    // Regular polling for notifications - ADD THIS
    useEffect(() => {
        if (!token) return;

        // Fetch count immediately
        fetchUnreadCount();

        // Set up polling every 30 seconds
        const intervalId = setInterval(fetchUnreadCount, 30000);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [token]);

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        setShowProfileDropdown(false);
        setShowFriendsSidebar(false);
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowMobileSearch(false);
        setShowFriendsSidebar(false);
    };

    const UserAvatar = ({ profilePic, username, size = "sm" }) => {
        const [imageError, setImageError] = useState(false);
        const dimensions = size === "sm" ? "w-8 h-8" : "w-12 h-12";
        const textSize = size === "sm" ? "text-sm" : "text-lg";

        const showInitial = !profilePic || imageError;

        return (
            <div
                className={`${dimensions} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold ${textSize} cursor-pointer`}
            >
                {!showInitial ? (
                    <img
                        src={profilePic}
                        alt={username}
                        className="w-full h-full object-cover cursor-pointer"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="cursor-pointer">
                        {username?.charAt(0).toUpperCase() || "U"}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Sticky Wrapper */}
            <div className="sticky top-0 z-40 w-full cursor-default">
                <div className="max-w-screen pb-4 bg-inherit">
                    {/* Main Navbar */}
                    <div
                        className={`flex justify-between items-center py-4 rounded-xl px-4 md:px-8 ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-md relative`}
                    >
                        {/* Left Section: Logo */}
                        <Logo
                            darkMode={darkMode}
                            navigateToMain={() => navigate("/feed")}
                        />

                        {/* Center Section: Search Bar */}
                        <div className="hidden md:block flex-1 max-w-lg mx-4">
                            <SearchBar
                                darkMode={darkMode}
                                token={token}
                                currentUserProfile={currentUserProfile}
                                navigate={navigate}
                            />
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-3 md:space-x-4 pr-4">
                            {/* Search Icon - Mobile */}
                            <button
                                className="md:hidden p-2 rounded-md mobile-search-icon cursor-pointer"
                                onClick={toggleMobileSearch}
                                aria-label="Search"
                            >
                                <svg
                                    className="w-6 h-6 cursor-pointer"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>

                            {/* Notification Bell */}
                            <div className="relative cursor-pointer">
                                <NotificationBell
                                    darkMode={darkMode}
                                    unreadNotifications={unreadNotifications}
                                    onNotificationClick={
                                        handleNotificationClick
                                    }
                                />
                            </div>

                            {/* Friends Icon */}
                            <div className="relative">
                                <button
                                    onClick={handleFriendsClick}
                                    className={`friends-trigger p-2 rounded-md transition-colors cursor-pointer ${
                                        darkMode
                                            ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                    aria-label="Friends"
                                >
                                    <FiUsers className="w-6 h-6 cursor-pointer" />
                                </button>
                            </div>

                            {/* Profile Section */}
                            <div className="relative">
                                <div
                                    ref={profileTriggerRef}
                                    className="profile-trigger cursor-pointer border-2 border-blue-500 rounded-full p-1"
                                    onClick={handleProfileClick}
                                >
                                    <UserAvatar
                                        profilePic={profilePic}
                                        username={username}
                                        size="sm"
                                    />
                                </div>

                                {/* Profile Dropdown */}
                                <ProfileDropdown
                                    darkMode={darkMode}
                                    profilePic={profilePic}
                                    username={username}
                                    realname={realname}
                                    showProfileDropdown={showProfileDropdown}
                                    setShowProfileDropdown={
                                        setShowProfileDropdown
                                    }
                                    profileDropdownRef={profileDropdownRef}
                                    toggleDarkMode={toggleDarkMode}
                                    navigate={navigate}
                                    logout={logout}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {showMobileSearch && (
                        <div
                            ref={mobileSearchRef}
                            className={`md:hidden mt-2 py-3 px-4 rounded-xl cursor-default ${
                                darkMode ? "bg-gray-800" : "bg-white"
                            } shadow-md`}
                        >
                            <SearchBar
                                darkMode={darkMode}
                                token={token}
                                currentUserProfile={currentUserProfile}
                                navigate={navigate}
                                isMobile={true}
                                onSearch={() => setShowMobileSearch(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Modal */}
            <NotificationModal
                showModal={showNotificationModal}
                onClose={handleNotificationModalClose}
                darkMode={darkMode}
            />

            {/* Friends Sidebar */}
            <FriendsSidebar
                isOpen={showFriendsSidebar}
                onClose={handleFriendsSidebarClose}
                darkMode={darkMode}
                token={token}
            />
        </>
    );
};

export default Navbar;
