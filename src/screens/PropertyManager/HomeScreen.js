import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const PropertyManagerHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Property Manager'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Property Manager</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={32} color="#3B82F6" />
          <Text style={styles.statValue}>28</Text>
          <Text style={styles.statLabel}>Properties Managed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>156</Text>
          <Text style={styles.statLabel}>Total Tenants</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color="#10B981" />
          <Text style={styles.statValue}>KSh 2.4M</Text>
          <Text style={styles.statLabel}>Monthly Collections</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Requests</Text>
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
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="document-text-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[
          { icon: 'cash', color: '#10B981', title: 'Payment Received', subtitle: 'Unit A-101 - KSh 35,000', time: '2h ago' },
          { icon: 'construct', color: '#F59E0B', title: 'Maintenance Completed', subtitle: 'Plumbing repair - Unit B-205', time: '5h ago' },
          { icon: 'person-add', color: '#3B82F6', title: 'New Tenant Added', subtitle: 'John Doe - Unit C-302', time: '1d ago' },
        ].map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    backgroundColor: '#0F172A',
    padding: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#312E81',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A5B4FC',
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0F172A',
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
    color: '#F8FAFC',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#0F172A',
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
    color: '#E2E8F0',
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default PropertyManagerHomeScreen;
