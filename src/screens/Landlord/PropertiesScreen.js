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
import { Rows, Row, Sheet } from '../../components/ui';
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
            <Text style={styles.headerTitle}>Properties</Text>
            <Text style={styles.headerSubtitle}>{properties.length} listed</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddProperty')} hitSlop={8}>
            <Text style={styles.addLink}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {properties.map((property) => {
            const counts = unitCounts(property);
            return (
              <TouchableOpacity
                key={property._id || property.id}
                style={styles.pRow}
                onPress={() => setSelectedProperty(property)}
                activeOpacity={0.6}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pName} numberOfLines={1}>{property.title || property.name}</Text>
                  <Text style={styles.pSub} numberOfLines={1}>
                    {[formatAddress(property.address), counts.total ? `${counts.occupied} of ${counts.total} let` : null].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={styles.pRent}>{formatRent(property)}</Text>
                <TouchableOpacity onPress={() => handleDelete(property._id || property.id)} hitSlop={10} style={{ marginLeft: spacing[3] }}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
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

      <Sheet visible={Boolean(selectedProperty)} title={selectedProperty?.title || selectedProperty?.name || ''} onClose={() => setSelectedProperty(null)}>
        {!!selectedProperty?.address?.coordinates && (
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
              source={{ uri: buildStaticMapUrl(selectedProperty.address.coordinates.latitude, selectedProperty.address.coordinates.longitude) }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>Open in Google Maps</Text>
            </View>
          </TouchableOpacity>
        )}
        {!!selectedProperty && (
          <Rows>
            <Row label="Address" value={formatAddress(selectedProperty.address)} />
            <Row label="Rent" value={formatRent(selectedProperty)} />
            {!!selectedProperty.serviceCharge && <Row label="Service charge" value={`KSh ${Number(selectedProperty.serviceCharge).toLocaleString()}`} />}
            {(selectedProperty.utilities || []).map((u, i) => (
              <Row key={i} label={u.name} value={`KSh ${Number(u.amount).toLocaleString()}${u.isMandatory ? ' · mandatory' : ''}`} />
            ))}
            {(selectedProperty.houses || []).map((h, i) => (
              <Row key={`h${i}`} label={h.houseNumber ? `House ${h.houseNumber}` : 'Unit'} value={h.floor ? `${h.floor} floor` : undefined} />
            ))}
          </Rows>
        )}
        {selectedProperty?.amenities?.length > 0 && (
          <Text style={styles.amenityText}>{selectedProperty.amenities.join(' · ')}</Text>
        )}
        <Button
          title="Manage units"
          size="lg"
          onPress={() => {
            const id = selectedProperty._id || selectedProperty.id;
            setSelectedProperty(null);
            navigation.navigate('PropertyUnits', { propertyId: id });
          }}
          style={{ marginTop: spacing[5] }}
        />
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  amenityText: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing[3], textTransform: 'capitalize' },
  addLink: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
  pRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pName: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  pSub: { color: colors.textMuted, fontSize: typography.sm, marginTop: 2 },
  pRent: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', marginLeft: spacing[3] },
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
