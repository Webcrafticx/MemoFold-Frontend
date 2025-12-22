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
    const [unreadMessages, setUnreadMessages] = useState(0);

    const { token, realname, logout } = useAuth();
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    // Listen for username updates (event-driven sync, like profilePic)
    useEffect(() => {
        const handleProfileInfoUpdate = () => {
            setUsername(localStorage.getItem("username") || "");
        };
        window.addEventListener("profileInfoUpdated", handleProfileInfoUpdate);
        return () => {
            window.removeEventListener("profileInfoUpdated", handleProfileInfoUpdate);
        };
    }, []);
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") || ""
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const profileTriggerRef = useRef(null);
    useEffect(() => {
        if (!token) {
            // No token found — redirect immediately
            navigate("/login", { replace: true });
        } else {
            try {
                const tokenPayload = JSON.parse(atob(token.split(".")[1]));
                const currentTime = Date.now() / 1000;

                // If token expired, logout and redirect
                if (tokenPayload.exp && tokenPayload.exp < currentTime) {
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                }
            } catch (error) {
                // Invalid or malformed token
                console.error("Invalid token format:", error);
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
            }
        }
    }, [token, navigate]);


            useEffect(() => {
            const handleProfilePicUpdate = () => {
                setProfilePic(localStorage.getItem("profilePic") || "");
            };
            window.addEventListener("profilePicUpdated", handleProfilePicUpdate);
            return () => {
                window.removeEventListener("profilePicUpdated", handleProfilePicUpdate);
            };
        }, []);

        

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
            if (
                showProfileDropdown &&
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target) &&
                !event.target.closest(".profile-trigger")
            ) {
                setShowProfileDropdown(false);
            }

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

        // Prevent body scroll when ProfileDropDown is open
        useEffect(() => {
            if (showProfileDropdown) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
            return () => {
                document.body.style.overflow = "";
            };
        }, [showProfileDropdown]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Status code:", response.status);

                if (response.ok) {
                    const result = await response.json();
                    const userData = result.user;

                    setCurrentUserProfile(userData);

                    // Store user data in localStorage
                    localStorage.setItem("userId", userData._id);
                    localStorage.setItem("realname", userData.realname);
                    localStorage.setItem("username", userData.username);
                    localStorage.setItem("email", userData.email);
                    localStorage.setItem("createdAt", userData.createdAt);
                    localStorage.setItem("updatedAt", userData.updatedAt);
                    localStorage.setItem("user", JSON.stringify(userData));

                    // Handle profile picture
                    if (userData.profilePic) {
                        setProfilePic(userData.profilePic);
                        localStorage.setItem("profilePic", userData.profilePic);
                    } else {
                        setProfilePic("");
                        localStorage.removeItem("profilePic");
                    }
                } else if (response.status === 401) {
                    // Clear invalid token and redirect to login
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                } else {
                    console.error("Unexpected error:", response.status);
                    // Handle other error statuses if needed
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        

        if (token) {
            fetchUserData();
        } else {
            // If no token, redirect to login
            navigate("/login");
        }
    }, [token, navigate]);
    
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

    // Regular polling for notifications
    useEffect(() => {
        if (!token) return;

        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(intervalId);
    }, [token]);

    // Update unread messages count from FriendsSidebar (No duplicate polling!)
    const handleUnreadMessagesUpdate = (count) => {
        setUnreadMessages(count);
    };

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
            <div className="sticky top-0 z-40 w-full cursor-default">
                <div className="max-w-screen pb-4 bg-inherit">
                    <div
                        className={`flex justify-between items-center py-4 rounded-xl px-4 md:px-8 ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-md relative`}
                    >
                        <Logo
                            darkMode={darkMode}
                            navigateToMain={() => navigate("/feed")}
                        />

                        <div className="hidden md:block flex-1 max-w-lg mx-4">
                            <SearchBar
                                darkMode={darkMode}
                                token={token}
                                currentUserProfile={currentUserProfile}
                                navigate={navigate}
                            />
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-4 pr-4">
                            <button
                                className="md:hidden p-2 rounded-md mobile-search-icon cursor-pointer"
                                onClick={toggleMobileSearch}
                                aria-label="Search"
                            >
                                <svg
                                    className="w-5 h-5 cursor-pointer"
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

                            <div className="relative cursor-pointer">
                                <NotificationBell
                                    darkMode={darkMode}
                                    unreadNotifications={unreadNotifications}
                                    onNotificationClick={
                                        handleNotificationClick
                                    }
                                />
                            </div>

                            {/* Friends Icon with Unread Badge */}
                            <div className="relative">
                                <button
                                    onClick={handleFriendsClick}
                                    className={`friends-trigger p-2 rounded-md transition-colors cursor-pointer relative ${
                                        darkMode
                                            ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                                    }`}
                                    aria-label="Friends"
                                >
                                    <FiUsers className="w-6 h-6 cursor-pointer" />
                                    {unreadMessages > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                                            {unreadMessages > 99
                                                ? "99+"
                                                : unreadMessages}
                                        </span>
                                    )}
                                </button>
                            </div>

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
                                    currentPath={window.location.pathname}
                                />
                            </div>
                        </div>
                    </div>

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

            <NotificationModal
                showModal={showNotificationModal}
                unreadNotifications={unreadNotifications}
                onClose={handleNotificationModalClose}
                darkMode={darkMode}
            />

            <FriendsSidebar
                isOpen={showFriendsSidebar}
                onClose={handleFriendsSidebarClose}
                darkMode={darkMode}
                token={token}
                onUnreadCountUpdate={handleUnreadMessagesUpdate}
            />
        </>
    );
};

export default Navbar;
