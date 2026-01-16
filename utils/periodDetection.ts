import { DailyLogsService } from '@/services/dataService';

export type ActivePeriod = {
  startDate: string;
  endDate: string;
  lastFlowDate: string;
  isActive: boolean;
  isComplete?: boolean;
  suggestedEndDate?: string;
};

export type PeriodFromLogs = {
  startDate: string;
  endDate: string;
  isComplete: boolean;
  suggestedEndDate: string;
};

/**
 * Valida si un flujo indica periodo activo
 * Excluye "pre-periodo" y valores vacíos
 */
function isValidPeriodFlow(flow: string | null | undefined): boolean {
  if (!flow) return false;
  const flowLower = flow.toLowerCase();
  return flowLower === 'leve' || 
         flowLower === 'medio' || 
         flowLower === 'alto' || 
         flowLower === 'mancha' ||
         flowLower === 'abundante';
}

/**
 * Detecta un periodo desde los logs diarios a partir de una fecha de inicio
 * Escanea TODOS los datos de flujo, no limitado por la longitud predicha
 * Maneja períodos más largos que los predichos: continúa escaneando hasta 2+ días consecutivos sin flujo
 */
export async function getPeriodFromLogs(
  userId: string,
  startDate: Date
): Promise<PeriodFromLogs | null> {
  try {
    const allLogs = await DailyLogsService.getAll(userId);
    
    if (!allLogs || allLogs.length === 0) {
      return null;
    }

    const startDateNormalized = new Date(startDate);
    startDateNormalized.setHours(0, 0, 0, 0);

    // Filtrar logs desde startDate hasta hoy
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const relevantLogs = allLogs
      .filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate >= startDateNormalized && logDate <= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (relevantLogs.length === 0) {
      return null;
    }

    // Encontrar secuencia de días con flujo
    const periodDays: Array<{ date: string; flow: string }> = [];
    let lastFlowDate: string | null = null;
    let consecutiveDaysWithoutFlow = 0;

    for (let i = 0; i < relevantLogs.length; i++) {
      const log = relevantLogs[i];
      const hasFlow = isValidPeriodFlow(log.flow);

      if (hasFlow) {
        periodDays.push({ date: log.date, flow: log.flow });
        lastFlowDate = log.date;
        consecutiveDaysWithoutFlow = 0;
      } else {
        consecutiveDaysWithoutFlow++;
        // Si hay 2+ días consecutivos sin flujo, el periodo ha terminado
        if (consecutiveDaysWithoutFlow >= 2 && lastFlowDate) {
          break;
        }
      }
    }

    if (periodDays.length === 0 || !lastFlowDate) {
      return null;
    }

    const startDateStr = periodDays[0].date;
    const endDateStr = lastFlowDate;
    const isComplete = consecutiveDaysWithoutFlow >= 2;

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      isComplete,
      suggestedEndDate: endDateStr,
    };
  } catch (error) {
    console.error('Error detecting period from logs:', error);
    return null;
  }
}

/**
 * Detecta si hay un periodo activo basado en los logs diarios
 * Un periodo activo es una secuencia de días con flujo donde:
 * - Hay días consecutivos con flujo (máximo 1 día sin flujo entre días con flujo)
 * - El último día con flujo es reciente (dentro de los últimos 7 días)
 */
export async function getActivePeriod(
  userId: string,
  lastPeriodStart: Date
): Promise<ActivePeriod | null> {
  try {
    // Usar getPeriodFromLogs para detectar el periodo actual
    const period = await getPeriodFromLogs(userId, lastPeriodStart);
    
    if (!period) {
      return null;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Verificar si el periodo es activo (último flujo dentro de últimos 7 días)
    const lastFlowDateObj = new Date(period.endDate);
    lastFlowDateObj.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const isActive = lastFlowDateObj >= sevenDaysAgo;

    return {
      startDate: period.startDate,
      endDate: period.endDate,
      lastFlowDate: period.endDate,
      isActive,
      isComplete: period.isComplete,
      suggestedEndDate: period.suggestedEndDate,
    };
  } catch (error) {
    console.error('Error detecting active period:', error);
    return null;
  }
}

