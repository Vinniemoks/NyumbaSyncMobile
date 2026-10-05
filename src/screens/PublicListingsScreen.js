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
import { colors, spacing, typography, commonStyles } from '../config/theme';
import { Rows, Row, Field, Options, Sheet } from '../components/ui';

const TYPE_ICONS = {
  apartment: 'business',
  house: 'home',
  studio: 'albums',
  villa: 'flower',
  commercial: 'storefront',
  bedsitter: 'bed',
};

const AMENITY_DISPLAY_MAP = {
  parking: 'Parking',
  security: 'Security',
  wifi: 'WiFi',
  water_tank: 'Water',
  electricity: 'Electricity',
  backup_generator: 'Generator',
  gym: 'Gym',
  pool: 'Pool',
  garden: 'Garden',
  balcony: 'Balcony',
  elevator: 'Elevator',
  cctv: 'CCTV',
  playground: 'Playground',
  laundry: 'Laundry',
  shopping_center: 'Shopping Center',
};

const PublicListingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    type: '',
    bedrooms: '',
    minRent: '',
    maxRent: '',
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.type) params.type = filters.type;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;

      const response = await propertyService.getPublic(params);
      const data = response?.data ?? response;
      setProperties(data?.data || data?.properties || data || []);
    } catch (error) {
      console.error('Error loading public listings:', error);
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

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
      <View style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  const sel = selectedProperty;
  const setF = (key) => (text) => setFilters((f) => ({ ...f, [key]: text }));
  const amenityLabel = (a) => {
    const name = typeof a === 'string' ? a : a?.name;
    return AMENITY_DISPLAY_MAP[name] || name;
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
      >
        <View style={styles.top}>
          <Text style={styles.count}>{properties.length} available</Text>
          <TouchableOpacity onPress={() => setShowFilters((v) => !v)} hitSlop={8}>
            <Text style={styles.link}>{showFilters ? 'Hide filters' : 'Filter'}</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={{ marginBottom: spacing[3] }}>
            <Field label="Search" value={filters.search} onChangeText={setF('search')} />
            <View style={styles.pair}>
              <Field style={{ flex: 1 }} label="City" value={filters.city} onChangeText={setF('city')} />
              <Field style={{ flex: 1 }} label="Bedrooms" value={filters.bedrooms} onChangeText={setF('bedrooms')} keyboardType="number-pad" />
            </View>
            <View style={styles.pair}>
              <Field style={{ flex: 1 }} label="Min rent (KSh)" value={filters.minRent} onChangeText={setF('minRent')} keyboardType="number-pad" />
              <Field style={{ flex: 1 }} label="Max rent (KSh)" value={filters.maxRent} onChangeText={setF('maxRent')} keyboardType="number-pad" />
            </View>
            <Options
              label="Type"
              options={['apartment', 'house', 'studio', 'bedsitter', 'commercial']}
              value={filters.type}
              onChange={(type) => setFilters((f) => ({ ...f, type: f.type === type ? '' : type }))}
            />
            <Button title="Apply filters" onPress={() => { setShowFilters(false); loadProperties(); }} fullWidth />
          </View>
        )}

        <Rows>
          {properties.map((property) => {
            const bits = [
              property.bedrooms ? `${property.bedrooms} bed` : null,
              property.bathrooms ? `${property.bathrooms} bath` : null,
              property.type,
            ].filter(Boolean).join(' · ');
            return (
              <TouchableOpacity key={property._id || property.id} style={styles.item} onPress={() => setSelectedProperty(property)} activeOpacity={0.6}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{property.title || property.name}</Text>
                  <Text style={styles.itemSub} numberOfLines={2}>{[formatAddress(property.address), bits].filter(Boolean).join(' · ')}</Text>
                </View>
                <Text style={styles.itemRent}>{formatRent(property)}</Text>
              </TouchableOpacity>
            );
          })}
        </Rows>

        {properties.length === 0 && <Text style={styles.empty}>No listings yet. Check back soon.</Text>}
      </ScrollView>

      <Sheet visible={Boolean(sel)} title={sel?.title || sel?.name || ''} onClose={() => setSelectedProperty(null)}>
        {!!sel?.address?.coordinates && (
          <TouchableOpacity
            style={styles.mapCard}
            onPress={() => openInGoogleMaps(sel.address.coordinates.latitude, sel.address.coordinates.longitude, sel.title || sel.name)}
          >
            <Image
              source={{ uri: buildStaticMapUrl(sel.address.coordinates.latitude, sel.address.coordinates.longitude) }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>Directions in Google Maps</Text>
            </View>
          </TouchableOpacity>
        )}

        {!!sel && (
          <Rows>
            <Row label="Address" value={formatAddress(sel.address)} />
            <Row label="Rent" value={formatRent(sel)} />
            {!!sel.deposit && <Row label="Deposit" value={`KSh ${Number(sel.deposit).toLocaleString()}`} />}
            {!!sel.serviceCharge && <Row label="Service charge" value={`KSh ${Number(sel.serviceCharge).toLocaleString()}`} />}
            {(sel.utilities || []).map((u, i) => (
              <Row key={i} label={u.name} value={`KSh ${Number(u.amount).toLocaleString()}${u.isMandatory ? ' · mandatory' : ''}`} />
            ))}
            {(sel.houses || []).map((h, i) => (
              <Row
                key={`h${i}`}
                label={h.houseNumber ? `House ${h.houseNumber}` : 'Unit'}
                value={[h.floor ? `${h.floor} floor` : null, h.status].filter(Boolean).join(' · ') || undefined}
              />
            ))}
          </Rows>
        )}
        {sel?.amenities?.length > 0 && (
          <Text style={styles.copy}>{sel.amenities.map(amenityLabel).filter(Boolean).join(' · ')}</Text>
        )}
        {!!sel?.description && <Text style={styles.copy}>{sel.description}</Text>}

        <Field
          style={{ marginTop: spacing[4] }}
          label="Message to the landlord (optional)"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Button title="Express interest" onPress={handleApply} loading={applyLoading} disabled={applyLoading} fullWidth size="lg" />
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[4] },
  count: { color: colors.textSecondary, fontSize: typography.sm },
  link: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
  pair: { flexDirection: 'row', gap: spacing[3] },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  itemTitle: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: typography.sm, marginTop: 2, textTransform: 'capitalize' },
  itemRent: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', marginLeft: spacing[3] },
  empty: { color: colors.textSecondary, paddingVertical: spacing[5] },
  copy: { color: colors.textSecondary, fontSize: typography.sm, lineHeight: 21, marginTop: spacing[3] },
  mapCard: { borderRadius: 8, overflow: 'hidden', marginBottom: spacing[4] },
  mapImage: { width: '100%', height: 160 },
  mapOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: spacing[2], backgroundColor: 'rgba(15,23,42,0.7)', alignItems: 'center' },
  mapOverlayText: { color: colors.white, fontSize: typography.sm, fontWeight: '600' },
});

export default PublicListingsScreen;
