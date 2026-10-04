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
import { paymentService, maintenanceService, leaseService } from '../../services/api';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';
import MorphingBackground from '../../components/MorphingBackground';

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

// The API sends the address as an object ({ street, area, city, county }).
const addressText = (p) => {
  const a = p?.address;
  if (!a) return '';
  return typeof a === 'string' ? a : [a.street, a.area, a.city].filter(Boolean).join(', ');
};

const TenantHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    hasLease: false,
    rentDue: 0,
    daysUntilRent: null,
    maintenanceActive: 0,
    leaseEndDays: null,
  });
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [leaseRes, paymentsRes, maintenanceRes] = await Promise.allSettled([
        leaseService.getByTenant(user?.id),
        paymentService.getHistory(),
        maintenanceService.getAll(),
      ]);

      const leases = leaseRes.status === 'fulfilled' && Array.isArray(leaseRes.value.data) ? leaseRes.value.data : [];
      const lease = leases.find((l) => l.status === 'active') || null;
      const payments = paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : [];
      const maintenance = maintenanceRes.status === 'fulfilled' && Array.isArray(maintenanceRes.value.data) ? maintenanceRes.value.data : [];

      const today = new Date();
      const rent = Number(lease?.terms?.rentAmount) || 0;
      let daysUntilRent = null;
      if (lease) {
        const dueDay = Number(lease.terms?.rentDueDate) || 1;
        let due = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (due < new Date(today.getFullYear(), today.getMonth(), today.getDate())) due = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
        daysUntilRent = Math.ceil((due - today) / 86400000);
      }
      const leaseEndDays = lease?.endDate ? Math.max(0, Math.ceil((new Date(lease.endDate) - today) / 86400000)) : null;

      setStats({
        hasLease: !!lease,
        rentDue: rent,
        daysUntilRent,
        maintenanceActive: maintenance.filter((r) => ['reported', 'assigned', 'in_progress'].includes(r.status)).length,
        leaseEndDays,
      });
      setProperty(lease?.property || null);

      const recentPayments = payments
        .filter((p) => ['completed', 'verified'].includes(p.status))
        .slice(0, 3)
        .map((p) => ({
          id: `pay-${p._id || p.id}`,
          title: 'Payment received',
          subtitle: `Rent payment — KSh ${Number(p.amount || 0).toLocaleString()}`,
          time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
          icon: 'checkmark-circle',
          color: colors.success,
        }));
      const recentMaintenance = maintenance.slice(0, 3).map((r) => ({
        id: `mnt-${r.id || r._id}`,
        title: 'Maintenance request',
        subtitle: `${r.title || r.category || 'Issue'} — ${String(r.status).replace(/_/g, ' ')}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
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
    <View style={commonStyles.container}>
      <MorphingBackground />
    <ScrollView
      style={{ flex: 1 }}
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
        {stats.hasLease ? (
          <StatCard
            title="Rent Due"
            value={`KSh ${stats.rentDue.toLocaleString()}`}
            subtitle={stats.daysUntilRent === 0 ? 'Due today' : `Due in ${stats.daysUntilRent} day${stats.daysUntilRent === 1 ? '' : 's'}`}
            icon="cash-outline"
            color={colors.info}
          />
        ) : (
          <StatCard
            title="Lease"
            value="No active lease"
            subtitle="Your rent and lease details appear here once your landlord activates your lease"
            icon="document-text-outline"
            color={colors.textMuted}
          />
        )}
        <StatCard
          title="Maintenance"
          value={`${stats.maintenanceActive} open`}
          subtitle={stats.maintenanceActive === 1 ? 'request in progress' : 'requests in progress'}
          icon="construct-outline"
          color={colors.warning}
        />
        {stats.hasLease && stats.leaseEndDays !== null && (
          <StatCard
            title="Lease Ends"
            value={`${stats.leaseEndDays} days`}
            subtitle={stats.leaseEndDays <= 60 ? 'Contact your landlord about renewal' : 'Lease in good standing'}
            icon="calendar-outline"
            color={colors.success}
          />
        )}
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
            onPress={() => navigation.navigate('Browse')}
          >
            <Ionicons name="search-outline" size={32} color={colors.gold} />
            <Text style={commonStyles.actionCardText}>Browse Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'Documents' })}
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
            {addressText(property) || property?.title || property?.name || 'No property assigned'}
          </Text>
          <View style={commonStyles.propertyDetails}>
            {!!property?.bedrooms && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.bedrooms} Bedrooms</Text>
              </View>
            )}
            {!!property?.bathrooms && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.bathrooms} Bathrooms</Text>
              </View>
            )}
            {!!property?.type && (
              <View style={commonStyles.tag}>
                <Text style={commonStyles.tagText}>{property.type}</Text>
              </View>
            )}
            {!!property?.size && (
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
    </View>
  );
};

export default TenantHomeScreen;
