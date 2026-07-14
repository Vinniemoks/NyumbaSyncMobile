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
        <ActivityIndicator size="large" color={colors.info} />
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
            <Text style={styles.headerTitle}>{property?.title || propertyName || 'Units'}</Text>
            <Text style={styles.headerSubtitle}>{stats.total} units · {occupancyRate}% occupied</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAdd} disabled={saving}>
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
            <Text style={[styles.statValue, { color: STATUS_COLORS.available }]}>{stats.available}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.occupied }]}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.maintenance }]}>{stats.maintenance}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>

        {/* Legend + bulk add */}
        <View style={styles.legendRow}>
          {STATUSES.map((s) => (
            <View key={s.value} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: STATUS_COLORS[s.value] }]} />
              <Text style={styles.legendText}>{s.label}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.bulkButton} onPress={() => setModal('bulk')} disabled={saving}>
            <Ionicons name="flash" size={14} color={colors.gold} />
            <Text style={styles.bulkButtonText}>Bulk add</Text>
          </TouchableOpacity>
        </View>

        {/* Floor-by-floor unit map */}
        <View style={styles.unitMap}>
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
                      style={[
                        styles.unitTile,
                        { borderColor: statusColor, backgroundColor: statusColor + '22' },
                      ]}
                      onPress={() => openEdit(index)}
                      disabled={saving}
                    >
                      <Ionicons name={STATUS_ICONS[house.status] || 'home-outline'} size={14} color={statusColor} />
                      <Text style={styles.unitNumber}>{house.houseNumber || house.number}</Text>
                      {house.unitType ? (
                        <Text style={[styles.unitType, { color: statusColor }]}>
                          {UNIT_TYPE_LABELS[house.unitType]}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {houses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No units yet</Text>
            <Text style={styles.emptyStateSubtext}>Add units one by one or generate them in bulk</Text>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit unit modal */}
      <Modal
        visible={modal === 'add' || modal === 'edit'}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modal === 'edit' ? 'Edit Unit' : 'Add Unit'}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Unit Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., A1"
                placeholderTextColor="#64748B"
                value={formData.houseNumber}
                onChangeText={(text) => setFormData({ ...formData, houseNumber: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0 = ground"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.floor}
                    onChangeText={(text) => setFormData({ ...formData, floor: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Rent (KSh)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={defaultRent ? String(defaultRent) : 'Property rent'}
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={formData.rent}
                    onChangeText={(text) => setFormData({ ...formData, rent: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Unit Type</Text>
              <View style={styles.chipRow}>
                {UNIT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, formData.unitType === t.value && styles.chipSelected]}
                    onPress={() =>
                      setFormData({ ...formData, unitType: formData.unitType === t.value ? '' : t.value })
                    }
                  >
                    <Text style={[styles.chipText, formData.unitType === t.value && styles.chipTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.chipRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.chip,
                      formData.status === s.value && { backgroundColor: STATUS_COLORS[s.value] + '33' },
                    ]}
                    onPress={() => setFormData({ ...formData, status: s.value })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.status === s.value && { color: STATUS_COLORS[s.value], fontWeight: '600' },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modal === 'edit' && houses.length > 1 && (
                <TouchableOpacity style={styles.deleteRow} onPress={handleDeleteUnit} disabled={saving}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.deleteRowText}>Delete this unit</Text>
                </TouchableOpacity>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSubmitUnit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.gold} />
                  ) : (
                    <Text style={styles.saveButtonText}>{modal === 'edit' ? 'Save Changes' : 'Add Unit'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bulk add modal */}
      <Modal visible={modal === 'bulk'} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bulk Add Units</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>How many?</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#64748B"
                    value={bulkData.count}
                    onChangeText={(text) => setBulkData({ ...bulkData, count: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0 = ground"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={bulkData.floor}
                    onChangeText={(text) => setBulkData({ ...bulkData, floor: text })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Prefix</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., A"
                    placeholderTextColor="#64748B"
                    value={bulkData.prefix}
                    onChangeText={(text) => setBulkData({ ...bulkData, prefix: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Start at #</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#64748B"
                    value={bulkData.startNumber}
                    onChangeText={(text) => setBulkData({ ...bulkData, startNumber: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Unit Type</Text>
              <View style={styles.chipRow}>
                {UNIT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, bulkData.unitType === t.value && styles.chipSelected]}
                    onPress={() =>
                      setBulkData({ ...bulkData, unitType: bulkData.unitType === t.value ? '' : t.value })
                    }
                  >
                    <Text style={[styles.chipText, bulkData.unitType === t.value && styles.chipTextSelected]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Rent per unit (KSh)</Text>
              <TextInput
                style={styles.input}
                placeholder={defaultRent ? String(defaultRent) : 'Property rent'}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={bulkData.rent}
                onChangeText={(text) => setBulkData({ ...bulkData, rent: text })}
              />

              <Text style={styles.bulkPreview}>
                Will create {Math.min(Math.max(parseInt(bulkData.count) || 0, 1), 200)} vacant units:{' '}
                {`${bulkData.prefix.trim()}${parseInt(bulkData.startNumber) || 1}`} …{' '}
                {`${bulkData.prefix.trim()}${(parseInt(bulkData.startNumber) || 1) + Math.min(Math.max(parseInt(bulkData.count) || 0, 1), 200) - 1}`}
                . Run once per floor or unit type.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleBulkGenerate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.gold} />
                  ) : (
                    <Text style={styles.saveButtonText}>Generate Units</Text>
                  )}
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
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.surface,
  },
  backButton: {
    marginRight: spacing[3],
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing[5],
    paddingTop: spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: spacing[1],
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  bulkButtonText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing[1],
  },
  unitMap: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  floorSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  floorLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  floorUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitTile: {
    minWidth: 74,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  unitNumber: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  unitType: {
    fontSize: 10,
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptyStateSubtext: {
    fontSize: typography.sm,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
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
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800],
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[4],
  },
  chip: {
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  chipSelected: {
    backgroundColor: '#1E3A8A',
  },
  chipText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.blue[300],
    fontWeight: typography.fontWeight.semibold,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },
  deleteRowText: {
    color: colors.danger,
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing[1],
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing[4],
  },
  modalButton: {
    flex: 1,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.slate[800],
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200],
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
});

export default PropertyUnitsScreen;
