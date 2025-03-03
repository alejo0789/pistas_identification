import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import ImageComparisonSlider from '../../components/core/ImageComparisonSlider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import analysisService, { Analysis, AnalysisImage } from '../../services/analysisService';

interface AnalysisFeatures {
  runwayLength: number | null;
  runwayWidth: number | null;
  numberOfAircraft: number;
  constructions: number;
  roads: number;
}

interface ImageData {
  url: string;
  date: string;
  detectedFeatures: AnalysisFeatures;
}

const ImageComparisonPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // States for current and comparison data
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for current image
  const [currentImage, setCurrentImage] = useState<AnalysisImage | null>(null);
  const [mostRecentImageDate, setMostRecentImageDate] = useState<string>('');
  const [mostRecentImageUrl, setMostRecentImageUrl] = useState<string>('');

  // States for comparison
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [selectedImageDate, setSelectedImageDate] = useState<string | null>(null);
  const [mostRecentImageFeatures, setMostRecentImageFeatures] = useState<AnalysisFeatures | null>(null);
  const [comparisonImageFeatures, setComparisonImageFeatures] = useState<AnalysisFeatures | null>(null);
  const [selectedComparisonImage, setSelectedComparisonImage] = useState<AnalysisImage | null>(null);

  // List of available images (will be populated from API)
  const [availableImages, setAvailableImages] = useState<{date: string, url: string, image: AnalysisImage}[]>([]);

  // Helper function to convert database format to UI format
  const convertToFeatures = (image: AnalysisImage): AnalysisFeatures => {
    return {
      runwayLength: image.runway_length,
      runwayWidth: image.runway_width,
      numberOfAircraft: image.aircraft_count || 0,
      constructions: image.house_count || 0,
      roads: image.road_count || 0
    };
  };

  // Fetch analysis data on component mount
  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const analysisData = await analysisService.getAnalysis(Number(id));
        setCurrentAnalysis(analysisData);
        
        // Get the latest image
        if (analysisData.images && analysisData.images.length > 0) {
          // Sort images by date (newest first)
          const sortedImages = [...analysisData.images].sort((a, b) => {
            const dateA = a.image_date ? new Date(a.image_date).getTime() : 0;
            const dateB = b.image_date ? new Date(b.image_date).getTime() : 0;
            return dateB - dateA;
          });
          
          const latestImage = sortedImages[0];
          setCurrentImage(latestImage);
          
          // Set the most recent image date
          const imageDate = latestImage.image_date 
            ? new Date(latestImage.image_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          setMostRecentImageDate(imageDate);
          
          // In a real app, this would be the actual image URL from your backend
          // For now, we'll use a placeholder
          setMostRecentImageUrl('/placeholder-december.jpg');
          
          // Convert analysis data to features
          setMostRecentImageFeatures(convertToFeatures(latestImage));
          
          // Check if there are older images for comparison
          if (sortedImages.length > 1) {
            const historicalImages = sortedImages.slice(1).map(img => ({
              date: img.image_date ? new Date(img.image_date).toISOString().split('T')[0] : 'Unknown Date',
              url: '/placeholder-june.jpg', // Placeholder - would be real URL in production
              image: img
            }));
            
            setAvailableImages(historicalImages);
          } else {
            // If no historical images exist, create mock data for demo purposes
            // In production, you would allow adding new images instead
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
            
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
            
            // Create mock historical images
            // In a real app, these would come from your backend
            const mockHistoricalImages = [
              { 
                date: sixMonthsAgoStr, 
                url: '/placeholder-june.jpg',
                image: {
                  id: -1, // Mock ID
                  analysis_id: Number(id),
                  image_date: sixMonthsAgoStr,
                  processing_date: sixMonthsAgoStr,
                  runway_detected: true,
                  runway_length: 3050,
                  runway_width: 42,
                  aircraft_count: 4,
                  house_count: 8,
                  road_count: 2,
                  water_body_count: 1,
                  status: 'completed',
                  source_type: 'historical',
                  created_at: sixMonthsAgoStr,
                  image_path: null
                }
              },
              { 
                date: threeMonthsAgoStr, 
                url: '/placeholder-september.jpg',
                image: {
                  id: -2, // Mock ID
                  analysis_id: Number(id),
                  image_date: threeMonthsAgoStr,
                  processing_date: threeMonthsAgoStr,
                  runway_detected: true,
                  runway_length: 3100,
                  runway_width: 44,
                  aircraft_count: 5,
                  house_count: 10,
                  road_count: 2,
                  water_body_count: 1,
                  status: 'completed',
                  source_type: 'historical',
                  created_at: threeMonthsAgoStr,
                  image_path: null
                }
              }
            ];
            
            setAvailableImages(mockHistoricalImages);
          }
        } else {
          setError('No images found for this analysis');
        }
        
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, [id]);

  // Handle image selection
  const handleImageSelection = useCallback(async (value: string) => {
    if (value === 'no-comparison') {
      // Ensure only the most recent image is displayed
      setAfterImage(null);
      setSelectedImageDate(null);
      setComparisonImageFeatures(null);
      setSelectedComparisonImage(null);
      return;
    }
  
    const selectedImage = availableImages.find(img => img.date === value);
    if (selectedImage) {
      setIsLoading(true);
      try {
        // In a real app, you might need to fetch more details about this image
        // For now, we'll use what we already have
        setSelectedImageDate(value);
        setAfterImage(selectedImage.url);
        setComparisonImageFeatures(convertToFeatures(selectedImage.image));
        setSelectedComparisonImage(selectedImage.image);
      } catch (error) {
        console.error('Image comparison failed', error);
        setError('Failed to load comparison image');
      } finally {
        setIsLoading(false);
      }
    }
  }, [availableImages]);

  // Handle adding a new image for comparison
  const handleAddNewImage = useCallback(async () => {
    if (!currentAnalysis) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to add a new image to the analysis
      const newImage = await analysisService.addAnalysisImage(currentAnalysis.id);
      
      // Show a success message
      alert('New image added successfully! In a real app, this would trigger processing.');
      
      // Reload the page to see the new image
      // In a real app, you'd update the state instead
      router.reload();
    } catch (err) {
      console.error('Error adding new image:', err);
      setError('Failed to add new image');
    } finally {
      setIsLoading(false);
    }
  }, [currentAnalysis, router]);

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!currentAnalysis) return;
    
    try {
      setIsLoading(true);
      await analysisService.generateReport(currentAnalysis.id);
      setIsLoading(false);
      alert('Report generated successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
      setIsLoading(false);
    }
  };

  // Show loading state while initial data is being fetched
  if (isLoading && !currentAnalysis) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading analysis data...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Satellite Image Analysis</h1>
        {currentAnalysis && (
          <h2 className="text-xl mb-6">{currentAnalysis.name}</h2>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-medium">Current Analysis Date</label>
            <Input 
              type="date" 
              value={mostRecentImageDate}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Compare with Historical Image</label>
            <div className="flex gap-2">
              <div className="flex-grow">
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
              <Button
                onClick={handleAddNewImage}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                Comparar
              </Button>
            </div>
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
              beforeImage={mostRecentImageUrl}
              afterImage={afterImage}
              beforeLabel={mostRecentImageDate}
              afterLabel={selectedImageDate ?? ""}
              className={isLoading ? 'opacity-50' : ''}
            />
          ) : (
            <div className="text-center">
              <img 
                src={mostRecentImageUrl} 
                alt="Current Analysis" 
                className="w-full max-h-[600px] object-contain border rounded-lg shadow-md" 
              />
              <p className="mt-2 text-sm text-gray-600">{mostRecentImageDate}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Analysis Information</h2>
          {currentAnalysis && currentImage && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Coordenadas:</strong> {currentAnalysis.latitude}, {currentAnalysis.longitude}</p>
                <p><strong>Lugar:</strong> {currentAnalysis.id}</p>
                <p><strong>Fecha del Análisis:</strong> {new Date(currentAnalysis.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p><strong>Pista detectada</strong> {currentImage.runway_detected ? 'Yes' : 'No'}</p>
                
                <p><strong>Fecha de Imagen reciente:</strong> {currentImage.image_date ? new Date(currentImage.image_date).toLocaleDateString() : 'N/A'}</p>

           
              </div>
            </div>
          )}
        </div>

        {(mostRecentImageFeatures || comparisonImageFeatures) && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cáracteristicas Detectadas:</h2>
              <Button 
                variant="default" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Generar Reporte PPT'}
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {mostRecentImageFeatures && (
                <div>
                  <h3 className="text-md font-semibold mb-3">
                    {mostRecentImageDate} Imágen 1:
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Length</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.runwayLength || 'N/A'} {mostRecentImageFeatures.runwayLength ? 'm' : ''}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Width</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.runwayWidth || 'N/A'} {mostRecentImageFeatures.runwayWidth ? 'm' : ''}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Aircraft</h3>
                      <p className="text-lg font-bold">{mostRecentImageFeatures.numberOfAircraft}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Buildings</h3>
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
                    {selectedImageDate} Imágen 2:
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Length</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.runwayLength || 'N/A'} {comparisonImageFeatures.runwayLength ? 'm' : ''}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Runway Width</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.runwayWidth || 'N/A'} {comparisonImageFeatures.runwayWidth ? 'm' : ''}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Aircraft</h3>
                      <p className="text-lg font-bold">{comparisonImageFeatures.numberOfAircraft}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-1">Buildings</h3>
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
            
            {selectedComparisonImage && currentImage && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Cambios desde el {selectedImageDate}</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-1">Runway Length</h3>
                    {currentImage.runway_length && selectedComparisonImage.runway_length ? (
                      <p className={`text-lg font-bold ${currentImage.runway_length > selectedComparisonImage.runway_length ? 'text-green-600' : currentImage.runway_length < selectedComparisonImage.runway_length ? 'text-red-600' : ''}`}>
                        {(currentImage.runway_length - selectedComparisonImage.runway_length).toFixed(1)} m
                      </p>
                    ) : (
                      <p className="text-lg">N/A</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-1">Runway Width</h3>
                    {currentImage.runway_width && selectedComparisonImage.runway_width ? (
                      <p className={`text-lg font-bold ${currentImage.runway_width > selectedComparisonImage.runway_width ? 'text-green-600' : currentImage.runway_width < selectedComparisonImage.runway_width ? 'text-red-600' : ''}`}>
                        {(currentImage.runway_width - selectedComparisonImage.runway_width).toFixed(1)} m
                      </p>
                    ) : (
                      <p className="text-lg">N/A</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-1">Aircraft</h3>
                    <p className={`text-lg font-bold ${currentImage.aircraft_count > selectedComparisonImage.aircraft_count ? 'text-green-600' : currentImage.aircraft_count < selectedComparisonImage.aircraft_count ? 'text-red-600' : ''}`}>
                      {currentImage.aircraft_count - selectedComparisonImage.aircraft_count}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-1">Buildings</h3>
                    <p className={`text-lg font-bold ${currentImage.house_count > selectedComparisonImage.house_count ? 'text-green-600' : currentImage.house_count < selectedComparisonImage.house_count ? 'text-red-600' : ''}`}>
                      {currentImage.house_count - selectedComparisonImage.house_count}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-1">Roads</h3>
                    <p className={`text-lg font-bold ${currentImage.road_count > selectedComparisonImage.road_count ? 'text-green-600' : currentImage.road_count < selectedComparisonImage.road_count ? 'text-red-600' : ''}`}>
                      {currentImage.road_count - selectedComparisonImage.road_count}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ImageComparisonPage;