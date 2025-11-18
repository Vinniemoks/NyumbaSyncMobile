import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Landlord Screens
import LandlordHomeScreen from '../screens/Landlord/HomeScreen';
import LandlordPropertiesScreen from '../screens/Landlord/PropertiesScreen';
import LandlordTenantsScreen from '../screens/Landlord/TenantsScreen';
import LandlordFinancesScreen from '../screens/Landlord/FinancesScreen';
import LandlordProfileScreen from '../screens/Landlord/ProfileScreen';

const Tab = createBottomTabNavigator();

const LandlordNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Properties') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Tenants') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Finances') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={LandlordHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Properties" component={LandlordPropertiesScreen} />
      <Tab.Screen name="Tenants" component={LandlordTenantsScreen} />
      <Tab.Screen name="Finances" component={LandlordFinancesScreen} />
      <Tab.Screen name="Profile" component={LandlordProfileScreen} />
    </Tab.Navigator>
  );
};

export default LandlordNavigator;
