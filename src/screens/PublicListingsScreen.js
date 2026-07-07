import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import { propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { buildStaticMapUrl, openInGoogleMaps } from '../services/locationService';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

const TYPE_ICONS = {
  apartment: 'business',
  house: 'home',
  studio: 'albums',
  villa: 'flower',
  commercial: 'storefront',
  bedsitter: 'bed',
};

const PublicListingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await propertyService.getPublic();
      const data = response?.data ?? response;
      setProperties(data?.properties || data || []);
    } catch (error) {
      console.error('Error loading public listings:', error);
      // Fallback demo data so the screen is reviewable without the backend
      setProperties([
        {
          _id: 'demo-1',
          title: 'Riverside Apartments',
          address: { street: '123 Riverside Drive', area: 'Kileleshwa', city: 'Nairobi', coordinates: { latitude: -1.27, longitude: 36.8 } },
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          rent: { amount: 28000 },
          deposit: 28000,
          serviceCharge: 2000,
          utilities: [{ name: 'Water', amount: 500, isMandatory: true }, { name: 'Security', amount: 1500, isMandatory: true }],
          houses: [{ houseNumber: 'B4', floor: '3rd', status: 'available' }],
          amenities: ['Parking', 'WiFi', 'Security', 'Water'],
          description: 'Modern apartment close to the CBD with secure parking and 24/7 water.',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.area, address.city].filter(Boolean);
    return parts.join(', ');
  };

  const formatRent = (property) => {
    const amount = property.rent?.amount ?? property.rent ?? 0;
    return `KSh ${Number(amount).toLocaleString()}`;
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please log in to apply for a property.');
      return;
    }
    const id = selectedProperty?._id || selectedProperty?.id;
    if (!id) return;

    setApplyLoading(true);
    try {
      await propertyService.expressInterest(id, {
        message: message.trim(),
      });
      Alert.alert(
        'Interest Sent',
        'The landlord and NyumbaSync front-office team have been notified. You will be contacted soon.',
        [{ text: 'OK', onPress: () => setSelectedProperty(null) }]
      );
      setMessage('');
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to send interest.';
      Alert.alert('Error', errMsg);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" color={colors.leaf} />
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Browse Properties</Text>
            <Text style={styles.headerSubtitle}>{properties.length} available</Text>
          </View>
        </View>

        <View style={styles.list}>
          {properties.map((property) => {
            const iconName = TYPE_ICONS[property.type] || 'home';
            return (
              <TouchableOpacity
                key={property._id || property.id}
                style={styles.card}
                onPress={() => setSelectedProperty(property)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={iconName} size={24} color={colors.gold} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.propertyName}>{property.title || property.name}</Text>
                    <Text style={styles.propertyAddress} numberOfLines={1}>
                      {formatAddress(property.address)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailPill}>
                    <Ionicons name="bed-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{property.bedrooms || 0} Beds</Text>
                  </View>
                  <View style={styles.detailPill}>
                    <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{property.bathrooms || 0} Baths</Text>
                  </View>
                  <View style={styles.detailPill}>
                    <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{formatRent(property)}</Text>
                  </View>
                </View>

                {property.amenities?.length > 0 && (
                  <View style={styles.amenitiesWrap}>
                    {property.amenities.slice(0, 4).map((a, i) => (
                      <View key={i} style={styles.amenityChip}>
                        <Text style={styles.amenityChipText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {properties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for available properties.</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail / Apply Modal */}
      <Modal
        visible={Boolean(selectedProperty)}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedProperty(null)}
      >
        {selectedProperty && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedProperty.title || selectedProperty.name}</Text>
                <TouchableOpacity onPress={() => setSelectedProperty(null)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedProperty.address?.coordinates && (
                  <TouchableOpacity
                    style={styles.mapCard}
                    onPress={() =>
                      openInGoogleMaps(
                        selectedProperty.address.coordinates.latitude,
                        selectedProperty.address.coordinates.longitude,
                        selectedProperty.title || selectedProperty.name
                      )
                    }
                  >
                    <Image
                      source={{
                        uri: buildStaticMapUrl(
                          selectedProperty.address.coordinates.latitude,
                          selectedProperty.address.coordinates.longitude
                        ),
                      }}
                      style={styles.mapImage}
                      resizeMode="cover"
                    />
                    <View style={styles.mapOverlay}>
                      <Ionicons name="map-outline" size={18} color={colors.white} />
                      <Text style={styles.mapOverlayText}>Get directions on Google Maps</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={styles.modalLabel}>Address</Text>
                <Text style={styles.modalValue}>{formatAddress(selectedProperty.address)}</Text>

                <Text style={styles.modalLabel}>Base Rent</Text>
                <Text style={styles.modalValue}>{formatRent(selectedProperty)}</Text>

                {selectedProperty.deposit ? (
                  <>
                    <Text style={styles.modalLabel}>Deposit</Text>
                    <Text style={styles.modalValue}>KSh {Number(selectedProperty.deposit).toLocaleString()}</Text>
                  </>
                ) : null}

                {selectedProperty.serviceCharge ? (
                  <>
                    <Text style={styles.modalLabel}>Service Charge</Text>
                    <Text style={styles.modalValue}>KSh {Number(selectedProperty.serviceCharge).toLocaleString()}</Text>
                  </>
                ) : null}

                {selectedProperty.utilities?.length > 0 && (
                  <>
                    <Text style={styles.modalLabel}>Utilities</Text>
                    {selectedProperty.utilities.map((u, i) => (
                      <View key={i} style={styles.utilityRow}>
                        <Text style={styles.utilityName}>{u.name}</Text>
                        <Text style={styles.utilityAmount}>
                          KSh {Number(u.amount).toLocaleString()}
                          {u.isMandatory ? ' (mandatory)' : ''}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                {selectedProperty.houses?.length > 0 && (
                  <>
                    <Text style={styles.modalLabel}>House / Unit</Text>
                    {selectedProperty.houses.map((h, i) => (
                      <Text key={i} style={styles.modalValue}>
                        {h.houseNumber ? `House ${h.houseNumber}` : 'Unnumbered'}
                        {h.floor ? ` • ${h.floor} floor` : ''}
                        {h.status ? ` • ${h.status}` : ''}
                      </Text>
                    ))}
                  </>
                )}

                {selectedProperty.description ? (
                  <>
                    <Text style={styles.modalLabel}>Description</Text>
                    <Text style={styles.modalValue}>{selectedProperty.description}</Text>
                  </>
                ) : null}

                <Text style={styles.modalLabel}>Message to landlord (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Introduce yourself or ask a question..."
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Button
                  title="Apply / Express Interest"
                  onPress={handleApply}
                  loading={applyLoading}
                  disabled={applyLoading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: spacing[4], marginBottom: spacing[6] }}
                />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing[5],
    paddingTop: spacing[6],
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
  list: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${colors.gold}12`,
    borderWidth: 1,
    borderColor: `${colors.gold}25`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  cardInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  propertyAddress: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  detailText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  amenityChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  amenityChipText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing[10],
  },
  emptyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing[4],
  },
  emptySubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '92%',
    padding: spacing[5],
    paddingTop: spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing[3],
  },
  mapCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    position: 'relative',
    ...shadows.card,
  },
  mapImage: {
    width: '100%',
    height: 180,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: 'rgba(15,23,42,0.75)',
  },
  mapOverlayText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  modalLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  modalValue: {
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[800],
  },
  utilityName: {
    color: colors.textPrimary,
    fontSize: typography.base,
  },
  utilityAmount: {
    color: colors.textSecondary,
    fontSize: typography.base,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    color: colors.textPrimary,
    fontSize: typography.base,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default PublicListingsScreen;
