import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const VendorHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Vendor'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Service Provider</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
          <Text style={styles.statValue}>45</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color="#3B82F6" />
          <Text style={styles.statValue}>KSh 125K</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Jobs')}
          >
            <Ionicons name="list-outline" size={32} color="#6366F1" />
            <Text style={styles.actionCardText}>My Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Jobs')}
          >
            <Ionicons name="add-circle-outline" size={32} color="#10B981" />
            <Text style={styles.actionCardText}>New Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Ionicons name="wallet-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionCardText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="settings-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {[
          { id: 1, title: 'Plumbing Repair', property: 'Riverside Apartments', unit: 'A-101', status: 'in_progress', amount: 5000 },
          { id: 2, title: 'AC Maintenance', property: 'Westlands Tower', unit: 'B-205', status: 'pending', amount: 8000 },
          { id: 3, title: 'Electrical Work', property: 'Kilimani Plaza', unit: 'C-302', status: 'completed', amount: 12000 },
        ].map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: job.status === 'completed' ? '#10B98120' : job.status === 'in_progress' ? '#F59E0B20' : '#3B82F620' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: job.status === 'completed' ? '#10B981' : job.status === 'in_progress' ? '#F59E0B' : '#3B82F6' }
                ]}>
                  {job.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <Ionicons name="business-outline" size={16} color="#94A3B8" />
                <Text style={styles.jobDetailText}>{job.property}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="home-outline" size={16} color="#94A3B8" />
                <Text style={styles.jobDetailText}>Unit {job.unit}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="cash-outline" size={16} color="#10B981" />
                <Text style={[styles.jobDetailText, { color: '#10B981' }]}>KSh {job.amount.toLocaleString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#422006',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FED7AA',
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobDetails: {
    gap: 8,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
  },
});

export default VendorHomeScreen;
