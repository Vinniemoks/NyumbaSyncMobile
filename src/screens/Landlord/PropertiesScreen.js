import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { propertyService } from '../../services/api';
import { buildStaticMapUrl, openInGoogleMaps } from '../../services/locationService';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';

const TYPE_ICONS = {
  apartment: 'business',
  house: 'home',
  studio: 'albums',
  villa: 'flower',
  commercial: 'storefront',
  bedsitter: 'bed',
};

const PropertiesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await propertyService.getByLandlord();
      const data = response?.data ?? response;
      setProperties(data?.properties || data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
      setLoadError(true);
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

  const handleDelete = (propertyId) => {
    Alert.alert(
      'Delete Property',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.delete(propertyId);
              loadProperties();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  // Units are the property's houses; with none listed the property is one unit.
  const unitCounts = (property) => {
    const houses = Array.isArray(property.houses) ? property.houses : [];
    if (houses.length) return { total: houses.length, occupied: houses.filter((h) => h.status === 'occupied').length };
    return { total: 1, occupied: property.status === 'occupied' ? 1 : 0 };
  };

  const occupancyRate = (property) => {
    const { total, occupied } = unitCounts(property);
    return Math.round((occupied / total) * 100);
  };

  const occupancyColor = (rate) => {
    if (rate >= 90) return colors.success;
    if (rate >= 70) return colors.warning;
    return colors.danger;
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
        <View style={[styles.header, { paddingTop: insets.top + spacing[3] }]}>
          <View>
            <Text style={styles.headerTitle}>My Properties</Text>
            <Text style={styles.headerSubtitle}>{properties.length} listed</Text>
          </View>
          <Button
            icon="add"
            onPress={() => navigation.navigate('AddProperty')}
          />
        </View>

        <View style={styles.list}>
          {properties.map((property) => {
            const rate = occupancyRate(property);
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
                  <TouchableOpacity
                    onPress={() => handleDelete(property._id || property.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
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

                {property.houses?.length > 0 && (
                  <View style={styles.houseRow}>
                    <Ionicons name="key-outline" size={14} color={colors.leaf} />
                    <Text style={styles.houseText}>
                      House {property.houses[0].houseNumber}
                      {property.houses[0].floor ? ` • ${property.houses[0].floor} floor` : ''}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.occupancy}>
                    <Text style={styles.occupancyText}>
                      {unitCounts(property).occupied}/{unitCounts(property).total} units
                    </Text>
                    <View style={styles.occupancyBar}>
                      <View
                        style={[
                          styles.occupancyFill,
                          { width: `${rate}%`, backgroundColor: occupancyColor(rate) },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{property.type || 'property'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {properties.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{loadError ? 'Could not load properties' : 'No properties yet'}</Text>
            <Text style={styles.emptySubtitle}>{loadError ? 'Pull down to try again.' : 'Add your first property to get started.'}</Text>
            <Button
              title="Add Property"
              icon="add"
              onPress={() => navigation.navigate('AddProperty')}
              style={{ marginTop: spacing[4] }}
            />
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
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
                      <Text style={styles.mapOverlayText}>Open in Google Maps</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={styles.modalLabel}>Address</Text>
                <Text style={styles.modalValue}>{formatAddress(selectedProperty.address)}</Text>

                <Text style={styles.modalLabel}>Base Rent</Text>
                <Text style={styles.modalValue}>{formatRent(selectedProperty)}</Text>

                {selectedProperty.serviceCharge ? (
                  <>
                    <Text style={styles.modalLabel}>Service Charge</Text>
                    <Text style={styles.modalValue}>
                      KSh {Number(selectedProperty.serviceCharge).toLocaleString()}
                    </Text>
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
                    <Text style={styles.modalLabel}>House / Unit Details</Text>
                    {selectedProperty.houses.map((h, i) => (
                      <Text key={i} style={styles.modalValue}>
                        {h.houseNumber ? `House ${h.houseNumber}` : 'Unnumbered'}
                        {h.floor ? ` • ${h.floor} floor` : ''}
                      </Text>
                    ))}
                  </>
                )}

                {selectedProperty.amenities?.length > 0 && (
                  <>
                    <Text style={styles.modalLabel}>Amenities</Text>
                    <View style={styles.amenitiesWrap}>
                      {selectedProperty.amenities.map((a, i) => (
                        <View key={i} style={styles.amenityChip}>
                          <Text style={styles.amenityChipText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <Button
                  title="Manage Units"
                  variant="secondary"
                  icon="list"
                  onPress={() => {
                    setSelectedProperty(null);
                    navigation.navigate('PropertyUnits', { propertyId: selectedProperty._id || selectedProperty.id });
                  }}
                  style={{ marginTop: spacing[6] }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  deleteBtn: {
    padding: spacing[2],
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
  houseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  houseText: {
    fontSize: typography.sm,
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancy: {
    flex: 1,
    marginRight: spacing[3],
  },
  occupancyText: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  occupancyBar: {
    height: 6,
    backgroundColor: colors.slate[800],
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  typeBadge: {
    backgroundColor: `${colors.leaf}15`,
    borderWidth: 1,
    borderColor: `${colors.leaf}25`,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  typeBadgeText: {
    fontSize: typography.xs,
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
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
    maxHeight: '90%',
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
    fontSize: typography.sm,
  },
});

export default PropertiesScreen;
