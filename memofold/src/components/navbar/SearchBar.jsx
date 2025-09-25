import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import config from "../../hooks/config";

const SearchBar = ({
    darkMode,
    token,
    currentUserProfile,
    navigate,
    isMobile = false,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef(null);
    const searchResultsRef = useRef(null);

    // Focus input when component mounts (especially for mobile)
    useEffect(() => {
        if (isMobile && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isMobile]);

    // Handle outside clicks to close search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSearchResults(false);
                if (isMobile && onClose) {
                    onClose();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobile, onClose]);

    const searchUsers = async (query) => {
        if (query.length < 1) {
            setSearchResults([]);
            setSearchError("");
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setSearchError("");

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
                setShowSearchResults(true);
            } else if (response.status === 400) {
                setSearchError("Invalid search query");
                setSearchResults([]);
            } else if (response.status === 401) {
                setSearchError("Please log in again");
                setSearchResults([]);
            } else if (response.status === 500) {
                setSearchError("Server error, please try again later");
                setSearchResults([]);
            } else {
                setSearchError("Failed to search users");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching users:", error);
            setSearchError("Network error, please check your connection");
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
                setSearchError("");
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearchFocus = () => {
        if (searchQuery && searchResults.length > 0) {
            setShowSearchResults(true);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSearchError("");
        setShowSearchResults(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (isMobile && onClose) {
            onClose();
        }
    };

    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const currentId = currentUserProfile?.userId || currentUserProfile?._id;

        if (userId) {
            if (currentId && userId === currentId) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
        clearSearch();
        setShowSearchResults(false);
    };

    return (
        <div
            className={`relative ${isMobile ? "w-full" : "max-w-md mx-4"}`}
            ref={searchResultsRef}
        >
            <div className="relative">
                <div
                    className={`flex items-center space-x-3 px-4 py-2 rounded-full border transition-colors ${
                        darkMode
                            ? "border-gray-600 bg-gray-700"
                            : "border-gray-300 bg-gray-50"
                    } ${searchError ? "border-red-500" : ""} ${
                        isMobile ? "w-full" : ""
                    }`}
                >
                    {!isMobile && <FaSearch className="text-gray-400" />}
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={
                            isMobile
                                ? "Search users..."
                                : "Search users by username or name..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleSearchFocus}
                        className={`flex-1 bg-transparent outline-none text-sm ${
                            darkMode
                                ? "text-white placeholder-gray-400"
                                : "text-gray-800 placeholder-gray-500"
                        } ${isMobile ? "pr-10" : ""}`}
                    />
                    {isMobile && (
                        <button
                            onClick={clearSearch}
                            className={`p-1 rounded-full ${
                                darkMode
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    )}
                    {!isMobile && searchQuery && (
                        <button
                            onClick={clearSearch}
                            className={`p-1 rounded-full ${
                                darkMode
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                    <SearchResultsDropdown
                        darkMode={darkMode}
                        isSearching={isSearching}
                        searchError={searchError}
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        navigateToUserProfile={navigateToUserProfile}
                        isMobile={isMobile}
                    />
                )}
            </div>
        </div>
    );
};

const SearchResultsDropdown = ({
    darkMode,
    isSearching,
    searchError,
    searchQuery,
    searchResults,
    navigateToUserProfile,
    isMobile = false,
}) => (
    <div
        className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto ${
            darkMode
                ? "bg-gray-800 text-white border border-gray-700"
                : "bg-white text-gray-800 border border-gray-200"
        } ${isMobile ? "max-h-60" : ""}`}
    >
        {isSearching && (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        )}

        {searchError && !isSearching && (
            <div className="text-center py-4 text-red-500 text-sm">
                {searchError}
            </div>
        )}

        {!isSearching &&
            !searchError &&
            searchQuery.length >= 1 &&
            searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No users found for "{searchQuery}"
                </div>
            )}

        {!isSearching && !searchError && searchResults.length > 0 && (
            <SearchResultsList
                searchResults={searchResults}
                darkMode={darkMode}
                navigateToUserProfile={navigateToUserProfile}
                isMobile={isMobile}
            />
        )}
    </div>
);

const SearchResultsList = ({
    searchResults,
    darkMode,
    navigateToUserProfile,
    isMobile,
}) => (
    <div>
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
            Found {searchResults.length} user
            {searchResults.length !== 1 ? "s" : ""}
        </div>

        {searchResults.map((user) => {
            const userId = user.userId || user._id;
            return (
                <SearchResultItem
                    key={userId}
                    user={user}
                    userId={userId}
                    darkMode={darkMode}
                    navigateToUserProfile={navigateToUserProfile}
                    isMobile={isMobile}
                />
            );
        })}
    </div>
);

const SearchResultItem = ({
    user,
    userId,
    darkMode,
    navigateToUserProfile,
    isMobile,
}) => (
    <button
        onClick={(e) => navigateToUserProfile(userId, e)}
        className={`flex items-center cursor-pointer w-full px-4 py-3 transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
        } ${isMobile ? "py-2" : ""}`}
    >
        <UserAvatar user={user} isMobile={isMobile} />
        <UserInfo user={user} darkMode={darkMode} isMobile={isMobile} />
    </button>
);

const UserAvatar = ({ user, isMobile }) => (
    <div
        className={`rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-500 bg-gradient-to-r from-blue-500 to-cyan-400 mr-3 ${
            isMobile ? "w-8 h-8" : "w-10 h-10"
        }`}
    >
        {user.profilePic ? (
            <img
                src={user.profilePic}
                alt={user.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                }}
            />
        ) : null}
        <span
            className="flex items-center justify-center w-full h-full text-white font-semibold text-sm"
            style={user.profilePic ? { display: "none" } : {}}
        >
            {user.username?.charAt(0).toUpperCase() || "U"}
        </span>
    </div>
);

const UserInfo = ({ user, darkMode, isMobile }) => (
    <div className="text-left flex-1">
        <p
            className={`font-semibold truncate ${
                isMobile ? "text-sm" : "text-sm"
            }`}
        >
            {user.realname || user.username}
        </p>
        <p
            className={`truncate ${isMobile ? "text-xs" : "text-xs"} ${
                darkMode ? "text-gray-400" : "text-gray-600"
            }`}
        >
            @{user.username}
        </p>
        {user.email && !isMobile && (
            <p
                className={`text-xs truncate ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                }`}
            >
                {user.email}
            </p>
        )}
    </div>
);

export default SearchBar;
