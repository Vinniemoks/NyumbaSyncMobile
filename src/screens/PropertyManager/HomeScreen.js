import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { maintenanceService } from '../../services/api';
import { colors, spacing } from '../../config/theme';
import { Heading, Figure, Section, Rows, Row, today } from '../../components/ui';

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
  const go = () => navigation.navigate('Maintenance');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
      <Heading eyebrow={today()} title={user?.firstName || 'Home'} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[10] }} size="small" color={colors.textMuted} />
      ) : (
        <>
          <Figure label="Open requests" value={String(open.length)} note={`${done.length} completed`} />

          <Section title="Latest maintenance" action={requests.length ? 'All requests' : undefined} onAction={go} />
          {requests.length === 0 ? (
            <Text style={styles.empty}>{error ? 'Could not load requests. Try again shortly.' : 'No maintenance requests yet.'}</Text>
          ) : (
            <Rows>
              {requests.slice(0, 5).map((r) => (
                <Row
                  key={String(r.id || r._id)}
                  label={r.title || r.category || 'Request'}
                  note={[r.property?.title, r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''].filter(Boolean).join(' · ')}
                  value={String(r.status).replace(/_/g, ' ')}
                  cap
                  onPress={go}
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

export default PropertyManagerHomeScreen;
