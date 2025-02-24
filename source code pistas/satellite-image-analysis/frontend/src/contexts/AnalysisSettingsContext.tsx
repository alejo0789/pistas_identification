/**
 * Context provider for analysis settings state management
 * filepath: frontend/src/contexts/AnalysisSettingsContext.tsx
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnalysisSettings {
  detectRunways: boolean;
  detectAircraft: boolean;
  detectHouses: boolean;
  detectRoads: boolean;
  detectWaterBodies: boolean;
}

interface AnalysisSettingsContextType {
  settings: AnalysisSettings;
  updateSettings: (newSettings: Partial<AnalysisSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AnalysisSettings = {
  detectRunways: true,
  detectAircraft: true,
  detectHouses: true,
  detectRoads: true,
  detectWaterBodies: true
};

const AnalysisSettingsContext = createContext<AnalysisSettingsContextType | undefined>(undefined);

export const useAnalysisSettings = () => {
  const context = useContext(AnalysisSettingsContext);
  if (context === undefined) {
    throw new Error('useAnalysisSettings must be used within an AnalysisSettingsProvider');
  }
  return context;
};

interface AnalysisSettingsProviderProps {
  children: ReactNode;
}

export const AnalysisSettingsProvider: React.FC<AnalysisSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AnalysisSettings>(defaultSettings);

  // TODO: Implement loading saved settings from localStorage or user profile

  const updateSettings = (newSettings: Partial<AnalysisSettings>) => {
    setSettings({ ...settings, ...newSettings });
    // TODO: Implement saving settings to localStorage or user profile
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    // TODO: Implement clearing saved settings
  };

  const value = {
    settings,
    updateSettings,
    resetToDefaults
  };

  return (
    <AnalysisSettingsContext.Provider value={value}>
      {children}
    </AnalysisSettingsContext.Provider>
  );
};