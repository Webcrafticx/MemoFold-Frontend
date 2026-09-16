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
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },
    ensureUsersExist: async (token, users) => {
        const res = await fetch(`${config.apiUrl}/chat/ensureUsersExist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ users }),
        });
        return res.json();
    },

    fetchFriendsList: async (token) => {
        const res = await fetch(`${config.apiUrl}/friends/friends-list`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    getShareLink: async (postId, token) => {
        const res = await fetch(`${config.apiUrl}/posts/share-link/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    fetchSharedPost: async (shareToken, token) => {
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${config.apiUrl}/posts/shared/${shareToken}`, {
            headers,
        });
        return res.json();
    },

    sharePostToDMs: async (friendIds, link, token) => {
        const res = await fetch(`${config.apiUrl}/chat/share-post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ friendIds, link }),
        });
        return res.json();
    },

    // Profile-specific endpoints
    fetchUserPosts: async (token, userId, cursor = null) => {
        // Use userId instead of username
        const url = cursor
            ? `${config.apiUrl}/posts/user/${userId}?cursor=${cursor}`
            : `${config.apiUrl}/posts/user/${userId}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return await response.json();
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

    checkUsername: async (username, token = null) => {
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const url = token
            ? `${config.apiUrl}/user/check-username?username=${encodeURIComponent(username)}`
            : `${config.apiUrl}/auth/check-username?username=${encodeURIComponent(username)}`;
        const response = await fetch(url, { headers });
        return response.json();
    },

    mentionSuggest: async (token, q = "", limit = 8, signal) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("limit", String(limit));
        const response = await fetch(
            `${config.apiUrl}/user/mention-suggest?${params}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                signal,
            }
        );
        return response.json();
    },

    searchPlaces: async (token, q = "", limit = 8, proximity = null, signal) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("limit", String(limit));
        if (proximity?.lat != null && proximity?.lng != null) {
            params.set("lat", String(proximity.lat));
            params.set("lng", String(proximity.lng));
        }
        const response = await fetch(
            `${config.apiUrl}/places/search?${params}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                signal,
            }
        );
        return response.json();
    },

    getPlaceDetails: async (token, placeId, signal) => {
        const params = new URLSearchParams();
        params.set("placeId", placeId);
        const response = await fetch(
            `${config.apiUrl}/places/details?${params}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                signal,
            }
        );
        return response.json();
    },

    uploadProfilePic: async (token, formData) => {
        const response = await fetch(
            `${config.apiUrl}/user/upload-profile-pic`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );
        return response.json();
    },

createPost: async (token, data) => {
    // Check if data is FormData or JSON
    const isFormData = data instanceof FormData;
    
    const response = await fetch(`${config.apiUrl}/posts`, {
        method: "POST",
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${token}`,
        },
        body: isFormData ? data : JSON.stringify(data),
    });
    return response.json();
},

updatePost: async (token, postId, postData, isFormData = false) => {
    // Headers setup
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    // If it's not FormData (i.e., JSON data), set Content-Type
    if (!isFormData && !(postData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Determine body based on data type
    let body;
    if (postData instanceof FormData) {
        body = postData;
    } else {
        body = JSON.stringify(postData);
    }
    
    const response = await fetch(
        `${config.apiUrl}/posts/update/${postId}`,
        {
            method: "PUT",
            headers: headers,
            body: body,
        }
    );
    return response.json();
},

    deletePost: async (token, postId) => {
        const response = await fetch(
            `${config.apiUrl}/posts/delete/${postId}`,
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

    fetchPosts: async (token, cursor = null) => {
        const params = new URLSearchParams();
        if (cursor) {
            params.append("cursor", cursor); // ✅ Added cursor parameter
        }
        const url = `${config.apiUrl}/posts${
            params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    // In api.js - Add this function to your apiService
    fetchSinglePost: async (token, postId) => {
        const response = await fetch(`${config.apiUrl}/posts/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },
    fetchPostLikes: async (postId, token, cursor = null) => {
        const params = new URLSearchParams();
        if (cursor) {
            params.append("cursor", cursor);
        }

        const url = `${config.apiUrl}/posts/${postId}/likes${
            params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.json();
    },

    fetchComments: async (postId, token, cursor = null) => {
            let url = `${config.apiUrl}/posts/${postId}/comments`;
            if (cursor) {
                url += `?cursor=${cursor}`;
            }
            const response = await fetch(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
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
            content,
            // parentComment automatically null
        };

        console.log("Normal Comment API Request:", { postId, content });

        const response = await fetch(
            `${config.apiUrl}/posts/${postId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            }
        );
        return response.json();
    },

    addCommentReply: async (commentId, content, postId, token) => {
        const requestBody = {
            content,
            parentCommentId: commentId,
        };

        console.log("Reply API Request:", {
            commentId,
            content,
            postId,
            requestBody,
        });

        const response = await fetch(
            `${config.apiUrl}/posts/${postId}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            }
        );
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
    // Accepts: commentId, token, cursorCreatedAt, cursorId
    fetchCommentReplies: async (commentId, token, cursorCreatedAt = null, cursorId = null) => {
        let url = `${config.apiUrl}/posts/replies/${commentId}`;
        const params = [];
        if (cursorCreatedAt) params.push(`cursorCreatedAt=${encodeURIComponent(cursorCreatedAt)}`);
        if (cursorId) params.push(`cursorId=${encodeURIComponent(cursorId)}`);
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        const response = await fetch(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
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

    resetPassword: async (token, newPassword) => {
        const response = await fetch(`${config.apiUrl}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, newPassword }),
        });
        return response.json();
    },

    sendSignupOtp: async (data) => {
        const response = await fetch(`${config.apiUrl}/auth/send-signup-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    sendVerificationOtp: async (token) => {
        const response = await fetch(`${config.apiUrl}/auth/send-verification-otp`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.json();
    },

    verifyEmail: async (token, otp) => {
        const response = await fetch(`${config.apiUrl}/auth/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ otp }),
        });
        return response.json();
    },

    // Contact/Feedback endpoint
    submitContactRequest: async (data) => {
        const response = await fetch(`${config.apiUrl}/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                message: data.message,
                requestType: data.requestType,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return response.json();
    },

    // Check if two users are friends
    checkIsFriend: async (token, targetUserId, currentUserId) => {
        const response = await fetch(
            `${config.apiUrl}/friends/isFriend/${targetUserId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.json();
    },

    // Fetch friends list with optional search and cursor
    fetchFriendsList: async (token, cursor = null, search = null) => {
        const url = new URL(`${config.apiUrl}/friends/friends-list`);
        if (cursor) url.searchParams.append("cursor", cursor);
        if (search) url.searchParams.append("search", search);

        const response = await fetch(url.toString(), {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.json();
    },

        async syncAllProfilePics(token) {
                const res = await fetch(`${config.apiUrl}/stream/sync-profile-pics`, {
                        method: "POST",
                        headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                        },
                });
                if (!res.ok) throw new Error("Failed to sync profile pics");
                return res.json();
        },
};
