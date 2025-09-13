// src/components/mainFeed/MainFeed.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
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

      // Get stored likes from localStorage
      const storedLikes = localStorageService.getStoredLikes();

      const postsWithLikes = postsData.map((post) => {
        // Get likes from storage or API
        const postLikes = storedLikes[post._id] || post.likes || [];

        // Check if current user has liked this post (handles both user ID and username)
        const hasUserLiked =
          postLikes.includes(user._id) ||
          postLikes.includes(username) ||
          post.likes?.some((like) => like.userId === username);

        return {
          ...post,
          likes: postLikes,
          hasUserLiked: hasUserLiked,
          createdAt: post.createdAt || new Date().toISOString(),
          comments: post.comments || [],
        };
      });

      setPosts(postsWithLikes);

      // Update localStorage with current likes
      const likesByPost = {};
      postsData.forEach((post) => {
        const storedPostLikes = storedLikes[post._id] || post.likes || [];
        likesByPost[post._id] = storedPostLikes;
      });

      localStorage.setItem("postLikes", JSON.stringify(likesByPost));
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
      const storedCommentLikes = localStorageService.getStoredCommentLikes();

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

      localStorage.setItem("commentLikes", JSON.stringify(likesByComment));
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
            const updatedComments = post.comments?.map((comment) => {
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
                  updatedLikes = [...(comment.likes || []), user._id];
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
            });

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
              post.comments?.filter((comment) => comment._id !== commentId) ||
              [];
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
      localStorage.setItem("commentLikes", JSON.stringify(storedCommentLikes));

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

    // Set a timeout to reset the cooldown after 500ms
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
      // Store the current state to check if we're adding a like (not removing)
      const currentPost = posts.find((post) => post._id === postId);
      const isAddingLike = !currentPost?.hasUserLiked;

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
              updatedLikes = [...post.likes, user._id]; // Store user ID
            }

            // Update localStorage with both formats
            localStorageService.updateStoredLikes(postId, updatedLikes);

            return {
              ...post,
              likes: updatedLikes,
              hasUserLiked: !isLiked,
            };
          }
          return post;
        })
      );

      // Add floating hearts animation ONLY when adding a like (not removing)
      if (isAddingLike && e) {
        const rect = e.target.getBoundingClientRect();

        // Add just one heart instead of multiple
        setFloatingHearts((hearts) => [
          ...hearts,
          {
            id: Date.now(),
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          },
        ]);
      }

      await apiService.likePost(postId, user._id, token);
    } catch (err) {
      console.error("Error liking post:", err);
      setError(err.message);

      // Revert optimistic update on error
      await fetchPosts();
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
                      _id: currentUserProfile?._id || user?._id || username,
                      username: username,
                      realname:
                        currentUserProfile?.realname || realname || username,
                      profilePic:
                        currentUserProfile?.profilePic || user?.profilePic,
                    },
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
      <FloatingHearts hearts={floatingHearts} setHearts={setFloatingHearts} />

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
            <p className="text-lg text-red-500">Error loading posts: {error}</p>
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
              activeCommentPostId={activeCommentPostId}
              loadingComments={loadingComments}
              commentContent={commentContent}
              isCommenting={isCommenting}
              isLiking={isLiking}
              likeCooldown={likeCooldown}
              isLikingComment={isLikingComment}
              isDeletingComment={isDeletingComment}
              onLike={handleLike}
              onToggleCommentDropdown={toggleCommentDropdown}
              onCommentSubmit={handleCommentSubmit}
              onSetCommentContent={setCommentContent}
              onLikeComment={handleLikeComment}
              onDeleteComment={handleDeleteComment}
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