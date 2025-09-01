import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import {
    FaUserCircle,
    FaHeart,
    FaRegHeart,
    FaTrashAlt,
    FaComment,
    FaPaperclip,
    FaTimes,
    FaEllipsisV,
    FaEdit,
    FaSave,
    FaTimesCircle,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../hooks/config";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import Navbar from "../navbar";

const MainDashboard = () => {
    const [postContent, setPostContent] = useState("");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [commentContent, setCommentContent] = useState({});
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const { token, username, realname, logout, user } = useAuth();
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic") ||
            "https://ui-avatars.com/api/?name=User&background=random"
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editFiles, setEditFiles] = useState([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });

    // Floating hearts state
    const [floatingHearts, setFloatingHearts] = useState([]);

    const navigate = useNavigate();

    // Helper functions to manage localStorage likes
    const getStoredLikes = () => {
        try {
            return JSON.parse(localStorage.getItem("postLikes") || "{}");
        } catch (error) {
            console.error("Error parsing stored likes:", error);
            return {};
        }
    };

    const updateStoredLikes = (postId, likes) => {
        const storedLikes = getStoredLikes();
        storedLikes[postId] = likes;
        localStorage.setItem("postLikes", JSON.stringify(storedLikes));
    };

    // Add these helper functions near the post like functions
    const getStoredCommentLikes = () => {
        try {
            return JSON.parse(localStorage.getItem("commentLikes") || "{}");
        } catch (error) {
            console.error("Error parsing stored comment likes:", error);
            return {};
        }
    };

    const updateStoredCommentLikes = (commentId, likes) => {
        const storedCommentLikes = getStoredCommentLikes();
        storedCommentLikes[commentId] = likes;
        localStorage.setItem(
            "commentLikes",
            JSON.stringify(storedCommentLikes)
        );
    };

    // Floating Hearts Animation Component
    const FloatingHearts = () => (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {floatingHearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute text-red-500 text-xl pointer-events-none"
                    initial={{
                        x: heart.x,
                        y: heart.y,
                        scale: 0,
                        opacity: 1,
                    }}
                    animate={{
                        y: heart.y - 100,
                        scale: [0, 1.2, 1],
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                    onAnimationComplete={() => {
                        setFloatingHearts((hearts) =>
                            hearts.filter((h) => h.id !== heart.id)
                        );
                    }}
                >
                    ❤️
                </motion.div>
            ))}
        </div>
    );

    // Create refs for dropdowns
    const commentDropdownRefs = useRef({});
    const quickReactionRef = useRef(null);
    const imagePreviewRef = useRef(null);

    // Add useEffect to handle outside clicks for all dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle comment dropdowns
            if (activeCommentPostId) {
                const commentDropdown =
                    commentDropdownRefs.current[activeCommentPostId];
                if (
                    commentDropdown &&
                    !commentDropdown.contains(event.target)
                ) {
                    setActiveCommentPostId(null);
                }
            }

            // Handle quick reaction dropdown
            if (
                quickReactionRef.current &&
                !quickReactionRef.current.contains(event.target) &&
                activeCommentPostId === "new"
            ) {
                setActiveCommentPostId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeCommentPostId]);

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

                // Get stored likes from localStorage
                const storedLikes = getStoredLikes();

                const postsWithComments = data.map((post) => {
                    // Get likes from storage or API
                    const postLikes = storedLikes[post._id] || post.likes || [];

                    // Check if current user has liked this post (handles both user ID and username)
                    const hasUserLiked =
                        postLikes.includes(user._id) ||
                        postLikes.includes(username);

                    return {
                        ...post,
                        comments: post.comments || [],
                        commentCount: post.comments ? post.comments.length : 0,
                        likes: postLikes,
                        hasUserLiked: hasUserLiked,
                    };
                });

                setPosts(postsWithComments);

                // Update localStorage with current likes (preserve both formats)
                const likesByPost = {};
                data.forEach((post) => {
                    const storedPostLikes =
                        storedLikes[post._id] || post.likes || [];

                    // Keep all existing likes (both user IDs and usernames)
                    likesByPost[post._id] = storedPostLikes;
                });

                localStorage.setItem("postLikes", JSON.stringify(likesByPost));
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
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            const responseData = await response.json();
            const comments = responseData.comments || [];

            // Get stored comment likes from localStorage
            const storedCommentLikes = getStoredCommentLikes();

            const commentsWithLikes = comments.map((comment) => {
                // Get likes from storage or API
                const commentLikes =
                    storedCommentLikes[comment._id] || comment.likes || [];

                // Check if current user has liked this comment
                const hasUserLiked = commentLikes.includes(user._id);

                return {
                    ...comment,
                    likes: commentLikes,
                    hasUserLiked: hasUserLiked,
                };
            });

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: commentsWithLikes,
                              commentCount: commentsWithLikes.length,
                          }
                        : post
                )
            );

            // Update localStorage with current comment likes
            const likesByComment = {};
            comments.forEach((comment) => {
                likesByComment[comment._id] =
                    storedCommentLikes[comment._id] || comment.likes || [];
            });

            localStorage.setItem(
                "commentLikes",
                JSON.stringify(likesByComment)
            );
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
            const response = await fetch(
                `${config.apiUrl}/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        postId: postId,
                        content: commentContent[postId],
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add comment");
            }

            await fetchComments(postId);

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
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
            // Optimistic UI update
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments.map((comment) => {
                            if (comment._id === commentId) {
                                const isLiked = comment.hasUserLiked;
                                let updatedLikes;

                                if (isLiked) {
                                    // Remove user ID
                                    updatedLikes = comment.likes.filter(
                                        (likeUserId) => likeUserId !== user._id
                                    );
                                } else {
                                    // Add user ID
                                    updatedLikes = [
                                        ...(comment.likes || []),
                                        user._id,
                                    ];
                                }

                                // Update localStorage
                                updateStoredCommentLikes(
                                    commentId,
                                    updatedLikes
                                );

                                return {
                                    ...comment,
                                    likes: updatedLikes,
                                    hasUserLiked: !isLiked,
                                };
                            }
                            return comment;
                        });

                        return {
                            ...post,
                            comments: updatedComments,
                        };
                    }
                    return post;
                })
            );

            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}/like`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: user._id,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like comment");
            }

            // Refresh comments to ensure sync with server
            await fetchComments(postId);
        } catch (err) {
            setError(err.message);
            console.error("Error liking comment:", err);

            // Revert optimistic update on error
            await fetchComments(postId);
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        // Find the post to check ownership
        const post = posts.find((p) => p._id === postId);

        if (!post) {
            setError("Post not found");
            return;
        }

        // Find the comment
        const comment = post.comments.find((c) => c._id === commentId);
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
        const isPostOwner =
            post.userId === username || post.username === username;

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
            const response = await fetch(
                `${config.apiUrl}/posts/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    // Add the postId to the request body to help the backend verify ownership
                    body: JSON.stringify({ postId }),
                }
            );

            // Log the response for debugging
            console.log("Delete comment response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Delete comment error response:", errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(
                        `Failed to delete comment: ${response.status} ${response.statusText}`
                    );
                }

                throw new Error(
                    errorData.error ||
                        errorData.message ||
                        "Failed to delete comment"
                );
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
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments.filter(
                            (comment) => comment._id !== commentId
                        );
                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: updatedComments.length,
                        };
                    }
                    return post;
                })
            );
        } catch (err) {
            setError(err.message);
            console.error("Error deleting comment:", err);

            // Show error notification
            toast.error(
                err.message || "Failed to delete comment. Please try again.",
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
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

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "application/pdf",
                "video/mp4",
                "text/plain",
            ];
            return validTypes.includes(file.type);
        });

        if (validFiles.length !== files.length) {
            setError(
                "Some files were not accepted. Only images, PDFs, videos and text files are allowed."
            );
        }

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    };

    const handleEditFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "application/pdf",
                "video/mp4",
                "text/plain",
            ];
            return validTypes.includes(file.type);
        });

        if (validFiles.length !== files.length) {
            setError(
                "Some files were not accepted. Only images, PDFs, videos and text files are allowed."
            );
        }

        setEditFiles((prev) => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeEditFile = (index) => {
        setEditFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatDate = (dateString) => {
        try {
            // Convert UTC string to IST date
            const utcDate = new Date(dateString);
            const istDate = new Date(
                utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            );

            if (isNaN(istDate.getTime())) {
                return "Just now";
            }

            // Current IST time
            const now = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            );

            const diffInSeconds = Math.floor((now - istDate) / 1000);

            // Handle future dates
            if (diffInSeconds < 0) {
                return "Just now";
            }

            if (diffInSeconds < 10) {
                return "Just now";
            }
            if (diffInSeconds < 60) {
                return `${diffInSeconds}s ago`;
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes}m ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours}h ago`;
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days}d ago`;
            } else {
                return istDate.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            }
        } catch (e) {
            return "Just now";
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
            const postDate = new Date();

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
                    const compressedFile = await imageCompression(
                        file,
                        options
                    );
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(compressedFile);
                    });
                } catch (compressionError) {
                    console.warn(
                        "Image compression failed, using original:",
                        compressionError
                    );
                    // Fallback to original file if compression fails
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                }
            }

            const postData = {
                content: postContent,
                createdAt: postDate.toISOString(),
                image: imageData,
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

            setPosts((prevPosts) => [
                {
                    ...newPost,
                    comments: [],
                    commentCount: 0,
                    likes: [],
                },
                ...prevPosts,
            ]);

            setPostContent("");
            setSelectedFiles([]);
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

    const handleLikePost = async (postId, event) => {
        try {
            const response = await fetch(
                `${config.apiUrl}/posts/like/${postId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId: user._id }), // Send user ID to API
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to like post");
            }

            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const isLiked = post.hasUserLiked;
                        let updatedLikes;

                        if (isLiked) {
                            // Remove both user ID and username
                            updatedLikes = post.likes.filter(
                                (like) => like !== user._id && like !== username
                            );
                        } else {
                            // Add both user ID and username for compatibility
                            updatedLikes = [
                                ...post.likes,
                                user._id, // Store user ID
                                // username, // Store username for backward compatibility
                            ];

                            // Add floating hearts animation when liking
                            if (event) {
                                const rect =
                                    event.target.getBoundingClientRect();
                                const heartCount = 5; // Number of hearts to show

                                for (let i = 0; i < heartCount; i++) {
                                    setTimeout(() => {
                                        setFloatingHearts((hearts) => [
                                            ...hearts,
                                            {
                                                id: Date.now() + i,
                                                x: rect.left + rect.width / 2,
                                                y: rect.top + rect.height / 2,
                                            },
                                        ]);
                                    }, i * 100); // Stagger the hearts
                                }
                            }
                        }

                        // Update localStorage with both formats
                        updateStoredLikes(postId, updatedLikes);

                        return {
                            ...post,
                            likes: updatedLikes,
                            hasUserLiked: !isLiked,
                        };
                    }
                    return post;
                })
            );
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
            const response = await fetch(
                `${config.apiUrl}/posts/delete/${postId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete post");
            }

            setPosts(posts.filter((post) => post._id !== postId));

            // Remove post likes from localStorage when post is deleted
            const storedLikes = getStoredLikes();
            delete storedLikes[postId];
            localStorage.setItem("postLikes", JSON.stringify(storedLikes));

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
        const postToEdit = posts.find((post) => post._id === postId);
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
                    const compressedFile = await imageCompression(
                        file,
                        options
                    );
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(compressedFile);
                    });
                } catch (compressionError) {
                    console.warn(
                        "Image compression failed, using original:",
                        compressionError
                    );
                    // Fallback to original file if compression fails
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const dataURL = reader.result;
                            resolve(dataURL);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                }
            }

            const postData = {
                content: editContent,
                ...(imageData && { image: imageData }),
            };

            const response = await fetch(
                `${config.apiUrl}/posts/update/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(postData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update post");
            }

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              content: editContent,
                              ...(imageData && { image: imageData }),
                          }
                        : post
                )
            );

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

    const getFileIcon = (fileType) => {
        if (fileType.startsWith("image/")) return "🖼️";
        if (fileType.startsWith("video/")) return "🎬";
        if (fileType === "application/pdf") return "📄";
        if (fileType.includes("spreadsheet")) return "📊";
        if (fileType.includes("document")) return "📝";
        if (fileType.includes("presentation")) return "📑";
        return "📁";
    };

    const renderImagePreview = (file, isEdit = false) => {
        if (file.type.startsWith("image/")) {
            return (
                <div className="relative">
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-16 h-16 object-contain rounded-lg cursor-pointer"
                        onClick={() => {
                            setPreviewImage(URL.createObjectURL(file));
                            setShowImagePreview(true);
                        }}
                    />
                    <button
                        onClick={() =>
                            isEdit
                                ? removeEditFile(editFiles.indexOf(file))
                                : removeFile(selectedFiles.indexOf(file))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
            );
        }
        return (
            <div
                className={`p-2 rounded-lg flex items-center ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                }`}
            >
                <span className="mr-2">{getFileIcon(file.type)}</span>
                <span className="text-sm truncate max-w-xs">{file.name}</span>
                <button
                    onClick={() =>
                        isEdit
                            ? removeEditFile(editFiles.indexOf(file))
                            : removeFile(selectedFiles.indexOf(file))
                    }
                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    const renderExistingImagePreview = (imageUrl) => {
        return (
            <div className="relative mb-4 w-full flex justify-center">
                <img
                    src={imageUrl}
                    alt="Post image"
                    className="max-h-96 max-w-full object-contain rounded-lg cursor-pointer"
                    onClick={() => {
                        setPreviewImage(imageUrl);
                        setShowImagePreview(true);
                    }}
                />
                <button
                    onClick={() => {
                        if (
                            window.confirm(
                                "Are you sure you want to remove this image?"
                            )
                        ) {
                            setPosts(
                                posts.map((post) =>
                                    post._id === editingPostId
                                        ? { ...post, image: null }
                                        : post
                                )
                            );
                        }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 cursor-pointer"
                    title="Remove image"
                >
                    <FaTimes />
                </button>
            </div>
        );
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    // Handle dark mode changes from Navbar
    const handleDarkModeChange = (darkMode) => {
        setIsDarkMode(darkMode);
    };

    // Function to handle image load and get dimensions
    const handleImageLoad = (e) => {
        const img = e.target;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
    };

    // Calculate the appropriate size for the image preview
    const getImagePreviewStyle = () => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        if (
            imageDimensions.width > maxWidth ||
            imageDimensions.height > maxHeight
        ) {
            const widthRatio = maxWidth / imageDimensions.width;
            const heightRatio = maxHeight / imageDimensions.height;
            const ratio = Math.min(widthRatio, heightRatio);

            return {
                width: imageDimensions.width * ratio,
                height: imageDimensions.height * ratio,
            };
        }

        return {
            width: imageDimensions.width,
            height: imageDimensions.height,
        };
    };

    return (
        <div
            className={`min-h-screen ${
                isDarkMode
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-gradient-to-r from-gray-100 to-gray-200"
            }`}
        >
            {/* Floating Hearts Animation */}
            <FloatingHearts />

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
                theme={isDarkMode ? "dark" : "light"}
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
                    className="fixed inset-0 backdrop-blur bg-transparent bg-opacity-90 flex items-center justify-center z-[9999] p-4"
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
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors cursor-pointer z-[10000]"
                            onClick={() => setShowImagePreview(false)}
                        >
                            <FaTimes className="text-lg" />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm z-[10000]">
                            @{username}
                        </div>
                    </div>
                </div>
            )}
            <Navbar onDarkModeChange={handleDarkModeChange} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Post Creation Card */}
                    <div
                        className={`rounded-lg shadow-lg p-6 mb-6 ${
                            isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-800"
                        }`}
                    >
                        <div className="flex items-start space-x-4">
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                onClick={() => navigate("/profile")}
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                    {realname || username}
                                </h3>
                                <textarea
                                    value={postContent}
                                    onChange={(e) =>
                                        setPostContent(e.target.value)
                                    }
                                    placeholder="What's on your mind?"
                                    className={`w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 ${
                                        isDarkMode
                                            ? "bg-gray-700 text-gray-100 border-gray-600"
                                            : "bg-gray-50 text-gray-800 border-gray-300"
                                    }`}
                                    rows={3}
                                />

                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index}>
                                                {renderImagePreview(file)}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-4">
                                        <label
                                            className={`p-2 rounded-full cursor-pointer ${
                                                isDarkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                accept="image/*,application/pdf,video/mp4,text/plain"
                                            />
                                            <FaPaperclip className="text-gray-500" />
                                        </label>
                                        <button
                                            onClick={() =>
                                                setActiveCommentPostId("new")
                                            }
                                            className={`p-2 rounded-full ${
                                                isDarkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            😊
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePostSubmit}
                                        disabled={isLoading}
                                        className={`px-6 py-2 rounded-full font-semibold ${
                                            isLoading
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                    >
                                        {isLoading ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Reactions Dropdown */}
                    {activeCommentPostId === "new" && (
                        <div
                            ref={quickReactionRef}
                            className={`absolute z-10 mt-2 rounded-lg shadow-lg p-3 ${
                                isDarkMode
                                    ? "bg-gray-800 border border-gray-700"
                                    : "bg-white border border-gray-200"
                            }`}
                            style={{
                                transform: "translateX(-50%)",
                                left: "50%",
                            }}
                        >
                            <div className="grid grid-cols-3 gap-2">
                                {quickReactions.map((reaction, index) => (
                                    <button
                                        key={index}
                                        onClick={() => addReaction(reaction)}
                                        className={`p-2 rounded-lg text-center ${
                                            isDarkMode
                                                ? "hover:bg-gray-700"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="text-2xl">
                                            {reaction.emoji}
                                        </div>
                                        <div className="text-xs mt-1">
                                            {reaction.text}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts List */}
                    {isLoading && posts.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4">Loading posts...</p>
                        </div>
                    ) : error && posts.length === 0 ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No posts yet. Create your first post!
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post._id}
                                className={`rounded-lg shadow-lg p-6 mb-6 ${
                                    isDarkMode
                                        ? "bg-gray-800 text-gray-100"
                                        : "bg-white text-gray-800"
                                }`}
                            >
                                {/* Post Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={
                                                post.userId?.profilePic ||
                                                profilePic
                                            }
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                            onClick={() =>
                                                navigateToUserProfile(
                                                    post.userId?._id
                                                )
                                            }
                                        />
                                        <div>
                                            <h3
                                                className="font-semibold cursor-pointer hover:underline"
                                                onClick={() =>
                                                    navigateToUserProfile(
                                                        post.userId?._id
                                                    )
                                                }
                                            >
                                                {post.userId?.realname ||
                                                    post.userId?.username ||
                                                    post.username ||
                                                    "Unknown User"}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(post.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {post.userId?._id === user._id && (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    startEditPost(post._id)
                                                }
                                                className={`p-2 rounded-full ${
                                                    isDarkMode
                                                        ? "hover:bg-gray-700"
                                                        : "hover:bg-gray-100"
                                                }`}
                                                title="Edit post"
                                            >
                                                <FaEdit className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeletePost(post._id)
                                                }
                                                className={`p-2 rounded-full ${
                                                    isDarkMode
                                                        ? "hover:bg-gray-700"
                                                        : "hover:bg-gray-100"
                                                }`}
                                                title="Delete post"
                                            >
                                                <FaTrashAlt className="text-red-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Post Content */}
                                {editingPostId === post._id ? (
                                    <div className="mb-4">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            className={`w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                isDarkMode
                                                    ? "bg-gray-700 text-gray-100 border-gray-600"
                                                    : "bg-gray-50 text-gray-800 border-gray-300"
                                            }`}
                                            rows={3}
                                        />
                                        {/* Edit Files Preview */}
                                        {editFiles.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {editFiles.map(
                                                    (file, index) => (
                                                        <div key={index}>
                                                            {renderImagePreview(
                                                                file,
                                                                true
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        {post.image && (
                                            <div className="mt-4">
                                                {renderExistingImagePreview(
                                                    post.image
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-4">
                                            <label
                                                className={`p-2 rounded-full cursor-pointer ${
                                                    isDarkMode
                                                        ? "hover:bg-gray-700"
                                                        : "hover:bg-gray-100"
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={
                                                        handleEditFileSelect
                                                    }
                                                    accept="image/*,application/pdf,video/mp4,text/plain"
                                                />
                                                <FaPaperclip className="text-gray-500" />
                                            </label>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdatePost(
                                                            post._id
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                                        isLoading
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-green-500 hover:bg-green-600 text-white"
                                                    }`}
                                                >
                                                    <FaSave className="inline mr-1" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditPost}
                                                    className="px-4 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
                                                >
                                                    <FaTimesCircle className="inline mr-1" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mb-4 whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                        {post.image && (
                                            <div className="mb-4">
                                                <img
                                                    src={post.image}
                                                    alt="Post attachment"
                                                    className="max-h-96 max-w-full object-contain rounded-lg cursor-pointer"
                                                    onClick={() => {
                                                        setPreviewImage(
                                                            post.image
                                                        );
                                                        setShowImagePreview(
                                                            true
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Post Actions */}
                                <div className="flex items-center justify-between border-t pt-4 mt-4">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={(e) =>
                                                handleLikePost(post._id, e)
                                            }
                                            className={`flex items-center space-x-1 p-2 rounded-lg ${
                                                post.hasUserLiked
                                                    ? "text-red-500"
                                                    : "text-gray-500"
                                            } ${
                                                isDarkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {post.hasUserLiked ? (
                                                <FaHeart />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                            <span>
                                                {post.likes?.length || 0}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                toggleCommentDropdown(post._id)
                                            }
                                            className={`flex items-center space-x-1 p-2 rounded-lg text-gray-500 ${
                                                isDarkMode
                                                    ? "hover:bg-gray-700"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            <FaComment />
                                            <span>{post.commentCount}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPostId === post._id && (
                                    <div className="mt-4 pt-4 border-t">
                                        {isFetchingComments ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-4 mb-4">
                                                    {post.comments?.map(
                                                        (comment) => (
                                                            <div
                                                                key={
                                                                    comment._id
                                                                }
                                                                className="flex items-start space-x-3"
                                                            >
                                                                <img
                                                                    src={
                                                                        comment
                                                                            .userId
                                                                            ?.profilePic ||
                                                                        "https://ui-avatars.com/api/?name=User&background=random"
                                                                    }
                                                                    alt="Profile"
                                                                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                                                    onClick={() =>
                                                                        navigateToUserProfile(
                                                                            comment
                                                                                .userId
                                                                                ?._id
                                                                        )
                                                                    }
                                                                />
                                                                <div className="flex-1">
                                                                    <div
                                                                        className={`p-3 rounded-lg ${
                                                                            isDarkMode
                                                                                ? "bg-gray-700"
                                                                                : "bg-gray-100"
                                                                        }`}
                                                                    >
                                                                        <div className="flex justify-between items-start">
                                                                            <h4
                                                                                className="font-semibold text-sm cursor-pointer hover:underline"
                                                                                onClick={() =>
                                                                                    navigateToUserProfile(
                                                                                        comment
                                                                                            .userId
                                                                                            ?._id
                                                                                    )
                                                                                }
                                                                            >
                                                                                {comment
                                                                                    .userId
                                                                                    ?.realname ||
                                                                                    comment
                                                                                        .userId
                                                                                        ?.username ||
                                                                                    "Unknown User"}
                                                                            </h4>
                                                                            <div className="flex items-center space-x-2">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleLikeComment(
                                                                                            comment._id,
                                                                                            post._id
                                                                                        )
                                                                                    }
                                                                                    className={`flex items-center space-x-1 text-xs ${
                                                                                        comment.hasUserLiked
                                                                                            ? "text-red-500"
                                                                                            : "text-gray-500"
                                                                                    }`}
                                                                                >
                                                                                    {comment.hasUserLiked ? (
                                                                                        <FaHeart />
                                                                                    ) : (
                                                                                        <FaRegHeart />
                                                                                    )}
                                                                                    <span>
                                                                                        {comment
                                                                                            .likes
                                                                                            ?.length ||
                                                                                            0}
                                                                                    </span>
                                                                                </button>
                                                                                {(comment
                                                                                    .userId
                                                                                    ?._id ===
                                                                                    user._id ||
                                                                                    post.userId ===
                                                                                        user._id) && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleDeleteComment(
                                                                                                comment._id,
                                                                                                post._id
                                                                                            )
                                                                                        }
                                                                                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                                                                        title="Delete comment"
                                                                                    >
                                                                                        <FaTrashAlt />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm mt-1 whitespace-pre-wrap">
                                                                            {
                                                                                comment.content
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {formatDate(
                                                                            comment.createdAt
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                {/* Add Comment */}
                                                <div className="flex items-start space-x-3">
                                                    <img
                                                        src={profilePic}
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={
                                                                commentContent[
                                                                    post._id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setCommentContent(
                                                                    {
                                                                        ...commentContent,
                                                                        [post._id]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            placeholder="Write a comment..."
                                                            className={`w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                isDarkMode
                                                                    ? "bg-gray-700 text-gray-100 border-gray-600"
                                                                    : "bg-gray-50 text-gray-800 border-gray-300"
                                                            }`}
                                                            rows={2}
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                handleAddComment(
                                                                    post._id
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            className={`mt-2 px-4 py-2 rounded-lg font-semibold ${
                                                                isLoading
                                                                    ? "bg-gray-400 cursor-not-allowed"
                                                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                                            }`}
                                                        >
                                                            {isLoading
                                                                ? "Posting..."
                                                                : "Comment"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;
