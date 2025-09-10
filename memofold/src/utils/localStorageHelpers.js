export const getStoredLikes = () => {
  try {
    return JSON.parse(localStorage.getItem("postLikes") || "{}");
  } catch (error) {
    console.error("Error parsing stored likes:", error);
    return {};
  }
};

export const updateStoredLikes = (postId, likes) => {
  const storedLikes = getStoredLikes();
  storedLikes[postId] = likes;
  localStorage.setItem("postLikes", JSON.stringify(storedLikes));
};

export const getStoredCommentLikes = () => {
  try {
    return JSON.parse(localStorage.getItem("commentLikes") || "{}");
  } catch (error) {
    console.error("Error parsing stored comment likes:", error);
    return {};
  }
};

export const updateStoredCommentLikes = (commentId, likes) => {
  const storedCommentLikes = getStoredCommentLikes();
  storedCommentLikes[commentId] = likes;
  localStorage.setItem("commentLikes", JSON.stringify(storedCommentLikes));
};