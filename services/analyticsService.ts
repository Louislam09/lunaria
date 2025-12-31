import { DailyLogsService, CyclesService } from './dataService';

export interface CycleTrend {
  date: string;
  cycleLength: number;
  periodLength: number;
}

export interface SymptomPattern {
  symptom: string;
  frequency: number;
  percentage: number;
  mostCommonPhase: string;
  phaseDistribution: Record<string, number>;
}

export interface MoodTrend {
  mood: string;
  frequency: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnalyticsData {
  cycleTrends: CycleTrend[];
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleRegularityScore: number; // 0-100
  symptomPatterns: SymptomPattern[];
  moodTrends: MoodTrend[];
  totalCycles: number;
  totalLogs: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Calculate cycle trends from cycles data
 */
async function calculateCycleTrends(userId: string): Promise<CycleTrend[]> {
  const cycles = await CyclesService.getAll(userId);
  const logs = await DailyLogsService.getAll(userId);

  // Sort cycles by start date
  const sortedCycles = cycles
    .filter(c => c.start_date)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const trends: CycleTrend[] = [];

  for (let i = 0; i < sortedCycles.length - 1; i++) {
    const currentCycle = sortedCycles[i];
    const nextCycle = sortedCycles[i + 1];

    const startDate = new Date(currentCycle.start_date);
    const nextStartDate = new Date(nextCycle.start_date);
    const cycleLength = Math.floor(
      (nextStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate period length from logs
    let periodLength = 0;
    if (currentCycle.end_date) {
      const endDate = new Date(currentCycle.end_date);
      periodLength = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    } else {
      // Estimate from logs with flow
      const cycleLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate < nextStartDate && log.flow && log.flow !== 'none';
      });
      periodLength = cycleLogs.length || 5; // Default to 5 if no logs
    }

    trends.push({
      date: currentCycle.start_date,
      cycleLength,
      periodLength,
    });
  }

  return trends;
}

/**
 * Calculate average cycle length
 */
function calculateAverageCycleLength(trends: CycleTrend[]): number {
  if (trends.length === 0) return 0;
  const sum = trends.reduce((acc, trend) => acc + trend.cycleLength, 0);
  return Math.round(sum / trends.length);
}

/**
 * Calculate average period length
 */
function calculateAveragePeriodLength(trends: CycleTrend[]): number {
  if (trends.length === 0) return 0;
  const sum = trends.reduce((acc, trend) => acc + trend.periodLength, 0);
  return Math.round(sum / trends.length);
}

/**
 * Calculate cycle regularity score (0-100)
 * Based on standard deviation of cycle lengths
 */
function calculateCycleRegularityScore(trends: CycleTrend[]): number {
  if (trends.length < 2) return 100; // Perfect if only one cycle

  const cycleLengths = trends.map(t => t.cycleLength);
  const mean = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce((acc, length) => acc + Math.pow(length - mean, 2), 0) / cycleLengths.length;
  const standardDeviation = Math.sqrt(variance);

  // Score based on standard deviation (lower = more regular)
  // Max score of 100, decreases as SD increases
  // If SD is 0, score is 100
  // If SD is >= 7 (very irregular), score approaches 0
  const score = Math.max(0, 100 - (standardDeviation / 7) * 100);
  return Math.round(score);
}

/**
 * Get cycle phase for a given date
 */
function getCyclePhase(date: Date, lastPeriodStart: Date, cycleLength: number): string {
  const daysSincePeriod = Math.floor(
    (date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay = (daysSincePeriod % cycleLength) + 1;

  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  return 'luteal';
}

/**
 * Calculate symptom patterns
 */
async function calculateSymptomPatterns(
  userId: string,
  trends: CycleTrend[]
): Promise<SymptomPattern[]> {
  const logs = await DailyLogsService.getAll(userId);
  const symptomMap = new Map<string, {
    count: number;
    phaseCounts: Record<string, number>;
  }>();

  // Calculate average cycle length for phase calculation
  const avgCycleLength = calculateAverageCycleLength(trends);
  const lastPeriodStart = trends.length > 0 ? new Date(trends[0].date) : new Date();

  logs.forEach(log => {
    const logDate = new Date(log.date);
    const phase = getCyclePhase(logDate, lastPeriodStart, avgCycleLength);

    log.symptoms.forEach(symptom => {
      if (!symptomMap.has(symptom)) {
        symptomMap.set(symptom, { count: 0, phaseCounts: {} });
      }

      const data = symptomMap.get(symptom)!;
      data.count++;
      data.phaseCounts[phase] = (data.phaseCounts[phase] || 0) + 1;
    });
  });

  const totalLogsWithSymptoms = logs.filter(log => log.symptoms.length > 0).length;

  return Array.from(symptomMap.entries()).map(([symptom, data]) => {
    const mostCommonPhase = Object.entries(data.phaseCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    return {
      symptom,
      frequency: data.count,
      percentage: totalLogsWithSymptoms > 0
        ? Math.round((data.count / totalLogsWithSymptoms) * 100)
        : 0,
      mostCommonPhase,
      phaseDistribution: data.phaseCounts,
    };
  }).sort((a, b) => b.frequency - a.frequency);
}

/**
 * Calculate mood trends
 */
async function calculateMoodTrends(userId: string): Promise<MoodTrend[]> {
  const logs = await DailyLogsService.getAll(userId);
  const moodMap = new Map<string, number>();

  logs.forEach(log => {
    if (log.mood) {
      const moods = log.mood.split(',');
      moods.forEach(mood => {
        const trimmedMood = mood.trim();
        moodMap.set(trimmedMood, (moodMap.get(trimmedMood) || 0) + 1);
      });
    }
  });

  const totalLogsWithMood = logs.filter(log => log.mood).length;

  const moods = Array.from(moodMap.entries()).map(([mood, count]) => ({
    mood,
    frequency: count,
    percentage: totalLogsWithMood > 0
      ? Math.round((count / totalLogsWithMood) * 100)
      : 0,
    trend: 'stable' as const, // Could be enhanced with time-based analysis
  })).sort((a, b) => b.frequency - a.frequency);

  return moods;
}

/**
 * Get comprehensive analytics data for a user
 */
export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  const cycles = await CyclesService.getAll(userId);
  const logs = await DailyLogsService.getAll(userId);

  if (cycles.length === 0 || logs.length === 0) {
    return {
      cycleTrends: [],
      averageCycleLength: 0,
      averagePeriodLength: 0,
      cycleRegularityScore: 0,
      symptomPatterns: [],
      moodTrends: [],
      totalCycles: 0,
      totalLogs: 0,
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    };
  }

  const trends = await calculateCycleTrends(userId);
  const symptomPatterns = await calculateSymptomPatterns(userId, trends);
  const moodTrends = await calculateMoodTrends(userId);

  const sortedLogs = logs.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    cycleTrends: trends,
    averageCycleLength: calculateAverageCycleLength(trends),
    averagePeriodLength: calculateAveragePeriodLength(trends),
    cycleRegularityScore: calculateCycleRegularityScore(trends),
    symptomPatterns,
    moodTrends,
    totalCycles: cycles.length,
    totalLogs: logs.length,
    dateRange: {
      start: sortedLogs[0].date,
      end: sortedLogs[sortedLogs.length - 1].date,
    },
  };
}

