import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

const rentOf = (p) => Number(p?.rent?.amount ?? p?.rent ?? 0) || 0;
const where = (p) => [p?.address?.area || p?.address?.street, p?.address?.city].filter(Boolean).join(', ');

const AgentHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [clients, setClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      (async () => {
        try {
          const res = await propertyService.getPublic({});
          const data = res?.data ?? res;
          const list = data?.data || data?.properties || (Array.isArray(data) ? data : []);
          if (live) { setListings(list); setError(false); }
        } catch (e) {
          if (live) { setListings([]); setError(true); }
        }
        try {
          const raw = await AsyncStorage.getItem(`nyumbasync_agent_clients_${user?.id || 'me'}`);
          if (live) setClients(raw ? JSON.parse(raw).length : 0);
        } catch (e) { /* none saved */ }
        if (live) setLoading(false);
      })();
      return () => { live = false; };
    }, [user?.id])
  );

  const cards = [
    { icon: 'business', color: colors.info, label: 'Listings on the market', value: listings.length, to: 'Listings' },
    { icon: 'people', color: colors.primary, label: 'Your clients', value: clients, to: 'Clients' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing[3], paddingBottom: spacing[8] }}>
      <Text style={styles.sub}>Welcome back</Text>
      <Text style={styles.name}>{user?.firstName || 'Agent'}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="large" color={colors.info} />
      ) : (
        <>
          <View style={styles.grid}>
            {cards.map((c) => (
              <TouchableOpacity key={c.label} style={styles.card} onPress={() => navigation.navigate(c.to)} activeOpacity={0.8}>
                <View style={[styles.icon, { backgroundColor: `${c.color}1A` }]}><Ionicons name={c.icon} size={18} color={c.color} /></View>
                <Text style={styles.value}>{c.value}</Text>
                <Text style={styles.label}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Latest listings</Text>
          {listings.length === 0 ? (
            <Text style={styles.empty}>{error ? 'Could not load listings. Try again shortly.' : 'No listings are on the market yet.'}</Text>
          ) : (
            listings.slice(0, 5).map((p) => (
              <View key={String(p._id || p.id)} style={styles.listing}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle} numberOfLines={1}>{p.title || p.name}</Text>
                  <Text style={styles.listingSub} numberOfLines={1}>{where(p)}</Text>
                </View>
                {rentOf(p) > 0 && <Text style={styles.price}>KSh {rentOf(p).toLocaleString()}</Text>}
              </View>
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
  listing: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], marginBottom: spacing[2], backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  listingTitle: { color: colors.textPrimary, fontWeight: '700' },
  listingSub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  price: { color: colors.primary, fontWeight: '800', fontSize: typography.sm },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing[6] },
});

export default AgentHomeScreen;
