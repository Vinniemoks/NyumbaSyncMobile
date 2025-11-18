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
          color="#3B82F6"
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
            <Ionicons name="card-outline" size={32} color="#3B82F6" />
            <Text style={styles.actionText}>Pay Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRequestMaintenance}>
            <Ionicons name="construct-outline" size={32} color="#10B981" />
            <Text style={styles.actionText}>Request Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  propertyCard: {
    padding: 20,
  },
  propertyInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyTag: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  propertyTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  recentActivity: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#1F2937',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default TenantHomeScreen;
