import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import FeaturesScreen from './screens/FeaturesScreen';
import ContactScreen from './screens/ContactScreen';
import BlogScreen from './screens/BlogScreen';
import DashboardScreen from './screens/DashboardScreen';
import AuthProvider from './components/AuthProvider';
import AuthGuard from './components/AuthGuard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Features" component={FeaturesScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Blog" component={BlogScreen} />
          <Stack.Screen
            name="Dashboard"
            component={props => (
              <AuthGuard {...props}>
                <DashboardScreen {...props} />
              </AuthGuard>
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
