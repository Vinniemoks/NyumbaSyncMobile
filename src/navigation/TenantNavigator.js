import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Tenant Screens
import TenantHomeScreen from '../screens/Tenant/HomeScreen';
import TenantPaymentsScreen from '../screens/Tenant/PaymentsScreen';
import TenantLeaseScreen from '../screens/Tenant/LeaseScreen';
import TenantMaintenanceScreen from '../screens/Tenant/MaintenanceScreen';
import TenantDocumentsScreen from '../screens/Tenant/DocumentsScreen';
import TenantMessagesScreen from '../screens/Tenant/MessagesScreen';
import TenantProfileScreen from '../screens/Tenant/ProfileScreen';
import TenantNotificationsScreen from '../screens/Tenant/NotificationsScreen';
import ChatScreen from '../screens/Shared/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        component={TenantMessagesScreen}
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
        component={TenantProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={TenantNotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

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
          } else if (route.name === 'Lease') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
      <Tab.Screen name="Home" component={TenantHomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Payments" component={TenantPaymentsScreen} />
      <Tab.Screen name="Lease" component={TenantLeaseScreen} />
      <Tab.Screen name="Maintenance" component={TenantMaintenanceScreen} />
      <Tab.Screen name="Messages" component={MessagesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default TenantNavigator;
