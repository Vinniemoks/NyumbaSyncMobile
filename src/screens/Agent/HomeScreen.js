import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const AgentHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Agent'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Real Estate Agent</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={32} color={colors.info} />
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>32</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Closed Deals</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color={colors.warning} />
          <Text style={styles.statValue}>KSh 450K</Text>
          <Text style={styles.statLabel}>Commission</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Listings')}>
            <Ionicons name="business-outline" size={32} color={colors.info} />
            <Text style={styles.actionCardText}>My Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Clients')}>
            <Ionicons name="people-outline" size={32} color={colors.success} />
            <Text style={styles.actionCardText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle-outline" size={32} color={colors.warning} />
            <Text style={styles.actionCardText}>Add Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Viewings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Listings</Text>
        {[
          { id: 1, title: 'Westlands 3BR Apartment', price: 85000, status: 'available', views: 45 },
          { id: 2, title: 'Kilimani 2BR Penthouse', price: 120000, status: 'pending', views: 32 },
          { id: 3, title: 'Karen 4BR Villa', price: 250000, status: 'available', views: 67 },
        ].map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: listing.status === 'available' ? '#10B98120' : '#F59E0B20' }]}>
                <Text style={[styles.statusText, { color: listing.status === 'available' ? '#10B981' : '#F59E0B' }]}>
                  {listing.status}
                </Text>
              </View>
            </View>
            <View style={styles.listingDetails}>
              <View style={styles.listingDetailRow}>
                <Ionicons name="cash-outline" size={16} color={colors.success} />
                <Text style={[styles.listingDetailText, { color: colors.success, fontWeight: typography.fontWeight.semibold }]}>
                  KSh {listing.price.toLocaleString()}/month
                </Text>
              </View>
              <View style={styles.listingDetailRow}>
                <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.listingDetailText}>{listing.views} views</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: spacing[5], alignItems: 'center' },
  greeting: { fontSize: typography.sm, color: colors.textSecondary },
  userName: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing[1] },
  roleBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 2, borderRadius: borderRadius.xl, marginTop: spacing[2] },
  roleText: { fontSize: typography.xs, fontWeight: typography.fontWeight.semibold, color: '#BFDBFE', textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing[5] },
  statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[5], margin: '1%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  statValue: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing[2] },
  statLabel: { fontSize: typography.xs, color: colors.textSecondary, marginTop: spacing[1], textAlign: 'center' },
  section: { padding: spacing[5] },
  sectionTitle: { fontSize: typography.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[4] },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[5], alignItems: 'center', marginBottom: spacing[3], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  actionCardText: { fontSize: typography.sm, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginTop: spacing[2] },
  listingCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  listingTitle: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, flex: 1 },
  statusBadge: { borderRadius: borderRadius.xl, paddingHorizontal: 10, paddingVertical: spacing[1] + 2 },
  statusText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' },
  listingDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  listingDetailRow: { flexDirection: 'row', alignItems: 'center' },
  listingDetailText: { fontSize: 13, color: colors.textSecondary, marginLeft: spacing[2] },
});

export default AgentHomeScreen;
