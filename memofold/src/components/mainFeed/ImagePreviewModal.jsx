// src/components/mainFeed/ImagePreviewModal.jsx
import { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ImagePreviewModal = ({ image, onClose }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Pure page par restrictions
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleContextMenu);
    
    // Body par CSS bhi add karo
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleContextMenu);
      
      // Wapas normal kar do
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

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
      onContextMenu={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      <div
        className="relative max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Transparent overlay jo image ko cover kare */}
        <div 
          className="absolute inset-0 z-10"
          onContextMenu={(e) => e.preventDefault()}
          style={{
            pointerEvents: 'auto',
            cursor: 'default'
          }}
        />
        
        <img
          ref={imageRef}
          src={image}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg relative z-0"
          onLoad={handleImageLoad}
          style={getImageStyle()}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        
        <button
          className="absolute top-4 right-4 bg-red-500 cursor-pointer text-white rounded-full p-1 hover:bg-red-600 transition-colors z-20"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;