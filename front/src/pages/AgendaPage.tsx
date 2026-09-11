import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QueryState } from '@/components/QueryState';
import { AgendaCalendar } from '@/features/agenda/AgendaCalendar';
import {
  formatAgendaTitle,
  getAgendaRange,
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
    setEditing(null);
    setCreateDefaults({
      date: date ?? format(anchorDate, 'yyyy-MM-dd'),
      startTime: startTime ?? '09:00',
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
      responsibleProfessionalId: values.responsibleProfessionalId,
      assistantProfessionalId: values.assistantProfessionalId
        ? values.assistantProfessionalId
        : null,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-slate-700">
            {formatAgendaTitle(anchorDate, viewMode)}
          </p>
          <p className="text-xs text-slate-500">
            Clique em um horário livre para agendar. Os blocos ocupam a duração
            real do atendimento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Novo agendamento
        </button>
      </div>

      <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex rounded-lg border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === 'day'
                ? 'bg-blue-50 text-primary'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dia
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === 'week'
                ? 'bg-blue-50 text-primary'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semana
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAnchorDate((current) => shiftAnchor(current, viewMode, -1))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setAnchorDate(new Date())}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => setAnchorDate((current) => shiftAnchor(current, viewMode, 1))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          Próximo
        </button>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
        >
          {isFetching ? 'Atualizando...' : 'Atualizar'}
        </button>

        <button
          type="button"
          onClick={() => setShowList((value) => !value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          {showList ? 'Ocultar lista' : 'Ver lista'}
        </button>
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
                      const responsible = appointment.participants?.find(
                        (item) => item.participationType === 'RESPONSIBLE',
                      )?.professional?.name;

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
                          <td className="px-4 py-3 text-slate-600">
                            {responsible ?? '—'}
                          </td>
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
