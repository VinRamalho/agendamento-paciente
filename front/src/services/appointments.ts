import { api } from '@/services/api';
import type {
  Appointment,
  AppointmentInput,
  AppointmentsListParams,
  AppointmentsListResponse,
} from '@/types/appointment';

export async function listAppointments(
  params: AppointmentsListParams,
): Promise<AppointmentsListResponse> {
  const { data } = await api.get<AppointmentsListResponse>('/appointments', {
    params: {
      page: params.page,
      limit: params.limit,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      status: params.status || undefined,
      professionalId: params.professionalId || undefined,
    },
  });
  return data;
}

export async function createAppointment(
  payload: AppointmentInput,
): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', payload);
  return data;
}

export async function updateAppointment(
  id: string,
  payload: Partial<AppointmentInput>,
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, payload);
  return data;
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/confirm`);
  return data;
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/complete`);
  return data;
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/cancel`);
  return data;
}
