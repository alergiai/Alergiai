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

const Home = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { getSelectedAllergens } = useAllergens();
  const { addToHistory } = useHistory();
  
  const [activeTab, setActiveTab] = useState<string>('scan');
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
      
      // Send to API for analysis
      const response = await apiRequest('POST', '/api/analyze', {
        base64Image,
        allergens: selectedAllergens
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze the image');
      }
      
      const analysisData: ScanAnalysisResponse = await response.json();
      
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
        setCameraStatus('retry');
      } else {
        setCameraStatus('result');
      }
      
    } catch (error) {
      console.error('Error during image analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try again.',
        variant: 'destructive'
      });
      setCameraStatus('inactive');
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
      const savedResult = addToHistory(scanResult);
      toast({
        title: 'Saved to History',
        description: 'The scan has been saved to your history'
      });
      
      // Navigate to the ScanResult detail page
      setLocation(`/result/${savedResult.id}`);
    }
  };
  
  // Change tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Content based on camera status
  const renderScanContent = () => {
    if (cameraStatus === 'loading') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6 animate-pulse">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2">Analyzing Ingredients</h2>
          <p className="text-gray-600 text-center">Our AI is scanning the ingredients list and checking against your allergens...</p>
        </div>
      );
    }
    
    if (cameraStatus === 'retry' && scanResult) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-warning-50 flex items-center justify-center mb-6">
            <CameraIcon className="w-10 h-10 text-warning-500" />
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2">Image Unclear</h2>
          <p className="text-gray-600 text-center mb-4">{scanResult.recommendation}</p>
          <p className="text-gray-600 text-center mb-6">{scanResult.alternativeSuggestion}</p>
          
          <div className="space-y-4 w-full">
            <Button 
              onClick={() => setCameraStatus('active')}
              className="w-full py-6"
            >
              <CameraIcon className="mr-2 h-5 w-5" /> Retake Photo
            </Button>
            <Button 
              variant="outline"
              onClick={handleBackToScan}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    
    if (cameraStatus === 'result' && scanResult) {
      return (
        <ResultCard 
          result={scanResult} 
          onBack={handleBackToScan} 
          onSave={handleSaveToHistory} 
        />
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
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
      <Header />
      
      <Tabs defaultValue="scan" value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="flex h-auto p-0 bg-white border-b border-gray-200">
          <TabsTrigger 
            value="scan" 
            className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none"
          >
            <div className="flex justify-center items-center gap-2">
              <CameraIcon className="h-4 w-4" />
              <span>Scan</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none"
          >
            <div className="flex justify-center items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="allergens" 
            className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none"
          >
            <div className="flex justify-center items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Allergens</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 flex flex-col">
          {activeTab === 'scan' && renderScanContent()}
          {activeTab === 'history' && <HistoryPage />}
          {activeTab === 'allergens' && <AllergensPage />}
        </div>
      </Tabs>
    </div>
  );
};

export default Home;
