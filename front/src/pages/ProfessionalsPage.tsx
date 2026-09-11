import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { QueryState } from '@/components/QueryState';
import { ProfessionalFormModal } from '@/features/professionals/ProfessionalFormModal';
import {
  useProfessionalMutations,
  useProfessionals,
} from '@/hooks/useProfessionals';
import type { ProfessionalFormValues } from '@/schemas/professional.schema';
import type {
  Professional,
  ProfessionalStatus,
  ProfessionalType,
} from '@/types/professional';
import {
  professionalStatusLabel,
  professionalTypeLabel,
} from '@/utils/labels';

function statusClass(status: ProfessionalStatus): string {
  return status === 'ACTIVE'
    ? 'bg-emerald-50 text-success'
    : 'bg-slate-100 text-slate-600';
}

export function ProfessionalsPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [type, setType] = useState<ProfessionalType | ''>('');
  const [status, setStatus] = useState<ProfessionalStatus | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      name: nameFilter,
      type,
      status,
    }),
    [page, nameFilter, type, status],
  );

  const { data, isLoading, isError, error, refetch } = useProfessionals(params);
  const {
    createMutation,
    updateMutation,
    inactivateMutation,
    activateMutation,
  } = useProfessionalMutations();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (professional: Professional) => {
    setEditing(professional);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ProfessionalFormValues) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
        toast.success('Profissional atualizado');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Profissional cadastrado');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
              ? message
              : 'Não foi possível salvar o profissional.',
        );
        return;
      }
      toast.error('Não foi possível salvar o profissional.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Cadastre dentistas e auxiliares. Inativos não entram em novos
          agendamentos.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Novo profissional
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Buscar por nome"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Buscar por nome"
          />
          <select
            value={type}
            onChange={(event) => {
              setPage(1);
              setType(event.target.value as ProfessionalType | '');
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos os tipos</option>
            <option value="DENTIST">Dentista</option>
            <option value="ASSISTANT">Auxiliar</option>
          </select>
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as ProfessionalStatus | '');
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setNameFilter(name.trim());
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Filtrar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={Boolean(data && data.data.length === 0)}
          loadingMessage="Carregando profissionais..."
          errorMessage={
            error instanceof Error
              ? `Erro ao carregar profissionais. ${error.message}`
              : 'Erro ao carregar profissionais.'
          }
          emptyTitle="Nenhum profissional encontrado"
          emptyDescription="Ajuste os filtros ou cadastre um novo profissional."
          emptyActionLabel="Novo profissional"
          onEmptyAction={openCreate}
          onRetry={() => void refetch()}
        >
          {data && data.data.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome</th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Telefone</th>
                      <th className="px-4 py-3 font-medium">E-mail</th>
                      <th className="px-4 py-3 font-medium">Situação</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((professional) => (
                      <tr
                        key={professional.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {professional.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {professionalTypeLabel[professional.type]}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {professional.phone}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {professional.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(professional.status)}`}
                          >
                            {professionalStatusLabel[professional.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(professional)}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Editar
                            </button>
                            {professional.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  void inactivateMutation
                                    .mutateAsync(professional.id)
                                    .then(() =>
                                      toast.success('Profissional inativado'),
                                    )
                                    .catch(() =>
                                      toast.error(
                                        'Falha ao inativar profissional',
                                      ),
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
                                    .mutateAsync(professional.id)
                                    .then(() =>
                                      toast.success('Profissional reativado'),
                                    )
                                    .catch(() =>
                                      toast.error(
                                        'Falha ao reativar profissional',
                                      ),
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

              {data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
                  <p className="text-slate-500">
                    Página {data.meta.page} de {data.meta.totalPages} ·{' '}
                    {data.meta.total} registros
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={page >= data.meta.totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </QueryState>
      </section>

      <ProfessionalFormModal
        open={modalOpen}
        professional={editing}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
