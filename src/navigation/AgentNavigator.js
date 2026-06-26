import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

import AgentHomeScreen from '../screens/Agent/HomeScreen';
import LandlordPropertiesScreen from '../screens/Landlord/PropertiesScreen';
import AgentClientsScreen from '../screens/Agent/ClientsScreen';
import AgentProfileScreen from '../screens/Agent/ProfileScreen';
import LandlordNotificationsScreen from '../screens/Landlord/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: typography.fontWeight.bold },
      }}
    >
      <Stack.Screen name="ProfileMain" component={AgentProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={LandlordNotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
};

const AgentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Listings') iconName = focused ? 'business' : 'business-outline';
          else if (route.name === 'Clients') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surfaceHover },
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: typography.fontWeight.bold },
      })}
    >
      <Tab.Screen name="Home" component={AgentHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Listings" component={LandlordPropertiesScreen} />
      <Tab.Screen name="Clients" component={AgentClientsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default AgentNavigator;
