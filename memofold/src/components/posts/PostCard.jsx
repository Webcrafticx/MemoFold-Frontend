import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import CommentsSection from "./CommentsSection";

const PostCard = ({ 
  post, 
  isDarkMode, 
  activeCommentPostId, 
  onToggleComments, 
  onLike,
  onCommentSubmit,
  commentContent,
  setCommentContent,
  loadingComments,
  isLiking,
  likeCooldown,
  isCommenting,
  isLikingComment,
  isDeletingComment,
  onLikeComment,
  onDeleteComment,
  currentUserProfile,
  user,
  username,
  navigateToUserProfile,
  setPreviewImage,
  setShowImagePreview
}) => {
  return (
    <div className={`w-full max-w-2xl rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default ${
      isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
    }`}>
      <PostHeader 
        post={post} 
        isDarkMode={isDarkMode} 
        navigateToUserProfile={navigateToUserProfile} 
      />
      
      <PostContent 
        post={post} 
        isDarkMode={isDarkMode} 
        setPreviewImage={setPreviewImage} 
        setShowImagePreview={setShowImagePreview} 
      />
      
      <PostActions 
        post={post}
        isLiking={isLiking}
        likeCooldown={likeCooldown}
        loadingComments={loadingComments}
        activeCommentPostId={activeCommentPostId}
        onLike={onLike}
        onToggleComments={onToggleComments}
      />
      
      {activeCommentPostId === post._id && (
        <CommentsSection
          post={post}
          isDarkMode={isDarkMode}
          loadingComments={loadingComments}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          isCommenting={isCommenting}
          onCommentSubmit={onCommentSubmit}
          isLikingComment={isLikingComment}
          isDeletingComment={isDeletingComment}
          onLikeComment={onLikeComment}
          onDeleteComment={onDeleteComment}
          currentUserProfile={currentUserProfile}
          user={user}
          username={username}
          navigateToUserProfile={navigateToUserProfile}
        />
      )}
    </div>
  );
};

export default PostCard;