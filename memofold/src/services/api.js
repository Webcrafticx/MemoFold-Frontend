import config from "../hooks/config";

export const apiService = {
  // User endpoints
  fetchCurrentUser: async (token) => {
    const response = await fetch(`${config.apiUrl}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Profile-specific endpoints add karein
  fetchUserPosts: async (token, username) => {
    const response = await fetch(`${config.apiUrl}/posts/user/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateUserProfile: async (token, data) => {
    const response = await fetch(`${config.apiUrl}/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  uploadProfilePic: async (token, formData) => {
    const response = await fetch(`${config.apiUrl}/user/upload-profile-pic`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  createPost: async (token, postData) => {
    const response = await fetch(`${config.apiUrl}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  updatePost: async (token, postId, postData) => {
    const response = await fetch(`${config.apiUrl}/posts/update/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  deletePost: async (token, postId) => {
    const response = await fetch(`${config.apiUrl}/posts/delete/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Existing endpoints same rahenge
  fetchPosts: async (token) => {
    const response = await fetch(`${config.apiUrl}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  fetchPostLikes: async (postId, token) => {
    const response = await fetch(`${config.apiUrl}/posts/${postId}/likes`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  fetchComments: async (postId, token) => {
    const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  likePost: async (postId, userId, token) => {
    const response = await fetch(`${config.apiUrl}/posts/like/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  likeComment: async (commentId, userId, token) => {
    const response = await fetch(
      `${config.apiUrl}/posts/comments/${commentId}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      }
    );
    return response.json();
  },

  addComment: async (postId, content, token) => {
    const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, content }),
    });
    return response.json();
  },

  deleteComment: async (commentId, postId, token) => {
    const response = await fetch(
      `${config.apiUrl}/posts/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      }
    );
    return response.json();
  },

  // Comment reply endpoints
  addCommentReply: async (commentId, content, token) => {
    const response = await fetch(`${config.apiUrl}/posts/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  fetchCommentReplies: async (commentId, token) => {
    const response = await fetch(`${config.apiUrl}/posts/replies/${commentId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  likeReply: async (replyId, userId, token) => {
    const response = await fetch(
      `${config.apiUrl}/posts/replies/${replyId}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      }
    );
    return response.json();
  },

  deleteReply: async (replyId, token) => {
    const response = await fetch(
      `${config.apiUrl}/posts/replies/${replyId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },
};