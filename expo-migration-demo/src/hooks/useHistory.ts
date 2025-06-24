import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanResult } from '../types';

const HISTORY_STORAGE_KEY = 'alergi_ai_history';
const MAX_HISTORY_ITEMS = 100;

export function useHistory() {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        console.log('[History] Loading history from AsyncStorage', 'found data');
        console.log('[History] Parsed history items', parsedHistory.length);
        setHistory(parsedHistory);
      } else {
        console.log('[History] No history found in AsyncStorage');
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
    }
  };

  const saveHistory = async (newHistory: ScanResult[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      console.log('[History] Saving history to AsyncStorage', `${newHistory.length} items`);
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const addToHistory = async (scanResult: ScanResult) => {
    const newScanResult: ScanResult = {
      ...scanResult,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // Add to beginning of array and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newScanResult, ...history].slice(0, MAX_HISTORY_ITEMS);
    await saveHistory(updatedHistory);
  };

  const removeFromHistory = async (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    await saveHistory(updatedHistory);
  };

  const clearHistory = async () => {
    await saveHistory([]);
  };

  const getHistoryItem = (id: string): ScanResult | undefined => {
    return history.find(item => item.id === id);
  };

  const getHistoryCount = (): number => {
    return history.length;
  };

  const getRemainingScans = (): number => {
    return Math.max(0, MAX_HISTORY_ITEMS - history.length);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
    getHistoryCount,
    getRemainingScans,
  };
}