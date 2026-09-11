import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/useAuth';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/schemas/user.schema';

export function ChangePasswordPage() {
  const { changePassword, logout, isAuthenticated, mustChangePassword } =
    useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      navigate('/', { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setSubmitError(
          Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
              ? message
              : 'Não foi possível alterar a senha.',
        );
        return;
      }
      setSubmitError('Não foi possível alterar a senha.');
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700">
          Primeiro acesso
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Alterar senha
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sua senha atual é a padrão (<strong>1234</strong>). Defina uma nova
          senha para continuar.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1 block text-sm font-medium"
            >
              Senha atual
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-danger">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium"
            >
              Nova senha
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-danger">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-danger">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-danger" role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Sair
          </button>
        </form>
      </section>
    </main>
  );
}
