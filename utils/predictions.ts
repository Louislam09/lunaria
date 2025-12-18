export type PredictionInput = {
  lastPeriodStart: Date;
  cycleType: 'regular' | 'irregular';
  averageCycleLength?: number;
  cycleRangeMin?: number;
  cycleRangeMax?: number;
  periodLength: number;
};

export type NextPeriodResult = {
  date: Date;
  range?: { start: Date; end: Date };
  precision: 'high' | 'low';
};

/**
 * Calcula la fecha del próximo período
 */
export function getNextPeriodDate(input: PredictionInput): NextPeriodResult {
  const { lastPeriodStart, cycleType, averageCycleLength, cycleRangeMin, cycleRangeMax } = input;

  if (cycleType === 'regular' && averageCycleLength) {
    // Regular: fecha exacta
    const nextPeriod = new Date(lastPeriodStart);
    nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);

    return {
      date: nextPeriod,
      precision: 'high',
    };
  } else if (cycleType === 'irregular' && cycleRangeMin && cycleRangeMax) {
    // Irregular: rango
    const minDate = new Date(lastPeriodStart);
    minDate.setDate(minDate.getDate() + cycleRangeMin);

    const maxDate = new Date(lastPeriodStart);
    maxDate.setDate(maxDate.getDate() + cycleRangeMax);

    // Para irregular, usar el promedio del rango como fecha estimada
    const avgDays = Math.round((cycleRangeMin + cycleRangeMax) / 2);
    const estimatedDate = new Date(lastPeriodStart);
    estimatedDate.setDate(estimatedDate.getDate() + avgDays);

    return {
      date: estimatedDate,
      range: { start: minDate, end: maxDate },
      precision: 'low',
    };
  }

  // Fallback: usar 28 días si no hay datos
  const fallbackDate = new Date(lastPeriodStart);
  fallbackDate.setDate(fallbackDate.getDate() + 28);

  return {
    date: fallbackDate,
    precision: 'low',
  };
}

/**
 * Calcula el día actual del ciclo
 */
export function getCycleDay(lastPeriodStart: Date, today: Date = new Date()): number {
  const todayNormalized = new Date(today);
  todayNormalized.setHours(0, 0, 0, 0);

  const lastPeriod = new Date(lastPeriodStart);
  lastPeriod.setHours(0, 0, 0, 0);

  const diffTime = todayNormalized.getTime() - lastPeriod.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

/**
 * Determina la fase del ciclo (simplificada MVP)
 */
export function getCyclePhase(
  cycleDay: number,
  cycleLength: number
): 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' {
  const periodLength = 5; // Default, debería venir del input pero simplificamos para MVP

  // Menstrual: día 1 → periodLength
  if (cycleDay <= periodLength) {
    return 'menstrual';
  }

  // Ovulatoria: cycleLength - 14 → cycleLength - 12
  const ovulationStart = cycleLength - 14;
  const ovulationEnd = cycleLength - 12;

  if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) {
    return 'ovulatory';
  }

  // Folicular: después de menstruación hasta ovulación
  if (cycleDay < ovulationStart) {
    return 'follicular';
  }

  // Lútea: resto
  return 'luteal';
}

/**
 * Calcula la ventana fértil (solo para ciclos regulares)
 */
export function getFertileWindow(cycleLength: number): { startDay: number; endDay: number } | null {
  // Solo para ciclos regulares
  // Ventana fértil: 4 días antes de ovulación hasta 1 día después
  // Ovulación típica: 14 días antes del período
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 4;
  const fertileEnd = ovulationDay + 1;

  return {
    startDay: fertileStart,
    endDay: fertileEnd,
  };
}

// Legacy exports for backward compatibility
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

  const input: PredictionInput = {
    lastPeriodStart,
    cycleType,
    averageCycleLength,
    periodLength: 5,
  };

  const nextPeriodResult = getNextPeriodDate(input);
  const nextPeriod = nextPeriodResult.date;

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
    accuracy: nextPeriodResult.precision === 'high' ? 'high' : 'low',
  };
}
