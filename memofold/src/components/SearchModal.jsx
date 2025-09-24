import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import config from "../hooks/config";

const SearchModal = ({ isOpen, onClose, darkMode, currentUserProfile }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth();
    const navigate = useNavigate();
    const searchModalRef = useRef(null);
    const searchInputRef = useRef(null);

    // Handle outside clicks to close modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchModalRef.current &&
                !searchModalRef.current.contains(event.target)
            ) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape" && isOpen) {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isOpen]);

    // Focus search input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Search users function using the correct API endpoint
    const searchUsers = async (query) => {
        if (query.length < 1) {
            setSearchResults([]);
            setError("");
            return;
        }

        setIsSearching(true);
        setError("");

        try {
            const params = new URLSearchParams({
                q: query.trim(),
                limit: "10",
            });

            const response = await fetch(
                `${config.apiUrl}/user/search?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setSearchResults(result || []);
            } else if (response.status === 400) {
                setError("Invalid search query");
                setSearchResults([]);
            } else if (response.status === 401) {
                setError("Please log in again");
                setSearchResults([]);
            } else if (response.status === 500) {
                setError("Server error, please try again later");
                setSearchResults([]);
            } else {
                setError("Failed to search users");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching users:", error);
            setError("Network error, please check your connection");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change with debouncing
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery.trim());
            } else {
                setSearchResults([]);
                setError("");
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleClose = () => {
        setSearchQuery("");
        setSearchResults([]);
        setError("");
        onClose();
    };

    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Normalize current user's id (works if API gives userId or _id)
        const currentId = currentUserProfile?.userId || currentUserProfile?._id;

        if (userId) {
            if (currentId && userId === currentId) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
        handleClose();
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div
                ref={searchModalRef}
                className={`w-full max-w-md mx-4 rounded-xl shadow-lg ${
                    darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-800"
                }`}
            >
                {/* Search Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Search Users</h3>
                    <button
                        onClick={handleClose}
                        className={`p-1 rounded-full cursor-pointer transition-colors ${
                            darkMode
                                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        }`}
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4">
                    <div
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg border ${
                            darkMode
                                ? "border-gray-600 bg-gray-700"
                                : "border-gray-300 bg-gray-50"
                        } ${error ? "border-red-500" : ""}`}
                    >
                        <FaSearch className="text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search users by username or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent outline-none ${
                                darkMode
                                    ? "text-white placeholder-gray-400"
                                    : "text-gray-800 placeholder-gray-500"
                            }`}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className={`${
                                    darkMode
                                        ? "text-gray-400 hover:text-gray-200"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs mt-2 ml-1">
                            {error}
                        </p>
                    )}
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                    {isSearching && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {error && !isSearching && (
                        <div className="text-center py-8 text-red-500">
                            {error}
                        </div>
                    )}

                    {!isSearching &&
                        !error &&
                        searchQuery.length >= 1 &&
                        searchResults.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No users found for "{searchQuery}"
                            </div>
                        )}

                    {!isSearching && !error && searchQuery.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Start typing to search for users
                        </div>
                    )}

                    {!isSearching && !error && searchResults.length > 0 && (
                        <div className="pb-4">
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                Found {searchResults.length} user
                                {searchResults.length !== 1 ? "s" : ""}
                            </div>

                            {searchResults.map((user) => {
                                const userId = user.userId || user._id;
                                return (
                                    <button
                                        key={userId}
                                        onClick={(e) =>
                                            navigateToUserProfile(userId, e)
                                        }
                                        className={`flex items-center cursor-pointer w-full px-4 py-3 transition-colors ${
                                            darkMode
                                                ? "hover:bg-gray-700"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400 mr-3">
                                            {user.profilePic ? (
                                                <img
                                                    src={user.profilePic}
                                                    alt={user.username}
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
                                                    user.profilePic
                                                        ? {
                                                              display: "none",
                                                          }
                                                        : {}
                                                }
                                            >
                                                {user.username
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-semibold text-sm truncate">
                                                {user.realname || user.username}
                                            </p>
                                            <p
                                                className={`text-xs truncate ${
                                                    darkMode
                                                        ? "text-gray-400"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                @{user.username}
                                            </p>
                                            {user.email && (
                                                <p
                                                    className={`text-xs truncate ${
                                                        darkMode
                                                            ? "text-gray-500"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
