import { api } from '@/services/api';
import type {
  Professional,
  ProfessionalInput,
  ProfessionalsListParams,
  ProfessionalsListResponse,
} from '@/types/professional';

export async function listProfessionals(
  params: ProfessionalsListParams,
): Promise<ProfessionalsListResponse> {
  const { data } = await api.get<ProfessionalsListResponse>('/professionals', {
    params: {
      page: params.page,
      limit: params.limit,
      name: params.name || undefined,
      type: params.type || undefined,
      status: params.status || undefined,
    },
  });
  return data;
}

export async function createProfessional(
  payload: ProfessionalInput,
): Promise<Professional> {
  const { data } = await api.post<Professional>('/professionals', payload);
  return data;
}

export async function updateProfessional(
  id: string,
  payload: ProfessionalInput,
): Promise<Professional> {
  const { data } = await api.patch<Professional>(
    `/professionals/${id}`,
    payload,
  );
  return data;
}

export async function inactivateProfessional(
  id: string,
): Promise<Professional> {
  const { data } = await api.patch<Professional>(
    `/professionals/${id}/inactivate`,
  );
  return data;
}

export async function activateProfessional(id: string): Promise<Professional> {
  const { data } = await api.patch<Professional>(
    `/professionals/${id}/activate`,
  );
  return data;
}
