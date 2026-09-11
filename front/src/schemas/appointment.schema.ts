import { z } from 'zod';

function isDateTimeInPast(date: string, startTime: string): boolean {
  if (!date || !startTime) return false;
  const candidate = new Date(`${date}T${startTime}:00`);
  if (Number.isNaN(candidate.getTime())) return false;
  return candidate.getTime() < Date.now() - 60_000;
}

const baseAppointmentFormSchema = z.object({
  patientId: z.string().uuid('Selecione o paciente'),
  responsibleProfessionalIds: z
    .array(z.string().uuid())
    .min(1, 'Selecione ao menos um dentista'),
  assistantProfessionalIds: z.array(z.string().uuid()).default([]),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'),
  durationMinutes: z.coerce
    .number({ invalid_type_error: 'Duração inválida' })
    .int('Duração deve ser inteira')
    .min(15, 'Duração mínima de 15 minutos')
    .max(480, 'Duração máxima de 8 horas'),
  notes: z
    .string()
    .max(2000, 'Observações muito longas')
    .optional()
    .or(z.literal('')),
});

export type AppointmentFormValues = z.infer<typeof baseAppointmentFormSchema>;

type PastGuardOptions = {
  /** Se data/hora forem iguais ao original, permite salvar mesmo no passado */
  original?: { date: string; startTime: string } | null;
};

export function createAppointmentFormSchema(options?: PastGuardOptions) {
  return baseAppointmentFormSchema.superRefine((values, ctx) => {
    const unchanged =
      options?.original &&
      values.date === options.original.date &&
      values.startTime === options.original.startTime;

    if (unchanged) {
      return;
    }

    if (isDateTimeInPast(values.date, values.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Não é possível agendar em data ou horário passado',
        path: ['startTime'],
      });
    }
  });
}

export const appointmentFormSchema = createAppointmentFormSchema();
