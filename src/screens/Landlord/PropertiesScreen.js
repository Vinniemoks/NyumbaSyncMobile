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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PropertiesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    rent: '',
    description: '',
    amenities: [],
  });

  const propertyTypes = ['apartment', 'house', 'studio', 'villa', 'commercial'];
  const amenitiesList = ['Parking', 'WiFi', 'Security', 'Water', 'Electricity', 'Generator', 'Gym', 'Pool', 'Garden'];

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getAll();
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Mock data for development
      setProperties([
        {
          id: 1,
          name: 'Riverside Apartments',
          address: '123 Riverside Drive',
          city: 'Nairobi',
          type: 'apartment',
          bedrooms: 3,
          bathrooms: 2,
          rent: 35000,
          units: 12,
          occupied: 10,
          amenities: ['Parking', 'WiFi', 'Security', 'Water'],
        },
        {
          id: 2,
          name: 'Westlands Villa',
          address: '456 Westlands Road',
          city: 'Nairobi',
          type: 'villa',
          bedrooms: 5,
          bathrooms: 4,
          rent: 85000,
          units: 1,
          occupied: 1,
          amenities: ['Parking', 'WiFi', 'Security', 'Water', 'Garden', 'Pool'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async () => {
    if (!formData.name || !formData.address || !formData.rent) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await propertyService.create({
        ...formData,
        landlordId: user?.id,
        rent: parseFloat(formData.rent),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Property added successfully!');
        setShowAddModal(false);
        resetForm();
        loadProperties();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add property. Please try again.');
    }
  };

  const handleDeleteProperty = (propertyId) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.delete(propertyId);
              Alert.alert('Success', 'Property deleted successfully');
              loadProperties();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      rent: '',
      description: '',
      amenities: [],
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const getOccupancyRate = (property) => {
    if (!property.units) return 0;
    return Math.round((property.occupied / property.units) * 100);
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#10B981';
    if (rate >= 70) return '#F59E0B';
    return '#EF4444';
  };

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
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Properties</Text>
            <Text style={styles.headerSubtitle}>{properties.length} properties</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.propertiesList}>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={styles.propertyCard}
              onPress={() => {
                setSelectedProperty(property);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.propertyHeader}>
                <View style={styles.propertyIcon}>
                  <Ionicons name="home" size={24} color="#6366F1" />
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyName}>{property.name}</Text>
                  <Text style={styles.propertyAddress}>
                    {property.address}, {property.city}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteProperty(property.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.propertyDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="bed-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{property.bedrooms} Beds</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{property.bathrooms} Baths</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>
                    KSh {property.rent?.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.propertyFooter}>
                <View style={styles.occupancyInfo}>
                  <Text style={styles.occupancyText}>
                    {property.occupied}/{property.units} Units
                  </Text>
                  <View style={styles.occupancyBar}>
                    <View
                      style={[
                        styles.occupancyFill,
                        {
                          width: `${getOccupancyRate(property)}%`,
                          backgroundColor: getOccupancyColor(getOccupancyRate(property)),
                        },
                      ]}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: '#312E81' },
                  ]}
                >
                  <Text style={styles.typeBadgeText}>{property.type}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {properties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color="#64748B" />
            <Text style={styles.emptyStateText}>No properties yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first property to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Property Modal */}
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
                <Text style={styles.modalTitle}>Add New Property</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Property Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Riverside Apartments"
                placeholderTextColor="#64748B"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor="#64748B"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />

              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Nairobi"
                placeholderTextColor="#64748B"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />

              <Text style={styles.inputLabel}>Property Type</Text>
              <View style={styles.typeSelector}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Bedrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
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
                    placeholder="0"
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

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Property description..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <Text style={styles.inputLabel}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenitiesList.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      formData.amenities.includes(amenity) && styles.amenityChipSelected,
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text
                      style={[
                        styles.amenityChipText,
                        formData.amenities.includes(amenity) && styles.amenityChipTextSelected,
                      ]}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                  onPress={handleAddProperty}
                >
                  <Text style={styles.saveButtonText}>Add Property</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Property Details Modal */}
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
                <Text style={styles.modalTitle}>{selectedProperty?.name}</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>
                      {selectedProperty?.address}, {selectedProperty?.city}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Monthly Rent</Text>
                    <Text style={styles.detailValue}>
                      KSh {selectedProperty?.rent?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Property Type</Text>
                    <Text style={styles.detailValue}>{selectedProperty?.type}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="bed-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Bedrooms & Bathrooms</Text>
                    <Text style={styles.detailValue}>
                      {selectedProperty?.bedrooms} Bedrooms, {selectedProperty?.bathrooms} Bathrooms
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={20} color="#6366F1" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Occupancy</Text>
                    <Text style={styles.detailValue}>
                      {selectedProperty?.occupied} / {selectedProperty?.units} Units (
                      {getOccupancyRate(selectedProperty)}%)
                    </Text>
                  </View>
                </View>

                {selectedProperty?.amenities && selectedProperty.amenities.length > 0 && (
                  <View style={styles.detailRow}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#6366F1" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Amenities</Text>
                      <View style={styles.amenitiesDisplay}>
                        {selectedProperty.amenities.map((amenity, index) => (
                          <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityTagText}>{amenity}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    navigation.navigate('PropertyUnits', {
                      propertyId: selectedProperty?.id,
                      propertyName: selectedProperty?.name,
                    });
                  }}
                >
                  <Ionicons name="grid" size={20} color="#6366F1" />
                  <Text style={styles.actionButtonText}>Manage Units</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'Edit property feature coming soon');
                  }}
                >
                  <Ionicons name="create" size={20} color="#10B981" />
                  <Text style={styles.actionButtonText}>Edit Property</Text>
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
    backgroundColor: '#020617', // slate-950
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
    backgroundColor: '#0F172A', // slate-900
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1', // indigo-500
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertiesList: {
    padding: 20,
  },
  propertyCard: {
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B', // slate-800
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: '#94A3B8', // slate-400
  },
  deleteButton: {
    padding: 8,
  },
  propertyDetails: {
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
    color: '#94A3B8', // slate-400
    marginLeft: 4,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancyInfo: {
    flex: 1,
    marginRight: 12,
  },
  occupancyText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginBottom: 4,
  },
  occupancyBar: {
    height: 6,
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A5B4FC', // indigo-300
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8', // slate-400
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B', // slate-500
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
    backgroundColor: '#0F172A', // slate-900
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
    color: '#F8FAFC', // slate-50
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#F8FAFC', // slate-50
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeOption: {
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#6366F1', // indigo-500
  },
  typeOptionText: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    textTransform: 'capitalize',
  },
  typeOptionTextSelected: {
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
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  amenityChip: {
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityChipSelected: {
    backgroundColor: '#312E81', // indigo-900
  },
  amenityChipText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
  },
  amenityChipTextSelected: {
    color: '#A5B4FC', // indigo-300
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
    backgroundColor: '#1E293B', // slate-800
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0', // slate-200
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366F1', // indigo-500
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B', // slate-800
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#F8FAFC', // slate-50
    fontWeight: '500',
  },
  amenitiesDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: '#312E81', // indigo-900
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityTagText: {
    fontSize: 11,
    color: '#A5B4FC', // indigo-300
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginLeft: 8,
  },
});

export default PropertiesScreen;
