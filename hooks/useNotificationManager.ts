import React, { useEffect, useCallback, useRef } from 'react';
import { useCyclePredictions } from './useCyclePredictions';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  schedulePeriodReminders,
  scheduleFertileWindowNotification,
  scheduleDailyLogReminder,
  cancelPeriodReminders,
  cancelFertileWindowNotification,
  cancelDailyLogReminder,
  cancelAllNotifications,
  requestPermissions,
  hasPermissions,
} from '@/services/notifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/services/notificationPreferences';
import { getFertileWindow } from '@/utils/predictions';

export interface UseNotificationManagerReturn {
  scheduleNotifications: () => Promise<void>;
  rescheduleNotifications: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  isScheduling: boolean;
}

/**
 * Hook to manage notification scheduling based on cycle predictions
 * Auto-schedules notifications when cycle data changes
 */
export function useNotificationManager(): UseNotificationManagerReturn {
  const { data } = useOnboarding();
  const predictions = useCyclePredictions(data);
  const [preferences, setPreferences] = React.useState<NotificationPreferences | null>(null);
  const [isScheduling, setIsScheduling] = React.useState(false);
  const lastPeriodStartRef = useRef<Date | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Auto-schedule when cycle data changes
  useEffect(() => {
    if (
      data.lastPeriodStart &&
      preferences &&
      data.lastPeriodStart.getTime() !== lastPeriodStartRef.current?.getTime()
    ) {
      lastPeriodStartRef.current = data.lastPeriodStart;
      if (preferences.enabled) {
        scheduleNotifications();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.lastPeriodStart, preferences?.enabled]);

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences();
    setPreferences(prefs);
  };

  const scheduleNotifications = useCallback(async () => {
    if (!preferences?.enabled) return;

    try {
      setIsScheduling(true);

      // Check permissions first
      const hasPermission = await hasPermissions();
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          console.log('Notification permissions not granted');
          return;
        }
      }

      // Cancel old notifications first
      await cancelPeriodReminders();
      await cancelFertileWindowNotification();

      // Schedule period reminders
      if (
        preferences.periodReminders.enabled &&
        predictions.nextPeriodResult.date &&
        preferences.periodReminders.daysBefore.length > 0
      ) {
        await schedulePeriodReminders(
          predictions.nextPeriodResult.date,
          preferences.periodReminders.daysBefore,
          preferences.periodReminders.time
        );
      }

      // Schedule fertile window notification
      if (
        preferences.fertileWindowReminders.enabled &&
        predictions.fertileWindow &&
        data.cycleType === 'regular' &&
        data.averageCycleLength
      ) {
        // Calculate fertile window start date
        const cycleLength = data.averageCycleLength;
        const fertileWindow = getFertileWindow(cycleLength);
        if (fertileWindow) {
          const fertileStartDay = fertileWindow.startDay;
          const lastPeriodStart = new Date(data.lastPeriodStart!);
          const fertileStartDate = new Date(lastPeriodStart);
          fertileStartDate.setDate(fertileStartDate.getDate() + fertileStartDay);

          // Only schedule if fertile window is in the future
          if (fertileStartDate.getTime() > Date.now()) {
            await scheduleFertileWindowNotification(
              fertileStartDate,
              preferences.fertileWindowReminders.time
            );
          }
        }
      }

      // Schedule daily log reminder (recurring)
      if (preferences.dailyLogReminder.enabled && preferences.dailyLogReminder.repeat) {
        await scheduleDailyLogReminder(
          preferences.dailyLogReminder.time,
          preferences.dailyLogReminder.enabled
        );
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    } finally {
      setIsScheduling(false);
    }
  }, [preferences, predictions, data]);

  const rescheduleNotifications = useCallback(async () => {
    await clearNotifications();
    await scheduleNotifications();
  }, [scheduleNotifications]);

  const clearNotifications = useCallback(async () => {
    try {
      await cancelAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      const updated = await updateNotificationPreferences(updates);
      setPreferences(updated);

      // Reschedule notifications if enabled
      if (updated.enabled) {
        await rescheduleNotifications();
      } else {
        await clearNotifications();
      }
    },
    [rescheduleNotifications, clearNotifications]
  );

  return {
    scheduleNotifications,
    rescheduleNotifications,
    clearNotifications,
    preferences,
    updatePreferences,
    isScheduling,
  };
}

