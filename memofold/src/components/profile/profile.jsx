import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTimes,
    FaBars,
    FaSun,
    FaMoon,
    FaEdit,
    FaTrashAlt,
    FaPaperclip,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Components
import ErrorBoundary from "./ErrorBoundary";
import Navbar from "../navbar/navbar";
import ProfileHeader from "./ProfileHeader";
import CreatePostSection from "./CreatePostSection";
import ProfilePostCard from "./ProfilePostCard";
import FloatingHearts from "../mainFeed/FloatingHearts";
import ImagePreviewModal from "../mainFeed/ImagePreviewModal";

// Services
import { apiService } from "../../services/api";
import { localStorageService } from "../../services/localStorage";
import { formatDate, getIndianDateString } from "../../services/dateUtils";

const ProfilePage = () => {
    // State management
    const [profileData, setProfileData] = useState({
        profilePic:
            localStorage.getItem("profilePic") ||
            "https://ui-avatars.com/api/?name=User&background=random",
        username: localStorage.getItem("username") || "",
        realName: localStorage.getItem("realname") || "",
        bio: "",
        posts: [],
        stats: { posts: 0, followers: 0, following: 0 },
    });

    const [uiState, setUiState] = useState({
        darkMode: localStorage.getItem("darkMode") === "true",
        loading: true,
        showMobileMenu: false,
        error: null,
        showImagePreview: false,
        previewImage: "",
    });

    const [postState, setPostState] = useState({
        postContent: "",
        selectedDate: getIndianDateString(),
        selectedFile: null,
        filePreview: null,
        isCreatingPost: false,
    });

    const [commentState, setCommentState] = useState({
        activeCommentPostId: null,
        commentContent: {},
        isCommenting: {},
        isFetchingComments: false,
        isAddingComment: false,
        isDeletingComment: false,
        // Reply states
        activeReplyInputs: {},
        replyContent: {},
        isReplying: {},
        isFetchingReplies: {},
        isLikingReply: {},
        isDeletingReply: {},
    });

    const [editState, setEditState] = useState({
        editingPostId: null,
        editContent: "",
        editFiles: [],
        isUpdatingPost: false,
        isDeletingPost: false,
    });

    const [floatingHearts, setFloatingHearts] = useState([]);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

    const navigate = useNavigate();
    const mobileMenuRef = useRef(null);

    // Initialize app
    useEffect(() => {
        initializeApp();

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const initializeApp = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setUiState((prev) => ({ ...prev, loading: true }));
            await Promise.all([
                fetchUserData(token),
                fetchUserPosts(token, profileData.username),
                fetchCurrentUserData(token),
            ]);
        } catch (error) {
            console.error("Initialization error:", error);
            setUiState((prev) => ({
                ...prev,
                error: "Failed to load profile data",
            }));
        } finally {
            setUiState((prev) => ({ ...prev, loading: false }));
        }
    };

    // API functions
    const fetchCurrentUserData = async (token) => {
        try {
            const result = await apiService.fetchCurrentUser(token);
            const userData = result.user;

            if (userData.profilePic) {
                setProfileData((prev) => ({
                    ...prev,
                    profilePic: userData.profilePic,
                }));
                localStorage.setItem("profilePic", userData.profilePic);
            }

            if (result.profile?.description) {
                setProfileData((prev) => ({
                    ...prev,
                    bio: result.profile.description,
                }));
            }

            setProfileData((prev) => ({
                ...prev,
                stats: {
                    posts: result.stats?.postCount || userData.postCount || 0,
                    followers: userData.followerCount || 0,
                    following: userData.followingCount || 0,
                    friends: result.stats?.friendsCount || 0,
                },
            }));

            setCurrentUserProfile(userData);
        } catch (error) {
            console.error("Error fetching current user data:", error);
            throw error;
        }
    };

    const fetchUserData = async (token) => {
        try {
            const result = await apiService.fetchCurrentUser(token);
            const userData = result.user;

            if (userData.profilePic) {
                setProfileData((prev) => ({
                    ...prev,
                    profilePic: userData.profilePic,
                }));
                localStorage.setItem("profilePic", userData.profilePic);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    };

    const fetchUserPosts = async (token, username) => {
        try {
            const responseData = await apiService.fetchUserPosts(
                token,
                username
            );
            const postsData = responseData.posts || [];

            const storedLikes = localStorageService.getStoredLikes();

            const postsWithComments = postsData.map((post) => {
                const postLikes = storedLikes[post._id] || post.likes || [];
                const currentUserId = localStorage.getItem("userId");
                const currentUsername = localStorage.getItem("username");
                const hasUserLiked =
                    postLikes.includes(currentUserId) ||
                    postLikes.includes(currentUsername);

                // API se milne wale data ko properly map karo
                return {
                    ...post,
                    isLiked: hasUserLiked,
                    likes: post.likeCount || postLikes.length, // likeCount use karo
                    comments: post.comments
                        ? post.comments.map((comment) => ({
                              ...comment,
                              replies: comment.replies || [],
                              showReplies: false,
                          }))
                        : [],
                    commentCount: post.commentCount || 0, // commentCount use karo
                    userId: {
                        _id: post.userId?._id || currentUserId,
                        username: post.userId?.username || username,
                        realname: post.userId?.realname || profileData.realName,
                        profilePic:
                            post.userId?.profilePic || profileData.profilePic,
                    },
                    profilePic:
                        post.userId?.profilePic || profileData.profilePic,
                    username: post.userId?.username || username,
                };
            });

            setProfileData((prev) => ({ ...prev, posts: postsWithComments }));
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    };

    // File upload handlers for edit mode
    const handleEditFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setEditState((prev) => ({
            ...prev,
            editFiles: [...prev.editFiles, ...files],
        }));
    };

    const handleRemoveEditFile = (index) => {
        setEditState((prev) => ({
            ...prev,
            editFiles: prev.editFiles.filter((_, i) => i !== index),
        }));
    };

    // Comment handlers
    const handleToggleCommentDropdown = async (postId) => {
        if (commentState.activeCommentPostId === postId) {
            setCommentState((prev) => ({ ...prev, activeCommentPostId: null }));
            return;
        }

        setCommentState((prev) => ({
            ...prev,
            activeCommentPostId: postId,
            isFetchingComments: true,
        }));

        try {
            const token = localStorage.getItem("token");
            const responseData = await apiService.fetchComments(postId, token);
            const comments = (responseData.comments || []).map((comment) => ({
                ...comment,
                replies: comment.replies || [],
                showReplies: false,
            }));

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments,
                              commentCount: comments.length,
                          }
                        : post
                ),
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Failed to load comments");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isFetchingComments: false,
            }));
        }
    };

    const handleCommentSubmit = async (postId) => {
        if (!commentState.commentContent[postId]?.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        try {
            setCommentState((prev) => ({
                ...prev,
                isCommenting: { ...prev.isCommenting, [postId]: true },
            }));

            const token = localStorage.getItem("token");
            await apiService.addComment(
                postId,
                commentState.commentContent[postId],
                token
            );

            // Refresh comments
            await handleToggleCommentDropdown(postId);

            setCommentState((prev) => ({
                ...prev,
                commentContent: { ...prev.commentContent, [postId]: "" },
            }));

            toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error(error.message);
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isCommenting: { ...prev.isCommenting, [postId]: false },
            }));
        }
    };

    const handleSetCommentContent = (content) => {
        setCommentState((prev) => ({ ...prev, commentContent: content }));
    };

    const handleDeleteComment = async (commentId, postId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            setCommentState((prev) => ({
                ...prev,
                isDeletingComment: true,
            }));

            const token = localStorage.getItem("token");
            await apiService.deleteComment(commentId, postId, token);

            // Refresh comments
            await handleToggleCommentDropdown(postId);

            toast.success("Comment deleted successfully!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isDeletingComment: false,
            }));
        }
    };

    // Reply handlers
    const handleToggleReplyInput = (commentId, parentReplyId = null) => {
        const key = parentReplyId ? `${commentId}-${parentReplyId}` : commentId;
        setCommentState((prev) => ({
            ...prev,
            activeReplyInputs: {
                ...prev.activeReplyInputs,
                [key]: !prev.activeReplyInputs[key],
            },
            replyContent: {
                ...prev.replyContent,
                [key]: prev.replyContent[key] || "",
            },
        }));
    };

    const handleReplySubmit = async (
        postId,
        commentId,
        parentReplyId = null
    ) => {
        const key = parentReplyId ? `${commentId}-${parentReplyId}` : commentId;
        const content = commentState.replyContent[key];

        if (!content?.trim()) {
            toast.error("Reply cannot be empty");
            return;
        }

        try {
            setCommentState((prev) => ({
                ...prev,
                isReplying: { ...prev.isReplying, [key]: true },
            }));

            const token = localStorage.getItem("token");

            if (parentReplyId) {
                // This is a reply to another reply
                await apiService.addCommentReply(
                    postId,
                    content,
                    parentReplyId,
                    token
                );
            } else {
                // This is a reply to a comment
                await apiService.addCommentReply(
                    postId,
                    content,
                    commentId,
                    token
                );
            }

            // Refresh comments to show the new reply
            await handleToggleCommentDropdown(postId);

            setCommentState((prev) => ({
                ...prev,
                replyContent: { ...prev.replyContent, [key]: "" },
                activeReplyInputs: { ...prev.activeReplyInputs, [key]: false },
            }));

            toast.success("Reply added successfully!");
        } catch (error) {
            console.error("Error adding reply:", error);
            toast.error(error.message);
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isReplying: { ...prev.isReplying, [key]: false },
            }));
        }
    };

    const handleSetReplyContent = (key, content) => {
        setCommentState((prev) => ({
            ...prev,
            replyContent: { ...prev.replyContent, [key]: content },
        }));
    };

    const handleToggleReplies = async (postId, commentId) => {
        setProfileData((prev) => ({
            ...prev,
            posts: prev.posts.map((post) =>
                post._id === postId
                    ? {
                          ...post,
                          comments: post.comments.map((comment) =>
                              comment._id === commentId
                                  ? {
                                        ...comment,
                                        showReplies: !comment.showReplies,
                                    }
                                  : comment
                          ),
                      }
                    : post
            ),
        }));

        // Fetch replies if not already loaded
        const post = profileData.posts.find((p) => p._id === postId);
        const comment = post?.comments.find((c) => c._id === commentId);

        if (comment && (!comment.replies || comment.replies.length === 0)) {
            try {
                setCommentState((prev) => ({
                    ...prev,
                    isFetchingReplies: {
                        ...prev.isFetchingReplies,
                        [commentId]: true,
                    },
                }));

                const token = localStorage.getItem("token");
                const response = await apiService.fetchCommentReplies(
                    commentId,
                    token
                );
                const replies = response.replies || [];

                setProfileData((prev) => ({
                    ...prev,
                    posts: prev.posts.map((post) =>
                        post._id === postId
                            ? {
                                  ...post,
                                  comments: post.comments.map((comment) =>
                                      comment._id === commentId
                                          ? { ...comment, replies }
                                          : comment
                                  ),
                              }
                            : post
                    ),
                }));
            } catch (error) {
                console.error("Error fetching replies:", error);
                toast.error("Failed to load replies");
            } finally {
                setCommentState((prev) => ({
                    ...prev,
                    isFetchingReplies: {
                        ...prev.isFetchingReplies,
                        [commentId]: false,
                    },
                }));
            }
        }
    };

    const handleLikeReply = async (replyId, commentId, event) => {
        try {
            setCommentState((prev) => ({
                ...prev,
                isLikingReply: { ...prev.isLikingReply, [replyId]: true },
            }));

            const token = localStorage.getItem("token");
            const currentUserId = localStorage.getItem("userId");
            await apiService.likeReply(replyId, currentUserId, token);

            // Update local state
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => ({
                    ...post,
                    comments: post.comments.map((comment) => ({
                        ...comment,
                        replies: comment.replies.map((reply) =>
                            reply._id === replyId
                                ? {
                                      ...reply,
                                      hasUserLiked: !reply.hasUserLiked,
                                      likes: reply.hasUserLiked
                                          ? (reply.likes || []).filter(
                                                (id) => id !== currentUserId
                                            )
                                          : [
                                                ...(reply.likes || []),
                                                currentUserId,
                                            ],
                                  }
                                : reply
                        ),
                    })),
                })),
            }));

            if (event) {
                const rect = event.target.getBoundingClientRect();
                const heartCount = 3;
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
                    }, i * 100);
                }
            }
        } catch (error) {
            console.error("Error liking reply:", error);
            toast.error("Failed to like reply");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isLikingReply: { ...prev.isLikingReply, [replyId]: false },
            }));
        }
    };

    const handleDeleteReply = async (replyId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) {
            return;
        }

        try {
            setCommentState((prev) => ({
                ...prev,
                isDeletingReply: { ...prev.isDeletingReply, [replyId]: true },
            }));

            const token = localStorage.getItem("token");
            await apiService.deleteReply(replyId, token);

            // Update local state
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => ({
                    ...post,
                    comments: post.comments.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  replies: comment.replies.filter(
                                      (reply) => reply._id !== replyId
                                  ),
                              }
                            : comment
                    ),
                })),
            }));

            toast.success("Reply deleted successfully!");
        } catch (error) {
            console.error("Error deleting reply:", error);
            toast.error("Failed to delete reply");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isDeletingReply: { ...prev.isDeletingReply, [replyId]: false },
            }));
        }
    };

    // Event handlers
    const handleProfilePicUpdate = async (file) => {
        if (!file) return;

        try {
            setUploadingProfilePic(true);
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("image", file);

            const responseData = await apiService.uploadProfilePic(
                token,
                formData
            );

            if (responseData.profilePicUrl) {
                const imageUrl = responseData.profilePicUrl;
                setProfileData((prev) => ({ ...prev, profilePic: imageUrl }));
                localStorage.setItem("profilePic", imageUrl);

                toast.success("Profile picture updated successfully!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUiState((prev) => ({ ...prev, error: error.message }));
            toast.error(error.message);
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleBioUpdate = async (newBio) => {
        try {
            const token = localStorage.getItem("token");
            const result = await apiService.updateUserProfile(token, {
                description: newBio,
            });

            setProfileData((prev) => ({
                ...prev,
                bio: result.description || newBio,
            }));
            toast.success("Bio updated successfully!");
        } catch (error) {
            console.error("Bio update failed:", error);
            throw error;
        }
    };

    const handleCreatePost = async (content, file, date) => {
        if (!content.trim() && !file) {
            toast.error("Post content or image cannot be empty");
            return;
        }

        try {
            setPostState((prev) => ({ ...prev, isCreatingPost: true }));
            const token = localStorage.getItem("token");

            let imageData = null;
            if (file) {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            }

            const postData = {
                content,
                createdAt: new Date(date).toISOString(),
                date: new Date(date).toISOString(),
                image: imageData,
            };

            await apiService.createPost(token, postData);

            await fetchUserPosts(token, profileData.username);
            toast.success("Post created successfully!");
        } catch (error) {
            console.error("Post error:", error);
            setUiState((prev) => ({ ...prev, error: error.message }));
            toast.error(error.message);
        } finally {
            setPostState((prev) => ({ ...prev, isCreatingPost: false }));
        }
    };

    const handleLike = async (postId, event) => {
        try {
            const token = localStorage.getItem("token");
            const currentUserId = localStorage.getItem("userId");

            await apiService.likePost(postId, currentUserId, token);

            const storedLikes = localStorageService.getStoredLikes();
            const currentPostLikes = storedLikes[postId] || [];
            const currentUsername = localStorage.getItem("username");

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => {
                    if (post._id === postId) {
                        const isCurrentlyLiked = post.isLiked;
                        let updatedLikes;

                        if (isCurrentlyLiked) {
                            updatedLikes = currentPostLikes.filter(
                                (like) =>
                                    like !== currentUserId &&
                                    like !== currentUsername
                            );
                        } else {
                            updatedLikes = [...currentPostLikes, currentUserId];

                            if (event) {
                                const rect =
                                    event.target.getBoundingClientRect();
                                const heartCount = 5;
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
                                    }, i * 100);
                                }
                            }
                        }

                        storedLikes[postId] = updatedLikes;
                        localStorage.setItem(
                            "postLikes",
                            JSON.stringify(storedLikes)
                        );

                        return {
                            ...post,
                            isLiked: !isCurrentlyLiked,
                            likes: updatedLikes.length,
                            likeCount: updatedLikes.length, // dono fields update karo
                        };
                    }
                    return post;
                }),
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
            setUiState((prev) => ({ ...prev, error: error.message }));
            toast.error(error.message);
        }
    };

    // Profile-specific post functions
    const handleEditPost = (postId) => {
        const postToEdit = profileData.posts.find(
            (post) => post._id === postId
        );
        if (postToEdit) {
            setEditState((prev) => ({
                ...prev,
                editingPostId: postId,
                editContent: postToEdit.content,
                editFiles: [],
            }));
        }
    };

    const handleUpdatePost = async (postId) => {
        if (!editState.editContent.trim() && editState.editFiles.length === 0) {
            toast.error("Post content or image cannot be empty");
            return;
        }

        try {
            setEditState((prev) => ({ ...prev, isUpdatingPost: true }));
            const token = localStorage.getItem("token");

            let imageData = null;
            if (editState.editFiles.length > 0) {
                const file = editState.editFiles[0];
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            }

            const postData = {
                content: editState.editContent,
                ...(imageData && { image: imageData }),
            };

            await apiService.updatePost(token, postId, postData);

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              content: editState.editContent,
                              ...(imageData && { image: imageData }),
                          }
                        : post
                ),
            }));

            setEditState((prev) => ({
                ...prev,
                editingPostId: null,
                editContent: "",
                editFiles: [],
            }));
            toast.success("Post updated successfully!");
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error("Failed to update post");
        } finally {
            setEditState((prev) => ({ ...prev, isUpdatingPost: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditState({
            editingPostId: null,
            editContent: "",
            editFiles: [],
            isUpdatingPost: false,
            isDeletingPost: false,
        });
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            setEditState((prev) => ({ ...prev, isDeletingPost: true }));
            const token = localStorage.getItem("token");
            await apiService.deletePost(token, postId);

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.filter((post) => post._id !== postId),
            }));

            const storedLikes = localStorageService.getStoredLikes();
            delete storedLikes[postId];
            localStorage.setItem("postLikes", JSON.stringify(storedLikes));

            toast.success("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        } finally {
            setEditState((prev) => ({ ...prev, isDeletingPost: false }));
        }
    };

    const handleDarkModeChange = (darkMode) => {
        setUiState((prev) => ({ ...prev, darkMode }));
        localStorage.setItem("darkMode", darkMode);
    };

    const handleClickOutside = (e) => {
        if (
            mobileMenuRef.current &&
            !mobileMenuRef.current.contains(e.target)
        ) {
            setUiState((prev) => ({ ...prev, showMobileMenu: false }));
        }
    };

    const joinedDate = localStorage.getItem("createdAt");
    const formattedDate = joinedDate
        ? new Date(joinedDate).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";

    if (uiState.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div
                className={`min-h-screen transition-colors duration-300 ${
                    uiState.darkMode
                        ? "bg-gray-900 text-gray-100"
                        : "bg-gray-50 text-gray-800"
                }`}
            >
                <FloatingHearts
                    hearts={floatingHearts}
                    setHearts={setFloatingHearts}
                />

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
                    theme={uiState.darkMode ? "dark" : "light"}
                />

                {uiState.showImagePreview && (
                    <ImagePreviewModal
                        image={uiState.previewImage}
                        onClose={() =>
                            setUiState((prev) => ({
                                ...prev,
                                showImagePreview: false,
                            }))
                        }
                    />
                )}

                <Navbar onDarkModeChange={handleDarkModeChange} />

                <div className="pt-4 sm:pt-6 pb-12">
                    <ProfileHeader
                        profilePic={profileData.profilePic}
                        username={profileData.username}
                        realName={profileData.realName}
                        bio={profileData.bio}
                        posts={profileData.posts}
                        isDarkMode={uiState.darkMode}
                        joinedDate={formattedDate}
                        onProfilePicUpdate={handleProfilePicUpdate}
                        onBioUpdate={handleBioUpdate}
                        uploadingProfilePic={uploadingProfilePic}
                    />

                    <CreatePostSection
                        profilePic={profileData.profilePic}
                        username={profileData.username}
                        realName={profileData.realName}
                        postContent={postState.postContent}
                        setPostContent={(content) =>
                            setPostState((prev) => ({
                                ...prev,
                                postContent: content,
                            }))
                        }
                        isDarkMode={uiState.darkMode}
                        selectedDate={postState.selectedDate}
                        setSelectedDate={(date) =>
                            setPostState((prev) => ({
                                ...prev,
                                selectedDate: date,
                            }))
                        }
                        onCreatePost={handleCreatePost}
                        isCreatingPost={postState.isCreatingPost}
                        navigateToUserProfile={(userId) =>
                            navigate(
                                userId === currentUserProfile?._id
                                    ? "/profile"
                                    : `/user/${userId}`
                            )
                        }
                        currentUserProfile={currentUserProfile}
                    />

                    {/* Posts Section with ProfilePostCard */}
                    <section className="max-w-2xl mx-auto px-3 sm:px-4">
                        {profileData.posts.length === 0 ? (
                            <div
                                className={`text-center py-8 ${
                                    uiState.darkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                <p>You haven't posted anything yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">
                                {profileData.posts.map((post) => (
                                    <ProfilePostCard
                                        key={post._id}
                                        post={post}
                                        isDarkMode={uiState.darkMode}
                                        username={profileData.username}
                                        currentUserProfile={currentUserProfile}
                                        onLike={handleLike}
                                        onEditPost={handleEditPost}
                                        onUpdatePost={handleUpdatePost}
                                        onCancelEdit={handleCancelEdit}
                                        onDeletePost={handleDeletePost}
                                        onImagePreview={(image) =>
                                            setUiState((prev) => ({
                                                ...prev,
                                                showImagePreview: true,
                                                previewImage: image,
                                            }))
                                        }
                                        navigateToUserProfile={(userId) =>
                                            navigate(
                                                userId ===
                                                    currentUserProfile?._id
                                                    ? "/profile"
                                                    : `/user/${userId}`
                                            )
                                        }
                                        activeCommentPostId={
                                            commentState.activeCommentPostId
                                        }
                                        onToggleCommentDropdown={
                                            handleToggleCommentDropdown
                                        }
                                        commentContent={
                                            commentState.commentContent
                                        }
                                        onCommentSubmit={handleCommentSubmit}
                                        onSetCommentContent={
                                            handleSetCommentContent
                                        }
                                        isCommenting={commentState.isCommenting}
                                        onDeleteComment={handleDeleteComment}
                                        isFetchingComments={
                                            commentState.isFetchingComments
                                        }
                                        token={localStorage.getItem("token")}
                                        // Edit state props
                                        editingPostId={editState.editingPostId}
                                        editContent={editState.editContent}
                                        onEditContentChange={(content) =>
                                            setEditState((prev) => ({
                                                ...prev,
                                                editContent: content,
                                            }))
                                        }
                                        isUpdatingPost={
                                            editState.isUpdatingPost
                                        }
                                        isDeletingPost={
                                            editState.isDeletingPost
                                        }
                                        // File upload props
                                        editFiles={editState.editFiles}
                                        onEditFileSelect={handleEditFileSelect}
                                        onRemoveEditFile={handleRemoveEditFile}
                                        // Reply functionality props
                                        activeReplyInputs={
                                            commentState.activeReplyInputs
                                        }
                                        replyContent={commentState.replyContent}
                                        onToggleReplyInput={
                                            handleToggleReplyInput
                                        }
                                        onReplySubmit={handleReplySubmit}
                                        onSetReplyContent={
                                            handleSetReplyContent
                                        }
                                        onToggleReplies={handleToggleReplies}
                                        onLikeReply={handleLikeReply}
                                        onDeleteReply={handleDeleteReply}
                                        isReplying={commentState.isReplying}
                                        isFetchingReplies={
                                            commentState.isFetchingReplies
                                        }
                                        isLikingReply={
                                            commentState.isLikingReply
                                        }
                                        isDeletingReply={
                                            commentState.isDeletingReply
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ProfilePage;
