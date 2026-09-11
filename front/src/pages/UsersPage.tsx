import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/useAuth';
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/schemas/user.schema';
import {
  activateUser,
  createUser,
  inactivateUser,
  listUsers,
} from '@/services/users';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '' },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado. Senha padrão: 1234');
      setModalOpen(false);
      reset();
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
              ? message
              : 'Falha ao criar usuário',
        );
        return;
      }
      toast.error('Falha ao criar usuário');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'activate' | 'inactivate';
    }) =>
      action === 'activate' ? activateUser(id) : inactivateUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado');
    },
    onError: () => toast.error('Falha ao atualizar usuário'),
  });

  const users = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Somente administradores. Novos usuários recebem a senha padrão{' '}
          <strong>1234</strong> e devem trocá-la no primeiro login.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setModalOpen(true);
          }}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto"
        >
          Novo usuário
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={users.length === 0}
          loadingMessage="Carregando usuários..."
          errorMessage={
            error instanceof Error
              ? `Erro ao carregar usuários. ${error.message}`
              : 'Erro ao carregar usuários.'
          }
          emptyTitle="Nenhum usuário"
          emptyDescription="Cadastre o primeiro usuário da clínica."
          emptyActionLabel="Novo usuário"
          onEmptyAction={() => setModalOpen(true)}
          onRetry={() => void refetch()}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Papel</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-success'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                      {user.mustChangePassword && (
                        <span className="ml-2 text-xs text-amber-700">
                          Troca senha pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id &&
                        (user.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-danger hover:underline"
                            onClick={() =>
                              void statusMutation.mutateAsync({
                                id: user.id,
                                action: 'inactivate',
                              })
                            }
                          >
                            Inativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-sm font-medium text-success hover:underline"
                            onClick={() =>
                              void statusMutation.mutateAsync({
                                id: user.id,
                                action: 'activate',
                              })
                            }
                          >
                            Reativar
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </QueryState>
      </section>

      <Modal
        open={modalOpen}
        title="Novo usuário"
        titleId="user-form-title"
        onClose={() => setModalOpen(false)}
        className="max-w-md"
      >
        <p className="mt-1 text-sm text-slate-500">
          A senha inicial será <strong>1234</strong>.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await createMutation.mutateAsync(values);
          })}
          noValidate
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nome *
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {createMutation.isPending ? 'Salvando...' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
