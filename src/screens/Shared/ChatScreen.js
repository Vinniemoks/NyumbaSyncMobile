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
import { messageService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
  const { conversation } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
    
    // Set header title
    navigation.setOptions({
      title: conversation.participant.name,
    });
  }, []);

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
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const response = await messageService.sendMessage({
        conversationId: conversation.id,
        senderId: user?.id,
        text: messageText,
      });

      if (response.data.success) {
        const newMessage = {
          id: Date.now(),
          text: messageText,
          senderId: user?.id,
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages([...messages, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText);
    } finally {
      setSending(false);
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
        <ActivityIndicator size="large" color="#6366F1" />
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
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={28} color="#6366F1" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesContent: {
    padding: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingBottom: 6,
  },
  ownMessageBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#F8FAFC',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#64748B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: '#F8FAFC',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});

export default ChatScreen;
