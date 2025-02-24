/**
 * Component for inputting geographic coordinates (latitude/longitude)
 * filepath: frontend/src/components/core/CoordinateInput.tsx
 */
import React, { useState, useEffect } from 'react';
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
    // Reset previous error
    setError(null);

    // Check if inputs are not empty
    if (!latitude.trim() || !longitude.trim()) {
      setError('Both latitude and longitude are required');
      return false;
    }

    // Parse inputs to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Check if inputs are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      setError('Coordinates must be valid numbers');
      return false;
    }

    // Check latitude range (-90 to 90)
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees');
      return false;
    }

    // Check longitude range (-180 to 180)
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

  return (
    <div className="coordinate-input-container bg-white shadow-md rounded-lg p-4 w-full max-w-md">
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