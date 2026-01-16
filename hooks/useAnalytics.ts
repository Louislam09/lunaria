import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useDailyLogs, useCycles } from '@/hooks/useReactiveData';
import { getAllPeriods } from '@/utils/periodHistory';
import {
  calculateCycleStatistics,
  analyzeSymptomFrequency,
  analyzeMoodFrequency,
  getCycleTrendData,
  getPeriodDurationTrend,
  CycleStatistics,
  SymptomFrequency,
  MoodFrequency,
  CycleTrendData,
} from '@/utils/analytics';
import {
  detectSymptomPatterns,
  calculatePhaseCorrelations,
  SymptomPattern,
  PhaseCorrelation,
} from '@/utils/patternDetection';

export interface AnalyticsData {
  cycleStats: CycleStatistics;
  symptomFrequency: SymptomFrequency[];
  moodFrequency: MoodFrequency[];
  cycleTrends: CycleTrendData[];
  periodDurationTrends: CycleTrendData[];
  symptomPatterns: SymptomPattern[];
  phaseCorrelations: PhaseCorrelation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalytics(): AnalyticsData {
  const { user, isAuthenticated, localUserId } = useAuth();
  const { data, isLoading: onboardingLoading } = useOnboarding();

  const userId = isAuthenticated && user ? user.id : localUserId;

  // Use reactive hooks - automatically updates when data changes
  const logs = useDailyLogs(userId || '');
  const cycles = useCycles(userId || '');

  const isLoading = onboardingLoading;
  const error = null; // Reactive hooks handle errors internally

  // Calculate analytics
  const analytics = useMemo(() => {
    if (isLoading || !data.lastPeriodStart || !userId) {
      return {
        cycleStats: {
          averageCycleLength: data.averageCycleLength || 28,
          minCycleLength: data.averageCycleLength || 28,
          maxCycleLength: data.averageCycleLength || 28,
          averagePeriodDuration: data.periodLength || 5,
          minPeriodDuration: data.periodLength || 5,
          maxPeriodDuration: data.periodLength || 5,
          cycleRegularity: 0,
          totalCycles: 0,
          regularityScore: 'regular' as const,
        },
        symptomFrequency: [],
        moodFrequency: [],
        cycleTrends: [],
        periodDurationTrends: [],
        symptomPatterns: [],
        phaseCorrelations: [],
        isLoading,
        error,
      };
    }

    try {
      // Get period history
      const lastPeriodStart = new Date(data.lastPeriodStart);
      const averageCycleLength = data.averageCycleLength || 28;
      const periods = getAllPeriods(logs, cycles, averageCycleLength, lastPeriodStart);

      // Calculate cycle statistics
      const cycleStats = calculateCycleStatistics(periods, averageCycleLength);

      // Analyze symptoms
      const symptomFrequency = analyzeSymptomFrequency(
        logs,
        lastPeriodStart,
        data.cycleType === 'regular' && data.averageCycleLength
          ? data.averageCycleLength
          : averageCycleLength
      );

      // Analyze moods
      const moodFrequency = analyzeMoodFrequency(
        logs,
        lastPeriodStart,
        data.cycleType === 'regular' && data.averageCycleLength
          ? data.averageCycleLength
          : averageCycleLength
      );

      // Get trends
      const cycleTrends = getCycleTrendData(periods, averageCycleLength);
      const periodDurationTrends = getPeriodDurationTrend(periods);

      // Detect patterns
      const symptomPatterns = detectSymptomPatterns(
        logs,
        cycles,
        lastPeriodStart,
        averageCycleLength
      );

      // Calculate phase correlations
      const phaseCorrelations = calculatePhaseCorrelations(
        logs,
        lastPeriodStart,
        averageCycleLength
      );

      return {
        cycleStats,
        symptomFrequency,
        moodFrequency,
        cycleTrends,
        periodDurationTrends,
        symptomPatterns,
        phaseCorrelations,
        isLoading,
        error,
      };
    } catch (err: any) {
      console.error('Error calculating analytics:', err);
      return {
        cycleStats: {
          averageCycleLength: data.averageCycleLength || 28,
          minCycleLength: data.averageCycleLength || 28,
          maxCycleLength: data.averageCycleLength || 28,
          averagePeriodDuration: data.periodLength || 5,
          minPeriodDuration: data.periodLength || 5,
          maxPeriodDuration: data.periodLength || 5,
          cycleRegularity: 0,
          totalCycles: 0,
          regularityScore: 'regular' as const,
        },
        symptomFrequency: [],
        moodFrequency: [],
        cycleTrends: [],
        periodDurationTrends: [],
        symptomPatterns: [],
        phaseCorrelations: [],
        isLoading,
        error: err.message || 'Error al calcular estadísticas',
      };
    }
  }, [logs, cycles, data, isLoading, error, userId]);

  return {
    ...analytics,
    refetch: async () => {
      // No-op - data is automatically reactive
      // This maintains API compatibility
    },
  };
}
