import React, { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../config/theme';
import { Heading, Figure, Section, Rows, Row, today } from '../../components/ui';
import { roleLabel } from '../../utils/roles';

const nf = (n) => Number(n || 0).toLocaleString();
const money = (n, cur = 'KES') => `${cur === 'KES' ? 'KSh' : cur} ${nf(n)}`;
const growth = (g) => (typeof g === 'number' && g !== 0 ? `${g > 0 ? '+' : ''}${g}% vs last month` : null);

const AdminHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminService.stats();
      setStats(data.stats);
      setError(null);
    } catch (e) {
      setError('Could not load the dashboard. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = stats && [
    { label: 'Users', value: nf(stats.totalUsers), note: `${nf(stats.activeUsers)} active`, to: 'Users' },
    { label: 'Properties', value: nf(stats.totalProperties), note: `${stats.occupancyRate}% occupied`, to: 'Properties' },
    { label: 'Active leases', value: nf(stats.activeLeases), note: `${nf(stats.activeTenants)} ${stats.activeTenants === 1 ? "tenant" : "tenants"}` },
    { label: 'Open maintenance', value: nf(stats.pendingMaintenance), note: `${stats.maintenanceResolutionRate}% resolved` },
  ];

  const roles = stats && [
    ['Landlords', stats.activeLandlords], ['Managers', stats.activeManagers],
    ['Agents', stats.activeAgents], ['Vendors', stats.activeVendors], ['Tenants', stats.activeTenants],
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.textMuted} />}
    >
      <Heading eyebrow={`${today()} · ${roleLabel(user?.role)}`} title={user?.firstName || 'Admin'} />

      {loading ? (
        <ActivityIndicator size="small" color={colors.textMuted} style={{ marginTop: spacing[10] }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Figure
            label="Collected this month"
            value={money(stats.monthlyRevenue, stats.currency)}
            note={growth(stats.revenueGrowth) || `${nf(stats.monthlyTransactions)} payments`}
          />
          <Rows>
            {rows.map((r) => (
              <Row key={r.label} label={r.label} note={r.note} value={r.value} onPress={r.to ? () => navigation.navigate(r.to) : undefined} />
            ))}
          </Rows>

          <Section title="Accounts by role" />
          <Rows>
            {roles.map(([name, n]) => <Row key={name} label={name} value={nf(n)} />)}
          </Rows>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  error: { color: colors.textSecondary, marginTop: spacing[10] },
});

export default AdminHomeScreen;
