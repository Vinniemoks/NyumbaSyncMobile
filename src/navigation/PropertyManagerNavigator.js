import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Property Manager Screens
import PropertyManagerHomeScreen from '../screens/PropertyManager/HomeScreen';
import LandlordPropertiesScreen from '../screens/Landlord/PropertiesScreen';
import PropertyUnitsScreen from '../screens/Landlord/PropertyUnitsScreen';
import LandlordTenantsScreen from '../screens/Landlord/TenantsScreen';
import LandlordMaintenanceScreen from '../screens/Landlord/MaintenanceScreen';
import LandlordAnalyticsScreen from '../screens/Landlord/AnalyticsScreen';
import LandlordMessagesScreen from '../screens/Landlord/MessagesScreen';
import PropertyManagerProfileScreen from '../screens/PropertyManager/ProfileScreen';
import LandlordNotificationsScreen from '../screens/Landlord/NotificationsScreen';
import ChatScreen from '../screens/Shared/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Properties Stack Navigator
const PropertiesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="PropertiesList" 
        component={LandlordPropertiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PropertyUnits" 
        component={PropertyUnitsScreen}
        options={{ title: 'Property Units' }}
      />
    </Stack.Navigator>
  );
};

// Messages Stack Navigator
const MessagesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MessagesList" 
        component={LandlordMessagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={PropertyManagerProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={LandlordNotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

const PropertyManagerNavigator = () => {
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
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={PropertyManagerHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Properties" component={PropertiesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Tenants" component={LandlordTenantsScreen} />
      <Tab.Screen name="Maintenance" component={LandlordMaintenanceScreen} />
      <Tab.Screen name="Reports" component={LandlordAnalyticsScreen} options={{ title: 'Reports' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default PropertyManagerNavigator;
