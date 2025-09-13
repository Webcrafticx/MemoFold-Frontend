// src/components/mainFeed/ImagePreviewModal.jsx
import { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ImagePreviewModal = ({ image, onClose }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  const handleImageLoad = (e) => {
    const img = e.target;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const getImageStyle = () => {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      const widthRatio = maxWidth / dimensions.width;
      const heightRatio = maxHeight / dimensions.height;
      const ratio = Math.min(widthRatio, heightRatio);

      return {
        width: dimensions.width * ratio,
        height: dimensions.height * ratio,
      };
    }

    return {
      width: dimensions.width,
      height: dimensions.height,
    };
  };

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
          ref={imageRef}
          src={image}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg"
          onLoad={handleImageLoad}
          style={getImageStyle()}
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

export default ImagePreviewModal;