import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa";
import { motion } from "framer-motion";

const PostActions = ({ 
  post, 
  isLiking, 
  likeCooldown, 
  loadingComments, 
  activeCommentPostId, 
  onLike, 
  onToggleComments 
}) => {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => onLike(post._id, e)}
        disabled={isLiking[post._id] || likeCooldown[post._id]}
        className={`flex items-center gap-1 ${
          isLiking[post._id] || likeCooldown[post._id]
            ? "opacity-50 cursor-not-allowed"
            : ""
        } hover:text-red-500 transition-colors cursor-pointer`}
      >
        {isLiking[post._id] ? (
          <div className="inline-block h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        ) : post.hasUserLiked ? (
          <FaHeart className="text-xl text-red-500" />
        ) : (
          <FaRegHeart className="text-xl text-gray-400" />
        )}
        <motion.span
          key={post.likes?.length || 0}
          initial={{ scale: 1 }}
          animate={{ scale: [1.2, 1] }}
          transition={{ duration: 0.2 }}
          className={`text-sm font-medium ${
            post.hasUserLiked ? "text-red-500" : "text-gray-400"
          }`}
        >
          {post.likes?.length || 0}
        </motion.span>
      </motion.button>

      <button
        className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer"
        onClick={(e) => onToggleComments(post._id, e)}
        disabled={loadingComments[post._id]}
      >
        <FaComment />
        <span className="text-sm">{post.comments?.length || 0}</span>
        {loadingComments[post._id] && (
          <div className="inline-block h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1"></div>
        )}
      </button>
    </div>
  );
};

export default PostActions;