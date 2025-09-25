import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/navbar";
import PostCard from "./PostCard";
import FloatingHearts from "./FloatingHearts";
import ImagePreviewModal from "./ImagePreviewModal";
import MessageBanner from "./MessageBanner";
import { apiService } from "../../services/api";
import { localStorageService } from "../../services/localStorage";

const MainFeed = () => {
    const { token, logout, user, username, realname } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(localStorageService.getDarkMode());
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [isLiking, setIsLiking] = useState({});
    const [isCommenting, setIsCommenting] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [commentContent, setCommentContent] = useState({});
    const [isLikingComment, setIsLikingComment] = useState({});
    const [isDeletingComment, setIsDeletingComment] = useState({});
    const [likeCooldown, setLikeCooldown] = useState({});

    // Floating hearts state
    const [floatingHearts, setFloatingHearts] = useState([]);

    // Image preview states
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    // Reply functionality states
    const [activeReplies, setActiveReplies] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const [isReplying, setIsReplying] = useState({});
    const [isLikingReply, setIsLikingReply] = useState({});
    const [isDeletingReply, setIsDeletingReply] = useState({});

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            fetchCurrentUserProfile();
            fetchPosts();
        }
    }, [token, navigate]);

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const fetchCurrentUserProfile = async () => {
        try {
            const userData = await apiService.fetchCurrentUser(token);
            setCurrentUserProfile(userData);

            if (userData.createdAt) {
                localStorageService.setJoinedDate(userData.createdAt);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchPosts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiService.fetchPosts(token);
            const postsData = Array.isArray(data) ? data : data.posts || [];

            // Get stored data from localStorage
            const storedLikes = localStorageService.getStoredLikes();
            const storedLikesPreview =
                localStorageService.getStoredLikesPreview();
            const storedLikesCount = localStorageService.getStoredLikesCount();

            const postsWithLikes = postsData.map((post) => {
                // Get data from storage or API - prioritize API data
                const postLikes = post.likes || storedLikes[post._id] || [];
                const postLikesPreview =
                    post.likesPreview || storedLikesPreview[post._id] || [];
                const postLikesCount =
                    post.likesCount ||
                    storedLikesCount[post._id] ||
                    postLikes.length;

                // Check if current user has liked this post
                const hasUserLiked =
                    postLikes.includes(user._id) ||
                    postLikes.includes(username) ||
                    (postLikesPreview &&
                        postLikesPreview.some(
                            (like) => like.username === username
                        ));

                return {
                    ...post,
                    likes: postLikes,
                    likesPreview: postLikesPreview,
                    likesCount: postLikesCount,
                    hasUserLiked: hasUserLiked,
                    createdAt: post.createdAt || new Date().toISOString(),
                    comments: post.comments || [],
                };
            });

            setPosts(postsWithLikes);

            // Update localStorage with current data
            const likesByPost = {};
            const likesPreviewByPost = {};
            const likesCountByPost = {};

            postsData.forEach((post) => {
                likesByPost[post._id] =
                    post.likes || storedLikes[post._id] || [];
                likesPreviewByPost[post._id] =
                    post.likesPreview || storedLikesPreview[post._id] || [];
                likesCountByPost[post._id] =
                    post.likesCount ||
                    storedLikesCount[post._id] ||
                    likesByPost[post._id].length;
            });

            localStorage.setItem("postLikes", JSON.stringify(likesByPost));
            localStorage.setItem(
                "postLikesPreview",
                JSON.stringify(likesPreviewByPost)
            );
            localStorage.setItem(
                "postLikesCount",
                JSON.stringify(likesCountByPost)
            );
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));

        try {
            const responseData = await apiService.fetchComments(postId, token);
            const comments = responseData.comments || [];

            // Get stored comment likes from localStorage
            const storedCommentLikes =
                localStorageService.getStoredCommentLikes();

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
                    replies: comment.replies || [],
                    showReplyInput: false,
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
            setLoadingComments((prev) => ({ ...prev, [postId]: false }));
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
            // Optimistic UI update
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(
                            (comment) => {
                                if (comment._id === commentId) {
                                    const isLiked = comment.hasUserLiked;
                                    let updatedLikes;

                                    if (isLiked) {
                                        // Remove user ID
                                        updatedLikes = comment.likes.filter(
                                            (likeUserId) =>
                                                likeUserId !== user._id
                                        );
                                    } else {
                                        // Add user ID
                                        updatedLikes = [
                                            ...(comment.likes || []),
                                            user._id,
                                        ];
                                    }

                                    // Update localStorage
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
                            }
                        );

                        return { ...post, comments: updatedComments };
                    }
                    return post;
                })
            );

            await apiService.likeComment(commentId, user._id, token);
            await fetchComments(postId);
        } catch (err) {
            console.error("Error liking comment:", err);
            setError(err.message);
            await fetchComments(postId);
        } finally {
            setIsLikingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleDeleteComment = async (commentId, postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const post = posts.find((p) => p._id === postId);
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

        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        setIsDeletingComment((prev) => ({ ...prev, [commentId]: true }));

        const originalPosts = [...posts];

        try {
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments =
                            post.comments?.filter(
                                (comment) => comment._id !== commentId
                            ) || [];
                        return {
                            ...post,
                            comments: updatedComments,
                            commentCount: updatedComments.length,
                        };
                    }
                    return post;
                })
            );

            // Remove comment likes from localStorage when comment is deleted
            const storedCommentLikes =
                localStorageService.getStoredCommentLikes();
            delete storedCommentLikes[commentId];
            localStorage.setItem(
                "commentLikes",
                JSON.stringify(storedCommentLikes)
            );

            await apiService.deleteComment(commentId, postId, token);

            setSuccessMessage("Comment deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error deleting comment:", err);
            setError(err.message);
            setPosts(originalPosts);
        } finally {
            setIsDeletingComment((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const handleLike = async (postId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Prevent multiple rapid likes
        if (likeCooldown[postId]) return;

        setLikeCooldown((prev) => ({ ...prev, [postId]: true }));
        setTimeout(() => {
            setLikeCooldown((prev) => ({ ...prev, [postId]: false }));
        }, 500);

        if (!username || !user?._id) {
            console.error("User information not available");
            setError("You must be logged in to like posts");
            return;
        }

        setIsLiking((prev) => ({ ...prev, [postId]: true }));

        try {
            const currentPost = posts.find((post) => post._id === postId);
            const isCurrentlyLiked = currentPost?.hasUserLiked;

            // 1. Pehle optimistic update karein
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const newLikeCount = isCurrentlyLiked
                            ? Math.max(0, (post.likeCount || 0) - 1)
                            : (post.likeCount || 0) + 1;

                        let newLikesPreview = [...(post.likesPreview || [])];

                        if (isCurrentlyLiked) {
                            // Remove current user from likesPreview
                            newLikesPreview = newLikesPreview.filter(
                                (like) => like.username !== username
                            );
                        } else {
                            // Add current user to likesPreview
                            newLikesPreview.unshift({
                                // unshift se start mein add hoga
                                username: username,
                                realname: realname,
                                profilePic:
                                    currentUserProfile?.profilePic ||
                                    user?.profilePic,
                            });
                        }

                        return {
                            ...post,
                            likeCount: newLikeCount,
                            likesPreview: newLikesPreview,
                            hasUserLiked: !isCurrentlyLiked,
                        };
                    }
                    return post;
                })
            );

            // 2. API call karein
            const response = await apiService.likePost(postId, user._id, token);

            console.log("Like API Response:", response); // Debugging ke liye

            // 3. API response se actual data leke update karein
            if (response.success) {
                // Agar API se likeCount aur likesPreview mile toh use karein
                const actualLikeCount = response.likes
                    ? response.likes.length
                    : isCurrentlyLiked
                    ? (currentPost.likeCount || 1) - 1
                    : (currentPost.likeCount || 0) + 1;

                // Likes preview update karein based on current state
                let updatedLikesPreview = [...(currentPost.likesPreview || [])];

                if (isCurrentlyLiked) {
                    // Unlike kiya hai - remove user from preview
                    updatedLikesPreview = updatedLikesPreview.filter(
                        (like) => like.username !== username
                    );
                } else {
                    // Like kiya hai - add user to preview
                    updatedLikesPreview.unshift({
                        username: username,
                        realname: realname,
                        profilePic:
                            currentUserProfile?.profilePic || user?.profilePic,
                    });
                }

                setPosts(
                    posts.map((post) => {
                        if (post._id === postId) {
                            return {
                                ...post,
                                likeCount: actualLikeCount,
                                likesPreview: updatedLikesPreview,
                                hasUserLiked: !isCurrentlyLiked,
                            };
                        }
                        return post;
                    })
                );
            } else {
                // Agar API fail hui toh optimistic update revert karein
                throw new Error(response.message || "Like operation failed");
            }

            // 4. Floating hearts animation ONLY when adding a like
            if (!isCurrentlyLiked && e) {
                const rect = e.target.getBoundingClientRect();
                setFloatingHearts((hearts) => [
                    ...hearts,
                    {
                        id: Date.now(),
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    },
                ]);
            }
        } catch (err) {
            console.error("Error liking post:", err);
            setError(err.message);

            // Revert optimistic update on error
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            likeCount: post.likeCount || 0,
                            hasUserLiked: post.hasUserLiked,
                        };
                    }
                    return post;
                })
            );
        } finally {
            setIsLiking((prev) => ({ ...prev, [postId]: false }));
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

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [
                                  ...(post.comments || []),
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
                                      showReplyInput: false,
                                  },
                              ],
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

    // Reply functionality
    const toggleReplies = async (commentId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // If we're opening replies and haven't loaded them yet, fetch them
        if (!activeReplies[commentId]) {
            try {
                const responseData = await apiService.fetchCommentReplies(
                    commentId,
                    token
                );
                const replies = responseData.replies || [];

                setPosts(
                    posts.map((post) => ({
                        ...post,
                        comments:
                            post.comments?.map((comment) =>
                                comment._id === commentId
                                    ? { ...comment, replies }
                                    : comment
                            ) || [],
                    }))
                );
            } catch (err) {
                console.error("Error fetching replies:", err);
                setError("Failed to load replies");
            }
        }

        setActiveReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const toggleReplyInput = (commentId, replyId = null, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setPosts(
            posts.map((post) => ({
                ...post,
                comments:
                    post.comments?.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  showReplyInput: !comment.showReplyInput,
                              }
                            : comment
                    ) || [],
            }))
        );

        setReplyContent((prev) => ({
            ...prev,
            [commentId]: prev[commentId] || "",
        }));
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
                token
            );
            const createdReply = responseData.reply || responseData;

            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments:
                                  post.comments?.map((comment) =>
                                      comment._id === commentId
                                          ? {
                                                ...comment,
                                                replies: [
                                                    ...(comment.replies || []),
                                                    {
                                                        ...createdReply,
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
                                                    },
                                                ],
                                                showReplyInput: false,
                                            }
                                          : comment
                                  ) || [],
                          }
                        : post
                )
            );

            setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
            setSuccessMessage("Reply posted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error posting reply:", err);
            setError(err.message);
        } finally {
            setIsReplying((prev) => ({ ...prev, [commentId]: false }));
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
            // Optimistic UI update for reply likes
            setPosts(
                posts.map((post) => ({
                    ...post,
                    comments:
                        post.comments?.map((comment) =>
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
                                                                  (
                                                                      likeUserId
                                                                  ) =>
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
                }))
            );

            await apiService.likeReply(replyId, user._id, token);
        } catch (err) {
            console.error("Error liking reply:", err);
            setError(err.message);
            // Re-fetch the comment to get accurate like data
            const post = posts.find((p) =>
                p.comments?.some((c) => c._id === commentId)
            );
            if (post) await fetchComments(post._id);
        } finally {
            setIsLikingReply((prev) => ({ ...prev, [replyId]: false }));
        }
    };

    const handleDeleteReply = async (replyId, commentId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Find the reply to check ownership
        let replyOwner = "";
        let postId = "";

        for (const post of posts) {
            const comment = post.comments?.find((c) => c._id === commentId);
            if (comment) {
                const reply = comment.replies?.find((r) => r._id === replyId);
                if (reply) {
                    replyOwner = reply.userId?.username;
                    postId = post._id;
                    break;
                }
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

        if (!window.confirm("Are you sure you want to delete this reply?")) {
            return;
        }

        setIsDeletingReply((prev) => ({ ...prev, [replyId]: true }));

        try {
            // Optimistic UI update
            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments:
                                  post.comments?.map((comment) =>
                                      comment._id === commentId
                                          ? {
                                                ...comment,
                                                replies:
                                                    comment.replies?.filter(
                                                        (reply) =>
                                                            reply._id !==
                                                            replyId
                                                    ) || [],
                                            }
                                          : comment
                                  ) || [],
                          }
                        : post
                )
            );

            await apiService.deleteReply(replyId, token);
            setSuccessMessage("Reply deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error deleting reply:", err);
            setError(err.message);
            // Re-fetch the comment to get accurate data
            if (postId) await fetchComments(postId);
        } finally {
            setIsDeletingReply((prev) => ({ ...prev, [replyId]: false }));
        }
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

    const handleImagePreview = (image) => {
        setPreviewImage(image);
        setShowImagePreview(true);
    };

    const handleDarkModeChange = (newDarkMode) => {
        setDarkMode(newDarkMode);
        localStorageService.setDarkMode(newDarkMode);
    };

    return (
        <div
            className={`min-h-screen ${
                darkMode
                    ? "dark bg-gray-900 text-gray-100"
                    : "bg-[#fdfaf6] text-gray-900"
            }`}
        >
            {/* Floating Hearts Animation */}
            <FloatingHearts
                hearts={floatingHearts}
                setHearts={setFloatingHearts}
            />

            {/* Error Message */}
            {error && (
                <MessageBanner
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {/* Success Message */}
            {successMessage && (
                <MessageBanner
                    type="success"
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            {/* Image Preview Modal */}
            {showImagePreview && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setShowImagePreview(false)}
                />
            )}

            <Navbar onDarkModeChange={handleDarkModeChange} />

            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2">Loading posts...</p>
                    </div>
                ) : error ? (
                    <div
                        className={`text-center py-10 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-lg w-full max-w-2xl`}
                    >
                        <p className="text-lg text-red-500">
                            Error loading posts: {error}
                        </p>
                        <button
                            onClick={fetchPosts}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div
                        className={`text-center py-10 rounded-xl ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        } shadow-lg w-full max-w-2xl`}
                    >
                        <p className="text-lg">
                            No posts yet. Be the first to share something!
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            isDarkMode={darkMode}
                            username={username}
                            user={user}
                            currentUserProfile={currentUserProfile}
                            token={token}
                            activeCommentPostId={activeCommentPostId}
                            loadingComments={loadingComments}
                            commentContent={commentContent}
                            isCommenting={isCommenting}
                            isLiking={isLiking}
                            likeCooldown={likeCooldown}
                            isLikingComment={isLikingComment}
                            isDeletingComment={isDeletingComment}
                            activeReplies={activeReplies}
                            replyContent={replyContent}
                            isReplying={isReplying}
                            isLikingReply={isLikingReply}
                            isDeletingReply={isDeletingReply}
                            onLike={handleLike}
                            onToggleCommentDropdown={toggleCommentDropdown}
                            onCommentSubmit={handleCommentSubmit}
                            onSetCommentContent={setCommentContent}
                            onLikeComment={handleLikeComment}
                            onDeleteComment={handleDeleteComment}
                            onToggleReplies={toggleReplies}
                            onToggleReplyInput={toggleReplyInput}
                            onAddReply={handleAddReply}
                            onLikeReply={handleLikeReply}
                            onDeleteReply={handleDeleteReply}
                            onSetReplyContent={setReplyContent}
                            navigateToUserProfile={navigateToUserProfile}
                            onImagePreview={handleImagePreview}
                        />
                    ))
                )}
            </section>
        </div>
    );
};

export default MainFeed;
