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
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

  const handleAddClient = () => {
    const name = newClient.name.trim();
    if (!name) {
      Alert.alert('Missing name', 'Please enter the client’s name.');
      return;
    }
    if (!newClient.email.trim() && !newClient.phone.trim()) {
      Alert.alert('Missing contact', 'Add an email or phone number so you can reach this client.');
      return;
    }
    setClients((prev) => [
      {
        id: Date.now(),
        name,
        email: newClient.email.trim(),
        phone: newClient.phone.trim(),
        status: 'lead',
        properties: 0,
        joined: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setNewClient({ name: '', email: '', phone: '' });
    setShowAddModal(false);
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
          <Ionicons name="search" size={20} color={colors.textSecondary} />
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

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Client</Text>
            <Text style={styles.detailLabel}>Name *</Text>
            <TextInput
              style={styles.addInput}
              placeholder="Full name"
              placeholderTextColor="#64748B"
              value={newClient.name}
              onChangeText={(name) => setNewClient((c) => ({ ...c, name }))}
            />
            <Text style={styles.detailLabel}>Email</Text>
            <TextInput
              style={styles.addInput}
              placeholder="client@example.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newClient.email}
              onChangeText={(email) => setNewClient((c) => ({ ...c, email }))}
            />
            <Text style={styles.detailLabel}>Phone</Text>
            <TextInput
              style={styles.addInput}
              placeholder="+2547..."
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={newClient.phone}
              onChangeText={(phone) => setNewClient((c) => ({ ...c, phone }))}
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleAddClient}>
              <Text style={styles.closeButtonText}>Save Client</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'transparent' }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing[5] },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[3] },
  searchInput: { flex: 1, marginLeft: spacing[2], fontSize: typography.base, color: colors.textPrimary },
  filterContainer: { paddingHorizontal: spacing[5], marginBottom: spacing[5] },
  filterChip: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: spacing[4], paddingVertical: spacing[2], marginRight: spacing[2] },
  filterChipActive: { backgroundColor: colors.darkBlue,
  },
  filterChipText: { fontSize: typography.sm, color: colors.textSecondary },
  filterChipTextActive: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  clientsList: { flex: 1, paddingHorizontal: spacing[5] },
  clientCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  clientHeader: { flexDirection: 'row', alignItems: 'center' },
  clientAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  clientAvatarText: { fontSize: typography.xl, fontWeight: typography.fontWeight.bold, color: '#fff' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 2 },
  clientEmail: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  clientPhone: { fontSize: 13, color: colors.textSecondary },
  clientRight: { alignItems: 'flex-end' },
  statusBadge: { borderRadius: borderRadius.xl, paddingHorizontal: spacing[2], paddingVertical: spacing[1], marginBottom: spacing[1] },
  statusText: { fontSize: 10, fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' },
  propertiesText: { fontSize: typography.xs, color: colors.textMuted },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.darkBlue,
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing[6], width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[5] },
  detailRow: { paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  detailLabel: { fontSize: typography.xs, color: colors.textSecondary, marginBottom: spacing[1] },
  detailValue: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.medium },
  addInput: { backgroundColor: colors.bg, borderRadius: borderRadius.lg, padding: spacing[3], color: colors.textPrimary, fontSize: typography.base, marginBottom: spacing[3], borderWidth: 1, borderColor: '#1E293B' },
  closeButton: { backgroundColor: colors.darkBlue,
    borderRadius: borderRadius.lg, padding: spacing[4], alignItems: 'center', marginTop: spacing[5] },
  closeButtonText: { color: colors.gold,
    fontSize: typography.base, fontWeight: typography.fontWeight.semibold },
});

export default AgentClientsScreen;
