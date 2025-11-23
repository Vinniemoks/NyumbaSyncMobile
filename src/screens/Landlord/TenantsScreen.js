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
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
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
                  <Ionicons name="mail-outline" size={14} color="#94A3B8" />
                  <Text style={styles.tenantDetailText}>{tenant.email}</Text>
                </View>
                <View style={styles.tenantDetailItem}>
                  <Ionicons name="call-outline" size={14} color="#94A3B8" />
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
            <Ionicons name="people-outline" size={64} color="#64748B" />
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
                  <Ionicons name="close" size={24} color="#94A3B8" />
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
                  <Ionicons name="close" size={24} color="#94A3B8" />
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
                  <Ionicons name="mail-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.email}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.phone}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Lease Details</Text>

                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Property</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.property}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Unit Number</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.unitNumber}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Monthly Rent</Text>
                    <Text style={styles.detailValue}>
                      KSh {selectedTenant?.rent?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Lease End Date</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.leaseEnd}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Move-in Date</Text>
                    <Text style={styles.detailValue}>{selectedTenant?.moveInDate}</Text>
                  </View>
                </View>

                {selectedTenant?.balance > 0 && (
                  <View style={styles.balanceAlert}>
                    <Ionicons name="alert-circle" size={24} color="#EF4444" />
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
                  <Ionicons name="receipt-outline" size={20} color="#6366F1" />
                  <Text style={styles.actionButtonSmallText}>Payments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleSendReminder(selectedTenant)}
                >
                  <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
                  <Text style={styles.actionButtonSmallText}>Remind</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'Edit tenant feature coming soon');
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#10B981" />
                  <Text style={styles.actionButtonSmallText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSmall}
                  onPress={() => handleTerminateLease(selectedTenant)}
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
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#F8FAFC',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
  },
  filterTabText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tenantsList: {
    padding: 20,
    paddingTop: 0,
  },
  tenantCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tenantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tenantAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  tenantProperty: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 2,
  },
  tenantUnit: {
    fontSize: 12,
    color: '#64748B',
  },
  tenantStatus: {
    padding: 8,
  },
  tenantDetails: {
    marginBottom: 12,
  },
  tenantDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tenantDetailText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
  },
  tenantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  rentInfo: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  rentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  balanceBadge: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCA5A5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
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
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 16,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 16,
  },
  propertySelector: {
    marginBottom: 16,
  },
  propertyOption: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  propertyOptionSelected: {
    backgroundColor: '#6366F1',
  },
  propertyOptionText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  propertyOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  balanceAlert: {
    flexDirection: 'row',
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  balanceAlertContent: {
    flex: 1,
    marginLeft: 12,
  },
  balanceAlertTitle: {
    fontSize: 14,
    color: '#FCA5A5',
    marginBottom: 4,
  },
  balanceAlertAmount: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 8,
  },
});

export default TenantsScreen;
