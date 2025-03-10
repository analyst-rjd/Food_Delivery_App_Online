import { useState, useEffect } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import { API_URL } from '../../suby/api';

/**
 * A reusable image component with built-in fallback handling
 * Uses embedded SVG data URLs that work 100% offline
 * No external dependencies for fallback images
 */
const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackType = 'restaurant', 
  className, 
  ...props 
}) => {
  // Use the provided src if available and valid, otherwise use the appropriate fallback image
  const [imgSrc, setImgSrc] = useState(null);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  
  // Process the image source to handle different formats
  const processImageSrc = (imageSrc) => {
    // If it's already a full URL, use it as is
    if (imageSrc && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))) {
      return imageSrc;
    }
    
    // If it's a relative path from the API, prepend the API URL
    if (imageSrc && imageSrc.startsWith('/')) {
      return `${API_URL}${imageSrc}`;
    }
    
    // Return the original source
    return imageSrc;
  };
  
  // Initialize image source when component mounts or src prop changes
  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setImgSrc(processImageSrc(src));
      setFallbackAttempt(0);
    } else {
      // If no valid source provided, use primary fallback
      setImgSrc(placeholderImages[fallbackType]);
      setFallbackAttempt(1);
    }
  }, [src, fallbackType]);
  
  // Handle image loading errors with multiple fallback levels
  const handleError = () => {
    console.log(`Image failed to load: ${imgSrc}`);
    
    // First try Unsplash fallbacks based on type
    if (fallbackAttempt === 0) {
      console.log(`Using Unsplash fallback for ${fallbackType}`);
      const fallbackImages = {
        food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        item: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
      };
      setImgSrc(fallbackImages[fallbackType] || fallbackImages.food);
      setFallbackAttempt(1);
    }
    // Then try the primary SVG fallback
    else if (fallbackAttempt === 1) {
      console.log(`Using primary SVG fallback for ${fallbackType}`);
      setImgSrc(placeholderImages[fallbackType]);
      setFallbackAttempt(2);
    } 
    // If that fails, use the text-based SVG fallback
    else if (fallbackAttempt === 2) {
      console.log(`Using text SVG fallback for ${fallbackType}`);
      setImgSrc(placeholderImages[`${fallbackType}Svg`]);
      setFallbackAttempt(3);
    }
    // Already tried all fallbacks, do nothing more
  };
  
  // If still initializing, show nothing
  if (imgSrc === null) {
    return null;
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt || 'Image'}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

export default ImageWithFallback;;