import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

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
              <Ionicons name={item.icon} size={24} color={colors.blue[400]} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profileHeader: { backgroundColor: colors.surface, alignItems: 'center', padding: spacing[8], marginBottom: spacing[5] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.darkBlue,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  avatarText: { fontSize: 32, fontWeight: typography.fontWeight.bold, color: '#fff' },
  userName: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] },
  userEmail: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing[2] },
  roleBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: spacing[3], paddingVertical: spacing[1] + 2, borderRadius: borderRadius.xl },
  roleText: { fontSize: typography.xs, fontWeight: typography.fontWeight.semibold, color: '#BFDBFE', textTransform: 'uppercase' },
  menuSection: { backgroundColor: colors.surface, marginBottom: spacing[5] },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: typography.base, color: colors.slate[200], marginLeft: spacing[4] },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: spacing[4], marginHorizontal: 20, borderRadius: borderRadius.xl, marginBottom: spacing[5], borderWidth: 1, borderColor: colors.danger },
  logoutText: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.danger, marginLeft: spacing[2] },
  version: { textAlign: 'center', fontSize: typography.xs, color: colors.textMuted, marginBottom: spacing[10] },
});

export default AgentProfileScreen;
