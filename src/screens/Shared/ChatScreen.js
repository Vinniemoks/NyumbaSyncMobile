import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { messageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import websocketService from '../../services/websocket';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const ChatScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    initializeChat();

    // Set header title
    navigation.setOptions({
      title: conversation.participant.name,
    });

    return () => cleanup();
  }, []);

  const initializeChat = async () => {
    try {
      // Connect WebSocket
      if (!websocketService.isConnected()) {
        await websocketService.connect();
      }
      setConnected(true);

      // Join conversation room
      websocketService.joinConversation(conversation.id);

      // Subscribe to real-time events
      websocketService.on('message:received', handleMessageReceived);
      websocketService.on('user:typing', handleUserTyping);
      websocketService.on('connection:lost', handleConnectionLost);
      websocketService.on('connection:success', handleConnectionSuccess);

      // Load initial messages
      await loadMessages();
      markAsRead();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setLoading(false);
    }
  };

  const cleanup = () => {
    websocketService.leaveConversation(conversation.id);
    websocketService.off('message:received', handleMessageReceived);
    websocketService.off('user:typing', handleUserTyping);
    websocketService.off('connection:lost', handleConnectionLost);
    websocketService.off('connection:success', handleConnectionSuccess);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleMessageReceived = (data) => {
    if (data.conversationId === conversation.id) {
      const newMessage = {
        id: data.message.id || Date.now(),
        text: data.message.text,
        senderId: data.sender.id,
        timestamp: data.timestamp,
        read: false,
      };
      setMessages(prev => [...prev, newMessage]);

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleUserTyping = (data) => {
    if (data.userId !== user?.id) {
      setOtherUserTyping(data.isTyping);

      if (data.isTyping) {
        // Auto-hide typing indicator after 3s
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    }
  };

  const handleConnectionLost = () => {
    setConnected(false);
  };

  const handleConnectionSuccess = () => {
    setConnected(true);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(conversation.id);
      if (response.data.success) {
        setMessages(response.data.messages.reverse());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Mock data
      setMessages([
        {
          id: 1,
          text: 'Hi, I have a maintenance issue in my unit',
          senderId: 1,
          timestamp: '2024-11-18T10:00:00',
          read: true,
        },
        {
          id: 2,
          text: 'Hello! What seems to be the problem?',
          senderId: 2,
          timestamp: '2024-11-18T10:05:00',
          read: true,
        },
        {
          id: 3,
          text: 'The kitchen faucet is leaking',
          senderId: 1,
          timestamp: '2024-11-18T10:07:00',
          read: true,
        },
        {
          id: 4,
          text: 'I\'ll send a plumber to check it out. Are you available tomorrow morning?',
          senderId: 2,
          timestamp: '2024-11-18T10:10:00',
          read: true,
        },
        {
          id: 5,
          text: 'Yes, I\'ll be home after 9 AM',
          senderId: 1,
          timestamp: '2024-11-18T10:12:00',
          read: true,
        },
        {
          id: 6,
          text: 'Perfect! The plumber will arrive around 10 AM',
          senderId: 2,
          timestamp: '2024-11-18T14:25:00',
          read: true,
        },
        {
          id: 7,
          text: 'The maintenance issue will be resolved by tomorrow',
          senderId: 2,
          timestamp: '2024-11-18T14:30:00',
          read: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messageService.markAsRead(conversation.id, user?.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !connected) return;

    const messageText = inputText.trim();
    setInputText('');

    // Stop typing indicator
    setIsTyping(false);
    websocketService.sendTyping(conversation.id, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send via WebSocket for real-time delivery
    websocketService.sendMessage(conversation.id, {
      text: messageText,
      timestamp: new Date().toISOString(),
    });

    // Add to local state optimistically
    const optimisticMessage = {
      id: Date.now(),
      text: messageText,
      senderId: user?.id,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Also save to backend via API (for persistence)
    try {
      await messageService.sendMessage({
        conversationId: conversation.id,
        senderId: user?.id,
        text: messageText,
      });
    } catch (error) {
      console.error('Failed to persist message:', error);
      // Message already sent via WebSocket, so don't show error
    }
  };

  const handleAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const attachment = {
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        size: file.size,
      };
      const text = `📎 ${file.name}`;
      const timestamp = new Date().toISOString();

      websocketService.sendMessage(conversation.id, { text, attachment, timestamp });
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text, attachment, senderId: user?.id, timestamp, read: false },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        await messageService.sendMessage({
          conversationId: conversation.id,
          senderId: user?.id,
          text,
          attachment,
        });
      } catch (error) {
        console.error('Failed to persist attachment message:', error);
      }
    } catch (error) {
      console.error('Attachment picker failed:', error);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);

    // Send typing indicator
    if (text.length > 0 && !isTyping && connected) {
      setIsTyping(true);
      websocketService.sendTyping(conversation.id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      websocketService.sendTyping(conversation.id, false);
    }

    // Reset typing indicator after 2s of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        websocketService.sendTyping(conversation.id, false);
      }, 2000);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === user?.id;
    const showDateSeparator = shouldShowDateSeparator(item, messages[index - 1]);

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(item.timestamp)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={handleAttach}>
          <Ionicons name="add-circle-outline" size={28} color={colors.info} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxLength={1000}
          editable={connected}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || !connected) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || !connected}
        >
          <Ionicons name="send" size={20} color={inputText.trim() && connected ? "#fff" : "#64748B"} />
        </TouchableOpacity>
      </View>

      {/* Typing Indicator */}
      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{conversation.participant.name} is typing...</Text>
        </View>
      )}

      {/* Connection Status Banner */}
      {!connected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="cloud-offline" size={16} color={colors.warning} />
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  messagesContent: {
    padding: spacing[4],
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: typography.xs,
    color: colors.textMuted,
    backgroundColor: colors.slate[800],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.xl,
  },
  messageContainer: {
    marginBottom: spacing[3],
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[3],
    paddingBottom: spacing[1] + 2,
  },
  ownMessageBubble: {
    backgroundColor: colors.darkBlue,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.slate[800],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing[1],
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing[3],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  attachButton: {
    padding: spacing[2],
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    backgroundColor: colors.slate[800],
    borderRadius: 20,
    paddingHorizontal: spacing[4],
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
  typingIndicator: {
    padding: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.surface,
  },
  typingText: {
    fontSize: 13,
    color: colors.info,
    fontStyle: 'italic',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    padding: spacing[2],
  },
  connectionText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: spacing[2],
    fontWeight: typography.fontWeight.medium,
  },
});

export default ChatScreen;
