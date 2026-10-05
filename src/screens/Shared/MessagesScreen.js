import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../config/theme';
import { Heading } from '../../components/ui';

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data } = await messageService.getConversations(user?.id);
      const list = (Array.isArray(data) ? data : []).map((c) => {
        const other = (c.participants || []).find((x) => String(x._id || x.id || x) !== String(user?.id)) || {};
        return {
          id: String(c.id || c._id),
          participant: {
            id: String(other._id || other.id || ''),
            name: [other.firstName, other.lastName].filter(Boolean).join(' ') || other.email || 'Conversation',
            role: other.role || '',
          },
          lastMessage: { text: c.lastMessage || '', timestamp: c.lastMessageAt, senderId: '' },
          unreadCount: Number(c.unreadCount) || 0,
        };
      });
      setConversations(list);
    } catch (error) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    return (
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.property?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderConversationItem = ({ item }) => {
    const unread = item.unreadCount > 0;
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={() => navigation.navigate('Chat', { conversation: item })}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, unread && styles.bold]} numberOfLines={1}>{item.participant.name}</Text>
          <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
            {item.lastMessage.senderId === user?.id && 'You: '}
            {item.lastMessage.text || 'No messages yet'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: spacing[3] }}>
          {!!item.lastMessage.timestamp && <Text style={styles.time}>{formatTimestamp(item.lastMessage.timestamp)}</Text>}
          {unread && <Text style={styles.unread}>{item.unreadCount} new</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing[5] }}>
        <Heading title="Messages" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}
        ListEmptyComponent={
          <Text style={styles.empty}>{searchQuery ? 'No results.' : 'No conversations yet.'}</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  searchInput: {
    paddingVertical: spacing[3], fontSize: typography.base, color: colors.textPrimary,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, marginBottom: spacing[2],
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  name: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  bold: { fontWeight: '700' },
  preview: { color: colors.textMuted, fontSize: typography.sm, marginTop: 2 },
  previewUnread: { color: colors.textPrimary },
  time: { color: colors.textMuted, fontSize: typography.xs },
  unread: { color: colors.leaf, fontSize: typography.xs, fontWeight: '700', marginTop: 4 },
  empty: { color: colors.textSecondary, paddingVertical: spacing[5] },
});

export default MessagesScreen;
