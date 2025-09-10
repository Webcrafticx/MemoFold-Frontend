import { formatDate } from "../../utils/dateFormatter";

const PostHeader = ({ post, isDarkMode, navigateToUserProfile }) => {
  return (
    <div
      className="flex items-center gap-3 mb-3 cursor-pointer"
      onClick={(e) => navigateToUserProfile(post.userId._id, e)}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
        {post.userId.profilePic ? (
          <img
            src={post.userId.profilePic}
            alt={post.userId.username}
            className="w-8 h-8 object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = `<span class="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">${
                post.userId.username?.charAt(0).toUpperCase() || "U"
              }</span>`;
            }}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-lg">
            {post.userId.username?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      <div>
        <h3
          className={`text-base font-semibold hover:text-blue-500 transition-colors ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {post.userId.realname || post.userId.username || "Unknown User"}
        </h3>

        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          @{post.userId.username || "unknown"} · {formatDate(post.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default PostHeader;