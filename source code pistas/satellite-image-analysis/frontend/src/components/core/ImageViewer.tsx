/**
 * Component for viewing and interacting with satellite imagery
 * filepath: frontend/src/components/core/ImageViewer.tsx
 */
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token from environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface ImageViewerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onMapLoaded?: () => void;
  onMapClick?: (event: mapboxgl.MapMouseEvent) => void;
  geojsonData?: GeoJSON.FeatureCollection;
}

interface DetectedFeature {
  id: string;
  type: 'runway' | 'aircraft' | 'house' | 'road' | 'water';
  confidence: number;
  geometry: GeoJSON.Geometry;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  latitude,
  longitude,
  zoom = 15,
  onMapLoaded,
  onMapClick,
  geojsonData
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapboxgl.supported()) {
      setError('Your browser does not support Mapbox GL');
      return;
    }

    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9', // Satellite imagery style
        center: [longitude, latitude],
        zoom: zoom,
        attributionControl: true,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl());

      // Handle map load event
      map.current.on('load', () => {
        setMapLoaded(true);
        if (onMapLoaded) onMapLoaded();
        
        // Add GeoJSON data source if provided
        if (geojsonData && map.current) {
          // Add source for detected features
          map.current.addSource('detected-features', {
            type: 'geojson',
            data: geojsonData
          });
          
          // Add layers for different feature types with appropriate styling
          addFeatureLayers(map.current);
        }
      });

      // Handle map click event
      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick(e);
        });
      }

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      setError('Failed to initialize map');
      console.error('Map initialization error:', err);
    }
  }, [latitude, longitude, zoom, onMapLoaded, onMapClick]);

  // Update map data when geojsonData changes
  useEffect(() => {
    if (mapLoaded && map.current && geojsonData) {
      const source = map.current.getSource('detected-features');
      
      if (source) {
        (source as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        // Source doesn't exist yet, add it
        map.current.addSource('detected-features', {
          type: 'geojson',
          data: geojsonData
        });
        
        // Add layers for different feature types
        addFeatureLayers(map.current);
      }
    }
  }, [geojsonData, mapLoaded]);

  // Helper function to add feature layers with appropriate styling
  const addFeatureLayers = (map: mapboxgl.Map) => {
    // Runway layer
    map.addLayer({
      id: 'runways',
      type: 'line',
      source: 'detected-features',
      filter: ['==', ['get', 'type'], 'runway'],
      paint: {
        'line-color': '#FF8C00',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Aircraft layer
    map.addLayer({
      id: 'aircraft',
      type: 'circle',
      source: 'detected-features',
      filter: ['==', ['get', 'type'], 'aircraft'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#FF0000',
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#FFFFFF'
      }
    });

    // Houses layer
    map.addLayer({
      id: 'houses',
      type: 'circle',
      source: 'detected-features',
      filter: ['==', ['get', 'type'], 'house'],
      paint: {
        'circle-radius': 4,
        'circle-color': '#32CD32',
        'circle-opacity': 0.7,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#FFFFFF'
      }
    });

    // Roads layer
    map.addLayer({
      id: 'roads',
      type: 'line',
      source: 'detected-features',
      filter: ['==', ['get', 'type'], 'road'],
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    // Water bodies layer
    map.addLayer({
      id: 'water',
      type: 'fill',
      source: 'detected-features',
      filter: ['==', ['get', 'type'], 'water'],
      paint: {
        'fill-color': '#4682B4',
        'fill-opacity': 0.6,
        'fill-outline-color': '#0000FF'
      }
    });

    // Add hover interaction for all features
    const featureTypes = ['runways', 'aircraft', 'houses', 'roads', 'water'];
    
    featureTypes.forEach(type => {
      // Change cursor on hover
      map.on('mouseenter', type, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', type, () => {
        map.getCanvas().style.cursor = '';
      });
      
      // Show popup on click
      map.on('click', type, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = e.lngLat;
          const properties = feature.properties;
          
          if (properties) {
            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div>
                  <strong>Type:</strong> ${properties.type}<br>
                  <strong>Confidence:</strong> ${(properties.confidence * 100).toFixed(1)}%
                </div>
              `)
              .addTo(map);
          }
        }
      });
    });
  };

  return (
    <div className="image-viewer-container relative">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md absolute top-0 left-0 z-10">
          Error: {error}
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="map-container w-full h-[500px] rounded-lg overflow-hidden"
      />
      
      {!mapLoaded && !error && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100 bg-opacity-70 z-10">
          <div className="animate-pulse text-gray-600 font-medium">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;