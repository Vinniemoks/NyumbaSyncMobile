import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const VendorEarningsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const earnings = {
    total: 125000,
    pending: 35000,
    paid: 90000,
    thisMonth: 45000,
  };

  const transactions = [
    { id: 1, date: '2025-11-15', description: 'Plumbing Repair - Riverside A-101', amount: 5000, status: 'paid' },
    { id: 2, date: '2025-11-14', description: 'AC Maintenance - Westlands B-205', amount: 8000, status: 'pending' },
    { id: 3, date: '2025-11-10', description: 'Electrical Work - Kilimani C-302', amount: 12000, status: 'paid' },
    { id: 4, date: '2025-11-08', description: 'Painting - Riverside D-405', amount: 15000, status: 'paid' },
    { id: 5, date: '2025-11-05', description: 'Plumbing - Karen E-101', amount: 7000, status: 'paid' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Earnings</Text>
          <Text style={styles.summaryAmount}>KSh {earnings.total.toLocaleString()}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>
                KSh {earnings.pending.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Paid</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                KSh {earnings.paid.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    KSh {transaction.amount.toLocaleString()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: transaction.status === 'paid' ? '#10B98120' : '#F59E0B20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: transaction.status === 'paid' ? '#10B981' : '#F59E0B' }
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  summaryCard: { backgroundColor: colors.surface, margin: spacing[5], borderRadius: borderRadius.xl, padding: spacing[5], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  summaryTitle: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing[2] },
  summaryAmount: { fontSize: 32, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[4] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: typography.xs, color: colors.textSecondary, marginBottom: spacing[1] },
  summaryValue: { fontSize: typography.lg, fontWeight: typography.fontWeight.semibold },
  periodSelector: { flexDirection: 'row', paddingHorizontal: spacing[5], marginBottom: spacing[5] },
  periodButton: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing[3], marginHorizontal: 4, alignItems: 'center' },
  periodButtonActive: { backgroundColor: '#F59E0B' },
  periodText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  periodTextActive: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  section: { paddingHorizontal: spacing[5] },
  sectionTitle: { fontSize: typography.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[4] },
  transactionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionInfo: { flex: 1 },
  transactionDescription: { fontSize: typography.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[1] },
  transactionDate: { fontSize: typography.xs, color: colors.textSecondary },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.success, marginBottom: spacing[1] },
  statusBadge: { borderRadius: borderRadius.xl, paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
  statusText: { fontSize: 10, fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' },
});

export default VendorEarningsScreen;
