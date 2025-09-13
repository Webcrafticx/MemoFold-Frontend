// src/services/localStorage.js
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