import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', screen: 'EditProfile', action: null },
    { icon: 'lock-closed-outline', title: 'Change Password', screen: 'ChangePassword', action: null },
    { icon: 'notifications-outline', title: 'Notifications', screen: 'Notifications', action: () => navigation.navigate('Notifications') },
    { icon: 'document-text-outline', title: 'Documents', screen: 'Documents', action: () => navigation.navigate('Documents') },
    { icon: 'help-circle-outline', title: 'Help & Support', screen: 'Support', action: null },
    { icon: 'information-circle-outline', title: 'About', screen: 'About', action: null },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0) || 'T'}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.bg, // slate-950
  },
  profileHeader: {
    backgroundColor: colors.surface, // slate-900
    alignItems: 'center',
    padding: spacing[8],
    marginBottom: spacing[5],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkBlue, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: '#fff',
  },
  userName: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
  },
  menuSection: {
    backgroundColor: colors.surface, // slate-900
    marginBottom: spacing[5],
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B', // slate-800
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: typography.base,
    color: colors.slate[200], // slate-200
    marginLeft: spacing[4],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface, // slate-900
    padding: spacing[4],
    marginHorizontal: 20,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.danger,
    marginLeft: spacing[2],
  },
  version: {
    textAlign: 'center',
    fontSize: typography.xs,
    color: colors.textMuted, // slate-500
    marginBottom: spacing[10],
  },
});

export default ProfileScreen;
