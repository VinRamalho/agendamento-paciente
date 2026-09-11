import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/Modal';
import {
  professionalFormSchema,
  type ProfessionalFormValues,
} from '@/schemas/professional.schema';
import type { Profession } from '@/types/profession';
import type { Professional } from '@/types/professional';
import { professionCategoryLabel } from '@/utils/labels';
import { maskPhone } from '@/utils/masks';

type ProfessionalFormModalProps = {
  open: boolean;
  professional?: Professional | null;
  professions: Profession[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProfessionalFormValues) => Promise<void>;
};

export function ProfessionalFormModal({
  open,
  professional,
  professions,
  submitting,
  onClose,
  onSubmit,
}: ProfessionalFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      professionId: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: professional?.name ?? '',
      email: professional?.email ?? '',
      phone: professional?.phone ? maskPhone(professional.phone) : '',
      professionId:
        professional?.professionId ??
        professional?.profession?.id ??
        professions[0]?.id ??
        '',
    });
  }, [open, professional, professions, reset]);

  return (
    <Modal
      open={open}
      title={professional ? 'Editar profissional' : 'Novo profissional'}
      titleId="professional-form-title"
      onClose={onClose}
    >
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        noValidate
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nome *
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
            E-mail *
          </label>
          <input
            id="email"
            type="email"
            placeholder="nome@email.com"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Telefone *
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <input
                id="phone"
                inputMode="tel"
                placeholder="(11) 99999-0001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={field.value}
                onChange={(event) =>
                  field.onChange(maskPhone(event.target.value))
                }
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="professionId"
            className="mb-1 block text-sm font-medium"
          >
            Profissão *
          </label>
          <select
            id="professionId"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            {...register('professionId')}
          >
            <option value="">Selecione...</option>
            {professions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({professionCategoryLabel[item.category]})
              </option>
            ))}
          </select>
          {errors.professionId && (
            <p className="mt-1 text-sm text-danger">
              {errors.professionId.message}
            </p>
          )}
          {professions.length === 0 && (
            <p className="mt-1 text-sm text-amber-700">
              Nenhuma profissão ativa. Peça ao admin para cadastrar em
              Profissões.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || professions.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
