import CommentItem from "./CommentItem";

const CommentSection = ({
    post,
    username,
    currentUserProfile,
    user,
    isDarkMode,
    activeCommentPostId,
    loadingComments,
    commentContent,
    isCommenting,
    isLikingComment,
    isDeletingComment,
    activeReplies,
    replyContent,
    isReplying,
    isLikingReply,
    isDeletingReply,
    onToggleCommentDropdown,
    onCommentSubmit,
    onSetCommentContent,
    onLikeComment,
    onDeleteComment,
    onToggleReplies,
    onToggleReplyInput,
    onAddReply,
    onLikeReply,
    onDeleteReply,
    onSetReplyContent,
    navigateToUserProfile,
    activeReplyInputs, // ✅ PROFILE-MATCHING: Add activeReplyInputs prop
}) => {
    if (activeCommentPostId !== post._id) return null;

    return (
        <div className="mt-4">
            {loadingComments[post._id] ? (
                <div className="text-center py-4">
                    <div className="inline-block h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm mt-2">Loading comments...</p>
                </div>
            ) : (
                <>
                    {post.comments && post.comments.length > 0 ? (
                        <div
                            className={`mb-4 space-y-3 max-h-60 overflow-y-auto p-2 rounded-lg ${
                                isDarkMode
                                    ? "bg-gray-700 text-gray-200"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {post.comments.map((comment) => (
                                <CommentItem
                                    key={comment._id}
                                    comment={comment}
                                    postId={post._id}
                                    username={username}
                                    postOwner={post.userId?.username}
                                    isDarkMode={isDarkMode}
                                    onLikeComment={onLikeComment}
                                    onDeleteComment={onDeleteComment}
                                    onToggleReplyInput={onToggleReplyInput}
                                    onToggleReplies={onToggleReplies}
                                    onAddReply={onAddReply}
                                    onLikeReply={onLikeReply}
                                    onDeleteReply={onDeleteReply}
                                    isLikingComment={isLikingComment}
                                    isDeletingComment={isDeletingComment}
                                    isLikingReply={isLikingReply}
                                    isDeletingReply={isDeletingReply}
                                    isReplying={isReplying}
                                    replyContent={replyContent}
                                    onSetReplyContent={onSetReplyContent} // ✅ PROFILE-MATCHING: Use correct prop name
                                    activeReplies={activeReplies}
                                    navigateToUserProfile={
                                        navigateToUserProfile
                                    }
                                    activeReplyInputs={activeReplyInputs} // ✅ PROFILE-MATCHING: Pass activeReplyInputs
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`text-center py-4 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            No comments yet. Be the first to comment!
                        </div>
                    )}

                    {/* Add Comment Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onCommentSubmit(post._id, e);
                        }}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                            {currentUserProfile?.profilePic ||
                            user?.profilePic ? (
                                <img
                                    src={
                                        currentUserProfile?.profilePic ||
                                        user?.profilePic
                                    }
                                    alt={username}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-gray-700">${
                                            username?.charAt(0).toUpperCase() ||
                                            "U"
                                        }</span>`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm">
                                    {username?.charAt(0).toUpperCase() || "U"}
                                </div>
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
                                value={commentContent[post._id] || ""}
                                onChange={(e) =>
                                    onSetCommentContent({
                                        ...commentContent,
                                        [post._id]: e.target.value,
                                    })
                                }
                            />
                            <button
                                type="submit"
                                className={`px-3 py-1 rounded-full text-sm ${
                                    !commentContent[post._id]?.trim() ||
                                    isCommenting[post._id]
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600"
                                } text-white transition-colors cursor-pointer`}
                                disabled={
                                    !commentContent[post._id]?.trim() ||
                                    isCommenting[post._id]
                                }
                            >
                                {isCommenting[post._id] ? (
                                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin cursor-pointer"></span>
                                ) : (
                                    "Post"
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default CommentSection;
