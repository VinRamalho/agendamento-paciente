import { z } from 'zod';
import { isValidEmail } from '@/utils/masks';

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(255),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .refine(isValidEmail, 'Informe um e-mail válido'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(6, 'A nova senha deve ter ao menos 6 caracteres')
      .max(72),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== '1234', {
    message: 'Escolha uma senha diferente da senha padrão',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
