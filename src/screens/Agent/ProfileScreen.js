import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const AgentProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', action: null },
    { icon: 'briefcase-outline', title: 'My Listings', action: null },
    { icon: 'people-outline', title: 'My Clients', action: null },
    { icon: 'wallet-outline', title: 'Commissions', action: null },
    { icon: 'notifications-outline', title: 'Notifications', action: () => navigation.navigate('Notifications') },
    { icon: 'help-circle-outline', title: 'Help & Support', action: null },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || 'A'}</Text>
        </View>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Real Estate Agent</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.action) {
                item.action();
              } else {
                Alert.alert('Coming Soon', `${item.title} feature coming soon!`);
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={24} color="#818CF8" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  profileHeader: { backgroundColor: '#0F172A', alignItems: 'center', padding: 32, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  roleBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#BFDBFE', textTransform: 'uppercase' },
  menuSection: { backgroundColor: '#0F172A', marginBottom: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 16, color: '#E2E8F0', marginLeft: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', padding: 16, marginHorizontal: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
  version: { textAlign: 'center', fontSize: 12, color: '#64748B', marginBottom: 40 },
});

export default AgentProfileScreen;
