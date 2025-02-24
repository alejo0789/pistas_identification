import React, { useState } from 'react';
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
  const [sliderPosition, setSliderPosition] = useState<number>(0.5);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Handle slider position change
  const handleSliderPositionChange = (position: number) => {
    setSliderPosition(position);
    if (onSliderPositionChange) {
      onSliderPositionChange(position);
    }
  };

  return (
    <div className="image-comparison-container relative rounded-lg overflow-hidden shadow-md">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p>Loading comparison...</p>
        </div>
      )}
      
      <div className={isLoading ? 'opacity-0' : 'opacity-100'}>
        <ReactCompareImage
          leftImage={beforeImage}
          rightImage={afterImage}
          leftImageLabel={beforeLabel}
          rightImageLabel={afterLabel}
          sliderPositionPercentage={sliderPosition}
          onSliderPositionChange={handleSliderPositionChange}
          sliderLineWidth={2}
          sliderLineColor="#fff"
          handle={
            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12H3M9 6l-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </div>
          }
          onImagesLoad={() => setIsLoading(false)}
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-50 text-white">
        <div className="flex justify-between text-sm">
          <div>{beforeLabel}</div>
          <div>Slide to compare</div>
          <div>{afterLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;