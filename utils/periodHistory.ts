import { differenceInDays } from 'date-fns';

export interface PeriodHistoryItem {
  startDate: string;
  endDate: string;
  duration: number; // period duration in days
  cycleLength?: number; // days between this period and next
  delay?: number; // delay in days if any
  month: string; // formatted "Month Year"
}

interface DailyLog {
  id: string;
  date: string;
  symptoms: string[];
  flow: string;
  mood: string;
  notes: string;
  synced: boolean;
  updated_at: string;
}

interface Cycle {
  id: string;
  start_date: string;
  end_date: string | null;
  delay: number;
  synced: boolean;
}

/**
 * Detects all periods from daily logs and calculates period/cycle information
 * @param logs - All daily logs for the user
 * @param cycles - All cycle records for the user
 * @param averageCycleLength - Average cycle length from user profile
 * @param lastPeriodStart - Last period start date from onboarding data
 * @returns Array of all detected periods with details
 */
export function getAllPeriods(
  logs: DailyLog[],
  cycles: Cycle[],
  averageCycleLength: number = 28,
  lastPeriodStart?: Date
): PeriodHistoryItem[] {
  // Create a map of cycles by start date for quick lookup
  const cyclesMap = new Map<string, { delay: number }>();
  cycles.forEach(cycle => {
    if (cycle.delay > 0) {
      cyclesMap.set(cycle.start_date, { delay: cycle.delay });
    }
  });

  // Filter logs with flow (period days) and sort by date
  const periodLogs = logs
    .filter(log => {
      const flow = log.flow?.toLowerCase();
      return flow && (flow === 'leve' || flow === 'ligero' || flow === 'medio' || flow === 'alto' || flow === 'abundante');
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (periodLogs.length === 0) {
    return [];
  }

  // Find period starts (first day of each period - gaps > 2 days indicate new period)
  const periodStarts: Array<{ date: string; endDate: string }> = [];
  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null = null;

  for (let i = 0; i < periodLogs.length; i++) {
    const logDate = periodLogs[i].date;

    if (!currentPeriodStart) {
      currentPeriodStart = logDate;
      currentPeriodEnd = logDate;
    } else {
      const prevDate = periodLogs[i - 1].date;
      const daysDiff = differenceInDays(new Date(logDate), new Date(prevDate));

      if (daysDiff > 2) {
        // Save previous period
        if (currentPeriodStart && currentPeriodEnd) {
          periodStarts.push({
            date: currentPeriodStart,
            endDate: currentPeriodEnd
          });
        }
        // Start new period
        currentPeriodStart = logDate;
        currentPeriodEnd = logDate;
      } else {
        currentPeriodEnd = logDate;
      }
    }
  }

  // Add last period
  if (currentPeriodStart && currentPeriodEnd) {
    periodStarts.push({
      date: currentPeriodStart,
      endDate: currentPeriodEnd
    });
  }

  if (periodStarts.length === 0) {
    return [];
  }

  // Create period history from all periods (newest first)
  const periodsHistory: PeriodHistoryItem[] = [];
  const sortedPeriods = [...periodStarts].reverse(); // Most recent first

  for (let i = 0; i < sortedPeriods.length; i++) {
    const period = sortedPeriods[i];
    const startDate = new Date(period.date);
    const startDateStr = period.date;
    const endDate = new Date(period.endDate);

    // Calculate period duration (end date - start date + 1 to include both days)
    const periodDuration = differenceInDays(endDate, startDate) + 1;

    // Calculate cycle length (days between this period start and next period start)
    let cycleLength: number | undefined = undefined;
    if (i < sortedPeriods.length - 1) {
      const nextPeriodStart = new Date(sortedPeriods[i + 1].date);
      cycleLength = differenceInDays(startDate, nextPeriodStart);
    } else if (lastPeriodStart) {
      // For the most recent period, calculate from lastPeriodStart if available
      const lastPeriod = new Date(lastPeriodStart);
      const calculatedCycle = differenceInDays(startDate, lastPeriod);
      if (calculatedCycle > 0 && calculatedCycle < 60) { // Reasonable cycle length
        cycleLength = calculatedCycle;
      }
    }

    // If no cycle length calculated, use average if it's not the most recent period
    if (cycleLength === undefined && i < sortedPeriods.length - 1) {
      cycleLength = averageCycleLength;
    }

    // Check if this cycle had a delay
    const cycleDelay = cyclesMap.get(startDateStr)?.delay || 0;

    const monthName = startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    periodsHistory.push({
      startDate: period.date,
      endDate: period.endDate,
      duration: periodDuration,
      cycleLength: cycleLength && cycleLength > 0 ? cycleLength : undefined,
      delay: cycleDelay > 0 ? cycleDelay : undefined,
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1)
    });
  }

  return periodsHistory;
}
