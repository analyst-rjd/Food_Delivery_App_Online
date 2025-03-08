import { useState, useEffect } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';

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
  
  // Initialize image source when component mounts or src prop changes
  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setImgSrc(src);
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
    
    // First try the primary SVG fallback
    if (fallbackAttempt === 0) {
      console.log(`Using primary fallback for ${fallbackType}`);
      setImgSrc(placeholderImages[fallbackType]);
      setFallbackAttempt(1);
    } 
    // If that fails, use the text-based SVG fallback
    else if (fallbackAttempt === 1) {
      console.log(`Using text SVG fallback for ${fallbackType}`);
      setImgSrc(placeholderImages[`${fallbackType}Svg`]);
      setFallbackAttempt(2);
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