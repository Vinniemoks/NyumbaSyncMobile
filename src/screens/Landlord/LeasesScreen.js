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
        <ActivityIndicator size="large" color="#6366F1" />
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
                      <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                      <Text style={styles.detailText}>
                        {lease.startDate} - {lease.endDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color="#94A3B8" />
                      <Text style={styles.detailText}>
                        KSh {lease.monthlyRent.toLocaleString()}/mo
                      </Text>
                    </View>
                  </View>
                </View>

                {status === 'expiring' && (
                  <View style={styles.expiryWarning}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
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
            <Ionicons name="document-text-outline" size={64} color="#64748B" />
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
                  <Ionicons name="close" size={24} color="#94A3B8" />
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
                  <Ionicons name="close" size={24} color="#94A3B8" />
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
                  <Ionicons name="document-text-outline" size={20} color="#6366F1" />
                  <Text style={styles.actionButtonSmallText}>View Doc</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleRenewLease(selectedLease)}
                >
                  <Ionicons name="refresh-outline" size={20} color="#10B981" />
                  <Text style={styles.actionButtonSmallText}>Renew</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleTerminateLease(selectedLease)}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
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
  container: { flex: 1, backgroundColor: '#020617' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#0F172A' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: 20, paddingTop: 16 },
  statCard: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94A3B8' },
  filterContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', marginRight: 8 },
  filterTabActive: { backgroundColor: '#6366F1' },
  filterTabText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', textTransform: 'capitalize' },
  filterTabTextActive: { color: '#fff', fontWeight: '600' },
  leasesList: { padding: 20, paddingTop: 0 },
  leaseCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 12 },
  leaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tenantInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tenantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tenantAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  tenantDetails: { flex: 1 },
  tenantName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 2 },
  propertyText: { fontSize: 13, color: '#94A3B8' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
  leaseDetails: { marginBottom: 8 },
  detailRow: { marginBottom: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, color: '#94A3B8', marginLeft: 8 },
  expiryWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7F1D1D', borderRadius: 8, padding: 10, marginTop: 8 },
  expiryWarningText: { fontSize: 12, color: '#FCA5A5', marginLeft: 8, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#94A3B8', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#64748B', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginBottom: 8 },
  input: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 16, fontSize: 16, color: '#F8FAFC', marginBottom: 16 },
  selector: { marginBottom: 16 },
  selectorOption: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  selectorOptionSelected: { backgroundColor: '#6366F1' },
  selectorOptionText: { fontSize: 14, color: '#94A3B8' },
  selectorOptionTextSelected: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  modalButtons: { flexDirection: 'row', marginTop: 24 },
  modalButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#1E293B', marginRight: 8 },
  cancelButtonText: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#6366F1', marginLeft: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  detailsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#E2E8F0', marginTop: 16, marginBottom: 12 },
  detailValue: { fontSize: 16, color: '#F8FAFC', fontWeight: '500', marginBottom: 4 },
  detailSubtext: { fontSize: 14, color: '#94A3B8', marginBottom: 2 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  termLabel: { fontSize: 14, color: '#94A3B8' },
  termValue: { fontSize: 14, color: '#F8FAFC', fontWeight: '500' },
  actionButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButtonSmall: { width: '31%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 8, padding: 16, marginBottom: 12 },
  actionButtonSmallText: { fontSize: 12, fontWeight: '600', color: '#E2E8F0', marginTop: 8 },
});

export default LeasesScreen;
