import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    if (user) {
      registerForPushNotifications();
      loadUnreadCount();
      setupNotificationListeners();
    }
  }, [user]);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Register token with backend
      if (user?.id) {
        await notificationService.registerPushToken(user.id, token);
      }

      // Android specific channel setup
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      loadUnreadCount();
    });

    // Notification tapped/opened
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification type
      const data = response.notification.request.content.data;
      handleNotificationTap(data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const loadUnreadCount = async () => {
    try {
      if (user?.id) {
        const response = await notificationService.getUnreadCount(user.id);
        if (response.data.success) {
          setUnreadCount(response.data.count);
        }
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNotificationTap = (data) => {
    // Navigate based on notification type
    switch (data?.type) {
      case 'payment':
        // Navigate to payments screen
        break;
      case 'maintenance':
        // Navigate to maintenance screen
        break;
      case 'lease':
        // Navigate to lease screen
        break;
      case 'document':
        // Navigate to documents screen
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (user?.id) {
        await notificationService.markAllAsRead(user.id);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        expoPushToken,
        loadUnreadCount,
        sendLocalNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
