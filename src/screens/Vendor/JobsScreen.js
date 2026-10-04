import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vendorPortal } from '../../services/api';
import { useVendorJobs } from '../../utils/vendorJobs';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

const statusColor = (g) =>
  g === 'completed' ? colors.success : g === 'in_progress' ? colors.warning : g === 'cancelled' ? colors.danger : colors.info;

const label = (s) => String(s || '').replace(/_/g, ' ');

const VendorJobsScreen = () => {
  const { jobs, loading, error, reload } = useVendorJobs();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cost, setCost] = useState('');
  const [completing, setCompleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const shown = jobs.filter((j) => filter === 'all' || j.group === filter);

  const act = async (fn, after) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      after && after();
    } catch (e) {
      Alert.alert('Could not update the job', e.response?.data?.error || e.response?.data?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const close = () => { setSelected(null); setCompleting(false); setCost(''); };

  const finish = () => {
    const n = Number(cost);
    if (!cost || !Number.isFinite(n) || n < 0) return Alert.alert('Enter the final cost', 'Use a number, e.g. the amount you are charging.');
    act(() => vendorPortal.complete(selected.id, { actualCost: n }), close);
  };

  const renderJob = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor(item.group)}1F` }]}>
          <Text style={[styles.badgeText, { color: statusColor(item.group) }]}>{label(item.status)}</Text>
        </View>
      </View>
      {!!item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
      <View style={styles.meta}>
        {!!item.property && <Meta icon="business-outline" text={`${item.property}${item.unit ? ` · ${item.unit}` : ''}`} />}
        {!!item.date && <Meta icon="calendar-outline" text={item.date} />}
        {item.amount > 0 && <Meta icon="cash-outline" text={`KSh ${item.amount.toLocaleString()}`} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[styles.chip, filter === f.key && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f.key && { color: colors.white }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="large" color={colors.info} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(j) => j.id}
          renderItem={renderJob}
          contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await reload(); setRefreshing(false); }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error ? 'Could not load your jobs. Pull down to try again.' : 'No jobs yet. Jobs assigned to you appear here.'}
            </Text>
          }
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.backdrop}>
          {selected && (
            <View style={styles.sheet}>
              <View style={styles.row}>
                <Text style={[styles.title, { fontSize: typography.lg }]} numberOfLines={2}>{selected.title}</Text>
                <TouchableOpacity onPress={close} accessibilityLabel="Close"><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
              </View>
              {!!selected.description && <Text style={[styles.desc, { marginVertical: spacing[3] }]}>{selected.description}</Text>}
              {!!selected.property && <Info k="Property" v={`${selected.property}${selected.unit ? ` · ${selected.unit}` : ''}`} />}
              {!!selected.tenant && <Info k="Tenant" v={selected.tenant} />}
              <Info k="Status" v={label(selected.status)} />
              {selected.amount > 0 && <Info k={selected.paid ? 'Final cost' : 'Estimate'} v={`KSh ${selected.amount.toLocaleString()}`} />}

              {!completing ? (
                <View style={{ marginTop: spacing[4], gap: spacing[2] }}>
                  {!!selected.tenantPhone && (
                    <Btn ghost icon="call-outline" text="Call tenant" onPress={() => Linking.openURL(`tel:${selected.tenantPhone}`)} />
                  )}
                  {selected.status === 'submitted' && (
                    <Btn text="Accept job" busy={busy} onPress={() => act(() => vendorPortal.accept(selected.id), close)} />
                  )}
                  {['acknowledged', 'scheduled'].includes(selected.status) && (
                    <Btn text="Start work" busy={busy} onPress={() => act(() => vendorPortal.start(selected.id), close)} />
                  )}
                  {selected.status === 'in_progress' && (
                    <Btn text="Mark as completed" busy={busy} onPress={() => setCompleting(true)} />
                  )}
                </View>
              ) : (
                <View style={{ marginTop: spacing[4] }}>
                  <Text style={styles.label}>Final cost (KES)</Text>
                  <TextInput style={styles.input} value={cost} onChangeText={setCost} keyboardType="numeric" />
                  <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[3] }}>
                    <Btn grow ghost text="Back" onPress={() => setCompleting(false)} />
                    <Btn grow text="Complete" busy={busy} onPress={finish} />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const Meta = ({ icon, text }) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={14} color={colors.textMuted} />
    <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
  </View>
);

const Info = ({ k, v }) => (
  <View style={styles.info}>
    <Text style={styles.infoK}>{k}</Text>
    <Text style={styles.infoV}>{v}</Text>
  </View>
);

const Btn = ({ text, onPress, busy, ghost, icon, grow }) => (
  <TouchableOpacity style={[styles.btn, ghost && styles.btnGhost, grow && { flex: 1 }]} onPress={onPress} disabled={busy}>
    {busy ? <ActivityIndicator color={colors.white} /> : (
      <>
        {!!icon && <Ionicons name={icon} size={18} color={ghost ? colors.primary : colors.white} style={{ marginRight: 6 }} />}
        <Text style={[styles.btnText, ghost && { color: colors.primary }]}>{text}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], padding: spacing[3] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontWeight: '700', fontSize: typography.sm },
  card: { padding: spacing[3], marginBottom: spacing[3], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2] },
  title: { flex: 1, color: colors.textPrimary, fontWeight: '800', fontSize: typography.base },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  desc: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing[1] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginTop: spacing[2] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  metaText: { color: colors.textSecondary, fontSize: typography.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[10], paddingHorizontal: spacing[5] },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,31,75,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[4], paddingBottom: spacing[6] },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  infoK: { color: colors.textSecondary, fontSize: typography.sm },
  infoV: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', textTransform: 'capitalize' },
  label: { color: colors.textSecondary, fontSize: typography.xs, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing[3], color: colors.textPrimary, fontSize: typography.base },
  btn: { flexDirection: 'row', minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing[3], paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.white, fontWeight: '800', fontSize: typography.base },
});

export default VendorJobsScreen;
