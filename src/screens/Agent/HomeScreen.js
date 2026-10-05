import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/api';
import { colors, spacing } from '../../config/theme';
import { Heading, Section, Rows, Row, today } from '../../components/ui';

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
      <Heading eyebrow={today()} title={user?.firstName || 'Home'} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="small" color={colors.textMuted} />
      ) : (
        <>
          <Rows>
            <Row label="Listings on the market" value={listings.length} onPress={() => navigation.navigate('Listings')} />
            <Row label="Your clients" value={clients} onPress={() => navigation.navigate('Clients')} />
          </Rows>

          <Section title="Latest listings" />
          {listings.length === 0 ? (
            <Text style={styles.empty}>{error ? 'Could not load listings. Try again shortly.' : 'No listings are on the market yet.'}</Text>
          ) : (
            <Rows>
              {listings.slice(0, 5).map((p) => (
                <Row
                  key={String(p._id || p.id)}
                  label={p.title || p.name}
                  note={where(p)}
                  value={rentOf(p) > 0 ? `KSh ${rentOf(p).toLocaleString()}` : undefined}
                />
              ))}
            </Rows>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { color: colors.textSecondary, marginTop: spacing[2] },
});

export default AgentHomeScreen;
