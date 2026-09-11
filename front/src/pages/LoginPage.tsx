import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/useAuth';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schema';

export function LoginPage() {
  const { login, isAuthenticated, isBootstrapping, mustChangePassword } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Carregando...
      </div>
    );
  }

  if (isAuthenticated) {
    if (mustChangePassword) {
      return <Navigate to="/alterar-senha" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const user = await login(values.email, values.password);
      if (user.mustChangePassword) {
        navigate('/alterar-senha', { replace: true });
        return;
      }
      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setSubmitError('E-mail ou senha inválidos.');
        return;
      }
      setSubmitError('Não foi possível entrar. Tente novamente.');
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Agendamento Odontológico
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesse com suas credenciais para gerenciar a clínica.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-primary focus:ring-2"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-primary focus:ring-2"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger" role="alert">
                {errors.password.message}
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
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
