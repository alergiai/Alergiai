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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-3 text-gray-900">
              Scan Food Packaging
            </h1>
            <p className="text-gray-600">
              Take a photo of ingredients list to check if a product is safe for you.
            </p>
          </div>
          
          <button 
            onClick={handleStartCamera}
            className="w-44 h-44 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg cursor-pointer relative group"
          >
            <div className="w-36 h-36 rounded-full border-[3px] border-primary-200 flex items-center justify-center">
              <CameraIcon className="w-20 h-20 text-primary-600" />
            </div>
            <div className="absolute bottom-0 transform translate-y-1/2">
              <span className="bg-white px-4 py-2 rounded-full shadow-md font-medium text-gray-800 border border-gray-100">
                Tap to scan
              </span>
            </div>
          </button>
          
          <div className="w-full">
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
              <AnimatedButton
                onClick={handleStartCamera}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-medium shadow-md transition-colors text-center text-lg"
              >
                Start Camera
              </AnimatedButton>
            </div>
          </div>
        </SlideUp>
      );
    }
    
    if (cameraStatus === 'loading') {
      return (
        <SlideUp className="flex-1 flex flex-col items-center justify-center p-6" duration={0.5}>
          <div className="bg-white p-8 rounded-2xl shadow-lg mb-4 w-full flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-md">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Analyzing Ingredients</h2>
            <p className="text-gray-600 text-center">Our AI is scanning the ingredients list and checking against your allergens...</p>
          </div>
        </SlideUp>
      );
    }
    
    if (cameraStatus === 'retry' && scanResult) {
      return (
        <SlideUp className="flex-1 flex flex-col items-center justify-center p-6" duration={0.4}>
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 w-full">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full mr-3">
                <CameraIcon className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Image Unclear</h2>
                <p className="text-sm text-gray-600">We couldn't process this image clearly</p>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl mb-4">
              <p className="text-gray-700">{scanResult.recommendation}</p>
              {scanResult.alternativeSuggestion && (
                <p className="text-gray-700 mt-2">{scanResult.alternativeSuggestion}</p>
              )}
            </div>
            
            <div className="space-y-3 w-full">
              <AnimatedButton 
                onClick={() => setCameraStatus('active')}
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all duration-200 font-medium"
              >
                <CameraIcon className="mr-2 h-5 w-5" /> Retake Photo
              </AnimatedButton>
              <AnimatedButton 
                onClick={handleBackToScan}
                className="w-full py-3 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                Cancel
              </AnimatedButton>
            </div>
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
