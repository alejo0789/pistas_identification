import React, { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import ImageComparisonSlider from '../../components/core/ImageComparisonSlider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// Simulated analysis function
const analyzeImage = async (imageUrl: string, date: string) => {
  // Simulate an API call or image processing
  return new Promise<{
    url: string;
    date: string;
    detectedFeatures: {
      runwayLength: number;
      runwayWidth: number;
      numberOfAircraft: number;
      constructions: number;
      roads: number;
    };
  }>((resolve) => {
    setTimeout(() => {
      // Simulated detection results with different values for each image
      const featureMap: Record<string, any> = {
        '2023-12-31': {
          runwayLength: 3200,
          runwayWidth: 45,
          numberOfAircraft: 7,
          constructions: 12,
          roads: 3
        },
        '2023-09-30': {
          runwayLength: 3100,
          runwayWidth: 44,
          numberOfAircraft: 5,
          constructions: 10,
          roads: 2
        },
        '2023-06-30': {
          runwayLength: 3050,
          runwayWidth: 42,
          numberOfAircraft: 4,
          constructions: 8,
          roads: 1
        }
      };

      resolve({
        url: imageUrl,
        date,
        detectedFeatures: featureMap[date] || featureMap['2023-12-31']
      });
    }, 2000);
  });
};

const ImageComparisonPage: React.FC = () => {
  // Most recent image date (read-only)
  const mostRecentImageDate = '2023-12-31';
  const mostRecentImageUrl = '/placeholder-december.jpg';

  // List of available images (simulated, replace with actual data source)
  const availableImages = [
    { date: '2023-06-30', url: '/placeholder-june.jpg' },
    { date: '2023-09-30', url: '/placeholder-september.jpg' }
  ];

  // No longer using a separate beforeImage state
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [selectedImageDate, setSelectedImageDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mostRecentImageFeatures, setMostRecentImageFeatures] = useState<{
    runwayLength: number;
    runwayWidth: number;
    numberOfAircraft: number;
    constructions: number;
    roads: number;
  } | null>(null);
  const [comparisonImageFeatures, setComparisonImageFeatures] = useState<{
    runwayLength: number;
    runwayWidth: number;
    numberOfAircraft: number;
    constructions: number;
    roads: number;
  } | null>(null);

  // Analyze most recent image on initial render
  useEffect(() => {
    const analyzeMostRecentImage = async () => {
      try {
        setIsLoading(true);
        const analyzedResult = await analyzeImage(mostRecentImageUrl, mostRecentImageDate);
        setMostRecentImageFeatures(analyzedResult.detectedFeatures);
        setIsLoading(false);
      } catch (error) {
        console.error('Initial image analysis failed', error);
        setIsLoading(false);
      }
    };

    analyzeMostRecentImage();
  }, []);

  // Memoized handler to prevent unnecessary re-renders
  const handleImageSelection = useCallback(async (value: string) => {
    if (value === 'no-comparison') {
      // Ensure only the most recent image is displayed
      setAfterImage(null);
      setSelectedImageDate(null);
      setComparisonImageFeatures(null);
      return;
    }
  
    const selectedImage = availableImages.find(img => img.date === value);
    if (selectedImage) {
      setIsLoading(true);
      try {
        const analyzedImageResult = await analyzeImage(selectedImage.url, selectedImage.date);
        
        setSelectedImageDate(value);
        setAfterImage(analyzedImageResult.url);
        setComparisonImageFeatures(analyzedImageResult.detectedFeatures);
      } catch (error) {
        console.error('Image analysis failed', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [availableImages]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Satellite Image Comparison</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-medium">Most Recent Image Date</label>
            <Input 
              type="date" 
              value={mostRecentImageDate}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Available Images</label>
            <Select
              value={selectedImageDate ?? "no-comparison"}
              onValueChange={handleImageSelection}
              disabled={isLoading}
            >
              <SelectTrigger className={isLoading ? "opacity-50" : ""}>
                <SelectValue placeholder="Select an image date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="no-comparison" value="no-comparison">
                  No Comparison
                </SelectItem>
                {availableImages.map((image) => (
                  <SelectItem key={image.date} value={image.date}>
                    {image.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {afterImage ? (
            <ImageComparisonSlider 
              beforeImage={mostRecentImageUrl} /* Use most recent image as the "before" image */
              afterImage={afterImage}
              beforeLabel={mostRecentImageDate}
              afterLabel={selectedImageDate ?? ""}
              className={isLoading ? 'opacity-50' : ''}
            />
          ) : (
            <div className="text-center">
              <img 
                src={mostRecentImageUrl} 
                alt="Most Recent Image" 
                className="w-full max-h-[600px] object-contain" 
              />
              <p className="mt-2 text-sm text-gray-600">{mostRecentImageDate}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Comparison Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Most Recent Image Details</h3>
              <p>Date: {mostRecentImageDate}</p>
              <p>Image Resolution: N/A</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Selected Image Details</h3>
              <p>Date: {selectedImageDate || 'N/A'}</p>
              <p>Image Resolution: N/A</p>
            </div>
          </div>
        </div>

        {(mostRecentImageFeatures || comparisonImageFeatures) && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Detected Features</h2>
              <Button 
                variant="default" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Generate PPT
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {mostRecentImageFeatures && (
                <div>
                  <h3 className="text-md font-semibold mb-3">
                    {mostRecentImageDate} Image Features
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Length</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.runwayLength} m</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Width</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.runwayWidth} m</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Aircraft</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.numberOfAircraft}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Constructions</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.constructions}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Roads</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.roads}</p>
                    </div>
                  </div>
                </div>
              )}
              {comparisonImageFeatures && (
                <div>
                  <h3 className="text-md font-semibold mb-3">
                    {selectedImageDate} Image Features
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Length</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.runwayLength} m</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Width</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.runwayWidth} m</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Aircraft</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.numberOfAircraft}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Constructions</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.constructions}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Roads</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.roads}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ImageComparisonPage;