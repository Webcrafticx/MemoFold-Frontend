import { useState } from 'react';

export const useImagePreview = () => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleImageLoad = (e) => {
    const img = e.target;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const getImagePreviewStyle = () => {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;

    if (imageDimensions.width > maxWidth || imageDimensions.height > maxHeight) {
      const widthRatio = maxWidth / imageDimensions.width;
      const heightRatio = maxHeight / imageDimensions.height;
      const ratio = Math.min(widthRatio, heightRatio);

      return {
        width: imageDimensions.width * ratio,
        height: imageDimensions.height * ratio,
      };
    }

    return {
      width: imageDimensions.width,
      height: imageDimensions.height,
    };
  };

  return {
    showImagePreview,
    setShowImagePreview,
    previewImage,
    setPreviewImage,
    handleImageLoad,
    getImagePreviewStyle
  };
};