import type { Appointment } from '@/types/appointment';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Formata Date para UTC no padrão ICS: YYYYMMDDTHHMMSSZ */
function toIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildAppointmentsIcs(
  appointments: Appointment[],
  calendarName = 'Agendamento Odontológico',
): string {
  const now = toIcsUtc(new Date());
  const events = appointments
    .filter((item) => item.status !== 'CANCELLED')
    .map((appointment) => {
      const start = new Date(appointment.startAt);
      const end = new Date(appointment.endAt);
      const team =
        appointment.participants
          ?.map((item) => item.professional?.name)
          .filter(Boolean)
          .join(', ') || '';
      const summary = escapeIcsText(
        `Consulta: ${appointment.patient?.name ?? 'Paciente'}`,
      );
      const description = escapeIcsText(
        [
          `Situação: ${appointment.status}`,
          team ? `Equipe: ${team}` : '',
          appointment.notes ? `Obs: ${appointment.notes}` : '',
        ]
          .filter(Boolean)
          .join('\\n'),
      );

      return [
        'BEGIN:VEVENT',
        `UID:${appointment.id}@agendamento`,
        `DTSTAMP:${now}`,
        `DTSTART:${toIcsUtc(start)}`,
        `DTEND:${toIcsUtc(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agendamento Odontologico//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    events,
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Abre o Google Calendar com o primeiro evento (útil em mobile). */
export function openGoogleCalendarEvent(appointment: Appointment): void {
  const start = toIcsUtc(new Date(appointment.startAt));
  const end = toIcsUtc(new Date(appointment.endAt));
  const text = encodeURIComponent(
    `Consulta: ${appointment.patient?.name ?? 'Paciente'}`,
  );
  const details = encodeURIComponent(appointment.notes ?? '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
