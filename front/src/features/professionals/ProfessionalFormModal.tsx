import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  professionalFormSchema,
  type ProfessionalFormValues,
} from '@/schemas/professional.schema';
import type { Professional } from '@/types/professional';

type ProfessionalFormModalProps = {
  open: boolean;
  professional?: Professional | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProfessionalFormValues) => Promise<void>;
};

export function ProfessionalFormModal({
  open,
  professional,
  submitting,
  onClose,
  onSubmit,
}: ProfessionalFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'DENTIST',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: professional?.name ?? '',
      email: professional?.email ?? '',
      phone: professional?.phone ?? '',
      type: professional?.type ?? 'DENTIST',
    });
  }, [open, professional, reset]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="professional-form-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="professional-form-title"
          className="text-lg font-semibold text-slate-900"
        >
          {professional ? 'Editar profissional' : 'Novo profissional'}
        </h2>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          noValidate
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Telefone
            </label>
            <input
              id="phone"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium">
              Tipo
            </label>
            <select
              id="type"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('type')}
            >
              <option value="DENTIST">Dentista</option>
              <option value="ASSISTANT">Auxiliar</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-danger">{errors.type.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
