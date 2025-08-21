import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaArrowLeft, FaUser, FaCalendar, FaMapMarker, FaLink, FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import config from "../hooks/config";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, username } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [userDescription, setUserDescription] = useState(""); 
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [isLiking, setIsLiking] = useState({});
  const [isCommenting, setIsCommenting] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      navigate("/login");
    }
  }, [userId, token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/user/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      
      const userDataFromApi = data.user || data;
      setUserData(userDataFromApi);
      
      if (data.description) {
        setUserDescription(data.description);
      }
      
      if (userDataFromApi.username) {
        fetchUserPosts(userDataFromApi.username);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (username) => {
    try {
      const response = await fetch(`${config.apiUrl}/posts/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user posts");
      }

      const data = await response.json();
      const postsData = Array.isArray(data) ? data : data.posts || [];
      
      const postsWithLikes = postsData.map(post => ({
        ...post,
        isLiked: post.likes?.some(like => like.userId === username) || false,
        comments: post.comments || []
      }));
      
      setUserPosts(postsWithLikes);
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await fetch(`${config.apiUrl}/posts/${postId}/comments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const responseData = await response.json();
      const comments = responseData.comments || [];

      const commentsWithLikes = comments.map(comment => ({
        ...comment,
        isLiked: comment.likes?.some(like => like.userId === username) || false
      }));

      setUserPosts(posts => posts.map(post =>
        post._id === postId ? { 
          ...post, 
          comments: commentsWithLikes
        } : post
      ));
    } catch (err) {
      setError(err.message);
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLike = async (postId) => {
    if (!username) {
      console.error("Username not available");
      setError("You must be logged in to like posts");
      return;
    }

    setIsLiking(prev => ({ ...prev, [postId]: true }));

    try {
      setUserPosts(posts => posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.isLiked;
          return {
            ...post,
            isLiked: !isLiked,
            likes: isLiked
              ? post.likes?.filter(like => like.userId !== username) || []
              : [...(post.likes || []), { userId: username }]
          };
        }
        return post;
      }));

      const response = await fetch(`${config.apiUrl}/posts/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update like status");
      }

      const updatedPost = await response.json();
      setUserPosts(posts => posts.map(post => 
        post._id === postId ? {
          ...post,
          ...updatedPost,
          isLiked: updatedPost.likes?.some(like => like.userId === username) || false
        } : post
      ));
    } catch (err) {
      console.error("Error liking post:", err);
      setError(err.message);
      setUserPosts(posts => posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked, 
            likes: post.isLiked
              ? post.likes?.filter(like => like.userId !== username) || []
              : [...(post.likes || []), { userId: username }]
          };
        }
        return post;
      }));
    } finally {
      setIsLiking(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleCommentDropdown = async (postId) => {
    if (activeCommentPostId !== postId) {
      await fetchComments(postId);
    }
    
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    setCommentContent((prev) => ({
      ...prev,
      [postId]: prev[postId] || "",
    }));
  };

  const handleCommentSubmit = async (postId) => {
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
      const newComment = {
        userId: username,
        username: username,
        content: content,
        createdAt: new Date().toISOString(),
        likes: [],
        isLiked: false
      };

      setUserPosts(posts => posts.map(post =>
        post._id === postId
          ? {
            ...post,
            comments: [...(post.comments || []), newComment]
          }
          : post
      ));

      const response = await fetch(
        `${config.apiUrl}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: postId,
            content: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const responseData = await response.json();
      const createdComment = responseData.comment || responseData;

      setUserPosts(posts => posts.map(post =>
        post._id === postId
          ? {
            ...post,
            comments: post.comments?.map(comment => 
              comment.createdAt === newComment.createdAt && comment.content === newComment.content
                ? { ...createdComment, isLiked: false }
                : comment
            ) || [createdComment]
          }
          : post
      ));

      setCommentContent((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
      setError(err.message);
      setUserPosts(posts => posts.map(post =>
        post._id === postId
          ? {
            ...post,
            comments: post.comments?.filter(comment => 
              !(comment.createdAt === new Date().toISOString() && comment.content === content)
            ) || []
          }
          : post
      ));
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Just now";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-semibold">{userData.realname || userData.username}</h1>
          <p className="text-sm text-gray-500">{userPosts.length} posts</p>
        </div>
      </header>

      {/* Profile Info */}
      <div className="bg-white shadow-sm mt-4 mx-4 rounded-lg p-6">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 mb-4 md:mb-0 md:mr-6">
            {userData.profilePic ? (
              <img
                src={userData.profilePic}
                alt={userData.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML =
                    `<span class="text-2xl font-semibold text-gray-700">
                      ${userData.username?.charAt(0).toUpperCase() || 'U'}
                    </span>`;
                }}
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-700">
                {userData.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{userData.realname || userData.username}</h2>
            <p className="text-gray-500">@{userData.username}</p>
            
            {/* display user description  */}
            {userDescription && (
              <p className="mt-2 text-gray-700">{userDescription}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              {userData.location && (
                <div className="flex items-center">
                  <FaMapMarker className="mr-1" />
                  <span>{userData.location}</span>
                </div>
              )}
              
              {userData.website && (
                <a 
                  href={userData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:underline"
                >
                  <FaLink className="mr-1" />
                  <span>{userData.website.replace(/(^\w+:|^)\/\//, '')}</span>
                </a>
              )}
              
              {userData.createdAt && (
                <div className="flex items-center">
                  <FaCalendar className="mr-1" />
                  <span>Joined {formatDate(userData.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-6 mx-4">
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        
        {userPosts.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                    {userData.profilePic ? (
                      <img
                        src={userData.profilePic}
                        alt={userData.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML =
                            `<span class="text-lg font-semibold text-gray-700">
                              ${userData.username?.charAt(0).toUpperCase() || 'U'}
                            </span>`;
                        }}
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-700">
                        {userData.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {userData.realname || userData.username}
                    </h3>
                    <p className="text-xs text-gray-500">
                      @{userData.username} · {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-3">
                  {post.content}
                </p>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-xl mb-3 cursor-pointer"
                    onClick={() => window.open(post.image, "_blank")}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}

                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post._id);
                    }}
                    disabled={isLiking[post._id]}
                    className={`flex items-center gap-1 ${isLiking[post._id] ? "opacity-50 cursor-not-allowed" : ""} hover:text-red-500 transition-colors cursor-pointer`}
                  >
                    {isLiking[post._id] ? (
                      <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : post.isLiked ? (
                      <FaHeart className="text-xl text-red-500" />
                    ) : (
                      <FaRegHeart className="text-xl text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${post.isLiked ? "text-red-500" : "text-gray-400"}`}>
                      {post.likes?.length || 0} likes
                    </span>
                  </button>

                  <button
                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
                    onClick={() => toggleCommentDropdown(post._id)}
                    disabled={loadingComments[post._id]}
                  >
                    <FaCommentDots />
                    <span className="text-sm">
                      {post.comments?.length || 0}
                    </span>
                    {loadingComments[post._id] && (
                      <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
                    )}
                  </button>
                </div>

                {/* Comment Section */}
                {activeCommentPostId === post._id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Comments</h4>
                    
                    {loadingComments[post._id] ? (
                      <div className="flex justify-center py-4">
                        <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : post.comments?.length > 0 ? (
                      <div className="mb-3 max-h-40 overflow-y-auto">
                        {post.comments.map((comment, index) => (
                          <div
                            key={comment._id || index}
                            className="mb-3 p-2 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.userId?.username || comment.username || "Unknown"}
                              </span>
                            </div>
                            
                            <p className="text-sm mb-1">
                              {comment.content || ""}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm mb-3 text-gray-700">
                        No comments yet
                      </p>
                    )}

                    <div className="mt-3">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Write your comment..."
                        value={commentContent[post._id] || ""}
                        onChange={(e) =>
                          setCommentContent({
                            ...commentContent,
                            [post._id]: e.target.value
                          })
                        }
                      />
                      
                      <button
                        className="mt-2 px-3 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer flex items-center justify-center w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentSubmit(post._id);
                        }}
                        disabled={isCommenting[post._id]}
                      >
                        {isCommenting[post._id] ? (
                          <div className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : null}
                        Post Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;