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
import { tenantService, propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const TenantsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending, inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: '',
    unitNumber: '',
    rent: '',
    leaseStart: '',
    leaseEnd: '',
    deposit: '',
    idNumber: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tenants and properties
      const [tenantsRes, propertiesRes] = await Promise.all([
        tenantService.getByLandlord(),
        propertyService.getByLandlord(),
      ]);

      if (tenantsRes.data.success) {
        setTenants(tenantsRes.data.tenants);
      }

      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.properties);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Mock data for development
      setTenants([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+254712345678',
          property: 'Riverside Apartments',
          unitNumber: 'A-101',
          rent: 35000,
          status: 'active',
          leaseEnd: '2025-12-31',
          balance: 0,
          moveInDate: '2024-01-01',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+254723456789',
          property: 'Westlands Villa',
          unitNumber: 'B-205',
          rent: 45000,
          status: 'active',
          leaseEnd: '2026-06-30',
          balance: 0,
          moveInDate: '2024-06-01',
        },
        {
          id: 3,
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.j@example.com',
          phone: '+254734567890',
          property: 'Riverside Apartments',
          unitNumber: 'C-302',
          rent: 38000,
          status: 'pending',
          leaseEnd: '2025-11-30',
          balance: 38000,
          moveInDate: '2024-11-01',
        },
      ]);

      setProperties([
        { id: 1, name: 'Riverside Apartments' },
        { id: 2, name: 'Westlands Villa' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = async () => {
    if (!formData.firstName || !formData.email || !formData.phone || !formData.propertyId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await tenantService.create({
        ...formData,
        landlordId: user?.id,
        rent: parseFloat(formData.rent),
        deposit: parseFloat(formData.deposit),
      });

      if (response.data.success) {
        Alert.alert('Success', 'Tenant added successfully!');
        setShowAddModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add tenant. Please try again.');
    }
  };

  const handleSendReminder = (tenant) => {
    Alert.alert(
      'Send Payment Reminder',
      `Send rent reminder to ${tenant.firstName} ${tenant.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS',
          onPress: () => Alert.alert('Success', 'SMS reminder sent!'),
        },
        {
          text: 'Send Email',
          onPress: () => Alert.alert('Success', 'Email reminder sent!'),
        },
      ]
    );
  };

  const handleTerminateLease = (tenant) => {
    Alert.alert(
      'Terminate Lease',
      `Are you sure you want to terminate the lease for ${tenant.firstName} ${tenant.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              await tenantService.update(tenant.id, { status: 'inactive' });
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyId: '',
      unitNumber: '',
      rent: '',
      leaseStart: '',
      leaseEnd: '',
      deposit: '',
      idNumber: '',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10B981',
      pending: '#F59E0B',
      inactive: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: 'checkmark-circle',
      pending: 'time',
      inactive: 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatsCounts = () => {
    return {
      total: tenants.length,
      active: tenants.filter((t) => t.status === 'active').length,
      pending: tenants.filter((t) => t.status === 'pending').length,
      inactive: tenants.filter((t) => t.status === 'inactive').length,
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
            <Text style={styles.headerTitle}>Tenants</Text>
            <Text style={styles.headerSubtitle}>{stats.total} total tenants</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="person-add" size={24} color="#fff" />
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
            <Text style={styles.statValue}>{stats.inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tenants..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'active', 'pending', 'inactive'].map((status) => (
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

        {/* Tenants List */}
        <View style={styles.tenantsList}>
          {filteredTenants.map((tenant) => (
            <TouchableOpacity
              key={tenant.id}
              style={styles.tenantCard}
              onPress={() => {
                setSelectedTenant(tenant);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.tenantHeader}>
                <View style={styles.tenantAvatar}>
                  <Text style={styles.tenantAvatarText}>
                    {tenant.firstName.charAt(0)}
                    {tenant.lastName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName}>
                    {tenant.firstName} {tenant.lastName}
                  </Text>
                  <Text style={styles.tenantProperty}>{tenant.property}</Text>
                  <Text style={styles.tenantUnit}>Unit {tenant.unitNumber}</Text>
                </View>
                <View style={styles.tenantStatus}>
                  <Ionicons
                    name={getStatusIcon(tenant.status)}
                    size={20}
                    color={getStatusColor(tenant.status)}
                  />
                </View>
              </View>

              <View style={styles.tenantDetails}>
                <View style={styles.tenantDetailItem}>
                  <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.tenantDetailText}>{tenant.email}</Text>
                </View>
                <View style={styles.tenantDetailItem}>
                  <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.tenantDetailText}>{tenant.phone}</Text>
                </View>
              </View>

              <View style={styles.tenantFooter}>
                <View style={styles.rentInfo}>
                  <Text style={styles.rentLabel}>Monthly Rent</Text>
                  <Text style={styles.rentValue}>KSh {tenant.rent?.toLocaleString()}</Text>
                </View>
                {tenant.balance > 0 && (
                  <View style={styles.balanceBadge}>
                    <Text style={styles.balanceText}>
                      Owes: KSh {tenant.balance.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTenants.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No tenants found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try a different search' : 'Add your first tenant to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Tenant Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Tenant</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Personal Information</Text>

              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#64748B"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />

              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#64748B"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="john.doe@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+254712345678"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />

              <Text style={styles.inputLabel}>ID Number</Text>
              <TextInput
                style={styles.input}
                placeholder="12345678"
                placeholderTextColor="#64748B"
                value={formData.idNumber}
                onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
              />

              <Text style={styles.sectionTitle}>Lease Information</Text>

              <Text style={styles.inputLabel}>Property *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertySelector}>
                {properties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={[
                      styles.propertyOption,
                      formData.propertyId === property.id && styles.propertyOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, propertyId: property.id })}
                  >
                    <Text
                      style={[
                        styles.propertyOptionText,
                        formData.propertyId === property.id && styles.propertyOptionTextSelected,
                      ]}
                    >
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

              <Text style={styles.inputLabel}>Monthly Rent (KSh) *</Text>
              <TextInput
                style={styles.input}
                placeholder="35000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={formData.rent}
                onChangeText={(text) => setFormData({ ...formData, rent: text })}
              />

              <Text style={styles.inputLabel}>Security Deposit (KSh)</Text>
              <TextInput
                style={styles.input}
                placeholder="35000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={formData.deposit}
                onChangeText={(text) => setFormData({ ...formData, deposit: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Lease Start</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2024-01-01"
                    placeholderTextColor="#64748B"
                    value={formData.leaseStart}
                    onChangeText={(text) => setFormData({ ...formData, leaseStart: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Lease End</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2025-12-31"
                    placeholderTextColor="#64748B"
                    value={formData.leaseEnd}
                    onChangeText={(text) => setFormData({ ...formData, leaseEnd: text })}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddTenant}
                >
                  <Text style={styles.saveButtonText}>Add Tenant</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Tenant Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedTenant?.firstName} {selectedTenant?.lastName}
                </Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.statusBanner}>
                <Ionicons
                  name={getStatusIcon(selectedTenant?.status)}
                  size={24}
                  color={getStatusColor(selectedTenant?.status)}
                />
                <Text style={[styles.statusBannerText, { color: getStatusColor(selectedTenant?.status) }]}>
                  {selectedTenant?.status?.toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.email}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.phone}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Lease Details</Text>

                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Property</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.property}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Unit Number</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.unitNumber}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Monthly Rent</Text>
                    <Text style={styles.detailValue}>
                      KSh {selectedTenant?.rent?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Lease End Date</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.leaseEnd}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Move-in Date</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.moveInDate}</Text>
                  </View>
                </View>

                {selectedTenant?.balance > 0 && (
                  <View style={styles.balanceAlert}>
                    <Ionicons name="alert-circle" size={24} color={colors.danger} />
                    <View style={styles.balanceAlertContent}>
                      <Text style={styles.balanceAlertTitle}>Outstanding Balance</Text>
                      <Text style={styles.balanceAlertAmount}>
                        KSh {selectedTenant?.balance.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.actionButtonsGrid}>
                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'Payment history feature coming soon');
                  }}
                >
                  <Ionicons name="receipt-outline" size={20} color={colors.info} />
                  <Text style={styles.actionButtonSmallText}>Payments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleSendReminder(selectedTenant)}
                >
                  <Ionicons name="notifications-outline" size={20} color={colors.warning} />
                  <Text style={styles.actionButtonSmallText}>Remind</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'Edit tenant feature coming soon');
                  }}
                >
                  <Ionicons name="create-outline" size={20} color={colors.success} />
                  <Text style={styles.actionButtonSmallText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleTerminateLease(selectedTenant)}
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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius['3xl'],
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing[5],
    paddingTop: spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    padding: spacing[3],
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  filterTab: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing[2],
  },
  filterTabActive: {
    backgroundColor: colors.darkBlue,
  },
  filterTabText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  tenantsList: {
    padding: spacing[5],
    paddingTop: 0,
  },
  tenantCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  tenantAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius['3xl'],
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  tenantAvatarText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  tenantProperty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  tenantUnit: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  tenantStatus: {
    padding: spacing[2],
  },
  tenantDetails: {
    marginBottom: spacing[3],
  },
  tenantDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1] + 2,
  },
  tenantDetailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
  tenantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  rentInfo: {
    flex: 1,
  },
  rentLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  rentValue: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  balanceBadge: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.xl,
  },
  balanceText: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FCA5A5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptyStateSubtext: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[6],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  modalTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800],
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  propertySelector: {
    marginBottom: spacing[4],
  },
  propertyOption: {
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: 10,
    marginRight: spacing[2],
  },
  propertyOptionSelected: {
    backgroundColor: colors.darkBlue,
  },
  propertyOptionText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  propertyOptionTextSelected: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing[6],
  },
  modalButton: {
    flex: 1,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.slate[800],
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200],
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: colors.darkBlue,
    marginLeft: spacing[2],
  },
  saveButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  statusBannerText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    marginLeft: spacing[3],
  },
  detailsSection: {
    marginBottom: spacing[6],
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  detailContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  detailLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  balanceAlert: {
    flexDirection: 'row',
    backgroundColor: '#7F1D1D',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  balanceAlertContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  balanceAlertTitle: {
    fontSize: typography.sm,
    color: '#FCA5A5',
    marginBottom: spacing[1],
  },
  balanceAlertAmount: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#FEE2E2',
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButtonSmall: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  actionButtonSmallText: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginLeft: spacing[2],
  },
});

export default TenantsScreen;
