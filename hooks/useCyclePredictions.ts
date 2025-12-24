import { useMemo } from 'react';
import { getDaysUntil } from '@/utils/dates';
import { getCycleDay, getCyclePhase, getFertileWindow, getNextPeriodDate } from '@/utils/predictions';
import { OnboardingData } from '@/context/OnboardingContext';

export function useCyclePredictions(data: Partial<OnboardingData>) {
  // Prepare prediction input
  const predictionInput = useMemo(() => ({
    lastPeriodStart: data.lastPeriodStart!,
    cycleType: data.cycleType!,
    averageCycleLength: data.averageCycleLength,
    cycleRangeMin: data.cycleRangeMin,
    cycleRangeMax: data.cycleRangeMax,
    periodLength: data.periodLength!,
  }), [
    data.lastPeriodStart,
    data.cycleType,
    data.averageCycleLength,
    data.cycleRangeMin,
    data.cycleRangeMax,
    data.periodLength,
  ]);

  // Get predictions
  const nextPeriodResult = useMemo(() => getNextPeriodDate(predictionInput), [predictionInput]);
  const cycleDay = useMemo(() => getCycleDay(data.lastPeriodStart!), [data.lastPeriodStart]);
  
  const cycleLength = useMemo(() => {
    if (data.cycleType === 'regular' && data.averageCycleLength) {
      return data.averageCycleLength;
    }
    if (data.cycleRangeMin && data.cycleRangeMax) {
      return Math.round((data.cycleRangeMin + data.cycleRangeMax) / 2);
    }
    return 28; // fallback
  }, [data.cycleType, data.averageCycleLength, data.cycleRangeMin, data.cycleRangeMax]);

  const phase = useMemo(() => getCyclePhase(cycleDay, cycleLength), [cycleDay, cycleLength]);
  
  const fertileWindow = useMemo(() => {
    if (data.cycleType === 'regular' && data.averageCycleLength) {
      return getFertileWindow(data.averageCycleLength);
    }
    return null;
  }, [data.cycleType, data.averageCycleLength]);

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
        return { level: 'indeterminado', label: 'No determinado', color: 'gray' };
      }
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'high', label: 'Alto', color: 'red' };
      }
      if (phase === 'ovulatory') {
        return { level: 'high', label: 'Alto', color: 'red' };
      }
      if (phase === 'luteal' && cycleDay < cycleLength - 7) {
        return { level: 'medium', label: 'Medio', color: 'orange' };
      }
      return { level: 'low', label: 'Bajo', color: 'green' };
    } else if (data.wantsPregnancy === true) {
      if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
        return { level: 'fertile', label: 'Ventana fértil', color: 'purple' };
      }
      return { level: 'normal', label: 'Normal', color: 'blue' };
    }
    return { level: 'low', label: 'Bajo', color: 'green' };
  }, [data.wantsPregnancy, data.cycleType, fertileWindow, cycleDay, phase, cycleLength]);

  return {
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

