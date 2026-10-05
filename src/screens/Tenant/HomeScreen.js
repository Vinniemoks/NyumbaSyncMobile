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
import { colors, spacing, commonStyles } from '../../config/theme';
import Button from '../../components/Button';
import { Heading, Figure, Section, Rows, Row, today } from '../../components/ui';

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

  const dueNote = stats.daysUntilRent === null ? null
    : stats.daysUntilRent === 0 ? 'Due today'
    : `Due in ${stats.daysUntilRent} day${stats.daysUntilRent === 1 ? '' : 's'}`;

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
    >
      <Heading eyebrow={today()} title={user?.firstName || 'Home'} />

      {stats.hasLease ? (
        <Figure label="Rent due" value={`KSh ${stats.rentDue.toLocaleString()}`} note={dueNote} />
      ) : (
        <Figure label="Lease" value="None yet" note="Your rent and lease details appear here once your landlord sets up your lease." />
      )}

      {stats.hasLease && (
        <Button title="Pay rent" size="lg" onPress={handlePayRent} />
      )}

      <Section title="At a glance" />
      <Rows>
        <Row
          label="Maintenance"
          value={stats.maintenanceActive ? `${stats.maintenanceActive} open` : 'None open'}
          onPress={() => navigation.navigate('Maintenance')}
        />
        {stats.hasLease && stats.leaseEndDays !== null && (
          <Row label="Lease ends" value={`${stats.leaseEndDays} days`} tone={stats.leaseEndDays <= 60 ? colors.warning : undefined} />
        )}
        <Row label="Messages" onPress={() => navigation.navigate('Messages')} />
        <Row label="Documents" onPress={() => navigation.navigate('Profile', { screen: 'Documents' })} />
      </Rows>

      {!!(addressText(property) || property?.title || property?.name) && (
        <>
          <Section title="Your home" />
          <Rows>
            <Row
              label={addressText(property) || property?.title || property?.name}
              note={[
                property?.bedrooms ? `${property.bedrooms} bed` : null,
                property?.bathrooms ? `${property.bathrooms} bath` : null,
                property?.type,
              ].filter(Boolean).join(' · ') || undefined}
            />
          </Rows>
        </>
      )}

      {activities.length > 0 && (
        <>
          <Section title="Recent" />
          <Rows>
            {activities.map((item) => (
              <Row key={item.id} label={item.title} note={item.subtitle} value={item.time} />
            ))}
          </Rows>
        </>
      )}
    </ScrollView>
  );
};

export default TenantHomeScreen;
