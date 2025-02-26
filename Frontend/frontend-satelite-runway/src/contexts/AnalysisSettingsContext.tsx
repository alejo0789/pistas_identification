/**
 * Context provider for analysis settings state management
 * filepath: frontend/src/contexts/AnalysisSettingsContext.tsx
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface AnalysisSettings {
  detectRunways: boolean;
  detectAircraft: boolean;
  detectHouses: boolean;
  detectRoads: boolean;
  detectWaterBodies: boolean;
}

interface AnalysisSettingsContextType {
  settings: AnalysisSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<AnalysisSettings>) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load user settings on mount or when user changes
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated || !user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);
        const response = await api.get(`/users/${user.id}/settings`);
        
        // Convert from snake_case to camelCase
        const fetchedSettings = response.data.settings;
        setSettings({
          detectRunways: fetchedSettings.detect_runways,
          detectAircraft: fetchedSettings.detect_aircraft,
          detectHouses: fetchedSettings.detect_houses,
          detectRoads: fetchedSettings.detect_roads,
          detectWaterBodies: fetchedSettings.detect_water_bodies
        });
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load analysis settings');
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, isAuthenticated]);

  // Update settings
  const updateSettings = async (newSettings: Partial<AnalysisSettings>) => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to update settings');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Merge current settings with new settings
      const updatedSettings = { ...settings, ...newSettings };
      
      // Convert from camelCase to snake_case for API
      const payload = {
        detect_runways: updatedSettings.detectRunways,
        detect_aircraft: updatedSettings.detectAircraft,
        detect_houses: updatedSettings.detectHouses,
        detect_roads: updatedSettings.detectRoads,
        detect_water_bodies: updatedSettings.detectWaterBodies
      };

      await api.put(`/users/${user.id}/settings`, payload);
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update analysis settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Value object to be provided by the context
  const value = {
    settings,
    isLoading,
    error,
    updateSettings
  };

  return (
    <AnalysisSettingsContext.Provider value={value}>
      {children}
    </AnalysisSettingsContext.Provider>
  );
};