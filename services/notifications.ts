import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { pb } from './pocketbase';

// Notification types
export type NotificationType = 'period' | 'fertile' | 'daily_log' | 'educational';

// Notification identifier prefixes
export const NOTIFICATION_IDS = {
  PERIOD_PREFIX: 'period-reminder-',
  FERTILE_PREFIX: 'fertile-window-',
  DAILY_LOG_PREFIX: 'daily-log-',
  EDUCATIONAL_PREFIX: 'educational-',
} as const;

// Set up notification handler with correct API
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Initialize Android notification channels
 * Must be called before requesting permissions (Android 13+ requirement)
 */
export async function initializeNotificationChannels() {
  if (Platform.OS !== 'android') return;

  // Period reminders channel (highest importance)
  await Notifications.setNotificationChannelAsync('period', {
    name: 'Recordatorios de Periodo',
    description: 'Notificaciones sobre tu próximo periodo menstrual',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  // Fertile window channel
  await Notifications.setNotificationChannelAsync('fertile', {
    name: 'Ventana Fértil',
    description: 'Notificaciones sobre tu ventana fértil',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 200],
    lightColor: '#9C27B0',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  // Drug reminder channel
  await Notifications.setNotificationChannelAsync('daily_log', {
    name: 'Recordatorio de Medicamentos',
    description: 'Recordatorios para tomar tus medicamentos',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 150],
    lightColor: '#E91E63',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  // Educational tips channel (lower importance)
  await Notifications.setNotificationChannelAsync('educational', {
    name: 'Consejos Educativos',
    description: 'Tips y consejos sobre salud menstrual',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100],
    lightColor: '#4CAF50',
    sound: 'default',
    enableVibrate: false,
    showBadge: false,
  });
}

/**
 * Request notification permissions
 * Handles Android 13+ requirements by creating channels first
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    // Initialize Android channels before requesting permissions
    await initializeNotificationChannels();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function hasPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Register push token for remote notifications (kept for backward compatibility)
 */
export async function registerPushToken(userId: string) {
  try {
    const projectId = require('expo-constants').default?.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

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

/**
 * Parse time string (HH:mm) to hour and minute
 */
function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour: hour || 9, minute: minute || 0 };
}

/**
 * Create a date with specific time
 */
function createDateWithTime(date: Date, time: string): Date {
  const { hour, minute } = parseTime(time);
  const newDate = new Date(date);
  newDate.setHours(hour, minute, 0, 0);
  return newDate;
}

/**
 * Schedule period reminder notifications
 * @param nextPeriodDate - Date of next expected period
 * @param daysBefore - Array of days before period to remind (e.g., [3, 1])
 * @param time - Time string in HH:mm format
 */
export async function schedulePeriodReminders(
  nextPeriodDate: Date,
  daysBefore: number[],
  time: string
): Promise<string[]> {
  // Cancel existing period reminders first
  await cancelPeriodReminders();

  const identifiers: string[] = [];

  for (const days of daysBefore) {
    const reminderDate = new Date(nextPeriodDate);
    reminderDate.setDate(reminderDate.getDate() - days);
    const notificationDate = createDateWithTime(reminderDate, time);

    // Only schedule if the date is in the future
    if (notificationDate.getTime() > Date.now()) {
      const identifier = `${NOTIFICATION_IDS.PERIOD_PREFIX}${days}`;
      identifiers.push(identifier);

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: 'Recordatorio de periodo',
          body: `Tu periodo está programado para comenzar en ${days} día${days > 1 ? 's' : ''}. Prepárate.`,
          sound: true,
          data: {
            type: 'period',
            daysBefore: days,
            periodDate: nextPeriodDate.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
        ...(Platform.OS === 'android' && { channelId: 'period' }),
      });
    }
  }

  return identifiers;
}

/**
 * Schedule fertile window notification
 * @param fertileWindowStart - Start date of fertile window
 * @param time - Time string in HH:mm format
 */
export async function scheduleFertileWindowNotification(
  fertileWindowStart: Date,
  time: string
): Promise<string | null> {
  const notificationDate = createDateWithTime(fertileWindowStart, time);

  // Only schedule if the date is in the future
  if (notificationDate.getTime() <= Date.now()) {
    return null;
  }

  // Cancel existing fertile window notifications first
  await cancelFertileWindowNotification();

  const identifier = NOTIFICATION_IDS.FERTILE_PREFIX + fertileWindowStart.getTime();

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Ventana fértil',
      body: 'Estás en tus días de mayor fertilidad del ciclo.',
      sound: true,
      data: {
        type: 'fertile',
        fertileWindowStart: fertileWindowStart.toISOString(),
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
    },
    ...(Platform.OS === 'android' && { channelId: 'fertile' }),
  });

  return identifier;
}

/**
 * Schedule daily log reminder (recurring)
 * @param time - Time string in HH:mm format
 * @param enabled - Whether the reminder is enabled
 */
export async function scheduleDailyLogReminder(
  time: string,
  enabled: boolean
): Promise<string | null> {
  if (!enabled) {
    // Cancel existing notifications if disabled
    await cancelDailyLogReminder();
    return null;
  }

  const { hour, minute } = parseTime(time);

  // Check if notification is already scheduled
  const isAlreadyScheduled = await getAllScheduledNotifications();
  const dailyLogNotifications = isAlreadyScheduled.filter(
    (notification: any) => notification?.trigger?.channelId === 'daily_log'
  );

  // If already scheduled, don't schedule again
  if (dailyLogNotifications.length > 0) {
    return null;
  }

  // Calculate the target time for today or tomorrow
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(hour, minute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const identifier = NOTIFICATION_IDS.DAILY_LOG_PREFIX + 'recurring';

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Recordatorio de medicamentos',
      body: 'Es hora de tomar tus medicamentos.',
      sound: true,
      data: {
        type: 'daily_log',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: targetTime.getHours(),
      minute: targetTime.getMinutes(),
      channelId: 'daily_log',
    },
  });

  return identifier;
}

/**
 * Schedule educational tip notification
 * @param date - Date to send the notification
 * @param title - Notification title
 * @param body - Notification body
 */
export async function scheduleEducationalTip(
  date: Date,
  title: string,
  body: string
): Promise<string> {
  const identifier = `${NOTIFICATION_IDS.EDUCATIONAL_PREFIX}${date.getTime()}`;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: false,
      data: {
        type: 'educational',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
    ...(Platform.OS === 'android' && { channelId: 'educational' }),
  });

  return identifier;
}

/**
 * Cancel a specific notification by identifier
 */
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error(`Error canceling notification ${identifier}:`, error);
  }
}

/**
 * Cancel all period reminder notifications
 */
export async function cancelPeriodReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const periodNotifications = scheduled.filter((n) =>
      n.identifier.startsWith(NOTIFICATION_IDS.PERIOD_PREFIX)
    );

    await Promise.all(
      periodNotifications.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch (error) {
    console.error('Error canceling period reminders:', error);
  }
}

/**
 * Cancel fertile window notification
 */
export async function cancelFertileWindowNotification(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const fertileNotifications = scheduled.filter((n) =>
      n.identifier.startsWith(NOTIFICATION_IDS.FERTILE_PREFIX)
    );

    await Promise.all(
      fertileNotifications.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );
  } catch (error) {
    console.error('Error canceling fertile window notification:', error);
  }
}

/**
 * Cancel daily log reminder
 */
export async function cancelDailyLogReminder(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const dailyLogNotifications = scheduled.filter(
      (notification: any) => notification?.trigger?.channelId === 'daily_log'
    );

    await Promise.all(
      dailyLogNotifications.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );
  } catch (error) {
    console.error('Error canceling daily log reminder:', error);
  }
}

/**
 * Cancel all educational notifications
 */
export async function cancelEducationalNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const educationalNotifications = scheduled.filter((n) =>
      n.identifier.startsWith(NOTIFICATION_IDS.EDUCATIONAL_PREFIX)
    );

    await Promise.all(
      educationalNotifications.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );
  } catch (error) {
    console.error('Error canceling educational notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send a test notification immediately
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificación de prueba',
        body: 'Esta es una notificación de prueba de Lunaria.',
        sound: true,
        data: {
          type: 'test',
        },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}
