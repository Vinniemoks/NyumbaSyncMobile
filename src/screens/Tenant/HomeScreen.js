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
import { paymentService, maintenanceService, tenantService } from '../../services/api';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <View style={[commonStyles.statCardFull, { borderLeftColor: color }]}>
    <View style={commonStyles.statIcon}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={commonStyles.statContent}>
      <Text style={commonStyles.statTitle}>{title}</Text>
      <Text style={commonStyles.statValue}>{value}</Text>
      <Text style={commonStyles.statSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const TenantHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    rentDue: 0,
    daysUntilRent: 0,
    maintenanceActive: 0,
    leaseEndDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [profileRes, paymentsRes, maintenanceRes] = await Promise.allSettled([
        tenantService.getById(user?.id),
        paymentService.getAll(),
        maintenanceService.getAll(),
      ]);

      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
      const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : [];
      const maintenance = maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data : [];

      const pendingPayments = Array.isArray(payments) ? payments.filter(p => p.status === 'pending') : [];
      const rentDue = pendingPayments.length > 0 ? pendingPayments[0].amount : 0;

      const activeRequests = Array.isArray(maintenance)
        ? maintenance.filter(r => ['reported', 'assigned', 'in_progress'].includes(r.status))
        : [];

      const leaseEndDate = profile?.leaseEndDate ? new Date(profile.leaseEndDate) : null;
      const leaseEndDays = leaseEndDate
        ? Math.max(0, Math.ceil((leaseEndDate - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;

      setStats({
        rentDue,
        daysUntilRent: profile?.daysUntilRent || 0,
        maintenanceActive: activeRequests.length,
        leaseEndDays,
      });

      setProperty(profile?.property || null);

      const recentPayments = (Array.isArray(payments) ? payments : [])
        .filter(p => p.status === 'completed')
        .slice(0, 3)
        .map(p => ({
          id: p._id,
          title: 'Payment Received',
          subtitle: `Rent payment — KSh ${p.amount?.toLocaleString() || '0'}`,
          time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently',
          icon: 'checkmark-circle',
          color: colors.success,
        }));
      const recentMaintenance = (Array.isArray(maintenance) ? maintenance : [])
        .slice(0, 3)
        .map(r => ({
          id: r._id,
          title: 'Maintenance Request',
          subtitle: `${r.title || r.category || 'Issue'} — ${r.status}`,
          time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
          icon: r.status === 'completed' ? 'checkmark-circle' : 'construct',
          color: r.status === 'completed' ? colors.success : colors.warning,
        }));
      setActivities([...recentPayments, ...recentMaintenance].slice(0, 5));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handlePayRent = () => {
    navigation.navigate('Payments', { screen: 'MakePayment' });
  };

  const handleRequestMaintenance = () => {
    navigation.navigate('Maintenance', { screen: 'SubmitRequest' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
            navigation.replace('Landing');
          }, 
          style: 'destructive' 
        },
      ]
    );
  };

  return (
    <ScrollView
      style={commonStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={commonStyles.header}>
        <View>
          <Text style={commonStyles.greeting}>Welcome back,</Text>
          <Text style={commonStyles.userName}>{user?.firstName || 'Tenant'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={commonStyles.section}>
        <StatCard
          title="Rent Due"
          value={`KSh ${stats.rentDue.toLocaleString()}`}
          subtitle={`Due in ${stats.daysUntilRent} days`}
          icon="cash-outline"
          color={colors.info}
        />
        <StatCard
          title="Maintenance"
          value={`${stats.maintenanceActive} Active`}
          subtitle="Requests pending"
          icon="construct-outline"
          color={colors.warning}
        />
        <StatCard
          title="Lease End"
          value={`${stats.leaseEndDays} Days`}
          subtitle="Renewal available"
          icon="calendar-outline"
          color={colors.success}
        />
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
        <View style={commonStyles.flexWrapBetween}>
          <TouchableOpacity style={commonStyles.actionCard} onPress={handlePayRent}>
            <Ionicons name="card-outline" size={32} color={colors.info} />
            <Text style={commonStyles.actionCardText}>Pay Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.actionCard} onPress={handleRequestMaintenance}>
            <Ionicons name="construct-outline" size={32} color={colors.success} />
            <Text style={commonStyles.actionCardText}>Request Help</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain', params: { navigateTo: 'Documents' } })}
          >
            <Ionicons name="document-text-outline" size={32} color={colors.blue[400]} />
            <Text style={commonStyles.actionCardText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubble-outline" size={32} color={colors.warning} />
            <Text style={commonStyles.actionCardText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Your Property</Text>
        <View style={commonStyles.propertyInfo}>
          <Text style={commonStyles.propertyAddress}>
            {property?.address || property?.name || 'No property assigned'}
          </Text>
          <View style={commonStyles.propertyDetails}>
            {property?.bedrooms && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.bedrooms} Bedrooms</Text>
              </View>
            )}
            {property?.bathrooms && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.bathrooms} Bathrooms</Text>
              </View>
            )}
            {property?.type && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.type}</Text>
              </View>
            )}
            {property?.size && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.size} sq ft</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Recent Activity</Text>
        {activities.length === 0 ? (
          <Text style={commonStyles.emptyState}>No recent activity</Text>
        ) : (
          activities.map((item) => (
            <View key={item.id} style={commonStyles.activityItem}>
              <View style={commonStyles.activityIcon}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={commonStyles.listItemContent}>
                <Text style={commonStyles.listItemTitle}>{item.title}</Text>
                <Text style={commonStyles.listItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={commonStyles.listItemMeta}>{item.time}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default TenantHomeScreen;
