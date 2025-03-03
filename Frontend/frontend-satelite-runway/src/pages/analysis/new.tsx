/**
 * New Analysis page component for starting a new satellite image analysis
 * filepath: frontend/src/pages/analysis/new.tsx
 */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import CoordinateInput from '../../components/core/CoordinateInput';
import { useAnalysisSettings } from '../../contexts/AnalysisSettingsContext';
import analysisService, { AnalysisInput } from '../../services/analysisService';

// Validation schema for the form
const AnalysisSchema = Yup.object().shape({
  name: Yup.string()
    .required('Analysis name is required')
    .min(3, 'Name too short')
    .max(100, 'Name too long'),
  latitude: Yup.number()
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: Yup.number()
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  detectRunways: Yup.boolean(),
  detectAircraft: Yup.boolean(),
  detectHouses: Yup.boolean(),
  detectRoads: Yup.boolean(),
  detectWaterBodies: Yup.boolean(),
});

const NewAnalysisPage: React.FC = () => {
  const router = useRouter();
  const { settings } = useAnalysisSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial values for the form
  const initialValues: AnalysisInput = {
    name: '',
    latitude: 0,
    longitude: 0,
    detectRunways: settings?.detectRunways ?? true,
    detectAircraft: settings?.detectAircraft ?? true,
    detectHouses: settings?.detectHouses ?? true,
    detectRoads: settings?.detectRoads ?? true,
    detectWaterBodies: settings?.detectWaterBodies ?? true,
  };

  // Handle form submission
  const handleSubmit = async (values: AnalysisInput) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the analysis
      const analysis = await analysisService.createAnalysis(values);
      
      // Show loading message or spinner for 1 second to simulate processing
      setTimeout(() => {
        // Navigate to the analysis comparison page instead of details page
        router.push(`/analysis/compare?id=${analysis.id}`);
      }, 1000);
    } catch (err: any) {
      console.error('Error creating analysis:', err);
      setError(err?.message || 'Failed to create analysis. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle coordinates update from CoordinateInput component
  const handleCoordinatesUpdate = (latitude: number, longitude: number, setFieldValue: any) => {
    setFieldValue('latitude', latitude);
    setFieldValue('longitude', longitude);
  };

  return (
    <MainLayout>
      <div className="new-analysis-container max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Satellite Image Analysis</h1>
        
        <Formik
          initialValues={initialValues}
          validationSchema={AnalysisSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className={`w-full p-2 border rounded-md ${
                    errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter a name for this analysis"
                />
                <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="p-4 border rounded-md bg-gray-50">
                <h2 className="text-lg font-medium mb-4">Location Coordinates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <Field
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      className={`w-full p-2 border rounded-md ${
                        errors.latitude && touched.latitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="latitude" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <Field
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      className={`w-full p-2 border rounded-md ${
                        errors.longitude && touched.longitude ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="longitude" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Tip: You can use coordinates in decimal format (e.g., 37.7749, -122.4194)
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-md bg-gray-50">
                <h2 className="text-lg font-medium mb-4">Detection Settings</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select which objects you want to detect in the satellite imagery:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Field 
                      type="checkbox" 
                      id="detectRunways" 
                      name="detectRunways"
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="detectRunways" className="ml-2 text-sm text-gray-700">
                      Runways/Airstrips
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field 
                      type="checkbox" 
                      id="detectAircraft" 
                      name="detectAircraft"
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="detectAircraft" className="ml-2 text-sm text-gray-700">
                      Aircraft
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field 
                      type="checkbox" 
                      id="detectHouses" 
                      name="detectHouses"
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="detectHouses" className="ml-2 text-sm text-gray-700">
                      Houses/Buildings
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field 
                      type="checkbox" 
                      id="detectRoads" 
                      name="detectRoads"
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="detectRoads" className="ml-2 text-sm text-gray-700">
                      Roads
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field 
                      type="checkbox" 
                      id="detectWaterBodies" 
                      name="detectWaterBodies"
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="detectWaterBodies" className="ml-2 text-sm text-gray-700">
                      Water Bodies
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating & Processing...' : 'Create Analysis'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </MainLayout>
  );
};

export default NewAnalysisPage;