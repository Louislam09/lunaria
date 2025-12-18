import { Platform } from 'react-native';
import { pb } from './pocketbase';

// expo-notifications - install expo-notifications
let Notifications: any;
let AndroidImportance: any;
try {
  const expoNotifications = require('expo-notifications');
  Notifications = expoNotifications;
  AndroidImportance = expoNotifications.AndroidImportance;
} catch {
  // Fallback for development
  Notifications = {
    setNotificationHandler: async () => {},
    getPermissionsAsync: async () => ({ status: 'undetermined' }),
    requestPermissionsAsync: async () => ({ status: 'undetermined' }),
    getExpoPushTokenAsync: async () => ({ data: 'placeholder-token' }),
    scheduleNotificationAsync: async () => {},
    setNotificationChannelAsync: async () => {},
  };
  AndroidImportance = { MAX: 5 };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function registerPushToken(userId: string) {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Save token to PocketBase
    await pb.collection('push_tokens').create({
      user: userId,
      token: token.data,
      platform: Platform.OS,
    });
    
    return token.data;
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
}

export async function schedulePeriodReminder(daysBefore: number, date: Date) {
  const triggerDate = new Date(date);
  triggerDate.setDate(triggerDate.getDate() - daysBefore);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de periodo',
      body: `Tu periodo está programado para comenzar en ${daysBefore} día${daysBefore > 1 ? 's' : ''}`,
      sound: true,
    },
    trigger: triggerDate,
  });
}

