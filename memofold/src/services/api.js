import config from '../hooks/config';

export const fetchPosts = async (token) => {
  const response = await fetch(`${config.apiUrl}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch posts");
  
  const data = await response.json();
  return Array.isArray(data) ? data : data.posts || [];
};

export const fetchComments = async (postId, token) => {
  const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch comments");
  
  const responseData = await response.json();
  return responseData.comments || [];
};

export const likePostAPI = async (postId, userId, token) => {
  const response = await fetch(`${config.apiUrl}/posts/like/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to like post");
  }
};

export const likeCommentAPI = async (commentId, userId, token) => {
  const response = await fetch(`${config.apiUrl}/posts/comments/${commentId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to like comment");
  }
};

export const deleteCommentAPI = async (commentId, postId, token) => {
  const response = await fetch(`${config.apiUrl}/posts/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete comment");
  }
};

export const postCommentAPI = async (postId, content, token) => {
  const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId, content }),
  });

  if (!response.ok) throw new Error("Failed to post comment");
  
  const responseData = await response.json();
  return responseData.comment || responseData;
};

export const fetchCurrentUserProfile = async (token) => {
  const response = await fetch(`${config.apiUrl}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch user profile");
  
  return await response.json();
};