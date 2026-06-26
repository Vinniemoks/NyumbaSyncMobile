import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Dashboard Navigators
import LandlordNavigator from './src/navigation/LandlordNavigator';
import TenantNavigator from './src/navigation/TenantNavigator';
import PropertyManagerNavigator from './src/navigation/PropertyManagerNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import VendorNavigator from './src/navigation/VendorNavigator';
import AgentNavigator from './src/navigation/AgentNavigator';

// Legal / Corporate Screens
import TermsOfServiceScreen from './src/screens/Legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/Legal/PrivacyPolicyScreen';
import CookiePolicyScreen from './src/screens/Legal/CookiePolicyScreen';
import AboutUsScreen from './src/screens/Legal/AboutUsScreen';
import ContactUsScreen from './src/screens/Legal/ContactUsScreen';
import FAQScreen from './src/screens/Legal/FAQScreen';
import SecurityScreen from './src/screens/Legal/SecurityScreen';
import AccessibilityScreen from './src/screens/Legal/AccessibilityScreen';

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
          {/* Auth Flow */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          {/* Dashboard Navigators */}
          <Stack.Screen name="LandlordDashboard" component={LandlordNavigator} />
          <Stack.Screen name="TenantDashboard" component={TenantNavigator} />
          <Stack.Screen name="PropertyManagerDashboard" component={PropertyManagerNavigator} />
          <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
          <Stack.Screen name="VendorDashboard" component={VendorNavigator} />
          <Stack.Screen name="AgentDashboard" component={AgentNavigator} />

          {/* Legal / Corporate Screens */}
          <Stack.Screen name="TermsOfServiceScreen" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="CookiePolicyScreen" component={CookiePolicyScreen} />
          <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
          <Stack.Screen name="ContactUsScreen" component={ContactUsScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
          <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
          <Stack.Screen name="AccessibilityScreen" component={AccessibilityScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
