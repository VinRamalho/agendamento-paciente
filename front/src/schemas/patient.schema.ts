import { z } from 'zod';

export const patientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().min(8, 'Telefone é obrigatório'),
  email: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  cpf: z
    .string()
    .regex(/^$|^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, 'CPF inválido')
    .optional()
    .or(z.literal('')),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
