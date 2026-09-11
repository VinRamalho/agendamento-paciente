import { z } from 'zod';

export const appointmentFormSchema = z.object({
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
  notes: z.string().max(2000, 'Observações muito longas').optional().or(z.literal('')),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
