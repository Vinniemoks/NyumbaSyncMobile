import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const PropertyManagerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Property Manager'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Property Manager</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={32} color={colors.info} />
          <Text style={styles.statValue}>28</Text>
          <Text style={styles.statLabel}>Properties Managed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Total Tenants</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color={colors.success} />
          <Text style={styles.statValue}>KSh 2.4M</Text>
          <Text style={styles.statLabel}>Monthly Collections</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={32} color={colors.warning} />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Requests</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Ionicons name="business-outline" size={32} color={colors.info} />
            <Text style={styles.actionCardText}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Tenants')}
          >
            <Ionicons name="people-outline" size={32} color={colors.success} />
            <Text style={styles.actionCardText}>Tenants</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Maintenance')}
          >
            <Ionicons name="construct-outline" size={32} color={colors.warning} />
            <Text style={styles.actionCardText}>Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="document-text-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[
          { icon: 'cash', color: colors.success, title: 'Payment Received', subtitle: 'Unit A-101 - KSh 35,000', time: '2h ago' },
          { icon: 'construct', color: colors.warning, title: 'Maintenance Completed', subtitle: 'Plumbing repair - Unit B-205', time: '5h ago' },
          { icon: 'person-add', color: colors.info, title: 'New Tenant Added', subtitle: 'John Doe - Unit C-302', time: '1d ago' },
        ].map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
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
    backgroundColor: '#1E3A8A',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.xl,
    marginTop: spacing[2],
  },
  roleText: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.blue[300],
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  activityTime: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
});

export default PropertyManagerHomeScreen;
