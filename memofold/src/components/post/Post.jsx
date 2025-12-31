// components/Post/Post.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaComment, FaArrowLeft } from "react-icons/fa";
import { formatDate } from "../../services/dateUtils";
import LikesModal from "../mainFeed/LikesModal";
import CommentSection from "../mainFeed/CommentSection";
import FloatingHearts from "../mainFeed/FloatingHearts";
import ImagePreviewModal from "../mainFeed/ImagePreviewModal";
import MessageBanner from "../mainFeed/MessageBanner";
import ConfirmationModal from "../../common/ConfirmationModal";
import { apiService } from "../../services/api";
import { localStorageService } from "../../services/localStorage";
import { highlightMentionsAndHashtags } from "../../utils/highlightMentionsAndHashtags.jsx";

const Post = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { token, user, username, realname } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [darkMode, setDarkMode] = useState(() =>
        localStorageService.getDarkMode()
    );
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    // States for interactions
    const [isLiking, setIsLiking] = useState({});
    const [likeCooldown, setLikeCooldown] = useState({});
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [loadingComments, setLoadingComments] = useState({});
    const [commentContent, setCommentContent] = useState({});
    const [isCommenting, setIsCommenting] = useState({});
    const [isLikingComment, setIsLikingComment] = useState({});
    const [isDeletingComment, setIsDeletingComment] = useState({});
    // Infinite scroll states for comments
    const [commentsNextCursor, setCommentsNextCursor] = useState({});
    const [hasMoreComments, setHasMoreComments] = useState({});
    const [activeReplies, setActiveReplies] = useState(() => {
        return localStorageService.getActiveReplies() || {};
    });
    const [replyContent, setReplyContent] = useState({});
    const [isReplying, setIsReplying] = useState({});
    const [isLikingReply, setIsLikingReply] = useState({});
    const [isDeletingReply, setIsDeletingReply] = useState({});
    const [activeReplyInputs, setActiveReplyInputs] = useState({});

    // ✅ ADDED: Confirmation modal states
    const [deleteCommentModal, setDeleteCommentModal] = useState({
        isOpen: false,
        commentId: null,
        postId: null,
        event: null,
    });

    const [deleteReplyModal, setDeleteReplyModal] = useState({
        isOpen: false,
        replyId: null,
        commentId: null,
        event: null,
    });

    // Modal states
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [floatingHearts, setFloatingHearts] = useState([]);

    // Video logic states
    const [activeVideoId, setActiveVideoId] = useState(null);
    const videoRefs = useRef({});
    // Handle video tap for mobile
    const handleVideoTap = (postId, e) => {
        e.stopPropagation();
        const video = videoRefs.current[postId];
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    };

    // Prevent video download context menu
    const handleVideoContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    // Intersection Observer for video autoplay/mute
    useEffect(() => {
        if (!post || !post.videoUrl) return;
        let observer;
        const videoEl = videoRefs.current[post._id];
        if (videoEl && 'IntersectionObserver' in window) {
            observer = new window.IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                            setActiveVideoId(post._id);
                        } else if (activeVideoId === post._id && (!entry.isIntersecting || entry.intersectionRatio < 0.5)) {
                            setActiveVideoId(null);
                        }
                    });
                },
                { threshold: 0.5 }
            );
            observer.observe(videoEl);
        }
        return () => {
            if (observer && videoEl) observer.disconnect();
        };
    }, [post, activeVideoId]);

    // Tab visibility: pause/mute all videos if tab not active
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState !== "visible") {
                Object.values(videoRefs.current).forEach(video => {
                    if (video) {
                        video.pause();
                        video.muted = true;
                    }
                });
            } else {
                const video = videoRefs.current[post?._id];
                if (video) {
                    if (activeVideoId === post?._id) {
                        video.muted = false;
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                        video.muted = true;
                    }
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        handleVisibility();
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [activeVideoId, post]);

    useEffect(() => {
        if (postId && token) {
            fetchCurrentUserProfile();
            fetchPost();
        }
    }, [postId, token]);

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode);
    }, [darkMode]);

    useEffect(() => {
        localStorageService.setActiveReplies(activeReplies);
    }, [activeReplies]);

    const fetchCurrentUserProfile = async () => {
        try {
            const userData = await apiService.fetchCurrentUser(token);
            setCurrentUserProfile(userData);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchPost = async () => {
        try {
            setLoading(true);

            // Use the new single post endpoint
            const response = await apiService.fetchSinglePost(token, postId);

            // The response should be the single post object
            const foundPost = response.post || response;

            if (foundPost) {
                const storedLikes = localStorageService.getStoredLikes();
                const storedLikesPreview =
                    localStorageService.getStoredLikesPreview();
                const storedLikesCount =
                    localStorageService.getStoredLikesCount();

                const postLikes =
                    foundPost.likes || storedLikes[foundPost._id] || [];
                const postLikesPreview =
                    foundPost.likesPreview ||
                    storedLikesPreview[foundPost._id] ||
                    [];
                const postLikesCount =
                    foundPost.likeCount ||
                    storedLikesCount[foundPost._id] ||
                    postLikes.length;

                const hasUserLiked =
                    postLikes.includes(user._id) ||
                    postLikes.includes(username) ||
                    (postLikesPreview &&
                        postLikesPreview.some(
                            (like) => like.username === username
                        ));

                setPost({
                    ...foundPost,
                    likes: postLikes,
                    likesPreview: postLikesPreview,
                    likeCount: postLikesCount,
                    hasUserLiked: hasUserLiked,
                    comments: foundPost.comments || [],
                    commentCount: foundPost.commentCount || 0,
                });

                localStorageService.updateStoredLikes({
                    [foundPost._id]: postLikes,
                });
                localStorageService.updateStoredLikesPreview({
                    [foundPost._id]: postLikesPreview,
                });
                localStorageService.updateStoredLikesCount({
                    [foundPost._id]: postLikesCount,
                });
            } else {
                setError("Post not found");
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            setError("Failed to load post");
        } finally {
            setLoading(false);
        }
    };
    const refreshSinglePost = async (postId) => {
        try {
            const updatedData = await apiService.fetchSinglePost(token, postId);
            const updatedPost = updatedData.post || updatedData;

            if (updatedPost) {
                // ✅ Post state को update करें
                setPost((prev) => ({
                    ...prev,
                    ...updatedPost,
                    // ✅ Comments को preserve करें (अगर वर्तमान में open हैं)
                    comments: prev.comments || updatedPost.comments || [],
                    commentCount:
                        updatedPost.commentCount ||
                        updatedPost.comments?.length ||
                        0,
                }));
            }
        } catch (err) {
            console.error("Failed to refresh post:", err);
        }
    };
    const handleLike = async (postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (likeCooldown[postId]) return;

        setLikeCooldown((prev) => ({ ...prev, [postId]: true }));
        setTimeout(() => {
            setLikeCooldown((prev) => ({ ...prev, [postId]: false }));
        }, 500);

        if (!username || !user?._id) {
            setError("You must be logged in to like posts");
            return;
        }

        setIsLiking((prev) => ({ ...prev, [postId]: true }));

        try {
            const isCurrentlyLiked = post?.hasUserLiked;

            const newLikeCount = isCurrentlyLiked
                ? Math.max(0, (post.likeCount || 0) - 1)
                : (post.likeCount || 0) + 1;

            let newLikesPreview = [...(post.likesPreview || [])];

            if (isCurrentlyLiked) {
                newLikesPreview = newLikesPreview.filter(
                    (like) => like.username !== username
                );
            } else {
                newLikesPreview.unshift({
                    username: username,
                    realname: realname,
                    profilePic:
                        currentUserProfile?.profilePic || user?.profilePic,
                });
            }

            setPost((prev) => ({
                ...prev,
                likeCount: newLikeCount,
                likesPreview: newLikesPreview,
                hasUserLiked: !isCurrentlyLiked,
            }));

            const response = await apiService.likePost(postId, user._id, token);

            if (response.success) {
                const actualLikeCount = response.likes
                    ? response.likes.length
                    : newLikeCount;

                setPost((prev) => ({
                    ...prev,
                    likeCount: actualLikeCount,
                    likesPreview: newLikesPreview,
                    hasUserLiked: !isCurrentlyLiked,
                }));

                if (!isCurrentlyLiked && e) {
                    let rect;
                    if (e.target) {
                        rect = e.target.getBoundingClientRect();
                    } else if (e.currentTarget) {
                        rect = e.currentTarget.getBoundingClientRect();
                    } else {
                        rect = {
                            left: window.innerWidth / 2,
                            top: window.innerHeight / 2,
                            width: 0,
                            height: 0,
                        };
                    }

                    setFloatingHearts((hearts) => [
                        ...hearts,
                        {
                            id: Date.now() + Math.random(),
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                        },
                    ]);
                }
            } else {
                throw new Error(response.message || "Like operation failed");
            }
        } catch (err) {
            setError(err.message);
            setPost((prev) => ({
                ...prev,
                likeCount: post.likeCount || 0,
                hasUserLiked: post.hasUserLiked,
            }));
        } finally {
            setIsLiking((prev) => ({ ...prev, [postId]: false }));
        }
    };


    // Infinite scroll for comments (with cursor)
    const fetchComments = async (postId, cursor = null, append = false) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
        try {
            const responseData = await apiService.fetchComments(postId, token, cursor);
            const comments = responseData.comments || [];
            const commentCount = responseData.count || comments.length;
            const nextCursor = responseData.nextCursor || null;

            const storedCommentLikes = localStorageService.getStoredCommentLikes();
            const commentsWithLikes = comments.map((comment) => {
                const commentLikes = storedCommentLikes[comment._id] || comment.likes || [];
                const hasUserLiked = commentLikes.includes(user._id);
                const userData = comment.userId || comment.user || {
                    _id: "unknown",
                    username: "Unknown",
                    realname: "Unknown User",
                    profilePic: "",
                };
                const finalUserData = {
                    _id: userData._id || "unknown",
                    username: userData.username || "Unknown",
                    realname: userData.realname || userData.username || "Unknown User",
                    profilePic: userData.profilePic || "",
                };
                return {
                    ...comment,
                    likes: commentLikes,
                    hasUserLiked: hasUserLiked,
                    userId: finalUserData,
                    replies: [],
                    replyCount: comment.replyCount || 0,
                    showReplyInput: false,
                };
            });

            setPost((prev) => ({
                ...prev,
                comments: append && prev.comments ? [...prev.comments, ...commentsWithLikes] : commentsWithLikes,
                commentCount: commentCount,
                commentsNextCursor: nextCursor,
            }));
            setCommentsNextCursor((prev) => ({ ...prev, [postId]: nextCursor }));
            setHasMoreComments((prev) => ({ ...prev, [postId]: !!nextCursor }));
            setActiveCommentPostId(postId);

            const likesByComment = {};
            comments.forEach((comment) => {
                likesByComment[comment._id] = storedCommentLikes[comment._id] || comment.likes || [];
            });
            localStorage.setItem("commentLikes", JSON.stringify(likesByComment));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingComments((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const handleToggleCommentDropdown = async (postId, e) => {
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

            setPost((prev) => ({
                ...prev,
                comments: [
                    // ✅ NEW COMMENT AT TOP
                    {
                        ...createdComment,
                        isLiked: false,
                        userId: {
                            _id:
                                currentUserProfile?._id ||
                                user?._id ||
                                username,
                            username: username,
                            realname:
                                currentUserProfile?.realname ||
                                realname ||
                                username,
                            profilePic:
                                currentUserProfile?.profilePic ||
                                user?.profilePic,
                        },
                        replies: [],
                        replyCount: 0,
                        showReplyInput: false,
                    },
                    // ✅ EXISTING COMMENTS BELOW
                    ...(prev.comments || []),
                ],
                commentCount: (prev.commentCount || 0) + 1,
            }));

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCommenting((prev) => ({ ...prev, [postId]: false }));
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
            setPost((prev) => {
                const updatedComments = prev.comments?.map((comment) => {
                    if (comment._id === commentId) {
                        const isLiked = comment.hasUserLiked;
                        let updatedLikes;

                        if (isLiked) {
                            updatedLikes = comment.likes.filter(
                                (likeUserId) => likeUserId !== user._id
                            );
                        } else {
                            updatedLikes = [...(comment.likes || []), user._id];
                        }

                        localStorageService.updateStoredCommentLikes(
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

                return { ...prev, comments: updatedComments };
            });

            await apiService.likeComment(commentId, user._id, token);
            await fetchComments(postId);
        } catch (err) {
            setError(err.message);
            await fetchComments(postId);
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // ✅ ADDED: Comment deletion modal handlers
    const handleOpenDeleteCommentModal = (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const comment = post?.comments?.find((c) => c._id === commentId);

        if (!comment) {
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
            event: e,
        });
    };

    const handleConfirmDeleteComment = async () => {
        const { commentId, postId } = deleteCommentModal;

        setIsDeletingComment((prev) => ({ ...prev, [commentId]: true }));

        const originalPost = { ...post };

        try {
            const comment = post?.comments?.find((c) => c._id === commentId);
            const replyIds = comment?.replies?.map((reply) => reply._id) || [];

            setPost((prev) => ({
                ...prev,
                comments:
                    prev.comments?.filter(
                        (comment) => comment._id !== commentId
                    ) || [],
                commentCount: Math.max((prev.commentCount || 1) - 1, 0),
            }));

            const storedCommentLikes =
                localStorageService.getStoredCommentLikes();
            delete storedCommentLikes[commentId];
            replyIds.forEach((replyId) => {
                delete storedCommentLikes[replyId];
            });

            localStorage.setItem(
                "commentLikes",
                JSON.stringify(storedCommentLikes)
            );

            await apiService.deleteComment(commentId, postId, token);
            await refreshSinglePost(postId);

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message);
            setPost(originalPost);
        } finally {
            setIsDeletingComment((prev) => ({ ...prev, [commentId]: false }));
            setDeleteCommentModal({
                isOpen: false,
                commentId: null,
                postId: null,
                event: null,
            });
        }
    };

    const handleCloseDeleteCommentModal = () => {
        setDeleteCommentModal({
            isOpen: false,
            commentId: null,
            postId: null,
            event: null,
        });
    };

    // ✅ ADDED: Reply deletion modal handlers
    const handleOpenDeleteReplyModal = (replyId, commentId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let replyOwner = "";

        for (const comment of post.comments || []) {
            const reply = comment.replies?.find((r) => r._id === replyId);
            if (reply && comment._id === commentId) {
                replyOwner = reply.userId?.username;
                break;
            }
        }

        if (!replyOwner) {
            setError("Reply not found");
            return;
        }

        const isReplyOwner = replyOwner === username;

        if (!isReplyOwner) {
            setError("You don't have permission to delete this reply");
            return;
        }

        setDeleteReplyModal({
            isOpen: true,
            replyId,
            commentId,
            event: e,
        });
    };

    const handleConfirmDeleteReply = async () => {
        const { replyId, commentId } = deleteReplyModal;

        setIsDeletingReply((prev) => ({ ...prev, [replyId]: true }));

        const originalPost = { ...post };

        try {
            setPost((prev) => ({
                ...prev,
                comments:
                    prev.comments?.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  replies:
                                      comment.replies?.filter(
                                          (reply) => reply._id !== replyId
                                      ) || [],
                                  replyCount: Math.max(
                                      0,
                                      (comment.replyCount || 1) - 1
                                  ),
                              }
                            : comment
                    ) || [],
                commentCount: Math.max(0, (prev.commentCount || 1) - 1),
            }));

            const result = await apiService.deleteReply(replyId, token);

            if (result.success) {
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                throw new Error(result.message || "Failed to delete reply");
            }
        } catch (err) {
            setError(err.message || "Failed to delete reply");
            setPost(originalPost);
        } finally {
            setIsDeletingReply((prev) => ({ ...prev, [replyId]: false }));
            setDeleteReplyModal({
                isOpen: false,
                replyId: null,
                commentId: null,
                event: null,
            });
        }
    };

    const handleCloseDeleteReplyModal = () => {
        setDeleteReplyModal({
            isOpen: false,
            replyId: null,
            commentId: null,
            event: null,
        });
    };

    // Replace the existing handleAddReply with this
    const handleAddReply = async (postId, commentId, replyKey) => {
        const content = replyContent[replyKey] || "";

        if (!content.trim()) {
            setError("Reply cannot be empty");
            return;
        }

        if (!username) {
            setError("You must be logged in to reply");
            navigate("/login");
            return;
        }

        // Instantly clear and close the reply input for snappy UI
        setReplyContent((prev) => ({ ...prev, [replyKey]: "" }));
        setActiveReplyInputs((prev) => ({ ...prev, [replyKey]: false }));
        setIsReplying((prev) => ({ ...prev, [replyKey]: true }));
        setError(null);

        try {
            const responseData = await apiService.addCommentReply(
                commentId,
                content,
                postId,
                token
            );

            if (responseData.msg === "Invalid token") {
                throw new Error("Session expired. Please log in again.");
            }

            const createdReply = responseData.reply || responseData;

            setPost((prev) => ({
                ...prev,
                comments: prev.comments?.map((comment) => {
                    if (comment._id === commentId) {
                        const newReply = {
                            ...createdReply,
                            _id: createdReply._id || `temp-${Date.now()}`,
                            content: content,
                            userId: {
                                _id: user._id,
                                username: username,
                                realname: realname,
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

                        // ✅ NEW REPLY APPEARS AT TOP
                        const updatedReplies = [
                            newReply,
                            ...(comment.replies || []),
                        ];

                        return {
                            ...comment,
                            replies: updatedReplies,
                            replyCount: updatedReplies.length,
                            showReplyInput: false,
                        };
                    }
                    return comment;
                }),
                commentCount: (prev.commentCount || 0) + 1,
            }));

            // ✅ AUTO OPEN: Show replies section
            setActiveReplies((prev) => ({
                ...prev,
                [commentId]: true,
            }));
        } catch (err) {
            if (
                err.message &&
                (err.message.includes("token") || err.message.includes("auth"))
            ) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.message || "Failed to post reply");
            }
        } finally {
            setIsReplying((prev) => ({ ...prev, [replyKey]: false }));
        }
    };
    const handleLikeReply = async (replyId, commentId, e) => {
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
            setPost((prev) => ({
                ...prev,
                comments:
                    prev.comments?.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  replies:
                                      comment.replies?.map((reply) =>
                                          reply._id === replyId
                                              ? {
                                                    ...reply,
                                                    likes: reply.hasUserLiked
                                                        ? reply.likes.filter(
                                                              (likeUserId) =>
                                                                  likeUserId !==
                                                                  user._id
                                                          )
                                                        : [
                                                              ...(reply.likes ||
                                                                  []),
                                                              user._id,
                                                          ],
                                                    hasUserLiked:
                                                        !reply.hasUserLiked,
                                                }
                                              : reply
                                      ) || [],
                              }
                            : comment
                    ) || [],
            }));

            await apiService.likeReply(replyId, user._id, token);
        } catch (err) {
            setError(err.message);
            await fetchComments(post._id);
        } finally {
            setIsLikingReply((prev) => ({ ...prev, [replyId]: false }));
        }
    };

    // Enhanced: Support cursor-based pagination for replies
    // Accepts: commentId, event, cursor (optional), append (optional)
    const toggleReplies = async (commentId, e, cursor = null, append = false) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // If loading more (append), always keep replies open
        const newActiveRepliesState = {
            ...activeReplies,
            [commentId]: append ? true : !activeReplies[commentId],
        };

        // Only fetch if opening or loading more
        if (!activeReplies[commentId] || append) {
            try {
                const responseData = await apiService.fetchCommentReplies(
                    commentId,
                    token,
                    cursor
                );
                const replies = responseData.replies || [];
                const nextCursor = responseData.nextCursor || null;

                setPost((prev) => ({
                    ...prev,
                    comments:
                        prev.comments?.map((comment) => {
                            if (comment._id === commentId) {
                                // Prepare new replies array
                                let newReplies = [];
                                if (append && Array.isArray(comment.replies)) {
                                    // Append to existing replies
                                    newReplies = [
                                        ...comment.replies,
                                        ...replies.map((reply) => {
                                            const replyUserData = reply.userId || reply.user || {};
                                            const finalReplyUserData = {
                                                _id: replyUserData?._id || replyUserData?.id || "unknown",
                                                username: replyUserData?.username || replyUserData?.userName || "Unknown",
                                                realname: replyUserData?.realname || replyUserData?.realName || replyUserData?.username || "Unknown User",
                                                profilePic: replyUserData?.profilePic || replyUserData?.profilepic || replyUserData?.avatar || replyUserData?.image || "",
                                            };
                                            return {
                                                ...reply,
                                                likes: reply.likes || [],
                                                hasUserLiked: (reply.likes || []).includes(user._id),
                                                userId: finalReplyUserData,
                                            };
                                        })
                                    ];
                                } else {
                                    // Replace replies
                                    newReplies = replies.map((reply) => {
                                        const replyUserData = reply.userId || reply.user || {};
                                        const finalReplyUserData = {
                                            _id: replyUserData?._id || replyUserData?.id || "unknown",
                                            username: replyUserData?.username || replyUserData?.userName || "Unknown",
                                            realname: replyUserData?.realname || replyUserData?.realName || replyUserData?.username || "Unknown User",
                                            profilePic: replyUserData?.profilePic || replyUserData?.profilepic || replyUserData?.avatar || replyUserData?.image || "",
                                        };
                                        return {
                                            ...reply,
                                            likes: reply.likes || [],
                                            hasUserLiked: (reply.likes || []).includes(user._id),
                                            userId: finalReplyUserData,
                                        };
                                    });
                                }
                                return {
                                    ...comment,
                                    replies: newReplies,
                                    replyCount: append
                                        ? (comment.replyCount || 0) + replies.length
                                        : replies.length,
                                    repliesNextCursor: nextCursor, // <-- Set nextCursor for UI
                                };
                            }
                            return comment;
                        }) || [],
                }));
            } catch (err) {
                setError("Failed to load replies");
                return;
            }
        }

        setActiveReplies(newActiveRepliesState);
    };

    const toggleReplyInput = (key, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // ✅ Toggle the active input box for the given key (comment or reply)
        setActiveReplyInputs((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));

        // ✅ Ensure reply content state exists for this key
        setReplyContent((prev) => ({
            ...prev,
            [key]: prev[key] || "",
        }));
    };

    // ✅ Fix reply input typing not updating state
    const handleSetReplyContent = (key, value) => {
        setReplyContent((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (userId) {
            if (currentUserProfile && userId === currentUserProfile._id) {
                navigate("/profile");
            } else {
                navigate(`/user/${userId}`);
            }
        }
    };

    const handleImagePreview = (imageUrl) => {
        setPreviewImage(imageUrl);
        setShowImagePreview(true);
    };

    const handleImageError = (e) => {
        e.target.style.display = "none";
    };

    const handleProfilePicError = (e) => {
        e.target.style.display = "none";
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = "flex";
        }
    };

    const getLikedUsers = () => {
        if (post?.likesPreview && post.likesPreview.length > 0) {
            return post.likesPreview;
        }
        return [];
    };

    const likedUsers = getLikedUsers();
    const totalLikes = post?.likeCount || 0;

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${
                    darkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${
                    darkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
            >
                <div className="text-center">
                    <h1
                        className={`text-2xl font-bold mb-4 ${
                            darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        {error || "Post not found"}
                    </h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
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
                darkMode
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-[#fdfaf6] text-gray-900"
            }`}
        >
            <FloatingHearts
                hearts={floatingHearts}
                setHearts={setFloatingHearts}
            />

            {showImagePreview && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setShowImagePreview(false)}
                />
            )}

            {/* ✅ ADDED: Comment Deletion Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteCommentModal.isOpen}
                onClose={handleCloseDeleteCommentModal}
                onConfirm={handleConfirmDeleteComment}
                title="Delete Comment"
                message="Are you sure you want to delete this comment and all its replies?"
                confirmText="Delete"
                cancelText="Cancel"
                type="delete"
                isLoading={isDeletingComment[deleteCommentModal.commentId]}
                isDarkMode={darkMode}
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
                isDarkMode={darkMode}
            />

            {/* Header */}
            <div
                className={`sticky top-0 z-10 ${
                    darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                } border-b`}
            >
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full transition-colors mr-3 cursor-pointer ${
                            darkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-600"
                        }`}
                    >
                        <FaArrowLeft className="text-lg" />
                    </button>
                    <h1
                        className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-gray-800"
                        }`}
                    >
                        Post
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto p-4">
                {post && (
                    <div
                        className={`w-full rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${
                            darkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-900"
                        }`}
                    >
                        <LikesModal
                            postId={post._id}
                            isOpen={showLikesModal}
                            onClose={() => setShowLikesModal(false)}
                            token={token}
                            isDarkMode={darkMode}
                        />

                        {/* User Info */}
                        <div
                            className="flex items-center gap-3 mb-3 cursor-pointer"
                            onClick={(e) =>
                                navigateToUserProfile(post.userId._id, e)
                            }
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer">
                                {post.userId.profilePic ? (
                                    <img
                                        src={post.userId.profilePic}
                                        alt={post.userId.username}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onError={handleProfilePicError}
                                    />
                                ) : null}
                                <div
                                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg cursor-pointer ${
                                        post.userId.profilePic
                                            ? "hidden"
                                            : "flex"
                                    }`}
                                >
                                    {post.userId.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                </div>
                            </div>

                            <div>
                                <h3
                                    className={`text-base font-semibold hover:text-blue-500 transition-colors cursor-pointer ${
                                        darkMode
                                            ? "text-white"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {post.userId.realname ||
                                        post.userId.username ||
                                        "Unknown User"}
                                </h3>

                                <p
                                    className={`text-xs ${
                                        darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    @{post.userId.username || "unknown"} ·{" "}
                                    {formatDate(post.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Post Content */}
                        <p
                            className={`leading-relaxed mb-3 ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            {highlightMentionsAndHashtags(post.content || "")}
                        </p>


                        {/* Post Video */}
                        {post.videoUrl && (
                            <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                                <video
                                    ref={el => (videoRefs.current[post._id] = el)}
                                    src={post.videoUrl}
                                    className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl bg-black"
                                    muted={activeVideoId !== post._id}
                                    autoPlay
                                    playsInline
                                    onClick={e => handleVideoTap(post._id, e)}
                                    onContextMenu={handleVideoContextMenu}
                                    controls={activeVideoId === post._id}
                                    style={{ backgroundColor: "black" }}
                                />
                            </div>
                        )}

                        {/* Post Image */}
                        {post.image && (
                            <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="max-h-96 max-w-full object-contain cursor-pointer rounded-xl"
                                    onClick={() =>
                                        handleImagePreview(post.image)
                                    }
                                    onError={handleImageError}
                                />
                            </div>
                        )}

                        {/* Engagement Stats and Actions */}
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => handleLike(post._id, e)}
                                    disabled={
                                        isLiking[post._id] ||
                                        likeCooldown[post._id]
                                    }
                                    className={`flex items-center gap-1 cursor-pointer ${
                                        isLiking[post._id] ||
                                        likeCooldown[post._id]
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    } hover:text-red-500 transition-colors`}
                                >
                                    {isLiking[post._id] ? (
                                        <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : post.isLikedByMe ? (
                                        <FaHeart className="text-xl text-red-500" />
                                    ) : (
                                        <FaRegHeart className="text-xl text-gray-400" />
                                    )}
                                    <motion.span
                                        key={totalLikes}
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1.2, 1] }}
                                        transition={{ duration: 0.2 }}
                                        className={`text-sm font-medium cursor-pointer ${
                                            post.isLikedByMe
                                                ? "text-red-500"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {totalLikes}
                                    </motion.span>
                                </motion.button>

                                {/* Liked by text */}
                                {totalLikes > 0 && (
                                    <div className="text-sm">
                                        <div className="flex items-center flex-wrap">
                                            {likedUsers.length > 0 ? (
                                                <>
                                                    {likedUsers
                                                        .slice(0, 2)
                                                        .map((user, index) => (
                                                            <span
                                                                key={index}
                                                                className={`font-medium mr-1 hover:underline cursor-pointer ${
                                                                    darkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-700"
                                                                }`}
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    navigateToUserProfile(
                                                                        user.id
                                                                    );
                                                                }}
                                                            >
                                                                {user.username}
                                                                {index <
                                                                Math.min(
                                                                    2,
                                                                    likedUsers.length -
                                                                        1
                                                                )
                                                                    ? ","
                                                                    : ""}
                                                            </span>
                                                        ))}

                                                    {totalLikes > 2 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowLikesModal(
                                                                    true
                                                                );
                                                            }}
                                                            className={`font-medium cursor-pointer ${
                                                                darkMode
                                                                    ? "text-blue-300"
                                                                    : "text-blue-500"
                                                            } hover:underline`}
                                                        >
                                                            and {totalLikes - 2}{" "}
                                                            others
                                                        </button>
                                                    )}

                                                    {totalLikes === 2 &&
                                                        likedUsers.length ===
                                                            1 && (
                                                            <span
                                                                className={`font-medium mr-1 cursor-pointer ${
                                                                    darkMode
                                                                        ? "text-gray-300"
                                                                        : "text-gray-700"
                                                                }`}
                                                            >
                                                                and 1 other
                                                            </span>
                                                        )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowLikesModal(true);
                                                    }}
                                                    className={`font-medium cursor-pointer ${
                                                        darkMode
                                                            ? "text-blue-300"
                                                            : "text-blue-500"
                                                    } hover:underline`}
                                                >
                                                    {totalLikes}{" "}
                                                    {totalLikes === 1
                                                        ? "like"
                                                        : "likes"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                                onClick={(e) =>
                                    handleToggleCommentDropdown(post._id, e)
                                }
                                disabled={loadingComments[post._id]}
                            >
                                <FaComment />
                                <span className="text-sm cursor-pointer">
                                    {post.commentCount || 0}
                                </span>
                                {loadingComments[post._id] && (
                                    <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                                )}
                            </button>
                        </div>

                        {/* Comment Section */}
                        <CommentSection
                            post={{
                                ...post,
                                commentsNextCursor: post.commentsNextCursor,
                            }}
                            username={username}
                            currentUserProfile={currentUserProfile}
                            user={user}
                            isDarkMode={darkMode}
                            activeCommentPostId={activeCommentPostId}
                            loadingComments={loadingComments}
                            commentContent={commentContent}
                            isCommenting={isCommenting}
                            isLikingComment={isLikingComment}
                            isDeletingComment={isDeletingComment}
                            activeReplies={activeReplies}
                            replyContent={replyContent}
                            isReplying={isReplying}
                            isLikingReply={isLikingReply}
                            isDeletingReply={isDeletingReply}
                            onToggleCommentDropdown={handleToggleCommentDropdown}
                            onCommentSubmit={handleCommentSubmit}
                            onSetCommentContent={setCommentContent}
                            onLikeComment={handleLikeComment}
                            onDeleteComment={handleOpenDeleteCommentModal}
                            onToggleReplies={toggleReplies}
                            onToggleReplyInput={toggleReplyInput}
                            onAddReply={handleAddReply}
                            onLikeReply={handleLikeReply}
                            onDeleteReply={handleOpenDeleteReplyModal}
                            onSetReplyContent={handleSetReplyContent}
                            navigateToUserProfile={navigateToUserProfile}
                            activeReplyInputs={activeReplyInputs}
                            fetchComments={fetchComments}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Post;
