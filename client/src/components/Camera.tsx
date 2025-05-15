import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Allergen } from '@/types';
import { CameraStatus } from '@/types';
import AllergenList from './AllergenList';

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
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-48 h-48 rounded-full bg-primary-50 flex items-center justify-center">
          <CameraIcon className="w-24 h-24 text-primary-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold mb-2">Scan Ingredients</h2>
          <p className="text-gray-600 mb-6">Take a picture of the ingredients list on a food package to check for allergens</p>
          <Button 
            className="w-full py-6"
            onClick={handleActivateCamera}
          >
            <CameraIcon className="mr-2 h-5 w-5" /> Activate Camera
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="flex-1 flex flex-col">
        <div className="relative aspect-[3/4] bg-black">
          {hasPermissions === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white bg-black/90">
              <CameraIcon className="w-16 h-16 mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-center text-gray-300 mb-4">{error || "Please allow camera access to scan ingredients"}</p>
              <Button 
                onClick={handleDeactivateCamera}
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
              >
                Go Back
              </Button>
            </div>
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
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-2/3 rounded-lg flex items-center justify-center border-2 border-dashed border-white bg-black/10">
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                Position ingredients list here
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <button 
              type="button" 
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center"
              onClick={handleCaptureClick}
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-300"></div>
            </button>
          </div>
          
          <button 
            type="button" 
            className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white"
            onClick={handleDeactivateCamera}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-white">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-heading font-medium text-sm text-gray-500 mb-3">YOUR ALLERGENS & RESTRICTIONS</h3>
            <AllergenList allergens={selectedAllergens} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Camera;
