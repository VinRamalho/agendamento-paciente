import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmPatient,
  createPatient,
  inactivatePatient,
  listPatients,
  updatePatient,
} from '@/services/patients';
import type { PatientInput, PatientsListParams } from '@/types/patient';

export function usePatients(params: PatientsListParams) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => listPatients(params),
  });
}

export function usePatientMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['patients'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: PatientInput) => createPatient(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatientInput }) =>
      updatePatient(id, payload),
    onSuccess: invalidate,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmPatient(id),
    onSuccess: invalidate,
  });

  const inactivateMutation = useMutation({
    mutationFn: (id: string) => inactivatePatient(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    confirmMutation,
    inactivateMutation,
  };
}
