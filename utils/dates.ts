import { format, differenceInDays, startOfDay, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export enum FormatType {
  short = 'short',
  long = 'long',
  full = 'full',
  birthday = 'birthday', // d/MM/yyyy
}

export function formatDate(date: Date | undefined | null, formatType: keyof typeof FormatType = 'short'): string {
  if (!date || !isValid(date)) return '-';

  if (formatType === FormatType.short) {
    return format(date, 'd MMM', { locale: es });
  }

  if (formatType === FormatType.long) {
    return format(date, 'EEEE, d \'de\' MMMM', { locale: es });
  }

  if (formatType === FormatType.full) {
    return format(date, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es });
  }

  if (formatType === FormatType.birthday) {
    return format(date, 'd MMM yyyy', { locale: es });
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

