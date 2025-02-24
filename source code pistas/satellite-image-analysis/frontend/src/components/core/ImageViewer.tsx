import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  title?: string;
  onDownload?: () => void;
  overlayData?: any; // GeoJSON or other overlay data
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  alt = 'Satellite image',
  title,
  onDownload,
  overlayData
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Reset loading state when imageUrl changes
    setIsLoading(true);
    setError(null);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  // TODO: In the future, implement map overlays using Mapbox or Leaflet
  // For now, just display the image

  return (
    <div 
      className="image-viewer-container relative rounded-lg overflow-hidden border border-gray-200 bg-white"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {title && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p>Loading image...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-auto"
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Controls overlay */}
        {showControls && onDownload && (
          <div className="absolute bottom-0 right-0 p-3 bg-black bg-opacity-50 rounded-tl-md">
            <Button
              variant="primary"
              size="sm"
              onClick={onDownload}
              className="text-white"
            >
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;