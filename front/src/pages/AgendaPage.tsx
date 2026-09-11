import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  List,
  RefreshCw,
} from 'lucide-react';
import { AppleLogoIcon, GoogleCalendarIcon } from '@/components/BrandIcons';
import { QueryState } from '@/components/QueryState';
import { AgendaCalendar } from '@/features/agenda/AgendaCalendar';
import {
  formatAgendaTitle,
  getAgendaRange,
  isDateTimeInPast,
  shiftAnchor,
  type AgendaViewMode,
} from '@/features/agenda/calendar-utils';
import { AppointmentFormModal } from '@/features/appointments/AppointmentFormModal';
import {
  useAppointmentMutations,
  useAppointments,
} from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useProfessionals } from '@/hooks/useProfessionals';
import type { AppointmentFormValues } from '@/schemas/appointment.schema';
import type { Appointment } from '@/types/appointment';
import {
  appointmentStatusClass,
  appointmentStatusLabel,
} from '@/utils/labels';
import {
  buildAppointmentsIcs,
  downloadIcsFile,
  openGoogleCalendarEvent,
} from '@/utils/ics';
import { cn } from '@/lib/utils';

function formatDateTime(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Não foi possível concluir a operação.';
}

export function AgendaPage() {
  const [viewMode, setViewMode] = useState<AgendaViewMode>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [showList, setShowList] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [createDefaults, setCreateDefaults] = useState<Partial<AppointmentFormValues> | null>(
    null,
  );

  const range = useMemo(
    () => getAgendaRange(anchorDate, viewMode),
    [anchorDate, viewMode],
  );

  const startDate = format(range.start, 'yyyy-MM-dd');
  const endDate = format(range.end, 'yyyy-MM-dd');

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAppointments({
      page: 1,
      limit: 100,
      startDate,
      endDate,
    });

  const patientsQuery = usePatients({
    page: 1,
    limit: 100,
    status: 'CONFIRMED',
  });
  const dentistsQuery = useProfessionals({
    page: 1,
    limit: 100,
    type: 'DENTIST',
    status: 'ACTIVE',
  });
  const assistantsQuery = useProfessionals({
    page: 1,
    limit: 100,
    type: 'ASSISTANT',
    status: 'ACTIVE',
  });

  const {
    createMutation,
    updateMutation,
    confirmMutation,
    completeMutation,
    cancelMutation,
  } = useAppointmentMutations();

  const submitting = createMutation.isPending || updateMutation.isPending;
  const appointments = data?.data ?? [];

  const openCreate = (date?: string, startTime?: string) => {
    const nextDate = date ?? format(anchorDate, 'yyyy-MM-dd');
    const nextTime = startTime ?? '09:00';

    if (isDateTimeInPast(nextDate, nextTime)) {
      toast.error('Não é possível agendar em data ou horário passado');
      return;
    }

    setEditing(null);
    setCreateDefaults({
      date: nextDate,
      startTime: nextTime,
      durationMinutes: 60,
    });
    setModalOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditing(appointment);
    setCreateDefaults(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: AppointmentFormValues) => {
    const payload = {
      patientId: values.patientId,
      responsibleProfessionalIds: values.responsibleProfessionalIds,
      assistantProfessionalIds: values.assistantProfessionalIds ?? [],
      date: values.date,
      startTime: values.startTime,
      durationMinutes: Number(values.durationMinutes),
      notes: values.notes?.trim() ? values.notes.trim() : null,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Agendamento atualizado');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Agendamento criado');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleExportIcs = () => {
    const active = appointments.filter((item) => item.status !== 'CANCELLED');
    if (active.length === 0) {
      toast.error('Não há agendamentos para exportar neste período.');
      return;
    }
    const content = buildAppointmentsIcs(active);
    downloadIcsFile(
      content,
      `agenda-${startDate}-${endDate}.ics`,
    );
    toast.success(
      'Arquivo .ics baixado. Abra no Apple Calendar ou importe no Google Agenda.',
    );
  };

  const handleExportGoogle = () => {
    const next = appointments.find((item) => item.status !== 'CANCELLED');
    if (!next) {
      toast.error('Não há agendamentos para exportar neste período.');
      return;
    }
    openGoogleCalendarEvent(next);
    if (appointments.filter((item) => item.status !== 'CANCELLED').length > 1) {
      toast.message(
        'Google Agenda abre um evento por vez. Use Exportar .ics para todos.',
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm capitalize text-slate-700">
            {formatAgendaTitle(anchorDate, viewMode)}
          </p>
          <p className="text-xs text-slate-500">
            Clique em um horário livre para agendar. Os blocos ocupam a duração
            real do atendimento.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <div className="space-y-1.5 sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Exportar período
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleExportIcs}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <AppleLogoIcon className="h-4 w-4 text-slate-900" />
                Apple Agenda
              </button>
              <button
                type="button"
                onClick={handleExportGoogle}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <GoogleCalendarIcon className="h-4 w-4" />
                Google Agenda
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover sm:w-auto"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Novo agendamento
          </button>
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Visualização
            </p>
            <div
              className="inline-flex rounded-lg bg-slate-100 p-1"
              role="group"
              aria-label="Modo de visualização"
            >
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-semibold transition',
                  viewMode === 'day'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                )}
              >
                Dia
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-semibold transition',
                  viewMode === 'week'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
                )}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Navegação
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAnchorDate((current) => shiftAnchor(current, viewMode, -1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setAnchorDate(new Date())}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <CalendarDays className="h-4 w-4" aria-hidden />
                Hoje
              </button>
              <button
                type="button"
                onClick={() =>
                  setAnchorDate((current) => shiftAnchor(current, viewMode, 1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Próximo
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Ações
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={cn('h-4 w-4', isFetching && 'animate-spin')}
                  aria-hidden
                />
                {isFetching ? 'Atualizando...' : 'Atualizar'}
              </button>
              <button
                type="button"
                onClick={() => setShowList((value) => !value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  showList
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                )}
              >
                <List className="h-4 w-4" aria-hidden />
                {showList ? 'Ocultar lista' : 'Ver lista'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        loadingMessage="Carregando agenda..."
        errorMessage={
          error instanceof Error
            ? `Erro ao carregar agenda. ${error.message}`
            : 'Erro ao carregar agenda.'
        }
        onRetry={() => void refetch()}
      >
        <AgendaCalendar
          days={range.days}
          appointments={appointments}
          onSlotClick={(date, startTime) => openCreate(date, startTime)}
          onAppointmentClick={openEdit}
          onPastSlotClick={() =>
            toast.error('Não é possível agendar em data ou horário passado')
          }
        />

        {showList && (
          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <QueryState
              isLoading={false}
              isError={false}
              isEmpty={appointments.length === 0}
              emptyTitle="Nenhum agendamento neste período"
              emptyDescription="Clique em um horário livre no calendário ou use Novo agendamento."
              emptyActionLabel="Novo agendamento"
              onEmptyAction={() => openCreate()}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Horário</th>
                      <th className="px-4 py-3 font-medium">Paciente</th>
                      <th className="px-4 py-3 font-medium">Equipe</th>
                      <th className="px-4 py-3 font-medium">Situação</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      const team =
                        appointment.participants
                          ?.map((item) => item.professional?.name)
                          .filter(Boolean)
                          .join(', ') || '—';

                      return (
                        <tr
                          key={appointment.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-3">
                            {formatDateTime(appointment.startAt)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {appointment.patient?.name ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{team}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${appointmentStatusClass(appointment.status)}`}
                            >
                              {appointmentStatusLabel[appointment.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {appointment.status !== 'CANCELLED' &&
                                appointment.status !== 'COMPLETED' && (
                                  <button
                                    type="button"
                                    onClick={() => openEdit(appointment)}
                                    className="text-sm font-medium text-primary hover:underline"
                                  >
                                    Editar
                                  </button>
                                )}
                              {appointment.status === 'SCHEDULED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void confirmMutation
                                      .mutateAsync(appointment.id)
                                      .then(() =>
                                        toast.success('Agendamento confirmado'),
                                      )
                                      .catch((err: unknown) =>
                                        toast.error(getErrorMessage(err)),
                                      );
                                  }}
                                  className="text-sm font-medium text-success hover:underline"
                                >
                                  Confirmar
                                </button>
                              )}
                              {(appointment.status === 'SCHEDULED' ||
                                appointment.status === 'CONFIRMED') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void completeMutation
                                      .mutateAsync(appointment.id)
                                      .then(() =>
                                        toast.success('Agendamento concluído'),
                                      )
                                      .catch((err: unknown) =>
                                        toast.error(getErrorMessage(err)),
                                      );
                                  }}
                                  className="text-sm font-medium text-slate-700 hover:underline"
                                >
                                  Concluir
                                </button>
                              )}
                              {appointment.status !== 'CANCELLED' &&
                                appointment.status !== 'COMPLETED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void cancelMutation
                                        .mutateAsync(appointment.id)
                                        .then(() =>
                                          toast.success(
                                            'Agendamento cancelado',
                                          ),
                                        )
                                        .catch((err: unknown) =>
                                          toast.error(getErrorMessage(err)),
                                        );
                                    }}
                                    className="text-sm font-medium text-danger hover:underline"
                                  >
                                    Cancelar
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </QueryState>
          </section>
        )}
      </QueryState>

      <AppointmentFormModal
        key={editing?.id ?? 'new'}
        open={modalOpen}
        appointment={editing}
        createDefaults={createDefaults}
        patients={patientsQuery.data?.data ?? []}
        dentists={dentistsQuery.data?.data ?? []}
        assistants={assistantsQuery.data?.data ?? []}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
