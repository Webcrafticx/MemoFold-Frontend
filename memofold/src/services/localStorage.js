export const localStorageService = {
  // Post likes
  getStoredLikes: () => {
    try {
      return JSON.parse(localStorage.getItem("postLikes") || "{}");
    } catch (error) {
      console.error("Error parsing stored likes:", error);
      return {};
    }
  },

  updateStoredLikes: (postId, likes) => {
    const storedLikes = localStorageService.getStoredLikes();
    storedLikes[postId] = likes;
    localStorage.setItem("postLikes", JSON.stringify(storedLikes));
  },

  // Post likes preview
  getStoredLikesPreview: () => {
    try {
      return JSON.parse(localStorage.getItem("postLikesPreview") || "{}");
    } catch (error) {
      console.error("Error parsing stored likes preview:", error);
      return {};
    }
  },

  updateStoredLikesPreview: (postId, likesPreview) => {
    const storedLikesPreview = localStorageService.getStoredLikesPreview();
    storedLikesPreview[postId] = likesPreview;
    localStorage.setItem("postLikesPreview", JSON.stringify(storedLikesPreview));
  },

  // Post likes count
  getStoredLikesCount: () => {
    try {
      return JSON.parse(localStorage.getItem("postLikesCount") || "{}");
    } catch (error) {
      console.error("Error parsing stored likes count:", error);
      return {};
    }
  },

  updateStoredLikesCount: (postId, likesCount) => {
    const storedLikesCount = localStorageService.getStoredLikesCount();
    storedLikesCount[postId] = likesCount;
    localStorage.setItem("postLikesCount", JSON.stringify(storedLikesCount));
  },

  // Comment likes
  getStoredCommentLikes: () => {
    try {
      return JSON.parse(localStorage.getItem("commentLikes") || "{}");
    } catch (error) {
      console.error("Error parsing stored comment likes:", error);
      return {};
    }
  },

  updateStoredCommentLikes: (commentId, likes) => {
    const storedCommentLikes = localStorageService.getStoredCommentLikes();
    storedCommentLikes[commentId] = likes;
    localStorage.setItem("commentLikes", JSON.stringify(storedCommentLikes));
  },

  // Active Replies state - ADDED MISSING METHODS
  getActiveReplies: () => {
    try {
      const activeReplies = localStorage.getItem('activeReplies');
      return activeReplies ? JSON.parse(activeReplies) : {};
    } catch (error) {
      console.error('Error getting active replies:', error);
      return {};
    }
  },

  setActiveReplies: (activeReplies) => {
    try {
      localStorage.setItem('activeReplies', JSON.stringify(activeReplies));
    } catch (error) {
      console.error('Error setting active replies:', error);
    }
  },

  // Dark mode
  getDarkMode: () => localStorage.getItem("darkMode") === "true",
  setDarkMode: (value) => localStorage.setItem("darkMode", value),

  // User data
  setJoinedDate: (createdAt) => {
    if (createdAt) {
      const joinedDate = new Date(createdAt);
      const formattedDate = joinedDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      localStorage.setItem("joinedDateFormatted", formattedDate);
    }
  },
};