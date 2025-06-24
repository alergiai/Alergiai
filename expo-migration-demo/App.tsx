import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AllergensScreen from './src/screens/AllergensScreen';
import ScanResultScreen from './src/screens/ScanResultScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setIsOnboardingComplete(completed === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Could add a splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isOnboardingComplete ? "Home" : "Onboarding"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#7C3AED',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Alergi.AI' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'Scan History' }}
        />
        <Stack.Screen 
          name="Allergens" 
          component={AllergensScreen}
          options={{ title: 'My Allergens' }}
        />
        <Stack.Screen 
          name="ScanResult" 
          component={ScanResultScreen}
          options={{ title: 'Scan Result' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}