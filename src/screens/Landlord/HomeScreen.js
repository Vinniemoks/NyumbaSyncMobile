import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { propertyService, leaseService, maintenanceService } from '../../services/api';
import { colors, spacing, commonStyles } from '../../config/theme';
import { Heading, Figure, Section, Rows, Row, today } from '../../components/ui';

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
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
    >
      <Heading eyebrow={today()} title={user?.firstName || 'Home'} />

      <Figure
        label="Rent due each month"
        value={`KSh ${(stats?.monthlyRent || 0).toLocaleString()}`}
        note={stats?.tenants ? `from ${stats.tenants} ${stats.tenants === 1 ? 'tenant' : 'tenants'}` : 'No active leases yet'}
      />

      <Rows>
        <Row label="Properties" value={stats?.properties || 0} onPress={() => navigation.navigate('Properties')} />
        <Row label="Tenants" value={stats?.tenants || 0} onPress={() => navigation.navigate('Tenants')} />
        <Row
          label="Open maintenance"
          value={stats?.openMaintenance || 0}
          tone={stats?.openMaintenance ? colors.warning : undefined}
          onPress={() => navigation.navigate('Maintenance')}
        />
      </Rows>
    </ScrollView>
  );
};

export default LandlordHomeScreen;
