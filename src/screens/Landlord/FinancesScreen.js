import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../services/api';

const FinancesScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, year, all

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      const response = await analyticsService.getDashboardStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFinancialData();
  };

  const calculateMonthlyIncome = () => {
    if (!stats?.properties) return 0;
    // Sum up rent from all occupied properties
    return stats.properties.reduce((total, property) => {
      if (property.occupancyStatus === 'occupied') {
        return total + (property.rent || 0);
      }
      return total;
    }, 0);
  };

  const calculateOccupancyRate = () => {
    if (!stats?.properties || stats.properties.length === 0) return 0;
    const occupied = stats.properties.filter(p => p.occupancyStatus === 'occupied').length;
    return Math.round((occupied / stats.properties.length) * 100);
  };

  const getMonthName = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[new Date().getMonth()];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const monthlyIncome = calculateMonthlyIncome();
  const occupancyRate = calculateOccupancyRate();
  const totalProperties = stats?.properties?.length || 0;
  const occupiedProperties = stats?.properties?.filter(p => p.occupancyStatus === 'occupied').length || 0;
  const pendingMaintenance = stats?.maintenanceRequests?.filter(m => m.status === 'pending').length || 0;

  // Estimated expenses (maintenance costs)
  const estimatedExpenses = pendingMaintenance * 5000; // Rough estimate
  const netIncome = monthlyIncome - estimatedExpenses;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Overview</Text>
          <Text style={styles.headerSubtitle}>{getMonthName()} {new Date().getFullYear()}</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['month', 'year', 'all'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.periodTabActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  selectedPeriod === period && styles.periodTabTextActive,
                ]}
              >
                {period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <Text style={styles.cardLabel}>Total Income</Text>
            </View>
            <Text style={[styles.cardValue, { color: '#10B981' }]}>
              KSh {monthlyIncome.toLocaleString()}
            </Text>
            <Text style={styles.cardSubtext}>
              {occupiedProperties} occupied {occupiedProperties === 1 ? 'property' : 'properties'}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-down" size={24} color="#EF4444" />
              <Text style={styles.cardLabel}>Expenses</Text>
            </View>
            <Text style={[styles.cardValue, { color: '#EF4444' }]}>
              KSh {estimatedExpenses.toLocaleString()}
            </Text>
            <Text style={styles.cardSubtext}>
              {pendingMaintenance} pending {pendingMaintenance === 1 ? 'request' : 'requests'}
            </Text>
          </View>
        </View>

        {/* Net Income Card */}
        <View style={styles.netIncomeCard}>
          <View style={styles.netIncomeHeader}>
            <View>
              <Text style={styles.netIncomeLabel}>Net Income</Text>
              <Text style={styles.netIncomePeriod}>{getMonthName()} {new Date().getFullYear()}</Text>
            </View>
            <View style={styles.netIncomeIconContainer}>
              <Ionicons name="cash" size={32} color="#6366F1" />
            </View>
          </View>
          <Text style={styles.netIncomeValue}>
            KSh {netIncome.toLocaleString()}
          </Text>
          <View style={styles.netIncomeFooter}>
            <View style={styles.netIncomeMetric}>
              <Text style={styles.metricLabel}>Properties</Text>
              <Text style={styles.metricValue}>{totalProperties}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.netIncomeMetric}>
              <Text style={styles.metricLabel}>Occupancy</Text>
              <Text style={styles.metricValue}>{occupancyRate}%</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.netIncomeMetric}>
              <Text style={styles.metricLabel}>Avg/Property</Text>
              <Text style={styles.metricValue}>
                KSh {totalProperties > 0 ? Math.round(monthlyIncome / totalProperties).toLocaleString() : 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="home" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{totalProperties}</Text>
            <Text style={styles.statLabel}>Total Properties</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.statValue}>{occupiedProperties}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="close-circle" size={24} color="#64748B" />
            <Text style={styles.statValue}>{totalProperties - occupiedProperties}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="construct" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{pendingMaintenance}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
        </View>

        {/* Income Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#6366F1' }]} />
                <Text style={styles.breakdownLabel}>Rent Payments</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh {monthlyIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.breakdownLabel}>Security Deposits</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh 0</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.breakdownLabel}>Other Income</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh 0</Text>
            </View>
          </View>
        </View>

        {/* Expense Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.breakdownLabel}>Maintenance</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh {estimatedExpenses.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.breakdownLabel}>Utilities</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh 0</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: '#94A3B8' }]} />
                <Text style={styles.breakdownLabel}>Other Expenses</Text>
              </View>
              <Text style={styles.breakdownValue}>KSh 0</Text>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#6366F1" />
          <Text style={styles.infoText}>
            Financial data is calculated based on your property portfolio and current rental income.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: '#6366F1',
  },
  periodTabText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  periodTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  netIncomeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  netIncomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  netIncomeLabel: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '500',
  },
  netIncomePeriod: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  netIncomeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netIncomeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 16,
  },
  netIncomeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  netIncomeMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#1E293B',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#1E293B',
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#6366F110',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6366F130',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 12,
    lineHeight: 18,
  },
});

export default FinancesScreen;
