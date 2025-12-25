import Storage from 'expo-sqlite/kv-store';

const STORAGE_KEY = 'notificationPreferences';

export interface PeriodReminderPreferences {
  enabled: boolean;
  daysBefore: number[];
  time: string;
}

export interface FertileWindowPreferences {
  enabled: boolean;
  time: string;
}

export interface DailyLogReminderPreferences {
  enabled: boolean;
  time: string;
  repeat: boolean;
}

export interface EducationalTipsPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'never';
}

export interface NotificationPreferences {
  enabled: boolean;
  periodReminders: PeriodReminderPreferences;
  fertileWindowReminders: FertileWindowPreferences;
  dailyLogReminder: DailyLogReminderPreferences;
  educationalTips: EducationalTipsPreferences;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  periodReminders: {
    enabled: true,
    daysBefore: [3, 1],
    time: '09:00',
  },
  fertileWindowReminders: {
    enabled: true,
    time: '09:00',
  },
  dailyLogReminder: {
    enabled: true,
    time: '20:00',
    repeat: true,
  },
  educationalTips: {
    enabled: false,
    frequency: 'weekly',
  },
};

/**
 * Get notification preferences from storage
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await Storage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        periodReminders: {
          ...DEFAULT_PREFERENCES.periodReminders,
          ...parsed.periodReminders,
        },
        fertileWindowReminders: {
          ...DEFAULT_PREFERENCES.fertileWindowReminders,
          ...parsed.fertileWindowReminders,
        },
        dailyLogReminder: {
          ...DEFAULT_PREFERENCES.dailyLogReminder,
          ...parsed.dailyLogReminder,
        },
        educationalTips: {
          ...DEFAULT_PREFERENCES.educationalTips,
          ...parsed.educationalTips,
        },
      };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save notification preferences to storage
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  try {
    await Storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    throw error;
  }
}

/**
 * Update specific notification preferences
 */
export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences();
  const updated = {
    ...current,
    ...updates,
    periodReminders: {
      ...current.periodReminders,
      ...updates.periodReminders,
    },
    fertileWindowReminders: {
      ...current.fertileWindowReminders,
      ...updates.fertileWindowReminders,
    },
    dailyLogReminder: {
      ...current.dailyLogReminder,
      ...updates.dailyLogReminder,
    },
    educationalTips: {
      ...current.educationalTips,
      ...updates.educationalTips,
    },
  };
  await saveNotificationPreferences(updated);
  return updated;
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<NotificationPreferences> {
  await saveNotificationPreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

