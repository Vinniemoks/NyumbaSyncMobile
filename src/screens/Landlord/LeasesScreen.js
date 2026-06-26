import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaseService, tenantService, propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const LeasesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    unitNumber: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    terms: '',
  });

  const leaseStatuses = ['all', 'active', 'pending', 'expiring', 'expired', 'terminated'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leasesRes, tenantsRes, propertiesRes] = await Promise.all([
        leaseService.getByLandlord(),
        tenantService.getByLandlord(),
        propertyService.getByLandlord(),
      ]);

      if (leasesRes.data.success) setLeases(leasesRes.data.leases);
      if (tenantsRes.data.success) setTenants(tenantsRes.data.tenants);
      if (propertiesRes.data.success) setProperties(propertiesRes.data.properties);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load lease data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = async () => {
    if (!formData.tenantId || !formData.propertyId || !formData.monthlyRent) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await leaseService.create({
        ...formData,
        landlordId: user?.id,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
      });

      if (response.data.success) {
        Alert.alert('Success', 'Lease created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create lease');
    }
  };

  const handleRenewLease = (lease) => {
    Alert.alert(
      'Renew Lease',
      `Renew lease for ${lease.tenant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: async () => {
            try {
              await leaseService.renew(lease.id, {
                endDate: new Date(new Date(lease.endDate).setFullYear(new Date(lease.endDate).getFullYear() + 1)).toISOString().split('T')[0],
              });
              Alert.alert('Success', 'Lease renewed successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to renew lease');
            }
          },
        },
      ]
    );
  };

  const handleTerminateLease = (lease) => {
    Alert.alert(
      'Terminate Lease',
      `Are you sure you want to terminate the lease for ${lease.tenant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaseService.terminate(lease.id, {
                terminationDate: new Date().toISOString().split('T')[0],
                reason: 'Landlord initiated',
              });
              Alert.alert('Success', 'Lease terminated successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to terminate lease');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      tenantId: '',
      propertyId: '',
      unitNumber: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      securityDeposit: '',
      terms: '',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10B981',
      pending: '#F59E0B',
      expiring: '#EF4444',
      expired: '#6B7280',
      terminated: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: 'checkmark-circle',
      pending: 'time',
      expiring: 'alert-circle',
      expired: 'close-circle',
      terminated: 'ban',
    };
    return icons[status] || 'help-circle';
  };

  const getLeaseStatus = (lease) => {
    if (lease.status === 'terminated') return 'terminated';
    if (lease.status === 'pending') return 'pending';
    if (lease.daysUntilExpiry < 0) return 'expired';
    if (lease.daysUntilExpiry <= 30) return 'expiring';
    return 'active';
  };

  const filteredLeases = leases.filter((lease) => {
    const status = getLeaseStatus(lease);
    return filterStatus === 'all' || status === filterStatus;
  });

  const getStatsCounts = () => {
    return {
      total: leases.length,
      active: leases.filter((l) => getLeaseStatus(l) === 'active').length,
      pending: leases.filter((l) => getLeaseStatus(l) === 'pending').length,
      expiring: leases.filter((l) => getLeaseStatus(l) === 'expiring').length,
    };
  };

  const stats = getStatsCounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Lease Agreements</Text>
            <Text style={styles.headerSubtitle}>{stats.total} total leases</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
            <Ionicons name="document-text" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.expiring}</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {leaseStatuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === status && styles.filterTabTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Leases List */}
        <View style={styles.leasesList}>
          {filteredLeases.map((lease) => {
            const status = getLeaseStatus(lease);
            return (
              <TouchableOpacity
                key={lease.id}
                style={styles.leaseCard}
                onPress={() => {
                  setSelectedLease(lease);
                  setShowDetailsModal(true);
                }}
              >
                <View style={styles.leaseHeader}>
                  <View style={styles.tenantInfo}>
                    <View style={styles.tenantAvatar}>
                      <Text style={styles.tenantAvatarText}>
                        {lease.tenant.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.tenantDetails}>
                      <Text style={styles.tenantName}>{lease.tenant.name}</Text>
                      <Text style={styles.propertyText}>
                        {lease.property} - {lease.unitNumber}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(status) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(status)}
                      size={14}
                      color={getStatusColor(status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                      {status}
                    </Text>
                  </View>
                </View>

                <View style={styles.leaseDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {lease.startDate} - {lease.endDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        KSh {lease.monthlyRent.toLocaleString()}/mo
                      </Text>
                    </View>
                  </View>
                </View>

                {status === 'expiring' && (
                  <View style={styles.expiryWarning}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.expiryWarningText}>
                      Expires in {lease.daysUntilExpiry} days
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredLeases.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No leases found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterStatus === 'all'
                ? 'Create your first lease agreement'
                : `No ${filterStatus} leases`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Lease Modal - Simplified */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Lease Agreement</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Tenant *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
                {tenants.map((tenant) => (
                  <TouchableOpacity
                    key={tenant.id}
                    style={[
                      styles.selectorOption,
                      formData.tenantId === tenant.id && styles.selectorOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, tenantId: tenant.id })}
                  >
                    <Text style={[
                      styles.selectorOptionText,
                      formData.tenantId === tenant.id && styles.selectorOptionTextSelected,
                    ]}>
                      {tenant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Property *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selector}>
                {properties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={[
                      styles.selectorOption,
                      formData.propertyId === property.id && styles.selectorOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, propertyId: property.id })}
                  >
                    <Text style={[
                      styles.selectorOptionText,
                      formData.propertyId === property.id && styles.selectorOptionTextSelected,
                    ]}>
                      {property.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Unit Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="A-101"
                placeholderTextColor="#64748B"
                value={formData.unitNumber}
                onChangeText={(text) => setFormData({ ...formData, unitNumber: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Start Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2024-01-01"
                    placeholderTextColor="#64748B"
                    value={formData.startDate}
                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>End Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2025-12-31"
                    placeholderTextColor="#64748B"
                    value={formData.endDate}
                    onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Monthly Rent (KSh) *</Text>
              <TextInput
                style={styles.input}
                placeholder="35000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={formData.monthlyRent}
                onChangeText={(text) => setFormData({ ...formData, monthlyRent: text })}
              />

              <Text style={styles.inputLabel}>Security Deposit (KSh)</Text>
              <TextInput
                style={styles.input}
                placeholder="35000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={formData.securityDeposit}
                onChangeText={(text) => setFormData({ ...formData, securityDeposit: text })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleCreateLease}
                >
                  <Text style={styles.saveButtonText}>Create Lease</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Lease Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lease Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Tenant Information</Text>
                <Text style={styles.detailValue}>{selectedLease?.tenant.name}</Text>
                <Text style={styles.detailSubtext}>{selectedLease?.tenant.email}</Text>
                <Text style={styles.detailSubtext}>{selectedLease?.tenant.phone}</Text>

                <Text style={styles.sectionTitle}>Property Information</Text>
                <Text style={styles.detailValue}>{selectedLease?.property}</Text>
                <Text style={styles.detailSubtext}>Unit {selectedLease?.unitNumber}</Text>

                <Text style={styles.sectionTitle}>Lease Terms</Text>
                <View style={styles.termRow}>
                  <Text style={styles.termLabel}>Start Date:</Text>
                  <Text style={styles.termValue}>{selectedLease?.startDate}</Text>
                </View>
                <View style={styles.termRow}>
                  <Text style={styles.termLabel}>End Date:</Text>
                  <Text style={styles.termValue}>{selectedLease?.endDate}</Text>
                </View>
                <View style={styles.termRow}>
                  <Text style={styles.termLabel}>Monthly Rent:</Text>
                  <Text style={styles.termValue}>
                    KSh {selectedLease?.monthlyRent.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.termRow}>
                  <Text style={styles.termLabel}>Security Deposit:</Text>
                  <Text style={styles.termValue}>
                    KSh {selectedLease?.securityDeposit.toLocaleString()}
                  </Text>
                </View>
                {selectedLease?.signedDate && (
                  <View style={styles.termRow}>
                    <Text style={styles.termLabel}>Signed Date:</Text>
                    <Text style={styles.termValue}>{selectedLease.signedDate}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtonsGrid}>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'View document feature coming soon');
                  }}
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.info} />
                  <Text style={styles.actionButtonSmallText}>View Doc</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleRenewLease(selectedLease)}
                >
                  <Ionicons name="refresh-outline" size={20} color={colors.success} />
                  <Text style={styles.actionButtonSmallText}>Renew</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleTerminateLease(selectedLease)}
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                  <Text style={styles.actionButtonSmallText}>Terminate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[5], backgroundColor: colors.surface },
  headerTitle: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  headerSubtitle: { fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing[1] },
  addButton: { width: 48, height: 48, borderRadius: borderRadius['3xl'], backgroundColor: colors.darkBlue, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: spacing[5], paddingTop: spacing[4] },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] },
  statLabel: { fontSize: typography.xs, color: colors.textSecondary },
  filterContainer: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  filterTab: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: 20, backgroundColor: colors.surface, marginRight: spacing[2] },
  filterTabActive: { backgroundColor: colors.darkBlue,
  },
  filterTabText: { fontSize: 13, color: colors.textSecondary, fontWeight: typography.fontWeight.medium, textTransform: 'capitalize' },
  filterTabTextActive: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  leasesList: { padding: spacing[5], paddingTop: 0 },
  leaseCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3] },
  leaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  tenantInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tenantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.darkBlue,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  tenantAvatarText: { fontSize: typography.sm, fontWeight: typography.fontWeight.bold, color: '#fff' },
  tenantDetails: { flex: 1 },
  tenantName: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 2 },
  propertyText: { fontSize: 13, color: colors.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: spacing[1] + 2, borderRadius: borderRadius.xl },
  statusText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, marginLeft: spacing[1], textTransform: 'capitalize' },
  leaseDetails: { marginBottom: spacing[2] },
  detailRow: { marginBottom: spacing[1] + 2 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, color: colors.textSecondary, marginLeft: spacing[2] },
  expiryWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7F1D1D', borderRadius: borderRadius.lg, padding: 10, marginTop: spacing[2] },
  expiryWarningText: { fontSize: typography.xs, color: '#FCA5A5', marginLeft: spacing[2], fontWeight: typography.fontWeight.semibold },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: typography.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginTop: spacing[4] },
  emptyStateSubtext: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing[2] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing[6], maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6] },
  modalTitle: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  inputLabel: { fontSize: typography.sm, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginBottom: spacing[2] },
  input: { backgroundColor: colors.slate[800], borderWidth: 1, borderColor: '#334155', borderRadius: borderRadius.lg, padding: spacing[4], fontSize: typography.base, color: colors.textPrimary, marginBottom: spacing[4] },
  selector: { marginBottom: spacing[4] },
  selectorOption: { backgroundColor: colors.slate[800], borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: 10, marginRight: spacing[2] },
  selectorOptionSelected: { backgroundColor: colors.darkBlue,
  },
  selectorOptionText: { fontSize: typography.sm, color: colors.textSecondary },
  selectorOptionTextSelected: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  modalButtons: { flexDirection: 'row', marginTop: spacing[6] },
  modalButton: { flex: 1, padding: spacing[4], borderRadius: borderRadius.lg, alignItems: 'center' },
  cancelButton: { backgroundColor: colors.slate[800], marginRight: spacing[2] },
  cancelButtonText: { color: colors.slate[200], fontSize: typography.base, fontWeight: typography.fontWeight.semibold },
  saveButton: { backgroundColor: colors.darkBlue,
    marginLeft: spacing[2] },
  saveButtonText: { color: colors.gold,
    fontSize: typography.base, fontWeight: typography.fontWeight.semibold },
  detailsSection: { marginBottom: spacing[6] },
  sectionTitle: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginTop: spacing[4], marginBottom: spacing[3] },
  detailValue: { fontSize: typography.base, color: colors.textPrimary, fontWeight: typography.fontWeight.medium, marginBottom: spacing[1] },
  detailSubtext: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: 2 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  termLabel: { fontSize: typography.sm, color: colors.textSecondary },
  termValue: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.medium },
  actionButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButtonSmall: { width: '31%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slate[800], borderRadius: borderRadius.lg, padding: spacing[4], marginBottom: spacing[3] },
  actionButtonSmallText: { fontSize: typography.xs, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginTop: spacing[2] },
});

export default LeasesScreen;
