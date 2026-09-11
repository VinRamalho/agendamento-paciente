import { z } from 'zod';

export const professionalFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(8, 'Telefone é obrigatório'),
  type: z.enum(['DENTIST', 'ASSISTANT'], {
    required_error: 'Tipo é obrigatório',
  }),
});

export type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;
