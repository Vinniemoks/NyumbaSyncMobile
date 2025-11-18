import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsService.getDashboardStats(user?.id);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data
      setStats({
        totalRevenue: 1250000,
        revenueChange: 12.5,
        totalExpenses: 350000,
        expensesChange: -5.2,
        netIncome: 900000,
        netIncomeChange: 18.3,
        occupancyRate: 92,
        occupancyChange: 3.5,
        totalProperties: 12,
        totalUnits: 45,
        occupiedUnits: 41,
        vacantUnits: 4,
        totalTenants: 41,
        activeTenants: 39,
        pendingPayments: 2,
        maintenanceRequests: 8,
        pendingMaintenance: 3,
        revenueByMonth: [
          { month: 'Jan', amount: 980000 },
          { month: 'Feb', amount: 1020000 },
          { month: 'Mar', amount: 1050000 },
          { month: 'Apr', amount: 1100000 },
          { month: 'May', amount: 1150000 },
          { month: 'Jun', amount: 1250000 },
        ],
        expensesByCategory: [
          { category: 'Maintenance', amount: 150000, percentage: 43 },
          { category: 'Utilities', amount: 100000, percentage: 29 },
          { category: 'Insurance', amount: 60000, percentage: 17 },
          { category: 'Other', amount: 40000, percentage: 11 },
        ],
        topProperties: [
          { name: 'Riverside Apartments', revenue: 420000, occupancy: 95 },
          { name: 'Westlands Villa', revenue: 380000, occupancy: 100 },
          { name: 'Kilimani Heights', revenue: 450000, occupancy: 88 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KSh ${(amount / 1000).toFixed(0)}K`;
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? '#10B981' : '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Reports</Text>
        <Text style={styles.headerSubtitle}>Performance Overview</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['month', 'quarter', 'year'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.revenueChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.revenueChange) }]}>
                  {formatPercentage(stats.revenueChange)}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-down" size={24} color="#EF4444" />
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.expensesChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.expensesChange) }]}>
                  {formatPercentage(stats.expensesChange)}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.totalExpenses)}</Text>
            <Text style={styles.metricLabel}>Total Expenses</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash" size={24} color="#6366F1" />
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.netIncomeChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.netIncomeChange) }]}>
                  {formatPercentage(stats.netIncomeChange)}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.netIncome)}</Text>
            <Text style={styles.metricLabel}>Net Income</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="home" size={24} color="#F59E0B" />
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.occupancyChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.occupancyChange) }]}>
                  {formatPercentage(stats.occupancyChange)}
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{stats.occupancyRate}%</Text>
            <Text style={styles.metricLabel}>Occupancy Rate</Text>
          </View>
        </View>
      </View>

      {/* Property Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalProperties}</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalUnits}</Text>
            <Text style={styles.statLabel}>Total Units</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.occupiedUnits}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.vacantUnits}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
        </View>
      </View>

      {/* Revenue Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <View style={styles.chartContainer}>
          {stats.revenueByMonth.map((item, index) => {
            const maxRevenue = Math.max(...stats.revenueByMonth.map(r => r.amount));
            const height = (item.amount / maxRevenue) * 120;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.bar, { height }]} />
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Expenses Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {stats.expensesByCategory.map((item, index) => (
          <View key={index} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseCategory}>{item.category}</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.percentage}%` }]} />
            </View>
            <Text style={styles.expensePercentage}>{item.percentage}%</Text>
          </View>
        ))}
      </View>

      {/* Top Properties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Properties</Text>
        {stats.topProperties.map((property, index) => (
          <View key={index} style={styles.propertyItem}>
            <View style={styles.propertyRank}>
              <Text style={styles.propertyRankText}>{index + 1}</Text>
            </View>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{property.name}</Text>
              <Text style={styles.propertyRevenue}>{formatCurrency(property.revenue)} revenue</Text>
            </View>
            <View style={styles.propertyOccupancy}>
              <Text style={styles.propertyOccupancyText}>{property.occupancy}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Reports</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
            <Text style={styles.actionButtonText}>Financial Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bar-chart" size={24} color="#10B981" />
            <Text style={styles.actionButtonText}>Occupancy Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people" size={24} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Tenant Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="construct" size={24} color="#EF4444" />
            <Text style={styles.actionButtonText}>Maintenance Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366F1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    margin: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: '#6366F1',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  expenseItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  expensePercentage: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  propertyRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  propertyRevenue: {
    fontSize: 13,
    color: '#94A3B8',
  },
  propertyOccupancy: {
    backgroundColor: '#10B981' + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  propertyOccupancyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionButton: {
    width: (width - 52) / 2,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 20,
    margin: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
