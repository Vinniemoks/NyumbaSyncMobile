import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import VendorHomeScreen from '../screens/Vendor/HomeScreen';
import VendorJobsScreen from '../screens/Vendor/JobsScreen';
import VendorEarningsScreen from '../screens/Vendor/EarningsScreen';
import VendorProfileScreen from '../screens/Vendor/ProfileScreen';
import LandlordNotificationsScreen from '../screens/Landlord/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={VendorProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={LandlordNotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

const VendorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Jobs') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Earnings') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
        headerShown: true,
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={VendorHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Jobs" component={VendorJobsScreen} />
      <Tab.Screen name="Earnings" component={VendorEarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default VendorNavigator;
