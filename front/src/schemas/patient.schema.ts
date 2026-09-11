import { z } from 'zod';
import { isValidCpf, isValidEmail, isValidPhone } from '@/utils/masks';

export const patientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(isValidPhone, 'Telefone inválido. Use DDD + número'),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => !value || isValidEmail(value),
      'Informe um e-mail válido',
    ),
  birthDate: z.string().optional().or(z.literal('')),
  cpf: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || isValidCpf(value), 'CPF inválido'),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
