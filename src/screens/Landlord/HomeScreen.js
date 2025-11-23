import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const LandlordHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await analyticsService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F8FAFC" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Landlord'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color="#10B981" />
          <Text style={styles.statValue}>
            KSh {stats?.properties?.potentialRevenue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.statLabel}>Monthly Income</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="home-outline" size={32} color="#3B82F6" />
          <Text style={styles.statValue}>{stats?.properties?.total || 0}</Text>
          <Text style={styles.statLabel}>Properties</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats?.users?.total || 0}</Text>
          <Text style={styles.statLabel}>Tenants</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.maintenance?.total || 0}</Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Ionicons name="business-outline" size={32} color="#6366F1" />
            <Text style={styles.actionCardText}>Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Tenants')}
          >
            <Ionicons name="people-outline" size={32} color="#10B981" />
            <Text style={styles.actionCardText}>Tenants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Maintenance')}
          >
            <Ionicons name="construct-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionCardText}>Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Ionicons name="stats-chart-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0F172A', // slate-900
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 20,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginTop: 8,
  },
});

export default LandlordHomeScreen;
