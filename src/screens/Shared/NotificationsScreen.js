import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationService.getByUser();
      const raw = Array.isArray(data) ? data : data?.data || data?.notifications || [];
      setNotifications(
        raw.map((n) => ({
          ...n,
          id: String(n._id || n.id),
          title: n.title || '',
          message: n.message || n.body || '',
          read: !!(n.read ?? n.isRead),
          timestamp: n.timestamp || n.createdAt,
        }))
      );
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.delete(notificationId);
              setNotifications(notifications.filter(n => n.id !== notificationId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAll(user?.id);
              setNotifications([]);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sub}>{unreadCount > 0 ? `${unreadCount} unread` : 'Nothing new'}</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={8}>
            <Text style={styles.action}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} hitSlop={8} style={{ marginLeft: spacing[4] }}>
            <Text style={[styles.action, { color: colors.danger }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        {['all', 'unread', 'read'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.tab, filter === f && styles.tabOn]}>
            <Text style={[styles.tabText, filter === f && styles.tabTextOn]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
        contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
      >
        {filteredNotifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={styles.row}
            activeOpacity={0.6}
            onPress={() => { if (!n.read) handleMarkAsRead(n.id); }}
            onLongPress={() => handleDeleteNotification(n.id)}
          >
            <View style={[styles.dot, !n.read && { backgroundColor: colors.leaf }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, !n.read && { fontWeight: '700' }]}>{n.title}</Text>
              {!!n.message && <Text style={styles.rowMsg}>{n.message}</Text>}
              <Text style={styles.rowTime}>{formatTimestamp(n.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredNotifications.length === 0 && (
          <Text style={styles.empty}>
            {filter === 'unread' ? 'You are all caught up.' : filter === 'read' ? 'No read notifications.' : 'No notifications yet.'}
          </Text>
        )}
        {filteredNotifications.length > 0 && <Text style={styles.hint}>Press and hold one to delete it.</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[1] },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  sub: { color: colors.textSecondary, fontSize: typography.sm },
  action: { color: colors.leaf, fontSize: typography.sm, fontWeight: '600', paddingBottom: 4 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing[5] },
  tab: { paddingVertical: spacing[3], marginRight: spacing[5], borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: typography.sm, fontWeight: '600' },
  tabTextOn: { color: colors.textPrimary },
  row: { flexDirection: 'row', paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing[3], backgroundColor: 'transparent' },
  rowTitle: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  rowMsg: { color: colors.textSecondary, fontSize: typography.sm, marginTop: 2 },
  rowTime: { color: colors.textMuted, fontSize: typography.xs, marginTop: 4 },
  empty: { color: colors.textSecondary, paddingVertical: spacing[5] },
  hint: { color: colors.textMuted, fontSize: typography.xs, marginTop: spacing[4] },
});

export default NotificationsScreen;
