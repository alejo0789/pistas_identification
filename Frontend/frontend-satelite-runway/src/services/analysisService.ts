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

export interface AnalysisImage {
  id: number;
  analysis_id: number;
  image_date: string | null;
  processing_date: string;
  image_path: string | null;
  runway_detected: boolean;
  runway_length: number | null;
  runway_width: number | null;
  aircraft_count: number;
  house_count: number;
  road_count: number;
  water_body_count: number;
  status: string;
  source_type: string;
  created_at: string;
}

export interface Analysis {
  id: number;
  user_id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at?: string;
  images: AnalysisImage[];
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

export interface ImageResponse {
  message?: string;
  image: AnalysisImage;
}

export interface ImagesResponse {
  images: AnalysisImage[];
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

  // Get all images for an analysis
  getAnalysisImages: async (analysisId: number): Promise<AnalysisImage[]> => {
    const response = await api.get<ImagesResponse>(`/analysis/${analysisId}/images`);
    return response.data.images;
  },

  // Get a specific image for an analysis
  getAnalysisImage: async (analysisId: number, imageId: number): Promise<AnalysisImage> => {
    const response = await api.get<ImageResponse>(`/analysis/${analysisId}/images/${imageId}`);
    return response.data.image;
  },

  // Add a new image to an analysis
  addAnalysisImage: async (analysisId: number, imageDate?: string): Promise<AnalysisImage> => {
    const payload: Record<string, any> = { source_type: 'api' };
    if (imageDate) {
      payload.image_date = imageDate;
    }
    
    const response = await api.post<ImageResponse>(`/analysis/${analysisId}/images`, payload);
    return response.data.image;
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
  },

  // Helper functions for working with analyses and images
  getLatestImage: (analysis: Analysis): AnalysisImage | null => {
    if (!analysis.images || analysis.images.length === 0) {
      return null;
    }
    
    // Sort images by date (newest first) and return the first one
    return [...analysis.images].sort((a, b) => {
      const dateA = a.image_date ? new Date(a.image_date).getTime() : 0;
      const dateB = b.image_date ? new Date(b.image_date).getTime() : 0;
      return dateB - dateA;
    })[0];
  }
};

export default analysisService;