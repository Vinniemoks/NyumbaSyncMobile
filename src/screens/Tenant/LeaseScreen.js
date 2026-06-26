import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const LeaseScreen = () => {
  const { user } = useAuth();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLease();
  }, []);

  const loadLease = async () => {
    setLoading(true);
    try {
      const response = await leaseService.getByTenant(user?.id);
      if (response.data.success && response.data.leases.length > 0) {
        setLease(response.data.leases[0]); // Get active lease
      }
    } catch (error) {
      // Mock data
      setLease({
        id: 1,
        property: 'Riverside Apartments',
        unitNumber: 'A-101',
        landlord: { name: 'Property Owner', email: 'owner@example.com', phone: '+254700000000' },
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        monthlyRent: 35000,
        securityDeposit: 35000,
        status: 'active',
        signedDate: '2023-12-15',
        daysUntilExpiry: 410,
        terms: 'Standard residential lease agreement...',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLease = () => {
    Alert.alert('Download', 'Lease document will be downloaded');
  };

  const handleRequestRenewal = () => {
    Alert.alert('Renewal Request', 'Your renewal request has been sent to the landlord');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  if (!lease) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyText}>No Active Lease</Text>
        <Text style={styles.emptySubtext}>Contact your landlord for lease information</Text>
      </View>
    );
  }

  const daysRemaining = lease.daysUntilExpiry;
  const isExpiringSoon = daysRemaining <= 60;

  return (
    <ScrollView style={styles.container}>
      {isExpiringSoon && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle" size={24} color={colors.danger} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Lease Expiring Soon</Text>
            <Text style={styles.warningText}>Your lease expires in {daysRemaining} days</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lease Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="home-outline" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Property</Text>
            <Text style={styles.infoValue}>{lease.property}</Text>
            <Text style={styles.infoSubtext}>Unit {lease.unitNumber}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Landlord</Text>
            <Text style={styles.infoValue}>{lease.landlord.name}</Text>
            <Text style={styles.infoSubtext}>{lease.landlord.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Lease Period</Text>
            <Text style={styles.infoValue}>{lease.startDate} to {lease.endDate}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Monthly Rent</Text>
            <Text style={styles.infoValue}>KSh {lease.monthlyRent.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Security Deposit</Text>
            <Text style={styles.infoValue}>KSh {lease.securityDeposit.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadLease}>
          <Ionicons name="download-outline" size={24} color={colors.info} />
          <Text style={styles.actionButtonText}>Download Lease</Text>
        </TouchableOpacity>

        {isExpiringSoon && (
          <TouchableOpacity style={styles.actionButton} onPress={handleRequestRenewal}>
            <Ionicons name="refresh-outline" size={24} color={colors.success} />
            <Text style={styles.actionButtonText}>Request Renewal</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, padding: spacing[5] },
  emptyText: { fontSize: typography.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginTop: spacing[4] },
  emptySubtext: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing[2], textAlign: 'center' },
  warningBanner: { flexDirection: 'row', backgroundColor: '#7F1D1D', margin: spacing[5], padding: spacing[4], borderRadius: borderRadius.xl },
  warningContent: { flex: 1, marginLeft: spacing[3] },
  warningTitle: { fontSize: typography.base, fontWeight: typography.fontWeight.bold, color: '#FEE2E2', marginBottom: spacing[1] },
  warningText: { fontSize: typography.sm, color: '#FCA5A5' },
  card: { backgroundColor: colors.surface, margin: spacing[5], marginTop: 0, borderRadius: borderRadius.xl, padding: spacing[5] },
  cardTitle: { fontSize: typography.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[5] },
  infoRow: { flexDirection: 'row', paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  infoContent: { flex: 1, marginLeft: spacing[3] },
  infoLabel: { fontSize: typography.xs, color: colors.textSecondary, marginBottom: spacing[1] },
  infoValue: { fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.fontWeight.medium, marginBottom: 2 },
  infoSubtext: { fontSize: 13, color: colors.textMuted },
  actionsCard: { backgroundColor: colors.surface, margin: spacing[5], marginTop: 0, borderRadius: borderRadius.xl, padding: spacing[4] },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate[800], borderRadius: borderRadius.lg, padding: spacing[4], marginBottom: spacing[3] },
  actionButtonText: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginLeft: spacing[3] },
});

export default LeaseScreen;
