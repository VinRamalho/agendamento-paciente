import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types/appointment';

export const AGENDA_START_HOUR = 8;
export const AGENDA_END_HOUR = 20;
export const PX_PER_MINUTE = 1.2;

export type AgendaViewMode = 'day' | 'week';

export function getDayHours(): number[] {
  const hours: number[] = [];
  for (let hour = AGENDA_START_HOUR; hour <= AGENDA_END_HOUR; hour += 1) {
    hours.push(hour);
  }
  return hours;
}

export function getAgendaRange(
  anchorDate: Date,
  mode: AgendaViewMode,
): { start: Date; end: Date; days: Date[] } {
  if (mode === 'day') {
    return { start: anchorDate, end: anchorDate, days: [anchorDate] };
  }

  const start = startOfWeek(anchorDate, { weekStartsOn: 0 });
  const end = endOfWeek(anchorDate, { weekStartsOn: 0 });
  return {
    start,
    end,
    days: eachDayOfInterval({ start, end }),
  };
}

export function formatAgendaTitle(anchorDate: Date, mode: AgendaViewMode): string {
  if (mode === 'day') {
    return format(anchorDate, "EEEE, dd 'de' MMMM yyyy", { locale: ptBR });
  }
  const { start, end } = getAgendaRange(anchorDate, mode);
  return `${format(start, 'dd/MM', { locale: ptBR })} — ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
}

export function minutesFromAgendaStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() - AGENDA_START_HOUR * 60;
}

export function agendaTotalMinutes(): number {
  return (AGENDA_END_HOUR - AGENDA_START_HOUR) * 60;
}

export function appointmentLayout(appointment: Appointment): {
  top: number;
  height: number;
} | null {
  const start = parseISO(appointment.startAt);
  const end = parseISO(appointment.endAt);
  const startMinutes = minutesFromAgendaStart(start);
  const endMinutes = minutesFromAgendaStart(end);
  const total = agendaTotalMinutes();

  if (endMinutes <= 0 || startMinutes >= total) {
    return null;
  }

  const clampedStart = Math.max(0, startMinutes);
  const clampedEnd = Math.min(total, endMinutes);
  const duration = Math.max(20, clampedEnd - clampedStart);

  return {
    top: clampedStart * PX_PER_MINUTE,
    height: duration * PX_PER_MINUTE,
  };
}

export function appointmentsForDay(
  appointments: Appointment[],
  day: Date,
): Appointment[] {
  return appointments.filter((item) => {
    if (item.status === 'CANCELLED') {
      return false;
    }
    return isSameDay(parseISO(item.startAt), day);
  });
}

export function shiftAnchor(
  anchorDate: Date,
  mode: AgendaViewMode,
  direction: -1 | 1,
): Date {
  return addDays(anchorDate, mode === 'day' ? direction : direction * 7);
}

export function slotFromClick(
  day: Date,
  offsetY: number,
): { date: string; startTime: string } {
  const total = agendaTotalMinutes();
  const minutes = Math.max(
    0,
    Math.min(total - 15, Math.round(offsetY / PX_PER_MINUTE / 15) * 15),
  );
  const hour = AGENDA_START_HOUR + Math.floor(minutes / 60);
  const minute = minutes % 60;

  return {
    date: format(day, 'yyyy-MM-dd'),
    startTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

export function isDateTimeInPast(date: string, startTime: string): boolean {
  const candidate = new Date(`${date}T${startTime}:00`);
  if (Number.isNaN(candidate.getTime())) {
    return false;
  }
  return candidate.getTime() < Date.now() - 60_000;
}

/** Altura em px da faixa já passada no dia (para sombrear o calendário). */
export function pastOverlayHeight(day: Date): number {
  const now = new Date();
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  if (now < dayStart) {
    return 0;
  }

  if (now > dayEnd) {
    return agendaTotalMinutes() * PX_PER_MINUTE;
  }

  const minutes = minutesFromAgendaStart(now);
  if (minutes <= 0) {
    return 0;
  }

  return Math.min(agendaTotalMinutes(), minutes) * PX_PER_MINUTE;
}
