export interface CyclePrediction {
  nextPeriod: Date;
  ovulation: Date;
  fertileWindow: { start: Date; end: Date };
  daysUntilPeriod: number;
  accuracy: 'high' | 'medium' | 'low';
}

export function calculateNextPeriod(
  lastPeriodStart: Date,
  averageCycleLength: number,
  cycleType: 'regular' | 'irregular',
  hasPCOS: boolean = false,
  cycleHistory: Date[] = []
): CyclePrediction {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextPeriod = new Date(lastPeriodStart);
  nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);
  
  let accuracy: 'high' | 'medium' | 'low' = 'high';
  
  // Adjust for irregular cycles
  if (cycleType === 'irregular' || hasPCOS) {
    accuracy = 'low';
    // Use average of last 3 cycles if available
    if (cycleHistory.length >= 3) {
      const lengths: number[] = [];
      for (let i = 1; i < cycleHistory.length; i++) {
        const diff = cycleHistory[i].getTime() - cycleHistory[i - 1].getTime();
        lengths.push(Math.round(diff / (1000 * 60 * 60 * 24)));
      }
      const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      nextPeriod = new Date(lastPeriodStart);
      nextPeriod.setDate(nextPeriod.getDate() + avgLength);
      accuracy = 'medium';
    }
  }
  
  // Calculate ovulation (typically 14 days before period)
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(ovulation.getDate() - 14);
  
  // Fertile window: 4 days before and 1 day after ovulation
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 4);
  
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  const daysUntilPeriod = Math.ceil(
    (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    nextPeriod,
    ovulation,
    fertileWindow: { start: fertileStart, end: fertileEnd },
    daysUntilPeriod,
    accuracy,
  };
}

export function getCyclePhase(dayOfCycle: number, cycleLength: number = 28): string {
  if (dayOfCycle <= 5) return 'Menstruación';
  if (dayOfCycle <= 13) return 'Fase Folicular';
  if (dayOfCycle === 14) return 'Ovulación';
  if (dayOfCycle <= 21) return 'Fase Lútea Temprana';
  return 'Fase Lútea';
}

