import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { leaseService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../config/theme';
import { Heading, Figure, Section, Rows, Row } from '../../components/ui';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// Maps a populated lease from GET /leases/tenant/:id to what this screen shows.
const toLease = (l) => {
  if (!l) return null;
  const prop = l.property || {};
  const ll = l.landlord || {};
  const end = l.endDate ? new Date(l.endDate) : null;
  return {
    property: prop.title || prop.name || 'Your home',
    address: [prop.address?.street, prop.address?.city].filter(Boolean).join(', '),
    landlord: {
      name: [ll.firstName, ll.lastName].filter(Boolean).join(' ') || '—',
      email: ll.email || '',
      phone: ll.phone || '',
    },
    startDate: fmtDate(l.startDate),
    endDate: fmtDate(l.endDate),
    currency: l.terms?.currency === 'KES' || !l.terms?.currency ? 'KSh' : l.terms.currency,
    monthlyRent: Number(l.terms?.rentAmount) || 0,
    securityDeposit: Number(l.terms?.depositAmount) || 0,
    status: l.status,
    daysUntilExpiry: end ? Math.ceil((end - new Date()) / 86400000) : null,
  };
};

const LeaseScreen = () => {
  const { user } = useAuth();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLease();
  }, []);

  const loadLease = async () => {
    setLoading(true);
    try {
      const { data } = await leaseService.getByTenant(user?.id);
      const list = Array.isArray(data) ? data : [];
      setLease(toLease(list.find((l) => l.status === 'active') || list[0] || null));
    } catch (error) {
      setLease(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  if (!lease) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No active lease</Text>
        <Text style={styles.emptySubtext}>Your landlord sets up your lease. It appears here once they do.</Text>
      </View>
    );
  }

  const daysRemaining = lease.daysUntilExpiry;
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 60;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
      <Heading eyebrow={lease.address || undefined} title={lease.property} />

      <Figure
        label="Monthly rent"
        value={`${lease.currency} ${lease.monthlyRent.toLocaleString()}`}
        note={isExpiringSoon ? `Lease ends in ${daysRemaining} days` : undefined}
      />

      <Rows>
        <Row label="Lease period" value={`${lease.startDate} – ${lease.endDate}`} />
        <Row label="Security deposit" value={`${lease.currency} ${lease.securityDeposit.toLocaleString()}`} />
        <Row label="Status" value={lease.status} cap />
      </Rows>

      <Section title="Landlord" />
      <Rows>
        <Row label={lease.landlord.name} note={[lease.landlord.email, lease.landlord.phone].filter(Boolean).join(' · ') || undefined} />
      </Rows>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: spacing[6], backgroundColor: colors.bg },
  emptyText: { fontSize: typography.xl, fontWeight: '700', color: colors.textPrimary },
  emptySubtext: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing[2] },
});

export default LeaseScreen;
