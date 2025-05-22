import { useState, useEffect } from 'react';
import { ScanResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Debug helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[History] ${message}`, data || '');
  }
};

export function useHistory() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('scanHistory');
      debugLog('Loading history from localStorage', savedHistory ? 'found data' : 'no data found');
      
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            debugLog('Parsed history items', parsedHistory.length);
            setHistory(parsedHistory);
          } else {
            // If not an array, initialize with empty array
            debugLog('Saved history is not an array, resetting');
            setHistory([]);
          }
        } catch (parseError) {
          console.error('Error parsing saved history:', parseError);
          // If JSON parsing fails, initialize with empty array
          setHistory([]);
        }
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
      debugLog('Saving history to localStorage', history.length + ' items');
      localStorage.setItem('scanHistory', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  // Add a new scan result to history
  const addToHistory = (scanResult: Omit<ScanResult, 'id'> | ScanResult) => {
    // Check if result already has an ID or generate a new one
    const newId = 'id' in scanResult && scanResult.id ? scanResult.id : uuidv4();
    
    // Create a lightweight version of the scan result to save storage space
    // by removing the base64 image data which is very large
    const newScanResult: ScanResult = {
      ...(scanResult as any),
      id: newId,
      // Store a placeholder instead of the full base64 image
      base64Image: '' // Don't store the large base64 image in localStorage
    };
    
    debugLog('Adding item to history', newScanResult);
    
    try {
      // Update history state with new item at the beginning
      setHistory(prev => {
        // Remove duplicates if this item was already in history
        const filteredHistory = prev.filter(item => item.id !== newId);
        return [newScanResult, ...filteredHistory];
      });
    } catch (error) {
      console.error('Error saving to history:', error);
      // If localStorage is full, try removing older items
      setHistory(prev => {
        // Keep only the 5 most recent items to save space
        const reducedHistory = prev.slice(0, 5);
        return [newScanResult, ...reducedHistory];
      });
    }
    
    // Return the original scan result with the image for immediate use
    return {
      ...newScanResult,
      base64Image: (scanResult as any).base64Image
    };
  };

  // Get a specific scan result by ID
  const getById = (id: string): ScanResult | undefined => {
    debugLog('Getting item by ID', id);
    const result = history.find(item => item.id === id);
    debugLog('Result found', result ? 'yes' : 'no');
    return result;
  };

  // Delete a scan result by ID
  const removeFromHistory = (id: string) => {
    debugLog('Removing item from history', id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const clearHistory = () => {
    debugLog('Clearing all history');
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
