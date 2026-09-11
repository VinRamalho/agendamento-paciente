import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const APP_TIMEZONE = 'America/Sao_Paulo';

/**
 * Interpreta data (YYYY-MM-DD) + horário (HH:mm) no fuso America/Sao_Paulo
 * e devolve um Date em UTC equivalente.
 */
export function buildDateTimeInAppTimezone(date: string, time: string): Date {
  const normalizedDate = date.slice(0, 10);
  const localDateTime = `${normalizedDate}T${time}:00`;
  return fromZonedTime(localDateTime, APP_TIMEZONE);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function startOfDayInAppTimezone(date: string): Date {
  return buildDateTimeInAppTimezone(date, '00:00');
}

export function endOfDayInAppTimezone(date: string): Date {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDayStr = next.toISOString().slice(0, 10);
  return buildDateTimeInAppTimezone(nextDayStr, '00:00');
}

export function formatDateInAppTimezone(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, 'yyyy-MM-dd');
}

export function formatTimeInAppTimezone(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, 'HH:mm');
}

export { APP_TIMEZONE };
