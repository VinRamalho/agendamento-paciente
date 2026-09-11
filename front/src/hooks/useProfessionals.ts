import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateProfessional,
  createProfessional,
  inactivateProfessional,
  listProfessionals,
  updateProfessional,
} from '@/services/professionals';
import type {
  ProfessionalInput,
  ProfessionalsListParams,
} from '@/types/professional';

export function useProfessionals(params: ProfessionalsListParams) {
  return useQuery({
    queryKey: ['professionals', params],
    queryFn: () => listProfessionals(params),
  });
}

export function useProfessionalMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['professionals'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ProfessionalInput) => createProfessional(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ProfessionalInput;
    }) => updateProfessional(id, payload),
    onSuccess: invalidate,
  });

  const inactivateMutation = useMutation({
    mutationFn: (id: string) => inactivateProfessional(id),
    onSuccess: invalidate,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateProfessional(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    inactivateMutation,
    activateMutation,
  };
}
