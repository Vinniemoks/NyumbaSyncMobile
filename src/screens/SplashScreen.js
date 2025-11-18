import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (user) {
          // Navigate based on user role
          const roleRoutes = {
            landlord: 'LandlordDashboard',
            property_manager: 'PropertyManagerDashboard',
            tenant: 'TenantDashboard',
            admin: 'AdminDashboard',
            vendor: 'VendorDashboard',
            agent: 'AgentDashboard',
          };
          navigation.replace(roleRoutes[user.role] || 'Login');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    }
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏠</Text>
      <Text style={styles.title}>NyumbaSync</Text>
      <Text style={styles.subtitle}>Property Management Made Simple</Text>
      <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
