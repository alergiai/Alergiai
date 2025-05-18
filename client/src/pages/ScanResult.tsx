import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { ScanResult } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ResultCard from '@/components/ResultCard';

const ScanResultPage = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { getById, removeFromHistory } = useHistory();
  const { toast } = useToast();
  const [result, setResult] = useState<ScanResult | null>(null);
  
  useEffect(() => {
    if (params.id) {
      console.log('Looking for scan result with ID:', params.id);
      
      // Get the result from the history hook
      const scanResult = getById(params.id);
      
      if (scanResult) {
        console.log('Found scan result:', scanResult);
        setResult(scanResult);
      } else {
        console.error('Scan result not found for ID:', params.id);
        // Result not found, redirect to home
        toast({
          title: 'Not Found',
          description: 'The scan result you are looking for could not be found.',
          variant: 'destructive'
        });
        
        // Delay redirect slightly to allow toast to be seen
        setTimeout(() => {
          setLocation('/');
        }, 500);
      }
    }
  }, [params.id, getById, setLocation, toast]);
  
  const handleBack = () => {
    // Go back to the history tab
    setLocation('/history');
  };
  
  const handleDelete = () => {
    if (result) {
      console.log('Deleting scan result:', result.id);
      
      removeFromHistory(result.id);
      
      toast({
        title: 'Deleted',
        description: 'The scan result has been removed from history'
      });
      
      // Redirect to history tab
      setLocation('/history');
    }
  };
  
  if (!result) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gradient-to-b from-white to-primary-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-center">Loading scan result...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gradient-to-b from-white to-primary-50">
      <Header />
      
      <div className="flex-1 flex flex-col">
        <ResultCard 
          result={result} 
          onBack={handleBack} 
          onSave={() => {
            toast({
              title: 'Already Saved',
              description: 'This scan is already in your history'
            });
          }} 
        />
        
        <div className="px-4 pb-6">
          <Button 
            variant="outline" 
            className="w-full text-danger-500 border-danger-200 hover:bg-danger-50 hover:text-danger-600"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete from History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanResultPage;
