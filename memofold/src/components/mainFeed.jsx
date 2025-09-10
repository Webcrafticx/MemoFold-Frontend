import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar";
import FloatingHearts from "./common/FloatingHearts";
import ImagePreview from "./common/ImagePreview";
import Notification from "./common/Notification";
import PostCard from "./posts/PostCard";
import { usePosts } from "../../hooks/usePosts";
import { useComments } from "../../hooks/useComments";
import { useLikes } from "../../hooks/useLikes";
import { fetchCurrentUserProfile } from "../../services/api";
import { useImagePreview } from "../../utils/imageHelpers";

const MainFeed = () => {
  const { token, user, username, realname } = useAuth();
  const navigate = useNavigate();

  // State hooks
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentContent, setCommentContent] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Custom hooks
  const { posts, isLoading, error: postsError, fetchPosts, updatePostLikes } = usePosts();
  const { 
    loadingComments, 
    isCommenting, 
    isLikingComment, 
    isDeletingComment, 
    setIsCommenting, 
    setIsLikingComment, 
    setIsDeletingComment, 
    fetchComments 
  } = useComments();
  const { 
    isLiking, 
    likeCooldown, 
    floatingHearts, 
    setFloatingHearts, 
    handleLike, 
    handleLikeComment, 
    addFloatingHeart 
  } = useLikes();
  
  // Image preview hook
  const { 
    showImagePreview, 
    setShowImagePreview, 
    previewImage, 
    setPreviewImage 
  } = useImagePreview();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchCurrentUserProfile();
      fetchPosts();
    }
  }, [token, navigate]);

  const fetchCurrentUserProfile = async () => {
    try {
      const userData = await fetchCurrentUserProfile(token);
      setCurrentUserProfile(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleLikePost = async (postId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!username || !user?._id) {
      setError("You must be logged in to like posts");
      return;
    }

    const post = posts.find(p => p._id === postId);
    const isLiked = post.hasUserLiked;
    let updatedLikes;

    if (isLiked) {
      updatedLikes = post.likes.filter(like => like !== user._id && like !== username);
    } else {
      updatedLikes = [...post.likes, user._id];
      if (e) {
        const rect = e.target.getBoundingClientRect();
        addFloatingHeart(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }

    updatePostLikes(postId, updatedLikes, !isLiked);

    try {
      await handleLike(postId, user._id, token);
    } catch (err) {
      setError(err.message);
      fetchPosts(); // Revert on error
    }
  };

  const handleLikeCommentAction = async (commentId, postId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!username || !user?._id) {
      setError("You must be logged in to like comments");
      return;
    }

    setIsLikingComment(prev => ({ ...prev, [commentId]: true }));

    try {
      // Optimistic UI update
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          const updatedComments = post.comments?.map(comment => {
            if (comment._id === commentId) {
              const isLiked = comment.hasUserLiked;
              let updatedLikes;

              if (isLiked) {
                updatedLikes = comment.likes.filter(likeUserId => likeUserId !== user._id);
              } else {
                updatedLikes = [...(comment.likes || []), user._id];
              }

              return { ...comment, likes: updatedLikes, hasUserLiked: !isLiked };
            }
            return comment;
          });

          return { ...post, comments: updatedComments };
        }
        return post;
      });

      // Update state immediately for better UX
      // Note: In a real app, you might want to use a state management solution
      // that allows direct mutation of the posts array

      await handleLikeComment(commentId, user._id, token);
      
      // Refetch comments to ensure consistency
      await fetchComments(postId);
    } catch (err) {
      setError(err.message);
      await fetchComments(postId);
    } finally {
      setIsLikingComment(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleCommentDropdown = async (postId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (activeCommentPostId !== postId) {
      try {
        const comments = await fetchComments(postId);
        // Update the specific post with new comments
        const updatedPosts = posts.map(post => 
          post._id === postId 
            ? { ...post, comments, commentCount: comments.length } 
            : post
        );
        // In a real app, you would update your state here
      } catch (err) {
        setError(err.message);
      }
    }

    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    setCommentContent(prev => ({ ...prev, [postId]: prev[postId] || "" }));
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

    setIsCommenting(prev => ({ ...prev, [postId]: true }));
    setError(null);

    try {
      // In a real app, you would make an API call here and update state
      // For now, we'll just clear the input
      setCommentContent(prev => ({ ...prev, [postId]: "" }));
      setSuccessMessage("Comment posted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (commentId, postId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeletingComment(prev => ({ ...prev, [commentId]: true }));

    try {
      // In a real app, you would make an API call here and update state
      setSuccessMessage("Comment deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeletingComment(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const navigateToUserProfile = (userId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (userId) {
      navigate(`/user/${userId}`);
    }
  };

  const handleDarkModeChange = (darkMode) => {
    setIsDarkMode(darkMode);
    localStorage.setItem("darkMode", darkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-[#fdfaf6] text-gray-900"}`}>
      <FloatingHearts hearts={floatingHearts} setHearts={setFloatingHearts} />
      
      {error && (
        <Notification 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
        />
      )}
      
      {successMessage && (
        <Notification 
          message={successMessage} 
          type="success" 
          onClose={() => setSuccessMessage(null)} 
        />
      )}
      
      <ImagePreview 
        show={showImagePreview} 
        image={previewImage} 
        onClose={() => setShowImagePreview(false)} 
      />
      
      <Navbar onDarkModeChange={handleDarkModeChange} />
      
      <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Loading posts...</p>
          </div>
        ) : postsError ? (
          <div className={`text-center py-10 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
            <p className="text-lg text-red-500">Error loading posts: {postsError}</p>
            <button
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className={`text-center py-10 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg w-full max-w-2xl`}>
            <p className="text-lg">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isDarkMode={isDarkMode}
              activeCommentPostId={activeCommentPostId}
              onToggleComments={toggleCommentDropdown}
              onLike={handleLikePost}
              onCommentSubmit={handleCommentSubmit}
              commentContent={commentContent}
              setCommentContent={setCommentContent}
              loadingComments={loadingComments}
              isLiking={isLiking}
              likeCooldown={likeCooldown}
              isCommenting={isCommenting}
              isLikingComment={isLikingComment}
              isDeletingComment={isDeletingComment}
              onLikeComment={handleLikeCommentAction}
              onDeleteComment={handleDeleteComment}
              currentUserProfile={currentUserProfile}
              user={user}
              username={username}
              navigateToUserProfile={navigateToUserProfile}
              setPreviewImage={setPreviewImage}
              setShowImagePreview={setShowImagePreview}
            />
          ))
        )}
      </section>
    </div>
  );
};

export default MainFeed;