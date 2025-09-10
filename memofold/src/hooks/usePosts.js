import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getStoredLikes, updateStoredLikes } from '../utils/localStorageHelpers';
import { fetchPosts as fetchPostsAPI } from '../services/api';

export const usePosts = () => {
  const { token, user, username } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const postsData = await fetchPostsAPI(token);
      const storedLikes = getStoredLikes();

      const postsWithLikes = postsData.map((post) => {
        const postLikes = storedLikes[post._id] || post.likes || [];
        const hasUserLiked = postLikes.includes(user._id) || 
                           postLikes.includes(username) || 
                           post.likes?.some(like => like.userId === username);

        return {
          ...post,
          likes: postLikes,
          hasUserLiked,
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
      setError(err.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePostLikes = (postId, updatedLikes, hasUserLiked) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { ...post, likes: updatedLikes, hasUserLiked }
          : post
      )
    );
    updateStoredLikes(postId, updatedLikes);
  };

  return { posts, isLoading, error, fetchPosts, updatePostLikes, setPosts };
};