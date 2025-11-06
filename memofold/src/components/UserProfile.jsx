import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
    FaArrowLeft,
    FaUser,
    FaCalendar,
    FaMapMarker,
    FaLink,
    FaHeart,
    FaRegHeart,
    FaCommentDots,
    FaTimes,
    FaTrashAlt,
    FaComment,
    FaReply,
    FaChevronDown,
    FaChevronRight,
    FaCalendarAlt,
    FaUserFriends,
    FaChartBar,
    FaMapMarkerAlt,
    FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";
import config from "../hooks/config";
import Navbar from "./navbar/navbar";
import { apiService } from "../services/api";
import LikesModal from "./mainFeed/LikesModal";
import FriendsSidebar from "../components/navbar/FriendsSidebar";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import FriendButton from "../components/FriendButton";
import ConfirmationModal from "../common/ConfirmationModal"; // ✅ ADDED

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { token, username, user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [userDescription, setUserDescription] = useState("");
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [isLiking, setIsLiking] = useState({});
    const [isCommenting, setIsCommenting] = useState({});
    const [commentContent, setCommentContent] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [isLikingComment, setIsLikingComment] = useState({});
    const [isDeletingComment, setIsDeletingComment] = useState({});
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [userStats, setUserStats] = useState({
        postCount: 0,
        friendsCount: 0,
    });
    const [showFriendsSidebar, setShowFriendsSidebar] = useState(false);

    // Likes modal state
    const [likesModal, setLikesModal] = useState({
        isOpen: false,
        postId: null,
    });

    // ✅ ADDED: Confirmation modal states
    const [deleteCommentModal, setDeleteCommentModal] = useState({
        isOpen: false,
        commentId: null,
        postId: null,
        commentData: null,
    });

    const [deleteReplyModal, setDeleteReplyModal] = useState({
        isOpen: false,
        replyId: null,
        commentId: null,
        postId: null,
        replyData: null,
    });

    const navigateToProfile = (userId) => {
        // Check if this is the current user
        const isCurrentUser = userId === user?._id;

        if (isCurrentUser) {
            navigate("/profile");
        } else {
            navigate(`/user/${userId}`);
        }
    };

    // Reply states
    const [activeReplies, setActiveReplies] = useState(() => {
        try {
            const stored = localStorage.getItem("userProfileActiveReplies");
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });
    const [replyContent, setReplyContent] = useState({});
    const [isReplying, setIsReplying] = useState({});
    const [isLikingReply, setIsLikingReply] = useState({});
    const [isDeletingReply, setIsDeletingReply] = useState({});

    // Floating hearts state
    const [floatingHearts, setFloatingHearts] = useState([]);

    // Image preview states
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });
    const imagePreviewRef = useRef(null);

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    const [paginationState, setPaginationState] = useState({
        nextCursor: null,
        hasMore: true,
        isLoadingMore: false,
    });

    // Track which comment has reply input open
    const [activeReplyInput, setActiveReplyInput] = useState(null);

    // ✅ Fetch and refresh only one post (used after comment/reply delete)
    const refreshSinglePost = async (postId) => {
        try {
            const updatedData = await apiService.fetchSinglePost(token, postId);
            const updatedPost = updatedData.post || updatedData;

            setUserPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p._id === postId ? { ...updatedPost } : p
                )
            );
        } catch (err) {
            console.error("Failed to refresh post:", err);
        }
    };

    // ✅ ADDED: Modal handlers for comment deletion
    const handleOpenDeleteCommentModal = (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const post = userPosts.find((p) => p._id === postId);
        const comment = post?.comments?.find((c) => c._id === commentId);

        if (!post || !comment) {
            setError("Comment not found");
            return;
        }

        const isCommentOwner = comment.userId?.username === username;
        const isPostOwner = post.userId?.username === username;

        if (!isCommentOwner && !isPostOwner) {
            setError("You don't have permission to delete this comment");
            return;
        }

        setDeleteCommentModal({
            isOpen: true,
            commentId,
            postId,
            commentData: comment,
        });
    };

    const handleConfirmDeleteComment = async () => {
        const { commentId, postId } = deleteCommentModal;

        setIsDeletingComment((prev) => ({ ...prev, [commentId]: true }));

        const originalPosts = [...userPosts];

        try {
            // Find the actual comment object
            const post = userPosts.find((p) => p._id === postId);
            const comment = post?.comments?.find((c) => c._id === commentId);
            const replyIds = comment?.replies?.map((reply) => reply._id) || [];

            setUserPosts(
                userPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments =
                            post.comments?.filter(
                                (comment) => comment._id !== commentId
                            ) || [];
                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: Math.max(
                                0,
                                (post.commentCount || 1) - 1
                            ),
                        };
                    }
                    return post;
                })
            );

            const storedCommentLikes = getStoredCommentLikes();
            delete storedCommentLikes[commentId];
            replyIds.forEach((replyId) => delete storedCommentLikes[replyId]);
            localStorage.setItem(
                "commentLikes",
                JSON.stringify(storedCommentLikes)
            );

            await apiService.deleteComment(commentId, postId, token);
            await refreshSinglePost(postId);
            setActiveCommentPostId(null);
        } catch (err) {
            console.error("Error deleting comment:", err);
            setError(err.message);
            setUserPosts(originalPosts);
        } finally {
            setIsDeletingComment((prev) => ({ ...prev, [commentId]: false }));
            setDeleteCommentModal({
                isOpen: false,
                commentId: null,
                postId: null,
                commentData: null,
            });
        }
    };

    const handleCloseDeleteCommentModal = () => {
        setDeleteCommentModal({
            isOpen: false,
            commentId: null,
            postId: null,
            commentData: null,
        });
    };

    // ✅ ADDED: Modal handlers for reply deletion
    const handleOpenDeleteReplyModal = (replyId, commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const post = userPosts.find((p) => p._id === postId);
        const comment = post?.comments?.find((c) => c._id === commentId);
        const reply = comment?.replies?.find((r) => r._id === replyId);

        if (!post || !comment || !reply) {
            setError("Reply not found");
            return;
        }

        const isReplyOwner = reply.userId?.username === username;
        const isCommentOwner = comment.userId?.username === username;
        const isPostOwner = post.userId?.username === username;

        if (!isReplyOwner && !isCommentOwner && !isPostOwner) {
            setError("You don't have permission to delete this reply");
            return;
        }

        setDeleteReplyModal({
            isOpen: true,
            replyId,
            commentId,
            postId,
            replyData: reply,
        });
    };

    const handleConfirmDeleteReply = async () => {
        const { replyId, commentId, postId } = deleteReplyModal;

        setIsDeletingReply((prev) => ({ ...prev, [replyId]: true }));

        const originalPosts = [...userPosts];

        try {
            setUserPosts(
                userPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const updatedReplies =
                                        comment.replies?.filter(
                                            (reply) => reply._id !== replyId
                                        ) || [];
                                    return {
                                        ...comment,
                                        replies: updatedReplies,
                                        replyCount: updatedReplies.length,
                                    };
                                }
                                return comment;
                            }
                        );
                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: (post.commentCount || 0) - 1,
                        };
                    }
                    return post;
                })
            );

            const storedReplyLikes = getStoredReplyLikes();
            delete storedReplyLikes[replyId];
            localStorage.setItem(
                "replyLikes",
                JSON.stringify(storedReplyLikes)
            );

            await apiService.deleteReply(replyId, token);
        } catch (err) {
            console.error("Error deleting reply:", err);
            setError(err.message);
            setUserPosts(originalPosts);
        } finally {
            setIsDeletingReply((prev) => ({ ...prev, [replyId]: false }));
            setDeleteReplyModal({
                isOpen: false,
                replyId: null,
                commentId: null,
                postId: null,
                replyData: null,
            });
        }
    };

    const handleCloseDeleteReplyModal = () => {
        setDeleteReplyModal({
            isOpen: false,
            replyId: null,
            commentId: null,
            postId: null,
            replyData: null,
        });
    };

    // Save activeReplies to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(
            "userProfileActiveReplies",
            JSON.stringify(activeReplies)
        );
    }, [activeReplies]);

    // Handle dark mode changes from Navbar
    const handleDarkModeChange = (darkMode) => {
        setIsDarkMode(darkMode);
    };

    // Helper functions to manage localStorage
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

    const getStoredReplyLikes = () => {
        try {
            return JSON.parse(localStorage.getItem("replyLikes") || "{}");
        } catch (error) {
            console.error("Error parsing stored reply likes:", error);
            return {};
        }
    };

    const updateStoredReplyLikes = (replyId, likes) => {
        const storedReplyLikes = getStoredReplyLikes();
        storedReplyLikes[replyId] = likes;
        localStorage.setItem("replyLikes", JSON.stringify(storedReplyLikes));
    };

    useEffect(() => {
        if (showImagePreview) {
            // Disable scroll
            document.body.style.overflow = "hidden";
        } else {
            // Re-enable scroll
            document.body.style.overflow = "auto";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showImagePreview]);

    useEffect(() => {
        if (token) {
            fetchCurrentUserProfile();
            fetchUserProfile();
        } else {
            navigate("/login");
        }
    }, [userId, token]);

    useEffect(() => {
        document.body.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const fetchCurrentUserProfile = async () => {
        try {
            const userData = await apiService.fetchCurrentUser(token);
            setCurrentUserProfile(userData);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(
                `${config.apiUrl}/user/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const data = await response.json();
            const userDataFromApi = data.user || data;
            setUserData(userDataFromApi);

            if (data.profile && data.profile.description) {
                setUserDescription(data.profile.description);
            } else if (data.description) {
                setUserDescription(data.description);
            }

            if (data.stats) {
                setUserStats({
                    postCount: data.stats.postCount || 0,
                    friendsCount: data.stats.friendsCount || 0,
                });
            }

            if (userDataFromApi.username) {
                // Initial load without cursor
                await fetchUserPosts(userDataFromApi.username);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    const fetchUserPosts = async (
        username,
        cursor = null,
        isLoadMore = false
    ) => {
        try {
            if (isLoadMore) {
                setPaginationState((prev) => ({
                    ...prev,
                    isLoadingMore: true,
                }));
            } else {
                setIsLoading(true);
            }

            const data = await apiService.fetchUserPosts(
                token,
                username,
                cursor
            );
            const postsData = Array.isArray(data) ? data : data.posts || [];

            const storedLikes = getStoredLikes();
            const currentUsername = localStorage.getItem("username");

            const postsWithLikes = postsData.map((post) => {
                const hasUserLiked = post.likesPreview?.some(
                    (like) => like.username === currentUsername
                );

                return {
                    ...post,
                    isLiked: hasUserLiked || false,
                    likes: post.likeCount || 0,
                    comments: post.comments || [],
                    commentCount: post.commentCount || 0,
                };
            });

            // Load more case mein existing posts ke saath merge karo
            if (isLoadMore) {
                setUserPosts((prev) => {
                    const existingIds = new Set(prev.map((p) => p._id));
                    const newPosts = postsWithLikes.filter(
                        (post) => !existingIds.has(post._id)
                    );

                    return [...prev, ...newPosts];
                });
            } else {
                setUserPosts(postsWithLikes);
            }

            // Pagination state update karo
            setPaginationState((prev) => ({
                ...prev,
                nextCursor: data.nextCursor || null,
                hasMore: !!data.nextCursor,
                isLoadingMore: false,
            }));

            const likesByPost = {};
            postsData.forEach((post) => {
                const storedPostLikes =
                    storedLikes[post._id] || post.likes || [];
                likesByPost[post._id] = storedPostLikes;
            });

            localStorage.setItem("postLikes", JSON.stringify(likesByPost));
        } catch (err) {
            console.error("Error fetching user posts:", err);
            setError(err.message);

            if (isLoadMore) {
                setPaginationState((prev) => ({
                    ...prev,
                    isLoadingMore: false,
                }));
            }
        } finally {
            if (!isLoadMore) {
                setIsLoading(false);
            }
        }
    };

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } =
                document.documentElement;
            const { hasMore, isLoadingMore, nextCursor } = paginationState;

            const scrollPosition = scrollTop + clientHeight;
            const threshold = scrollHeight - 200; // 200px threshold

            if (
                scrollPosition >= threshold &&
                hasMore &&
                !isLoadingMore &&
                nextCursor
            ) {
                loadMorePosts();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [paginationState]);

    const loadMorePosts = async () => {
        const { nextCursor } = paginationState;

        if (!nextCursor) {
            return;
        }

        try {
            await fetchUserPosts(userData.username, nextCursor, true);
        } catch (error) {
            console.error("Error loading more posts:", error);
            setError("Unable to load more posts.");
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));

        try {
            const responseData = await apiService.fetchComments(postId, token);
            const comments = responseData.comments || [];
            const totalCount = responseData.count || comments.length;

            const storedCommentLikes = getStoredCommentLikes();
            const storedReplyLikes = getStoredReplyLikes();

            const commentsWithLikes = comments.map((comment) => {
                const commentLikes =
                    storedCommentLikes[comment._id] || comment.likes || [];
                const hasUserLiked = commentLikes.includes(user._id);

                const userData = comment.userId ||
                    comment.user || {
                        _id: "unknown",
                        username: "Unknown",
                        realname: "Unknown User",
                        profilePic: "",
                    };

                const finalUserData = {
                    _id: userData._id || "unknown",
                    username: userData.username || "Unknown",
                    realname:
                        userData.realname ||
                        userData.username ||
                        "Unknown User",
                    profilePic: userData.profilePic || "",
                };
                return {
                    ...comment,
                    likes: commentLikes,
                    hasUserLiked: hasUserLiked,
                    userId: finalUserData,
                    replies: [],
                    replyCount: comment.replyCount || 0,
                };
            });

            setUserPosts((posts) =>
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: commentsWithLikes,
                              commentCount: totalCount,
                          }
                        : post
                )
            );
            setActiveReplies((prev) => {
                const newActiveReplies = { ...prev };
                comments.forEach((comment) => {
                    if (newActiveReplies[comment._id]) {
                        delete newActiveReplies[comment._id];
                    }
                });
                return newActiveReplies;
            });

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
            setLoadingComments((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const fetchCommentReplies = async (commentId, postId) => {
        try {
            const responseData = await apiService.fetchCommentReplies(
                commentId,
                token
            );
            const replies = responseData.replies || [];

            const storedReplyLikes = getStoredReplyLikes();

            const repliesWithLikes = replies.map((reply) => {
                const replyLikes =
                    storedReplyLikes[reply._id] || reply.likes || [];
                const hasUserLikedReply = replyLikes.includes(user._id);
                const replyUser = reply.user || reply.userId || {};
                const profilePic =
                    replyUser.profilepic || replyUser.profilePic || "";

                const finalReplyUserData = {
                    _id: replyUser._id || "unknown",
                    username: replyUser.username || "Unknown",
                    realname:
                        replyUser.realname ||
                        replyUser.username ||
                        "Unknown User",
                    profilePic: profilePic,
                };

                return {
                    ...reply,
                    likes: replyLikes,
                    hasUserLiked: hasUserLikedReply,
                    userId: finalReplyUserData,
                };
            });

            setUserPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments =
                            post.comments?.map((comment) =>
                                comment._id === commentId
                                    ? {
                                          ...comment,
                                          replies: repliesWithLikes,
                                          replyCount: repliesWithLikes.length,
                                      }
                                    : comment
                            ) || [];
                        return {
                            ...post,
                            comments: updatedComments,
                        };
                    }
                    return post;
                })
            );

            const likesByReply = {};
            replies.forEach((reply) => {
                likesByReply[reply._id] =
                    storedReplyLikes[reply._id] || reply.likes || [];
            });

            localStorage.setItem("replyLikes", JSON.stringify(likesByReply));
        } catch (err) {
            setError("Failed to load replies");
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

    // ✅ REMOVED: Old handleDeleteComment function

    // ✅ REMOVED: Old handleDeleteReply function

    const handleLike = async (postId, e) => {
        if (e) {
            e.stopPropagation();
        }

        if (!username || !user?._id) {
            console.error("User information not available");
            setError("You must be logged in to like posts");
            return;
        }

        if (isLiking[postId]) return;

        setIsLiking((prev) => ({ ...prev, [postId]: true }));

        try {
            const currentPost = userPosts.find((post) => post._id === postId);
            if (!currentPost) return;

            const isCurrentlyLiked = currentPost.isLiked;

            setUserPosts((posts) =>
                posts.map((post) => {
                    if (post._id === postId) {
                        const newLikeCount = isCurrentlyLiked
                            ? Math.max(0, (post.likeCount || 1) - 1)
                            : (post.likeCount || 0) + 1;

                        let newLikesPreview = [...(post.likesPreview || [])];

                        if (isCurrentlyLiked) {
                            newLikesPreview = newLikesPreview.filter(
                                (like) => like.username !== username
                            );
                        } else {
                            newLikesPreview.unshift({
                                username: username,
                                realname:
                                    currentUserProfile?.realname ||
                                    user?.realname ||
                                    username,
                                profilePic:
                                    currentUserProfile?.profilePic ||
                                    user?.profilePic,
                            });
                        }

                        return {
                            ...post,
                            isLiked: !isCurrentlyLiked,
                            likeCount: newLikeCount,
                            likesPreview: newLikesPreview,
                        };
                    }
                    return post;
                })
            );

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

            await apiService.likePost(postId, user._id, token);
        } catch (err) {
            console.error("Error liking post:", err);

            setUserPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            isLiked: currentPost.isLiked,
                            likeCount: currentPost.likeCount,
                            likesPreview: currentPost.likesPreview,
                        };
                    }
                    return post;
                })
            );

            setError(err.message);
        } finally {
            setIsLiking((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const handleLikeComment = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!username || !user?._id) {
            setError("You must be logged in to like comments");
            return;
        }

        setIsLikingComment((prev) => ({ ...prev, [commentId]: true }));

        try {
            // Optimistically update the UI
            setUserPosts(
                userPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const isLiked = comment.hasUserLiked;
                                    let updatedLikes;

                                    if (isLiked) {
                                        updatedLikes = comment.likes.filter(
                                            (likeUserId) =>
                                                likeUserId !== user._id
                                        );
                                    } else {
                                        updatedLikes = [
                                            ...(comment.likes || []),
                                            user._id,
                                        ];
                                    }

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
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                })
            );

            await apiService.likeComment(commentId, user._id, token);
        } catch (err) {
            console.error("Error liking comment:", err);
            setError(err.message);
            // Revert optimistic update on error
            await fetchComments(postId);
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleLikeReply = async (replyId, commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!username || !user?._id) {
            setError("You must be logged in to like replies");
            return;
        }

        setIsLikingReply((prev) => ({ ...prev, [replyId]: true }));

        try {
            setUserPosts(
                userPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const updatedReplies = comment.replies?.map(
                                        (reply) => {
                                            if (reply._id === replyId) {
                                                const isLiked =
                                                    reply.hasUserLiked;
                                                let updatedLikes;

                                                if (isLiked) {
                                                    updatedLikes =
                                                        reply.likes.filter(
                                                            (likeUserId) =>
                                                                likeUserId !==
                                                                user._id
                                                        );
                                                } else {
                                                    updatedLikes = [
                                                        ...(reply.likes || []),
                                                        user._id,
                                                    ];
                                                }

                                                updateStoredReplyLikes(
                                                    replyId,
                                                    updatedLikes
                                                );

                                                return {
                                                    ...reply,
                                                    likes: updatedLikes,
                                                    hasUserLiked: !isLiked,
                                                };
                                            }
                                            return reply;
                                        }
                                    );

                                    return {
                                        ...comment,
                                        replies: updatedReplies,
                                    };
                                }
                                return comment;
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                })
            );

            await apiService.likeReply(replyId, user._id, token);
        } catch (err) {
            console.error("Error liking reply:", err);
            setError(err.message);
            await fetchComments(postId);
        } finally {
            setIsLikingReply((prev) => ({ ...prev, [replyId]: false }));
        }
    };

    const toggleCommentDropdown = async (postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (activeCommentPostId !== postId) {
            await fetchComments(postId);
        }

        setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
        setCommentContent((prev) => ({
            ...prev,
            [postId]: prev[postId] || "",
        }));
    };

    const toggleReplies = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const post = userPosts.find((p) => p._id === postId);
        const comment = post?.comments?.find((c) => c._id === commentId);

        const repliesAlreadyLoaded =
            comment?.replies && comment.replies.length > 0;

        // Only fetch if we're opening replies and they're not already loaded
        if (!activeReplies[commentId] && !repliesAlreadyLoaded) {
            try {
                await fetchCommentReplies(commentId, postId);
            } catch (err) {
                setError("Failed to load replies");
                return;
            }
        }

        // Toggle the active state
        setActiveReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const toggleReplyInput = (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Close any previously open reply input
        if (activeReplyInput && activeReplyInput !== commentId) {
            setActiveReplyInput(null);
        }

        // Toggle current reply input
        setActiveReplyInput(activeReplyInput === commentId ? null : commentId);
        setReplyContent((prev) => ({
            ...prev,
            [commentId]: prev[commentId] || "",
        }));
    };

    // New function to toggle reply input for replies
    const toggleReplyToReplyInput = (replyId, commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const contentKey = `${replyId}-${commentId}`;

        // Close any previously open reply input
        if (activeReplyInput && activeReplyInput !== contentKey) {
            setActiveReplyInput(null);
        }

        // Toggle current reply input
        setActiveReplyInput(
            activeReplyInput === contentKey ? null : contentKey
        );
        setReplyContent((prev) => {
            if (prev[contentKey] === undefined) {
                return {
                    ...prev,
                    [contentKey]: "",
                };
            }
            return prev;
        });
    };

    const handleCommentSubmit = async (postId, e) => {
        if (e) e.preventDefault();

        const content = commentContent[postId] || "";

        if (!content.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        if (!username) {
            setError("You must be logged in to comment");
            navigate("/login");
            return;
        }

        setIsCommenting((prev) => ({ ...prev, [postId]: true }));
        setError(null);

        try {
            const responseData = await apiService.addComment(
                postId,
                content,
                token
            );
            const createdComment = responseData.comment || responseData;

            setUserPosts((posts) =>
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [
                                  ...(post.comments || []),
                                  {
                                      ...createdComment,
                                      hasUserLiked: false,
                                      userId: {
                                          _id:
                                              currentUserProfile?._id ||
                                              user?._id ||
                                              username,
                                          username: username,
                                          realname:
                                              currentUserProfile?.realname ||
                                              user?.realname ||
                                              username,
                                          profilePic:
                                              currentUserProfile?.profilePic ||
                                              user?.profilePic,
                                      },
                                      replies: [],
                                      replyCount: 0,
                                  },
                              ],
                              commentCount: (post.commentCount || 0) + 1,
                          }
                        : post
                )
            );

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            console.error("Error posting comment:", err);
            setError(err.message);
        } finally {
            setIsCommenting((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const handleAddReply = async (commentId, postId, e) => {
        if (e) e.preventDefault();

        const content = replyContent[commentId] || "";

        if (!content.trim()) {
            setError("Reply cannot be empty");
            return;
        }

        if (!username) {
            setError("You must be logged in to reply");
            navigate("/login");
            return;
        }

        setIsReplying((prev) => ({ ...prev, [commentId]: true }));
        setError(null);

        try {
            const responseData = await apiService.addCommentReply(
                commentId,
                content,
                postId,
                token
            );
            const createdReply = responseData.reply || responseData;

            setUserPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const newReply = {
                                        ...createdReply,
                                        _id:
                                            createdReply._id ||
                                            `temp-${Date.now()}`,
                                        content: content,
                                        userId: {
                                            _id: user._id,
                                            username: username,
                                            realname:
                                                currentUserProfile?.realname ||
                                                user?.realname ||
                                                username,
                                            profilePic:
                                                currentUserProfile?.profilePic ||
                                                user?.profilePic,
                                        },
                                        likes: [],
                                        hasUserLiked: false,
                                        createdAt:
                                            createdReply.createdAt ||
                                            new Date().toISOString(),
                                    };

                                    const updatedReplies = [
                                        ...(comment.replies || []),
                                        newReply,
                                    ];

                                    return {
                                        ...comment,
                                        replies: updatedReplies,
                                        replyCount: updatedReplies.length,
                                    };
                                }
                                return comment;
                            }
                        );

                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: (post.commentCount || 0) + 1,
                        };
                    }
                    return post;
                })
            );

            setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
            setActiveReplyInput(null); // Close the reply input after posting
        } catch (err) {
            console.error("Error posting reply:", err);
            setError(err.message);
        } finally {
            setIsReplying((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // New function to handle adding reply to a reply
    const handleAddReplyToReply = async (
        replyId,
        commentId,
        postId,
        e,
        content = null
    ) => {
        if (e) e.preventDefault();

        const contentKey = `${replyId}-${commentId}`;
        const contentToUse = content || replyContent[contentKey] || "";

        if (!contentToUse.trim()) {
            setError("Reply cannot be empty");
            return;
        }

        if (!username) {
            setError("You must be logged in to reply");
            navigate("/login");
            return;
        }

        setIsReplying((prev) => ({
            ...prev,
            [contentKey]: true,
        }));
        setError(null);

        try {
            const responseData = await apiService.addCommentReply(
                commentId,
                contentToUse,
                postId,
                token
            );
            const createdReply = responseData.reply || responseData;

            setUserPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const newReply = {
                                        ...createdReply,
                                        _id:
                                            createdReply._id ||
                                            `temp-${Date.now()}`,
                                        content: contentToUse,
                                        userId: {
                                            _id: user._id,
                                            username: username,
                                            realname:
                                                currentUserProfile?.realname ||
                                                user?.realname ||
                                                username,
                                            profilePic:
                                                currentUserProfile?.profilePic ||
                                                user?.profilePic,
                                        },
                                        likes: [],
                                        hasUserLiked: false,
                                        createdAt:
                                            createdReply.createdAt ||
                                            new Date().toISOString(),
                                    };

                                    const updatedReplies = [
                                        ...(comment.replies || []),
                                        newReply,
                                    ];

                                    return {
                                        ...comment,
                                        replies: updatedReplies,
                                        replyCount: updatedReplies.length,
                                    };
                                }
                                return comment;
                            }
                        );

                        return {
                            ...post,
                            comments: updatedComments,
                        };
                    }
                    return post;
                })
            );

            // Input clear karo
            setReplyContent((prev) => ({
                ...prev,
                [contentKey]: "",
            }));

            setActiveReplyInput(null); // Close the reply input after posting
        } catch (err) {
            console.error("Error posting reply:", err);
            setError(err.message);
        } finally {
            setIsReplying((prev) => ({
                ...prev,
                [contentKey]: false,
            }));
        }
    };

    // Floating Hearts Animation Component
    const FloatingHearts = () => (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {floatingHearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute text-red-500 text-2xl pointer-events-none"
                    initial={{
                        x: heart.x - 12,
                        y: heart.y - 12,
                        scale: 0,
                        opacity: 1,
                    }}
                    animate={{
                        y: heart.y - 150,
                        scale: [0, 1.5, 1],
                        opacity: [1, 0.8, 0],
                        rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                        duration: 2,
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

    const formatDate = (dateString) => {
        try {
            const utcDate = new Date(dateString);
            const istDate = new Date(
                utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            );

            if (isNaN(istDate.getTime())) {
                return "Just now";
            }

            const now = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            );

            const diffInSeconds = Math.floor((now - istDate) / 1000);

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

    // Get liked users for display
    const getLikedUsers = (post) => {
        if (post.likesPreview && post.likesPreview.length > 0) {
            return post.likesPreview;
        }
        return [];
    };

    // Handle likes modal
    const handleShowLikes = (postId, e) => {
        e.stopPropagation();
        if (postId) {
            handleShowLikesModal(postId);
        }
    };

    // Reply Item Component - UPDATED WITH MODAL HANDLERS
    const ReplyItem = React.memo(
        ({ reply, commentId, postId, commentOwner }) => {
            const contentKey = `${reply._id}-${commentId}`;
            const [localInputValue, setLocalInputValue] = useState("");
            const [profilePicError, setProfilePicError] = useState(false);

            // Initialize with parent state when input becomes visible
            useEffect(() => {
                if (activeReplyInput === contentKey) {
                    setLocalInputValue(replyContent[contentKey] || "");
                }
            }, [activeReplyInput, contentKey]);

            const handleProfilePicError = (e) => {
                setProfilePicError(true);
                e.target.style.display = "none";
            };

            const handleInputChange = (e) => {
                const value = e.target.value;
                setLocalInputValue(value);
            };

            const handleSubmit = (e) => {
                e.preventDefault();

                if (!localInputValue.trim()) {
                    setError("Reply cannot be empty");
                    return;
                }

                handleAddReplyToReply(
                    reply._id,
                    commentId,
                    postId,
                    e,
                    localInputValue
                );

                // Clear local input immediately
                setLocalInputValue("");
            };

            const handleCancel = () => {
                toggleReplyToReplyInput(reply._id, commentId, postId);
                setLocalInputValue("");
            };

            // Safe user data access
            const replyUser = reply?.userId || reply?.user || {};
            const replyUsername =
                replyUser?.username || reply?.username || "Unknown";
            const replyUserProfilePic =
                replyUser?.profilePic || reply?.profilePic;
            const replyUserId = replyUser?._id || replyUser?.id || "unknown";

            // Check if current user can delete reply
            const canDeleteReply = () => {
                const currentUsername = localStorage.getItem("username");
                return (
                    replyUsername === currentUsername ||
                    commentOwner === currentUsername
                );
            };

            return (
                <div className="ml-4 md:ml-6 mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                    <div className="flex items-start space-x-2">
                        <div
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-600 cursor-pointer flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (replyUserId === currentUserProfile?._id) {
                                    navigate("/profile");
                                } else {
                                    navigate(`/user/${replyUserId}`);
                                }
                            }}
                        >
                            {replyUserProfilePic && !profilePicError ? (
                                <img
                                    src={replyUserProfilePic}
                                    alt={replyUsername}
                                    className="w-full h-full object-cover"
                                    onError={handleProfilePicError}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs">
                                    {replyUsername?.charAt(0).toUpperCase() ||
                                        "U"}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-2 gap-1">
                                <span
                                    className="font-semibold text-xs hover:text-blue-500 cursor-pointer truncate"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                            replyUserId ===
                                            currentUserProfile?._id
                                        ) {
                                            navigate("/profile");
                                        } else {
                                            navigate(`/user/${replyUserId}`);
                                        }
                                    }}
                                >
                                    {replyUsername}
                                </span>
                                <span
                                    className={`text-xs ${
                                        isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    } whitespace-nowrap`}
                                >
                                    {formatDate(reply.createdAt)}
                                </span>
                            </div>
                            <p
                                className={`text-xs whitespace-pre-line mt-1 break-words ${
                                    isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-700"
                                }`}
                            >
                                {reply.content}
                            </p>

                            <div className="mt-1 flex items-center justify-between flex-wrap gap-2">
                                <button
                                    className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                    onClick={(e) =>
                                        handleLikeReply(
                                            reply._id,
                                            commentId,
                                            postId,
                                            e
                                        )
                                    }
                                    disabled={isLikingReply[reply._id]}
                                >
                                    {isLikingReply[reply._id] ? (
                                        <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : reply.hasUserLiked ? (
                                        <FaHeart className="text-xs text-red-500" />
                                    ) : (
                                        <FaRegHeart
                                            className={`text-xs ${
                                                isDarkMode
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                    )}
                                    <span
                                        className={`text-xs ${
                                            isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {reply.likes?.length || 0}
                                    </span>
                                </button>

                                <div className="flex space-x-2">
                                    <button
                                        className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-xs"
                                        onClick={(e) =>
                                            toggleReplyToReplyInput(
                                                reply._id,
                                                commentId,
                                                postId,
                                                e
                                            )
                                        }
                                        title="Reply to this reply"
                                    >
                                        <FaReply />
                                    </button>

                                    {canDeleteReply() && (
                                        <button
                                            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                            onClick={(e) =>
                                                handleOpenDeleteReplyModal(
                                                    reply._id,
                                                    commentId,
                                                    postId,
                                                    e
                                                )
                                            }
                                            disabled={
                                                isDeletingReply[reply._id]
                                            }
                                            title="Delete reply"
                                        >
                                            {isDeletingReply[reply._id] ? (
                                                <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FaTrashAlt />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Reply Input for Reply with PROFILE AVATAR and POST BUTTON FIRST */}
                            {activeReplyInput === contentKey && (
                                <div className="mt-2 ml-0 sm:ml-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        {/* Profile Avatar
                                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                                            {currentUserProfile?.profilePic ||
                                            user?.profilePic ? (
                                                <img
                                                    src={
                                                        currentUserProfile?.profilePic ||
                                                        user?.profilePic
                                                    }
                                                    alt={username}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs ${
                                                    currentUserProfile?.profilePic ||
                                                    user?.profilePic
                                                        ? "hidden"
                                                        : "flex"
                                                }`}
                                            >
                                                {username
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </div>
                                        </div> */}

                                        <input
                                            type="text"
                                            className={`w-full px-3 py-1 rounded-full text-xs border ${
                                                isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-800"
                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                            placeholder={`Reply to ${replyUsername}...`}
                                            value={localInputValue}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleSubmit(e);
                                                }
                                            }}
                                        />
                                        {/* BUTTONS: Post first, then Cancel */}
                                        <div className="flex space-x-2 self-end sm:self-auto">
                                            <button
                                                onClick={handleSubmit}
                                                className={`px-3 py-1 rounded-full text-xs ${
                                                    !localInputValue.trim() ||
                                                    isReplying[contentKey]
                                                        ? "bg-blue-300 cursor-not-allowed"
                                                        : "bg-blue-500 hover:bg-blue-600 "
                                                } text-white transition-colors`}
                                                disabled={
                                                    !localInputValue.trim() ||
                                                    isReplying[contentKey]
                                                }
                                            >
                                                {isReplying[contentKey] ? (
                                                    <span className="inline-block h-2 w-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                ) : (
                                                    "Post"
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-3 py-1 rounded-full text-xs bg-gray-500 hover:bg-gray-600 text-white cursor-pointer flex-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    );

    if (isLoading) {
        return <ProfileSkeleton isDarkMode={isDarkMode} />;
    }

    if (error) {
        return (
            <div
                className={`min-h-screen ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                } flex items-center justify-center`}
            >
                <div className="text-center">
                    <p className="text-red-500">Error: {error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div
                className={`min-h-screen ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                } flex items-center justify-center`}
            >
                <div className="text-center">
                    <p
                        className={`${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                        User not found
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${
                isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50"
            }`}
        >
            {/* Floating Hearts Animation */}
            <FloatingHearts
                hearts={floatingHearts}
                setHearts={setFloatingHearts}
            />
            {/* Likes Modal */}
            <LikesModal
                postId={likesModal.postId}
                isOpen={likesModal.isOpen}
                onClose={handleCloseLikesModal}
                token={token}
                isDarkMode={isDarkMode}
            />

            {/* ✅ ADDED: Comment Deletion Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteCommentModal.isOpen}
                onClose={handleCloseDeleteCommentModal}
                onConfirm={handleConfirmDeleteComment}
                title="Delete Comment"
                message="Are you sure you want to delete this comment?"
                confirmText="Delete"
                cancelText="Cancel"
                type="delete"
                isLoading={isDeletingComment[deleteCommentModal.commentId]}
                isDarkMode={isDarkMode}
            />

            {/* ✅ ADDED: Reply Deletion Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteReplyModal.isOpen}
                onClose={handleCloseDeleteReplyModal}
                onConfirm={handleConfirmDeleteReply}
                title="Delete Reply"
                message="Are you sure you want to delete this reply?"
                confirmText="Delete"
                cancelText="Cancel"
                type="delete"
                isLoading={isDeletingReply[deleteReplyModal.replyId]}
                isDarkMode={isDarkMode}
            />

            {/* Image Preview Modal */}
            {showImagePreview && (
                <div
                    className="fixed inset-0 backdrop-blur bg-transparent bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    <div
                        className="relative max-w-screen max-h-screen flex items-center justify-center"
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
                            className="absolute top-4 right-4 cursor-pointer bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-colors"
                            onClick={() => setShowImagePreview(false)}
                        >
                            <FaTimes />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-lg">
                            @{userData.username}
                        </div>
                    </div>
                </div>
            )}
            <Navbar onDarkModeChange={handleDarkModeChange} />
            <FriendsSidebar
                isOpen={showFriendsSidebar}
                onClose={() => setShowFriendsSidebar(false)}
                darkMode={isDarkMode}
                token={token}
            />

            {/* Error Message */}
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

            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                <div
                    className={`relative w-full max-w-5xl rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mx-auto ${
                        isDarkMode
                            ? "bg-gray-800 text-gray-100"
                            : "bg-white text-gray-900"
                    }`}
                >
                    {/* ... (rest of the profile section remains the same) ... */}
                    <div
                        className="
          flex flex-col items-center text-center 
          sm:flex-row sm:text-left sm:items-start sm:gap-6
          gap-4
        "
                    >
                        {/* Profile Image with Click Handler */}
                        <div className="relative flex-shrink-0">
                            <div
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer hover:border-blue-600 transition-all duration-300"
                                onClick={() => {
                                    if (userData.profilePic) {
                                        setPreviewImage(userData.profilePic);
                                        setShowImagePreview(true);
                                    }
                                }}
                            >
                                {userData.profilePic ? (
                                    <img
                                        src={userData.profilePic}
                                        alt={userData.username}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        onError={(e) =>
                                            (e.target.style.display = "none")
                                        }
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-3xl font-bold">
                                        {userData.username
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h2 className="text-xl sm:text-2xl  font-bold leading-snug">
                                {userData.realname || userData.username}
                            </h2>
                            <p className="text-gray-500 text-sm sm:text-base">
                                @{userData.username}
                            </p>

                            {/* Bio */}
                            {userDescription && (
                                <p
                                    className={`mt-2 text-sm sm:text-base ${
                                        isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {userDescription}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                {userData.createdAt && (
                                    <div
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                                            isDarkMode
                                                ? "bg-gray-700"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <FaCalendarAlt
                                            className={
                                                isDarkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            }
                                        />
                                        <span className="text-xs sm:text-sm">
                                            Joined{" "}
                                            {formatDate(userData.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                                        isDarkMode
                                            ? "bg-gray-700"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <FaChartBar
                                        className={
                                            isDarkMode
                                                ? "text-gray-300"
                                                : "text-gray-600"
                                        }
                                    />
                                    <span className="text-xs sm:text-sm">
                                        {userStats.postCount} Posts
                                    </span>
                                </div>
                                <div
                                    className={`flex items-center gap-1 cursor-pointer sm:gap-2 ${
                                        isDarkMode
                                            ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                    } px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}
                                >
                                    <FaUsers className="text-blue-500" />
                                    <span className="text-xs sm:text-sm">
                                        {userStats.friendsCount} Friends
                                    </span>
                                </div>
                                {userData._id &&
                                    user?._id &&
                                    userData._id !== user._id && (
                                        <FriendButton
                                            targetUserId={userData._id}
                                            currentUserId={user._id}
                                        />
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts */}
                <div className="w-full max-w-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
                    <h3
                        className={`text-xl font-semibold mb-4 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                        Posts
                    </h3>

                    {userPosts.length === 0 &&
                    !isLoading &&
                    !paginationState.isLoadingMore ? (
                        <div
                            className={`rounded-lg p-6 text-center ${
                                isDarkMode ? "bg-gray-800" : "bg-white"
                            }`}
                        >
                            <FaUser
                                className={`text-4xl mx-auto mb-4 ${
                                    isDarkMode
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                }`}
                            />
                            <p
                                className={`${
                                    isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                }`}
                            >
                                No posts yet
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {userPosts.map((post) => {
                                const likedUsers = getLikedUsers(post);
                                const totalLikes = post.likeCount || 0;
                                const isPostLiked = post.isLiked || false;

                                return (
                                    <div
                                        key={post._id}
                                        className={`rounded-lg p-4 shadow-sm ${
                                            isDarkMode
                                                ? "bg-gray-800 text-gray-100"
                                                : "bg-white text-gray-900"
                                        }`}
                                    >
                                        {/* ... (post content remains the same) ... */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-400 shadow-md bg-gradient-to-r from-blue-500 to-cyan-400 cursor-pointer hover:border-blue-500 transition-all"
                                                onClick={() => {
                                                    if (userData.profilePic) {
                                                        setPreviewImage(
                                                            userData.profilePic
                                                        );
                                                        setShowImagePreview(
                                                            true
                                                        );
                                                    }
                                                }}
                                            >
                                                {userData.profilePic ? (
                                                    <img
                                                        src={
                                                            userData.profilePic
                                                        }
                                                        alt={userData.username}
                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${
                                                        userData.profilePic
                                                            ? "hidden"
                                                            : "flex"
                                                    }`}
                                                >
                                                    {userData.username
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </div>
                                            </div>

                                            <div>
                                                <h3
                                                    className={`text-base hover:text-blue-500 font-semibold ${
                                                        isDarkMode
                                                            ? "text-white"
                                                            : "text-gray-800"
                                                    }`}
                                                >
                                                    {userData.realname ||
                                                        userData.username}
                                                </h3>
                                                <p
                                                    className={`text-xs ${
                                                        isDarkMode
                                                            ? "text-gray-400"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    @{userData.username}{" "}
                                                    {post.createdAt &&
                                                        `· ${formatDate(
                                                            post.createdAt
                                                        )}`}
                                                </p>
                                            </div>
                                        </div>

                                        <p
                                            className={`leading-relaxed mb-3 ${
                                                isDarkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {post.content}
                                        </p>

                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="w-full mb-3 overflow-hidden flex justify-center">
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl border border-gray-200"
                                                    onClick={() => {
                                                        setPreviewImage(
                                                            post.image
                                                        );
                                                        setShowImagePreview(
                                                            true
                                                        );
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div
                                            className={`flex items-center justify-between border-t pt-3 ${
                                                isDarkMode
                                                    ? "border-gray-700"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLike(post._id, e);
                                                    }}
                                                    disabled={
                                                        isLiking[post._id]
                                                    }
                                                    className={`flex items-center gap-1 ${
                                                        isLiking[post._id]
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : "cursor-pointer"
                                                    } hover:text-red-500 transition-colors`}
                                                >
                                                    {isLiking[post._id] ? (
                                                        <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : isPostLiked ? (
                                                        <FaHeart className="text-xl text-red-500" />
                                                    ) : (
                                                        <FaRegHeart
                                                            className={`text-xl ${
                                                                isDarkMode
                                                                    ? "text-gray-400"
                                                                    : "text-gray-500"
                                                            }`}
                                                        />
                                                    )}
                                                    <motion.span
                                                        key={totalLikes}
                                                        initial={{ scale: 1 }}
                                                        animate={{
                                                            scale: [1.2, 1],
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className={`text-sm font-medium ${
                                                            isPostLiked
                                                                ? "text-red-500"
                                                                : isDarkMode
                                                                ? "text-gray-400"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {totalLikes}
                                                    </motion.span>
                                                </motion.button>

                                                {/* Liked by text */}
                                                {totalLikes > 0 && (
                                                    <div className="text-sm">
                                                        <div className="flex items-center flex-wrap">
                                                            {likedUsers.length >
                                                            0 ? (
                                                                <>
                                                                    {likedUsers
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .map(
                                                                            (
                                                                                user,
                                                                                index
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className={`font-medium mr-1 cursor-pointer hover:underline ${
                                                                                        isDarkMode
                                                                                            ? "text-gray-300"
                                                                                            : "text-gray-700"
                                                                                    }`}
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        navigateToProfile(
                                                                                            user.id
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        user.username
                                                                                    }
                                                                                    {index <
                                                                                    Math.min(
                                                                                        2,
                                                                                        likedUsers.length -
                                                                                            1
                                                                                    )
                                                                                        ? ","
                                                                                        : ""}
                                                                                </span>
                                                                            )
                                                                        )}

                                                                    {totalLikes >
                                                                        2 && (
                                                                        <button
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                handleShowLikes(
                                                                                    post._id,
                                                                                    e
                                                                                )
                                                                            }
                                                                            className={`font-medium cursor-pointer ${
                                                                                isDarkMode
                                                                                    ? "text-blue-300"
                                                                                    : "text-blue-500"
                                                                            } hover:underline`}
                                                                        >
                                                                            and{" "}
                                                                            {totalLikes -
                                                                                2}{" "}
                                                                            others
                                                                        </button>
                                                                    )}

                                                                    {totalLikes ===
                                                                        2 &&
                                                                        likedUsers.length ===
                                                                            1 && (
                                                                            <span
                                                                                className={`font-medium mr-1 ${
                                                                                    isDarkMode
                                                                                        ? "text-gray-300"
                                                                                        : "text-gray-700"
                                                                                }`}
                                                                            >
                                                                                and
                                                                                1
                                                                                other
                                                                            </span>
                                                                        )}
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleShowLikes(
                                                                            post._id,
                                                                            e
                                                                        )
                                                                    }
                                                                    className={`font-medium cursor-pointer ${
                                                                        isDarkMode
                                                                            ? "text-blue-300"
                                                                            : "text-blue-500"
                                                                    } hover:underline`}
                                                                >
                                                                    {totalLikes}{" "}
                                                                    {totalLikes ===
                                                                    1
                                                                        ? "like"
                                                                        : "likes"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                className={`flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer ${
                                                    isDarkMode
                                                        ? "text-gray-400"
                                                        : "text-gray-600"
                                                }`}
                                                onClick={(e) =>
                                                    toggleCommentDropdown(
                                                        post._id,
                                                        e
                                                    )
                                                }
                                                disabled={
                                                    loadingComments[post._id]
                                                }
                                            >
                                                <FaComment />
                                                <span className="text-sm">
                                                    {post.commentCount || 0}
                                                </span>
                                                {loadingComments[post._id] && (
                                                    <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                                                )}
                                            </button>
                                        </div>

                                        {/* Comment Section */}
                                        {activeCommentPostId === post._id && (
                                            <div className="mt-4">
                                                {loadingComments[post._id] ? (
                                                    <div className="text-center py-4">
                                                        <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                        <p
                                                            className={`text-sm mt-2 ${
                                                                isDarkMode
                                                                    ? "text-gray-400"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            Loading comments...
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {post.comments &&
                                                        post.comments.length >
                                                            0 ? (
                                                            <div
                                                                className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${
                                                                    isDarkMode
                                                                        ? "bg-gray-700 text-gray-200"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {post.comments.map(
                                                                    (
                                                                        comment
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                comment._id
                                                                            }
                                                                            className="flex items-start space-x-2"
                                                                        >
                                                                            <div
                                                                                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer"
                                                                                onClick={() => {
                                                                                    if (
                                                                                        comment
                                                                                            .userId
                                                                                            ?._id ===
                                                                                        currentUserProfile?._id
                                                                                    ) {
                                                                                        navigate(
                                                                                            "/profile"
                                                                                        );
                                                                                    } else {
                                                                                        navigate(
                                                                                            `/user/${comment.userId?._id}`
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {comment
                                                                                    .userId
                                                                                    ?.profilePic ? (
                                                                                    <img
                                                                                        src={
                                                                                            comment
                                                                                                .userId
                                                                                                .profilePic
                                                                                        }
                                                                                        alt={
                                                                                            comment
                                                                                                .userId
                                                                                                .username
                                                                                        }
                                                                                        className="w-full h-full object-cover"
                                                                                        onError={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.target.style.display =
                                                                                                "none";
                                                                                        }}
                                                                                    />
                                                                                ) : null}
                                                                                <div
                                                                                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm ${
                                                                                        comment
                                                                                            .userId
                                                                                            ?.profilePic
                                                                                            ? "hidden"
                                                                                            : "flex"
                                                                                    }`}
                                                                                >
                                                                                    {comment.userId?.username
                                                                                        ?.charAt(
                                                                                            0
                                                                                        )
                                                                                        .toUpperCase() ||
                                                                                        "U"}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span
                                                                                        className="font-semibold text-sm hover:text-blue-500 cursor-pointer"
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                comment
                                                                                                    .userId
                                                                                                    ?._id ===
                                                                                                currentUserProfile?._id
                                                                                            ) {
                                                                                                navigate(
                                                                                                    "/profile"
                                                                                                );
                                                                                            } else {
                                                                                                navigate(
                                                                                                    `/user/${comment.userId?._id}`
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {comment
                                                                                            .userId
                                                                                            ?.username ||
                                                                                            "Unknown"}
                                                                                    </span>
                                                                                    <span
                                                                                        className={`text-xs ${
                                                                                            isDarkMode
                                                                                                ? "text-gray-400"
                                                                                                : "text-gray-500"
                                                                                        }`}
                                                                                    >
                                                                                        {formatDate(
                                                                                            comment.createdAt
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                                <p
                                                                                    className={`text-sm whitespace-pre-line mt-1 ${
                                                                                        isDarkMode
                                                                                            ? "text-gray-200"
                                                                                            : "text-gray-700"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        comment.content
                                                                                    }
                                                                                </p>
                                                                                <div className="mt-1 flex items-center justify-between">
                                                                                    <button
                                                                                        className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                                                                                        onClick={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleLikeComment(
                                                                                                comment._id,
                                                                                                post._id,
                                                                                                e
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            isLikingComment[
                                                                                                comment
                                                                                                    ._id
                                                                                            ]
                                                                                        }
                                                                                    >
                                                                                        {isLikingComment[
                                                                                            comment
                                                                                                ._id
                                                                                        ] ? (
                                                                                            <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                        ) : comment.hasUserLiked ? (
                                                                                            <FaHeart className="text-xs text-red-500" />
                                                                                        ) : (
                                                                                            <FaRegHeart
                                                                                                className={`text-xs ${
                                                                                                    isDarkMode
                                                                                                        ? "text-gray-400"
                                                                                                        : "text-gray-500"
                                                                                                }`}
                                                                                            />
                                                                                        )}
                                                                                        <span
                                                                                            className={`text-xs ${
                                                                                                isDarkMode
                                                                                                    ? "text-gray-400"
                                                                                                    : "text-gray-600"
                                                                                            }`}
                                                                                        >
                                                                                            {comment
                                                                                                .likes
                                                                                                ?.length ||
                                                                                                0}
                                                                                        </span>
                                                                                    </button>

                                                                                    <div className="flex space-x-2">
                                                                                        <button
                                                                                            className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-xs"
                                                                                            onClick={(
                                                                                                e
                                                                                            ) =>
                                                                                                toggleReplyInput(
                                                                                                    comment._id,
                                                                                                    post._id,
                                                                                                    e
                                                                                                )
                                                                                            }
                                                                                            title="Reply to comment"
                                                                                        >
                                                                                            <FaReply />
                                                                                        </button>

                                                                                        {(comment
                                                                                            .userId
                                                                                            ?.username ===
                                                                                            username ||
                                                                                            post
                                                                                                .userId
                                                                                                ?.username ===
                                                                                                username) && (
                                                                                            <button
                                                                                                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-xs"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    handleOpenDeleteCommentModal(
                                                                                                        comment._id,
                                                                                                        post._id,
                                                                                                        e
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    isDeletingComment[
                                                                                                        comment
                                                                                                            ._id
                                                                                                    ]
                                                                                                }
                                                                                                title="Delete comment"
                                                                                            >
                                                                                                {isDeletingComment[
                                                                                                    comment
                                                                                                        ._id
                                                                                                ] ? (
                                                                                                    <div className="inline-block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                                ) : (
                                                                                                    <FaTrashAlt />
                                                                                                )}
                                                                                            </button>
                                                                                        )}

                                                                                        {/* Chevron icon for replies */}
                                                                                        {comment.replyCount >
                                                                                            0 && (
                                                                                            <button
                                                                                                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-xs flex items-center space-x-1"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    toggleReplies(
                                                                                                        comment._id,
                                                                                                        post._id,
                                                                                                        e
                                                                                                    )
                                                                                                }
                                                                                                title={
                                                                                                    activeReplies[
                                                                                                        comment
                                                                                                            ._id
                                                                                                    ]
                                                                                                        ? "Hide replies"
                                                                                                        : "Show replies"
                                                                                                }
                                                                                            >
                                                                                                {activeReplies[
                                                                                                    comment
                                                                                                        ._id
                                                                                                ] ? (
                                                                                                    <FaChevronDown />
                                                                                                ) : (
                                                                                                    <FaChevronRight />
                                                                                                )}
                                                                                                <span>
                                                                                                    {
                                                                                                        comment.replyCount
                                                                                                    }
                                                                                                </span>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Reply Input for Comment with PROFILE AVATAR and POST BUTTON FIRST */}
                                                                                {activeReplyInput ===
                                                                                    comment._id && (
                                                                                    <div className="mt-2 ml-0 sm:ml-2">
                                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                                            {/* Profile Avatar */}
                                                                                            {/* <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 flex-shrink-0">
                                                                                                {currentUserProfile?.profilePic ||
                                                                                                user?.profilePic ? (
                                                                                                    <img
                                                                                                        src={
                                                                                                            currentUserProfile?.profilePic ||
                                                                                                            user?.profilePic
                                                                                                        }
                                                                                                        alt={
                                                                                                            username
                                                                                                        }
                                                                                                        className="w-full h-full object-cover"
                                                                                                        onError={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            e.target.style.display =
                                                                                                                "none";
                                                                                                        }}
                                                                                                    />
                                                                                                ) : null}
                                                                                                <div
                                                                                                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-xs ${
                                                                                                        currentUserProfile?.profilePic ||
                                                                                                        user?.profilePic
                                                                                                            ? "hidden"
                                                                                                            : "flex"
                                                                                                    }`}
                                                                                                >
                                                                                                    {username
                                                                                                        ?.charAt(
                                                                                                            0
                                                                                                        )
                                                                                                        .toUpperCase() ||
                                                                                                        "U"}
                                                                                                </div>
                                                                                            </div> */}

                                                                                            {(() => {
                                                                                                const commentUsername =
                                                                                                    comment
                                                                                                        ?.userId
                                                                                                        ?.username ||
                                                                                                    comment
                                                                                                        ?.user
                                                                                                        ?.username ||
                                                                                                    comment?.username ||
                                                                                                    "User";

                                                                                                return (
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        className={`w-full px-3 py-1 rounded-full text-xs border ${
                                                                                                            isDarkMode
                                                                                                                ? "bg-gray-700 border-gray-600 text-white"
                                                                                                                : "bg-white border-gray-300 text-gray-800"
                                                                                                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                                                                        placeholder={`Reply to ${commentUsername}...`}
                                                                                                        value={
                                                                                                            replyContent[
                                                                                                                comment
                                                                                                                    ._id
                                                                                                            ] ||
                                                                                                            ""
                                                                                                        }
                                                                                                        onChange={(
                                                                                                            e
                                                                                                        ) =>
                                                                                                            setReplyContent(
                                                                                                                (
                                                                                                                    prev
                                                                                                                ) => ({
                                                                                                                    ...prev,
                                                                                                                    [comment._id]:
                                                                                                                        e
                                                                                                                            .target
                                                                                                                            .value,
                                                                                                                })
                                                                                                            )
                                                                                                        }
                                                                                                        onKeyDown={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            if (
                                                                                                                e.key ===
                                                                                                                "Enter"
                                                                                                            ) {
                                                                                                                e.preventDefault();
                                                                                                                handleAddReply(
                                                                                                                    comment._id,
                                                                                                                    post._id,
                                                                                                                    e
                                                                                                                );
                                                                                                            }
                                                                                                        }}
                                                                                                    />
                                                                                                );
                                                                                            })()}

                                                                                            <div className="flex space-x-2 self-end sm:self-auto">
                                                                                                <button
                                                                                                    onClick={(
                                                                                                        e
                                                                                                    ) =>
                                                                                                        handleAddReply(
                                                                                                            comment._id,
                                                                                                            post._id,
                                                                                                            e
                                                                                                        )
                                                                                                    }
                                                                                                    className={`px-3 py-1 rounded-full text-xs ${
                                                                                                        !replyContent[
                                                                                                            comment
                                                                                                                ._id
                                                                                                        ]?.trim() ||
                                                                                                        isReplying[
                                                                                                            comment
                                                                                                                ._id
                                                                                                        ]
                                                                                                            ? "bg-blue-300 cursor-not-allowed "
                                                                                                            : "bg-blue-500 hover:bg-blue-600 "
                                                                                                    } text-white transition-colors cursor-pointer`}
                                                                                                    disabled={
                                                                                                        !replyContent[
                                                                                                            comment
                                                                                                                ._id
                                                                                                        ]?.trim() ||
                                                                                                        isReplying[
                                                                                                            comment
                                                                                                                ._id
                                                                                                        ]
                                                                                                    }
                                                                                                >
                                                                                                    {isReplying[
                                                                                                        comment
                                                                                                            ._id
                                                                                                    ] ? (
                                                                                                        <span className="inline-block h-2 w-2 border-2 border-white border-t-transparent rounded-full animate-spin "></span>
                                                                                                    ) : (
                                                                                                        "Post"
                                                                                                    )}
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={(
                                                                                                        e
                                                                                                    ) =>
                                                                                                        toggleReplyInput(
                                                                                                            comment._id,
                                                                                                            post._id,
                                                                                                            e
                                                                                                        )
                                                                                                    }
                                                                                                    className="px-3 py-1 rounded-full text-xs bg-gray-500 hover:bg-gray-600 text-white cursor-pointer flex-1"
                                                                                                >
                                                                                                    Cancel
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Display Replies */}
                                                                                {activeReplies[
                                                                                    comment
                                                                                        ._id
                                                                                ] &&
                                                                                    comment.replies &&
                                                                                    comment
                                                                                        .replies
                                                                                        .length >
                                                                                        0 && (
                                                                                        <div className="mt-2">
                                                                                            {comment.replies.map(
                                                                                                (
                                                                                                    reply
                                                                                                ) => (
                                                                                                    <ReplyItem
                                                                                                        key={
                                                                                                            reply._id
                                                                                                        }
                                                                                                        reply={
                                                                                                            reply
                                                                                                        }
                                                                                                        commentId={
                                                                                                            comment._id
                                                                                                        }
                                                                                                        postId={
                                                                                                            post._id
                                                                                                        }
                                                                                                        commentOwner={
                                                                                                            comment
                                                                                                                .userId
                                                                                                                ?.username
                                                                                                        }
                                                                                                    />
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={`text-center py-4 ${
                                                                    isDarkMode
                                                                        ? "text-gray-400"
                                                                        : "text-gray-500"
                                                                }`}
                                                            >
                                                                No comments yet.
                                                                Be the first to
                                                                comment!
                                                            </div>
                                                        )}

                                                        {/* Add Comment Input - WITH PROFILE AVATAR and POST BUTTON FIRST */}
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                handleCommentSubmit(
                                                                    post._id,
                                                                    e
                                                                );
                                                            }}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            {/* Profile Avatar */}
                                                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 flex-shrink-0">
                                                                {currentUserProfile?.profilePic ||
                                                                user?.profilePic ? (
                                                                    <img
                                                                        src={
                                                                            currentUserProfile?.profilePic ||
                                                                            user?.profilePic
                                                                        }
                                                                        alt={
                                                                            username
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                        onError={(
                                                                            e
                                                                        ) => {
                                                                            e.target.style.display =
                                                                                "none";
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div
                                                                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm ${
                                                                        currentUserProfile?.profilePic ||
                                                                        user?.profilePic
                                                                            ? "hidden"
                                                                            : "flex"
                                                                    }`}
                                                                >
                                                                    {username
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() ||
                                                                        "U"}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 flex space-x-2">
                                                                <input
                                                                    type="text"
                                                                    className={`flex-1 px-3 py-2 rounded-full text-sm border ${
                                                                        isDarkMode
                                                                            ? "bg-gray-700 border-gray-600 text-white"
                                                                            : "bg-white border-gray-300"
                                                                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                                    placeholder="Write a comment..."
                                                                    value={
                                                                        commentContent[
                                                                            post
                                                                                ._id
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
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
                                                                />
                                                                {/* POST BUTTON FIRST */}
                                                                <button
                                                                    type="submit"
                                                                    className={`px-4 py-2 rounded-full text-sm ${
                                                                        !commentContent[
                                                                            post
                                                                                ._id
                                                                        ]?.trim() ||
                                                                        isCommenting[
                                                                            post
                                                                                ._id
                                                                        ]
                                                                            ? "bg-blue-300 cursor-not-allowed"
                                                                            : "bg-blue-500 hover:bg-blue-600"
                                                                    } text-white transition-colors`}
                                                                    disabled={
                                                                        !commentContent[
                                                                            post
                                                                                ._id
                                                                        ]?.trim() ||
                                                                        isCommenting[
                                                                            post
                                                                                ._id
                                                                        ]
                                                                    }
                                                                >
                                                                    {isCommenting[
                                                                        post._id
                                                                    ] ? (
                                                                        <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                    ) : (
                                                                        "Post"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading More Indicator */}
                    {/* {paginationState.isLoadingMore && (
                        <div className="flex justify-center items-center py-6">
                            <div
                                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                                    isDarkMode
                                        ? "border-white"
                                        : "border-blue-500"
                                }`}
                            ></div>
                            <span
                                className={`ml-3 ${
                                    isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                }`}
                            >
                                Loading more posts...
                            </span>
                        </div>
                    )} */}

                    {/* End of Posts Message */}
                    {/* {!paginationState.hasMore && userPosts.length > 0 && (
                        <div
                            className={`text-center py-6 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <p>
                                You've reached the end of {userData.username}{" "}
                                posts
                            </p>
                        </div>
                    )} */}
                </div>
            </section>
        </div>
    );
};

export default UserProfile;
