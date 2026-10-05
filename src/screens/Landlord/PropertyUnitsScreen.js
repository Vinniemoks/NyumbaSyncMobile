import React, { useState, useEffect, useCallback } from 'react';
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
import Button from '../../components/Button';
import { Heading, Field, Options, Sheet } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

// Units are the `houses[]` array embedded on the property document — the same
// contract the web app uses. Every mutation round-trips the full array through
// PUT /v2/properties/:id (the backend derives property availability from it).

const UNIT_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1br', label: '1BR' },
  { value: '2br', label: '2BR' },
  { value: '3br', label: '3BR' },
  { value: '4br', label: '4BR+' },
  { value: 'other', label: 'Other' },
];

const UNIT_TYPE_LABELS = UNIT_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: t.label }), {});

const STATUSES = [
  { value: 'available', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

const STATUS_COLORS = {
  available: colors.success,
  occupied: colors.info || '#3B82F6',
  maintenance: colors.warning,
};

const STATUS_ICONS = {
  available: 'home-outline',
  occupied: 'people',
  maintenance: 'construct',
};

const floorLabel = (floor) => {
  if (floor === null || floor === undefined || floor === '') return 'Floor not set';
  if (Number(floor) === 0) return 'Ground Floor';
  return `Floor ${floor}`;
};

// Strip a house down to the fields the API accepts before a full-array PUT.
const toPayloadHouse = (h) => ({
  houseNumber: h.houseNumber || h.number,
  floor: h.floor === '' || h.floor == null ? undefined : parseInt(h.floor),
  unitType: h.unitType || undefined,
  rent: h.rent === '' || h.rent == null ? undefined : parseFloat(h.rent),
  status: h.status || 'available',
  tenant: h.tenant,
  lastPayment: h.lastPayment,
});

const EMPTY_FORM = { houseNumber: '', floor: '', unitType: '', rent: '', status: 'available' };
const EMPTY_BULK = { count: '5', prefix: '', startNumber: '1', floor: '', unitType: '', rent: '' };

const PropertyUnitsScreen = ({ route, navigation }) => {
  const { propertyId, propertyName } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'bulk'
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [bulkData, setBulkData] = useState(EMPTY_BULK);

  const houses = property?.houses || [];

  const loadProperty = useCallback(async () => {
    try {
      const response = await propertyService.getV2ById(propertyId);
      setProperty(response.data.data);
    } catch (error) {
      console.error('Error loading property units:', error);
      Alert.alert('Error', 'Failed to load units');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const saveHouses = async (nextHouses, successMessage) => {
    if (nextHouses.length === 0) {
      Alert.alert('Error', 'A property must have at least one unit');
      return false;
    }
    try {
      setSaving(true);
      const response = await propertyService.updateV2(propertyId, {
        houses: nextHouses.map(toPayloadHouse),
      });
      setProperty(response.data.data);
      if (successMessage) Alert.alert('Success', successMessage);
      return true;
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save units');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditIndex(null);
    setFormData(EMPTY_FORM);
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setModal('add');
  };

  const openEdit = (index) => {
    const h = houses[index];
    setEditIndex(index);
    setFormData({
      houseNumber: h.houseNumber || h.number || '',
      floor: h.floor === null || h.floor === undefined ? '' : String(h.floor),
      unitType: h.unitType || '',
      rent: h.rent === null || h.rent === undefined ? '' : String(h.rent),
      status: h.status || 'available',
    });
    setModal('edit');
  };

  const handleSubmitUnit = async () => {
    if (!formData.houseNumber.trim()) {
      Alert.alert('Error', 'Unit number is required');
      return;
    }
    let nextHouses;
    if (modal === 'edit') {
      nextHouses = houses.map((h, i) =>
        i === editIndex
          ? {
              ...h,
              ...formData,
              // Vacating a unit detaches its tenant; the backend enforces the
              // same rule, mirror it here so the UI updates match.
              tenant: formData.status === 'available' ? undefined : h.tenant,
            }
          : h
      );
    } else {
      nextHouses = [...houses, { ...formData }];
    }
    const ok = await saveHouses(nextHouses, modal === 'edit' ? 'Unit updated' : 'Unit added');
    if (ok) closeModal();
  };

  const handleDeleteUnit = () => {
    const unit = houses[editIndex];
    Alert.alert(
      'Delete Unit',
      `Are you sure you want to delete unit ${unit.houseNumber || unit.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await saveHouses(
              houses.filter((_, i) => i !== editIndex),
              'Unit deleted'
            );
            if (ok) closeModal();
          },
        },
      ]
    );
  };

  const handleBulkGenerate = async () => {
    const count = Math.min(Math.max(parseInt(bulkData.count) || 0, 1), 200);
    const start = parseInt(bulkData.startNumber) || 1;
    const generated = Array.from({ length: count }, (_, i) => ({
      houseNumber: `${bulkData.prefix.trim()}${start + i}`,
      floor: bulkData.floor,
      unitType: bulkData.unitType,
      rent: bulkData.rent,
      status: 'available',
    }));
    const ok = await saveHouses([...houses, ...generated], `${count} units added`);
    if (ok) {
      setBulkData((prev) => ({ ...prev, startNumber: String(start + count) }));
      setModal(null);
    }
  };

  // Group by floor, top floor first, ground floor near the bottom,
  // units without a floor last — reads like looking at the building.
  const floors = [...new Set(houses.map((h) => (h.floor === undefined || h.floor === null ? null : h.floor)))].sort(
    (a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return b - a;
    }
  );

  const stats = {
    total: houses.length,
    available: houses.filter((h) => h.status === 'available').length,
    occupied: houses.filter((h) => h.status === 'occupied').length,
    maintenance: houses.filter((h) => h.status === 'maintenance').length,
  };
  const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
  const defaultRent = property?.rent?.amount;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  const bulkCount = Math.min(Math.max(parseInt(bulkData.count) || 0, 1), 200);
  const bulkFirst = parseInt(bulkData.startNumber) || 1;
  const toggleType = (data, setData) => (value) => setData({ ...data, unitType: data.unitType === value ? '' : value });
  const unitTypeOptions = UNIT_TYPES.map((t) => ({ value: t.value, label: t.label }));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
        <Heading
          title={property?.title || propertyName || 'Units'}
          eyebrow={`${stats.total} units · ${occupancyRate}% occupied`}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={openAdd} disabled={saving} hitSlop={8}><Text style={styles.link}>Add unit</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setModal('bulk')} disabled={saving} hitSlop={8}><Text style={styles.link}>Bulk add</Text></TouchableOpacity>
        </View>

        <View style={styles.legendRow}>
          {STATUSES.map((st) => (
            <View key={st.value} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: STATUS_COLORS[st.value] }]} />
              <Text style={styles.legendText}>{st.label} {stats[st.value]}</Text>
            </View>
          ))}
        </View>

        {floors.map((floor) => (
          <View key={floor === null ? 'none' : String(floor)} style={styles.floorSection}>
            <Text style={styles.floorLabel}>{floorLabel(floor)}</Text>
            <View style={styles.floorUnits}>
              {houses.map((house, index) => {
                const houseFloor = house.floor === undefined || house.floor === null ? null : house.floor;
                if (houseFloor !== floor) return null;
                const statusColor = STATUS_COLORS[house.status] || colors.textMuted;
                return (
                  <TouchableOpacity
                    key={house._id || `${house.houseNumber}-${index}`}
                    style={[styles.unitTile, { borderColor: statusColor }]}
                    onPress={() => openEdit(index)}
                    disabled={saving}
                  >
                    <Text style={styles.unitNumber}>{house.houseNumber || house.number}</Text>
                    {!!house.unitType && <Text style={styles.unitType}>{UNIT_TYPE_LABELS[house.unitType]}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {houses.length === 0 && (
          <Text style={styles.emptyStateSubtext}>No units yet. Add them one by one or generate a batch.</Text>
        )}
      </ScrollView>

      <Sheet visible={modal === 'add' || modal === 'edit'} title={modal === 'edit' ? 'Edit unit' : 'New unit'} onClose={closeModal}>
        <Field label="Unit number" value={formData.houseNumber} onChangeText={(text) => setFormData({ ...formData, houseNumber: text })} />
        <View style={styles.pair}>
          <Field style={{ flex: 1 }} label="Floor (0 = ground)" keyboardType="numeric" value={formData.floor} onChangeText={(text) => setFormData({ ...formData, floor: text })} />
          <Field
            style={{ flex: 1 }}
            label="Rent (KSh)"
            keyboardType="numeric"
            placeholder={defaultRent ? String(defaultRent) : undefined}
            value={formData.rent}
            onChangeText={(text) => setFormData({ ...formData, rent: text })}
          />
        </View>
        <Options label="Type" options={unitTypeOptions} value={formData.unitType} onChange={toggleType(formData, setFormData)} />
        <Options label="Status" options={STATUSES} value={formData.status} onChange={(status) => setFormData({ ...formData, status })} />

        {modal === 'edit' && houses.length > 1 && (
          <TouchableOpacity onPress={handleDeleteUnit} disabled={saving} style={styles.deleteRow}>
            <Text style={styles.deleteRowText}>Delete this unit</Text>
          </TouchableOpacity>
        )}
        <Button title={modal === 'edit' ? 'Save changes' : 'Add unit'} size="lg" onPress={handleSubmitUnit} loading={saving} />
      </Sheet>

      <Sheet visible={modal === 'bulk'} title="Add units in bulk" onClose={closeModal}>
        <View style={styles.pair}>
          <Field style={{ flex: 1 }} label="How many" keyboardType="numeric" value={bulkData.count} onChangeText={(text) => setBulkData({ ...bulkData, count: text })} />
          <Field style={{ flex: 1 }} label="Floor (0 = ground)" keyboardType="numeric" value={bulkData.floor} onChangeText={(text) => setBulkData({ ...bulkData, floor: text })} />
        </View>
        <View style={styles.pair}>
          <Field style={{ flex: 1 }} label="Prefix" placeholder="Block or wing" value={bulkData.prefix} onChangeText={(text) => setBulkData({ ...bulkData, prefix: text })} />
          <Field style={{ flex: 1 }} label="Start at number" keyboardType="numeric" value={bulkData.startNumber} onChangeText={(text) => setBulkData({ ...bulkData, startNumber: text })} />
        </View>
        <Options label="Type" options={unitTypeOptions} value={bulkData.unitType} onChange={toggleType(bulkData, setBulkData)} />
        <Field
          label="Rent per unit (KSh)"
          keyboardType="numeric"
          placeholder={defaultRent ? String(defaultRent) : undefined}
          value={bulkData.rent}
          onChangeText={(text) => setBulkData({ ...bulkData, rent: text })}
        />
        <Text style={styles.bulkPreview}>
          Creates {bulkCount} vacant units, {`${bulkData.prefix.trim()}${bulkFirst}`} to {`${bulkData.prefix.trim()}${bulkFirst + bulkCount - 1}`}. Run once per floor or unit type.
        </Text>
        <Button title="Create units" size="lg" onPress={handleBulkGenerate} loading={saving} />
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  actions: { flexDirection: 'row', gap: spacing[5], marginBottom: spacing[4] },
  link: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], marginBottom: spacing[4] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textSecondary, fontSize: typography.sm },
  floorSection: { marginBottom: spacing[5] },
  floorLabel: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600', marginBottom: spacing[2] },
  floorUnits: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  unitTile: { minWidth: 72, paddingVertical: spacing[3], paddingHorizontal: spacing[3], borderRadius: 8, borderWidth: 1.5, backgroundColor: colors.surface },
  unitNumber: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '700' },
  unitType: { color: colors.textMuted, fontSize: typography.xs, marginTop: 2 },
  pair: { flexDirection: 'row', gap: spacing[3] },
  deleteRow: { paddingVertical: spacing[3], marginBottom: spacing[2] },
  deleteRowText: { color: colors.danger, fontSize: typography.sm, fontWeight: '600' },
  bulkPreview: { color: colors.textSecondary, fontSize: typography.sm, marginBottom: spacing[4] },
  emptyStateSubtext: { color: colors.textSecondary, fontSize: typography.sm },
});

export default PropertyUnitsScreen;
