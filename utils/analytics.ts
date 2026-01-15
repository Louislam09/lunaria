import { differenceInDays } from 'date-fns';
import { getAllPeriods, PeriodHistoryItem } from './periodHistory';
import { getCycleDay, getCyclePhase } from './predictions';

export interface DailyLog {
  id: string;
  date: string;
  symptoms: string[];
  flow: string;
  mood: string;
  notes: string;
  synced: boolean;
  updated_at: string;
}

export interface Cycle {
  id: string;
  start_date: string;
  end_date: string | null;
  delay: number;
  synced: boolean;
}

export interface CycleStatistics {
  averageCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  averagePeriodDuration: number;
  minPeriodDuration: number;
  maxPeriodDuration: number;
  cycleRegularity: number; // Standard deviation
  totalCycles: number;
  regularityScore: 'regular' | 'somewhat-regular' | 'irregular';
}

export interface SymptomFrequency {
  symptom: string;
  count: number;
  percentage: number;
  phaseDistribution: {
    menstrual: number;
    follicular: number;
    ovulatory: number;
    luteal: number;
  };
}

export interface MoodFrequency {
  mood: string;
  count: number;
  percentage: number;
  phaseDistribution: {
    menstrual: number;
    follicular: number;
    ovulatory: number;
    luteal: number;
  };
}

export interface CycleTrendData {
  date: string;
  cycleLength: number;
  periodDuration: number;
}

/**
 * Calculate cycle statistics from period history
 */
export function calculateCycleStatistics(
  periods: PeriodHistoryItem[],
  averageCycleLength: number = 28
): CycleStatistics {
  if (periods.length === 0) {
    return {
      averageCycleLength,
      minCycleLength: averageCycleLength,
      maxCycleLength: averageCycleLength,
      averagePeriodDuration: 5,
      minPeriodDuration: 5,
      maxPeriodDuration: 5,
      cycleRegularity: 0,
      totalCycles: 0,
      regularityScore: 'regular',
    };
  }

  // Filter periods with cycle length data
  const cyclesWithLength = periods.filter(p => p.cycleLength !== undefined);
  
  // Calculate cycle length statistics
  const cycleLengths = cyclesWithLength.map(p => p.cycleLength!);
  const avgCycleLength = cycleLengths.length > 0
    ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    : averageCycleLength;
  const minCycleLength = cycleLengths.length > 0 ? Math.min(...cycleLengths) : averageCycleLength;
  const maxCycleLength = cycleLengths.length > 0 ? Math.max(...cycleLengths) : averageCycleLength;

  // Calculate period duration statistics
  const durations = periods.map(p => p.duration);
  const avgPeriodDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minPeriodDuration = Math.min(...durations);
  const maxPeriodDuration = Math.max(...durations);

  // Calculate cycle regularity (standard deviation)
  const variance = cycleLengths.length > 0
    ? cycleLengths.reduce((acc, length) => acc + Math.pow(length - avgCycleLength, 2), 0) / cycleLengths.length
    : 0;
  const regularity = Math.sqrt(variance);

  // Determine regularity score
  let regularityScore: 'regular' | 'somewhat-regular' | 'irregular';
  if (regularity <= 2) {
    regularityScore = 'regular';
  } else if (regularity <= 5) {
    regularityScore = 'somewhat-regular';
  } else {
    regularityScore = 'irregular';
  }

  return {
    averageCycleLength: Math.round(avgCycleLength * 10) / 10,
    minCycleLength,
    maxCycleLength,
    averagePeriodDuration: Math.round(avgPeriodDuration * 10) / 10,
    minPeriodDuration,
    maxPeriodDuration,
    cycleRegularity: Math.round(regularity * 10) / 10,
    totalCycles: cyclesWithLength.length,
    regularityScore,
  };
}

/**
 * Analyze symptom frequency and distribution
 */
export function analyzeSymptomFrequency(
  logs: DailyLog[],
  lastPeriodStart: Date,
  cycleLength: number
): SymptomFrequency[] {
  const symptomMap = new Map<string, {
    count: number;
    phaseCounts: { menstrual: number; follicular: number; ovulatory: number; luteal: number };
  }>();

  let totalLogsWithSymptoms = 0;

  logs.forEach(log => {
    if (log.symptoms && log.symptoms.length > 0) {
      totalLogsWithSymptoms++;
      
      const logDate = new Date(log.date);
      const cycleDay = getCycleDay(lastPeriodStart, logDate);
      const phase = getCyclePhase(cycleDay, cycleLength);

      log.symptoms.forEach(symptom => {
        const normalizedSymptom = symptom.toLowerCase().trim();
        
        if (!symptomMap.has(normalizedSymptom)) {
          symptomMap.set(normalizedSymptom, {
            count: 0,
            phaseCounts: { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 },
          });
        }

        const data = symptomMap.get(normalizedSymptom)!;
        data.count++;
        data.phaseCounts[phase]++;
      });
    }
  });

  const totalSymptomOccurrences = Array.from(symptomMap.values())
    .reduce((sum, data) => sum + data.count, 0);

  return Array.from(symptomMap.entries())
    .map(([symptom, data]) => ({
      symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
      count: data.count,
      percentage: totalSymptomOccurrences > 0
        ? Math.round((data.count / totalSymptomOccurrences) * 100)
        : 0,
      phaseDistribution: {
        menstrual: data.phaseCounts.menstrual,
        follicular: data.phaseCounts.follicular,
        ovulatory: data.phaseCounts.ovulatory,
        luteal: data.phaseCounts.luteal,
      },
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Analyze mood frequency and distribution
 */
export function analyzeMoodFrequency(
  logs: DailyLog[],
  lastPeriodStart: Date,
  cycleLength: number
): MoodFrequency[] {
  const moodMap = new Map<string, {
    count: number;
    phaseCounts: { menstrual: number; follicular: number; ovulatory: number; luteal: number };
  }>();

  let totalLogsWithMood = 0;

  logs.forEach(log => {
    if (log.mood && log.mood.trim()) {
      totalLogsWithMood++;
      
      const logDate = new Date(log.date);
      const cycleDay = getCycleDay(lastPeriodStart, logDate);
      const phase = getCyclePhase(cycleDay, cycleLength);

      // Mood can be comma-separated
      const moods = log.mood.split(',').map(m => m.trim().toLowerCase());
      
      moods.forEach(mood => {
        if (!moodMap.has(mood)) {
          moodMap.set(mood, {
            count: 0,
            phaseCounts: { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 },
          });
        }

        const data = moodMap.get(mood)!;
        data.count++;
        data.phaseCounts[phase]++;
      });
    }
  });

  const totalMoodOccurrences = Array.from(moodMap.values())
    .reduce((sum, data) => sum + data.count, 0);

  return Array.from(moodMap.entries())
    .map(([mood, data]) => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: data.count,
      percentage: totalMoodOccurrences > 0
        ? Math.round((data.count / totalMoodOccurrences) * 100)
        : 0,
      phaseDistribution: {
        menstrual: data.phaseCounts.menstrual,
        follicular: data.phaseCounts.follicular,
        ovulatory: data.phaseCounts.ovulatory,
        luteal: data.phaseCounts.luteal,
      },
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get cycle trend data for charting
 */
export function getCycleTrendData(periods: PeriodHistoryItem[]): CycleTrendData[] {
  return periods
    .filter(p => p.cycleLength !== undefined)
    .map(p => ({
      date: p.startDate,
      cycleLength: p.cycleLength!,
      periodDuration: p.duration,
    }))
    .reverse(); // Oldest first for chart
}

/**
 * Get period duration trend data
 */
export function getPeriodDurationTrend(periods: PeriodHistoryItem[]): CycleTrendData[] {
  return periods
    .map(p => ({
      date: p.startDate,
      cycleLength: 0, // Not used for period duration chart
      periodDuration: p.duration,
    }))
    .reverse(); // Oldest first for chart
}
