const CommentForm = ({ 
  postId, 
  isDarkMode, 
  commentContent, 
  setCommentContent, 
  isCommenting, 
  onCommentSubmit, 
  currentUserProfile, 
  user, 
  username 
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCommentSubmit(postId, e);
      }}
      className="flex items-center space-x-2"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
        {currentUserProfile?.profilePic || user?.profilePic ? (
          <img
            src={currentUserProfile?.profilePic || user?.profilePic}
            alt={username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${
                username?.charAt(0).toUpperCase() || "U"
              }</span>`;
            }}
          />
        ) : (
          <span className="text-xs font-semibold text-gray-700">
            {username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>
      <div className="flex-1 flex space-x-2">
        <input
          type="text"
          className={`flex-1 px-3 py-2 rounded-full text-sm border ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Write a comment..."
          value={commentContent[postId] || ""}
          onChange={(e) =>
            setCommentContent({
              ...commentContent,
              [postId]: e.target.value,
            })
          }
        />
        <button
          type="submit"
          className={`px-3 py-1 rounded-full text-sm ${
            !commentContent[postId]?.trim() || isCommenting[postId]
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors`}
          disabled={
            !commentContent[postId]?.trim() || isCommenting[postId]
          }
        >
          {isCommenting[postId] ? (
            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;