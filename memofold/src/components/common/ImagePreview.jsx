import { FaTimes } from "react-icons/fa";
import { useRef } from "react";
import { useImagePreview } from "../../utils/imageHelpers";

const ImagePreview = ({ show, image, onClose }) => {
  const { handleImageLoad, getImagePreviewStyle } = useImagePreview();
  const imagePreviewRef = useRef(null);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur bg-transparent bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imagePreviewRef}
          src={image}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg"
          onLoad={handleImageLoad}
          style={getImagePreviewStyle()}
        />
        <button
          className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;