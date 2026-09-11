import { z } from 'zod';
import { isValidEmail, isValidPhone } from '@/utils/masks';

export const professionalFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .refine(isValidEmail, 'Informe um e-mail válido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(isValidPhone, 'Telefone inválido. Use DDD + número'),
  type: z.enum(['DENTIST', 'ASSISTANT'], {
    required_error: 'Tipo é obrigatório',
  }),
});

export type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;
