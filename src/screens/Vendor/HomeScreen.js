import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useVendorJobs } from '../../utils/vendorJobs';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const VendorHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { jobs, loading, error } = useVendorJobs();

  const now = new Date();
  const monthEarned = jobs
    .filter((j) => j.group === 'completed' && j.completedAt && j.completedAt.getMonth() === now.getMonth() && j.completedAt.getFullYear() === now.getFullYear())
    .reduce((n, j) => n + j.amount, 0);

  const cards = [
    { icon: 'hammer', color: colors.info, label: 'New', value: jobs.filter((j) => j.group === 'pending').length },
    { icon: 'construct', color: colors.warning, label: 'In progress', value: jobs.filter((j) => j.group === 'in_progress').length },
    { icon: 'checkmark-circle', color: colors.success, label: 'Completed', value: jobs.filter((j) => j.group === 'completed').length },
    { icon: 'cash', color: colors.primary, label: 'Earned this month', value: `KSh ${monthEarned.toLocaleString()}` },
  ];
  const recent = jobs.slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}>
      <Text style={styles.sub}>Welcome back</Text>
      <Text style={styles.name}>{user?.firstName || 'Vendor'}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="large" color={colors.info} />
      ) : error ? (
        <Text style={styles.empty}>Could not load your jobs. Open the Jobs tab to retry.</Text>
      ) : (
        <>
          <View style={styles.grid}>
            {cards.map((c) => (
              <TouchableOpacity key={c.label} style={styles.card} onPress={() => navigation.navigate('Jobs')} activeOpacity={0.8}>
                <View style={[styles.icon, { backgroundColor: `${c.color}1A` }]}><Ionicons name={c.icon} size={18} color={c.color} /></View>
                <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{c.value}</Text>
                <Text style={styles.label}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Latest jobs</Text>
          {recent.length === 0 ? (
            <Text style={styles.empty}>No jobs yet. Jobs assigned to you appear here.</Text>
          ) : (
            recent.map((j) => (
              <TouchableOpacity key={j.id} style={styles.job} onPress={() => navigation.navigate('Jobs')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>{j.title}</Text>
                  <Text style={styles.jobSub} numberOfLines={1}>{[j.property, j.unit].filter(Boolean).join(' · ') || j.date}</Text>
                </View>
                <Text style={styles.jobStatus}>{j.status.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sub: { color: colors.textSecondary, fontSize: typography.sm },
  name: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800', marginBottom: spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  card: { width: '47.5%', padding: spacing[3], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  value: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800' },
  label: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2, fontWeight: '600' },
  section: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '800', marginTop: spacing[4], marginBottom: spacing[2] },
  job: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], marginBottom: spacing[2], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  jobTitle: { color: colors.textPrimary, fontWeight: '700' },
  jobSub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  jobStatus: { color: colors.primary, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[6] },
});

export default VendorHomeScreen;
