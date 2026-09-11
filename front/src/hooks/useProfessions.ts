import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateProfession,
  createProfession,
  inactivateProfession,
  listProfessions,
  updateProfession,
} from '@/services/professions';
import type { ProfessionInput, ProfessionStatus } from '@/types/profession';

export function useProfessions(status?: ProfessionStatus) {
  return useQuery({
    queryKey: ['professions', status ?? 'all'],
    queryFn: () => listProfessions(status),
  });
}

export function useProfessionMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['professions'] });
    await queryClient.invalidateQueries({ queryKey: ['professionals'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ProfessionInput) => createProfession(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProfessionInput }) =>
      updateProfession(id, payload),
    onSuccess: invalidate,
  });

  const inactivateMutation = useMutation({
    mutationFn: (id: string) => inactivateProfession(id),
    onSuccess: invalidate,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateProfession(id),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    inactivateMutation,
    activateMutation,
  };
}
