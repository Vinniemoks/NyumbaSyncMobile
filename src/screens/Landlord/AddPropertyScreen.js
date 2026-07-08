import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { propertyService } from '../../services/api';
import {
  searchPlaces,
  buildStaticMapUrl,
  openInGoogleMaps,
  openAddressInGoogleMaps,
} from '../../services/locationService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: 'business' },
  { value: 'house', label: 'House', icon: 'home' },
  { value: 'studio', label: 'Studio', icon: 'albums' },
  { value: 'villa', label: 'Villa', icon: 'flower' },
  { value: 'commercial', label: 'Commercial', icon: 'storefront' },
  { value: 'bedsitter', label: 'Bedsitter', icon: 'bed' },
];

const AMENITIES = [
  'Parking', 'Security', 'WiFi', 'Water', 'Electricity', 'Generator',
  'Gym', 'Pool', 'Garden', 'Balcony', 'Elevator', 'CCTV',
  'Water Tank', 'Playground', 'Laundry',
];

const AMENITY_MAP = {
  Parking: 'parking',
  Security: 'security',
  WiFi: 'wifi',
  Water: 'water_tank',
  Electricity: 'electricity',
  Generator: 'backup_generator',
  Gym: 'gym',
  Pool: 'pool',
  Garden: 'garden',
  Balcony: 'balcony',
  Elevator: 'elevator',
  CCTV: 'cctv',
  'Water Tank': 'water_tank',
  Playground: 'playground',
  Laundry: 'laundry',
};

const DEFAULT_UTILITIES = [
  { name: 'Water', amount: '', enabled: false },
  { name: 'Security', amount: '', enabled: false },
  { name: 'Garbage', amount: '', enabled: false },
];

const AddPropertyScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    address: {
      street: '',
      area: '',
      city: 'Nairobi',
      county: 'Nairobi',
      coordinates: null,
    },
    rentAmount: '',
    deposit: '',
    serviceCharge: '',
    utilities: DEFAULT_UTILITIES,
    customUtilities: [],
    houseNumber: '',
    floor: '',
    amenities: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (updates) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, ...updates } }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchPlaces(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const selectPlace = (place) => {
    const parts = (place.display_name || '').split(',').map((s) => s.trim());
    const street = parts[0] || '';
    const area = parts[1] || '';
    const city = parts[parts.length - 3] || form.address.city;
    const county = parts[parts.length - 2] || form.address.county;

    updateAddress({
      street,
      area,
      city,
      county,
      coordinates: {
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
      },
    });
    setSearchQuery(place.display_name);
    setSearchResults([]);
  };

  const toggleUtility = (index) => {
    setForm((prev) => {
      const utilities = [...prev.utilities];
      utilities[index] = { ...utilities[index], enabled: !utilities[index].enabled };
      return { ...prev, utilities };
    });
  };

  const updateUtilityAmount = (index, amount) => {
    setForm((prev) => {
      const utilities = [...prev.utilities];
      utilities[index] = { ...utilities[index], amount };
      return { ...prev, utilities };
    });
  };

  const addCustomUtility = () => {
    setForm((prev) => ({
      ...prev,
      customUtilities: [...prev.customUtilities, { name: '', amount: '', enabled: true }],
    }));
  };

  const updateCustomUtility = (index, field, value) => {
    setForm((prev) => {
      const customUtilities = [...prev.customUtilities];
      customUtilities[index] = { ...customUtilities[index], [field]: value };
      return { ...prev, customUtilities };
    });
  };

  const removeCustomUtility = (index) => {
    setForm((prev) => ({
      ...prev,
      customUtilities: prev.customUtilities.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const normalizeUtilities = () => {
    const base = form.utilities
      .filter((u) => u.enabled && u.name.trim() && parseFloat(u.amount) >= 0)
      .map((u) => ({ name: u.name.trim(), amount: parseFloat(u.amount) || 0, isCustom: false }));
    const custom = form.customUtilities
      .filter((u) => u.enabled && u.name.trim() && parseFloat(u.amount) >= 0)
      .map((u) => ({ name: u.name.trim(), amount: parseFloat(u.amount) || 0, isCustom: true }));
    return [...base, ...custom];
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Property name is required');
      return;
    }
    if (!form.address.area.trim()) {
      Alert.alert('Error', 'Area / neighbourhood is required');
      return;
    }
    if (!form.address.street.trim()) {
      Alert.alert('Error', 'Street address is required');
      return;
    }
    if (!form.houseNumber.trim()) {
      Alert.alert('Error', 'House / unit number is required');
      return;
    }
    const bedrooms = parseInt(form.bedrooms, 10);
    if (isNaN(bedrooms) || bedrooms < 0) {
      Alert.alert('Error', 'Number of bedrooms is required');
      return;
    }
    const bathrooms = parseInt(form.bathrooms, 10);
    if (isNaN(bathrooms) || bathrooms < 0) {
      Alert.alert('Error', 'Number of bathrooms is required');
      return;
    }
    const rent = parseFloat(form.rentAmount);
    if (isNaN(rent) || rent < 1000) {
      Alert.alert('Error', 'Base rent is required and must be at least KES 1,000');
      return;
    }
    const deposit = form.deposit ? parseFloat(form.deposit) : rent;
    if (isNaN(deposit) || deposit < 0 || deposit > rent * 3) {
      Alert.alert('Error', 'Deposit must be between 0 and 3 months\' rent');
      return;
    }
    const description = form.description.trim();
    if (description.length < 50) {
      Alert.alert('Error', `Description must be at least 50 characters (currently ${description.length})`);
      return;
    }

    setSubmitting(true);
    try {
      const landlordId = user?._id || user?.id;
      const geo = form.address.coordinates;
      const payload = {
        title: form.title.trim(),
        description,
        type: form.type,
        bedrooms,
        bathrooms,
        squareFootage: form.squareFootage ? parseFloat(form.squareFootage) : undefined,
        address: {
          street: form.address.street.trim(),
          area: form.address.area.trim(),
          city: form.address.city.trim() || 'Nairobi',
          county: form.address.county.trim() || 'Nairobi',
          coordinates: geo ? { type: 'Point', coordinates: [geo.longitude, geo.latitude] } : undefined,
        },
        rent: {
          amount: rent,
          currency: 'KES',
          paymentFrequency: 'monthly',
        },
        deposit,
        serviceCharge: form.serviceCharge ? parseFloat(form.serviceCharge) : 0,
        utilities: normalizeUtilities(),
        houses: [
          {
            houseNumber: form.houseNumber.trim(),
            floor: form.floor ? parseInt(form.floor, 10) : undefined,
            status: 'available',
          },
        ],
        amenities: form.amenities.map((a) => AMENITY_MAP[a] || a.toLowerCase().replace(/\s+/g, '_')),
        listing: { isListed: true },
        landlordId,
      };

      const response = await propertyService.create(payload);
      const data = response?.data ?? response;

      if (data?.success || data?.property || data?._id || data?.data?._id) {
        Alert.alert('Success', 'Property listed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data?.message || data?.error || 'Failed to add property');
      }
    } catch (error) {
      console.error('Add property error:', error);
      Alert.alert('Error', error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to add property');
    } finally {
      setSubmitting(false);
    }
  };

  const coords = form.address.coordinates;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add New Property</Text>
        <Text style={styles.subtitle}>List a property for tenants to discover.</Text>

        {/* Property name */}
        <Text style={styles.label}>Property Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Riverside Apartments"
          placeholderTextColor={colors.textMuted}
          value={form.title}
          onChangeText={(text) => updateField('title', text)}
        />

        {/* Location search */}
        <Text style={styles.label}>Location *</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, styles.searchInput]}
            placeholder="Search address or landmark"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <Button
            icon="search"
            onPress={handleSearch}
            loading={searching}
            disabled={searching || !searchQuery.trim()}
          />
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.place_id}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => selectPlace(item)}
                >
                  <Ionicons name="location-outline" size={18} color={colors.leaf} />
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Street / Building"
          placeholderTextColor={colors.textMuted}
          value={form.address.street}
          onChangeText={(text) => updateAddress({ street: text })}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Area *"
            placeholderTextColor={colors.textMuted}
            value={form.address.area}
            onChangeText={(text) => updateAddress({ area: text })}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="City"
            placeholderTextColor={colors.textMuted}
            value={form.address.city}
            onChangeText={(text) => updateAddress({ city: text })}
          />
        </View>

        {/* Map preview */}
        {coords ? (
          <TouchableOpacity
            style={styles.mapCard}
            onPress={() => openInGoogleMaps(coords.latitude, coords.longitude, form.title)}
          >
            <Image
              source={{ uri: buildStaticMapUrl(coords.latitude, coords.longitude) }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Ionicons name="map-outline" size={18} color={colors.white} />
              <Text style={styles.mapOverlayText}>Open in Google Maps</Text>
            </View>
          </TouchableOpacity>
        ) : (
          form.address.street.length > 3 && (
            <Button
              variant="outline"
              icon="map-outline"
              onPress={() => openAddressInGoogleMaps(form.address.street)}
              style={{ marginBottom: spacing[4] }}
            >
              Preview address in Google Maps
            </Button>
          )
        )}

        {/* Property type */}
        <Text style={styles.label}>Property Type *</Text>
        <View style={styles.typeRow}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeChip,
                form.type === type.value && styles.typeChipActive,
              ]}
              onPress={() => updateField('type', type.value)}
            >
              <Ionicons
                name={type.icon}
                size={16}
                color={form.type === type.value ? colors.gold : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeChipText,
                  form.type === type.value && styles.typeChipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Beds / Baths / Size */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.third]}
            placeholder="Beds *"
            placeholderTextColor={colors.textMuted}
            value={form.bedrooms}
            onChangeText={(text) => updateField('bedrooms', text)}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.third]}
            placeholder="Baths *"
            placeholderTextColor={colors.textMuted}
            value={form.bathrooms}
            onChangeText={(text) => updateField('bathrooms', text)}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.third]}
            placeholder="Sq ft"
            placeholderTextColor={colors.textMuted}
            value={form.squareFootage}
            onChangeText={(text) => updateField('squareFootage', text)}
            keyboardType="number-pad"
          />
        </View>

        {/* House number / floor */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="House / Unit Number *"
            placeholderTextColor={colors.textMuted}
            value={form.houseNumber}
            onChangeText={(text) => updateField('houseNumber', text)}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Floor"
            placeholderTextColor={colors.textMuted}
            value={form.floor}
            onChangeText={(text) => updateField('floor', text)}
          />
        </View>

        {/* Rent / deposit / service charge */}
        <Text style={styles.label}>Base Rent (KES) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 25000"
          placeholderTextColor={colors.textMuted}
          value={form.rentAmount}
          onChangeText={(text) => updateField('rentAmount', text)}
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Deposit (KES) — defaults to rent"
            placeholderTextColor={colors.textMuted}
            value={form.deposit}
            onChangeText={(text) => updateField('deposit', text)}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Service Charge (KES)"
            placeholderTextColor={colors.textMuted}
            value={form.serviceCharge}
            onChangeText={(text) => updateField('serviceCharge', text)}
            keyboardType="number-pad"
          />
        </View>

        {/* Utilities */}
        <Text style={styles.label}>Utilities (optional)</Text>
        <View style={styles.utilitiesCard}>
          {form.utilities.map((utility, index) => (
            <View key={utility.name} style={styles.utilityRow}>
              <TouchableOpacity
                style={[styles.utilityToggle, utility.enabled && styles.utilityToggleActive]}
                onPress={() => toggleUtility(index)}
              >
                <Ionicons
                  name={utility.enabled ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={utility.enabled ? colors.gold : colors.textMuted}
                />
                <Text style={styles.utilityName}>{utility.name}</Text>
              </TouchableOpacity>
              {utility.enabled && (
                <TextInput
                  style={styles.utilityInput}
                  placeholder="Amount"
                  placeholderTextColor={colors.textMuted}
                  value={utility.amount}
                  onChangeText={(text) => updateUtilityAmount(index, text)}
                  keyboardType="number-pad"
                />
              )}
            </View>
          ))}

          {form.customUtilities.map((utility, index) => (
            <View key={`custom-${index}`} style={styles.customUtilityRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Utility name"
                placeholderTextColor={colors.textMuted}
                value={utility.name}
                onChangeText={(text) => updateCustomUtility(index, 'name', text)}
              />
              <TextInput
                style={[styles.input, styles.utilityInput, { marginBottom: 0 }]}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                value={utility.amount}
                onChangeText={(text) => updateCustomUtility(index, 'amount', text)}
                keyboardType="number-pad"
              />
              <TouchableOpacity onPress={() => removeCustomUtility(index)} style={styles.removeUtility}>
                <Ionicons name="close-circle" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          <Button
            variant="ghost"
            icon="add"
            onPress={addCustomUtility}
            style={{ marginTop: spacing[2] }}
          >
            Add another utility
          </Button>
        </View>

        {/* Amenities */}
        <Text style={styles.label}>Amenities</Text>
        <View style={styles.amenitiesWrap}>
          {AMENITIES.map((amenity) => {
            const active = form.amenities.includes(amenity);
            return (
              <TouchableOpacity
                key={amenity}
                style={[styles.amenityChip, active && styles.amenityChipActive]}
                onPress={() => toggleAmenity(amenity)}
              >
                <Text style={[styles.amenityChipText, active && styles.amenityChipTextActive]}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description * (min 50 characters)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the property..."
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(text) => updateField('description', text)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit */}
        <Button
          title="List Property"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          fullWidth
          size="lg"
          style={{ marginTop: spacing[4], marginBottom: spacing[8] }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing[5],
    paddingTop: spacing[6],
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing[4],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  half: {
    flex: 1,
  },
  third: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    marginBottom: spacing[2],
  },
  resultsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginBottom: spacing[4],
    ...shadows.card,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[800],
  },
  resultText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.sm,
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
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  typeChipActive: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}12`,
  },
  typeChipText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  typeChipTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
  },
  utilitiesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.card,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  utilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  utilityToggleActive: {},
  utilityName: {
    color: colors.textPrimary,
    fontSize: typography.base,
  },
  utilityInput: {
    width: 90,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[2],
    color: colors.textPrimary,
    textAlign: 'right',
  },
  customUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  removeUtility: {
    padding: spacing[1],
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  amenityChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  amenityChipActive: {
    backgroundColor: `${colors.leaf}15`,
    borderColor: colors.leaf,
  },
  amenityChipText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  amenityChipTextActive: {
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
};

export default AddPropertyScreen;
