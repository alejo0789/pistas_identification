/**
 * Service for analysis-related API calls
 * filepath: frontend/src/services/analysisService.ts
 */
import api from './api';

export interface AnalysisInput {
  name: string;
  latitude: number;
  longitude: number;
  detectRunways: boolean;
  detectAircraft: boolean;
  detectHouses: boolean;
  detectRoads: boolean;
  detectWaterBodies: boolean;
}

export interface Analysis {
  id: number;
  user_id: number;
  name: string;
  latitude: number;
  longitude: number;
  analysis_date: string;
  image_date: string | null;
  runway_detected: boolean;
  aircraft_count: number;
  house_count: number;
  road_count: number;
  water_body_count: number;
  created_at: string;
  updated_at?: string;
}

export interface AnalysisResponse {
  message?: string;
  analysis: Analysis;
}

export interface AnalysesResponse {
  analyses: Analysis[];
  total: number;
  pages: number;
  page: number;
  per_page: number;
}

const analysisService = {
  // Get all analyses for the current user
  getAnalyses: async (page = 1, perPage = 10, search = ''): Promise<AnalysesResponse> => {
    const response = await api.get<AnalysesResponse>('/analysis', {
      params: { page, per_page: perPage, search }
    });
    return response.data;
  },

  // Get a specific analysis by ID
  getAnalysis: async (id: number): Promise<Analysis> => {
    const response = await api.get<{ analysis: Analysis }>(`/analysis/${id}`);
    return response.data.analysis;
  },

  // Create a new analysis
  createAnalysis: async (input: AnalysisInput): Promise<Analysis> => {
    // Convert frontend camelCase to backend snake_case
    const payload = {
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      detect_runways: input.detectRunways,
      detect_aircraft: input.detectAircraft,
      detect_houses: input.detectHouses,
      detect_roads: input.detectRoads,
      detect_water_bodies: input.detectWaterBodies
    };
    
    const response = await api.post<AnalysisResponse>('/analysis', payload);
    return response.data.analysis;
  },

  // Delete an analysis
  deleteAnalysis: async (id: number): Promise<void> => {
    await api.delete(`/analysis/${id}`);
  },

  // Process recent satellite image
  processRecentImage: async (analysisId: number): Promise<Analysis> => {
    const formData = new FormData();
    formData.append('analysis_id', analysisId.toString());
    
    const response = await api.post<AnalysisResponse>('/process/recent', formData);
    return response.data.analysis;
  },

  // Upload and process a custom satellite image
  uploadImage: async (analysisId: number, file: File, imageDate?: string): Promise<Analysis> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysis_id', analysisId.toString());
    
    if (imageDate) {
      formData.append('image_date', imageDate);
    }
    
    const response = await api.post<AnalysisResponse>('/process/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.analysis;
  },

  // Process temporal comparison
  processTemporalComparison: async (analysisId: number, startDate: string, endDate: string): Promise<any> => {
    const response = await api.post('/process/temporal', {
      analysis_id: analysisId,
      start_date: startDate,
      end_date: endDate
    });
    
    return response.data;
  },

  // Get GeoJSON data for an analysis
  getGeojsonData: async (analysisId: number): Promise<any> => {
    const response = await api.get(`/analysis/${analysisId}/geojson`);
    return response.data;
  },

  // Generate and download PPT report
  generateReport: async (analysisId: number): Promise<void> => {
    const response = await api.get(`/reports/${analysisId}`, {
      responseType: 'blob'
    });
    
    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Analysis_Report_${analysisId}.pptx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Get a report preview
  getReportPreview: async (analysisId: number): Promise<any> => {
    const response = await api.get(`/reports/${analysisId}/preview`);
    return response.data.preview;
  }
};

export default analysisService;