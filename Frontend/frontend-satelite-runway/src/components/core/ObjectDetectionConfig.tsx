/**
 * Component for configuring object detection settings
 * filepath: frontend/src/components/core/ObjectDetectionConfig.tsx
 */
import React from 'react';
import { Checkbox } from '../ui/Checkbox';
import { useAnalysisSettings } from '../../contexts/AnalysisSettingsContext';

interface ObjectDetectionConfigProps {
  settings: {
    detectRunways: boolean;
    detectAircraft: boolean;
    detectHouses: boolean;
    detectRoads: boolean;
    detectWaterBodies: boolean;
  };
  onChange: (settings: Partial<{
    detectRunways: boolean;
    detectAircraft: boolean;
    detectHouses: boolean;
    detectRoads: boolean;
    detectWaterBodies: boolean;
  }>) => void;
}

const ObjectDetectionConfig: React.FC<ObjectDetectionConfigProps> = ({
  settings,
  onChange
}) => {
  const { resetToDefaults } = useAnalysisSettings();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({ [name]: checked });
  };

  const handleResetDefaults = () => {
    const defaultSettings = {
      detectRunways: true,
      detectAircraft: true,
      detectHouses: true,
      detectRoads: true,
      detectWaterBodies: true
    };
    
    onChange(defaultSettings);
  };

  return (
    <div className="object-detection-config p-4 border rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Object Detection Settings</h3>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-sm text-blue-600 hover:underline"
        >
          Reset to Defaults
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Select which objects you want to detect in the satellite imagery:
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <Checkbox
            id="detectRunways"
            name="detectRunways"
            checked={settings.detectRunways}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="detectRunways" className="ml-2 text-sm text-gray-700">
            Runways/Airstrips
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            id="detectAircraft"
            name="detectAircraft"
            checked={settings.detectAircraft}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="detectAircraft" className="ml-2 text-sm text-gray-700">
            Aircraft
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            id="detectHouses"
            name="detectHouses"
            checked={settings.detectHouses}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="detectHouses" className="ml-2 text-sm text-gray-700">
            Houses/Buildings
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            id="detectRoads"
            name="detectRoads"
            checked={settings.detectRoads}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="detectRoads" className="ml-2 text-sm text-gray-700">
            Roads
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            id="detectWaterBodies"
            name="detectWaterBodies"
            checked={settings.detectWaterBodies}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="detectWaterBodies" className="ml-2 text-sm text-gray-700">
            Water Bodies
          </label>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Note: Detecting more object types may increase processing time.
        </p>
      </div>
    </div>
  );
};

export default ObjectDetectionConfig;