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
  initialLatitude,
  initialLongitude
}) => {
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement validation for latitude (-90 to 90) and longitude (-180 to 180)
  
  // TODO: Implement submission handler
  
  return (
    <div className="coordinate-input-container">
      <h3>Enter Coordinates</h3>
      
      {/* TODO: Implement form with validation and submission */}
      
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default CoordinateInput;