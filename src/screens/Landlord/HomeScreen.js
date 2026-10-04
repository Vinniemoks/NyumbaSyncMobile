import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { propertyService, leaseService, maintenanceService } from '../../services/api';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';
import MorphingBackground from '../../components/MorphingBackground';

const LandlordHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Built from the landlord's own properties, leases and maintenance requests.
  const fetchStats = async () => {
    try {
      const [props, leases, maint] = await Promise.allSettled([
        propertyService.getByLandlord(),
        leaseService.getByLandlord(),
        maintenanceService.getAll(),
      ]);
      const propList = props.status === 'fulfilled' ? props.value.data?.properties || [] : [];
      const leaseList = leases.status === 'fulfilled' && Array.isArray(leases.value.data) ? leases.value.data : [];
      const maintList = maint.status === 'fulfilled' && Array.isArray(maint.value.data) ? maint.value.data : [];
      const active = leaseList.filter((l) => l.status === 'active');
      setStats({
        monthlyRent: active.reduce((n, l) => n + (Number(l.terms?.rentAmount) || 0), 0),
        properties: propList.length,
        tenants: new Set(active.map((l) => String(l.tenant?._id || l.tenant))).size,
        openMaintenance: maintList.filter((r) => ['reported', 'assigned', 'in_progress'].includes(r.status)).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <MorphingBackground />
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />
      }
    >
      <View style={commonStyles.headerCentered}>
        <Text style={commonStyles.greeting}>Welcome back,</Text>
        <Text style={commonStyles.userName}>{user?.firstName || 'Landlord'}</Text>
      </View>

      <View style={commonStyles.flexWrap}>
        <View style={commonStyles.statCard}>
          <Ionicons name="cash-outline" size={32} color={colors.success} />
          <Text style={commonStyles.statValue}>
            KSh {(stats?.monthlyRent || 0).toLocaleString()}
          </Text>
          <Text style={commonStyles.statLabel}>Monthly rent</Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="home-outline" size={32} color={colors.info} />
          <Text style={commonStyles.statValue}>{stats?.properties || 0}</Text>
          <Text style={commonStyles.statLabel}>Properties</Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="people-outline" size={32} color={colors.purple[500]} />
          <Text style={commonStyles.statValue}>{stats?.tenants || 0}</Text>
          <Text style={commonStyles.statLabel}>Tenants</Text>
        </View>
        <View style={commonStyles.statCard}>
          <Ionicons name="construct-outline" size={32} color={colors.warning} />
          <Text style={commonStyles.statValue}>{stats?.openMaintenance || 0}</Text>
          <Text style={commonStyles.statLabel}>Open requests</Text>
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
        <View style={commonStyles.flexWrapBetween}>
          <TouchableOpacity
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Ionicons name="business-outline" size={32} color={colors.info} />
            <Text style={commonStyles.actionCardText}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Tenants')}
          >
            <Ionicons name="people-outline" size={32} color={colors.success} />
            <Text style={commonStyles.actionCardText}>Tenants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Maintenance')}
          >
            <Ionicons name="construct-outline" size={32} color={colors.warning} />
            <Text style={commonStyles.actionCardText}>Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={commonStyles.actionCard}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Ionicons name="stats-chart-outline" size={32} color={colors.purple[500]} />
            <Text style={commonStyles.actionCardText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
};

export default LandlordHomeScreen;
