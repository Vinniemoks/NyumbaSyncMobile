import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Tenant Screens
import TenantHomeScreen from '../screens/Tenant/HomeScreen';
import TenantPaymentsScreen from '../screens/Tenant/PaymentsScreen';
import TenantMaintenanceScreen from '../screens/Tenant/MaintenanceScreen';
import TenantProfileScreen from '../screens/Tenant/ProfileScreen';

const Tab = createBottomTabNavigator();

const TenantNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'construct' : 'construct-outline';
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
      <Tab.Screen name="Home" component={TenantHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Payments" component={TenantPaymentsScreen} />
      <Tab.Screen name="Maintenance" component={TenantMaintenanceScreen} />
      <Tab.Screen name="Profile" component={TenantProfileScreen} />
    </Tab.Navigator>
  );
};

export default TenantNavigator;
