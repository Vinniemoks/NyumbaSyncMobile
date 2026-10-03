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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { analyticsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const { width } = Dimensions.get('window');

// Maps GET /analytics/dashboard onto what this screen shows. The API has no
// expense, per-property or previous-period data, so those stay empty rather
// than invented.
const toStats = (d) => {
  d = d || {};
  const props = d.properties || {};
  const tx = d.transactions || {};
  const maint = d.maintenance || {};
  const byStatus = (list, re) =>
    (list || []).filter((x) => re.test(String(x._id))).reduce((n, x) => ({ count: n.count + (x.count || 0), amount: n.amount + (x.amount || 0) }), { count: 0, amount: 0 });
  const paid = byStatus(tx.byStatus, /complete|success|paid/i);
  const pending = byStatus(tx.byStatus, /pend/i);
  const total = props.total || 0;
  const occupied = props.occupied || 0;
  const months = {};
  (tx.daily || []).forEach((day) => {
    const m = new Date(`${day._id}T00:00:00`).toLocaleString('en', { month: 'short' });
    months[m] = (months[m] || 0) + (day.amount || 0);
  });
  return {
    totalRevenue: paid.amount,
    totalExpenses: 0,
    netIncome: paid.amount,
    occupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    totalProperties: total,
    totalUnits: total,
    occupiedUnits: occupied,
    vacantUnits: Math.max(0, total - occupied),
    totalTenants: d.users?.total || 0,
    activeTenants: d.users?.total || 0,
    pendingPayments: pending.count,
    maintenanceRequests: maint.total || 0,
    pendingMaintenance: byStatus(maint.byStatus, /pend|open|new/i).count,
    revenueByMonth: Object.entries(months).map(([month, amount]) => ({ month, amount })),
    expensesByCategory: [],
    topProperties: [],
  };
};

const AnalyticsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  // Builds a branded PDF for the requested report type from the loaded stats
  // and opens the system share sheet (expo-print + expo-sharing).
  const exportReport = async (type) => {
    if (!stats) return;
    const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
    const row = (label, value) =>
      `<tr><td style="padding:6px 12px;border-bottom:1px solid #E2E8F0;">${label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:600;">${value}</td></tr>`;

    const sections = {
      financial: {
        title: 'Financial Report',
        rows: [
          row('Total Revenue', fmt(stats.totalRevenue)),
          row('Total Expenses', fmt(stats.totalExpenses)),
          row('Net Income', fmt(stats.netIncome)),
          row('Pending Payments', stats.pendingPayments ?? 0),
          ...(stats.revenueByMonth || []).map((m) => row(`Revenue — ${m.month}`, fmt(m.amount))),
          ...(stats.expensesByCategory || []).map((c) =>
            row(`Expenses — ${c.category}`, `${fmt(c.amount)} (${c.percentage}%)`)
          ),
        ],
      },
      occupancy: {
        title: 'Occupancy Report',
        rows: [
          row('Occupancy Rate', `${stats.occupancyRate ?? 0}%`),
          row('Total Properties', stats.totalProperties ?? 0),
          row('Total Units', stats.totalUnits ?? 0),
          row('Occupied Units', stats.occupiedUnits ?? 0),
          row('Vacant Units', stats.vacantUnits ?? 0),
        ],
      },
      tenant: {
        title: 'Tenant Report',
        rows: [
          row('Total Tenants', stats.totalTenants ?? 0),
          row('Active Tenants', stats.activeTenants ?? 0),
          row('Pending Payments', stats.pendingPayments ?? 0),
        ],
      },
      maintenance: {
        title: 'Maintenance Report',
        rows: [
          row('Open Requests', stats.maintenanceRequests ?? 0),
          row('Pending Assignment', stats.pendingMaintenance ?? 0),
        ],
      },
    };

    const report = sections[type];
    if (!report) return;

    try {
      const html = `
        <html><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0F172A;padding:24px;">
          <h1 style="color:#14532D;margin-bottom:4px;">NyumbaSync</h1>
          <h2 style="margin-top:0;">${report.title}</h2>
          <p style="color:#64748B;">Generated ${new Date().toLocaleString()} · Period: ${period}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">${report.rows.join('')}</table>
        </body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${report.title} — NyumbaSync`,
        });
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await analyticsService.getDashboardStats(period);
      setStats(toStats(data));
    } catch (error) {
      console.error('Error loading analytics:', error);
      setStats(null);
      setLoadError(
        error.response?.status === 403
          ? 'Reports are not available for this account.'
          : 'Could not load reports. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `KSh ${(Number(amount || 0) / 1000).toFixed(0)}K`;

  const formatPercentage = (value) => `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`;

  const getChangeColor = (value) => {
    return value >= 0 ? '#10B981' : '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.textPrimary, textAlign: 'center', marginHorizontal: spacing[5] }}>
          {loadError || 'No report data yet.'}
        </Text>
        <TouchableOpacity onPress={loadAnalytics} style={{ marginTop: spacing[4], padding: spacing[3] }}>
          <Text style={{ color: colors.leaf, fontWeight: '600' }}>Try again</Text>
        </TouchableOpacity>
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
              <Ionicons name="trending-up" size={24} color={colors.success} />
              {typeof stats.revenueChange === 'number' && (
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.revenueChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.revenueChange) }]}>
                  {formatPercentage(stats.revenueChange)}
                </Text>
              </View>
              )}
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-down" size={24} color={colors.danger} />
              {typeof stats.expensesChange === 'number' && (
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.expensesChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.expensesChange) }]}>
                  {formatPercentage(stats.expensesChange)}
                </Text>
              </View>
              )}
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.totalExpenses)}</Text>
            <Text style={styles.metricLabel}>Total Expenses</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash" size={24} color={colors.info} />
              {typeof stats.netIncomeChange === 'number' && (
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.netIncomeChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.netIncomeChange) }]}>
                  {formatPercentage(stats.netIncomeChange)}
                </Text>
              </View>
              )}
            </View>
            <Text style={styles.metricValue}>{formatCurrency(stats.netIncome)}</Text>
            <Text style={styles.metricLabel}>Net Income</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="home" size={24} color={colors.warning} />
              {typeof stats.occupancyChange === 'number' && (
              <View style={[styles.changeIndicator, { backgroundColor: getChangeColor(stats.occupancyChange) + '20' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(stats.occupancyChange) }]}>
                  {formatPercentage(stats.occupancyChange)}
                </Text>
              </View>
              )}
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
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.occupiedUnits}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.danger }]}>{stats.vacantUnits}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>
        </View>
      </View>

      {/* Revenue Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        {stats.revenueByMonth.length === 0 && <Text style={{ color: colors.textMuted }}>No revenue in this period.</Text>}
        <View style={styles.chartContainer}>
          {stats.revenueByMonth.map((item, index) => {
            const maxRevenue = Math.max(1, ...stats.revenueByMonth.map(r => r.amount));
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
        {stats.expensesByCategory.length === 0 && <Text style={{ color: colors.textMuted }}>No expense data yet.</Text>}
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
        {stats.topProperties.length === 0 && <Text style={{ color: colors.textMuted }}>No property data yet.</Text>}
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
          <TouchableOpacity style={styles.actionButton} onPress={() => exportReport('financial')}>
            <Ionicons name="document-text" size={24} color={colors.info} />
            <Text style={styles.actionButtonText}>Financial Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => exportReport('occupancy')}>
            <Ionicons name="bar-chart" size={24} color={colors.success} />
            <Text style={styles.actionButtonText}>Occupancy Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => exportReport('tenant')}>
            <Ionicons name="people" size={24} color={colors.warning} />
            <Text style={styles.actionButtonText}>Tenant Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => exportReport('maintenance')}>
            <Ionicons name="construct" size={24} color={colors.danger} />
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
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing[5],
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  periodSelector: {
    flexDirection: 'row',
    padding: spacing[5],
    paddingBottom: spacing[4],
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.darkBlue,
  },
  periodButtonText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    padding: spacing[5],
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    margin: spacing[1] + 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  changeIndicator: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.xl,
  },
  changeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
  },
  metricValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  metricLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
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
    backgroundColor: colors.darkBlue,
    borderRadius: borderRadius.DEFAULT,
    marginBottom: spacing[2],
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  expenseItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  expenseCategory: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  expenseAmount: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.slate[800],
    borderRadius: 3,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.darkBlue,
    borderRadius: 3,
  },
  expensePercentage: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  propertyRank: {
    width: 32,
    height: 32,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  propertyRankText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  propertyRevenue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  propertyOccupancy: {
    backgroundColor: '#10B981' + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.xl,
  },
  propertyOccupancyText: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionButton: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    margin: spacing[1] + 2,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginTop: spacing[2],
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
