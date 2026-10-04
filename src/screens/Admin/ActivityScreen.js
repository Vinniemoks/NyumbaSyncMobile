import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const REASONS = {
  ok: 'Signed in',
  ok_ip_verified: 'Signed in (new network confirmed)',
  ok_mfa_pending: 'Passed password, waiting for code',
  require_ip_verification: 'New network, code sent',
  require_password_change: 'Must change password',
  admin_login_no_mfa: 'Signed in',
  bad_password: 'Wrong password',
  ip_code_failed: 'Wrong network code',
  unknown_user: 'Unknown account',
  account_suspended: 'Suspended account',
  account_inactive: 'Inactive account',
};
const label = (r) => REASONS[r] || String(r || '').replace(/_/g, ' ');

// Recent sign-in attempts across the platform (super admin / admin).
const ActivityScreen = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlyFailed, setOnlyFailed] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (p = 1) => {
    try {
      const { data } = await adminService.loginAudit({ page: p, limit: 30, success: onlyFailed ? 'false' : undefined });
      setItems((prev) => (p === 1 ? data.entries : [...prev, ...data.entries]));
      setPage(data.page || p);
      setPages(data.pages || 1);
      setError(null);
    } catch (e) {
      setError('Could not load sign-in activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onlyFailed]);

  useEffect(() => { setLoading(true); load(1); }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {[['All', false], ['Failed only', true]].map(([t, v]) => (
          <TouchableOpacity key={t} onPress={() => setOnlyFailed(v)} style={[styles.chip, onlyFailed === v && styles.chipActive]}>
            <Text style={[styles.chipText, onlyFailed === v && { color: colors.white }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.sub}>{error}</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(e) => String(e._id)}
          contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}
          onEndReached={() => page < pages && load(page + 1)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1); }} />}
          ListEmptyComponent={<Text style={[styles.sub, { textAlign: 'center', marginTop: spacing[10] }]}>No activity yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Ionicons name={item.success ? 'checkmark-circle' : 'close-circle'} size={22} color={item.success ? colors.success : colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.email || item.identifier || 'Unknown'}</Text>
                <Text style={styles.sub} numberOfLines={1}>{label(item.reason)}{item.method ? ` · ${item.method}` : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
                {!!item.ip && <Text style={styles.sub}>{item.ip}</Text>}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: spacing[2], padding: spacing[3] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '700', fontSize: typography.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3], marginBottom: spacing[2],
    backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
  },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.sm },
  sub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  time: { color: colors.textSecondary, fontSize: 11 },
});

export default ActivityScreen;
