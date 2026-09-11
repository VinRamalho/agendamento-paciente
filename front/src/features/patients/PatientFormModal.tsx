import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  patientFormSchema,
  type PatientFormValues,
} from '@/schemas/patient.schema';
import type { Patient } from '@/types/patient';
import { maskCpf, maskPhone } from '@/utils/masks';

type PatientFormModalProps = {
  open: boolean;
  patient?: Patient | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => Promise<void>;
};

export function PatientFormModal({
  open,
  patient,
  submitting,
  onClose,
  onSubmit,
}: PatientFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      birthDate: '',
      cpf: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: patient?.name ?? '',
      phone: patient?.phone ? maskPhone(patient.phone) : '',
      email: patient?.email ?? '',
      birthDate: patient?.birthDate ?? '',
      cpf: patient?.cpf ? maskCpf(patient.cpf) : '',
    });
  }, [open, patient, reset]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-form-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="patient-form-title"
          className="text-lg font-semibold text-slate-900"
        >
          {patient ? 'Editar paciente' : 'Novo paciente'}
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
                  placeholder="(11) 98888-0000"
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
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="birthDate"
                className="mb-1 block text-sm font-medium"
              >
                Nascimento
              </label>
              <input
                id="birthDate"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                {...register('birthDate')}
              />
            </div>
            <div>
              <label htmlFor="cpf" className="mb-1 block text-sm font-medium">
                CPF
              </label>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <input
                    id="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(maskCpf(event.target.value))
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-danger">{errors.cpf.message}</p>
              )}
            </div>
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
