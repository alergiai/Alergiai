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
import { v4 as uuidv4 } from 'uuid';

// Function to create a thumbnail for storage in history
function createStorageThumbnail(imageData: string): string {
  try {
    // Create an image element
    const img = new Image();
    
    // Handle both formats (with or without data URI prefix)
    const imgSrc = imageData.includes('data:') 
      ? imageData 
      : `data:image/jpeg;base64,${imageData}`;
    
    img.src = imgSrc;
    
    // Create a tiny canvas for the thumbnail
    const canvas = document.createElement('canvas');
    const thumbnailSize = 100; // Very small thumbnail
    canvas.width = thumbnailSize;
    canvas.height = thumbnailSize;
    
    // Draw the image on the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
      
      // Draw image centered and cropped
      ctx.drawImage(img, 0, 0, thumbnailSize, thumbnailSize);
      
      // Return a very low quality thumbnail to save space
      return canvas.toDataURL('image/jpeg', 0.1);
    }
  } catch (error) {
    console.error('Error creating thumbnail for storage:', error);
  }
  
  // Return empty string if thumbnail creation fails
  return '';
}

// Function to compress images for API compatibility
function compressImage(dataUrl: string, callback: (compressedDataUrl: string) => void) {
  // Create an image element
  const img = new Image();
  img.src = dataUrl;
  
  img.onload = () => {
    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    
    // Calculate new dimensions (max 800px width/height to stay within API limits)
    // This is a more conservative value to ensure the file isn't too large
    let width = img.width;
    let height = img.height;
    const maxSize = 800;
    
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }
    
    // Set canvas dimensions - ensure they're not too small
    canvas.width = Math.max(width, 400);
    canvas.height = Math.max(height, 400);
    
    // Draw the resized image with a white background to handle transparency
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fill with white background first (for images with transparency)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Center the image if we've enforced minimum dimensions
      const offsetX = (canvas.width - width) / 2;
      const offsetY = (canvas.height - height) / 2;
      
      // Draw the actual image
      ctx.drawImage(img, offsetX, offsetY, width, height);
    }
    
    // Get compressed data URL (JPEG at 75% quality for smaller size)
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
    
    // Pass back the compressed image
    callback(compressedDataUrl);
  };
  
  img.onerror = () => {
    console.error('Error loading image for compression');
    // Fall back to the original if compression fails
    callback(dataUrl);
  };
}

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
    console.log('⏳ handleCapture: Starting process with image data');
    
    setCapturedImage(imageData);
    setCameraStatus('loading');
    
    try {
      // Check if we have valid image data
      if (!imageData) {
        console.error('❌ handleCapture: No image data provided');
        throw new Error('No image data provided');
      }
      
      console.log('✅ handleCapture: Image data received, length:', imageData.length);
      
      // For direct calls from the camera, the data is already formatted
      // For file uploads, we need to check the format
      let base64Image = imageData;
      
      // Check if the image data contains the base64 prefix
      if (imageData.includes('base64,')) {
        console.log('⏳ handleCapture: Image has base64 prefix, extracting...');
        base64Image = imageData.split('base64,')[1];
      }
      
      if (!base64Image) {
        console.error('❌ handleCapture: Invalid image format after extraction');
        throw new Error('Invalid image format');
      }
      
      console.log('✅ handleCapture: Base64 image prepared for API, length:', base64Image.length);
      console.log('⏳ handleCapture: Selected allergens count:', selectedAllergens.length);
      
      console.log('⏳ handleCapture: Sending API request to analyze image...');
      
      // Send to API for analysis
      const response = await apiRequest('POST', '/api/analyze', {
        base64Image,
        allergens: selectedAllergens
      });
      
      if (!response.ok) {
        console.error('❌ handleCapture: API Error:', response.status, response.statusText);
        throw new Error(`Failed to analyze the image: Server returned ${response.status}`);
      }
      
      console.log('✅ handleCapture: API request successful, parsing response...');
      
      const analysisData: ScanAnalysisResponse = await response.json();
      console.log('✅ handleCapture: Analysis response:', analysisData);
      
      // Create scan result
      // Make sure we set the imageUrl properly for display 
      // If it's a full base64 with prefix, use as-is, otherwise add the prefix
      const imageUrl = imageData.includes('data:image') 
        ? imageData 
        : `data:image/jpeg;base64,${imageData}`;
        
      const result: ScanResult = {
        id: '',  // Will be assigned when saved to history
        timestamp: Date.now(),
        imageUrl: imageUrl,
        base64Image,
        ...analysisData
      };
      
      console.log('✅ handleCapture: Scan result created:', {
        productName: result.productName,
        isSafe: result.isSafe,
        detectedAllergens: result.detectedAllergens.length
      });
      
      setScanResult(result);
      
      // If isSafe is null, it means the image was unclear and needs to be retaken
      if (result.isSafe === null) {
        console.log('⚠️ handleCapture: Image unclear - showing retry screen');
        setCameraStatus('retry');
      } else {
        console.log('✅ handleCapture: Analysis complete - showing results');
        setCameraStatus('result');
      }
      
    } catch (error) {
      console.error('❌ handleCapture: Error during image analysis:', error);
      
      // For server errors, show retry screen instead of just error toast
      setScanResult({
        id: '',
        timestamp: Date.now(),
        productName: 'Error Analyzing Image',
        imageUrl: '',
        base64Image: '',
        isSafe: null,
        detectedAllergens: [],
        ingredients: 'Could not process the image analysis properly.',
        recommendation: 'Please try a different image or ensure your image is clear and well-lit.',
        alternativeSuggestion: 'If the problem persists, try using the camera to take a photo directly.'
      });
      
      setCameraStatus('retry');
      
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the image. Please try again with a clearer photo.',
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
        // Get the source image (either imageUrl or base64Image)
        const imageSource = scanResult.imageUrl || 
          (scanResult.base64Image ? 
            (scanResult.base64Image.includes('data:') ? 
              scanResult.base64Image : 
              `data:image/jpeg;base64,${scanResult.base64Image}`) 
            : '');
        
        // Create a storage-efficient version with a tiny thumbnail
        const storageEfficientResult = {
          ...scanResult,
          id: scanResult.id || uuidv4(),
          // Replace large base64Image with tiny thumbnail
          base64Image: createStorageThumbnail(imageSource)
        };
        
        console.log('Saving scan result to history with thumbnail');
        
        // Add to history and get back the result with generated ID
        const savedResult = addToHistory(storageEfficientResult);
        
        // Set the current scanResult with the proper ID but keep the full image
        setScanResult({
          ...savedResult,
          // Keep the original image for display in the current session
          base64Image: scanResult.base64Image
        });
        
        toast({
          title: 'Saved to History',
          description: 'The scan has been saved to your history'
        });
        
        // Navigate to the ScanResult detail page
        setTimeout(() => {
          setLocation(`/result/${savedResult.id}`);
        }, 300);
      } catch (error) {
        console.error('Error saving to history:', error);
        toast({
          title: 'Storage Limit Reached',
          description: 'Could not save to history due to storage limits. Try clearing some old scans.',
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
              <div className="space-y-3">
                <AnimatedButton
                  onClick={handleStartCamera}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl font-medium shadow-md transition-colors text-center text-lg"
                >
                  <CameraIcon className="mr-2 h-5 w-5 inline" /> Take Photo
                </AnimatedButton>
                
                <input 
                  id="home-photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      try {
                        // Show loading state
                        setCameraStatus('loading');
                        toast({
                          title: 'Processing image',
                          description: 'Preparing your image for analysis...'
                        });
                        
                        // Create a local reference to the file
                        const file = e.target.files[0];
                        
                        // Use the direct camera result handler
                        // But convert the file to a simple data URL first
                        const reader = new FileReader();
                        
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          // Format is data:image/jpeg;base64,BASE64_DATA
                          
                          // Extract the base64 part (after the comma)
                          const base64Data = dataUrl.split(',')[1];
                          
                          // Pass to the handler
                          handleCapture(base64Data);
                        };
                        
                        reader.onerror = () => {
                          console.error("Failed to read file");
                          setCameraStatus('inactive');
                          toast({
                            title: 'Upload Error',
                            description: 'Could not read the selected image file.',
                            variant: 'destructive'
                          });
                        };
                        
                        // Start reading the file
                        reader.readAsDataURL(file);
                      } catch (error) {
                        console.error("File selection error:", error);
                        setCameraStatus('inactive');
                        toast({
                          title: 'Upload Error',
                          description: 'There was a problem with the selected file.',
                          variant: 'destructive'
                        });
                      }
                    }
                  }} 
                />
                
                <AnimatedButton
                  onClick={() => document.getElementById('home-photo-upload')?.click()}
                  className="w-full bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 py-4 px-6 rounded-xl font-medium shadow-md transition-colors text-center text-lg"
                >
                  <svg className="mr-2 h-5 w-5 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload from Gallery
                </AnimatedButton>
              </div>
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
        {cameraStatus === 'inactive' && (
          <div className="p-4 pb-0">
            <div className="bg-white rounded-2xl shadow-md p-2 flex justify-between">
              <TabsList className="flex w-full bg-transparent border-0 p-0">
                <TabsTrigger 
                  value="scan" 
                  className="flex-1 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex justify-center items-center gap-2">
                    <CameraIcon className="h-4 w-4" />
                    <span className="font-medium">Scan</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex-1 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex justify-center items-center gap-2">
                    <History className="h-4 w-4" />
                    <span className="font-medium">History</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="allergens" 
                  className="flex-1 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex justify-center items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span className="font-medium">Allergens</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        )}
        
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
