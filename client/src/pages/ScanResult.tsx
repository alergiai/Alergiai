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
      const scanResult = getById(params.id);
      if (scanResult) {
        setResult(scanResult);
      } else {
        // Result not found, redirect to history
        setLocation('/');
        toast({
          title: 'Not Found',
          description: 'The scan result you are looking for could not be found.',
          variant: 'destructive'
        });
      }
    }
  }, [params.id, getById, setLocation, toast]);
  
  const handleBack = () => {
    setLocation('/');
  };
  
  const handleDelete = () => {
    if (result) {
      removeFromHistory(result.id);
      toast({
        title: 'Deleted',
        description: 'The scan result has been removed from history'
      });
      setLocation('/');
    }
  };
  
  if (!result) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
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
