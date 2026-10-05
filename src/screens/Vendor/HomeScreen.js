import React from 'react';
import { Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useVendorJobs } from '../../utils/vendorJobs';
import { colors, spacing } from '../../config/theme';
import { Heading, Figure, Section, Rows, Row, today } from '../../components/ui';

const VendorHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { jobs, loading, error } = useVendorJobs();

  const now = new Date();
  const monthEarned = jobs
    .filter((j) => j.group === 'completed' && j.completedAt && j.completedAt.getMonth() === now.getMonth() && j.completedAt.getFullYear() === now.getFullYear())
    .reduce((n, j) => n + j.amount, 0);
  const count = (g) => jobs.filter((j) => j.group === g).length;
  const recent = jobs.slice(0, 4);
  const toJobs = () => navigation.navigate('Jobs');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
      <Heading eyebrow={today()} title={user?.firstName || 'Home'} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="small" color={colors.textMuted} />
      ) : error ? (
        <Text style={styles.empty}>Could not load your jobs. Open the Jobs tab to retry.</Text>
      ) : (
        <>
          <Figure label="Earned this month" value={`KSh ${monthEarned.toLocaleString()}`} />
          <Rows>
            <Row label="New" value={count('pending')} onPress={toJobs} />
            <Row label="In progress" value={count('in_progress')} onPress={toJobs} />
            <Row label="Completed" value={count('completed')} onPress={toJobs} />
          </Rows>

          {recent.length > 0 && (
            <>
              <Section title="Latest jobs" action="All jobs" onAction={toJobs} />
              <Rows>
                {recent.map((j) => (
                  <Row
                    key={j.id}
                    label={j.title}
                    note={[j.property, j.unit].filter(Boolean).join(' · ') || j.date}
                    value={j.status.replace(/_/g, ' ')}
                    cap
                    onPress={toJobs}
                  />
                ))}
              </Rows>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textSecondary, marginTop: spacing[6] },
});

export default VendorHomeScreen;
