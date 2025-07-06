import React, { useState, useEffect, useRef } from "react";
import {
    FaPlusCircle,
    FaHeart,
    FaRegHeart,
    FaComment,
    FaShare,
    FaUserCircle,
    FaHome,
    FaCalendarAlt,
    FaClock,
    FaTrash,
    FaPaperclip,
    FaMoon,
    FaSun,
    FaEdit,
    FaCog,
    FaTimes,
    FaArrowLeft,
    FaBars
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";

const API_BASE = "https://memofold1.onrender.com/api";

const ProfilePage = () => {
    const [profilePic, setProfilePic] = useState("https://ui-avatars.com/api/?name=User&background=random");
    const [username, setUsername] = useState("");
    const [realName, setRealName] = useState("");
    const [bio, setBio] = useState("Visual storyteller. Passion meets pixels. ✨");
    const [posts, setPosts] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0
    });
    const [loading, setLoading] = useState(true);
    const [editingBio, setEditingBio] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: "",
        realName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    
    const fileInputRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem("darkMode");
        if (savedTheme) {
            setDarkMode(savedTheme === "true");
        }

        // Load user data
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        const storedRealname = localStorage.getItem("realname");
        
        if (storedUsername) setUsername(storedUsername);
        if (storedRealname) setRealName(storedRealname);

        // Set initial form data
        setEditFormData({
            username: storedUsername || "",
            realName: storedRealname || "",
            email: localStorage.getItem("email") || "",
            password: "",
            confirmPassword: ""
        });

        // Fetch user profile data
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    if (userData.profilePic) {
                        setProfilePic(userData.profilePic);
                    }
                    if (userData.bio) {
                        setBio(userData.bio);
                        setNewBio(userData.bio);
                    }
                    setStats({
                        posts: userData.postCount || 0,
                        followers: userData.followerCount || 0,
                        following: userData.followingCount || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        // Fetch user posts
        const fetchUserPosts = async () => {
            try {
                const response = await fetch(`${API_BASE}/posts/user/${storedUsername}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const postsData = await response.json();
                    setPosts(postsData.reverse().map(post => ({
                        ...post,
                        isLiked: false,
                        profilePic: post.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=random`
                    })));
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchUserPosts();

        // Set up clock
        const updateClock = () => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateClock();
        const clockInterval = setInterval(updateClock, 1000);

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);

        // Click outside mobile menu handler
        const handleClickOutside = (e) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(clockInterval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Save theme preference
        localStorage.setItem("darkMode", darkMode);
        // Apply theme to body
        if (darkMode) {
            document.body.className = "bg-gray-900";
        } else {
            document.body.className = "bg-gradient-to-r from-gray-100 to-gray-300";
        }
    }, [darkMode]);

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/user/upload-profile-pic`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setProfilePic(data.profilePic);
                alert("Profile picture updated successfully!");
            } else {
                alert("Failed to update profile picture");
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Error uploading profile picture");
        }
    };

    const handleBioUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/user/update-bio`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bio: newBio }),
            });

            if (response.ok) {
                setBio(newBio);
                setEditingBio(false);
                alert("Bio updated successfully!");
            } else {
                alert("Failed to update bio");
            }
        } catch (error) {
            console.error("Error updating bio:", error);
            alert("Error updating bio");
        }
    };

    const toggleLike = async (postId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setPosts(
                    posts.map((post) => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                isLiked: !post.isLiked,
                                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                            };
                        }
                        return post;
                    })
                );
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) return alert("Post content cannot be empty.");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("content", postContent);
            formData.append("date", selectedDate);
            formData.append("time", currentTime);
            
            if (fileInputRef.current.files[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            const response = await fetch(`${API_BASE}/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                return alert(`Failed to post: ${result.error || "Unknown error"}`);
            }

            setPosts([{
                ...result,
                isLiked: false,
                likes: 0,
                comments: 0,
                shares: 0,
                profilePic: profilePic,
                username: username
            }, ...posts]);

            setStats(prev => ({...prev, posts: prev.posts + 1}));
            setPostContent("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            alert("Posted successfully!");
        } catch (error) {
            console.error("Post error:", error);
            alert("Failed to post. Server error.");
        }
    };

    const handleEditProfileSubmit = async (e) => {
        e.preventDefault();
        // Add your profile update logic here
        if (editFormData.password !== editFormData.confirmPassword) {
            return alert("Passwords don't match!");
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/user/update-profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: editFormData.username,
                    realName: editFormData.realName,
                    email: editFormData.email,
                    password: editFormData.password || undefined
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUsername(data.username || username);
                setRealName(data.realName || realName);
                localStorage.setItem("username", data.username || username);
                localStorage.setItem("realname", data.realName || realName);
                if (data.email) {
                    localStorage.setItem("email", data.email);
                }
                setShowEditProfileModal(false);
                alert("Profile updated successfully!");
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login.html";
    };

    const navigateToMain = () => {
        window.location.href = "/updMain.html";
    };

    const goBack = () => {
        window.history.back();
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'text-gray-800'}`}>
            {/* Navigation Bar */}
            <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-md px-4 sm:px-6 py-3 sticky top-0 z-50`}>
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                            onClick={goBack}
                            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
                            title="Go back"
                        >
                            <FaArrowLeft className="text-gray-600 dark:text-gray-300 text-sm sm:text-base" />
                        </button>
                        <div className="flex items-center cursor-pointer">
                            <img
                                src={logo}
                                alt="MemoFold Logo"
                                className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-xl"
                            />
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <button 
                            onClick={navigateToMain}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 sm:px-5 rounded-xl hover:from-cyan-500 hover:to-blue-600 hover:scale-105 transition-all cursor-pointer text-sm sm:text-base"
                        >
                            <FaPlusCircle className="text-sm sm:text-lg" />
                            <span className="hidden sm:inline">Create Post</span>
                        </button>
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors cursor-pointer`}
                            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
                        >
                            Logout
                        </button>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FaBars className="text-xl" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    ref={mobileMenuRef}
                    className={`md:hidden fixed top-16 right-4 z-50 w-48 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                    <div className="flex flex-col p-4 gap-3">
                        <button 
                            onClick={navigateToMain}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg justify-center"
                        >
                            <FaPlusCircle />
                            <span>Create Post</span>
                        </button>
                        
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} justify-center`}
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold py-2"
                        >
                            Logout
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <div className={`pt-4 sm:pt-6 pb-12 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-gray-100 to-gray-300'}`}>
                {/* Profile Section */}
                <div className={`max-w-4xl mx-auto mb-6 sm:mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 transition-all hover:shadow-2xl`}>
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div className="relative group self-center sm:self-auto">
                            <input
                                type="file"
                                id="profilePicUpload"
                                onChange={handleProfilePicChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <label
                                htmlFor="profilePicUpload"
                                className="cursor-pointer"
                            >
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-blue-400 hover:scale-105 transition-transform"
                                />
                                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 sm:p-2 rounded-full group-hover:bg-blue-600 transition-colors">
                                    <FaPlusCircle className="text-sm sm:text-base" />
                                </div>
                            </label>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex items-start justify-between">
                                <div className="text-center sm:text-left w-full">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold dark:text-white break-all">
                                        {username}
                                    </h2>
                                    <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-300 mt-1">
                                        {realName}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setEditingBio(!editingBio)}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                                >
                                    <FaEdit />
                                </button>
                            </div>
                            
                            {editingBio ? (
                                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                    <textarea
                                        value={newBio}
                                        onChange={(e) => setNewBio(e.target.value)}
                                        className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        rows="2"
                                    />
                                    <div className="flex gap-2 justify-end sm:justify-start">
                                        <button
                                            onClick={handleBioUpdate}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingBio(false);
                                                setNewBio(bio);
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300 mt-3 text-center sm:text-left">{bio}</p>
                            )}

                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center sm:justify-start">
                                <button 
                                    onClick={() => setShowEditProfileModal(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                >
                                    <FaEdit className="text-xs sm:text-sm" />
                                    <span>Edit Profile</span>
                                </button>
                                <button className="bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                    <FaCog className="text-xs sm:text-sm" />
                                    <span>Settings</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 justify-start">
                        <div className={`flex items-center gap-1 sm:gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}>
                            <span className="text-blue-500">📊</span>
                            <span>{stats.posts} Posts</span>
                        </div>
                        <div className={`flex items-center gap-1 sm:gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}>
                            <span className="text-blue-500">👥</span>
                            <span>{stats.followers} Followers</span>
                        </div>
                        <div className={`flex items-center gap-1 sm:gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}>
                            <span className="text-blue-500">❤️</span>
                            <span>{stats.following} Following</span>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {showEditProfileModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setShowEditProfileModal(false)}
                        >
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ type: "spring", damping: 25 }}
                                className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-4 sm:p-6`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Edit Profile</h2>
                                    <button
                                        onClick={() => setShowEditProfileModal(false)}
                                        className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditProfileSubmit} className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className={`block mb-1 sm:mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={editFormData.username}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block mb-1 sm:mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="realName"
                                            value={editFormData.realName}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block mb-1 sm:mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editFormData.email}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`block mb-1 sm:mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={editFormData.password}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block mb-1 sm:mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={editFormData.confirmPassword}
                                            onChange={handleEditFormChange}
                                            className={`w-full p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>

                                    <div className="pt-3 flex justify-end gap-2 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditProfileModal(false)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-colors text-sm sm:text-base`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm sm:text-base"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Post Section */}
                <div className={`max-w-2xl mx-auto mb-6 sm:mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md`}>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <img
                            src={profilePic}
                            alt={username}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                        />
                        <span className="font-semibold dark:text-white cursor-pointer text-sm sm:text-base">{username}</span>
                    </div>
                    
                    <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className={`w-full p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                        rows="3"
                    ></textarea>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaCalendarAlt className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className={`${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 border-gray-300'} p-1 rounded border cursor-pointer text-xs sm:text-sm`}
                                />
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaClock className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm" />
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{currentTime}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-1 sm:gap-2 self-end">
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                                title="Attach file"
                            >
                                <FaPaperclip className="text-xs sm:text-sm" />
                            </button>
                            <input 
                                type="file" 
                                id="fileInput" 
                                className="hidden" 
                                accept="image/*" 
                                ref={fileInputRef}
                            />
                            
                            {postContent && (
                                <button 
                                    onClick={() => setPostContent("")}
                                    className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                                    title="Clear post"
                                >
                                    <FaTrash className="text-xs sm:text-sm" />
                                </button>
                            )}
                            
                            <button
                                onClick={handleCreatePost}
                                disabled={!postContent.trim()}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium ${postContent.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'} transition-colors cursor-pointer text-sm sm:text-base`}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <section className="max-w-2xl mx-auto px-3 sm:px-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>You haven't posted anything yet.</p>
                            <button 
                                onClick={navigateToMain}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm sm:text-base"
                            >
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5`}
                                >
                                    {/* Post Header */}
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                        <img
                                            src={post.profilePic}
                                            alt={post.username}
                                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                                        />
                                        <span className="font-semibold dark:text-white cursor-pointer text-sm sm:text-base">
                                            {post.username}
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-auto">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Post Content */}
                                    <p className={`mb-3 sm:mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}>{post.content}</p>

                                    {/* Post Image */}
                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt="Post"
                                            className="w-full rounded-lg sm:rounded-xl mb-3 sm:mb-4 cursor-pointer max-h-80 object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}

                                    {/* Post Actions */}
                                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => toggleLike(post.id)}
                                            className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors cursor-pointer text-xs sm:text-sm`}
                                        >
                                            {post.isLiked ? (
                                                <FaHeart />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                            <span>{post.likes}</span>
                                        </button>

                                        <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors cursor-pointer text-xs sm:text-sm`}>
                                            <FaComment />
                                            <span>{post.comments}</span>
                                        </div>

                                        <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors cursor-pointer text-xs sm:text-sm`}>
                                            <FaShare />
                                            <span>{post.shares}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;