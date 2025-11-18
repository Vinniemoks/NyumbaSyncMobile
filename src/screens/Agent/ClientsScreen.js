import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AgentClientsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+254700000000', status: 'active', properties: 2, joined: '2025-10-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+254711111111', status: 'lead', properties: 0, joined: '2025-11-01' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+254722222222', status: 'active', properties: 1, joined: '2025-09-20' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+254733333333', status: 'inactive', properties: 0, joined: '2025-08-10' },
  ]);

  const getStatusColor = (status) => {
    const colors = { active: '#10B981', lead: '#F59E0B', inactive: '#6B7280' };
    return colors[status] || '#6B7280';
  };

  const handleClientAction = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'active', 'lead', 'inactive'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
              {status === 'all' ? 'All Clients' : status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.clientsList}>
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={styles.clientCard}
            onPress={() => handleClientAction(client)}
          >
            <View style={styles.clientHeader}>
              <View style={[styles.clientAvatar, { backgroundColor: getStatusColor(client.status) }]}>
                <Text style={styles.clientAvatarText}>{client.name.charAt(0)}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientEmail}>{client.email}</Text>
                <Text style={styles.clientPhone}>{client.phone}</Text>
              </View>
              <View style={styles.clientRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                    {client.status}
                  </Text>
                </View>
                <Text style={styles.propertiesText}>{client.properties} properties</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showClientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Client Details</Text>
            {selectedClient && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedClient.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedClient.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedClient.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{selectedClient.status}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Properties:</Text>
                  <Text style={styles.detailValue}>{selectedClient.properties}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Joined:</Text>
                  <Text style={styles.detailValue}>{selectedClient.joined}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowClientModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 12, padding: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#F8FAFC' },
  filterContainer: { paddingHorizontal: 20, marginBottom: 20 },
  filterChip: { backgroundColor: '#0F172A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  filterChipActive: { backgroundColor: '#3B82F6' },
  filterChipText: { fontSize: 14, color: '#94A3B8' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  clientsList: { flex: 1, paddingHorizontal: 20 },
  clientCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  clientHeader: { flexDirection: 'row', alignItems: 'center' },
  clientAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  clientAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 2 },
  clientEmail: { fontSize: 13, color: '#94A3B8', marginBottom: 2 },
  clientPhone: { fontSize: 13, color: '#94A3B8' },
  clientRight: { alignItems: 'flex-end' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  propertiesText: { fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#0F172A', borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  detailLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#F8FAFC', fontWeight: '500' },
  closeButton: { backgroundColor: '#3B82F6', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 20 },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AgentClientsScreen;
