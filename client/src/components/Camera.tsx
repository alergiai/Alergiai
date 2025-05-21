import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Link, useLocation } from 'wouter';
import { Camera as CameraIcon, X, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Allergen } from '@/types';
import { CameraStatus } from '@/types';
import AllergenList from './AllergenList';
import { FadeIn, SlideUp, AnimatedButton, Pop } from '@/components/ui/animations';

interface CameraProps {
  selectedAllergens: Allergen[];
  status: CameraStatus;
  onStatusChange: (status: CameraStatus) => void;
  onCapture: (imageData: string) => void;
}

const Camera: React.FC<CameraProps> = ({ 
  selectedAllergens,
  status,
  onStatusChange,
  onCapture
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllAllergens, setShowAllAllergens] = useState<boolean>(false);

  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      // Display loading state
      onStatusChange('loading');
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          // Get base64 image data
          const base64Image = event.target.result.split(',')[1];
          
          // Pass the image data to the parent component
          onCapture(base64Image);
        }
      };
      
      reader.onerror = () => {
        setError("Failed to read uploaded file. Please try again.");
        onStatusChange('inactive');
      };
      
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (status === 'active') {
      navigator.mediaDevices.enumerateDevices()
        .then(handleDevices)
        .catch(err => {
          setError("Unable to access camera devices");
          console.error("Error enumerating devices", err);
        });
    }
  }, [handleDevices, status]);

  const handleActivateCamera = () => {
    onStatusChange('active');
    setHasPermissions(null);
  };

  const handleDeactivateCamera = () => {
    onStatusChange('inactive');
  };

  const handleCaptureClick = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
        onStatusChange('loading');
      } else {
        setError("Failed to capture image. Please try again.");
      }
    } else {
      setError("Camera not initialized. Please try again.");
    }
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setHasPermissions(false);
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      setError("Camera access denied. Please allow camera access to use this feature.");
    } else {
      setError("Failed to access the camera. Please check your device settings.");
    }
  };

  const handleUserMedia = () => {
    setHasPermissions(true);
    setError(null);
  };

  if (status === 'inactive') {
    return (
      <SlideUp className="flex-1 flex flex-col items-center justify-center p-6 gap-6" duration={0.5}>
        <Pop delay={0.1}>
          <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center shadow-lg">
            <div className="w-36 h-36 rounded-full border-[3px] border-primary-200 flex items-center justify-center">
              <CameraIcon className="w-20 h-20 text-primary-600" />
            </div>
          </div>
        </Pop>
        <div className="text-center bg-white p-6 rounded-2xl shadow-lg w-full">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Scan Ingredients</h2>
          <p className="text-gray-600 mb-6">Take a picture of the ingredients list on a food package to check for allergens</p>
          <div className="space-y-3">
            <AnimatedButton 
              className="w-full py-4 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all duration-200 shadow-md text-lg font-medium"
              onClick={handleActivateCamera}
            >
              <CameraIcon className="mr-2 h-5 w-5" /> Take Photo
            </AnimatedButton>
            <div className="relative">
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <AnimatedButton 
                className="w-full py-4 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-md text-lg font-medium"
                onClick={() => {
                  // Create a safe reference to the input element
                  const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
                  if (fileInput) fileInput.click();
                }}
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

  if (status === 'active') {
    return (
      <FadeIn duration={0.4} className="flex-1 flex flex-col pb-4">
        <div className="relative h-[77vh] bg-black rounded-xl overflow-hidden shadow-lg mx-4">
          {hasPermissions === false && (
            <FadeIn className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white bg-black/90">
              <CameraIcon className="w-16 h-16 mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-center text-gray-300 mb-4">{error || "Please allow camera access to scan ingredients"}</p>
              <AnimatedButton 
                onClick={handleDeactivateCamera}
                className="bg-white text-black hover:bg-gray-100 rounded-md px-4 py-2"
              >
                Go Back
              </AnimatedButton>
            </FadeIn>
          )}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              deviceId: deviceId ? { exact: deviceId } : undefined,
              facingMode: "environment"
            }}
            className="w-full h-full object-cover"
            onUserMediaError={handleUserMediaError}
            onUserMedia={handleUserMedia}
          />
          
          {/* Allergen Overlay at the top */}
          <div className="absolute top-4 inset-x-4 z-10">
            {showAllAllergens ? (
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between text-white mb-2">
                  <h3 className="text-sm font-medium">Your Allergens & Restrictions</h3>
                  <button 
                    onClick={() => setShowAllAllergens(false)}
                    className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Hide List
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedAllergens.map((allergen) => (
                    <span 
                      key={allergen.id}
                      className="bg-primary/90 text-white text-xs py-0.5 px-2 rounded-full"
                    >
                      {allergen.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => window.location.href = '/allergens'}
                  className="w-full text-center text-sm bg-white/30 text-white py-2 rounded-lg hover:bg-white/40 active:bg-white/50 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-md"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Allergen
                </button>
              </div>
            ) : (
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg max-w-full">
                <div className="flex items-center justify-between text-white w-full">
                  <div className="flex-1 flex items-center overflow-hidden mr-2">
                    <span className="text-sm font-medium mr-2 flex-shrink-0">Looking out for:</span>
                    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-[70%]">
                      {selectedAllergens.slice(0, 2).map((allergen) => (
                        <span 
                          key={allergen.id}
                          className="bg-primary text-white text-sm py-1 px-3 rounded-full whitespace-nowrap flex-shrink-0"
                        >
                          {allergen.name}
                        </span>
                      ))}
                      {selectedAllergens.length > 2 && (
                        <button 
                          onClick={() => setShowAllAllergens(true)}
                          className="bg-gray-500/40 text-white text-sm py-1 px-3 rounded-full hover:bg-gray-500/60 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          +{selectedAllergens.length - 2} more
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = '/allergens'}
                    className="bg-primary rounded-full p-2 hover:bg-primary/90 active:bg-primary/80 active:scale-90 transition-all duration-150 flex items-center justify-center flex-shrink-0 min-w-[36px] min-h-[36px] shadow-lg"
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-2/3 rounded-lg flex items-center justify-center border-2 border-dashed border-white bg-black/10 animate-pulse">
              <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                Position ingredients list here
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-8 inset-x-0 flex justify-center items-center space-x-6">
            {/* Gallery upload button */}
            <button 
              type="button" 
              className="w-12 h-12 rounded-full bg-black/40 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150"
              onClick={() => {
                // Create file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                      if (event.target && typeof event.target.result === 'string') {
                        const base64Image = event.target.result.split(',')[1];
                        onCapture(base64Image);
                      }
                    };
                    
                    reader.readAsDataURL(file);
                  }
                };
                
                // Add to DOM, click, and remove
                document.body.appendChild(input);
                input.click();
                setTimeout(() => document.body.removeChild(input), 5000);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            
            {/* Camera capture button */}
            <button 
              type="button" 
              className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150"
              onClick={handleCaptureClick}
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-300"></div>
            </button>
          </div>
          
          <button 
            type="button" 
            className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-200"
            onClick={handleDeactivateCamera}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tips Panel */}
        <div className="bg-white rounded-xl shadow-md mx-4 mt-3">
          <div className="px-4 pt-3 pb-3">
            <h3 className="text-sm font-semibold text-[#142e3a] mb-2 text-center">Scanning Tips</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-center text-gray-700 font-medium">Hold steady</span>
              </div>
              
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs text-center text-gray-700 font-medium">Good lighting</span>
              </div>
              
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs text-center text-gray-700 font-medium">Clear focus</span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (status === 'retry') {
    return (
      <SlideUp className="flex flex-col items-center justify-center p-6" duration={0.4}>
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-4 w-full">
          <div className="flex items-center mb-4">
            <div className="bg-rose-100 p-3 rounded-full mr-3">
              <svg className="h-6 w-6 text-rose-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Unclear Image</h3>
              <p className="text-sm text-gray-600">We couldn't clearly read the ingredients list</p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl mb-4">
            <p className="text-gray-700">For safety reasons, we cannot determine if this product is safe for you. Please try taking another photo.</p>
          </div>

          <div className="bg-white p-4 rounded-xl mb-4 border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-2">Tips for better results:</h4>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li>Make sure the ingredients list is clearly visible</li>
              <li>Hold the camera steady and avoid blurry images</li>
              <li>Ensure good lighting on the packaging</li>
              <li>Position the ingredients list within the guidebox</li>
              <li>Try to capture the entire ingredients section</li>
            </ul>
          </div>

          <div className="space-y-3 w-full">
            <AnimatedButton 
              onClick={() => onStatusChange('active')}
              className="w-full py-4 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all duration-200 font-medium"
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" /> Retake Photo
            </AnimatedButton>
            <AnimatedButton 
              onClick={() => onStatusChange('inactive')}
              className="w-full py-3 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
            >
              Cancel Scan
            </AnimatedButton>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg w-full">
          <h3 className="font-medium text-sm text-gray-800 mb-3">YOUR ALLERGENS & RESTRICTIONS</h3>
          <AllergenList allergens={selectedAllergens} />
        </div>
      </SlideUp>
    );
  }

  return null;
};

export default Camera;