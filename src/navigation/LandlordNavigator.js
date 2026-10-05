import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

// Landlord Screens
import LandlordHomeScreen from '../screens/Landlord/HomeScreen';
import LandlordPropertiesScreen from '../screens/Landlord/PropertiesScreen';
import AddPropertyScreen from '../screens/Landlord/AddPropertyScreen';
import PropertyUnitsScreen from '../screens/Landlord/PropertyUnitsScreen';
import LandlordTenantsScreen from '../screens/Landlord/TenantsScreen';
import LandlordMaintenanceScreen from '../screens/Landlord/MaintenanceScreen';
import LandlordAnalyticsScreen from '../screens/Landlord/AnalyticsScreen';
import AddTenantScreen from '../screens/Landlord/AddTenantScreen';
import LandlordDocumentsScreen from '../screens/Landlord/DocumentsScreen';
import LandlordMessagesScreen from '../screens/Landlord/MessagesScreen';
import LandlordProfileScreen from '../screens/Landlord/ProfileScreen';
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
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
        },
      }}
    >
      <Stack.Screen
        name="PropertiesList"
        component={LandlordPropertiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{ title: 'Add Property' }}
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
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
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
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={LandlordProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Documents" component={LandlordDocumentsScreen} options={{ title: 'Documents' }} />
      <Stack.Screen
        name="Notifications"
        component={LandlordNotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

// Tenants Stack Navigator: the list, with "add a tenant" opening the lease form.
const TenantsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0.5, borderBottomColor: colors.border, backgroundColor: colors.bg },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: typography.fontWeight.bold },
      }}
    >
      <Stack.Screen
        name="TenantsList"
        component={LandlordTenantsScreen}
        options={({ navigation }) => ({
          title: 'Tenants',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddTenant')}
              accessibilityRole="button"
              accessibilityLabel="Add a tenant"
              style={{ paddingHorizontal: spacing[4] }}
            >
              <Ionicons name="person-add" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="AddTenant" component={AddTenantScreen} options={{ title: 'Add Tenant' }} />
    </Stack.Navigator>
  );
};

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
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
        },
      })}
    >
      <Tab.Screen name="Home" component={LandlordHomeScreen} options={{ title: 'Dashboard', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Properties" component={PropertiesStack} options={{ headerShown: false }} />
      <Tab.Screen name="Tenants" component={TenantsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Maintenance" component={LandlordMaintenanceScreen} options={{ tabBarLabel: 'Repairs' }} />
      <Tab.Screen name="Analytics" component={LandlordAnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default LandlordNavigator;
