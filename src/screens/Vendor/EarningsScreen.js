import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                KSh {earnings.pending.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Paid</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
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
  container: { flex: 1, backgroundColor: '#020617' },
  summaryCard: { backgroundColor: '#0F172A', margin: 20, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  summaryTitle: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  summaryAmount: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '600' },
  periodSelector: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  periodButton: { flex: 1, backgroundColor: '#0F172A', borderRadius: 8, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  periodButtonActive: { backgroundColor: '#F59E0B' },
  periodText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  periodTextActive: { color: '#fff', fontWeight: '600' },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  transactionCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionInfo: { flex: 1 },
  transactionDescription: { fontSize: 14, fontWeight: '600', color: '#F8FAFC', marginBottom: 4 },
  transactionDate: { fontSize: 12, color: '#94A3B8' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: '600', color: '#10B981', marginBottom: 4 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
});

export default VendorEarningsScreen;
