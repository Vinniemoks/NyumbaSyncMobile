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
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

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
      const response = await propertyService.getByLandlord();
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
        <ActivityIndicator size="large" color={colors.info} />
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
                  <Ionicons name="home" size={24} color={colors.info} />
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
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <View style={styles.propertyDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{property.bedrooms} Beds</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{property.bathrooms} Baths</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
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
                    { backgroundColor: '#1E3A8A' },
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
            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
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
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
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
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>
                      {selectedProperty?.address}, {selectedProperty?.city}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Monthly Rent</Text>
                    <Text style={styles.detailValue}>
                      KSh {selectedProperty?.rent?.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Property Type</Text>
                    <Text style={styles.detailValue}>{selectedProperty?.type}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="bed-outline" size={20} color={colors.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Bedrooms & Bathrooms</Text>
                    <Text style={styles.detailValue}>
                      {selectedProperty?.bedrooms} Bedrooms, {selectedProperty?.bathrooms} Bathrooms
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={20} color={colors.info} />
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
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.info} />
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
                  <Ionicons name="grid" size={20} color={colors.info} />
                  <Text style={styles.actionButtonText}>Manage Units</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowDetailsModal(false);
                    Alert.alert('Info', 'Edit property feature coming soon');
                  }}
                >
                  <Ionicons name="create" size={20} color={colors.success} />
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
    backgroundColor: colors.bg, // slate-950
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
    backgroundColor: colors.surface, // slate-900
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
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
  propertiesList: {
    padding: spacing[5],
  },
  propertyCard: {
    backgroundColor: colors.surface, // slate-900
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius['3xl'],
    backgroundColor: colors.slate[800], // slate-800
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[1],
  },
  propertyAddress: {
    fontSize: 13,
    color: colors.textSecondary, // slate-400
  },
  deleteButton: {
    padding: spacing[2],
  },
  propertyDetails: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary, // slate-400
    marginLeft: spacing[1],
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancyInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  occupancyText: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginBottom: spacing[1],
  },
  occupancyBar: {
    height: 6,
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  typeBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.xl,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.blue[300], // indigo-300
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary, // slate-400
    marginTop: spacing[4],
  },
  emptyStateSubtext: {
    fontSize: typography.sm,
    color: colors.textMuted, // slate-500
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
    backgroundColor: colors.surface, // slate-900
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
    color: colors.textPrimary, // slate-50
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200], // slate-200
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[4],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[4],
  },
  typeOption: {
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  typeOptionSelected: {
    backgroundColor: colors.darkBlue, 
  },
  typeOptionText: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
    textTransform: 'capitalize',
  },
  typeOptionTextSelected: {
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
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[4],
  },
  amenityChip: {
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  amenityChipSelected: {
    backgroundColor: '#1E3A8A', // indigo-900
  },
  amenityChipText: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
  },
  amenityChipTextSelected: {
    color: colors.blue[300], // indigo-300
    fontWeight: typography.fontWeight.semibold,
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
    backgroundColor: colors.slate[800], // slate-800
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200], // slate-200
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
  detailsSection: {
    marginBottom: spacing[6],
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B', // slate-800
  },
  detailContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  detailLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginBottom: spacing[1],
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary, // slate-50
    fontWeight: typography.fontWeight.medium,
  },
  amenitiesDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing[2],
  },
  amenityTag: {
    backgroundColor: '#1E3A8A', // indigo-900
    borderRadius: borderRadius.xl,
    paddingHorizontal: 10,
    paddingVertical: spacing[1],
    marginRight: spacing[1] + 2,
    marginBottom: spacing[1] + 2,
  },
  amenityTagText: {
    fontSize: 11,
    color: colors.blue[300], // indigo-300
    fontWeight: typography.fontWeight.medium,
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
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200], // slate-200
    marginLeft: spacing[2],
  },
});

export default PropertiesScreen;
