/**
 * Component for comparing two satellite images with a slider interface
 * filepath: frontend/src/components/core/ImageComparisonSlider.tsx
 */
import React from 'react';
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
  // TODO: Implement slider position change handler

  return (
    <div className="image-comparison-container">
      {/* TODO: Implement ReactCompareImage with proper sizing and labels */}
      <div className="image-comparison-placeholder">
        Image Comparison Slider Will Be Implemented Here
      </div>
    </div>
  );
};

export default ImageComparisonSlider;