import React, { useState, useEffect, useRef, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import { useVideo } from "../../context/VideoContext";

// Components
import ErrorBoundary from "./ErrorBoundary";
import Navbar from "../navbar/navbar";
import ProfileHeader from "./ProfileHeader";
import CreatePostSection from "./CreatePostSection";
import ProfilePostCard from "./ProfilePostCard";
import FloatingHearts from "../mainFeed/FloatingHearts";
import ImagePreviewModal from "../mainFeed/ImagePreviewModal";
import EmailVerificationModal from "../common/EmailVerificationModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import LikesModal from "../mainFeed/LikesModal";
import ProfileSkeleton from "./ProfileSkeleton";
import FriendsSidebar from "../navbar/FriendsSidebar";
import { useAuth } from "../../hooks/useAuth";

// Services

import { apiService } from "../../services/api";
import { localStorageService } from "../../services/localStorage";
import {
    formatDate,
    getIndianDateString,
    getCurrentUTCTime,
    convertUTCToIST,
} from "../../services/dateUtils";
import { getFileType, checkVideoDuration } from "../../utils/fileCompression";
import { getPostMediaItems } from "../../utils/getPostMediaItems";
import { MAX_MEDIA_ITEMS, MAX_VIDEO_DURATION_SEC } from "../../utils/mediaLimits";

// Utility function for better error handling
const handleApiError = (error, defaultMessage = "Something went wrong") => {
    console.error("API Error:", error);

    if (error.response?.status >= 500) {
        return "Server error: Please try again later";
    } else if (error.response?.status === 401) {
        return "Please login again";
    } else if (error.response?.status === 400) {
        return error.response.data?.message || "Invalid request";
    } else if (error.response?.status === 404) {
        return "Resource not found";
    } else if (error.response?.status === 403) {
        return "You don't have permission to perform this action";
    } else if (error.message) {
        return error.message;
    } else {
        return defaultMessage;
    }
};

const ProfilePage = () => {
    // State management
    const [profileData, setProfileData] = useState({
        profilePic: "",
        username: "",
        realName: "",
        email: "",
        bio: "",
        dateOfBirth: null,
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
        // Pagination states
        commentsNextCursor: {},
        repliesNextCursor: {},
    });

    const [editState, setEditState] = useState({
        editingPostId: null,
        editContent: "",
        editLocation: null,
        editVisibility: "public",
        editFiles: [],
        existingMedia: [],
        isUpdatingPost: false,
        isDeletingPost: false,
    });

    const [paginationState, setPaginationState] = useState({
        nextCursor: null,
        hasMore: true,
        isLoadingMore: false,
    });

    // ✅ UPDATED: Confirmation modal states
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        type: "", // 'post', 'comment', 'reply'
        id: null,
        postId: null,
        commentId: null,
        isLoading: false,
        message: "",
        title: "",
    });

    const handleRemoveEditExistingMedia = (index) => {
        setEditState((prev) => ({
            ...prev,
            existingMedia:
                typeof index === "number"
                    ? prev.existingMedia.filter((_, i) => i !== index)
                    : [],
        }));
    };



    // Likes modal state
    const [likesModal, setLikesModal] = useState({
        isOpen: false,
        postId: null,
    });

    const [floatingHearts, setFloatingHearts] = useState([]);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [isLiking, setIsLiking] = useState({});
    const [showFriendsSidebar, setShowFriendsSidebar] = useState(false);
    const { token } = useAuth();
    const { activeVideoId, setActiveVideoId } = useVideo();

    const navigate = useNavigate();
    const mobileMenuRef = useRef(null);
    
    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    // Initialize app
    useEffect(() => {
        initializeApp();

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

                // Prevent body scroll when ProfileDropDown is open
                useEffect(() => {
                    if (uiState.showImagePreview) {
                        document.body.style.overflow = "hidden";
                    } else {
                        document.body.style.overflow = "";
                    }
                    return () => {
                        document.body.style.overflow = "";
                    };
                }, [uiState.showImagePreview]);

    // ✅ Refresh a single post by ID (for accurate comment counts)
    const refreshSinglePost = async (postId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await apiService.fetchSinglePost(token, postId);

            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to refresh post");
            }

            const updatedPost = response.post || response;

            // Update only that specific post in profileData
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((p) =>
                    p._id === postId ? { ...updatedPost } : p
                ),
            }));
        } catch (err) {
            console.error("Failed to refresh post:", err);
        }
    };

    // State में add करें:
    const [isLikingComment, setIsLikingComment] = useState({});

    // Comment like handler function:
    const handleLikeComment = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const token = localStorage.getItem("token");
        const currentUserId = localStorage.getItem("userId");
        const currentUsername = localStorage.getItem("username");

        if (!currentUsername || !currentUserId) {
            toast.error("You must be logged in to like comments");
            return;
        }

        setIsLikingComment((prev) => ({ ...prev, [commentId]: true }));

        try {
            // Find the current comment state for optimistic update
            const currentPost = profileData.posts.find(
                (post) => post._id === postId
            );
            const currentComment = currentPost?.comments?.find(
                (comment) => comment._id === commentId
            );

            if (!currentComment) {
                throw new Error("Comment not found");
            }

            const isCurrentlyLiked = currentComment.hasUserLiked;
            const currentLikes = currentComment.likes || [];

            // Optimistic update
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    let updatedLikes;

                                    if (isCurrentlyLiked) {
                                        // Unlike - remove user from likes
                                        updatedLikes = currentLikes.filter(
                                            (likeUserId) =>
                                                likeUserId !== currentUserId
                                        );
                                    } else {
                                        // Like - add user to likes
                                        updatedLikes = [
                                            ...currentLikes,
                                            currentUserId,
                                        ];
                                    }

                                    // ✅ UPDATE LOCAL STORAGE
                                    const storedCommentLikes = JSON.parse(
                                        localStorage.getItem("commentLikes") ||
                                            "{}"
                                    );
                                    storedCommentLikes[commentId] =
                                        updatedLikes;
                                    localStorage.setItem(
                                        "commentLikes",
                                        JSON.stringify(storedCommentLikes)
                                    );

                                    return {
                                        ...comment,
                                        likes: updatedLikes,
                                        hasUserLiked: !isCurrentlyLiked,
                                    };
                                }
                                return comment;
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                }),
            }));

            // API call
            const response = await apiService.likeComment(
                commentId,
                currentUserId,
                token
            );

            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to like comment");
            }

            // Final update with server data if available
            if (response.likes !== undefined) {
                setProfileData((prev) => ({
                    ...prev,
                    posts: prev.posts.map((post) => {
                        if (post._id === postId) {
                            const updatedComments = post.comments?.map(
                                (comment) => {
                                    if (comment._id === commentId) {
                                        // ✅ UPDATE LOCAL STORAGE WITH SERVER DATA
                                        const storedCommentLikes = JSON.parse(
                                            localStorage.getItem(
                                                "commentLikes"
                                            ) || "{}"
                                        );
                                        storedCommentLikes[commentId] =
                                            response.likes;
                                        localStorage.setItem(
                                            "commentLikes",
                                            JSON.stringify(storedCommentLikes)
                                        );

                                        return {
                                            ...comment,
                                            likes: response.likes,
                                            hasUserLiked:
                                                response.likes.includes(
                                                    currentUserId
                                                ),
                                        };
                                    }
                                    return comment;
                                }
                            );

                            return { ...post, comments: updatedComments };
                        }
                        return post;
                    }),
                }));
            }
        } catch (error) {
            console.error("Error liking comment:", error);

            // Revert optimistic update on error
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    // ✅ REVERT LOCAL STORAGE ON ERROR
                                    const storedCommentLikes = JSON.parse(
                                        localStorage.getItem("commentLikes") ||
                                            "{}"
                                    );
                                    storedCommentLikes[commentId] =
                                        currentComment.likes || [];
                                    localStorage.setItem(
                                        "commentLikes",
                                        JSON.stringify(storedCommentLikes)
                                    );

                                    return currentComment;
                                }
                                return comment;
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                }),
            }));

            toast.error("Unable to like comment.");
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };
    const initializeApp = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setUiState((prev) => ({ ...prev, loading: true }));
            setPaginationState((prev) => ({ ...prev, isInitialLoading: true }));

            await Promise.all([
                fetchUserData(token),
                fetchUserPosts(token), // cursor nahi pass karo - initial load
                fetchCurrentUserData(token),
            ]);
        } catch (error) {
            console.error("Initialization error:", error);
            const errorMessage = handleApiError(
                error,
                "Failed to load profile data"
            );
            setUiState((prev) => ({
                ...prev,
                error: errorMessage,
            }));
        } finally {
            setUiState((prev) => ({ ...prev, loading: false }));
            setPaginationState((prev) => ({
                ...prev,
                isInitialLoading: false,
            }));
        }
    };

    // API functions
    const fetchCurrentUserData = async (token) => {
        try {
            const result = await apiService.fetchCurrentUser(token);

            if (!result || result.success === false) {
                throw new Error(result?.message || "Failed to fetch user data");
            }

            const userData = result.user;
            if (!userData) {
                throw new Error(result?.message || "Failed to fetch user data");
            }

            // Set profile data from API response only
            setProfileData((prev) => ({
                ...prev,
                profilePic: userData.profilePic,
                username: userData.username || "",
                realName: userData.realname || "",
                email: userData.email || "",
                dateOfBirth: userData.dateOfBirth || null,
            }));

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
            const errorMessage = handleApiError(
                error,
                "Failed to load user data"
            );
            throw new Error(errorMessage);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const result = await apiService.fetchCurrentUser(token);

            if (!result || result.success === false) {
                throw new Error(result?.message || "Failed to fetch user data");
            }

            const userData = result.user;
            if (!userData) {
                throw new Error(result?.message || "Failed to fetch user data");
            }

            // Update profile data from API
            setProfileData((prev) => ({
                ...prev,
                profilePic: userData.profilePic,
                username: userData.username || "",
                realName: userData.realname || "",
                dateOfBirth: userData.dateOfBirth || null,
                isPrivate: userData.isPrivate || false,
            }));
        } catch (error) {
            console.error("Error fetching user data:", error);
            const errorMessage = handleApiError(
                error,
                "Failed to load user data"
            );
            throw new Error(errorMessage);
        }
    };

    const fetchUserPosts = async (token, cursor = null, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setPaginationState((prev) => ({
                    ...prev,
                    isLoadingMore: true,
                }));
            }
            const userId = localStorage.getItem("userId");
            const responseData = await apiService.fetchUserPosts(
                token,
                userId,
                cursor
            );

            if (!responseData || responseData.success === false) {
                throw new Error(
                    responseData?.message || "Failed to fetch posts"
                );
            }

            const postsData = responseData.posts || [];
            const storedLikes = localStorageService.getStoredLikes();

            const currentUsername = localStorage.getItem("username");

            const postsWithComments = postsData.map((post) => {
                // ✅ Server se UTC time aayega, use IST mein convert karen display ke liye
                const createdAtIST = convertUTCToIST(post.createdAt);
                const dateIST = convertUTCToIST(post.date || post.createdAt);

                // Check if current user has liked this post
                const hasUserLiked = post.likesPreview?.some(
                    (like) => like.username === currentUsername
                );

                return {
                    ...post,
                    createdAt: post.createdAt, // Keep as UTC
                    date: post.date || post.createdAt, // Keep as UTC
                    isLiked: hasUserLiked || false,
                    likes: post.likeCount || 0,
                    comments: [],
                    commentCount: post.commentCount || 0,
                    userId: {
                        _id: post.userId?._id || currentUserProfile?._id,
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
            if (isLoadMore) {
                setProfileData((prev) => {
                    const existingIds = new Set(prev.posts.map((p) => p._id));
                    const newPosts = postsWithComments.filter(
                        (post) => !existingIds.has(post._id)
                    );

                    return {
                        ...prev,
                        posts: [...prev.posts, ...newPosts],
                    };
                });
            } else {
                setProfileData((prev) => ({
                    ...prev,
                    posts: postsWithComments,
                }));
            }
            setPaginationState((prev) => ({
                ...prev,
                nextCursor: responseData.nextCursor || null,
                hasMore: !!responseData.nextCursor,
                isLoadingMore: false,
            }));
        } catch (error) {
            console.error("Error fetching posts:", error);
            const errorMessage = handleApiError(error, "Failed to load posts");

            if (isLoadMore) {
                setPaginationState((prev) => ({
                    ...prev,
                    isLoadingMore: false,
                }));
            }
            throw new Error(errorMessage);
        }
    };

    const loadMorePosts = useCallback(async () => {
        const { nextCursor, hasMore, isLoadingMore } = paginationState;

        if (!hasMore || isLoadingMore || !nextCursor) return;

        try {
            const token = localStorage.getItem("token");
            await fetchUserPosts(token, nextCursor, true);
        } catch (error) {
            console.error("Error loading more posts:", error);
            toast.error("Unable to load more posts.");
        }
    }, [paginationState]);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } =
                document.documentElement;

            // Check if user has scrolled to bottom (with 100px threshold)
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadMorePosts]);

    // File upload handlers for edit mode
    const handleEditFileSelect = async (file) => {
        if (!file) return;
        const type = getFileType(file);
        if (type !== "image" && type !== "video") {
            setUiState((prev) => ({
                ...prev,
                error: "Please select an image or video file",
            }));
            return;
        }

        if (type === "video") {
            const duration = await checkVideoDuration(file);
            if (Math.floor(duration) > MAX_VIDEO_DURATION_SEC) {
                setUiState((prev) => ({
                    ...prev,
                    error: `Video must be ${MAX_VIDEO_DURATION_SEC} seconds or less`,
                }));
                return;
            }
        }

        setEditState((prev) => {
            const total =
                (prev.existingMedia?.length || 0) + (prev.editFiles?.length || 0);
            if (total >= MAX_MEDIA_ITEMS) {
                setUiState((s) => ({
                    ...s,
                    error: `Maximum ${MAX_MEDIA_ITEMS} media files allowed`,
                }));
                return prev;
            }
            return {
                ...prev,
                editFiles: [...prev.editFiles, file],
            };
        });
        setUiState((prev) => ({ ...prev, error: null }));
    };

    const handleRemoveEditFile = (index) => {
        setEditState((prev) => ({
            ...prev,
            editFiles: prev.editFiles.filter((_, i) => i !== index),
        }));
    };

    // Comment handlers
    const handleToggleCommentDropdown = async (postId, cursor = null, isLoadMore = false) => {
        if (!isLoadMore && commentState.activeCommentPostId === postId) {
            // If already open, close it
            setCommentState((prev) => ({ ...prev, activeCommentPostId: null }));
            return;
        }

        // For first load, don't open dropdown yet - just start fetching
        // For load more, keep it open
        setCommentState((prev) => ({
            ...prev,
            activeCommentPostId: isLoadMore ? prev.activeCommentPostId : prev.activeCommentPostId,
            isFetchingComments: true,
        }));

        try {
            const token = localStorage.getItem("token");
            const responseData = await apiService.fetchComments(postId, token, cursor);

            if (!responseData || responseData.success === false) {
                throw new Error(
                    responseData?.message || "Failed to load comments"
                );
            }

            const comments = responseData.comments || [];
            // ✅ USE THE COUNT FROM API RESPONSE, NOT comments.length
            const commentCount = responseData.count || comments.length;

            // handleToggleCommentDropdown function में comments process करते समय
            const commentsWithReplies = comments.map((comment) => {
                // ✅ LOAD LIKES FROM LOCALSTORAGE
                const storedCommentLikes = JSON.parse(
                    localStorage.getItem("commentLikes") || "{}"
                );
                const commentLikes =
                    storedCommentLikes[comment._id] || comment.likes || [];
                const currentUserId = localStorage.getItem("userId");

                return {
                    ...comment,
                    replies: comment.replies || [],
                    showReplies: false,
                    replyCount:
                        comment.replyCount || comment.replies?.length || 0,
                    likes: commentLikes,
                    hasUserLiked: commentLikes.includes(currentUserId),
                };
            });

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: isLoadMore 
                                  ? [...(post.comments || []), ...commentsWithReplies]
                                  : commentsWithReplies,
                              // ✅ FIXED: Use the count from API response
                              commentCount: commentCount,
                          }
                        : post
                ),
            }));

            // Store next cursor and open dropdown (for first load)
            setCommentState((prev) => ({
                ...prev,
                commentsNextCursor: {
                    ...prev.commentsNextCursor,
                    [postId]: responseData.nextCursor || null,
                },
                activeCommentPostId: postId, // Open dropdown after successful load
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Unable to load comments.");
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
            const username = localStorage.getItem("username");
            const currentUserId = localStorage.getItem("userId");

            // ✅ UTC time use karo comment ke liye
            const response = await apiService.addComment(
                postId,
                commentState.commentContent[postId],
                token
            );

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to add comment");
            }

            // ✅ FIXED: Use server-provided createdAt timestamp from response
            const serverComment = response.comment || response;

            console.log("✅ Server comment received:", serverComment); // Debug ke liye

            // ✅ FIXED: Add new comment at the BEGINNING with proper server data
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [
                                  {
                                      // ✅ USE ALL SERVER DATA INCLUDING createdAt
                                      ...serverComment,
                                      // ✅ OVERRIDE with proper user data structure
                                      userId: {
                                          _id: currentUserId,
                                          username: username,
                                          realname: profileData.realName,
                                          profilePic: profileData.profilePic,
                                      },
                                      username: username,
                                      profilePic: profileData.profilePic,
                                      // ✅ IMPORTANT: Ensure these fields are present
                                      isLiked: false,
                                      likes: serverComment.likes || [],
                                      hasUserLiked: false,
                                      replies: [],
                                      replyCount: 0,
                                      showReplies: false,
                                  },
                                  ...(post.comments || []),
                              ],
                              // ✅ FIXED: Increment comment count properly
                              commentCount: (post.commentCount || 0) + 1,
                          }
                        : post
                ),
            }));

            setCommentState((prev) => ({
                ...prev,
                commentContent: { ...prev.commentContent, [postId]: "" },
            }));

            toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Unable to add comment.");
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

    // ✅ UPDATED: Comment deletion with modal
    const handleDeleteComment = (commentId, postId) => {
        setConfirmationModal({
            isOpen: true,
            type: "comment",
            id: commentId,
            postId: postId,
            isLoading: false,
            title: "Delete Comment",
            message: "Are you sure you want to delete this comment?",
        });
    };

    const handleConfirmDeleteComment = async () => {
        const { id: commentId, postId } = confirmationModal;

        try {
            setConfirmationModal((prev) => ({ ...prev, isLoading: true }));

            const token = localStorage.getItem("token");
            const response = await apiService.deleteComment(
                commentId,
                postId,
                token
            );

            if (!response || response.success === false) {
                throw new Error(
                    response?.message || "Failed to delete comment"
                );
            }

            // ✅ Refresh only that post to update commentCount
            await refreshSinglePost(postId);

            // ✅ Close the comment modal/dropdown
            setCommentState((prev) => ({
                ...prev,
                activeCommentPostId: null,
            }));

            handleCloseConfirmationModal();
        } catch (error) {
            console.error("Error deleting comment:", error);
            setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
        }
    };

    // Reply handlers - UPDATED
    const handleToggleReplyInput = (inputKey, closeOthers = true) => {
        setCommentState((prev) => ({
            ...prev,
            activeReplyInputs: closeOthers
                ? { [inputKey]: !prev.activeReplyInputs[inputKey] } // Close all others, open only this one
                : {
                      ...prev.activeReplyInputs,
                      [inputKey]: !prev.activeReplyInputs[inputKey],
                  }, // Toggle only this one
            replyContent: {
                ...prev.replyContent,
                [inputKey]: prev.replyContent[inputKey] || "",
            },
        }));
    };

    const handleReplySubmit = async (
        postId,
        commentId,
        replyInputKey = null
    ) => {
        // FIXED: Use replyInputKey to get the specific content
        const content = commentState.replyContent[replyInputKey];

        if (!content?.trim()) {
            toast.error("Reply cannot be empty");
            return;
        }

        try {
            setCommentState((prev) => ({
                ...prev,
                isReplying: { ...prev.isReplying, [replyInputKey]: true },
            }));

            const token = localStorage.getItem("token");
            const currentUsername = localStorage.getItem("username");
            const currentRealName = localStorage.getItem("realname");
            const currentProfilePic = localStorage.getItem("profilePic");
            const currentUserId = localStorage.getItem("userId");

            // For ALL replies, we use the main commentId for API call
            const targetCommentId = commentId;

            // ✅ FIXED: Use server UTC time instead of client time
            const optimisticReply = {
                _id: `temp-${Date.now()}`,
                content: content,
                likes: [],
                hasUserLiked: false,
                createdAt: new Date().toISOString(), // ✅ Use current UTC time
                userId: {
                    _id: currentUserId,
                    username: currentUsername,
                    realname: currentRealName,
                    profilePic: currentProfilePic,
                },
                username: currentUsername,
                profilePic: currentProfilePic,
            };

            // ✅ CHANGED: New reply added at the BEGINNING
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              commentCount: (post.commentCount || 0) + 1,
                              comments: post.comments.map((comment) =>
                                  comment._id === commentId
                                      ? {
                                            ...comment,
                                            // ✅ CHANGED: Add new reply at the beginning
                                            replies: [
                                                optimisticReply,
                                                ...(comment.replies || []),
                                            ],
                                            replyCount:
                                                (comment.replyCount || 0) + 1,
                                            // ✅ AUTOMATICALLY OPEN REPLIES DROPDOWN
                                            showReplies: true,
                                        }
                                      : comment
                              ),
                          }
                        : post
                ),
            }));

            // API call - for ALL replies, we use the main commentId
            const response = await apiService.addCommentReply(
                targetCommentId, // Always use the main commentId
                content,
                postId,
                token
            );

            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to add reply");
            }

            // ✅ FIXED: Use server-provided createdAt timestamp
            const serverReply = response.comment || response;

            // Update with real data from API if available
            if (serverReply) {
                setProfileData((prev) => ({
                    ...prev,
                    posts: prev.posts.map((post) =>
                        post._id === postId
                            ? {
                                  ...post,
                                  comments: post.comments.map((comment) => {
                                      if (comment._id === commentId) {
                                          const updatedReplies = (
                                              comment.replies || []
                                          ).map((reply) =>
                                              reply._id === optimisticReply._id
                                                  ? {
                                                        ...serverReply,
                                                        // ✅ USE SERVER TIMESTAMP
                                                        createdAt:
                                                            serverReply.createdAt ||
                                                            new Date().toISOString(),
                                                        userId: serverReply.userId || {
                                                            _id: currentUserId,
                                                            username:
                                                                currentUsername,
                                                            realname:
                                                                currentRealName,
                                                            profilePic:
                                                                currentProfilePic,
                                                        },
                                                        username:
                                                            serverReply.username ||
                                                            currentUsername,
                                                        profilePic:
                                                            serverReply.profilePic ||
                                                            currentProfilePic,
                                                        hasUserLiked: false,
                                                        likes:
                                                            serverReply.likes ||
                                                            [],
                                                    }
                                                  : reply
                                          );
                                          return {
                                              ...comment,
                                              replies: updatedReplies,
                                              // ✅ KEEP REPLIES DROPDOWN OPEN
                                              showReplies: true,
                                          };
                                      }
                                      return comment;
                                  }),
                              }
                            : post
                    ),
                }));
            }

            // Clear the input and close it
            setCommentState((prev) => ({
                ...prev,
                replyContent: { ...prev.replyContent, [replyInputKey]: "" },
                activeReplyInputs: {
                    ...prev.activeReplyInputs,
                    [replyInputKey]: false,
                },
            }));
        } catch (error) {
            console.error("❌ Error adding reply:", error);

            // Revert optimistic update on error
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              commentCount: Math.max(
                                  0,
                                  (post.commentCount || 0) - 1
                              ),
                              comments: post.comments.map((comment) =>
                                  comment._id === commentId
                                      ? {
                                            ...comment,
                                            replies: (
                                                comment.replies || []
                                            ).filter(
                                                (reply) =>
                                                    !reply._id.startsWith(
                                                        "temp-"
                                                    )
                                            ),
                                            replyCount: Math.max(
                                                0,
                                                (comment.replyCount || 0) - 1
                                            ),
                                        }
                                      : comment
                              ),
                          }
                        : post
                ),
            }));

            toast.error("Unable to add reply.");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isReplying: { ...prev.isReplying, [replyInputKey]: false },
            }));
        }
    };

    // UPDATED: handleSetReplyContent function
    const handleSetReplyContent = (key, content) => {
        setCommentState((prev) => ({
            ...prev,
            replyContent: {
                ...prev.replyContent,
                [key]: content,
            },
        }));
    };

    const handleToggleReplies = async (postId, commentId, cursor = null, isLoadMore = false) => {
        // Find the current comment state
        const post = profileData.posts.find((p) => p._id === postId);
        const comment = post?.comments.find((c) => c._id === commentId);

        const isRepliesVisible = comment?.showReplies;

        // If replies are NOT visible (chevron UP) or loading more, fetch replies
        if (!isRepliesVisible || isLoadMore) {
            try {
                setCommentState((prev) => ({
                    ...prev,
                    isFetchingReplies: {
                        ...prev.isFetchingReplies,
                        [commentId]: true,
                    },
                }));
                let cursorCreatedAt = null;
                let cursorId = null;
                if (cursor && typeof cursor === 'object' && cursor.createdAt && cursor._id) {
                    cursorCreatedAt = cursor.createdAt;
                    cursorId = cursor._id;
                }
                const token = localStorage.getItem("token");
                const response = await apiService.fetchCommentReplies(
                    commentId,
                    token,
                    cursorCreatedAt,
                    cursorId
                );

                if (!response || response.success === false) {
                    throw new Error(
                        response?.message || "Failed to load replies"
                    );
                }

                // CORRECT MAPPING - Use profilepic (small p) from API
                const replies = (response.replies || []).map((reply) => {
                    // Profile picture API se aa raha hai reply.user.profilepic mein
                    const profilePic = reply.user?.profilepic;

                    const username = reply.user?.username || "unknown";
                    const realname = reply.user?.realname || username;

                    return {
                        ...reply,
                        // Proper user data structure with profilePic
                        userId: {
                            _id: reply.user?.id || "unknown",
                            username: username,
                            realname: realname,
                            profilePic: profilePic,
                        },
                        username: username,
                        profilePic: profilePic,
                        hasUserLiked:
                            reply.likes &&
                            reply.likes.includes(
                                localStorage.getItem("userId")
                            ),
                        likes: reply.likes || [],
                    };
                });

                console.log(
                    "✅ Processed replies:",
                    replies.map((r) => ({
                        username: r.username,
                        profilePic: r.profilePic,
                        userIdProfilePic: r.userId.profilePic,
                    }))
                );

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
                                                replies: isLoadMore 
                                                    ? [...(comment.replies || []), ...replies]
                                                    : replies,
                                                replyCount: isLoadMore 
                                                    ? (comment.replyCount || 0) + replies.length
                                                    : replies.length,
                                                showReplies: true,
                                            }
                                          : comment
                                  ),
                              }
                            : post
                    ),
                }));

                // Store next cursor for replies
                setCommentState((prev) => ({
                    ...prev,
                    repliesNextCursor: {
                        ...prev.repliesNextCursor,
                        [commentId]: response.nextCursor || null,
                    },
                }));
            } catch (error) {
                console.error("Error fetching replies:", error);
                toast.error("Unable to load replies.");
            } finally {
                setCommentState((prev) => ({
                    ...prev,
                    isFetchingReplies: {
                        ...prev.isFetchingReplies,
                        [commentId]: false,
                    },
                }));
            }
        } else {
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
                                            showReplies: false,
                                        }
                                      : comment
                              ),
                          }
                        : post
                ),
            }));
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
            const response = await apiService.likeReply(
                replyId,
                currentUserId,
                token
            );

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to like reply");
            }

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
            toast.error("Unable to like reply.");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isLikingReply: { ...prev.isLikingReply, [replyId]: false },
            }));
        }
    };

    // ✅ UPDATED: Reply deletion with modal
    const handleDeleteReply = (replyId, commentId) => {
        setConfirmationModal({
            isOpen: true,
            type: "reply",
            id: replyId,
            commentId: commentId,
            isLoading: false,
            title: "Delete Reply",
            message: "Are you sure you want to delete this reply?",
        });
    };

    const handleConfirmDeleteReply = async () => {
        const { id: replyId, commentId } = confirmationModal;

        try {
            setConfirmationModal((prev) => ({ ...prev, isLoading: true }));

            const token = localStorage.getItem("token");
            const response = await apiService.deleteReply(replyId, token);

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to delete reply");
            }

            // Update comment count for replies
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) => ({
                    ...post,
                    commentCount: Math.max(0, (post.commentCount || 0) - 1),
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

            handleCloseConfirmationModal();
        } catch (error) {
            console.error("Error deleting reply:", error);
            setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
        }
    };

    // Likes modal handlers
    const handleShowLikesModal = (postId) => {
        setLikesModal({
            isOpen: true,
            postId: postId,
        });
    };

    const handleCloseLikesModal = () => {
        setLikesModal({
            isOpen: false,
            postId: null,
        });
    };

    // Event handlers
    const handleProfilePicUpdate = async (file) => {
        if (!file) return;

        try {
            setUploadingProfilePic(true);
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("media", file);

            const responseData = await apiService.uploadProfilePic(
                token,
                formData
            );

            if (!responseData || responseData.success === false) {
                throw new Error(
                    responseData?.message || "Failed to update profile picture"
                );
            }

            if (responseData.profilePicUrl) {
                const imageUrl = responseData.profilePicUrl;
                setProfileData((prev) => ({
                    ...prev,
                    profilePic: imageUrl,
                    posts: prev.posts.map((post) => {
                        // Update for both author and userId keys
                        let updatedPost = { ...post };
                        if (post.author?._id === currentUserProfile?._id) {
                            updatedPost.author = { ...post.author, profilePic: imageUrl };
                        }
                        if (post.userId?._id === currentUserProfile?._id) {
                            updatedPost.userId = { ...post.userId, profilePic: imageUrl };
                        }
                        return updatedPost;
                    }),
                }));
                setCurrentUserProfile((prev) => prev ? { ...prev, profilePic: imageUrl } : prev);
                // Update localStorage for navbar and other components
                localStorage.setItem("profilePic", imageUrl);
                // Dispatch event for instant navbar/profile sync
                window.dispatchEvent(new Event("profilePicUpdated"));
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Unable to update profile picture.");
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

            if (!result || result.success === false) {
                throw new Error(result?.message || "Failed to update bio");
            }

            setProfileData((prev) => ({
                ...prev,
                bio: result.description || newBio,
            }));
        } catch (error) {
            console.error("Bio update failed:", error);
            toast.error("Unable to update bio.");
            throw error;
        }
    };

    const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

    const handleCreatePost = async (content, mediaItems, selectedDate, location = null, visibility = "public") => {
        const isVerified = currentUserProfile?.user?.isEmailVerified || currentUserProfile?.isEmailVerified;
        if (!isVerified) {
            setShowEmailVerificationModal(true);
            return;
        }

        const items = Array.isArray(mediaItems) ? mediaItems : [];
        if (!content.trim() && items.length === 0) {
            toast.error("Post content or media cannot be empty");
            return;
        }

        try {
            setPostState((prev) => ({ ...prev, isCreatingPost: true }));
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("content", content);
            formData.append("createdAt", selectedDate);
            formData.append("date", selectedDate);
            formData.append("visibility", visibility === "friends" ? "friends" : "public");
            items.forEach((item) => {
                if (item?.file) formData.append("media", item.file);
            });
            if (location?.name) {
                formData.append("location", JSON.stringify(location));
            }

            const response = await apiService.createPost(token, formData);

            if (!response || response.success === false) {
                throw new Error(
                    response?.message || response?.error || "Failed to create post"
                );
            }

            await Promise.all([
                fetchUserPosts(token),
                fetchCurrentUserData(token),
            ]);
        } catch (error) {
            console.error("Post error:", error);
            toast.error(error.message || "Failed to create post");
        } finally {
            setPostState((prev) => ({ ...prev, isCreatingPost: false }));
        }
    };

    const handleLike = async (postId, event) => {
        if (isLiking[postId]) return;

        setIsLiking((prev) => ({ ...prev, [postId]: true }));

        try {
            const token = localStorage.getItem("token");
            const currentUserId = localStorage.getItem("userId");
            const currentUsername = localStorage.getItem("username");

            // Find the current post
            const currentPost = profileData.posts.find(
                (post) => post._id === postId
            );
            if (!currentPost) return;

            const isCurrentlyLiked = currentPost.isLiked;

            if (!isCurrentlyLiked) {
                let rect;

                if (event && event.target) {
                    const likeButton =
                        event.target.closest("button") || event.currentTarget;
                    rect = likeButton.getBoundingClientRect();
                } else {
                    rect = {
                        left: window.innerWidth / 2,
                        top: window.innerHeight / 2,
                        width: 0,
                        height: 0,
                    };
                }

                // Floating hearts generate karen - SAME AS MAIN FEED
                setFloatingHearts((hearts) => {
                    const newHearts = [
                        ...hearts,
                        {
                            id: Date.now() + Math.random(),
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                        },
                    ];
                    return newHearts;
                });
            }

            // API call
            const response = await apiService.likePost(postId, currentUserId, token);
            // Refresh the post after like/dislike for real-time update
            await refreshSinglePost(postId);
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Unable to toggle like.");
        } finally {
            setIsLiking((prev) => ({ ...prev, [postId]: false }));
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
                editVisibility:
                    postToEdit.visibility === "friends" ? "friends" : "public",
                editLocation: postToEdit.location?.name
                    ? {
                          name: postToEdit.location.name,
                          placeId: postToEdit.location.placeId || null,
                          lat: postToEdit.location.lat ?? null,
                          lng: postToEdit.location.lng ?? null,
                      }
                    : null,
                editFiles: [],
                existingMedia: getPostMediaItems(postToEdit),
            }));
        }
    };

    const handleUpdatePost = async (postId) => {
        const existingMedia = editState.existingMedia || [];
        const newFiles = editState.editFiles || [];

        if (
            !editState.editContent.trim() &&
            existingMedia.length === 0 &&
            newFiles.length === 0
        ) {
            toast.error("Post content or media cannot be empty");
            return;
        }

        if (existingMedia.length + newFiles.length > MAX_MEDIA_ITEMS) {
            toast.error(`Maximum ${MAX_MEDIA_ITEMS} media files allowed`);
            return;
        }

        try {
            setEditState((prev) => ({ ...prev, isUpdatingPost: true }));
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("content", editState.editContent);
            formData.append(
                "visibility",
                editState.editVisibility === "friends" ? "friends" : "public"
            );
            formData.append(
                "keepMedia",
                JSON.stringify(
                    existingMedia.map((m) => ({
                        publicId: m.publicId || "",
                        url: m.url,
                        type: m.type,
                    }))
                )
            );
            newFiles.forEach((file) => formData.append("media", file));

            if (editState.editLocation?.name) {
                formData.append(
                    "location",
                    JSON.stringify({
                        name: editState.editLocation.name,
                        placeId: editState.editLocation.placeId || null,
                        lat: editState.editLocation.lat ?? null,
                        lng: editState.editLocation.lng ?? null,
                    })
                );
            } else {
                formData.append("location", "remove");
            }

            const response = await apiService.updatePost(
                token,
                postId,
                formData,
                true
            );

            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to update post");
            }

            await refreshSinglePost(postId);

            setEditState({
                editingPostId: null,
                editContent: "",
                editLocation: null,
                editVisibility: "public",
                editFiles: [],
                existingMedia: [],
                isUpdatingPost: false,
                isDeletingPost: false,
            });

            toast.success("Post updated successfully!");
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error(error.message || "Unable to update post.");
        } finally {
            setEditState((prev) => ({ ...prev, isUpdatingPost: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditState({
            editingPostId: null,
            editContent: "",
            editLocation: null,
            editVisibility: "public",
            editFiles: [],
            existingMedia: [],
            isUpdatingPost: false,
            isDeletingPost: false,
        });
    };

    // ✅ UPDATED: Delete post with confirmation modal
    const handleDeletePostClick = (postId) => {
        setConfirmationModal({
            isOpen: true,
            type: "post",
            id: postId,
            isLoading: false,
            title: "Delete Post",
            message:
                "Are you sure you want to delete this post? This action cannot be undone.",
        });
    };

    const handleConfirmDeletePost = async () => {
        const { id: postId } = confirmationModal;

        try {
            setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
            const token = localStorage.getItem("token");
            const response = await apiService.deletePost(token, postId);

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to delete post");
            }

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.filter((post) => post._id !== postId),
            }));
            await fetchCurrentUserData(token);
            const storedLikes = localStorageService.getStoredLikes();
            delete storedLikes[postId];
            localStorage.setItem("postLikes", JSON.stringify(storedLikes));

            handleCloseConfirmationModal();
        } catch (error) {
            console.error("Error deleting post:", error);
            setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
        }
    };

    // ✅ UPDATED: Unified confirmation handler
    const handleConfirmDelete = async () => {
        const { type, id, postId, commentId } = confirmationModal;

        switch (type) {
            case "post":
                await handleConfirmDeletePost();
                break;
            case "comment":
                await handleConfirmDeleteComment();
                break;
            case "reply":
                await handleConfirmDeleteReply();
                break;
            default:
                console.error("Unknown deletion type:", type);
        }
    };

    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetchUserData(token);
            await fetchCurrentUserData(token);
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    const handleFriendsClick = () => {
        setShowFriendsSidebar(!showFriendsSidebar);
    };

    // ✅ UPDATED: Unified confirmation modal close
    const handleCloseConfirmationModal = () => {
        setConfirmationModal({
            isOpen: false,
            type: "",
            id: null,
            postId: null,
            commentId: null,
            isLoading: false,
            message: "",
            title: "",
        });
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
        ? new Date(convertUTCToIST(joinedDate)).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";

    if (uiState.loading) {
        return <ProfileSkeleton isDarkMode={uiState.darkMode} />;
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
                
                <EmailVerificationModal
                    isOpen={showEmailVerificationModal}
                    onClose={() => setShowEmailVerificationModal(false)}
                    token={token}
                    onVerifySuccess={() => {
                        setShowEmailVerificationModal(false);
                        window.location.reload();
                    }}
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
                    style={{
                        zIndex: 9999,
                    }}
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

                {/* Likes Modal */}
                <LikesModal
                    postId={likesModal.postId}
                    isOpen={likesModal.isOpen}
                    onClose={handleCloseLikesModal}
                    token={localStorage.getItem("token")}
                    isDarkMode={uiState.darkMode}
                />

                {/* ✅ UPDATED: Unified Confirmation Modal */}
                <ConfirmationModal
                    isOpen={confirmationModal.isOpen}
                    onClose={handleCloseConfirmationModal}
                    onConfirm={handleConfirmDelete}
                    title={confirmationModal.title}
                    message={confirmationModal.message}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDarkMode={uiState.darkMode}
                    isLoading={confirmationModal.isLoading}
                    type="delete"
                />

                <Navbar onDarkModeChange={handleDarkModeChange} />

                <div className="pt-4 sm:pt-6 pb-12 px-4">
                    <ProfileHeader
                        profilePic={profileData.profilePic}
                        username={profileData.username}
                        realName={profileData.realName}
                        email={profileData.email}
                        bio={profileData.bio}
                        dateOfBirth={profileData.dateOfBirth}
                        posts={profileData.posts}
                        stats={profileData.stats}
                        isDarkMode={uiState.darkMode}
                        joinedDate={formattedDate}
                        isPrivate={profileData.isPrivate}
                        onProfilePicUpdate={handleProfilePicUpdate}
                        onBioUpdate={handleBioUpdate}
                        uploadingProfilePic={uploadingProfilePic}
                        apiService={apiService}
                        toast={toast}
                        onFriendsClick={handleFriendsClick}
                        onProfileUpdate={async (result) => {
                            // Update username everywhere in posts/comments/replies for instant UI update
                            setProfileData((prev) => {
                                const newUsername = result.username || prev.username;
                                const newRealName = result.realname || prev.realName;
                                // Deep clone posts to avoid mutating state directly
                                const updatedPosts = prev.posts.map((post) => {
                                    // Update post userId.username
                                    let updatedPost = { ...post };
                                    if (updatedPost.userId && typeof updatedPost.userId === 'object') {
                                        updatedPost.userId = {
                                            ...updatedPost.userId,
                                            username: newUsername,
                                            realname: newRealName,
                                        };
                                    }
                                    // Update comments
                                    if (Array.isArray(updatedPost.comments)) {
                                        updatedPost.comments = updatedPost.comments.map((comment) => {
                                            let updatedComment = { ...comment };
                                            if (updatedComment.userId && typeof updatedComment.userId === 'object') {
                                                updatedComment.userId = { ...updatedComment.userId, username: newUsername };
                                            }
                                            // Update replies
                                            if (Array.isArray(updatedComment.replies)) {
                                                updatedComment.replies = updatedComment.replies.map((reply) => {
                                                    let updatedReply = { ...reply };
                                                    if (updatedReply.userId && typeof updatedReply.userId === 'object') {
                                                        updatedReply.userId = { ...updatedReply.userId, username: newUsername };
                                                    }
                                                    return updatedReply;
                                                });
                                            }
                                            return updatedComment;
                                        });
                                    }
                                    return updatedPost;
                                });
                                return {
                                    ...prev,
                                    username: newUsername,
                                    realName: newRealName,
                                    email: result.email || prev.email,
                                    bio: result.description ?? prev.bio,
                                    dateOfBirth: result.dateOfBirth ?? prev.dateOfBirth,
                                    isPrivate: result.isPrivate ?? prev.isPrivate,
                                    posts: updatedPosts,
                                };
                            });

                            if (result.username) {
                                localStorage.setItem("username", result.username);
                            }
                            if (result.realname) {
                                localStorage.setItem("realname", result.realname);
                            }

                            await refreshUserData();
                        }}
                    />
                    <FriendsSidebar
                        isOpen={showFriendsSidebar}
                        onClose={() => setShowFriendsSidebar(false)}
                        darkMode={uiState.darkMode}
                        token={localStorage.getItem("token")}
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
                        {profileData.posts.length === 0 && !uiState.loading ? (
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
                                        onDeletePost={handleDeletePostClick}
                                        onLikeComment={handleLikeComment}
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
                                        // Likes modal prop
                                        onShowLikesModal={handleShowLikesModal}
                                        // Like loading state
                                        isLiking={isLiking[post._id]}
                                        // Edit state props
                                        editingPostId={editState.editingPostId}
                                        editContent={editState.editContent}
                                        onEditContentChange={(content) =>
                                            setEditState((prev) => ({
                                                ...prev,
                                                editContent: content,
                                            }))
                                        }
                                        editLocation={editState.editLocation}
                                        onEditLocationChange={(loc) =>
                                            setEditState((prev) => ({
                                                ...prev,
                                                editLocation: loc,
                                            }))
                                        }
                                        editVisibility={editState.editVisibility}
                                        onEditVisibilityChange={(visibility) =>
                                            setEditState((prev) => ({
                                                ...prev,
                                                editVisibility: visibility,
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
                                        // Existing media props
                                        existingMedia={
                                            editState.editingPostId === post._id
                                                ? editState.existingMedia
                                                : []
                                        }
                                        onRemoveExistingMedia={handleRemoveEditExistingMedia}
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
                                        // Pagination props
                                        commentsNextCursor={
                                            commentState.commentsNextCursor
                                        }
                                        repliesNextCursor={
                                            commentState.repliesNextCursor
                                        }
                                    />
                                ))}
                            </div>
                        )}
                        {paginationState.isLoadingMore && (
                            <div className="flex justify-center items-center py-6">
                                <div
                                    className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                                        uiState.darkMode
                                            ? "border-white"
                                            : "border-blue-500"
                                    }`}
                                ></div>
                                <span
                                    className={`ml-3 ${
                                        uiState.darkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Loading more posts...
                                </span>
                            </div>
                        )}

                        {/* End of Posts Message */}
                        {!paginationState.hasMore &&
                            profileData.posts.length > 0 && (
                                <div
                                    className={`text-center py-6 ${
                                        uiState.darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    <p>You've reached the end of your posts</p>
                                </div>
                            )}
                    </section>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ProfilePage;