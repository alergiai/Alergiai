import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, X, RefreshCw } from 'lucide-react';
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

  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
  }, []);

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
          <AnimatedButton 
            className="w-full py-5 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all duration-200 shadow-md text-lg font-medium"
            onClick={handleActivateCamera}
          >
            <CameraIcon className="mr-2 h-5 w-5" /> Activate Camera
          </AnimatedButton>
        </div>
      </SlideUp>
    );
  }

  if (status === 'active') {
    return (
      <FadeIn duration={0.4} className="flex-1 flex flex-col">
        <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden mx-4 shadow-lg">
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
              facingMode: "environment",
              aspectRatio: 3/4
            }}
            className="w-full h-full object-cover"
            onUserMediaError={handleUserMediaError}
            onUserMedia={handleUserMedia}
          />
          
          {/* Allergen Overlay at the top */}
          <div className="absolute top-4 inset-x-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <div className="flex items-center text-white">
                <span className="text-xs font-medium mr-2">Looking out for:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAllergens.slice(0, 3).map((allergen) => (
                    <span 
                      key={allergen.id}
                      className="bg-primary/80 text-white text-xs py-0.5 px-2 rounded-full"
                    >
                      {allergen.name}
                    </span>
                  ))}
                  {selectedAllergens.length > 3 && (
                    <span className="bg-white/20 text-white text-xs py-0.5 px-2 rounded-full">
                      +{selectedAllergens.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-2/3 rounded-lg flex items-center justify-center border-2 border-dashed border-white bg-black/10 animate-pulse">
              <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                Position ingredients list here
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <button 
              type="button" 
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150"
              onClick={handleCaptureClick}
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-300"></div>
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
        
        <SlideUp duration={0.4} delay={0.2} className="p-4">
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="font-medium text-gray-800 mb-2">Important Scanning Tips</h3>
            <div className="bg-amber-50 p-3 rounded-xl mb-3">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Scan the ingredients list</span> section on the packaging for best results. Make sure the image is <span className="font-semibold text-rose-600">CLEAR and not blurry</span> for the scan to work effectively.
              </p>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
              <li>Hold your phone steady</li>
              <li>Ensure good lighting</li>
              <li>Position text within the guide box</li>
            </ul>
          </div>
        </SlideUp>
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
