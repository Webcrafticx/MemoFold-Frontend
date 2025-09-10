import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

const CommentsSection = ({ 
  post, 
  isDarkMode, 
  loadingComments, 
  commentContent, 
  setCommentContent, 
  isCommenting, 
  onCommentSubmit, 
  isLikingComment, 
  isDeletingComment, 
  onLikeComment, 
  onDeleteComment, 
  currentUserProfile, 
  user, 
  username, 
  navigateToUserProfile 
}) => {
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
                  post={post}
                  isDarkMode={isDarkMode}
                  isLikingComment={isLikingComment}
                  isDeletingComment={isDeletingComment}
                  onLikeComment={onLikeComment}
                  onDeleteComment={onDeleteComment}
                  username={username}
                  navigateToUserProfile={navigateToUserProfile}
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

          <CommentForm
            postId={post._id}
            isDarkMode={isDarkMode}
            commentContent={commentContent}
            setCommentContent={setCommentContent}
            isCommenting={isCommenting}
            onCommentSubmit={onCommentSubmit}
            currentUserProfile={currentUserProfile}
            user={user}
            username={username}
          />
        </>
      )}
    </div>
  );
};

export default CommentsSection;