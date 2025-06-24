# Alergi.AI - Expo/React Native Migration Guide

## Overview
This guide explains how to convert the current web application to a React Native app using Expo.

## Current Architecture
- **Frontend**: React web app with Tailwind CSS
- **Backend**: Express.js API server
- **Camera**: Web camera API
- **Storage**: localStorage for client data

## Migration Strategy

### 1. Create New Expo Project
```bash
npx create-expo-app@latest alergi-ai-mobile --template blank-typescript
cd alergi-ai-mobile
```

### 2. Install Required Dependencies
```bash
# Core navigation and UI
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Camera functionality
expo install expo-camera expo-media-library expo-image-picker

# Storage
npm install @react-native-async-storage/async-storage

# Forms and UI
npm install react-hook-form @hookform/resolvers
npm install react-native-elements react-native-vector-icons

# HTTP requests
npm install axios

# Additional Expo modules
expo install expo-constants expo-device expo-permissions
```

### 3. Component Migration Map

#### Core Components to Migrate:
- `pages/Home.tsx` → Mobile camera screen
- `pages/Onboarding.tsx` → Multi-screen onboarding flow
- `pages/History.tsx` → List with native scrolling
- `pages/Allergens.tsx` → Settings screen
- `components/Camera.tsx` → Expo Camera component

#### Key Changes Required:

**Camera Component (Web → Expo)**
```typescript
// Current: react-webcam
import Webcam from 'react-webcam';

// New: expo-camera
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
```

**Storage (localStorage → AsyncStorage)**
```typescript
// Current: localStorage
localStorage.setItem('key', value);

// New: AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', value);
```

**Styling (Tailwind → StyleSheet)**
```typescript
// Current: Tailwind classes
className="bg-purple-600 p-4 rounded-lg"

// New: StyleSheet
import { StyleSheet } from 'react-native';
style={styles.button}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 8,
  }
});
```

### 4. Navigation Structure
```typescript
// App.tsx structure
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Allergens" component={AllergensScreen} />
        <Stack.Screen name="ScanResult" component={ScanResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 5. Backend Considerations

**Keep Existing API**: Your Express.js backend can remain unchanged. The mobile app will make HTTP requests to it.

**API Base URL Configuration**:
```typescript
// config/api.ts
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' // Development
  : 'https://your-deployed-api.com'; // Production
```

### 6. Key Mobile-Specific Features

**Camera Permissions**:
```typescript
import { Camera } from 'expo-camera';

const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};
```

**Image Handling**:
```typescript
import * as ImagePicker from 'expo-image-picker';

const takePicture = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: true,
  });
  
  if (!result.canceled) {
    // Send base64 to API
    analyzeImage(result.assets[0].base64);
  }
};
```

**AsyncStorage for History**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveToHistory = async (scanResult: ScanResult) => {
  try {
    const history = await AsyncStorage.getItem('scanHistory');
    const historyArray = history ? JSON.parse(history) : [];
    historyArray.unshift(scanResult);
    
    // Keep only last 100 scans
    if (historyArray.length > 100) {
      historyArray.splice(100);
    }
    
    await AsyncStorage.setItem('scanHistory', JSON.stringify(historyArray));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};
```

### 7. Migration Steps

1. **Set up Expo project** with TypeScript template
2. **Migrate shared types** from `shared/schema.ts`
3. **Create navigation structure**
4. **Convert UI components** to React Native equivalents
5. **Implement camera functionality** with Expo Camera
6. **Update storage** to use AsyncStorage
7. **Configure API calls** to existing backend
8. **Test on physical device**

### 8. Styling Migration

Replace Tailwind with React Native StyleSheet or use a library like:
- **NativeWind** (Tailwind for React Native)
- **styled-components/native**
- **Tamagui**

### 9. Testing Strategy

**Development**:
- Use Expo Go app for quick testing
- Test camera functionality on physical device

**Production**:
- Build standalone app with `expo build`
- Test on both iOS and Android

### 10. Deployment

**Expo Managed Workflow**:
```bash
# Build for app stores
expo build:ios
expo build:android

# Or use EAS Build (recommended)
npx eas-cli build --platform all
```

## Key Benefits of Mobile Version

1. **Native Camera**: Better camera performance and quality
2. **Native Storage**: More reliable data persistence
3. **Push Notifications**: Can add allergen alerts
4. **Offline Capability**: Store scans when offline
5. **App Store Distribution**: Reach mobile users

## Estimated Migration Time
- **Basic conversion**: 2-3 weeks
- **Full feature parity**: 4-6 weeks
- **Polish and testing**: 1-2 weeks

Would you like me to start creating the Expo project structure and begin migrating specific components?