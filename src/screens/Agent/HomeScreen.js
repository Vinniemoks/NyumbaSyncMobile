import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const AgentHomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Agent'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Real Estate Agent</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={32} color="#3B82F6" />
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>32</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Closed Deals</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>KSh 450K</Text>
          <Text style={styles.statLabel}>Commission</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Listings')}>
            <Ionicons name="business-outline" size={32} color="#6366F1" />
            <Text style={styles.actionCardText}>My Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Clients')}>
            <Ionicons name="people-outline" size={32} color="#10B981" />
            <Text style={styles.actionCardText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle-outline" size={32} color="#F59E0B" />
            <Text style={styles.actionCardText}>Add Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar-outline" size={32} color="#8B5CF6" />
            <Text style={styles.actionCardText}>Viewings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Listings</Text>
        {[
          { id: 1, title: 'Westlands 3BR Apartment', price: 85000, status: 'available', views: 45 },
          { id: 2, title: 'Kilimani 2BR Penthouse', price: 120000, status: 'pending', views: 32 },
          { id: 3, title: 'Karen 4BR Villa', price: 250000, status: 'available', views: 67 },
        ].map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <Text style={styles.listingTitle}>{listing.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: listing.status === 'available' ? '#10B98120' : '#F59E0B20' }]}>
                <Text style={[styles.statusText, { color: listing.status === 'available' ? '#10B981' : '#F59E0B' }]}>
                  {listing.status}
                </Text>
              </View>
            </View>
            <View style={styles.listingDetails}>
              <View style={styles.listingDetailRow}>
                <Ionicons name="cash-outline" size={16} color="#10B981" />
                <Text style={[styles.listingDetailText, { color: '#10B981', fontWeight: '600' }]}>
                  KSh {listing.price.toLocaleString()}/month
                </Text>
              </View>
              <View style={styles.listingDetailRow}>
                <Ionicons name="eye-outline" size={16} color="#94A3B8" />
                <Text style={styles.listingDetailText}>{listing.views} views</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { backgroundColor: '#0F172A', padding: 20, alignItems: 'center' },
  greeting: { fontSize: 14, color: '#94A3B8' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginTop: 4 },
  roleBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#BFDBFE', textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20 },
  statCard: { width: '48%', backgroundColor: '#0F172A', borderRadius: 12, padding: 20, margin: '1%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: '#0F172A', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  actionCardText: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginTop: 8 },
  listingCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listingTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', flex: 1 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  listingDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  listingDetailRow: { flexDirection: 'row', alignItems: 'center' },
  listingDetailText: { fontSize: 13, color: '#94A3B8', marginLeft: 8 },
});

export default AgentHomeScreen;
