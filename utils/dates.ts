export function formatDate(date: Date | undefined | null, format: 'short' | 'long' = 'short'): string {
  if (!date) return '-';

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];

  if (format === 'short') {
    return `${day} ${month.substring(0, 3)}`;
  }

  return `${dayName}, ${day} de ${month}`;
}

export function getDayOfCycle(lastPeriodStart: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastPeriod = new Date(lastPeriodStart);
  lastPeriod.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastPeriod.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

