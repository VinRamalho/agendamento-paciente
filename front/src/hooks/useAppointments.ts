import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  listAppointments,
  updateAppointment,
} from '@/services/appointments';
import type {
  AppointmentInput,
  AppointmentsListParams,
} from '@/types/appointment';

export function useAppointments(params: AppointmentsListParams) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => listAppointments(params),
  });
}

export function useAppointmentMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['appointments'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    createMutation: useMutation({
      mutationFn: (payload: AppointmentInput) => createAppointment(payload),
      onSuccess: invalidate,
    }),
    updateMutation: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: Partial<AppointmentInput>;
      }) => updateAppointment(id, payload),
      onSuccess: invalidate,
    }),
    confirmMutation: useMutation({
      mutationFn: (id: string) => confirmAppointment(id),
      onSuccess: invalidate,
    }),
    completeMutation: useMutation({
      mutationFn: (id: string) => completeAppointment(id),
      onSuccess: invalidate,
    }),
    cancelMutation: useMutation({
      mutationFn: (id: string) => cancelAppointment(id),
      onSuccess: invalidate,
    }),
  };
}
