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

  // Check if today matches the predicted period date
  const needsConfirmation = useMemo(() => {
    if (!data.lastPeriodStart || !cyclePredictions.nextPeriodResult) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Reset confirmation state if it's a new day
    if (lastCheckedDate.current !== todayStr) {
      lastCheckedDate.current = todayStr;
      setHasConfirmed(false);
    }

    const predictedDate = new Date(cyclePredictions.nextPeriodResult.date);
    predictedDate.setHours(0, 0, 0, 0);

    // Check if today is the predicted period day (or within 1 day range for irregular cycles)
    const daysDiff = Math.abs((today.getTime() - predictedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // For regular cycles, exact match. For irregular, allow 1 day range
    const isPredictedDay = data.cycleType === 'regular' 
      ? daysDiff === 0 
      : daysDiff <= 1;

    // Only need confirmation if:
    // 1. Today is the predicted day
    // 2. User hasn't already confirmed today
    // 3. There's no period flow logged for today
    return isPredictedDay && !hasConfirmed && (!todayLog || !todayLog.flow);
  }, [data, cyclePredictions.nextPeriodResult, hasConfirmed, todayLog]);

  // Load today's log to check if already confirmed
  useEffect(() => {
    if (userId) {
      loadTodayLog();
    }
  }, [userId]);

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
      
      // If there's a log with flow OR a cycle with delay, user has already confirmed
      if (log && log.flow) {
        setHasConfirmed(true);
      } else if (cycleWithDelay && cycleWithDelay.delay > 0) {
        setHasConfirmed(true);
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

