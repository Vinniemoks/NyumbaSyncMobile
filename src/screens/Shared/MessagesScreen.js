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

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await messageService.getConversations(user?.id);
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Mock data
      setConversations([
        {
          id: 1,
          participant: {
            id: 2,
            name: 'Property Owner',
            role: 'landlord',
            avatar: null,
          },
          lastMessage: {
            text: 'The maintenance issue will be resolved by tomorrow',
            timestamp: '2024-11-18T14:30:00',
            senderId: 2,
          },
          unreadCount: 2,
          property: 'Riverside Apartments - A-101',
        },
        {
          id: 2,
          participant: {
            id: 3,
            name: 'Property Manager',
            role: 'manager',
            avatar: null,
          },
          lastMessage: {
            text: 'Your rent payment has been confirmed',
            timestamp: '2024-11-17T10:15:00',
            senderId: 3,
          },
          unreadCount: 0,
          property: 'Riverside Apartments',
        },
        {
          id: 3,
          participant: {
            id: 4,
            name: 'John Doe',
            role: 'tenant',
            avatar: null,
          },
          lastMessage: {
            text: 'Thank you for the quick response!',
            timestamp: '2024-11-16T16:45:00',
            senderId: 1,
          },
          unreadCount: 0,
          property: 'Westlands Villa - B-205',
        },
      ]);
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

  const getRoleColor = (role) => {
    const colors = {
      landlord: '#6366F1',
      manager: '#10B981',
      tenant: '#F59E0B',
      admin: '#EF4444',
    };
    return colors[role] || '#64748B';
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    return (
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.property?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => navigation.navigate('Chat', { conversation: item })}
    >
      <View style={styles.conversationContent}>
        <View style={[styles.avatar, { backgroundColor: getRoleColor(item.participant.role) + '20' }]}>
          <Text style={[styles.avatarText, { color: getRoleColor(item.participant.role) }]}>
            {item.participant.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>{item.participant.name}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.timestamp)}</Text>
          </View>
          
          {item.property && (
            <Text style={styles.propertyText}>{item.property}</Text>
          )}
          
          <View style={styles.lastMessageRow}>
            <Text 
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.lastMessageUnread
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.senderId === user?.id && 'You: '}
              {item.lastMessage.text}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#64748B" />
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'No results found' : 'Start a conversation with your landlord or tenant'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    margin: 20,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#F8FAFC',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  conversationCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationContent: {
    flexDirection: 'row',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  propertyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  lastMessageUnread: {
    color: '#E2E8F0',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default MessagesScreen;
