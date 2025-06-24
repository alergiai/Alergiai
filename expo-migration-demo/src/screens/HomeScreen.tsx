import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAllergens } from '../hooks/useAllergens';
import { useHistory } from '../hooks/useHistory';
import { ScanResult, CameraStatus, ScanAnalysisResponse } from '../types';

// COMPARISON: Web vs Mobile
// Web: useLocation() from wouter → Mobile: useNavigation() from React Navigation
// Web: HTML buttons → Mobile: TouchableOpacity
// Web: Tailwind classes → Mobile: StyleSheet
// Web: react-webcam → Mobile: expo-camera

const HomeScreen = () => {
  const navigation = useNavigation();
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('inactive');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [currentTab, setCurrentTab] = useState<'scan' | 'history' | 'allergens'>('scan');
  
  const { getSelectedAllergens } = useAllergens();
  const { addToHistory, getHistoryCount } = useHistory();

  // Camera permission handling (Mobile-specific)
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to scan food items');
      }
    })();
  }, []);

  // Take picture function - MUCH SIMPLER than web!
  const takePicture = async () => {
    setCameraStatus('loading');
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await analyzeImage(result.assets[0].base64);
      } else {
        setCameraStatus('inactive');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      setCameraStatus('inactive');
    }
  };

  // Analysis function - IDENTICAL to web version!
  const analyzeImage = async (base64Image: string) => {
    try {
      const selectedAllergens = getSelectedAllergens();
      
      // Same API call as web version
      const response = await fetch('http://your-api-url.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          allergens: selectedAllergens,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const analysisData: ScanAnalysisResponse = await response.json();
      
      // Create result - IDENTICAL logic
      const result: ScanResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        productName: analysisData.productName,
        imageUrl: `data:image/jpeg;base64,${base64Image}`,
        base64Image,
        isSafe: analysisData.isSafe,
        detectedAllergens: analysisData.detectedAllergens,
        ingredients: analysisData.ingredients,
        recommendation: analysisData.recommendation,
        alternativeSuggestion: analysisData.alternativeSuggestion,
      };

      setScanResult(result);
      setCameraStatus('result');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image');
      setCameraStatus('retry');
    }
  };

  // Save to history - AsyncStorage instead of localStorage
  const saveToHistory = async () => {
    if (scanResult) {
      await addToHistory(scanResult);
      Alert.alert('Saved', 'Scan result saved to history');
      setCameraStatus('inactive');
      setScanResult(null);
    }
  };

  const renderScanScreen = () => (
    <View style={styles.scanContainer}>
      <Text style={styles.title}>Alergi.AI</Text>
      <Text style={styles.subtitle}>Scan any food product to check for allergens</Text>
      
      {cameraStatus === 'inactive' && (
        <TouchableOpacity style={styles.scanButton} onPress={takePicture}>
          <Text style={styles.scanButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>
      )}
      
      {cameraStatus === 'loading' && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing ingredients...</Text>
        </View>
      )}
      
      {cameraStatus === 'result' && scanResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.productName}>{scanResult.productName}</Text>
          <Text style={styles.safety}>
            {scanResult.isSafe ? '✅ Safe to consume' : '⚠️ Contains allergens'}
          </Text>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveToHistory}>
            <Text style={styles.saveButtonText}>Save to History</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation - Simple TouchableOpacity instead of complex web tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'scan' && styles.activeTab]}
          onPress={() => setCurrentTab('scan')}
        >
          <Text style={styles.tabText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'history' && styles.activeTab]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'allergens' && styles.activeTab]}
          onPress={() => navigation.navigate('Allergens')}
        >
          <Text style={styles.tabText}>Allergens</Text>
        </TouchableOpacity>
      </View>

      {renderScanScreen()}
    </SafeAreaView>
  );
};

// Styles - Direct translation from your Tailwind classes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#7C3AED', // Your primary purple
  },
  tabText: {
    color: '#374151',
    fontWeight: '500',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  scanButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    width: '100%',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  safety: {
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;