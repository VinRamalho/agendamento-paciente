import { z } from 'zod';

export const professionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  category: z.enum(['PROFESSIONAL', 'ASSISTANT'], {
    required_error: 'Categoria é obrigatória',
  }),
});

export type ProfessionFormValues = z.infer<typeof professionFormSchema>;
