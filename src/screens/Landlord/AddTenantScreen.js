import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { propertyService, landlordPortal } from '../../services/api';
import { normalizeKenyanPhone } from '../../utils/phone';
import { Field } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const DURATIONS = [6, 12, 24];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const money = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const errText = (e) => e?.response?.data?.error || e?.response?.data?.message || 'Please try again.';

const rentOf = (property, house) => Number(house?.rent ?? property?.rent?.amount ?? property?.rent ?? 0) || 0;

/** Add a tenant to one of my units and open their lease in one step. */
const AddTenantScreen = ({ navigation }) => {
  const [properties, setProperties] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null); // house object, or null for a whole property
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', rent: '', deposit: '', start: today(), months: 12, dueDay: '5' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await propertyService.getByLandlord();
      setProperties(data?.properties || []);
      setLoadError(false);
    } catch (e) {
      setProperties([]);
      setLoadError(true);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Selecting a property/unit fills in the rent and deposit it implies.
  const fillMoney = (p, h) => {
    const rent = rentOf(p, h);
    setF((x) => ({ ...x, rent: rent ? String(rent) : '', deposit: p?.deposit ? String(p.deposit) : rent ? String(rent) : '' }));
  };
  const pickProperty = (p) => {
    setProperty(p);
    const free = (p.houses || []).filter((h) => h.status !== 'occupied');
    const first = (p.houses || []).length ? (free.length === 1 ? free[0] : null) : null;
    setUnit(first);
    fillMoney(p, first);
  };
  const pickUnit = (h) => { setUnit(h); fillMoney(property, h); };

  const houses = property?.houses || [];
  const wholeProperty = property && houses.length === 0;
  const wholeTaken = wholeProperty && property.status === 'occupied';
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    if (!property) return Alert.alert('Choose a property', 'Pick the property the tenant is moving into.');
    if (houses.length && !unit) return Alert.alert('Choose a unit', 'Pick which unit is being let.');
    if (!f.firstName.trim() || !f.lastName.trim()) return Alert.alert('Tenant name', 'Enter their first and last name.');
    if (!EMAIL.test(f.email.trim())) return Alert.alert('Email', 'Enter a valid email address.');
    const phone = normalizeKenyanPhone(f.phone);
    if (!phone) return Alert.alert('Phone', 'Enter a valid Kenyan phone number.');
    const rent = Number(f.rent);
    if (!Number.isFinite(rent) || rent <= 0) return Alert.alert('Rent', 'Enter the monthly rent.');
    const deposit = f.deposit === '' ? rent : Number(f.deposit);
    if (!Number.isFinite(deposit) || deposit < 0) return Alert.alert('Deposit', 'Enter the deposit amount (0 or more).');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.start) || Number.isNaN(new Date(f.start).getTime())) return Alert.alert('Start date', 'Use the format YYYY-MM-DD.');
    const dueDay = Number(f.dueDay);
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) return Alert.alert('Rent due day', 'Use a day of the month from 1 to 28.');

    setBusy(true);
    try {
      const { data } = await landlordPortal.addTenant({
        propertyId: property._id || property.id,
        ...(unit ? { houseNumber: unit.houseNumber } : {}),
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim().toLowerCase(),
        phone,
        rentAmount: rent,
        depositAmount: deposit,
        startDate: f.start,
        durationMonths: f.months,
        rentDueDate: dueDay,
      });
      setResult(data);
    } catch (e) {
      Alert.alert('Could not add the tenant', errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (properties === null) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>;
  }

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.doneTitle}>{result.tenant.firstName} {result.tenant.lastName} is on the lease</Text>
        <Text style={styles.sub}>
          {property?.title}{result.lease.unit ? ` · ${result.lease.unit}` : ''} · {money(result.lease.rentAmount)} a month, due on the {result.lease.rentDueDate}th
        </Text>
        <Text style={styles.sub}>
          {new Date(result.lease.startDate).toLocaleDateString()} to {new Date(result.lease.endDate).toLocaleDateString()}
          {result.lease.status === 'pending' ? ' (starts later)' : ''}
        </Text>

        {result.newAccount ? (
          <View style={styles.pwBox}>
            <Text style={styles.label}>Temporary password (shown once)</Text>
            <Text style={styles.pw} selectable>{result.initialPassword}</Text>
            <Text style={styles.note}>
              {result.activationEmailSent
                ? `An activation email is on its way to ${result.tenant.email}. They must choose their own password when they first sign in.`
                : 'The activation email could not be sent, so give them this password yourself. They must choose their own when they first sign in.'}
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={async () => { await Clipboard.setStringAsync(result.initialPassword); Alert.alert('Copied', 'Share it with them securely.'); }}
            >
              <Text style={styles.btnText}>Copy password</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.note, { marginTop: spacing[4] }]}>They already had a NyumbaSync account, so they sign in as usual and will see this lease.</Text>
        )}

        <TouchableOpacity style={[styles.btn, styles.btnGhost, { marginTop: spacing[4] }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.btnText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Property</Text>
        {properties.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.sub}>{loadError ? 'Could not load your properties.' : 'You have no properties yet. Add a property first, then come back to add a tenant.'}</Text>
            <TouchableOpacity onPress={loadError ? load : () => navigation.navigate('Properties')} style={styles.link}>
              <Text style={styles.linkText}>{loadError ? 'Try again' : 'Go to Properties'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chips}>
            {properties.map((p) => (
              <Chip key={String(p._id || p.id)} label={p.title || p.name} active={property === p} onPress={() => pickProperty(p)} />
            ))}
          </View>
        )}

        {!!property && houses.length > 0 && (
          <>
            <Text style={styles.section}>Unit</Text>
            <View style={styles.chips}>
              {houses.map((h) => {
                const taken = h.status === 'occupied';
                return (
                  <Chip
                    key={String(h._id || h.houseNumber)}
                    label={`${h.houseNumber}${taken ? ' · let' : ''}`}
                    active={unit === h}
                    disabled={taken}
                    onPress={() => pickUnit(h)}
                  />
                );
              })}
            </View>
          </>
        )}
        {wholeTaken && <Text style={[styles.note, { color: colors.danger }]}>This property is already let.</Text>}

        {!!property && !wholeTaken && (houses.length === 0 || unit) && (
          <>
            <Text style={styles.section}>Tenant</Text>
            <View style={styles.row}>
              <Field style={{ flex: 1 }} label="First name" value={f.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
              <Field style={{ flex: 1 }} label="Last name" value={f.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
            </View>
            <Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" />

            <Text style={styles.section}>Lease</Text>
            <View style={styles.row}>
              <Field style={{ flex: 1 }} label="Monthly rent (KES)" value={f.rent} onChangeText={set('rent')} keyboardType="numeric" />
              <Field style={{ flex: 1 }} label="Deposit (KES)" value={f.deposit} onChangeText={set('deposit')} keyboardType="numeric" />
            </View>
            <View style={styles.row}>
              <Field style={{ flex: 1 }} label="Starts (YYYY-MM-DD)" value={f.start} onChangeText={set('start')} autoCapitalize="none" />
              <Field style={{ flex: 1 }} label="Rent due on day" value={f.dueDay} onChangeText={set('dueDay')} keyboardType="numeric" />
            </View>
            <Text style={styles.label}>Length</Text>
            <View style={styles.chips}>
              {DURATIONS.map((m) => (
                <Chip key={m} label={`${m} months`} active={f.months === m} onPress={() => setF((x) => ({ ...x, months: m }))} />
              ))}
            </View>

            <TouchableOpacity style={[styles.btn, { marginTop: spacing[5] }]} onPress={submit} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Add tenant and open lease</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Chip = ({ label, active, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.chip, active && styles.chipActive, disabled && { opacity: 0.45 }]}
    accessibilityRole="button"
    accessibilityState={{ selected: !!active, disabled: !!disabled }}
  >
    <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5], paddingBottom: spacing[10] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  section: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600', marginTop: spacing[5], marginBottom: spacing[2] },
  row: { flexDirection: 'row', gap: spacing[3] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: 9, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: typography.sm },
  label: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: typography.base },
  btn: { minHeight: 52, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.white, fontWeight: '700', fontSize: typography.base },
  sub: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing[2] },
  note: { color: colors.textSecondary, fontSize: typography.xs, marginVertical: spacing[3] },
  empty: { padding: spacing[3] },
  link: { alignSelf: 'center', padding: spacing[3] },
  linkText: { color: colors.leaf, fontWeight: '700' },
  doneTitle: { color: colors.textPrimary, fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginTop: spacing[4] },
  pwBox: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingVertical: spacing[4], marginTop: spacing[5] },
  pw: { color: colors.textPrimary, fontSize: typography.xl, fontWeight: '700', letterSpacing: 1, marginVertical: spacing[2] },
});

export default AddTenantScreen;
