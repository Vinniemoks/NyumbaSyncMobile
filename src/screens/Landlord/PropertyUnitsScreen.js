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
import { propertyService } from '../../services/api';

const PropertyUnitsScreen = ({ route, navigation }) => {
  const { propertyId, propertyName } = route.params;
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, vacant, occupied, maintenance
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    rent: '',
    status: 'vacant',
    description: '',
    features: [],
  });

  const unitStatuses = ['vacant', 'occupied', 'maintenance', 'reserved'];
  const featuresList = [
    'Balcony',
    'Parking',
    'Storage',
    'Garden',
    'Furnished',
    'Pet Friendly',
    'AC',
    'Heating',
  ];

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getUnits(propertyId);
      if (response.data.success) {
        setUnits(response.data.units);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      // Mock data for development
      setUnits([
        {
          id: 1,
          unitNumber: 'A-101',
          floor: 1,
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
          rent: 35000,
          status: 'occupied',
          tenant: 'John Doe',
          features: ['Balcony', 'Parking'],
        },
        {
          id: 2,
          unitNumber: 'A-102',
          floor: 1,
          bedrooms: 2,
          bathrooms: 1,
          squareFeet: 850,
          rent: 35000,
          status: 'vacant',
          tenant: null,
          features: ['Balcony', 'Parking'],
        },
        {
          id: 3,
          unitNumber: 'A-201',
          floor: 2,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1200,
          rent: 45000,
          status: 'occupied',
          tenant: 'Jane Smith',
          features: ['Balcony', 'Parking', 'Storage'],
        },
        {
          id: 4,
          unitNumber: 'A-202',
          floor: 2,
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1200,
          rent: 45000,
          status: 'maintenance',
          tenant: null,
          features: ['Balcony', 'Parking', 'Storage'],
        },
        {
          id: 5,
          unitNumber: 'B-101',
          floor: 1,
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 600,
          rent: 28000,
          status: 'vacant',
          tenant: null,
          features: ['Parking'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!formData.unitNumber || !formData.rent) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const response = await propertyService.addUnit(propertyId, {
        ...formData,
        rent: parseFloat(formData.rent),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        floor: parseInt(formData.floor) || 0,
        squareFeet: parseInt(formData.squareFeet) || 0,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Unit added successfully!');
        setShowAddModal(false);
        resetForm();
        loadUnits();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add unit. Please try again.');
    }
  };

  const handleUpdateUnit = async () => {
    if (!formData.unitNumber || !formData.rent) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const response = await propertyService.updateUnit(propertyId, selectedUnit.id, {
        ...formData,
        rent: parseFloat(formData.rent),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        floor: parseInt(formData.floor) || 0,
        squareFeet: parseInt(formData.squareFeet) || 0,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Unit updated successfully!');
        setShowEditModal(false);
        resetForm();
        loadUnits();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit. Please try again.');
    }
  };

  const handleDeleteUnit = (unit) => {
    Alert.alert(
      'Delete Unit',
      `Are you sure you want to delete unit ${unit.unitNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteUnit(propertyId, unit.id);
              Alert.alert('Success', 'Unit deleted successfully');
              loadUnits();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete unit');
            }
          },
        },
      ]
    );
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber,
      floor: unit.floor?.toString() || '',
      bedrooms: unit.bedrooms?.toString() || '',
      bathrooms: unit.bathrooms?.toString() || '',
      squareFeet: unit.squareFeet?.toString() || '',
      rent: unit.rent?.toString() || '',
      status: unit.status,
      description: unit.description || '',
      features: unit.features || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      unitNumber: '',
      floor: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      rent: '',
      status: 'vacant',
      description: '',
      features: [],
    });
    setSelectedUnit(null);
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      vacant: '#10B981',
      occupied: '#6366F1',
      maintenance: '#F59E0B',
      reserved: '#8B5CF6',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      vacant: 'home-outline',
      occupied: 'people',
      maintenance: 'construct',
      reserved: 'time',
    };
    return icons[status] || 'help-circle';
  };

  const filteredUnits = units.filter((unit) => {
    return filterStatus === 'all' || unit.status === filterStatus;
  });

  const getStatsCounts = () => {
    return {
      total: units.length,
      vacant: units.filter((u) => u.status === 'vacant').length,
      occupied: units.filter((u) => u.status === 'occupied').length,
      maintenance: units.filter((u) => u.status === 'maintenance').length,
    };
  };

  const stats = getStatsCounts();
  const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{propertyName}</Text>
            <Text style={styles.headerSubtitle}>{stats.total} units</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{occupancyRate}%</Text>
            <Text style={styles.statLabel}>Occupancy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.vacant}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.maintenance}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'vacant', 'occupied', 'maintenance', 'reserved'].map((status) => (
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

        {/* Units List */}
        <View style={styles.unitsList}>
          {filteredUnits.map((unit) => (
            <TouchableOpacity
              key={unit.id}
              style={styles.unitCard}
              onPress={() => handleEditUnit(unit)}
            >
              <View style={styles.unitHeader}>
                <View style={styles.unitNumberContainer}>
                  <Text style={styles.unitNumber}>{unit.unitNumber}</Text>
                  <Text style={styles.floorText}>Floor {unit.floor}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(unit.status) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(unit.status)}
                    size={14}
                    color={getStatusColor(unit.status)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(unit.status) },
                    ]}
                  >
                    {unit.status}
                  </Text>
                </View>
              </View>

              <View style={styles.unitDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="bed-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{unit.bedrooms} Beds</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{unit.bathrooms} Baths</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="resize-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{unit.squareFeet} sqft</Text>
                </View>
              </View>

              {unit.tenant && (
                <View style={styles.tenantInfo}>
                  <Ionicons name="person" size={16} color="#6366F1" />
                  <Text style={styles.tenantName}>{unit.tenant}</Text>
                </View>
              )}

              {unit.features && unit.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {unit.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureTagText}>{feature}</Text>
                    </View>
                  ))}
                  {unit.features.length > 3 && (
                    <Text style={styles.moreFeatures}>+{unit.features.length - 3}</Text>
                  )}
                </View>
              )}

              <View style={styles.unitFooter}>
                <Text style={styles.rentAmount}>KSh {unit.rent?.toLocaleString()}/mo</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteUnit(unit)}
                  style={styles.deleteIconButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredUnits.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color="#64748B" />
            <Text style={styles.emptyStateText}>No units found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterStatus === 'all'
                ? 'Add your first unit to get started'
                : `No ${filterStatus} units`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Unit Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {showEditModal ? 'Edit Unit' : 'Add New Unit'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Unit Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., A-101"
                placeholderTextColor="#64748B"
                value={formData.unitNumber}
                onChangeText={(text) => setFormData({ ...formData, unitNumber: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.floor}
                    onChangeText={(text) => setFormData({ ...formData, floor: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Square Feet</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="850"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.squareFeet}
                    onChangeText={(text) => setFormData({ ...formData, squareFeet: text })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Bedrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.bedrooms}
                    onChangeText={(text) => setFormData({ ...formData, bedrooms: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Bathrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.bathrooms}
                    onChangeText={(text) => setFormData({ ...formData, bathrooms: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Monthly Rent (KSh) *</Text>
              <TextInput
                style={styles.input}
                placeholder="35000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={formData.rent}
                onChangeText={(text) => setFormData({ ...formData, rent: text })}
              />

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusSelector}>
                {unitStatuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && styles.statusOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.status === status && styles.statusOptionTextSelected,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Features</Text>
              <View style={styles.featuresGrid}>
                {featuresList.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[
                      styles.featureChip,
                      formData.features.includes(feature) && styles.featureChipSelected,
                    ]}
                    onPress={() => toggleFeature(feature)}
                  >
                    <Text
                      style={[
                        styles.featureChipText,
                        formData.features.includes(feature) && styles.featureChipTextSelected,
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Unit description..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={showEditModal ? handleUpdateUnit : handleAddUnit}
                >
                  <Text style={styles.saveButtonText}>
                    {showEditModal ? 'Update Unit' : 'Add Unit'}
                  </Text>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
  },
  filterTabText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  unitsList: {
    padding: 20,
    paddingTop: 0,
  },
  unitCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitNumberContainer: {
    flex: 1,
  },
  unitNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  floorText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  unitDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 4,
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  tenantName: {
    fontSize: 13,
    color: '#E2E8F0',
    marginLeft: 8,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureTag: {
    backgroundColor: '#312E81',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  featureTagText: {
    fontSize: 10,
    color: '#A5B4FC',
    fontWeight: '500',
  },
  moreFeatures: {
    fontSize: 11,
    color: '#64748B',
    alignSelf: 'center',
  },
  unitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  rentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  deleteIconButton: {
    padding: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusOption: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#6366F1',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
  statusOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureChip: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  featureChipSelected: {
    backgroundColor: '#312E81',
  },
  featureChipText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  featureChipTextSelected: {
    color: '#A5B4FC',
    fontWeight: '600',
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
});

export default PropertyUnitsScreen;
