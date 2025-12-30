import { useMemo, useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useCyclePredictions } from './useCyclePredictions';
import { DailyLogsService, CyclesService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dates';

export interface PeriodConfirmationState {
  needsConfirmation: boolean;
  predictedDate: Date | null;
  hasConfirmed: boolean;
  checkConfirmation: () => Promise<void>;
}

/**
 * Hook to check if today is a predicted period day that needs confirmation
 */
export function usePeriodConfirmation(): PeriodConfirmationState {
  const { data } = useOnboarding();
  const { user, isAuthenticated, localUserId } = useAuth();
  const cyclePredictions = useCyclePredictions(data);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [todayLog, setTodayLog] = useState<any>(null);
  const lastCheckedDate = useRef<string>('');

  const userId = isAuthenticated && user ? user.id : localUserId;

  // Check if today matches the predicted period date or is after it
  const needsConfirmation = useMemo(() => {
    if (!data.lastPeriodStart || !cyclePredictions.nextPeriodResult) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const predictedDate = new Date(cyclePredictions.nextPeriodResult.date);
    predictedDate.setHours(0, 0, 0, 0);

    // Calculate days difference (positive if today is after predicted date)
    const daysDiff = Math.floor((today.getTime() - predictedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if today is on or after the predicted period day
    // For regular cycles: exact match or after
    // For irregular cycles: within 1 day before, exact match, or after
    const isOnOrAfterPredictedDay = data.cycleType === 'regular'
      ? daysDiff >= 0  // Today is predicted date or later
      : daysDiff >= -1; // Today is 1 day before, on, or after predicted date

    // Only need confirmation if:
    // 1. Today is on or after the predicted day
    // 2. User hasn't already confirmed today
    // 3. There's no period flow logged for today
    const needsConf = isOnOrAfterPredictedDay && !hasConfirmed && (!todayLog || !todayLog.flow);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Period Confirmation Check:', {
        today: todayStr,
        predictedDate: predictedDate.toISOString().split('T')[0],
        daysDiff,
        isOnOrAfterPredictedDay,
        hasConfirmed,
        hasFlow: todayLog?.flow,
        needsConfirmation: needsConf
      });
    }

    return needsConf;
  }, [data, cyclePredictions.nextPeriodResult, hasConfirmed, todayLog]);

  // Load today's log to check if already confirmed
  useEffect(() => {
    if (userId) {
      loadTodayLog();
    }
  }, [userId]);

  // Reset confirmation state when date changes
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    if (lastCheckedDate.current !== todayStr) {
      lastCheckedDate.current = todayStr;
      setHasConfirmed(false);
    }
  }, []);

  const loadTodayLog = async () => {
    if (!userId || !cyclePredictions.nextPeriodResult) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const log = await DailyLogsService.getByDate(userId, todayStr);
      setTodayLog(log);

      // Check if there's a cycle with delay for the predicted date
      const predictedDate = new Date(cyclePredictions.nextPeriodResult.date);
      predictedDate.setHours(0, 0, 0, 0);
      const predictedDateStr = predictedDate.toISOString().split('T')[0];

      const cycleWithDelay = await CyclesService.getByStartDate(userId, predictedDateStr);

      // If there's a log with flow, user has already confirmed period arrived
      // If there's a cycle with delay, user has already confirmed delay
      // BUT: if delay was recorded on a previous day and today is still after predicted date,
      // we should check if we need to update the delay
      if (log && log.flow) {
        setHasConfirmed(true);
      } else if (cycleWithDelay && cycleWithDelay.delay > 0) {
        // Check if today is later than when delay was recorded
        // If so, we might need to update the delay
        const daysSincePredicted = Math.floor((today.getTime() - predictedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePredicted > cycleWithDelay.delay) {
          // Delay needs to be updated, so don't mark as confirmed
          setHasConfirmed(false);
        } else {
          // Delay is up to date
          setHasConfirmed(true);
        }
      }
    } catch (error) {
      console.error('Error loading today log:', error);
    }
  };

  const checkConfirmation = async () => {
    await loadTodayLog();
  };

  return {
    needsConfirmation,
    predictedDate: cyclePredictions.nextPeriodResult?.date || null,
    hasConfirmed,
    checkConfirmation,
  };
}

