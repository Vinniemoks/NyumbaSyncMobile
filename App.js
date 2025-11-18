import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import LandlordNavigator from './src/navigation/LandlordNavigator';
import TenantNavigator from './src/navigation/TenantNavigator';
import ManagerNavigator from './src/navigation/ManagerNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="LandlordDashboard" component={LandlordNavigator} />
          <Stack.Screen name="TenantDashboard" component={TenantNavigator} />
          <Stack.Screen name="ManagerDashboard" component={ManagerNavigator} />
          <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
