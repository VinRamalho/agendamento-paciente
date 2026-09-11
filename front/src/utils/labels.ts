import type { AppointmentStatus } from '@/types/appointment';
import type { PatientStatus } from '@/types/patient';
import type { ProfessionCategory } from '@/types/profession';
import type {
  ProfessionalStatus,
  ProfessionalType,
} from '@/types/professional';

export const appointmentStatusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const patientStatusLabel: Record<PatientStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  INACTIVE: 'Inativo',
};

export const professionalStatusLabel: Record<ProfessionalStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
};

export const professionalTypeLabel: Record<ProfessionalType, string> = {
  PROFESSIONAL: 'Responsável',
  ASSISTANT: 'Auxiliar',
};

export const professionCategoryLabel: Record<ProfessionCategory, string> = {
  PROFESSIONAL: 'Responsável',
  ASSISTANT: 'Auxiliar',
};

export function appointmentStatusClass(status: AppointmentStatus): string {
  if (status === 'CONFIRMED') return 'bg-emerald-50 text-success';
  if (status === 'SCHEDULED') return 'bg-blue-50 text-primary';
  if (status === 'COMPLETED') return 'bg-slate-100 text-slate-600';
  return 'bg-red-50 text-danger';
}
