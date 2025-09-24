import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import config from "../hooks/config";
import {
    FaUserCircle,
    FaMoon,
    FaSun,
    FaComment,
    FaSignOutAlt,
    FaPlusCircle,
    FaHome,
    FaCalendarAlt,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import SearchModal from "./SearchModal";

const Navbar = ({ onDarkModeChange }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });
    const [selectedDate, setSelectedDate] = useState("");
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const { token, username, realname, logout, user } = useAuth();
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") || ""
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);

    // Handle dark mode
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target)
            ) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const handleProfileClick = () => {
        navigate("/profile");
        setShowProfileDropdown(false);
    };

    const handleFeedbackClick = () => {
        navigate("/feedback");
        setShowProfileDropdown(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    const navigateToMain = () => {
        navigate("/feed");
        setShowProfileDropdown(false);
    };

    const navigateToCreatePost = () => {
        navigate("/create-post");
        setShowProfileDropdown(false);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        console.log("Selected date:", date);
        setShowProfileDropdown(false);
    };

    const handleSearchClick = () => {
        setShowSearchModal(true);
        setShowProfileDropdown(false);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
    };

    return (
        <>
            <div className={`max-w-screen pb-4`}>
                <div
                    className={`flex justify-between items-center py-4 rounded-xl px-8 ${
                        darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-md`}
                >
                    {/* Left Section: Logo */}
                    <button
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={navigateToMain}
                    >
                        <img
                            src={logo}
                            alt="MemoFold"
                            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                        />
                        <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            MemoFold
                        </span>
                    </button>

                    {/* Right Section: Search Icon and Profile Dropdown */}
                    <div className="flex items-center space-x-4">
                        {/* Search Icon */}
                        <button
                            className={`p-2 rounded-full cursor-pointer transition-colors ${
                                darkMode
                                    ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                            }`}
                            onClick={handleSearchClick}
                            title="Search users"
                        >
                            <FaSearch className="text-lg" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                className={`p-1 rounded-full border-2 cursor-pointer ${
                                    darkMode
                                        ? "border-cyan-500 hover:border-cyan-400"
                                        : "border-blue-500 hover:border-blue-400"
                                } transition-colors`}
                                onClick={() =>
                                    setShowProfileDropdown(!showProfileDropdown)
                                }
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400">
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
                                        className="flex items-center justify-center w-full h-full text-white font-semibold text-sm"
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
                            </button>

                            {showProfileDropdown && (
                                <div
                                    className={`absolute right-0 mt-2 w-72 rounded-xl shadow-lg ${
                                        darkMode
                                            ? "bg-gray-800 text-white"
                                            : "bg-white text-gray-800"
                                    } ring-1 ring-black ring-opacity-5 z-50 p-4`}
                                >
                                    {/* User Info */}
                                    <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400">
                                            {profilePic ? (
                                                <img
                                                    src={profilePic}
                                                    alt={username}
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
                                                className="flex items-center justify-center w-full h-full text-white font-semibold text-lg"
                                                style={
                                                    profilePic
                                                        ? { display: "none" }
                                                        : {}
                                                }
                                            >
                                                {username
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
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

                                    {/* Navigation Links */}
                                    <div className="space-y-2 mb-4">
                                        <button
                                            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg ${
                                                darkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            } cursor-pointer`}
                                            onClick={handleProfileClick}
                                        >
                                            <FaUserCircle className="mr-3" />
                                            Profile
                                        </button>

                                        <button
                                            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg ${
                                                darkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            } cursor-pointer`}
                                            onClick={handleFeedbackClick}
                                        >
                                            <FaComment className="mr-3" />
                                            Feedback
                                        </button>
                                    </div>

                                    {/* Dark Mode Toggle */}
                                    <div
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                            darkMode
                                                ? "bg-gray-700"
                                                : "bg-gray-100"
                                        } mb-4`}
                                    >
                                        <span className="text-sm">
                                            {darkMode
                                                ? "Light Mode"
                                                : "Dark Mode"}
                                        </span>
                                        <button
                                            onClick={toggleDarkMode}
                                            className={`p-2 rounded-full ${
                                                darkMode
                                                    ? "bg-cyan-500"
                                                    : "bg-gray-300"
                                            } transition-colors cursor-pointer`}
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
                                        className={`flex items-center justify-center w-full px-3 py-2 text-sm rounded-lg ${
                                            darkMode
                                                ? "text-red-400 hover:bg-gray-700 border border-red-400"
                                                : "text-red-600 hover:bg-gray-100 border border-red-600"
                                        } cursor-pointer transition-colors`}
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal
                isOpen={showSearchModal}
                onClose={closeSearchModal}
                darkMode={darkMode}
                currentUserProfile={currentUserProfile}
            />
        </>
    );
};

export default Navbar;
