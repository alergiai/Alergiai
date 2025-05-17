import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, History, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAllergens } from '@/hooks/useAllergens';
import { useHistory } from '@/hooks/useHistory';
import { ScanResult, CameraStatus, ScanAnalysisResponse } from '@/types';
import Header from '@/components/Header';
import CameraComponent from '@/components/Camera';
import ResultCard from '@/components/ResultCard';
import HistoryPage from './History';
import AllergensPage from './Allergens';
import { PageTransition, FadeIn, SlideUp, AnimatedButton } from '@/components/ui/animations';

const Home = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { getSelectedAllergens } = useAllergens();
  const { addToHistory } = useHistory();
  
  // Get the current path to set active tab
  const [location] = useLocation();
  const currentPath = location.split('/')[1]; // Get path segment after first slash
  const initialTab = currentPath === 'history' ? 'history' : 
                     currentPath === 'allergens' ? 'allergens' : 'scan';
  
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('inactive');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const selectedAllergens = getSelectedAllergens();
  
  // Handle camera capture
  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setCameraStatus('loading');
    
    try {
      // Base64 image data is already formatted as data:image/jpeg;base64,xyz...
      // Extract the base64 part without the prefix for the API request
      const base64Image = imageData.split('base64,')[1];
      
      if (!base64Image) {
        throw new Error('Invalid image format');
      }
      
      // Compress the image to reduce size if needed
      // We're sending as-is for now since we want quality for analysis
      
      // Send to API for analysis
      const response = await apiRequest('POST', '/api/analyze', {
        base64Image,
        allergens: selectedAllergens
      });
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error('Failed to analyze the image');
      }
      
      const analysisData: ScanAnalysisResponse = await response.json();
      console.log('Analysis response:', analysisData);
      
      // Create scan result
      const result: ScanResult = {
        id: '',  // Will be assigned when saved to history
        timestamp: Date.now(),
        imageUrl: imageData,
        base64Image,
        ...analysisData
      };
      
      setScanResult(result);
      
      // If isSafe is null, it means the image was unclear and needs to be retaken
      if (result.isSafe === null) {
        console.log('Image unclear - showing retry screen');
        setCameraStatus('retry');
      } else {
        setCameraStatus('result');
      }
      
    } catch (error) {
      console.error('Error during image analysis:', error);
      // For server errors, show retry screen instead of just error toast
      setScanResult(null);
      setCameraStatus('retry');
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please take a clearer photo.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle "Back to scan" button
  const handleBackToScan = () => {
    setScanResult(null);
    setCapturedImage(null);
    setCameraStatus('inactive');
  };
  
  // Handle saving result to history
  const handleSaveToHistory = () => {
    if (scanResult) {
      try {
        // Log for debugging
        console.log('Saving scan result to history:', scanResult);
        
        // Add to history and get back the result with generated ID
        const savedResult = addToHistory({...scanResult});
        
        // Debug - log the saved result with ID
        console.log('Saved result with ID:', savedResult.id);
        
        toast({
          title: 'Saved to History',
          description: 'The scan has been saved to your history'
        });
        
        // Navigate to the ScanResult detail page
        setLocation(`/history`);
      } catch (error) {
        console.error('Error saving to history:', error);
        toast({
          title: 'Error Saving',
          description: 'Could not save the scan to history',
          variant: 'destructive'
        });
      }
    } else {
      console.error('No scan result to save');
      toast({
        title: 'Error Saving',
        description: 'No scan result to save',
        variant: 'destructive'
      });
    }
  };
  
  // Change tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Content based on camera status
  const handleStartCamera = () => {
    setCameraStatus('active');
  };

  const renderScanContent = () => {
    if (cameraStatus === 'inactive') {
      return (
        <SlideUp className="flex-1 flex flex-col items-center justify-center p-6" duration={0.4}>
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Scan Food Packaging
            </h1>
            <p className="text-gray-600">
              Take a photo of ingredients list to check if a product is safe for you.
            </p>
          </div>
          
          <button 
            onClick={handleStartCamera}
            className="w-56 h-56 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-8 shadow-lg cursor-pointer relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <CameraIcon className="w-24 h-24 text-primary-500 mb-2" />
              <span className="text-primary-700 bg-white px-4 py-2 rounded-full shadow font-medium">
                Tap to scan
              </span>
            </div>
          </button>
          
          <AnimatedButton
            onClick={handleStartCamera}
            className="w-full bg-primary-500 text-white py-4 px-6 rounded-lg font-medium shadow-md hover:bg-primary-600 transition-colors text-center text-lg"
          >
            Start Camera
          </AnimatedButton>
        </SlideUp>
      );
    }
    
    if (cameraStatus === 'loading') {
      return (
        <SlideUp className="flex-1 flex flex-col items-center justify-center p-6" duration={0.5}>
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Analyzing Ingredients</h2>
          <p className="text-gray-600 text-center">Our AI is scanning the ingredients list and checking against your allergens...</p>
        </SlideUp>
      );
    }
    
    if (cameraStatus === 'retry' && scanResult) {
      return (
        <SlideUp className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50" duration={0.4}>
          <div className="w-20 h-20 rounded-full bg-warning-50 flex items-center justify-center mb-6 shadow-lg">
            <CameraIcon className="w-10 h-10 text-warning-500" />
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">Image Unclear</h2>
          <p className="text-gray-600 text-center mb-4">{scanResult.recommendation}</p>
          <p className="text-gray-600 text-center mb-6">{scanResult.alternativeSuggestion}</p>
          
          <div className="space-y-4 w-full">
            <AnimatedButton 
              onClick={() => setCameraStatus('active')}
              className="w-full py-6 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-all duration-200 text-lg font-medium"
            >
              <CameraIcon className="mr-2 h-5 w-5" /> Retake Photo
            </AnimatedButton>
            <AnimatedButton 
              onClick={handleBackToScan}
              className="w-full py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Cancel
            </AnimatedButton>
          </div>
        </SlideUp>
      );
    }
    
    if (cameraStatus === 'result' && scanResult) {
      return (
        <SlideUp duration={0.5}>
          <ResultCard 
            result={scanResult} 
            onBack={handleBackToScan} 
            onSave={handleSaveToHistory} 
          />
        </SlideUp>
      );
    }
    
    return (
      <CameraComponent 
        selectedAllergens={selectedAllergens}
        status={cameraStatus}
        onStatusChange={setCameraStatus}
        onCapture={handleCapture}
      />
    );
  };
  
  return (
    <PageTransition className="max-w-md mx-auto min-h-screen flex flex-col">
      <Header />
      
      <Tabs defaultValue="scan" value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="flex h-auto p-4 bg-transparent">
          <TabsTrigger 
            value="scan" 
            className="flex-1 py-3 data-[state=active]:font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all duration-200"
          >
            <div className="flex justify-center items-center gap-2">
              <CameraIcon className="h-4 w-4" />
              <span>Scan</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 py-3 data-[state=active]:font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all duration-200"
          >
            <div className="flex justify-center items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="allergens" 
            className="flex-1 py-3 data-[state=active]:font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all duration-200"
          >
            <div className="flex justify-center items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Allergens</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 flex flex-col">
          {activeTab === 'scan' && (
            <FadeIn duration={0.3} className="flex-1 flex flex-col">
              {renderScanContent()}
            </FadeIn>
          )}
          {activeTab === 'history' && (
            <FadeIn duration={0.3} className="flex-1">
              <HistoryPage />
            </FadeIn>
          )}
          {activeTab === 'allergens' && (
            <FadeIn duration={0.3} className="flex-1">
              <AllergensPage />
            </FadeIn>
          )}
        </div>
      </Tabs>
    </PageTransition>
  );
};

export default Home;
