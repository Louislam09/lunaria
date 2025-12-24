import { format, differenceInDays, startOfDay, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: Date | undefined | null, formatType: 'short' | 'long' = 'short'): string {
  if (!date || !isValid(date)) return '-';

  if (formatType === 'short') {
    return format(date, 'd MMM', { locale: es });
  }

  return format(date, 'EEEE, d \'de\' MMMM', { locale: es });
}

export function getDayOfCycle(lastPeriodStart: Date): number {
  const today = startOfDay(new Date());
  const lastPeriod = startOfDay(lastPeriodStart);

  return differenceInDays(today, lastPeriod) + 1;
}

export function getDaysUntil(date: Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(date);

  return differenceInDays(target, today);
}

