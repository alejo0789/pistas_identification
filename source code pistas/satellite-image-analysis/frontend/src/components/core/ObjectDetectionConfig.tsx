/**
 * Component for configuring object detection settings
 * filepath: frontend/src/components/core/ObjectDetectionConfig.tsx
 */
import React from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { useAnalysisSettings } from '../../contexts/AnalysisSettingsContext';

interface ObjectDetectionConfigProps {
  onSave?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface DetectionOption {
  id: keyof Omit<AnalysisSettings, 'id'>;
  label: string;
  description: string;
  iconClass: string;
}

// Assume AnalysisSettings type matches the context
interface AnalysisSettings {
  detectRunways: boolean;
  detectAircraft: boolean;
  detectHouses: boolean;
  detectRoads: boolean;
  detectWaterBodies: boolean;
}

const ObjectDetectionConfig: React.FC<ObjectDetectionConfigProps> = ({
  onSave,
  onCancel,
  isModal = false
}) => {
  const { settings, updateSettings, resetToDefaults } = useAnalysisSettings();

  // Detection options with their descriptions and icons
  const detectionOptions: DetectionOption[] = [
    {
      id: 'detectRunways',
      label: 'Runways/Airstrips',
      description: 'Detect runways, airstrips, and landing pads',
      iconClass: 'fas fa-plane-departure'
    },
    {
      id: 'detectAircraft',
      label: 'Aircraft',
      description: 'Detect aircraft of various sizes',
      iconClass: 'fas fa-plane'
    },
    {
      id: 'detectHouses',
      label: 'Houses/Buildings',
      description: 'Detect houses and various building structures',
      iconClass: 'fas fa-home'
    },
    {
      id: 'detectRoads',
      label: 'Roads',
      description: 'Detect roads, paths, and transportation infrastructure',
      iconClass: 'fas fa-road'
    },
    {
      id: 'detectWaterBodies',
      label: 'Water Bodies',
      description: 'Detect lakes, rivers, and other water formations',
      iconClass: 'fas fa-water'
    }
  ];

  // Handle checkbox change
  const handleCheckboxChange = (id: keyof AnalysisSettings) => {
    updateSettings({ [id]: !settings[id] });
  };

  // Handle save button click
  const handleSave = () => {
    if (onSave) onSave();
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className={`object-detection-config ${isModal ? 'p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg' : ''}`}>
      <h3 className="text-lg font-medium mb-4">Object Detection Settings</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Select the objects you want to detect in the satellite imagery:
        </p>
        
        <div className="space-y-3">
          {detectionOptions.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className="flex items-center h-5">
                <Checkbox
                  id={option.id}
                  checked={settings[option.id]}
                  onChange={() => handleCheckboxChange(option.id)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={option.id} className="font-medium text-gray-700 cursor-pointer">
                  <i className={`${option.iconClass} mr-1`}></i> {option.label}
                </label>
                <p className="text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={resetToDefaults}
          className="text-sm"
        >
          Reset to Defaults
        </Button>
        
        {(onSave || onCancel) && (
          <div className="space-x-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
                className="text-sm"
              >
                Cancel
              </Button>
            )}
            
            {onSave && (
              <Button 
                type="button"
                onClick={handleSave}
                className="text-sm"
              >
                Save Settings
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetectionConfig;