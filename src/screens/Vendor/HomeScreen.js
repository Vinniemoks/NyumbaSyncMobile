import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const VendorHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Vendor'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Service Provider</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={32} color={colors.warning} />
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
          <Text style={styles.statValue}>45</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color={colors.info} />
          <Text style={styles.statValue}>KSh 125K</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Jobs')}
          >
            <Ionicons name="list-outline" size={32} color={colors.info} />
            <Text style={styles.actionCardText}>My Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Jobs')}
          >
            <Ionicons name="add-circle-outline" size={32} color={colors.success} />
            <Text style={styles.actionCardText}>New Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Ionicons name="wallet-outline" size={32} color={colors.warning} />
            <Text style={styles.actionCardText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="settings-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {[
          { id: 1, title: 'Plumbing Repair', property: 'Riverside Apartments', unit: 'A-101', status: 'in_progress', amount: 5000 },
          { id: 2, title: 'AC Maintenance', property: 'Westlands Tower', unit: 'B-205', status: 'pending', amount: 8000 },
          { id: 3, title: 'Electrical Work', property: 'Kilimani Plaza', unit: 'C-302', status: 'completed', amount: 12000 },
        ].map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: job.status === 'completed' ? '#10B98120' : job.status === 'in_progress' ? '#F59E0B20' : '#3B82F620' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: job.status === 'completed' ? '#10B981' : job.status === 'in_progress' ? '#F59E0B' : '#3B82F6' }
                ]}>
                  {job.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.jobDetailText}>{job.property}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.jobDetailText}>Unit {job.unit}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="cash-outline" size={16} color={colors.success} />
                <Text style={[styles.jobDetailText, { color: colors.success }]}>KSh {job.amount.toLocaleString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing[5],
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing[1],
  },
  roleBadge: {
    backgroundColor: '#422006',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.xl,
    marginTop: spacing[2],
  },
  roleText: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FED7AA',
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing[5],
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  section: {
    padding: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardText: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginTop: spacing[2],
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  jobTitle: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: 10,
    paddingVertical: spacing[1] + 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  jobDetails: {
    gap: spacing[2],
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
});

export default VendorHomeScreen;
