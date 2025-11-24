import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.expoPushToken = null;
        this.notificationListener = null;
        this.responseListener = null;
    }

    /**
     * Register for push notifications
     */
    async registerForPushNotifications() {
        try {
            if (!Device.isDevice) {
                console.log('Push notifications only work on physical devices');
                return null;
            }

            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            // Get Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id', // Replace with your Expo project ID
            });

            this.expoPushToken = tokenData.data;

            // Save token to AsyncStorage
            await AsyncStorage.setItem('expoPushToken', this.expoPushToken);

            console.log('Expo Push Token:', this.expoPushToken);
            return this.expoPushToken;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    }

    /**
     * Schedule a local notification
     */
    async scheduleLocalNotification(title, body, data = {}) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }

    /**
     * Add notification received listener
     */
    addNotificationReceivedListener(callback) {
        this.notificationListener = Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Add notification response listener (when user taps notification)
     */
    addNotificationResponseListener(callback) {
        this.responseListener = Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Remove listeners
     */
    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    /**
     * Get badge count
     */
    async getBadgeCount() {
        return await Notifications.getBadgeCountAsync();
    }

    /**
     * Set badge count
     */
    async setBadgeCount(count) {
        await Notifications.setBadgeCountAsync(count);
    }

    /**
     * Clear all notifications
     */
    async clearAllNotifications() {
        await Notifications.dismissAllNotificationsAsync();
    }

    /**
     * Send push token to backend
     */
    async sendPushTokenToBackend(token, apiClient) {
        try {
            await apiClient.post('/users/push-token', {
                token: token || this.expoPushToken,
                platform: Platform.OS,
            });
        } catch (error) {
            console.error('Error sending push token to backend:', error);
        }
    }
}

// Export singleton instance
export default new NotificationService();
