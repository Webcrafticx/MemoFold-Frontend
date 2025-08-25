import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaHeart,
    FaRegHeart,
    FaTrashAlt,
    FaBars,
    FaMoon,
    FaSun,
    FaComment,
    FaSignOutAlt,
    FaPaperclip,
    FaTimes,
    FaEllipsisV,
    FaEdit,
    FaSave,
    FaTimesCircle
} from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../../hooks/config";
import imageCompression from 'browser-image-compression';

const MainDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [commentContent, setCommentContent] = useState({});
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const { token, username, realname, logout, user } = useAuth();
    const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "https://ui-avatars.com/api/?name=User&background=random");
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editFiles, setEditFiles] = useState([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const navigate = useNavigate();
    
    // Create refs for dropdowns
    const dropdownRef = useRef(null);
    const commentDropdownRefs = useRef({});
    const quickReactionRef = useRef(null);
    const imagePreviewRef = useRef(null);

    // Add useEffect to handle outside clicks for all dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle main dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            
            // Handle comment dropdowns
            if (activeCommentPostId) {
                const commentDropdown = commentDropdownRefs.current[activeCommentPostId];
                if (commentDropdown && !commentDropdown.contains(event.target)) {
                    setActiveCommentPostId(null);
                }
            }
            
            // Handle quick reaction dropdown
            if (quickReactionRef.current && !quickReactionRef.current.contains(event.target) && 
                activeCommentPostId === "new") {
                setActiveCommentPostId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeCommentPostId]);

    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedMode);
        document.body.classList.toggle("dark", savedMode);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUserProfile(userData);
                    if (userData.profilePic) {
                        setProfilePic(userData.profilePic);
                        localStorage.setItem("profilePic", userData.profilePic);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchPosts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${config.apiUrl}/posts/user/${username}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const data = await response.json();
                const postsWithComments = data.map(post => ({
                    ...post,
                    comments: post.comments || [],
                    commentCount: post.comments ? post.comments.length : 0
                }));
                setPosts(postsWithComments);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching posts:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchUserData();
            fetchPosts();
        } else {
            navigate("/login");
        }
    }, [token, navigate, username]);

    const fetchComments = async (postId) => {
        setIsFetchingComments(true);
        try {
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
            console.error("Error fetching comments:", err);
        } finally {
            setIsFetchingComments(false);
        }
    };

    const handleAddComment = async (postId) => {
        if (!commentContent[postId]?.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        setIsLoading(true);
        try {
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
        } catch (err) {
            setError(err.message);
            console.error("Error adding comment:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikeComment = async (commentId, postId) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}/like`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ 
                        userId: username 
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like comment");
            }

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const updatedComments = post.comments.map(comment => {
                        if (comment._id === commentId) {
                            const isLiked = comment.likes?.includes(username);
                            
                            return {
                                ...comment,
                                likes: isLiked 
                                    ? comment.likes.filter(user => user !== username) 
                                    : [...(comment.likes || []), username] 
                            };
                        }
                        return comment;
                    });
                    
                    return {
                        ...post,
                        comments: updatedComments
                    };
                }
                return post;
            }));
        } catch (err) {
            setError(err.message);
            console.error("Error liking comment:", err);
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        // Find the post to check ownership
        const post = posts.find(p => p._id === postId);
        
        if (!post) {
            setError("Post not found");
            return;
        }
        
        // Find the comment
        const comment = post.comments.find(c => c._id === commentId);
        if (!comment) {
            setError("Comment not found");
            return;
        }
        
        // Debug: log the ownership information
        console.log("Comment owner:", comment.userId.username);
        console.log("Post owner:", post.userId || post.username);
        console.log("Current user:", username);
        
        // Check if current user is either the comment author OR the post owner
        const isCommentOwner = comment.userId.username === username;
        const isPostOwner = post.userId === username || post.username === username;
        
        console.log("Is comment owner:", isCommentOwner);
        console.log("Is post owner:", isPostOwner);
        
        if (!isCommentOwner && !isPostOwner) {
            setError("You don't have permission to delete this comment");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            const response = await fetch(`${config.apiUrl}/posts/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                // Add the postId to the request body to help the backend verify ownership
                body: JSON.stringify({ postId }),
            });

            // Log the response for debugging
            console.log("Delete comment response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Delete comment error response:", errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Failed to delete comment: ${response.status} ${response.statusText}`);
                }
                
                throw new Error(errorData.error || errorData.message || "Failed to delete comment");
            }

            // Show success notification
            toast.success("Comment deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Update the UI by removing the deleted comment
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const updatedComments = post.comments.filter(comment => comment._id !== commentId);
                    return {
                        ...post,
                        comments: updatedComments,
                        commentCount: updatedComments.length
                    };
                }
                return post;
            }));
        } catch (err) {
            setError(err.message);
            console.error("Error deleting comment:", err);
            
            // Show error notification
            toast.error(err.message || "Failed to delete comment. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const toggleCommentDropdown = async (postId) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
            return;
        }
        
        setActiveCommentPostId(postId);
        await fetchComments(postId);
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const validTypes = [
                'image/jpeg', 
                'image/png', 
                'application/pdf',
                'video/mp4',
                'text/plain'
            ];
            return validTypes.includes(file.type);
        });
        
        if (validFiles.length !== files.length) {
            setError("Some files were not accepted. Only images, PDFs, videos and text files are allowed.");
        }
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleEditFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const validTypes = [
                'image/jpeg', 
                'image/png', 
                'application/pdf',
                'video/mp4',
                'text/plain'
            ];
            return validTypes.includes(file.type);
        });
        
        if (validFiles.length !== files.length) {
            setError("Some files were not accepted. Only images, PDFs, videos and text files are allowed.");
        }
        
        setEditFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeEditFile = (index) => {
        setEditFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Today";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const inputDate = new Date(date);
            inputDate.setHours(0, 0, 0, 0);
            
            if (inputDate.getTime() === today.getTime()) {
                return "Today";
            } else if (inputDate.getTime() === yesterday.getTime()) {
                return "Yesterday";
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

    const handlePostSubmit = async () => {
        if (!postContent.trim() && selectedFiles.length === 0) {
            setError("Post content or file cannot be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const postDate = selectedDate ? new Date(selectedDate) : new Date();
            
            if (selectedDate && isNaN(postDate.getTime())) {
                throw new Error("Invalid date selected");
            }

            // Convert only the first file to complete data URL format with compression
            let imageData = null;
            if (selectedFiles.length > 0) {
                const file = selectedFiles[0];
                
                // Compress image before converting to base64
                const options = {
                    maxSizeMB: 1, // Maximum file size in MB
                    maxWidthOrHeight: 1024, // Maximum width or height
                    useWebWorker: true, // Use web worker for faster compression
                };
                
                try {
                    const compressedFile = await imageCompression(file, options);
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(compressedFile);
                    });
                } catch (compressionError) {
                    console.warn("Image compression failed, using original:", compressionError);
                    // Fallback to original file if compression fails
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    });
                }
            }

            const postData = {
                content: postContent,
                createdAt: postDate.toISOString(),
                image: imageData
            };

            const response = await fetch(`${config.apiUrl}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create post");
            }

            const result = await response.json();
            
            const newPost = result.post || result;
            
            setPosts(prevPosts => [{
                ...newPost,
                comments: [],
                commentCount: 0,
                likes: []
            }, ...prevPosts]);
            
            setPostContent("");
            setSelectedFiles([]);
            setSelectedDate("");
            setError(null);
            
            // Show success notification
            toast.success("Post created successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            setError(err.message);
            console.error("Post error:", err);
            
            // Show error notification
            toast.error("Failed to create post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/posts/like/${postId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId: username })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like post");
            }

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    const isLiked = post.likes?.includes(username);
                    
                    return {
                        ...post,
                        likes: isLiked 
                            ? post.likes.filter(user => user !== username) 
                            : [...(post.likes || []), username] 
                    };
                }
                return post;
            }));
        } catch (err) {
            setError(err.message);
            console.error("Error liking post:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            const response = await fetch(`${config.apiUrl}/posts/delete/${postId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete post");
            }

            setPosts(posts.filter((post) => post._id !== postId));
            
            // Show success notification
            toast.success("Post deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            setError(err.message);
            console.error("Error deleting post:", err);
            
            // Show error notification
            toast.error("Failed to delete post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const startEditPost = (postId) => {
        const postToEdit = posts.find(post => post._id === postId);
        if (postToEdit) {
            setEditContent(postToEdit.content);
            setEditingPostId(postId);
            setEditFiles([]);
            setError(null);
        } else {
            setError("Post not found for editing");
        }
    };

    const cancelEditPost = () => {
        setEditingPostId(null);
        setEditContent("");
        setEditFiles([]);
    };

    const handleUpdatePost = async (postId) => {
        if (!editContent.trim() && editFiles.length === 0) {
            setError("Post content or file cannot be empty");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Convert only the first file to complete data URL format with compression
            let imageData = null;
            if (editFiles.length > 0) {
                const file = editFiles[0];
                
                // Compress image before converting to base64
                const options = {
                    maxSizeMB: 1, // Maximum file size in MB
                    maxWidthOrHeight: 1024, // Maximum width or height
                    useWebWorker: true, // Use web worker for faster compression
                };
                
                try {
                    const compressedFile = await imageCompression(file, options);
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(compressedFile);
                    });
                } catch (compressionError) {
                    console.warn("Image compression failed, using original:", compressionError);
                    // Fallback to original file if compression fails
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    });
                }
            }

            const postData = {
                content: editContent,
                ...(imageData && { image: imageData })
            };

            const response = await fetch(`${config.apiUrl}/posts/update/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update post");
            }

            setPosts(posts.map(post => 
                post._id === postId ? { 
                    ...post, 
                    content: editContent,
                    ...(imageData && { image: imageData })
                } : post
            ));
            
            setEditingPostId(null);
            setEditContent("");
            setEditFiles([]);
            setError(null);
            
            // Show success notification
            toast.success("Post updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            setError(err.message);
            console.error("Error updating post:", err);
            
            // Show error notification
            toast.error("Failed to update post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToUserProfile = (userId) => {
        if (userId) {
            if (currentUserProfile && userId === currentUserProfile._id) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
    };

    const quickReactions = [
        { text: "Congrats", emoji: "🎉" },
        { text: "Sorrow", emoji: "😭" },
        { text: "LOL", emoji: "😂" },
        { text: "Love", emoji: "❤️" },
        { text: "Interesting", emoji: "🤔" },
    ];

    const addReaction = (reaction) => {
        setPostContent((prev) =>
            `${prev} ${reaction.text} ${reaction.emoji}`.trim()
        );
        setActiveCommentPostId(null);
    };

    const handleProfileClick = () => {
        navigate("/profile");
        setShowDropdown(false);
    };

    const handleFeedbackClick = () => {
        navigate("/feedback");
        setShowDropdown(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            setError("Failed to logout. Please try again.");
            console.error("Logout error:", err);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎬';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('document')) return '📝';
        if (fileType.includes('presentation')) return '📑';
        return '📁';
    };

    const renderImagePreview = (file, isEdit = false) => {
        if (file.type.startsWith('image/')) {
            return (
                <div className="relative">
                    <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                        onClick={() => {
                            setPreviewImage(URL.createObjectURL(file));
                            setShowImagePreview(true);
                        }}
                    />
                    <button 
                        onClick={() => isEdit ? removeEditFile(editFiles.indexOf(file)) : removeFile(selectedFiles.indexOf(file))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                        <FaTimes />
                    </button>
                </div>
            );
        }
        return (
            <div className={`p-2 rounded-lg flex items-center ${
                darkMode ? "bg-gray-600" : "bg-white"
            }`}>
                <span className="mr-2">
                    {getFileIcon(file.type)}
                </span>
                <span className="text-sm truncate max-w-xs">
                    {file.name}
                </span>
                <button 
                    onClick={() => isEdit ? removeEditFile(editFiles.indexOf(file)) : removeFile(selectedFiles.indexOf(file))}
                    className="ml-2 text-red-500 hover:text-red-700"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    const renderExistingImagePreview = (imageUrl) => {
        return (
            <div className="relative mb-4">
                <img 
                    src={imageUrl} 
                    alt="Post image"
                    className="w-full h-64 object-cover rounded-lg cursor-pointer"
                    onClick={() => {
                        setPreviewImage(imageUrl);
                        setShowImagePreview(true);
                    }}
                />
                <button 
                    onClick={() => {
                        if (window.confirm("Are you sure you want to remove this image?")) {
                            setPosts(posts.map(post => 
                                post._id === editingPostId ? { ...post, image: null } : post
                            ));
                        }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                    title="Remove image"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    // Function to handle image load and get dimensions
    const handleImageLoad = (e) => {
        const img = e.target;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
        });
    };

    // Calculate the appropriate size for the image preview
    const getImagePreviewStyle = () => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        if (imageDimensions.width > maxWidth || imageDimensions.height > maxHeight) {
            const widthRatio = maxWidth / imageDimensions.width;
            const heightRatio = maxHeight / imageDimensions.height;
            const ratio = Math.min(widthRatio, heightRatio);
            
            return {
                width: imageDimensions.width * ratio,
                height: imageDimensions.height * ratio
            };
        }
        
        return {
            width: imageDimensions.width,
            height: imageDimensions.height
        };
    };

    return (
        <div className={`min-h-screen ${
            darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gradient-to-r from-gray-100 to-gray-200"
        }`}>
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

            {error && (
                <div className="fixed top-4 right-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm shadow-lg z-50 cursor-pointer">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700 font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>
            )}

            {showImagePreview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    <div 
                        className="relative max-w-full max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            ref={imagePreviewRef}
                            src={previewImage} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onLoad={handleImageLoad}
                            style={getImagePreviewStyle()}
                        />
                        <button 
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                            onClick={() => setShowImagePreview(false)}
                        >
                            <FaTimes />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                            {imageDimensions.width} × {imageDimensions.height}
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-4">
                <div className={`flex justify-between items-center mb-6 p-4 rounded-xl ${
                    darkMode ? "bg-gray-800" : "bg-white"
                } shadow-md`}>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                            } transition-colors cursor-pointer`}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <FaBars className="text-xl" />
                        </button>
                        {showDropdown && (
                            <div
                                className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ${
                                    darkMode ? "bg-gray-800" : "bg-white"
                                } ring-1 ring-black ring-opacity-5 z-50`}
                            >
                                <div className="py-1">
                                    <span
                                        className={`block px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                        onClick={handleProfileClick}
                                    >
                                        <FaUserCircle className="inline mr-2" />{" "}
                                        Profile
                                    </span>
                                    <div
                                        className={`flex justify-between items-center px-4 py-2 text-sm ${
                                            darkMode
                                                ? "text-gray-200 hover:bg-gray-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        } cursor-pointer`}
                                    >
                                        <div
                            className="flex items-center"
                            onClick={toggleDarkMode}
                        >
                            <FaMoon className="inline mr-2" />{" "}
                            Dark Mode
                        </div>
                        <label
                            className="relative inline-flex items-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={darkMode}
                                onChange={toggleDarkMode}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <span
                        className={`block px-4 py-2 text-sm ${
                            darkMode
                                ? "text-gray-200 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-100"
                        } cursor-pointer`}
                        onClick={handleFeedbackClick}
                    >
                           < FaComment className="inline mr-2" />{" "}
                        Feedback
                    </span>
                </div>
            </div>
        )}
    </div>

    <div className="flex items-center space-x-4">
        <button
            className={`p-2 rounded-full ${
                darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
            } shadow-md transition-all hover:scale-110 cursor-pointer`}
            title="Home"
            onClick={handleLogout}
        >
            <FaSignOutAlt className="text-xl" />
        </button>

        <input
            type="date"
            className={`px-3 py-1 rounded-lg text-sm border cursor-pointer ${
                darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
            } cursor-pointer`}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min="1950-01-01"
            max="2025-12-31"
        />

        <button
            className={`p-2 rounded-full ${
                darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
            } shadow-md cursor-pointer`}
            title="Main Feed"
            onClick={() => navigate("/feed")}
        >
            <span className="text-xl">📰</span>
        </button>
    </div>
</div>

<div className="max-w-2xl mx-auto">
    <div className={`mb-6 p-4 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
    } shadow-md`}>
        <div className="flex items-center gap-3 mb-3">
            <img
                src={profilePic}
                alt={username}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
                }}
                onClick={() => navigateToUserProfile(currentUserProfile?._id)}
            />
            <span 
                className="font-semibold dark:text-white cursor-pointer"
                onClick={() => navigateToUserProfile(currentUserProfile?._id)}
            >
                {realname || username}
            </span>
        </div>
        
        <textarea
            className={`w-full p-4 rounded-xl border ${
                darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none cursor-text`}
            placeholder={`What's on your mind, ${realname || username}?`}
            rows="4"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            maxLength="5000"
        />
        
        {selectedFiles.length > 0 && (
            <div className={`mt-3 p-3 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}>
                <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                        <div key={index}>
                            {renderImagePreview(file)}
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-3">
                <label className={`p-2 rounded-xl ${
                    darkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                } shadow-md transition-all cursor-pointer`}>
                    <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        onChange={handleFileSelect}
                        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    />
                    <FaPaperclip className="text-xl" />
                </label>
                <div className="relative" ref={quickReactionRef}>
                    <button
                        className={`p-2 rounded-xl ${
                            darkMode
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                        } shadow-md transition-all cursor-pointer`}
                        onClick={() =>
                            setActiveCommentPostId(
                                activeCommentPostId === "new"
                                    ? null
                                    : "new"
                            )
                        }
                    >
                        <span className="text-xl">💬</span>
                    </button>
                    {activeCommentPostId === "new" && (
                        <div
                            className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg ${
                                darkMode
                                    ? "bg-gray-800"
                                    : "bg-white"
                            } ring-1 ring-black ring-opacity-5 z-50`}
                        >
                            <div className="py-1">
                                {quickReactions.map(
                                    (reaction, index) => (
                                        <span
                                            key={index}
                                            className={`block px-4 py-2 text-sm ${
                                                darkMode
                                                    ? "text-gray-200 hover:bg-gray-700"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            } cursor-pointer`}
                                            onClick={() => addReaction(reaction)}
                                        >
                                            {
                                                reaction.text
                                            }{" "}
                                            {
                                                reaction.emoji
                                            }
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {(postContent || selectedFiles.length > 0) && (
                    <button
                        className={`p-2 rounded-xl ${
                            darkMode
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                        } shadow-md transition-all cursor-pointer`}
                        title="Clear"
                        onClick={() => {
                            if (
                                window.confirm(
                                    "Delete this draft?"
                                )
                            ) {
                                setPostContent("");
                                setSelectedFiles([]);
                            }
                        }}
                    >
                        <span className="text-xl">🗑</span>
                    </button>
                )}
            </div>

            <div className="flex items-center space-x-4">
                <span className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                    {postContent.length}/5000 characters
                </span>
                <button
                    className={`px-4 py-2 rounded-lg ${
                        (!postContent.trim() && selectedFiles.length === 0) || isLoading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white font-medium transition-all cursor-pointer`}
                    onClick={handlePostSubmit}
                    disabled={(!postContent.trim() && selectedFiles.length === 0) || isLoading}
                >
                    {isLoading ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        "Post"
                    )}
                </button>
            </div>
        </div>
    </div>

    {isLoading && posts.length === 0 ? (
        <div className="text-center py-10">
            <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Loading posts...</p>
        </div>
    ) : posts.length === 0 ? (
        <div
            className={`p-4 rounded-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
            } shadow-md text-center`}
        >
            <p>
                No posts yet. Be the first to share something!
            </p>
        </div>
    ) : (
        <div className="space-y-4">
            {posts.map((post) => (
                <div
                    key={post._id}
                    className={`p-4 rounded-xl ${
                        darkMode ? "bg-gray-800" : "bg-white"
                    } shadow-md`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                            <img
                                src={profilePic}
                                alt={username}
                                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
                                }}
                                onClick={() => navigateToUserProfile(currentUserProfile?._id)}
                            />
                            <div>
                                <h3 
                                    className="font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => navigateToUserProfile(currentUserProfile?._id)}
                                >
                                    {realname || username}
                                </h3>
                                <p className={`text-xs ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                    {formatDate(post.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                                onClick={() => startEditPost(post._id)}
                                title="Edit post"
                            >
                                <FaEdit />
                            </button>
                            <button
                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                onClick={() => handleDeletePost(post._id)}
                                title="Delete post"
                            >
                                <FaTrashAlt />
                            </button>
                        </div>
                    </div>

                    {editingPostId === post._id ? (
                        <div className="mb-4">
                            <textarea
                                className={`w-full p-3 rounded-lg border ${
                                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none cursor-text`}
                                rows="3"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                maxLength="5000"
                            />
                            
                            {post.image && (
                                renderExistingImagePreview(post.image)
                            )}
                            
                            {editFiles.length > 0 && (
                                <div className={`mt-3 p-3 rounded-lg ${
                                    darkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}>
                                    <div className="flex flex-wrap gap-2">
                                        {editFiles.map((file, index) => (
                                            <div key={index}>
                                                {renderImagePreview(file, true)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center mt-3">
                                <label className={`p-2 rounded-xl ${
                                    darkMode
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                                } shadow-md transition-all cursor-pointer mr-2`}>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleEditFileSelect}
                                        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                    />
                                    <FaPaperclip className="text-xl" />
                                </label>
                                
                                <div className="flex justify-end space-x-2 flex-1">
                                    <button
                                        className={`px-3 py-1 rounded-lg text-sm ${
                                            darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
                                        } transition-colors cursor-pointer`}
                                        onClick={cancelEditPost}
                                    >
                                        <FaTimesCircle className="inline mr-1" /> Cancel
                                    </button>
                                    <button
                                        className={`px-3 py-1 rounded-lg text-sm ${
                                            (!editContent.trim() && editFiles.length === 0) || isLoading
                                                ? "bg-blue-300 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600"
                                        } text-white transition-colors cursor-pointer`}
                                        onClick={() => handleUpdatePost(post._id)}
                                        disabled={(!editContent.trim() && editFiles.length === 0) || isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <FaSave className="inline mr-1" /> Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 whitespace-pre-line">
                                {post.content}
                            </p>
                            
                            {post.image && post.image !== "" && (
                                <div className="mb-4">
                                    <img 
                                        src={post.image} 
                                        alt="Post image"
                                        className="w-full h-64 object-cover rounded-lg cursor-pointer"
                                        onClick={() => {
                                            setPreviewImage(post.image);
                                            setShowImagePreview(true);
                                        }}
                                        onError={(e) => {
                                            if (post.image && post.image.startsWith('blob:')) {
                                                e.target.style.display = 'none';
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-between items-center border-t  py-2 my-2 border-gray-200 dark:border-gray-700">
                        <button
                            className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                            onClick={() => handleLikePost(post._id)}
                        >
                            {post.likes?.includes(username) ? (
                                <FaHeart className="text-red-500" />
                            ) : (
                                <FaRegHeart />
                            )}
                            <span className="text-sm">
                                {post.likes?.length || 0}
                            </span>
                        </button>

                        <button
                            className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                            onClick={() => toggleCommentDropdown(post._id)}
                            disabled={isFetchingComments}
                        >
                               < FaComment />
                            <span className="text-sm">
                                {post.commentCount || post.comments?.length || 0}
                            </span>
                        </button>
                    </div>

                    {activeCommentPostId === post._id && (
                        <div 
                            className="mt-4"
                            ref={el => commentDropdownRefs.current[post._id] = el}
                        >
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
                                                        src={comment.userId.profilePic}
                                                        alt={comment.userId.realname}
                                                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 cursor-pointer"
                                                        onError={(e) => {
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId.realname)}&background=random`;
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
                                                                {comment.userId.realname}
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
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <button
                                                                className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                                                onClick={() => handleLikeComment(comment._id, post._id)}
                                                            >
                                                                {comment.likes?.includes(username) ? (
                                                                    <FaHeart className="text-red-500 text-xs" />
                                                                ) : (
                                                                    <FaRegHeart className="text-xs" />
                                                                )}
                                                                <span className="text-xs">
                                                                    {comment.likes?.length || 0}
                                                                </span>
                                                            </button>
                                                            {/* Allow post owner OR comment owner to delete */}
                                                            {(comment.userId.username === username || post.userId === username || post.username === username) && (
                                                                <button
                                                                    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                                                    onClick={() => handleDeleteComment(comment._id, post._id)}
                                                                    title="Delete comment"
                                                                >
                                                                    <FaTrashAlt />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            No comments yet. Be the first to comment!
                                        </div>
                                    )}

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
                                                    !commentContent[post._id]?.trim() || isLoading
                                                        ? "bg-blue-300 cursor-not-allowed"
                                                        : "bg-blue-500 hover:bg-blue-600"
                                                } text-white transition-colors`}
                                                onClick={() => handleAddComment(post._id)}
                                                disabled={!commentContent[post._id]?.trim() || isLoading}
                                            >
                                                {isLoading ? (
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
</div>
</div>
</div>
);
};

export default MainDashboard;