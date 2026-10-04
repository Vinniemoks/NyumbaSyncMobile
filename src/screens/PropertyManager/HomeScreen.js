import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { maintenanceService } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const OPEN = ['reported', 'submitted', 'assigned', 'acknowledged', 'scheduled', 'in_progress'];

const PropertyManagerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      maintenanceService.getAll()
        .then(({ data }) => { if (live) { setRequests(Array.isArray(data) ? data : []); setError(false); } })
        .catch(() => { if (live) { setRequests([]); setError(true); } })
        .finally(() => live && setLoading(false));
      return () => { live = false; };
    }, [])
  );

  const open = requests.filter((r) => OPEN.includes(r.status));
  const done = requests.filter((r) => ['completed', 'closed'].includes(r.status));
  const cards = [
    { icon: 'construct', color: colors.warning, label: 'Open requests', value: open.length },
    { icon: 'checkmark-circle', color: colors.success, label: 'Completed', value: done.length },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}>
      <Text style={styles.sub}>Welcome back</Text>
      <Text style={styles.name}>{user?.firstName || 'Manager'}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="large" color={colors.info} />
      ) : (
        <>
          <View style={styles.grid}>
            {cards.map((c) => (
              <TouchableOpacity key={c.label} style={styles.card} onPress={() => navigation.navigate('Maintenance')} activeOpacity={0.8}>
                <View style={[styles.icon, { backgroundColor: `${c.color}1A` }]}><Ionicons name={c.icon} size={18} color={c.color} /></View>
                <Text style={styles.value}>{c.value}</Text>
                <Text style={styles.label}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Latest maintenance</Text>
          {requests.length === 0 ? (
            <Text style={styles.empty}>{error ? 'Could not load requests. Try again shortly.' : 'No maintenance requests yet.'}</Text>
          ) : (
            requests.slice(0, 5).map((r) => (
              <TouchableOpacity key={String(r.id || r._id)} style={styles.row} onPress={() => navigation.navigate('Maintenance')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{r.title || r.category || 'Request'}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {[r.property?.title, r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={styles.status}>{String(r.status).replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sub: { color: colors.textSecondary, fontSize: typography.sm },
  name: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800', marginBottom: spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  card: { width: '47.5%', padding: spacing[3], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  value: { color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '800' },
  label: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2, fontWeight: '600' },
  section: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '800', marginTop: spacing[4], marginBottom: spacing[2] },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], marginBottom: spacing[2], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  rowTitle: { color: colors.textPrimary, fontWeight: '700' },
  rowSub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  status: { color: colors.primary, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[6] },
});

export default PropertyManagerHomeScreen;
