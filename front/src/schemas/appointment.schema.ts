import { z } from 'zod';

export const appointmentFormSchema = z.object({
  patientId: z.string().uuid('Selecione o paciente'),
  responsibleProfessionalId: z.string().uuid('Selecione o dentista responsável'),
  assistantProfessionalId: z
    .string()
    .uuid('Auxiliar inválido')
    .optional()
    .or(z.literal('')),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'),
  durationMinutes: z.coerce
    .number({ invalid_type_error: 'Duração inválida' })
    .int('Duração deve ser inteira')
    .min(1, 'Duração deve ser maior que zero'),
  notes: z.string().optional().or(z.literal('')),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
