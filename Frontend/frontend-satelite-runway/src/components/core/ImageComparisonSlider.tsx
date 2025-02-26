/**
 * Component for comparing two satellite images with a slider interface
 * filepath: frontend/src/components/core/ImageComparisonSlider.tsx
 */
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactCompareImage to avoid SSR issues
const ReactCompareImage = dynamic(() => import('react-compare-image'), {
  ssr: false,
});

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  onSliderPositionChange?: (position: number) => void;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
  onSliderPositionChange
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Reset slider position when images change
  useEffect(() => {
    setSliderPosition(50);
    // Attempt to check if images are valid
    const checkImageLoad = async () => {
      try {
        const beforeImg = new Image();
        
        const beforeLoadPromise = new Promise((resolve, reject) => {
          beforeImg.onload = resolve;
          beforeImg.onerror = reject;
        });

        beforeImg.src = beforeImage;

        await beforeLoadPromise;
        
        // If afterImage exists, also check its loading
        if (afterImage) {
          const afterImg = new Image();
          const afterLoadPromise = new Promise((resolve, reject) => {
            afterImg.onload = resolve;
            afterImg.onerror = reject;
          });
          afterImg.src = afterImage;
          await afterLoadPromise;
        }

        setIsImageLoaded(true);
      } catch (error) {
        console.error('Image loading failed', error);
        setIsImageLoaded(false);
      }
    };

    checkImageLoad();
  }, [beforeImage, afterImage]);

  const handleSliderChange = (position: number) => {
    setSliderPosition(position);
    
    // Optionally call the prop callback if provided
    if (onSliderPositionChange) {
      onSliderPositionChange(position);
    }
  };

  // If no before image or image not loaded, show a placeholder
  if (!beforeImage || !isImageLoaded) {
    return (
      <div className={`image-comparison-placeholder bg-gray-200 h-64 flex items-center justify-center text-gray-500 ${className}`}>
        No images available for comparison
      </div>
    );
  }

  // If no after image, show only the before image
  if (!afterImage) {
    return (
      <div className={`single-image-container relative w-full ${className}`}>
        <img 
          src={beforeImage} 
          alt={beforeLabel} 
          className="w-full max-h-[600px] object-contain"
        />
        <div className="image-label text-center mt-2 text-sm text-gray-600">
          {beforeLabel}
        </div>
      </div>
    );
  }

  // If both images are present, show comparison slider
  return (
    <div className={`image-comparison-container relative w-full ${className}`}>
      <div className="compare-image-wrapper">
        <ReactCompareImage 
          leftImage={beforeImage}
          rightImage={afterImage}
          leftImageLabel={beforeLabel}
          rightImageLabel={afterLabel}
          sliderPositionPercentage={sliderPosition / 100}
          onSliderPositionChange={handleSliderChange}
          // Optional styling
          containerStyle={{
            maxHeight: '600px',
            width: '100%'
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
        
        {/* Slider position indicator */}
        <div className="slider-position-info text-center mt-2 text-sm text-gray-600">
          Comparison view: {sliderPosition}% {beforeLabel} | {100 - sliderPosition}% {afterLabel}
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;