import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import config from "../../hooks/config";
import NotificationModal from "./NotificationModal";
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
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const { token, username, realname, logout, user } = useAuth();
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") || ""
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const desktopProfileTriggerRef = useRef(null);
    const mobileProfileTriggerRef = useRef(null);

    // Handle dark mode
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    // Handle outside clicks to close dropdown and mobile search
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close profile dropdown if clicked outside (both desktop and mobile)
            if (
                showProfileDropdown &&
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target) &&
                !event.target.closest(".profile-trigger") &&
                !desktopProfileTriggerRef.current?.contains(event.target) &&
                !mobileProfileTriggerRef.current?.contains(event.target)
            ) {
                setShowProfileDropdown(false);
            }

            // Close mobile search if clicked outside
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
    };

    const handleNotificationModalClose = () => {
        setShowNotificationModal(false);
        fetchUnreadCount();
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

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        setShowProfileDropdown(false);
    };

    const handleDesktopProfileClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowMobileSearch(false);
    };

    const handleMobileProfileClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
        setShowMobileSearch(false);
    };

    return (
        <>
            <div className="max-w-screen pb-4">
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

                    {/* Center Section: Search Bar - Hidden on mobile, visible on tablet and up */}
                    <div className="hidden md:block flex-1 max-w-lg mx-4">
                        <SearchBar
                            darkMode={darkMode}
                            token={token}
                            currentUserProfile={currentUserProfile}
                            navigate={navigate}
                        />
                    </div>

                    {/* Right Section: All icons visible on both mobile and desktop */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Search Icon - Visible only on mobile */}
                        <button
                            className="md:hidden p-2 rounded-md mobile-search-icon"
                            onClick={toggleMobileSearch}
                            aria-label="Search"
                        >
                            <svg
                                className="w-6 h-6"
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

                        {/* Notification Bell - Visible on both mobile and desktop */}
                        <div className="relative cursor-pointer">
                            <NotificationBell
                                darkMode={darkMode}
                                unreadNotifications={unreadNotifications}
                                onNotificationClick={handleNotificationClick}
                            />
                        </div>

                        {/* Profile Section - Visible on both mobile and desktop */}
                        <div className="relative">
                            {/* Desktop Profile Dropdown */}
                            <div className="hidden md:block">
                                <div
                                    ref={desktopProfileTriggerRef}
                                    className="profile-trigger"
                                >
                                    <ProfileDropdown
                                        darkMode={darkMode}
                                        profilePic={profilePic}
                                        username={username}
                                        realname={realname}
                                        showProfileDropdown={
                                            showProfileDropdown
                                        }
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

                            {/* Mobile Profile Icon */}
                            <button
                                ref={mobileProfileTriggerRef}
                                className="md:hidden p-1 rounded-full profile-trigger"
                                onClick={handleMobileProfileClick}
                                aria-label="Profile"
                            >
                                <img
                                    src={profilePic || "/default-avatar.png"}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar - Appears below navbar on mobile when search icon is clicked */}
                {showMobileSearch && (
                    <div
                        ref={mobileSearchRef}
                        className={`md:hidden mt-2 py-3 px-4 rounded-xl ${
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

                {/* Mobile Profile Dropdown - Appears below navbar on mobile */}
                {showProfileDropdown && (
                    <div
                        ref={profileDropdownRef}
                        className={`md:hidden mt-2 py-2 rounded-xl px-4 ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-md animate-in slide-in-from-top-5 duration-200`}
                    >
                        <div className="flex items-center py-2 border-b border-gray-300 dark:border-gray-600 mb-2">
                            <img
                                src={profilePic || "/default-avatar.png"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <p
                                    className={`font-semibold ${
                                        darkMode
                                            ? "text-white"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {realname || username}
                                </p>
                                <p
                                    className={`text-sm ${
                                        darkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }`}
                                >
                                    @{username}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    navigate("/profile");
                                    setShowProfileDropdown(false);
                                }}
                                className={`flex items-center w-full text-left py-3 px-3 rounded-lg ${
                                    darkMode
                                        ? "text-white hover:bg-gray-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                } transition-colors`}
                            >
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Profile
                            </button>

                            <button
                                onClick={toggleDarkMode}
                                className={`flex items-center w-full text-left py-3 px-3 rounded-lg ${
                                    darkMode
                                        ? "text-white hover:bg-gray-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                } transition-colors`}
                            >
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {darkMode ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                        />
                                    )}
                                </svg>
                                {darkMode ? "Light Mode" : "Dark Mode"}
                            </button>

                            <button
                                onClick={() => {
                                    logout();
                                    setShowProfileDropdown(false);
                                }}
                                className={`flex items-center w-full text-left py-3 px-3 rounded-lg ${
                                    darkMode
                                        ? "text-red-400 hover:bg-gray-700"
                                        : "text-red-600 hover:bg-gray-100"
                                } transition-colors`}
                            >
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Modal */}
            <NotificationModal
                showModal={showNotificationModal}
                onClose={handleNotificationModalClose}
                darkMode={darkMode}
            />
        </>
    );
};

export default Navbar;
