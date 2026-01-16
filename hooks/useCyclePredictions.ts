import { useMemo } from 'react';
import { getDaysUntil } from '@/utils/dates';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate, NextPeriodResult } from '@/utils/predictions';
import { OnboardingData } from '@/context/OnboardingContext';

export type CyclePrediction = {
  // Current cycle data
  lastPeriodStart: Date;

  // Predictions
  nextPeriodResult: NextPeriodResult;
  cycleDay: number;
  cycleLength: number;
  phase: string;
  fertileWindow: { startDay: number; endDay: number };
  daysUntilPeriod: number;
  progress: number;

  // User info
  userName: string;
  greeting: string;

  // Helpers
  getPhaseName: (phase: string) => string;
  getPhaseDescription: (phase: string, day: number) => string;

  // Risk
  pregnancyRisk: { level: string; label: string; color: string, bgColor: string, textColor: string, borderColor: string };
};

export function useCyclePredictions(data: Partial<OnboardingData>): CyclePrediction {
  // Prepare prediction input
  const predictionInput = useMemo(() => ({
    lastPeriodStart: data.lastPeriodStart!,
    lastPeriodEnd: data.lastPeriodEnd,
    cycleType: data.cycleType!,
    averageCycleLength: data.averageCycleLength,
    cycleRangeMin: data.cycleRangeMin,
    cycleRangeMax: data.cycleRangeMax,
    periodLength: data.periodLength!,
  }), [
    data.lastPeriodStart,
    data.lastPeriodEnd,
    data.cycleType,
    data.averageCycleLength,
    data.cycleRangeMin,
    data.cycleRangeMax,
    data.periodLength,
  ]);

  // Get predictions
  const nextPeriodResult = useMemo(() => getNextPeriodDate(predictionInput), [predictionInput]);
  const cycleDay = useMemo(() => getCycleDay(data.lastPeriodStart!, new Date(), data.lastPeriodEnd), [data.lastPeriodStart, data.lastPeriodEnd]);

  const cycleLength = useMemo(() => {
    // Si lastPeriodEnd existe, calcular la longitud real del ciclo
    if (data.lastPeriodStart && data.lastPeriodEnd) {
      const start = new Date(data.lastPeriodStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(data.lastPeriodEnd);
      end.setHours(0, 0, 0, 0);
      
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    
    // Si no hay lastPeriodEnd, usar valores predichos
    if (data.cycleType === 'regular' && data.averageCycleLength) {
      return data.averageCycleLength;
    }
    if (data.cycleRangeMin && data.cycleRangeMax) {
      return Math.round((data.cycleRangeMin + data.cycleRangeMax) / 2);
    }
    return 28; // fallback
  }, [data.lastPeriodStart, data.lastPeriodEnd, data.cycleType, data.averageCycleLength, data.cycleRangeMin, data.cycleRangeMax]);

  const phase = useMemo(() => getCyclePhase(cycleDay, cycleLength), [cycleDay, cycleLength]);

  const fertileWindow = useMemo(() => {
    // Usar cycleLength calculado (que puede ser real o predicho)
    if (data.cycleType === 'regular' && cycleLength) {
      return getFertileWindow(cycleLength);
    }
    return null;
  }, [data.cycleType, cycleLength]);

  // Calculate days until next period
  const daysUntilPeriod = useMemo(() => getDaysUntil(nextPeriodResult.date), [nextPeriodResult.date]);

  // Calculate progress based on cycle position (0-100)
  // Progress increases as we get closer to the next period
  const progress = useMemo(() => {
    return Math.min(100, Math.max(0, ((cycleLength - cycleDay) / cycleLength) * 100));
  }, [cycleDay, cycleLength]);

  // Get user name
  const userName = useMemo(() => data.name || 'Usuario', [data.name]);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  // Get phase name in Spanish
  const getPhaseName = (phase: string) => {
    const phases: Record<string, string> = {
      menstrual: 'Menstruación',
      follicular: 'Fase Folicular',
      ovulatory: 'Ovulación',
      luteal: 'Fase Lútea',
    };
    return phases[phase] || phase;
  };

  // Get phase description
  const getPhaseDescription = (phase: string, day: number) => {
    const descriptions: Record<string, string> = {
      menstrual: 'Tu cuerpo se está limpiando. Descansa y cuídate.',
      follicular: 'Tu energía está aumentando. Es un buen momento para actividades activas.',
      ovulatory: 'Días de máxima fertilidad. Tu energía está en su punto más alto.',
      luteal: 'Tu energía puede disminuir ligeramente. Es normal sentirse más introspectiva.',
    };
    return descriptions[phase] || `Día ${day} del ciclo.`;
  };

  // Calculate pregnancy risk (simplified MVP)
  const pregnancyRisk = useMemo(() => {
    if (data.wantsPregnancy === false) {
      if (data.cycleType === 'irregular') {
        return { level: 'indeterminado', label: 'No determinado', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-500', borderColor: 'border-gray-200' };
      }
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'high', label: 'Alto', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-500', borderColor: 'border-red-200' };
      }
      if (phase === 'ovulatory') {
        return { level: 'high', label: 'Alto', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-500', borderColor: 'border-red-200' };
      }
      if (phase === 'luteal' && cycleDay < cycleLength - 7) {
        return { level: 'medium', label: 'Medio', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-500', borderColor: 'border-orange-100' };
      }
      return { level: 'low', label: 'Bajo', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-500', borderColor: 'border-green-200' };
    } else if (data.wantsPregnancy === true) {
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'fertile', label: 'Ventana fértil', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-500', borderColor: 'border-purple-200' };
      }
      return { level: 'normal', label: 'Normal', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-500', borderColor: 'border-blue-200' };
    }
    return { level: 'low', label: 'Bajo', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-500', borderColor: 'border-green-200' };
  }, [data.wantsPregnancy, data.cycleType, fertileWindow, cycleDay, phase, cycleLength]);

  return {
    // Current cycle data
    lastPeriodStart: data.lastPeriodStart,

    // Predictions
    nextPeriodResult,
    cycleDay,
    cycleLength,
    phase,
    fertileWindow,
    daysUntilPeriod,
    progress,

    // User info
    userName,
    greeting,

    // Helpers
    getPhaseName,
    getPhaseDescription,

    // Risk
    pregnancyRisk,
  };
}

