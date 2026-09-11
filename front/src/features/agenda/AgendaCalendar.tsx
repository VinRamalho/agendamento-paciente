import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types/appointment';
import {
  appointmentStatusClass,
  appointmentStatusLabel,
} from '@/utils/labels';
import {
  AGENDA_START_HOUR,
  PX_PER_MINUTE,
  appointmentLayout,
  appointmentsForDay,
  getDayHours,
  agendaTotalMinutes,
  slotFromClick,
} from './calendar-utils';

type AgendaCalendarProps = {
  days: Date[];
  appointments: Appointment[];
  onSlotClick: (date: string, startTime: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
};

function DayColumn({
  day,
  appointments,
  showDayHeader,
  onSlotClick,
  onAppointmentClick,
}: {
  day: Date;
  appointments: Appointment[];
  showDayHeader: boolean;
  onSlotClick: (date: string, startTime: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const hours = getDayHours();
  const dayAppointments = appointmentsForDay(appointments, day);
  const columnHeight = agendaTotalMinutes() * PX_PER_MINUTE;

  return (
    <div className="min-w-[160px] flex-1">
      {showDayHeader && (
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-2 py-2 text-center">
          <p className="text-xs font-medium uppercase text-slate-500">
            {format(day, 'EEE', { locale: ptBR })}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {format(day, 'dd/MM', { locale: ptBR })}
          </p>
        </div>
      )}

      <div
        className="relative cursor-pointer bg-slate-50/40"
        style={{ height: columnHeight }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const offsetY = event.clientY - bounds.top;
          const slot = slotFromClick(day, offsetY);
          onSlotClick(slot.date, slot.startTime);
        }}
        role="presentation"
      >
        {hours.map((hour) => {
          const top = (hour - AGENDA_START_HOUR) * 60 * PX_PER_MINUTE;
          return (
            <div
              key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
              className="pointer-events-none absolute left-0 right-0 border-t border-slate-200"
              style={{ top }}
            />
          );
        })}

        {dayAppointments.map((appointment) => {
          const layout = appointmentLayout(appointment);
          if (!layout) {
            return null;
          }

          const responsible = appointment.participants?.find(
            (item) => item.participationType === 'RESPONSIBLE',
          )?.professional?.name;

          return (
            <button
              key={appointment.id}
              type="button"
              className={`absolute left-1 right-1 z-20 overflow-hidden rounded-md border px-2 py-1 text-left shadow-sm ${appointmentStatusClass(appointment.status)} border-current/10`}
              style={{ top: layout.top, height: layout.height }}
              onClick={(event) => {
                event.stopPropagation();
                onAppointmentClick(appointment);
              }}
              title={`${appointment.patient?.name ?? 'Paciente'} · ${appointmentStatusLabel[appointment.status]}`}
            >
              <p className="truncate text-xs font-semibold">
                {format(parseISO(appointment.startAt), 'HH:mm')} ·{' '}
                {appointment.patient?.name ?? 'Paciente'}
              </p>
              <p className="truncate text-[11px] opacity-80">
                {appointment.durationMinutes} min
                {responsible ? ` · ${responsible}` : ''}
              </p>
              <p className="truncate text-[11px] opacity-80">
                {appointmentStatusLabel[appointment.status]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaCalendar({
  days,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: AgendaCalendarProps) {
  const hours = getDayHours();
  const columnHeight = agendaTotalMinutes() * PX_PER_MINUTE;
  const isWeek = days.length > 1;

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex ${isWeek ? 'min-w-[900px]' : 'min-w-0'}`}>
        <div className="w-16 shrink-0 border-r border-slate-200 bg-white">
          {isWeek && <div className="h-[52px] border-b border-slate-200" />}
          <div className="relative" style={{ height: columnHeight }}>
            {hours.map((hour) => {
              const top = (hour - AGENDA_START_HOUR) * 60 * PX_PER_MINUTE;
              return (
                <div
                  key={hour}
                  className="absolute right-2 -translate-y-1/2 text-xs text-slate-500"
                  style={{ top }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1">
          {days.map((day) => (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className="flex-1 border-r border-slate-200 last:border-r-0"
            >
              <DayColumn
                day={day}
                appointments={appointments}
                showDayHeader={isWeek}
                onSlotClick={onSlotClick}
                onAppointmentClick={onAppointmentClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
