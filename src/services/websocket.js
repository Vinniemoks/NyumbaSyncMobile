import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map();
    }

    /**
     * Connect to WebSocket server
     */
    async connect() {
        try {
            // Get auth token
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            // Initialize socket connection
            const API_URL = 'http://localhost:3000'; // Update for production

            this.socket = io(API_URL, {
                auth: {
                    token: token,
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Connection event handlers
            this.socket.on('connect', () => {
                console.log('✅ WebSocket connected');
                this.connected = true;
                this.emit('connection:success');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ WebSocket disconnected:', reason);
                this.connected = false;
                this.emit('connection:lost', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                this.emit('connection:error', error);
            });

            // Message events
            this.socket.on('message:received', (data) => {
                this.emit('message:received', data);
            });

            this.socket.on('user:typing', (data) => {
                this.emit('user:typing', data);
            });

            this.socket.on('message:read', (data) => {
                this.emit('message:read', data);
            });

            // Presence events
            this.socket.on('user:online', (data) => {
                this.emit('user:online', data);
            });

            this.socket.on('user:offline', (data) => {
                this.emit('user:offline', data);
            });

            // Notification events
            this.socket.on('maintenance:updated', (data) => {
                this.emit('maintenance:updated', data);
            });

            this.socket.on('payment:status', (data) => {
                this.emit('payment:status', data);
            });

            return this.socket;
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            throw error;
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
        }
    }

    /**
     * Join a conversation room
     */
    joinConversation(conversationId) {
        if (this.socket && this.connected) {
            this.socket.emit('join:conversation', conversationId);
        }
    }

    /**
     * Leave a conversation room
     */
    leaveConversation(conversationId) {
        if (this.socket && this.connected) {
            this.socket.emit('leave:conversation', conversationId);
        }
    }

    /**
     * Send a message
     */
    sendMessage(conversationId, message) {
        if (this.socket && this.connected) {
            this.socket.emit('message:send', {
                conversationId,
                message,
            });
        }
    }

    /**
     * Send typing indicator
     */
    sendTyping(conversationId, isTyping) {
        if (this.socket && this.connected) {
            this.socket.emit('message:typing', {
                conversationId,
                isTyping,
            });
        }
    }

    /**
     * Mark message as read
     */
    markAsRead(conversationId, messageId) {
        if (this.socket && this.connected) {
            this.socket.emit('message:read', {
                conversationId,
                messageId,
            });
        }
    }

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
}

// Export singleton instance
export default new WebSocketService();
