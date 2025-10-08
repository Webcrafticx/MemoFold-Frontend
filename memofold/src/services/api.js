import config from "../hooks/config";

export const apiService = {
  // User endpoints
  fetchCurrentUser: async (token) => {
    const response = await fetch(`${config.apiUrl}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

getStreamToken: async (token) => {
  const res = await fetch(`${config.apiUrl}/chat/token`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
},
ensureUsersExist: async (token, users) => {
  const res = await fetch(`${config.apiUrl}/chat/ensureUsersExist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ users })
  });
  return res.json();
},
getUserById: async (userId, token) => {
  const res = await fetch(`${config.apiUrl}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
},


  // Profile-specific endpoints
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

  // Post endpoints
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

  // NORMAL COMMENT - parentComment null
  addComment: async (postId, content, token) => {
    const requestBody = {
      content
      // parentComment automatically null
    };

    console.log("Normal Comment API Request:", { postId, content });

    const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    return response.json();
  },

  
  addCommentReply: async (commentId, content, postId, token) => {
    const requestBody = {
      content,
      parentCommentId: commentId
    };

    console.log("Reply API Request:", { 
      commentId, 
      content, 
      postId,
      requestBody 
    });

    const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
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

  // Reply endpoints
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
      `${config.apiUrl}/posts/comments/${replyId}/like`,
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

   deleteReply: async (commentId, token) => {
    const response = await fetch(
      `${config.apiUrl}/posts/comments/${commentId}`,
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