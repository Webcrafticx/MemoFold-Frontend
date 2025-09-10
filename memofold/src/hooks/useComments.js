import { useState } from 'react';
import { useAuth } from './useAuth';
import { getStoredCommentLikes, updateStoredCommentLikes } from '../utils/localStorageHelpers';
import { fetchComments as fetchCommentsAPI } from '../services/api';

export const useComments = () => {
  const { token, user } = useAuth();
  const [loadingComments, setLoadingComments] = useState({});
  const [isCommenting, setIsCommenting] = useState({});
  const [isLikingComment, setIsLikingComment] = useState({});
  const [isDeletingComment, setIsDeletingComment] = useState({});

  const fetchComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));

    try {
      const comments = await fetchCommentsAPI(postId, token);
      const storedCommentLikes = getStoredCommentLikes();

      const commentsWithLikes = comments.map(comment => {
        const commentLikes = storedCommentLikes[comment._id] || comment.likes || [];
        const hasUserLiked = commentLikes.includes(user._id);

        return { ...comment, likes: commentLikes, hasUserLiked };
      });

      // Update localStorage with current comment likes
      const likesByComment = {};
      comments.forEach((comment) => {
        likesByComment[comment._id] = storedCommentLikes[comment._id] || comment.likes || [];
      });
      localStorage.setItem("commentLikes", JSON.stringify(likesByComment));

      return commentsWithLikes;
    } catch (err) {
      throw err;
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  return {
    loadingComments,
    isCommenting,
    isLikingComment,
    isDeletingComment,
    setIsCommenting,
    setIsLikingComment,
    setIsDeletingComment,
    fetchComments
  };
};