import { differenceInDays } from 'date-fns';
import { getCyclePhase } from './predictions';

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

export interface SymptomPattern {
  symptom: string;
  timing: 'before' | 'during' | 'after';
  daysOffset: number; // Days before/after period start (negative = before, positive = after)
  frequency: number; // How many times this pattern occurred
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

export interface PhaseCorrelation {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  symptom: string;
  occurrenceRate: number; // Percentage of times symptom occurs in this phase
  count: number;
  totalDaysInPhase: number;
}

/**
 * Detect symptom patterns relative to period start
 */
export function detectSymptomPatterns(
  logs: DailyLog[],
  cycles: Cycle[],
  lastPeriodStart: Date,
  cycleLength: number = 28
): SymptomPattern[] {
  const patterns: SymptomPattern[] = [];
  const symptomTimingMap = new Map<string, number[]>();

  // Create a map of period start dates
  const periodStarts = cycles
    .filter(c => c.start_date)
    .map(c => new Date(c.start_date))
    .sort((a, b) => a.getTime() - b.getTime());

  // If no cycles, use lastPeriodStart as reference
  if (periodStarts.length === 0) {
    periodStarts.push(new Date(lastPeriodStart));
  }

  // Analyze each log entry
  logs.forEach(log => {
    if (!log.symptoms || log.symptoms.length === 0) return;

    const logDate = new Date(log.date);
    
    // Find the closest period start (before this log date)
    const relevantPeriodStart = periodStarts
      .filter(ps => ps <= logDate)
      .pop();

    if (!relevantPeriodStart) return;

    const daysFromPeriod = differenceInDays(logDate, relevantPeriodStart);

    // Track symptom timing
    log.symptoms.forEach(symptom => {
      const normalizedSymptom = symptom.toLowerCase().trim();
      
      if (!symptomTimingMap.has(normalizedSymptom)) {
        symptomTimingMap.set(normalizedSymptom, []);
      }

      symptomTimingMap.get(normalizedSymptom)!.push(daysFromPeriod);
    });
  });

  // Analyze patterns for each symptom
  symptomTimingMap.forEach((timings, symptom) => {
    if (timings.length < 2) return; // Need at least 2 occurrences

    // Group timings into ranges
    const beforePeriod = timings.filter(t => t < 0);
    const duringPeriod = timings.filter(t => t >= 0 && t <= 5);
    const afterPeriod = timings.filter(t => t > 5);

    // Find most common timing pattern
    let mostCommonTiming: 'before' | 'during' | 'after' | null = null;
    let mostCommonCount = 0;
    let mostCommonOffset = 0;

    // Check "before period" pattern
    if (beforePeriod.length >= 2) {
      // Find most common day offset before period
      const offsetCounts = new Map<number, number>();
      beforePeriod.forEach(offset => {
        offsetCounts.set(offset, (offsetCounts.get(offset) || 0) + 1);
      });

      const maxCount = Math.max(...Array.from(offsetCounts.values()));
      if (maxCount >= 2 && maxCount > mostCommonCount) {
        mostCommonTiming = 'before';
        mostCommonCount = maxCount;
        const mostCommonOffsetEntry = Array.from(offsetCounts.entries())
          .find(([_, count]) => count === maxCount);
        mostCommonOffset = mostCommonOffsetEntry?.[0] || 0;
      }
    }

    // Check "during period" pattern
    if (duringPeriod.length >= 2 && duringPeriod.length > mostCommonCount) {
      mostCommonTiming = 'during';
      mostCommonCount = duringPeriod.length;
      mostCommonOffset = 0; // During period start
    }

    // Check "after period" pattern
    if (afterPeriod.length >= 2) {
      const offsetCounts = new Map<number, number>();
      afterPeriod.forEach(offset => {
        offsetCounts.set(offset, (offsetCounts.get(offset) || 0) + 1);
      });

      const maxCount = Math.max(...Array.from(offsetCounts.values()));
      if (maxCount >= 2 && maxCount > mostCommonCount) {
        mostCommonTiming = 'after';
        mostCommonCount = maxCount;
        const mostCommonOffsetEntry = Array.from(offsetCounts.entries())
          .find(([_, count]) => count === maxCount);
        mostCommonOffset = mostCommonOffsetEntry?.[0] || 0;
      }
    }

    if (mostCommonTiming && mostCommonCount >= 2) {
      // Calculate confidence based on frequency
      const totalOccurrences = timings.length;
      const patternRatio = mostCommonCount / totalOccurrences;
      
      let confidence: 'high' | 'medium' | 'low';
      if (patternRatio >= 0.7 && mostCommonCount >= 3) {
        confidence = 'high';
      } else if (patternRatio >= 0.5 && mostCommonCount >= 2) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      // Generate description
      let description = '';
      if (mostCommonTiming === 'before') {
        const daysBefore = Math.abs(mostCommonOffset);
        description = `Tienes ${symptom} ${daysBefore} día${daysBefore > 1 ? 's' : ''} antes de tu periodo`;
      } else if (mostCommonTiming === 'during') {
        description = `Tienes ${symptom} durante tu periodo`;
      } else {
        description = `Tienes ${symptom} ${mostCommonOffset} día${mostCommonOffset > 1 ? 's' : ''} después de tu periodo`;
      }

      patterns.push({
        symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
        timing: mostCommonTiming,
        daysOffset: mostCommonOffset,
        frequency: mostCommonCount,
        confidence,
        description,
      });
    }
  });

  // Sort by confidence and frequency
  return patterns.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    }
    return b.frequency - a.frequency;
  });
}

/**
 * Calculate symptom correlation with cycle phases
 */
export function calculatePhaseCorrelations(
  logs: DailyLog[],
  lastPeriodStart: Date,
  cycleLength: number = 28
): PhaseCorrelation[] {
  const correlations: PhaseCorrelation[] = [];
  const phaseSymptomMap = new Map<string, Map<string, number>>();
  const phaseDayCounts = new Map<string, number>();

  // Initialize phase maps
  const phases: Array<'menstrual' | 'follicular' | 'ovulatory' | 'luteal'> = 
    ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  
  phases.forEach(phase => {
    phaseSymptomMap.set(phase, new Map());
    phaseDayCounts.set(phase, 0);
  });

  // Count symptoms by phase
  logs.forEach(log => {
    const logDate = new Date(log.date);
    const cycleDay = Math.floor((logDate.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const phase = getCyclePhase(cycleDay, cycleLength);

    phaseDayCounts.set(phase, (phaseDayCounts.get(phase) || 0) + 1);

    if (log.symptoms && log.symptoms.length > 0) {
      log.symptoms.forEach(symptom => {
        const normalizedSymptom = symptom.toLowerCase().trim();
        const symptomMap = phaseSymptomMap.get(phase)!;
        symptomMap.set(normalizedSymptom, (symptomMap.get(normalizedSymptom) || 0) + 1);
      });
    }
  });

  // Calculate correlations
  phases.forEach(phase => {
    const symptomMap = phaseSymptomMap.get(phase)!;
    const totalDays = phaseDayCounts.get(phase) || 1;

    symptomMap.forEach((count, symptom) => {
      const occurrenceRate = (count / totalDays) * 100;

      // Only include if symptom occurs in at least 20% of days in this phase
      if (occurrenceRate >= 20) {
        correlations.push({
          phase,
          symptom: symptom.charAt(0).toUpperCase() + symptom.slice(1),
          occurrenceRate: Math.round(occurrenceRate * 10) / 10,
          count,
          totalDaysInPhase: totalDays,
        });
      }
    });
  });

  // Sort by occurrence rate
  return correlations.sort((a, b) => b.occurrenceRate - a.occurrenceRate);
}
