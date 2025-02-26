/**
 * Component for inputting geographic coordinates (latitude/longitude)
 * filepath: frontend/src/components/core/CoordinateInput.tsx
 */
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CoordinateInputProps {
  onSubmit: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  onSubmit,
  initialLatitude = 0,
  initialLongitude = 0
}) => {
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  // Validate coordinates
  const validateCoordinates = (): boolean => {
    setError(null);
    
    // Check if inputs are numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Both latitude and longitude must be valid numbers');
      return false;
    }
    
    // Validate latitude range
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees');
      return false;
    }
    
    // Validate longitude range
    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCoordinates()) {
      onSubmit(parseFloat(latitude), parseFloat(longitude));
    }
  };

  // Handle when user clicks the "Use Current Location" button
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
    }
  };
  
  return (
    <div className="coordinate-input-container p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Enter Coordinates</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude (-90 to 90)
            </label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., 37.7749"
              required
            />
          </div>
          
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude (-180 to 180)
            </label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., -122.4194"
              required
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleUseCurrentLocation}
          >
            Use Current Location
          </Button>
          
          <Button type="submit">Set Coordinates</Button>
        </div>
      </form>
    </div>
  );
};

export default CoordinateInput;