import { useState } from 'react';
import { likePostAPI, likeCommentAPI } from '../services/api';

export const useLikes = () => {
  const [isLiking, setIsLiking] = useState({});
  const [likeCooldown, setLikeCooldown] = useState({});
  const [floatingHearts, setFloatingHearts] = useState([]);

  const handleLike = async (postId, userId, token) => {
    if (likeCooldown[postId]) return;

    setLikeCooldown(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => setLikeCooldown(prev => ({ ...prev, [postId]: false })), 500);

    setIsLiking(prev => ({ ...prev, [postId]: true }));

    try {
      await likePostAPI(postId, userId, token);
    } catch (err) {
      throw err;
    } finally {
      setIsLiking(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeComment = async (commentId, userId, token) => {
    setIsLiking(prev => ({ ...prev, [commentId]: true }));

    try {
      await likeCommentAPI(commentId, userId, token);
    } catch (err) {
      throw err;
    } finally {
      setIsLiking(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const addFloatingHeart = (x, y) => {
    setFloatingHearts(hearts => [
      ...hearts,
      { id: Date.now(), x, y }
    ]);
  };

  return {
    isLiking,
    likeCooldown,
    floatingHearts,
    setFloatingHearts,
    handleLike,
    handleLikeComment,
    addFloatingHeart
  };
};