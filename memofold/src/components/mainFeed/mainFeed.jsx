import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/navbar";
import PostCard from "./PostCard";
import FloatingHearts from "./FloatingHearts";
import ImagePreviewModal from "./ImagePreviewModal";
import MessageBanner from "./MessageBanner";
import MainFeedSkeleton from "./MainFeedSkeleton"; // ✅ Added skeleton import
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
  const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // Floating hearts state
    const [floatingHearts, setFloatingHearts] = useState([]);

    // Image preview states
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    // Reply functionality states - FIXED: Use localStorageService methods
    const [activeReplies, setActiveReplies] = useState(() => {
        return localStorageService.getActiveReplies() || {};
    });
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
    const loadMorePosts = useCallback(async () => {
        if (!hasMore || isLoadingMore || !nextCursor) return;

        setIsLoadingMore(true);
        setError(null);

        try {
            // ✅ CURSOR PARAMETER - Pass cursor to API call
            const data = await apiService.fetchPosts(token, nextCursor);
            const newPosts = Array.isArray(data) ? data : data.posts || [];
            
            // ✅ UPDATE CURSOR - Get next cursor from response
            const cursor = data.nextCursor || null;
            setNextCursor(cursor);
            setHasMore(!!cursor);

            if (newPosts.length === 0) {
                setHasMore(false);
                setIsLoadingMore(false);
                return;
            }

            // Get stored data from localStorage
            const storedLikes = localStorageService.getStoredLikes();
            const storedLikesPreview = localStorageService.getStoredLikesPreview();
            const storedLikesCount = localStorageService.getStoredLikesCount();

            const postsWithLikes = newPosts.map((post) => {
                const postLikes = post.likes || storedLikes[post._id] || [];
                const postLikesPreview = post.likesPreview || storedLikesPreview[post._id] || [];
                const postLikesCount = post.likesCount || storedLikesCount[post._id] || postLikes.length;

                const hasUserLiked = postLikes.includes(user._id) ||
                    postLikes.includes(username) ||
                    (postLikesPreview && postLikesPreview.some((like) => like.username === username));

                const processedComments = [];

                return {
                    ...post,
                    likes: postLikes,
                    likesPreview: postLikesPreview,
                    likesCount: postLikesCount,
                    hasUserLiked: hasUserLiked,
                    createdAt: post.createdAt || new Date().toISOString(),
                    comments: processedComments,
                    commentCount: post.commentCount || 0,
                };
            });

            // ✅ APPEND NEW POSTS - Add new posts to existing ones
            setPosts(prevPosts => [...prevPosts, ...postsWithLikes]);

            // Update localStorage with new posts data
            const likesByPost = {};
            const likesPreviewByPost = {};
            const likesCountByPost = {};

            newPosts.forEach((post) => {
                likesByPost[post._id] = post.likes || storedLikes[post._id] || [];
                likesPreviewByPost[post._id] = post.likesPreview || storedLikesPreview[post._id] || [];
                likesCountByPost[post._id] = post.likesCount || storedLikesCount[post._id] || likesByPost[post._id].length;
            });

            localStorageService.updateStoredLikes(likesByPost);
            localStorageService.updateStoredLikesPreview(likesPreviewByPost);
            localStorageService.updateStoredLikesCount(likesCountByPost);

        } catch (err) {
            setError("Failed to load more posts: " + err.message);
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextCursor, hasMore, isLoadingMore, token, user._id, username]);
 // ✅ FIXED SCROLL EVENT LISTENER - Updated to properly detect scroll position
useEffect(() => {
    const handleScroll = () => {
        // Don't trigger if already loading or no more posts
        if (isLoadingMore || !hasMore || !nextCursor) return;
        
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // ✅ FIXED: Check if user has scrolled near the bottom (100px from bottom)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMorePosts();
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, [isLoadingMore, hasMore, nextCursor, loadMorePosts]);
 // ✅ Added loadMorePosts to dependencies
    // Load activeReplies from localStorage on component mount - FIXED
    useEffect(() => {
        const storedActiveReplies = localStorageService.getActiveReplies();
        if (storedActiveReplies && Object.keys(storedActiveReplies).length > 0) {
            setActiveReplies(storedActiveReplies);
        }
    }, []);

    // Save activeReplies to localStorage whenever it changes - FIXED
    useEffect(() => {
        localStorageService.setActiveReplies(activeReplies);
    }, [activeReplies]);

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
            
            // ✅ CURSOR EXTRACTION - Get cursor from response if available
            const cursor = data.nextCursor || null;
            setNextCursor(cursor);
            setHasMore(!!cursor); // Set hasMore based on whether there's a next cursor

            // Get stored data from localStorage
            const storedLikes = localStorageService.getStoredLikes();
            const storedLikesPreview = localStorageService.getStoredLikesPreview();
            const storedLikesCount = localStorageService.getStoredLikesCount();

            const postsWithLikes = postsData.map((post) => {
                // Get data from storage or API - prioritize API data
                const postLikes = post.likes || storedLikes[post._id] || [];
                const postLikesPreview = post.likesPreview || storedLikesPreview[post._id] || [];
                const postLikesCount = post.likesCount || storedLikesCount[post._id] || postLikes.length;

                // Check if current user has liked this post
                const hasUserLiked = postLikes.includes(user._id) ||
                    postLikes.includes(username) ||
                    (postLikesPreview && postLikesPreview.some((like) => like.username === username));

                // Initialize empty comments array since API doesn't send comments data
                const processedComments = [];

                return {
                    ...post,
                    likes: postLikes,
                    likesPreview: postLikesPreview,
                    likesCount: postLikesCount,
                    hasUserLiked: hasUserLiked,
                    createdAt: post.createdAt || new Date().toISOString(),
                    comments: processedComments,
                    commentCount: post.commentCount || 0,
                };
            });

            setPosts(postsWithLikes);

            // Update localStorage with current data using localStorageService methods
            const likesByPost = {};
            const likesPreviewByPost = {};
            const likesCountByPost = {};

            postsData.forEach((post) => {
                likesByPost[post._id] = post.likes || storedLikes[post._id] || [];
                likesPreviewByPost[post._id] = post.likesPreview || storedLikesPreview[post._id] || [];
                likesCountByPost[post._id] = post.likesCount || storedLikesCount[post._id] || likesByPost[post._id].length;
            });

            localStorageService.updateStoredLikes(likesByPost);
            localStorageService.updateStoredLikesPreview(likesPreviewByPost);
            localStorageService.updateStoredLikesCount(likesCountByPost);

        } catch (err) {
            setError(err.message);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ LOAD MORE POSTS - New function to load additional posts with cursor

    const fetchComments = async (postId) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));

        try {
            const responseData = await apiService.fetchComments(postId, token);
            const comments = responseData.comments || [];

            // Get stored comment likes from localStorage
            const storedCommentLikes = localStorageService.getStoredCommentLikes();

            const commentsWithLikes = comments.map((comment) => {
                // Get likes from storage or API
                const commentLikes = storedCommentLikes[comment._id] || comment.likes || [];

                // Check if current user has liked this comment
                const hasUserLiked = commentLikes.includes(user._id);

                // FIXED: Handle both userId and user object from API
                const userData = comment.userId || comment.user || {
                    _id: 'unknown',
                    username: 'Unknown',
                    realname: 'Unknown User',
                    profilePic: ''
                };

                // FIXED: Ensure username is properly set
                const finalUserData = {
                    _id: userData._id || 'unknown',
                    username: userData.username || 'Unknown',
                    realname: userData.realname || userData.username || 'Unknown User',
                    profilePic: userData.profilePic || ''
                };

                const replyCount = comment.replyCount || 0;
                const replies = [];

                return {
                    ...comment,
                    likes: commentLikes,
                    hasUserLiked: hasUserLiked,
                    userId: finalUserData,
                    replies: replies,
                    replyCount: replyCount,
                    showReplyInput: false,
                };
            });

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: commentsWithLikes,
                              commentCount: commentsWithLikes.length,
                          }
                        : post
                )
            );

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
                                        updatedLikes = comment.likes.filter(
                                            (likeUserId) => likeUserId !== user._id
                                        );
                                    } else {
                                        updatedLikes = [...(comment.likes || []), user._id];
                                    }

                                    localStorageService.updateStoredCommentLikes(commentId, updatedLikes);

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

        if (!window.confirm("Are you sure you want to delete this comment and all its replies?")) {
            return;
        }

        setIsDeletingComment((prev) => ({ ...prev, [commentId]: true }));

        const originalPosts = [...posts];

        try {
            // FIXED: Also delete all replies associated with this comment
            const replyIds = comment.replies?.map(reply => reply._id) || [];

            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.filter((comment) => comment._id !== commentId) || [];
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
            const storedCommentLikes = localStorageService.getStoredCommentLikes();
            delete storedCommentLikes[commentId];
            
            // Also remove likes for all replies of this comment
            replyIds.forEach(replyId => {
                delete storedCommentLikes[replyId];
            });
            
            localStorage.setItem("commentLikes", JSON.stringify(storedCommentLikes));

            await apiService.deleteComment(commentId, postId, token);

            setSuccessMessage("Comment and all its replies deleted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
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
            const currentPost = posts.find((post) => post._id === postId);
            const isCurrentlyLiked = currentPost?.hasUserLiked;

            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        const newLikeCount = isCurrentlyLiked
                            ? Math.max(0, (post.likeCount || 0) - 1)
                            : (post.likeCount || 0) + 1;

                        let newLikesPreview = [...(post.likesPreview || [])];

                        if (isCurrentlyLiked) {
                            newLikesPreview = newLikesPreview.filter((like) => like.username !== username);
                        } else {
                            newLikesPreview.unshift({
                                username: username,
                                realname: realname,
                                profilePic: currentUserProfile?.profilePic || user?.profilePic,
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

            const response = await apiService.likePost(postId, user._id, token);

            if (response.success) {
                const actualLikeCount = response.likes ? response.likes.length : isCurrentlyLiked
                    ? (currentPost.likeCount || 1) - 1
                    : (currentPost.likeCount || 0) + 1;

                let updatedLikesPreview = [...(currentPost.likesPreview || [])];

                if (isCurrentlyLiked) {
                    updatedLikesPreview = updatedLikesPreview.filter((like) => like.username !== username);
                } else {
                    updatedLikesPreview.unshift({
                        username: username,
                        realname: realname,
                        profilePic: currentUserProfile?.profilePic || user?.profilePic,
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
                throw new Error(response.message || "Like operation failed");
            }

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
                        height: 0
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
        } catch (err) {
            setError(err.message);

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
            const responseData = await apiService.addComment(postId, content, token);
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
                                          _id: currentUserProfile?._id || user?._id || username,
                                          username: username,
                                          realname: currentUserProfile?.realname || realname || username,
                                          profilePic: currentUserProfile?.profilePic || user?.profilePic,
                                      },
                                      replies: [],
                                      replyCount: 0,
                                      showReplyInput: false,
                                  },
                              ],
                              commentCount: (post.commentCount || 0) + 1,
                          }
                        : post
                )
            );

            setCommentContent((prev) => ({ ...prev, [postId]: "" }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCommenting((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const toggleReplies = async (commentId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let postId = null;
        for (const post of posts) {
            if (post.comments?.some(comment => comment._id === commentId)) {
                postId = post._id;
                break;
            }
        }

        if (!postId) {
            setError("Post not found for this comment");
            return;
        }

        const newActiveRepliesState = {
            ...activeReplies,
            [commentId]: !activeReplies[commentId]
        };

        if (!activeReplies[commentId]) {
            try {
                const responseData = await apiService.fetchCommentReplies(commentId, token);
                const replies = responseData.replies || [];

                setPosts(prevPosts =>
                    prevPosts.map(post => ({
                        ...post,
                        comments: post.comments?.map(comment =>
                            comment._id === commentId
                                ? {
                                      ...comment,
                                      replies: replies.map(reply => {
                                          const replyUserData = reply.userId || reply.user || {
                                              _id: 'unknown',
                                              username: 'Unknown',
                                              realname: 'Unknown User',
                                              profilePic: ''
                                          };

                                          const finalReplyUserData = {
                                              _id: replyUserData._id || 'unknown',
                                              username: replyUserData.username || 'Unknown',
                                              realname: replyUserData.realname || replyUserData.username || 'Unknown User',
                                              profilePic: replyUserData.profilePic || ''
                                          };

                                          return {
                                              ...reply,
                                              likes: reply.likes || [],
                                              hasUserLiked: (reply.likes || []).includes(user._id),
                                              userId: finalReplyUserData,
                                          };
                                      }),
                                      replyCount: replies.length
                                  }
                                : comment
                        ) || [],
                    }))
                );
            } catch (err) {
                setError("Failed to load replies");
                return;
            }
        }

        setActiveReplies(newActiveRepliesState);
    };

    const toggleReplyInput = (commentId, replyId = null, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setPosts(
            posts.map((post) => ({
                ...post,
                comments: post.comments?.map((comment) =>
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
            const responseData = await apiService.addCommentReply(commentId, content, postId, token);
            
            if (responseData.msg === "Invalid token") {
                throw new Error("Session expired. Please log in again.");
            }

            const createdReply = responseData.reply || responseData;

            setPosts(prevPosts => 
                prevPosts.map(post => {
                    if (post._id === postId) {
                        const updatedComments = post.comments?.map(comment => {
                            if (comment._id === commentId) {
                                const newReply = {
                                    ...createdReply,
                                    _id: createdReply._id || `temp-${Date.now()}`,
                                    content: content,
                                    userId: {
                                        _id: user._id,
                                        username: username,
                                        realname: realname,
                                        profilePic: currentUserProfile?.profilePic || user?.profilePic,
                                    },
                                    likes: [],
                                    hasUserLiked: false,
                                    createdAt: createdReply.createdAt || new Date().toISOString(),
                                };

                                const updatedReplies = [...(comment.replies || []), newReply];

                                return {
                                    ...comment,
                                    replies: updatedReplies,
                                    replyCount: updatedReplies.length,
                                    showReplyInput: false,
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
                })
            );

            setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
            setSuccessMessage("Reply posted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            if (err.message.includes("token") || err.message.includes("auth")) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.message);
            }
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
            setPosts(
                posts.map((post) => ({
                    ...post,
                    comments: post.comments?.map((comment) =>
                        comment._id === commentId
                            ? {
                                  ...comment,
                                  replies: comment.replies?.map((reply) =>
                                      reply._id === replyId
                                          ? {
                                                ...reply,
                                                likes: reply.hasUserLiked
                                                    ? reply.likes.filter((likeUserId) => likeUserId !== user._id)
                                                    : [...(reply.likes || []), user._id],
                                                hasUserLiked: !reply.hasUserLiked,
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
            setError(err.message);
            const post = posts.find((p) => p.comments?.some((c) => c._id === commentId));
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

        console.log("🚀 DELETE REPLY - ReplyId:", replyId, "CommentId:", commentId);

        // Find reply owner and post ID
        let replyOwner = "";
        let foundPostId = "";

        for (const post of posts) {
            for (const comment of post.comments || []) {
                const reply = comment.replies?.find((r) => r._id === replyId);
                if (reply && comment._id === commentId) {
                    replyOwner = reply.userId?.username;
                    foundPostId = post._id;
                    break;
                }
            }
            if (foundPostId) break;
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

        const originalPosts = [...posts];

        try {
            // Optimistic UI update
            setPosts(
                posts.map((post) =>
                    post._id === foundPostId
                        ? {
                              ...post,
                              comments: post.comments?.map((comment) =>
                                  comment._id === commentId
                                      ? {
                                            ...comment,
                                            replies: comment.replies?.filter((reply) => reply._id !== replyId) || [],
                                            replyCount: Math.max(0, (comment.replyCount || 1) - 1),
                                        }
                                      : comment
                              ) || [],
                          }
                        : post
                )
            );

            console.log("📞 Calling deleteReply API with replyId:", replyId);
            const result = await apiService.deleteReply(replyId, token);
            console.log("📩 API Response:", result);

            if (result.success) {
                setSuccessMessage("Reply deleted successfully!");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                throw new Error(result.message || "Failed to delete reply");
            }
        } catch (err) {
            console.error("❌ Delete reply error:", err);
            setError(err.message || "Failed to delete reply");
            setPosts(originalPosts);
        } finally {
            setIsDeletingReply((prev) => ({ ...prev, [replyId]: false }));
        }
    };

    // FIXED: Updated navigateToUserProfile function to handle current user properly
    const navigateToUserProfile = (userId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (userId) {
            // Check if this is the current logged-in user's profile
            const isCurrentUser = 
                (currentUserProfile && userId === currentUserProfile._id) || // Compare with current user profile ID
                (user && userId === user._id) || // Compare with auth user ID
                (username && userId === username); // Compare with username
                if (isCurrentUser) {
                // Navigate to current user's own profile page
                navigate("/profile");
            } else {
                // Navigate to other user's profile page
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

    // ✅ Skeleton Loading Condition
    if (isLoading) {
        return <MainFeedSkeleton isDarkMode={darkMode} />;
    }

    return (
        <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6] text-gray-900"}`}>
            <FloatingHearts hearts={floatingHearts} setHearts={setFloatingHearts} />

            {error && (
                <MessageBanner
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            {successMessage && (
                <MessageBanner
                    type="success"
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            {showImagePreview && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setShowImagePreview(false)}
                />
            )}

            <Navbar onDarkModeChange={handleDarkModeChange} />

            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {error ? (
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
                        <p className="text-lg text-red-500">Error loading posts: {error}</p>
                        <button
                            onClick={fetchPosts}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className={`text-center py-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
                        <p className="text-lg">No posts yet. Be the first to share something!</p>
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
                {isLoadingMore && (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="ml-2">Loading more posts...</span>
                            </div>
                        )}
                        
                        {/* ✅ END OF FEED MESSAGE - Show when no more posts */}
                        {!hasMore && posts.length > 0 && (
                            <div className="text-center py-4 text-gray-500">
                                You've reached the end of the feed
                            </div>
                        )}
                    
            </section>
        </div>
    );
};

export default MainFeed;