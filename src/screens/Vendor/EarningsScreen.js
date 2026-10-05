import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useVendorJobs } from '../../utils/vendorJobs';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

// Work you have completed, with the cost you recorded for it. (Payment status
// is not tracked by the platform, so nothing here claims "paid" or "pending".)
const VendorEarningsScreen = () => {
  const { jobs, loading, error } = useVendorJobs();
  const done = jobs
    .filter((j) => j.group === 'completed')
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const now = new Date();
  const total = done.reduce((n, j) => n + j.amount, 0);
  const month = done
    .filter((j) => j.completedAt && j.completedAt.getMonth() === now.getMonth() && j.completedAt.getFullYear() === now.getFullYear())
    .reduce((n, j) => n + j.amount, 0);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Completed work</Text>
        <Text style={styles.summaryAmount}>KSh {total.toLocaleString()}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.cell}><Text style={styles.cellV}>KSh {month.toLocaleString()}</Text><Text style={styles.cellK}>This month</Text></View>
          <View style={styles.cell}><Text style={styles.cellV}>{done.length}</Text><Text style={styles.cellK}>Jobs done</Text></View>
        </View>
      </View>

      <FlatList
        data={done}
        keyExtractor={(j) => j.id}
        contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}
        ListEmptyComponent={
          <Text style={styles.empty}>{error ? 'Could not load your jobs.' : 'Completed jobs appear here with their cost.'}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.sub} numberOfLines={1}>
                {[item.property, item.completedAt ? item.completedAt.toLocaleDateString() : item.date].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text style={styles.amount}>KSh {item.amount.toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  summary: { margin: spacing[3], padding: spacing[4], backgroundColor: colors.primary, borderRadius: borderRadius['2xl'] },
  summaryLabel: { color: '#DCFCE7', fontSize: typography.sm },
  summaryAmount: { color: colors.white, fontSize: typography['3xl'], fontWeight: '700', marginTop: 2 },
  summaryRow: { flexDirection: 'row', marginTop: spacing[3], gap: spacing[3] },
  cell: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: borderRadius.xl, padding: spacing[3] },
  cellV: { color: colors.white, fontWeight: '700', fontSize: typography.base },
  cellK: { color: '#DCFCE7', fontSize: typography.xs, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], marginBottom: spacing[2], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontWeight: '700' },
  sub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  amount: { color: colors.success, fontWeight: '700' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[8], paddingHorizontal: spacing[5] },
});

export default VendorEarningsScreen;
