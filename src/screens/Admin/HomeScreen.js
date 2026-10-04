import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../config/theme';
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

  const cards = stats && [
    { icon: 'people', color: colors.info, label: 'Users', value: nf(stats.totalUsers), note: `${nf(stats.activeUsers)} active`, to: 'Users' },
    { icon: 'business', color: colors.primaryLight, label: 'Properties', value: nf(stats.totalProperties), note: `${stats.occupancyRate}% occupied`, to: 'Properties' },
    { icon: 'cash', color: colors.success, label: 'Revenue this month', value: money(stats.monthlyRevenue, stats.currency), note: growth(stats.revenueGrowth) || `${nf(stats.monthlyTransactions)} payments` },
    { icon: 'document-text', color: colors.gold, label: 'Active leases', value: nf(stats.activeLeases), note: `${nf(stats.activeTenants)} tenants` },
    { icon: 'construct', color: colors.warning, label: 'Open maintenance', value: nf(stats.pendingMaintenance), note: `${stats.maintenanceResolutionRate}% resolved` },
    { icon: 'trending-up', color: colors.primary, label: 'New users', value: growth(stats.userGrowth) ? `${stats.userGrowth > 0 ? '+' : ''}${stats.userGrowth}%` : '—', note: 'vs last month' },
  ];

  const roles = stats && [
    ['Landlords', stats.activeLandlords], ['Managers', stats.activeManagers],
    ['Agents', stats.activeAgents], ['Vendors', stats.activeVendors], ['Tenants', stats.activeTenants],
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.hello}>
        <View>
          <Text style={styles.helloSub}>Welcome back</Text>
          <Text style={styles.helloName}>{user?.firstName || 'Admin'}</Text>
        </View>
        <View style={styles.pill}><Text style={styles.pillText}>{roleLabel(user?.role)}</Text></View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.info} style={{ marginTop: spacing[10] }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.grid}>
            {cards.map((c) => (
              <TouchableOpacity key={c.label} style={styles.card} disabled={!c.to} onPress={() => navigation.navigate(c.to)} activeOpacity={0.8}>
                <View style={[styles.cardIcon, { backgroundColor: `${c.color}1A` }]}><Ionicons name={c.icon} size={18} color={c.color} /></View>
                <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{c.value}</Text>
                <Text style={styles.label} numberOfLines={1}>{c.label}</Text>
                <Text style={styles.note} numberOfLines={1}>{c.note}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Accounts by role</Text>
          <View style={styles.rolesCard}>
            {roles.map(([name, n]) => (
              <View key={name} style={styles.roleCell}>
                <Text style={styles.roleNum}>{nf(n)}</Text>
                <Text style={styles.roleName}>{name}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hello: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  helloSub: { color: colors.textSecondary, fontSize: typography.sm },
  helloName: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800' },
  pill: { backgroundColor: colors.leafTint, borderRadius: 999, paddingHorizontal: spacing[3], paddingVertical: 6 },
  pillText: { color: colors.primary, fontWeight: '800', fontSize: typography.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  card: {
    width: '47.5%', padding: spacing[3], backgroundColor: colors.surface,
    borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
  },
  cardIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  value: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800' },
  label: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2, fontWeight: '600' },
  note: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  section: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '800', marginTop: spacing[4], marginBottom: spacing[2] },
  rolesCard: {
    flexDirection: 'row', justifyContent: 'space-between', padding: spacing[3], backgroundColor: colors.surface,
    borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
  },
  roleCell: { alignItems: 'center', flex: 1 },
  roleNum: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '800' },
  roleName: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  error: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[10] },
});

export default AdminHomeScreen;
