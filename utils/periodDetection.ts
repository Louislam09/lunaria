import { DailyLogsService } from '@/services/dataService';

export type ActivePeriod = {
  startDate: string;
  endDate: string;
  lastFlowDate: string;
  isActive: boolean;
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
    // Obtener todos los logs del usuario
    const allLogs = await DailyLogsService.getAll(userId);
    
    if (!allLogs || allLogs.length === 0) {
      return null;
    }

    // Filtrar logs desde lastPeriodStart hasta hoy
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const lastPeriodStartDate = new Date(lastPeriodStart);
    lastPeriodStartDate.setHours(0, 0, 0, 0);

    const relevantLogs = allLogs
      .filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate >= lastPeriodStartDate && logDate <= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (relevantLogs.length === 0) {
      return null;
    }

    // Encontrar secuencia de días con flujo
    const periodDays: Array<{ date: string; flow: string }> = [];
    let currentSequenceStart: string | null = null;
    let lastFlowDate: string | null = null;

    for (let i = 0; i < relevantLogs.length; i++) {
      const log = relevantLogs[i];
      const hasFlow = isValidPeriodFlow(log.flow);

      if (hasFlow) {
        if (!currentSequenceStart) {
          currentSequenceStart = log.date;
        }
        periodDays.push({ date: log.date, flow: log.flow });
        lastFlowDate = log.date;
      } else {
        // Si hay un día sin flujo, verificar si la secuencia continúa
        // Solo romper la secuencia si hay más de 1 día consecutivo sin flujo
        if (currentSequenceStart && i < relevantLogs.length - 1) {
          const nextLog = relevantLogs[i + 1];
          const nextHasFlow = isValidPeriodFlow(nextLog.flow);
          
          if (!nextHasFlow) {
            // Hay 2 días consecutivos sin flujo, terminar secuencia
            currentSequenceStart = null;
          }
        }
      }
    }

    if (periodDays.length === 0 || !lastFlowDate) {
      return null;
    }

    // Verificar si el periodo es activo (último flujo dentro de últimos 7 días)
    const lastFlowDateObj = new Date(lastFlowDate);
    lastFlowDateObj.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const isActive = lastFlowDateObj >= sevenDaysAgo;

    if (!isActive) {
      return null;
    }

    const startDate = periodDays[0].date;
    const endDate = lastFlowDate;

    return {
      startDate,
      endDate,
      lastFlowDate,
      isActive: true,
    };
  } catch (error) {
    console.error('Error detecting active period:', error);
    return null;
  }
}

