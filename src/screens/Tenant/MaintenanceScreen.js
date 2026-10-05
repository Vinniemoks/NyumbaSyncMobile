import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { tenantPortal, leaseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../config/theme';
import Button from '../../components/Button';
import { Field, Options, Sheet } from '../../components/ui';

const MaintenanceScreen = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const toRequest = (r) => ({
    id: String(r.id || r._id),
    title: r.title || r.category || 'Request',
    description: r.description || '',
    category: r.category || r.issueType || 'other',
    priority: r.priority || 'medium',
    // The API's first status is "reported"; the screen calls it "pending".
    status: r.status === 'reported' ? 'pending' : r.status || 'pending',
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, leases] = await Promise.all([tenantPortal.maintenance(), leaseService.getByTenant(user?.id)]);
      setRequests((Array.isArray(list.data) ? list.data : []).map(toRequest));
      // The tenant's property is the one on their active lease.
      const active = (Array.isArray(leases.data) ? leases.data : []).find((l) => l.status === 'active');
      const prop = active?.property;
      setPropertyId(prop?._id || prop?.id || (typeof prop === 'string' ? prop : null));
      setLoadError(null);
    } catch (e) {
      setLoadError('Could not load your requests. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!propertyId) {
      Alert.alert('No property linked', 'Ask your landlord to add you to your unit before sending a request.');
      return;
    }
    setSubmitting(true);
    try {
      // The backend keeps no separate title, so it travels at the start of the description.
      const body = { ...formData, description: `${formData.title.trim()} — ${formData.description.trim()}`, propertyId };
      const { data } = await tenantPortal.createMaintenance(body);
      setRequests((prev) => [toRequest({ ...formData, ...data, description: body.description, createdAt: data.createdAt || new Date() }), ...prev]);
      setFormData({ title: '', description: '', category: 'plumbing', priority: 'medium' });
      setShowForm(false);
    } catch (e) {
      Alert.alert('Could not send request', e.response?.data?.error || e.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusTone = (st) => (st === 'completed' ? colors.success : st === 'pending' ? colors.warning : colors.textSecondary);
  const priorityTone = (p) => (p === 'high' || p === 'urgent' ? colors.danger : colors.textMuted);
  const open = requests.filter((r) => r.status !== 'completed').length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
        <View style={styles.top}>
          <Text style={styles.muted}>{requests.length ? `${open} open · ${requests.length - open} done` : ' '}</Text>
          <TouchableOpacity onPress={() => setShowForm(true)} hitSlop={8}><Text style={styles.link}>New request</Text></TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={{ marginTop: spacing[6] }} color={colors.textMuted} />}
        {!loading && loadError && (
          <TouchableOpacity onPress={load}>
            <Text style={styles.muted}>{loadError} Tap to retry.</Text>
          </TouchableOpacity>
        )}
        {!loading && !loadError && requests.length === 0 && (
          <Text style={styles.muted}>Nothing reported yet. Use “New request” if something needs fixing.</Text>
        )}

        {requests.map((r) => (
          <View key={r.id} style={styles.req}>
            <View style={styles.reqTop}>
              <Text style={styles.reqTitle} numberOfLines={1}>{r.title.charAt(0).toUpperCase() + r.title.slice(1)}</Text>
              <Text style={[styles.reqSmall, { color: priorityTone(r.priority) }]}>{r.priority}</Text>
            </View>
            {!!r.description && <Text style={styles.reqDesc}>{r.description}</Text>}
            <View style={styles.reqBottom}>
              <Text style={styles.reqMeta}>{[r.category, r.date].filter(Boolean).join(' · ')}</Text>
              <Text style={[styles.reqSmall, { color: statusTone(r.status) }]}>{r.status.replace('_', ' ')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Sheet visible={showForm} title="New request" onClose={() => setShowForm(false)}>
        <Field label="What needs fixing" value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} />
        <Options
          label="Category"
          options={[{ value: 'plumbing', label: 'Plumbing' }, { value: 'electrical', label: 'Electrical' }, { value: 'hvac', label: 'HVAC' }, { value: 'appliance', label: 'Appliance' }, { value: 'other', label: 'Other' }]}
          value={formData.category}
          onChange={(category) => setFormData({ ...formData, category })}
        />
        <Options
          label="Priority"
          options={['low', 'medium', 'high', 'urgent']}
          value={formData.priority}
          onChange={(priority) => setFormData({ ...formData, priority })}
        />
        <Field
          label="Details"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
        />
        <Button title="Send request" size="lg" onPress={handleSubmit} loading={submitting} />
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[4] },
  container: { flex: 1, backgroundColor: colors.bg },
  link: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
  muted: { color: colors.textSecondary, fontSize: typography.sm, paddingVertical: spacing[3] },
  req: { paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  reqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  reqTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  reqSmall: { fontSize: typography.sm, fontWeight: '600', marginLeft: spacing[3], textTransform: 'capitalize' },
  reqDesc: { color: colors.textPrimary, fontSize: typography.sm, marginTop: 4 },
  reqBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing[2] },
  reqMeta: { color: colors.textMuted, fontSize: typography.sm, textTransform: 'capitalize' },
});

export default MaintenanceScreen;
