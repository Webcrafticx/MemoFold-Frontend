
const PostContent = ({ post, isDarkMode, setPreviewImage, setShowImagePreview }) => {
  return (
    <>
      <p
        className={`leading-relaxed mb-3 ${
          isDarkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {post.content || ""}
      </p>

      {post.image && (
        <div className="w-full mb-3 overflow-hidden rounded-xl flex justify-center">
          <img
            src={post.image}
            alt="Post"
            className="max-h-96 max-w-full object-contain cursor-pointer"
            onClick={() => {
              setPreviewImage(post.image);
              setShowImagePreview(true);
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
    </>
  );
};

export default PostContent;