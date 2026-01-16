export type PredictionInput = {
  lastPeriodStart: Date;
  lastPeriodEnd?: Date;
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
  const { lastPeriodStart, lastPeriodEnd, cycleType, averageCycleLength, cycleRangeMin, cycleRangeMax } = input;

  // Si lastPeriodEnd existe, usar la longitud real del ciclo para la predicción
  let actualCycleLength: number | undefined;
  let baseDate = lastPeriodStart;

  if (lastPeriodEnd) {
    const start = new Date(lastPeriodStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(lastPeriodEnd);
    end.setHours(0, 0, 0, 0);
    
    // Calcular longitud real del ciclo: días entre inicio y fin + 1
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    actualCycleLength = diffDays + 1;
    
    // Usar lastPeriodEnd como base para la siguiente predicción
    baseDate = lastPeriodEnd;
  }

  if (cycleType === 'regular') {
    // Usar longitud real del ciclo si está disponible, sino usar averageCycleLength
    const cycleLength = actualCycleLength || averageCycleLength;
    
    if (cycleLength) {
      const nextPeriod = new Date(baseDate);
      nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

      return {
        date: nextPeriod,
        precision: actualCycleLength ? 'high' : 'high',
      };
    }
  } else if (cycleType === 'irregular' && cycleRangeMin && cycleRangeMax) {
    // Si tenemos longitud real, ajustar el rango basado en ella
    let minDays = cycleRangeMin;
    let maxDays = cycleRangeMax;
    
    if (actualCycleLength) {
      // Ajustar rango basado en longitud real (±20% del ciclo real)
      const variance = Math.max(2, Math.round(actualCycleLength * 0.2));
      minDays = Math.max(cycleRangeMin, actualCycleLength - variance);
      maxDays = Math.min(cycleRangeMax, actualCycleLength + variance);
    }

    const minDate = new Date(baseDate);
    minDate.setDate(minDate.getDate() + minDays);

    const maxDate = new Date(baseDate);
    maxDate.setDate(maxDate.getDate() + maxDays);

    // Para irregular, usar el promedio del rango como fecha estimada
    const avgDays = Math.round((minDays + maxDays) / 2);
    const estimatedDate = new Date(baseDate);
    estimatedDate.setDate(estimatedDate.getDate() + avgDays);

    return {
      date: estimatedDate,
      range: { start: minDate, end: maxDate },
      precision: actualCycleLength ? 'high' : 'low',
    };
  }

  // Fallback: usar 28 días si no hay datos, o longitud real si está disponible
  const fallbackDays = actualCycleLength || 28;
  const fallbackDate = new Date(baseDate);
  fallbackDate.setDate(fallbackDate.getDate() + fallbackDays);

  return {
    date: fallbackDate,
    precision: actualCycleLength ? 'high' : 'low',
  };
}

/**
 * Calcula el día actual del ciclo
 */
export function getCycleDay(lastPeriodStart: Date, today: Date = new Date(), lastPeriodEnd?: Date): number {
  const todayNormalized = new Date(today);
  todayNormalized.setHours(0, 0, 0, 0);

  let baseDate = new Date(lastPeriodStart);
  baseDate.setHours(0, 0, 0, 0);

  // Si lastPeriodEnd existe y hoy es después del fin del periodo, calcular desde el fin
  if (lastPeriodEnd) {
    const endDate = new Date(lastPeriodEnd);
    endDate.setHours(0, 0, 0, 0);
    
    if (todayNormalized > endDate) {
      baseDate = endDate;
    }
  }

  const diffTime = todayNormalized.getTime() - baseDate.getTime();
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
