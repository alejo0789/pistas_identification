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
  onSliderPositionChange?: (position: number) => void;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  onSliderPositionChange
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0.5);
  const [error, setError] = useState<string | null>(null);

  // Handle slider position change
  const handleSliderPositionChange = (position: number) => {
    setSliderPosition(position);
    if (onSliderPositionChange) {
      onSliderPositionChange(position);
    }
  };

  // Handle image load errors
  useEffect(() => {
    const preloadImages = async () => {
      try {
        await Promise.all([
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load image: ${beforeImage}`));
            img.src = beforeImage;
          }),
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => reject(new Error(`Failed to load image: ${afterImage}`));
            img.src = afterImage;
          })
        ]);
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
        setIsLoaded(false);
      }
    };

    preloadImages();
  }, [beforeImage, afterImage]);

  return (
    <div className="image-comparison-container w-full h-full relative">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}
      
      {!isLoaded && !error && (
        <div className="flex justify-center items-center h-96 bg-gray-100 rounded-md">
          <div className="animate-pulse text-gray-500">Loading images...</div>
        </div>
      )}
      
      {isLoaded && (
        <div className="w-full h-full">
          <ReactCompareImage
            leftImage={beforeImage}
            rightImage={afterImage}
            leftImageLabel={beforeLabel}
            rightImageLabel={afterLabel}
            sliderPositionPercentage={sliderPosition}
            onSliderPositionChange={handleSliderPositionChange}
            sliderLineWidth={2}
            sliderLineColor="white"
            handle={
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid white',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            }
          />
        </div>
      )}
      
      <div className="mt-2 flex justify-between text-sm text-gray-500">
        <div>{beforeLabel}</div>
        <div>{afterLabel}</div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;