import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { QueryState } from '@/components/QueryState';
import { Modal } from '@/components/Modal';
import {
  useProfessionMutations,
  useProfessions,
} from '@/hooks/useProfessions';
import {
  professionFormSchema,
  type ProfessionFormValues,
} from '@/schemas/profession.schema';
import type { Profession } from '@/types/profession';
import {
  professionCategoryLabel,
  professionalStatusLabel,
} from '@/utils/labels';

function statusClass(status: Profession['status']): string {
  return status === 'ACTIVE'
    ? 'bg-emerald-50 text-success'
    : 'bg-slate-100 text-slate-600';
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Não foi possível salvar a profissão.';
}

export function ProfessionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profession | null>(null);

  const { data, isLoading, isError, error, refetch } = useProfessions();
  const {
    createMutation,
    updateMutation,
    inactivateMutation,
    activateMutation,
  } = useProfessionMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfessionFormValues>({
    resolver: zodResolver(professionFormSchema),
    defaultValues: { name: '', category: 'PROFESSIONAL' },
  });

  useEffect(() => {
    if (!modalOpen) return;
    reset({
      name: editing?.name ?? '',
      category: editing?.category ?? 'PROFESSIONAL',
    });
  }, [modalOpen, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (profession: Profession) => {
    setEditing(profession);
    setModalOpen(true);
  };

  const onSubmit = async (values: ProfessionFormValues) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
        toast.success('Profissão atualizada');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Profissão cadastrada');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const professions = data ?? [];
  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Cadastre as profissões da clínica (ex.: Dentista, Assistente). Somente
          administradores. A categoria define se a pessoa pode ser responsável
          ou auxiliar no agendamento.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover sm:w-auto"
        >
          Nova profissão
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={professions.length === 0}
          loadingMessage="Carregando profissões..."
          errorMessage={
            error instanceof Error
              ? `Erro ao carregar profissões. ${error.message}`
              : 'Erro ao carregar profissões.'
          }
          emptyTitle="Nenhuma profissão"
          emptyDescription="Cadastre Dentista, Assistente ou outras funções."
          emptyActionLabel="Nova profissão"
          onEmptyAction={openCreate}
          onRetry={() => void refetch()}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {professions.map((profession) => (
                  <tr
                    key={profession.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {profession.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {professionCategoryLabel[profession.category]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(profession.status)}`}
                      >
                        {professionalStatusLabel[profession.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(profession)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Editar
                        </button>
                        {profession.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => {
                              void inactivateMutation
                                .mutateAsync(profession.id)
                                .then(() =>
                                  toast.success('Profissão inativada'),
                                )
                                .catch(() =>
                                  toast.error('Falha ao inativar profissão'),
                                );
                            }}
                            className="text-sm font-medium text-danger hover:underline"
                          >
                            Inativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              void activateMutation
                                .mutateAsync(profession.id)
                                .then(() =>
                                  toast.success('Profissão reativada'),
                                )
                                .catch(() =>
                                  toast.error('Falha ao reativar profissão'),
                                );
                            }}
                            className="text-sm font-medium text-success hover:underline"
                          >
                            Reativar
                          </button>
                        )}
                      </div>
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
        title={editing ? 'Editar profissão' : 'Nova profissão'}
        titleId="profession-form-title"
        onClose={() => setModalOpen(false)}
        className="max-w-md"
      >
        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nome *
            </label>
            <input
              id="name"
              placeholder="Ex.: Dentista"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium"
            >
              Categoria *
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              {...register('category')}
            >
              <option value="PROFESSIONAL">
                Responsável (pode atender sozinho)
              </option>
              <option value="ASSISTANT">Auxiliar</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-danger">
                {errors.category.message}
              </p>
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
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
