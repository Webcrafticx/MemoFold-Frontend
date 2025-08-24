import React, { useState, useEffect, useRef } from "react";
import {
  FaPlusCircle,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaUserCircle,
  FaPaperclip,
  FaMoon,
  FaSun,
  FaTimes,
  FaArrowLeft,
  FaBars,
  FaTrashAlt,
  FaEdit
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
import config from "../../hooks/config";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  // State management
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || 
    "https://ui-avatars.com/api/?name=User&background=random"
  );
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [updatingBio, setUpdatingBio] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  
  // Comment-related states
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentContent, setCommentContent] = useState({});
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profilePicInputRef = useRef(null);

  // Navigation
  const navigate = useNavigate();

  // Initialize component
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = () => {
    // Theme setup
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) setDarkMode(savedTheme === "true");
    
    // User data
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRealname = localStorage.getItem("realname");

    setUsername(storedUsername || "");
    setRealName(storedRealname || "");

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUserData(token),
          fetchUserPosts(token, storedUsername),
          fetchCurrentUserData(token)
        ]);
        
        // Fetch bio
        const bioText = await fetchBio(token);
        setBio(bioText === null ? "" : bioText);
        setNewBio(bioText === null ? "" : bioText);
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Failed to load profile data");
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setSelectedDate(new Date().toISOString().split("T")[0]);

    // Event listeners
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  };

  // Fetch current user data
  const fetchCurrentUserData = async (token) => {
    try {
      const response = await fetch(`${config.apiUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserProfile(userData);
      }
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId) => {
    if (userId) {
      if (currentUserProfile && userId === currentUserProfile._id) {
        navigate("/profile");
      } else {
        navigate(`/user/${userId}`);
      }
    }
  };

  // Fetch bio from API
  const fetchBio = async (token) => {
    try {
      const response = await fetch(`${config.apiUrl}/profile/description`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Bio API error:", data);
        throw new Error(data.message || "Failed to fetch bio");
      }

      if (!data || data.description === null) {
        return null;
      }

      return data.description;
    } catch (error) {
      console.error("Error fetching bio:", error);
      return null;
    }
  };

  // Update bio on server
  const updateBio = async (description) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = { description };

      const response = await fetch(`${config.apiUrl}/profile/description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Update bio error:", data);
        throw new Error(data.message || "Failed to update bio");
      }

      return data.description;
    } catch (error) {
      console.error("Error updating bio:", error);
      throw error;
    }
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    if (!newBio.trim()) {
      setError("Bio cannot be empty");
      toast.error("Bio cannot be empty");
      return;
    }

    try {
      setUpdatingBio(true);
      const updatedBio = await updateBio(newBio);

      setBio(updatedBio || "");
      setNewBio(updatedBio || "");
      setEditingBio(false);
      setError(null);
      toast.success("Bio updated successfully!");
    } catch (error) {
      console.error("Bio update failed:", error);
      setError(error.message || "Failed to update bio");
      toast.error(error.message || "Failed to update bio");
    } finally {
      setUpdatingBio(false);
    }
  };

  // Fetch user data
  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${config.apiUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.profilePic) {
          setProfilePic(userData.profilePic);
          localStorage.setItem("profilePic", userData.profilePic);
        }
        setStats({
          posts: userData.postCount || 0,
          followers: userData.followerCount || 0,
          following: userData.followingCount || 0,
        });
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (token, username) => {
    try {
      const response = await fetch(`${config.apiUrl}/posts/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const postsData = await response.json();
        const postsWithComments = postsData.reverse().map((post) => ({
          ...post,
          isLiked: post.likedByUser || false,
          likes: post.likesCount || 0,
          comments: post.comments || [],
          commentCount: post.commentsCount || 0,
          profilePic: profilePic,
          username: username,
        }));
        setPosts(postsWithComments);
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    setIsFetchingComments(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const responseData = await response.json();
      const comments = responseData.comments || [];
      
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, comments, commentCount: comments.length } : post
      ));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Error fetching comments:", err);
    } finally {
      setIsFetchingComments(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId) => {
    if (!commentContent[postId]?.trim()) {
      setError("Comment cannot be empty");
      toast.error("Comment cannot be empty");
      return;
    }

    setIsAddingComment(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          content: commentContent[postId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add comment");
      }

      await fetchComments(postId);
      
      setCommentContent(prev => ({ ...prev, [postId]: "" }));
      setError(null);
      toast.success("Comment added successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Error adding comment:", err);
    } finally {
      setIsAddingComment(false);
    }
  };

  // Toggle comment section for a post
  const toggleCommentDropdown = async (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    
    setActiveCommentPostId(postId);
    await fetchComments(postId);
  };

  // Handle profile picture upload
  const handleProfilePicUpload = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Please upload a valid image (JPEG, PNG, GIF)');
      toast.error('Please upload a valid image (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingProfilePic(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await fetch(`${config.apiUrl}/user/upload-profile-pic`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.profilePicUrl || data.imagePath;
        setProfilePic(imageUrl);
        localStorage.setItem("profilePic", imageUrl);
        toast.success("Profile picture updated successfully!");
      } else {
        throw new Error("Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Handle file changes for posts
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Please upload a valid image (JPEG, PNG, GIF)');
      toast.error('Please upload a valid image (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => setFilePreview(event.target.result);
    reader.readAsDataURL(file);
  };

  // Remove attached file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) {
      setError("Post content or image cannot be empty");
      toast.error("Post content or image cannot be empty");
      return;
    }

    // Validate date is not in the future
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today for comparison
    
    if (selectedDateObj > today) {
      setError("Cannot create posts with future dates");
      toast.error("Cannot create posts with future dates");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Format the date properly for the API - use the selected date
      const formattedDate = selectedDate 
        ? new Date(selectedDate + 'T12:00:00').toISOString() 
        : new Date().toISOString();
      
      const response = await fetch(`${config.apiUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: postContent,
          createdAt: formattedDate,
          date: formattedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const result = await response.json();
      
      // Create a new post object with the selected date, not current date
      const newPost = {
        _id: result._id || Date.now().toString(),
        content: postContent,
        createdAt: formattedDate,
        isLiked: false,
        likes: 0,
        comments: [],
        commentCount: 0,
        profilePic: profilePic,
        username: username,
        image: filePreview || null,
        userId: {
          _id: localStorage.getItem("userId"),
          username: username,
          profilePic: profilePic
        }
      };

      // Update the posts state immediately
      setPosts([newPost, ...posts]);
      setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
      setPostContent("");
      removeFile();
      setError(null);
      
      // Reset the date to today after posting
      setSelectedDate(new Date().toISOString().split("T")[0]);
      
      // Show success message
      toast.success("Post created successfully!");
      
      // Refetch posts to ensure we have the latest data from server
      fetchUserPosts(token, username);
    } catch (error) {
      console.error("Post error:", error);
      setError(error.message || "Failed to create post");
      toast.error(error.message || "Failed to create post");
    }
  };

  // Handle click outside mobile menu
  const handleClickOutside = (e) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
      setShowMobileMenu(false);
    }
  };

  // Toggle like on post
  const toggleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/posts/like/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const currentLikes = parseInt(post.likes) || 0;
            const newLikedState = !post.isLiked;
            
            // Show toast notification
            if (newLikedState) {
              toast.success("Post liked!");
            } else {
              toast.info("Post unliked");
            }
            
            return {
              ...post,
              isLiked: newLikedState,
              likes: post.isLiked ? currentLikes - 1 : currentLikes + 1,
            };
          }
          return post;
        }));
      } else {
        throw new Error("Failed to like post");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.info("Logged out successfully");
  };

  // Navigation functions
  const navigateToMain = () => {
    navigate("/dashboard");
  };

  const goBack = () => {
    navigate(-1);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return "Just now";
      }
      
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  // Theme handling
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.className = darkMode ? "bg-gray-900" : "bg-gradient-to-r from-gray-100 to-gray-300";
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-gray-100" : "text-gray-800"
    }`}>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
      
      {/* Navigation Bar */}
      <nav className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-b shadow-md px-4 sm:px-6 py-3 sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={goBack}
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors cursor-pointer`}
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
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors cursor-pointer`}
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
            aria-label="Toggle menu"
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
          className={`md:hidden fixed top-16 right-4 z-50 w-48 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-xl border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
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
              className={`flex items-center gap-2 p-2 rounded-lg ${
                darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
              } justify-center`}
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm shadow-lg z-50 cursor-pointer"
          onClick={() => setError(null)}
        >
          <div className="flex items-center">
            <span>{error}</span>
            <button className="ml-2 text-red-700 font-bold">
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={`pt-4 sm:pt-6 pb-12 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-r from-gray-100 to-gray-300"
      }`}>
        {/* Profile Section */}
        <div className={`max-w-4xl mx-auto mb-6 sm:mb-8 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border rounded-xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 transition-all hover:shadow-2xl`}>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative group self-center sm:self-auto">
              <input
                type="file"
                id="profilePicUpload"
                ref={profilePicInputRef}
                onChange={(e) => handleProfilePicUpload(e.target.files[0])}
                className="hidden"
                accept="image/*"
              />
              <label
                htmlFor="profilePicUpload"
                className="cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className={`w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-blue-400 hover:scale-105 transition-transform ${
                      uploadingProfilePic ? "opacity-50" : ""
                    }`}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
                    }}
                  />
                  {uploadingProfilePic && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 sm:p-2 rounded-full group-hover:bg-blue-600 transition-colors">
                  <FaPlusCircle className="text-sm sm:text-base" />
                </div>
              </label>
            </div>

            <div className="flex-1 w-full">
              <div className="text-center sm:text-left w-full">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold dark:text-white break-all">
                  {username}
                </h2>
                <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-300 mt-1">
                  {realName}
                </p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                {editingBio ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className={`w-full p-2 rounded-lg ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows="2"
                      maxLength="200"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <button
                        onClick={handleBioUpdate}
                        disabled={updatingBio}
                        className={`px-3 py-1 rounded-lg font-medium ${
                          updatingBio ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
                        } text-white transition-colors`}
                      >
                        {updatingBio ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBio(false);
                          setNewBio(bio);
                        }}
                        className="px-3 py-1 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left flex-1">
                      {bio || "No bio yet. Click the edit button to add one."}
                    </p>
                    <button
                      onClick={() => setEditingBio(!editingBio)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                      aria-label="Edit bio"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center sm:justify-start">
                <div className={`flex items-center gap-1 sm:gap-2 ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                } px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}>
                  <span className="text-blue-500">📊</span>
                  <span>{posts.length} Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className={`max-w-2xl mx-auto mb-6 sm:mb-8 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md`}>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <img
              src={profilePic}
              alt={username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
              }}
              onClick={() => navigateToUserProfile(currentUserProfile?._id)}
            />
            <span 
              className="font-semibold dark:text-white cursor-pointer hover:text-blue-500 text-sm sm:text-base"
              onClick={() => navigateToUserProfile(currentUserProfile?._id)}
            >
              {username}
            </span>
          </div>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className={`w-full p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 ${
              darkMode
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-gray-100 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
            rows="3"
          ></textarea>

          {filePreview && (
            <div className="relative mb-3">
              <img
                src={filePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-100 border-gray-300"
                  } p-1 rounded border cursor-pointer text-xs sm:text-sm`}
                />
                {selectedDate && selectedDate !== new Date().toISOString().split('T')[0] && (
                  <span className="text-xs text-blue-500">
                    Posting for: {new Date(selectedDate).toLocaleDateString()}
                  </span>
                )}
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
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              <button
                onClick={handleCreatePost}
                disabled={!postContent.trim() && !filePreview}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium ${
                  (postContent.trim() || filePreview)
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                } transition-colors cursor-pointer text-sm sm:text-base`}
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
            </div>
          ) : posts.length === 0 ? (
            <div className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
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
                  key={post._id}
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5`}
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <img
                      src={post.profilePic}
                      alt={post.username}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=random`;
                      }}
                      onClick={() => navigateToUserProfile(post.userId?._id)}
                    />
                    <span 
                      className="font-semibold dark:text-white cursor-pointer hover:text-blue-500 text-sm sm:text-base"
                      onClick={() => navigateToUserProfile(post.userId?._id)}
                    >
                      {post.username}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className={`mb-3 sm:mb-4 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } text-sm sm:text-base`}>
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full rounded-lg sm:rounded-xl mb-3 sm:mb-4 cursor-pointer max-h-80 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}

                  {/* Post Actions */}
                  <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleLike(post._id)}
                      className={`flex items-center gap-1 ${
                        post.isLiked
                          ? "text-red-500 hover:text-red-600"
                          : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      } transition-colors cursor-pointer text-xs sm:text-sm`}
                    >
                      {post.isLiked ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span>{parseInt(post.likes) || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleCommentDropdown(post._id)}
                      disabled={isFetchingComments}
                      className={`flex items-center gap-1 ${
                        darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      } transition-colors cursor-pointer text-xs sm:text-sm`}
                    >
                      <FaComment />
                      <span>{post.commentCount || post.comments?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPostId === post._id && (
                    <div className="mt-4">
                      {isFetchingComments ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm mt-2">Loading comments...</p>
                        </div>
                      ) : (
                        <>
                          {post.comments && post.comments.length > 0 ? (
                            <div className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${
                              darkMode ? "bg-gray-700" : "bg-gray-100"
                            }`}>
                              {post.comments.map((comment) => (
                                <div key={comment._id} className="flex items-start space-x-2">
                                  <img
                                    src={comment.userId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.realname || 'User')}&background=random`}
                                    alt={comment.userId?.realname}
                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                                    onError={(e) => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.realname || 'User')}&background=random`;
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateToUserProfile(comment.userId?._id);
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span 
                                        className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigateToUserProfile(comment.userId?._id);
                                        }}
                                      >
                                        {comment.userId?.realname || comment.userId?.username || 'Unknown User'}
                                      </span>
                                      <span className={`text-xs ${
                                        darkMode ? "text-gray-400" : "text-gray-500"
                                      }`}>
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-line mt-1">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              No comments yet. Be the first to comment!
                            </div>
                          )}

                          {/* Add Comment Input */}
                          <div className="flex items-center space-x-2">
                            <img
                              src={profilePic}
                              alt={username}
                              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                              onClick={() => navigateToUserProfile(currentUserProfile?._id)}
                            />
                            <div className="flex-1 flex space-x-2">
                              <input
                                type="text"
                                className={`flex-1 px-3 py-2 rounded-full text-sm border ${
                                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                placeholder="Write a comment..."
                                value={commentContent[post._id] || ""}
                                onChange={(e) => 
                                  setCommentContent({
                                    ...commentContent,
                                    [post._id]: e.target.value
                                  })
                                }
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(post._id);
                                  }
                                }}
                              />
                              <button
                                className={`px-3 py-1 rounded-full text-sm ${
                                  !commentContent[post._id]?.trim() || isAddingComment
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                } text-white transition-colors`}
                                onClick={() => handleAddComment(post._id)}
                                disabled={!commentContent[post._id]?.trim() || isAddingComment}
                              >
                                {isAddingComment ? (
                                  <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  "Post"
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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