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
  initialLatitude,
  initialLongitude
}) => {
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  // Validate coordinates
  const validateCoordinates = (): boolean => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Latitude and longitude must be numbers');
      return false;
    }
    
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees');
      return false;
    }
    
    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCoordinates()) {
      onSubmit(parseFloat(latitude), parseFloat(longitude));
    }
  };
  
  return (
    <div className="coordinate-input-container p-4 bg-white rounded shadow-md">
      <h3 className="text-lg font-medium mb-4">Enter Coordinates</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <Input
            id="latitude"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="-90 to 90"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <Input
            id="longitude"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-180 to 180"
            className="w-full"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full">
          Submit Coordinates
        </Button>
      </form>
    </div>
  );
};

export default CoordinateInput;