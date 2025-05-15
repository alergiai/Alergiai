import { useState, useEffect } from 'react';
import { ScanResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useHistory() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('scanHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading scan history:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('scanHistory', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  // Add a new scan result to history
  const addToHistory = (scanResult: Omit<ScanResult, 'id'>) => {
    const newScanResult: ScanResult = {
      ...scanResult,
      id: uuidv4()
    };
    
    setHistory(prev => [newScanResult, ...prev]);
    return newScanResult;
  };

  // Get a specific scan result by ID
  const getById = (id: string): ScanResult | undefined => {
    return history.find(item => item.id === id);
  };

  // Delete a scan result by ID
  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    getById,
    removeFromHistory,
    clearHistory,
    isLoaded
  };
}
