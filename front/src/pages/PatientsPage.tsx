import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { PatientFormModal } from '@/features/patients/PatientFormModal';
import { QueryState } from '@/components/QueryState';
import { usePatientMutations, usePatients } from '@/hooks/usePatients';
import type { PatientFormValues } from '@/schemas/patient.schema';
import type { Patient, PatientStatus } from '@/types/patient';
import { patientStatusLabel } from '@/utils/labels';

function statusClass(status: PatientStatus): string {
  if (status === 'CONFIRMED') return 'bg-emerald-50 text-success';
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function toPayload(values: PatientFormValues) {
  return {
    name: values.name,
    phone: values.phone,
    email: values.email?.trim() ? values.email.trim() : null,
    birthDate: values.birthDate?.trim() ? values.birthDate : null,
    cpf: values.cpf?.trim() ? values.cpf.trim() : null,
  };
}

export function PatientsPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PatientStatus | ''>('');
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      name: nameFilter,
      phone: phoneFilter,
      status,
    }),
    [page, nameFilter, phoneFilter, status],
  );

  const { data, isLoading, isError, error, refetch } = usePatients(params);
  const {
    createMutation,
    updateMutation,
    confirmMutation,
    inactivateMutation,
  } = usePatientMutations();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PatientFormValues) => {
    try {
      const payload = toPayload(values);
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Paciente atualizado');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Paciente cadastrado como pendente');
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
              : 'Não foi possível salvar o paciente.',
        );
        return;
      }
      toast.error('Não foi possível salvar o paciente.');
    }
  };

  const applyFilters = () => {
    setPage(1);
    setNameFilter(name.trim());
    setPhoneFilter(phone.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Cadastre, confirme e gerencie pacientes da clínica.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Novo paciente
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
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Buscar por telefone"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Buscar por telefone"
          />
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as PatientStatus | '');
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="INACTIVE">Inativo</option>
          </select>
          <button
            type="button"
            onClick={applyFilters}
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
          loadingMessage="Carregando pacientes..."
          errorMessage={
            error instanceof Error
              ? `Erro ao carregar pacientes. ${error.message}`
              : 'Erro ao carregar pacientes.'
          }
          emptyTitle="Nenhum paciente encontrado"
          emptyDescription="Ajuste os filtros ou cadastre um novo paciente."
          emptyActionLabel="Novo paciente"
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
                      <th className="px-4 py-3 font-medium">Telefone</th>
                      <th className="px-4 py-3 font-medium">E-mail</th>
                      <th className="px-4 py-3 font-medium">Situação</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((patient) => (
                      <tr key={patient.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {patient.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {patient.phone}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {patient.email ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(patient.status)}`}
                          >
                            {patientStatusLabel[patient.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(patient)}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Editar
                            </button>
                            {patient.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => {
                                  void confirmMutation
                                    .mutateAsync(patient.id)
                                    .then(() =>
                                      toast.success('Paciente confirmado'),
                                    )
                                    .catch(() =>
                                      toast.error('Falha ao confirmar paciente'),
                                    );
                                }}
                                className="text-sm font-medium text-success hover:underline"
                              >
                                Confirmar
                              </button>
                            )}
                            {patient.status !== 'INACTIVE' && (
                              <button
                                type="button"
                                onClick={() => {
                                  void inactivateMutation
                                    .mutateAsync(patient.id)
                                    .then(() =>
                                      toast.success('Paciente inativado'),
                                    )
                                    .catch(() =>
                                      toast.error('Falha ao inativar paciente'),
                                    );
                                }}
                                className="text-sm font-medium text-danger hover:underline"
                              >
                                Inativar
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

      <PatientFormModal
        open={modalOpen}
        patient={editing}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
