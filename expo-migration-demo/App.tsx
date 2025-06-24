import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AllergensScreen from './src/screens/AllergensScreen';
import ScanResultScreen from './src/screens/ScanResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Onboarding"
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