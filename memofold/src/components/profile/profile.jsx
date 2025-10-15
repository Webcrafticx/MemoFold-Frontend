import React, { useState, useEffect, useRef } from "react";
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

// Components
import ErrorBoundary from "./ErrorBoundary";
import Navbar from "../navbar/navbar";
import ProfileHeader from "./ProfileHeader";
import CreatePostSection from "./CreatePostSection";
import ProfilePostCard from "./ProfilePostCard";
import FloatingHearts from "../mainFeed/FloatingHearts";
import ImagePreviewModal from "../mainFeed/ImagePreviewModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import LikesModal from "../mainFeed/LikesModal";
import ProfileSkeleton from "./ProfileSkeleton";
import FriendsSidebar from "../navbar/FriendsSidebar";

// Services
import { apiService } from "../../services/api";
import { localStorageService } from "../../services/localStorage";
import {
    formatDate,
    getIndianDateString,
    getCurrentUTCTime,
    convertUTCToIST,
} from "../../services/dateUtils";

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
        profilePic: "https://ui-avatars.com/api/?name=User&background=random",
        username: "",
        realName: "",
        email: "",
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
        existingImage: null,
        isUpdatingPost: false,
        isDeletingPost: false,
    });

    // Confirmation modal state
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        postId: null,
        isLoading: false,
        postContent: "",
    });

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
                fetchUserPosts(token),
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

            // Set profile data from API response only
            setProfileData((prev) => ({
                ...prev,
                profilePic:
                    userData.profilePic ||
                    "https://ui-avatars.com/api/?name=User&background=random",
                username: userData.username || "",
                realName: userData.realname || "",
                email: userData.email || "",
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

            // Update profile data from API
            setProfileData((prev) => ({
                ...prev,
                profilePic:
                    userData.profilePic ||
                    "https://ui-avatars.com/api/?name=User&background=random",
                username: userData.username || "",
                realName: userData.realname || "",
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

    const fetchUserPosts = async (token) => {
        try {
            const username = localStorage.getItem("username");
            const responseData = await apiService.fetchUserPosts(
                token,
                username
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
                    createdAt: createdAtIST, // ✅ Display ke liye IST
                    date: dateIST, // ✅ Display ke liye IST
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

            setProfileData((prev) => ({ ...prev, posts: postsWithComments }));
        } catch (error) {
            console.error("Error fetching posts:", error);
            const errorMessage = handleApiError(error, "Failed to load posts");
            throw new Error(errorMessage);
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

            if (!responseData || responseData.success === false) {
                throw new Error(
                    responseData?.message || "Failed to load comments"
                );
            }

            const comments = (responseData.comments || []).map((comment) => ({
                ...comment,
                replies: comment.replies || [],
                showReplies: false,
                replyCount: comment.replyCount || comment.replies?.length || 0,
            }));

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments,
                          }
                        : post
                ),
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
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

            // Update comment count immediately
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              commentCount: (post.commentCount || 0) + 1,
                          }
                        : post
                ),
            }));

            // Refresh comments if comments section is open
            if (commentState.activeCommentPostId === postId) {
                await handleToggleCommentDropdown(postId);
            }

            setCommentState((prev) => ({
                ...prev,
                commentContent: { ...prev.commentContent, [postId]: "" },
            }));
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
            const response = await apiService.deleteComment(
                commentId,
                postId,
                token
            );

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(
                    response?.message || "Failed to delete comment"
                );
            }

            // Update comment count immediately
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
                          }
                        : post
                ),
            }));

            // Refresh comments if comments section is open
            if (commentState.activeCommentPostId === postId) {
                await handleToggleCommentDropdown(postId);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Unable to delete comment.");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isDeletingComment: false,
            }));
        }
    };

    // Reply handlers
    const handleToggleReplyInput = (commentId) => {
        setCommentState((prev) => ({
            ...prev,
            activeReplyInputs: {
                ...prev.activeReplyInputs,
                [commentId]: !prev.activeReplyInputs[commentId],
            },
            replyContent: {
                ...prev.replyContent,
                [commentId]: prev.replyContent[commentId] || "",
            },
        }));
    };

    const handleReplySubmit = async (postId, commentId) => {
        const key = commentId;
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
            const currentUsername = localStorage.getItem("username");
            const currentRealName = localStorage.getItem("realname");
            const currentProfilePic = localStorage.getItem("profilePic");
            const currentUserId = localStorage.getItem("userId");

            // Optimistically add the reply with Indian time
            // Optimistically add the reply with UTC time
            const optimisticReply = {
                _id: `temp-${Date.now()}`, // Temporary ID
                content: content,
                likes: [],
                hasUserLiked: false,
                createdAt: getCurrentUTCTime(), // ✅ UTC time use karen
                userId: {
                    _id: currentUserId,
                    username: currentUsername,
                    realname: currentRealName,
                    profilePic: currentProfilePic,
                },
                username: currentUsername,
                profilePic: currentProfilePic,
                user: {
                    username: currentUsername,
                },
            };

            // Optimistically update the UI
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
                                            replies: [
                                                ...(comment.replies || []),
                                                optimisticReply,
                                            ],
                                            replyCount:
                                                (comment.replyCount || 0) + 1,
                                            showReplies: true, // Automatically show replies
                                        }
                                      : comment
                              ),
                          }
                        : post
                ),
            }));

            // API call
            const response = await apiService.addCommentReply(
                commentId,
                content,
                postId,
                token
            );

            // ✅ Check if API call was successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to add reply");
            }

            // If API returns the created reply, update with real data
            if (response.comment) {
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
                                                replies: comment.replies.map(
                                                    (reply) =>
                                                        reply._id ===
                                                        optimisticReply._id
                                                            ? {
                                                                  ...response.comment,
                                                                  userId: response
                                                                      .comment
                                                                      .userId || {
                                                                      _id: currentUserId,
                                                                      username:
                                                                          currentUsername,
                                                                      realname:
                                                                          currentRealName,
                                                                      profilePic:
                                                                          currentProfilePic,
                                                                  },
                                                                  username:
                                                                      response
                                                                          .comment
                                                                          .username ||
                                                                      currentUsername,
                                                                  profilePic:
                                                                      response
                                                                          .comment
                                                                          .profilePic ||
                                                                      currentProfilePic,
                                                                  hasUserLiked: false,
                                                                  likes:
                                                                      response
                                                                          .comment
                                                                          .likes ||
                                                                      [],
                                                              }
                                                            : reply
                                                ),
                                            }
                                          : comment
                                  ),
                              }
                            : post
                    ),
                }));
            }

            setCommentState((prev) => ({
                ...prev,
                replyContent: { ...prev.replyContent, [key]: "" },
                activeReplyInputs: { ...prev.activeReplyInputs, [key]: false },
            }));
        } catch (error) {
            console.error("Error adding reply:", error);

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
                                            replies: comment.replies.filter(
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
  // Find the current comment state
  const post = profileData.posts.find((p) => p._id === postId);
  const comment = post?.comments.find((c) => c._id === commentId);
  
  const isRepliesVisible = comment?.showReplies;

  // If replies are NOT visible (chevron UP), fetch replies immediately
  if (!isRepliesVisible) {
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

      if (!response || response.success === false) {
        throw new Error(
          response?.message || "Failed to load replies"
        );
      }

      // CORRECT MAPPING - Use profilepic (small p) from API
      const replies = (response.replies || []).map((reply) => {
        // Profile picture API se aa raha hai reply.user.profilepic mein
        const profilePic = reply.user?.profilepic || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.username || "Unknown")}&background=random`;

        const username = reply.user?.username || "unknown";
        const realname = reply.user?.realname || username;

        return {
          ...reply,
          // Proper user data structure with profilePic
          userId: {
            _id: reply.user?._id || "unknown",
            username: username,
            realname: realname,
            profilePic: profilePic 
          },
          username: username,
          profilePic: profilePic, 
          hasUserLiked: reply.likes && reply.likes.includes(localStorage.getItem("userId")),
          likes: reply.likes || [],
        };
      });

      console.log("✅ Processed replies:", replies.map(r => ({
        username: r.username,
        profilePic: r.profilePic,
        userIdProfilePic: r.userId.profilePic
      })));

      
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
                        replies,
                        replyCount: replies.length,
                        showReplies: true, 
                      }
                    : comment
                ),
              }
            : post
        ),
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
        } catch (error) {
            console.error("Error deleting reply:", error);
            toast.error("Unable to delete reply.");
        } finally {
            setCommentState((prev) => ({
                ...prev,
                isDeletingReply: { ...prev.isDeletingReply, [replyId]: false },
            }));
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
            formData.append("image", file);

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
                setProfileData((prev) => ({ ...prev, profilePic: imageUrl }));
                toast.success("Profile picture updated successfully!");
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

    const handleCreatePost = async (content, file, selectedDate) => {
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

            // ✅ USE UTC TIMESTAMP DIRECTLY (no timezone manipulation)
            const postData = {
                content,
                createdAt: selectedDate, // This is already UTC from getSelectedDateUTC
                date: selectedDate, // This is already UTC from getSelectedDateUTC
                image: imageData,
            };

            console.log("Creating post with UTC date:", postData.createdAt);

            const response = await apiService.createPost(token, postData);

            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to create post");
            }

            await fetchUserPosts(token);
        } catch (error) {
            console.error("Post error:", error);
            toast.error("Unable to create post.");
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

            // Optimistic update - SAME AS MAIN FEED
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              isLiked: !isCurrentlyLiked,
                              likeCount: isCurrentlyLiked
                                  ? Math.max(0, (post.likeCount || 0) - 1)
                                  : (post.likeCount || 0) + 1,
                          }
                        : post
                ),
            }));

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
            const response = await apiService.likePost(
                postId,
                currentUserId,
                token
            );

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to toggle like");
            }

            // Final update with server data if needed
            if (response.likes !== undefined) {
                setProfileData((prev) => ({
                    ...prev,
                    posts: prev.posts.map((post) =>
                        post._id === postId
                            ? {
                                  ...post,
                                  isLiked: !isCurrentlyLiked,
                                  likeCount: response.likes.length,
                              }
                            : post
                    ),
                }));
            }
        } catch (error) {
            console.error("Error toggling like:", error);

            // Revert optimistic update on error
            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              isLiked: currentPost.isLiked,
                              likeCount: currentPost.likeCount,
                          }
                        : post
                ),
            }));

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
                editFiles: [],
                existingImage: postToEdit.image || null,
            }));
        }
    };

    const handleUpdatePost = async (postId) => {
        if (
            !editState.editContent.trim() &&
            editState.editFiles.length === 0 &&
            !editState.existingImage
        ) {
            toast.error("Post content or image cannot be empty");
            return;
        }

        try {
            setEditState((prev) => ({ ...prev, isUpdatingPost: true }));
            const token = localStorage.getItem("token");

            let imageData = editState.existingImage;

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

            const response = await apiService.updatePost(
                token,
                postId,
                postData
            );

            // Check if API call was actually successful
            if (!response || response.success === false) {
                throw new Error(response?.message || "Failed to update post");
            }

            setProfileData((prev) => ({
                ...prev,
                posts: prev.posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              content: editState.editContent,
                              image: imageData,
                          }
                        : post
                ),
            }));

            setEditState((prev) => ({
                ...prev,
                editingPostId: null,
                editContent: "",
                editFiles: [],
                existingImage: null,
            }));
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error("Unable to update post.");
        } finally {
            setEditState((prev) => ({ ...prev, isUpdatingPost: false }));
        }
    };

    const handleCancelEdit = () => {
        setEditState({
            editingPostId: null,
            editContent: "",
            editFiles: [],
            existingImage: null,
            isUpdatingPost: false,
            isDeletingPost: false,
        });
    };

    const handleRemoveExistingImage = () => {
        setEditState((prev) => ({
            ...prev,
            existingImage: null,
        }));
    };

    // Delete post with confirmation modal
    const handleDeletePostClick = (postId) => {
        const postToDelete = profileData.posts.find(
            (post) => post._id === postId
        );
        const postContentPreview =
            "Are you sure you want to delete this post? This action cannot be undone.";

        setConfirmationModal({
            isOpen: true,
            postId: postId,
            isLoading: false,
            postContent: `Are you sure you want to delete this post? This action cannot be undone.`,
        });
    };

    const handleConfirmDelete = async () => {
        const { postId } = confirmationModal;

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

            const storedLikes = localStorageService.getStoredLikes();
            delete storedLikes[postId];
            localStorage.setItem("postLikes", JSON.stringify(storedLikes));

            toast.success("Post deleted successfully!");
            handleCloseConfirmationModal();
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Unable to delete post.");
            setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
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
    const handleCloseConfirmationModal = () => {
        setConfirmationModal({
            isOpen: false,
            postId: null,
            isLoading: false,
            postContent: "",
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

                {/* Confirmation Modal for Post Deletion */}
                <ConfirmationModal
                    isOpen={confirmationModal.isOpen}
                    onClose={handleCloseConfirmationModal}
                    onConfirm={handleConfirmDelete}
                    title="Delete Post"
                    message="Are you sure you want to delete this post? This action cannot be undone."
                    confirmText="Delete Post"
                    cancelText="Keep Post"
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
                        posts={profileData.posts}
                        stats={profileData.stats}
                        isDarkMode={uiState.darkMode}
                        joinedDate={formattedDate}
                        onProfilePicUpdate={handleProfilePicUpdate}
                        onBioUpdate={handleBioUpdate}
                        uploadingProfilePic={uploadingProfilePic}
                        apiService={apiService}
                        toast={toast}
                        onFriendsClick={handleFriendsClick}
                        onProfileUpdate={async (result) => {
                            setProfileData((prev) => ({
                                ...prev,
                                username: result.username || prev.username,
                                email: result.email || prev.email,
                                bio: result.description || prev.bio,
                            }));
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
                                        onDeletePost={handleDeletePostClick}
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
                                        // Existing image props
                                        existingImage={editState.existingImage}
                                        onRemoveExistingImage={
                                            handleRemoveExistingImage
                                        }
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
