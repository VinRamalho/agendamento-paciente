import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMinutes, format, parse } from 'date-fns';
import { Modal } from '@/components/Modal';
import { MultiSelectSearch } from '@/components/MultiSelectSearch';
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from '@/schemas/appointment.schema';
import type { Appointment } from '@/types/appointment';
import type { Patient } from '@/types/patient';
import type { Professional } from '@/types/professional';

type AppointmentFormModalProps = {
  open: boolean;
  appointment?: Appointment | null;
  createDefaults?: Partial<AppointmentFormValues> | null;
  patients: Patient[];
  dentists: Professional[];
  assistants: Professional[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
};

function getParticipantIds(
  appointment: Appointment | null | undefined,
  type: 'RESPONSIBLE' | 'ASSISTANT',
): string[] {
  return (
    appointment?.participants
      ?.filter((item) => item.participationType === type)
      .map((item) => item.professionalId) ?? []
  );
}

export function AppointmentFormModal({
  open,
  appointment,
  createDefaults,
  patients,
  dentists,
  assistants,
  submitting,
  onClose,
  onSubmit,
}: AppointmentFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      responsibleProfessionalIds: [],
      assistantProfessionalIds: [],
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      durationMinutes: 60,
      notes: '',
    },
  });

  const startTime = useWatch({ control, name: 'startTime' });
  const durationMinutes = useWatch({ control, name: 'durationMinutes' });

  const dentistOptions = useMemo(
    () => dentists.map((item) => ({ value: item.id, label: item.name })),
    [dentists],
  );
  const assistantOptions = useMemo(
    () => assistants.map((item) => ({ value: item.id, label: item.name })),
    [assistants],
  );

  const endTimeLabel = useMemo(() => {
    if (!startTime || !durationMinutes || Number(durationMinutes) <= 0) {
      return '—';
    }
    try {
      const start = parse(startTime, 'HH:mm', new Date());
      return format(addMinutes(start, Number(durationMinutes)), 'HH:mm');
    } catch {
      return '—';
    }
  }, [startTime, durationMinutes]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      patientId: appointment?.patientId ?? createDefaults?.patientId ?? '',
      responsibleProfessionalIds:
        getParticipantIds(appointment, 'RESPONSIBLE').length > 0
          ? getParticipantIds(appointment, 'RESPONSIBLE')
          : (createDefaults?.responsibleProfessionalIds ?? []),
      assistantProfessionalIds:
        getParticipantIds(appointment, 'ASSISTANT').length > 0
          ? getParticipantIds(appointment, 'ASSISTANT')
          : (createDefaults?.assistantProfessionalIds ?? []),
      date:
        appointment
          ? format(new Date(appointment.startAt), 'yyyy-MM-dd')
          : (createDefaults?.date ?? format(new Date(), 'yyyy-MM-dd')),
      startTime: appointment
        ? format(new Date(appointment.startAt), 'HH:mm')
        : (createDefaults?.startTime ?? '09:00'),
      durationMinutes:
        appointment?.durationMinutes ?? createDefaults?.durationMinutes ?? 60,
      notes: appointment?.notes ?? createDefaults?.notes ?? '',
    });
  }, [open, appointment, createDefaults, reset]);

  return (
    <Modal
      open={open}
      title={appointment ? 'Editar agendamento' : 'Novo agendamento'}
      titleId="appointment-form-title"
      onClose={onClose}
      className="max-w-xl"
    >
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        noValidate
      >
        <div>
          <label htmlFor="patientId" className="mb-1 block text-sm font-medium">
            Paciente (confirmado) *
          </label>
          <select
            id="patientId"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            {...register('patientId')}
          >
            <option value="">Selecione</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-sm text-danger">
              {errors.patientId.message}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Dentistas *</p>
          <p className="mb-2 text-xs text-slate-500">
            Busque e selecione um ou mais dentistas.
          </p>
          <Controller
            name="responsibleProfessionalIds"
            control={control}
            render={({ field }) => (
              <MultiSelectSearch
                options={dentistOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Buscar dentistas..."
                searchPlaceholder="Digite o nome..."
                emptyLabel="Nenhum dentista ativo cadastrado."
              />
            )}
          />
          {errors.responsibleProfessionalIds && (
            <p className="mt-1 text-sm text-danger">
              {errors.responsibleProfessionalIds.message}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Auxiliares (opcional)</p>
          <p className="mb-2 text-xs text-slate-500">
            Busque e selecione zero ou mais auxiliares.
          </p>
          <Controller
            name="assistantProfessionalIds"
            control={control}
            render={({ field }) => (
              <MultiSelectSearch
                options={assistantOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Buscar auxiliares..."
                searchPlaceholder="Digite o nome..."
                emptyLabel="Nenhum auxiliar ativo cadastrado."
              />
            )}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Data *
            </label>
            <input
              id="date"
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('date')}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-danger">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="startTime"
              className="mb-1 block text-sm font-medium"
            >
              Início *
            </label>
            <input
              id="startTime"
              type="time"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('startTime')}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-danger">
                {errors.startTime.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="durationMinutes"
              className="mb-1 block text-sm font-medium"
            >
              Duração (min) *
            </label>
            <input
              id="durationMinutes"
              type="number"
              min={15}
              step={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('durationMinutes')}
            />
            {errors.durationMinutes && (
              <p className="mt-1 text-sm text-danger">
                {errors.durationMinutes.message}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Horário final calculado: <strong>{endTimeLabel}</strong>
        </p>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Observações
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-danger">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
