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

const AdminUsersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'landlord', status: 'active', properties: 5, joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'tenant', status: 'active', properties: 0, joined: '2024-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'property_manager', status: 'active', properties: 12, joined: '2024-03-10' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'agent', status: 'active', properties: 8, joined: '2024-04-05' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'vendor', status: 'active', properties: 0, joined: '2024-05-12' },
  ]);

  const getRoleColor = (role) => {
    const colors = {
      landlord: '#6366F1',
      tenant: '#10B981',
      property_manager: '#8B5CF6',
      agent: '#F59E0B',
      vendor: '#3B82F6',
      admin: '#EF4444',
    };
    return colors[role] || '#6B7280';
  };

  const getRoleLabel = (role) => {
    return role.replace('_', ' ').toUpperCase();
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    if (action === 'view') {
      setShowUserModal(true);
    } else if (action === 'suspend') {
      Alert.alert('Suspend User', `Are you sure you want to suspend ${user.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Suspend', style: 'destructive', onPress: () => {
          setUsers(users.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u));
          Alert.alert('Success', 'User suspended successfully');
        }},
      ]);
    } else if (action === 'delete') {
      Alert.alert('Delete User', `Are you sure you want to delete ${user.name}? This action cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setUsers(users.filter(u => u.id !== user.id));
          Alert.alert('Success', 'User deleted successfully');
        }},
      ]);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'landlord', 'tenant', 'property_manager', 'agent', 'vendor'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
            onPress={() => setFilterRole(role)}
          >
            <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>
              {role === 'all' ? 'All Users' : getRoleLabel(role)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.usersList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={[styles.userAvatar, { backgroundColor: getRoleColor(user.role) }]}>
                <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                      {getRoleLabel(user.role)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: user.status === 'active' ? '#10B98120' : '#EF444420' }]}>
                    <Text style={[styles.statusText, { color: user.status === 'active' ? '#10B981' : '#EF4444' }]}>
                      {user.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUserAction(user, 'view')}
              >
                <Ionicons name="eye-outline" size={18} color="#6366F1" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUserAction(user, 'suspend')}
              >
                <Ionicons name="ban-outline" size={18} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUserAction(user, 'delete')}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Details</Text>
            {selectedUser && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedUser.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role:</Text>
                  <Text style={styles.detailValue}>{getRoleLabel(selectedUser.role)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{selectedUser.status}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Properties:</Text>
                  <Text style={styles.detailValue}>{selectedUser.properties}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Joined:</Text>
                  <Text style={styles.detailValue}>{selectedUser.joined}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUserModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#F8FAFC',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  detailLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUsersScreen;
