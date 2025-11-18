import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { paymentService, maintenanceService } from '../../services/api';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIcon}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const TenantHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    rentDue: 35000,
    daysUntilRent: 15,
    maintenanceActive: 2,
    leaseEndDays: 45,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch fresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePayRent = () => {
    navigation.navigate('Payments');
  };

  const handleRequestMaintenance = () => {
    navigation.navigate('Maintenance');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Tenant'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Rent Due"
          value={`KSh ${stats.rentDue.toLocaleString()}`}
          subtitle={`Due in ${stats.daysUntilRent} days`}
          icon="cash-outline"
          color="#6366F1"
        />
        <StatCard
          title="Maintenance"
          value={`${stats.maintenanceActive} Active`}
          subtitle="Requests pending"
          icon="construct-outline"
          color="#F59E0B"
        />
        <StatCard
          title="Lease End"
          value={`${stats.leaseEndDays} Days`}
          subtitle="Renewal available"
          icon="calendar-outline"
          color="#10B981"
        />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePayRent}>
            <Ionicons name="card-outline" size={32} color="#6366F1" />
            <Text style={styles.actionText}>Pay Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRequestMaintenance}>
            <Ionicons name="construct-outline" size={32} color="#10B981" />
            <Text style={styles.actionText}>Request Help</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain', params: { navigateTo: 'Documents' } })}
          >
            <Ionicons name="document-text-outline" size={32} color="#818CF8" />
            <Text style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubble-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.propertyCard}>
        <Text style={styles.sectionTitle}>Your Property</Text>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyAddress}>123 Riverside Drive, Nairobi</Text>
          <View style={styles.propertyDetails}>
            <View style={styles.propertyTag}>
              <Text style={styles.propertyTagText}>3 Bedrooms</Text>
            </View>
            <View style={styles.propertyTag}>
              <Text style={styles.propertyTagText}>2 Bathrooms</Text>
            </View>
            <View style={styles.propertyTag}>
              <Text style={styles.propertyTagText}>Parking</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Payment Received</Text>
              <Text style={styles.activitySubtitle}>Rent for November 2025</Text>
            </View>
            <Text style={styles.activityTime}>2d ago</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A', // slate-900
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#64748B', // slate-500
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
  },
  propertyCard: {
    padding: 20,
  },
  propertyInfo: {
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyTag: {
    backgroundColor: '#312E81', // indigo-900
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  propertyTagText: {
    fontSize: 12,
    color: '#A5B4FC', // indigo-300
    fontWeight: '500',
  },
  recentActivity: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B', // slate-500
  },
});

export default TenantHomeScreen;
