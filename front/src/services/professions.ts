import { api } from '@/services/api';
import type {
  Profession,
  ProfessionInput,
  ProfessionStatus,
} from '@/types/profession';

export async function listProfessions(
  status?: ProfessionStatus,
): Promise<Profession[]> {
  const { data } = await api.get<Profession[]>('/professions', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function createProfession(
  payload: ProfessionInput,
): Promise<Profession> {
  const { data } = await api.post<Profession>('/professions', payload);
  return data;
}

export async function updateProfession(
  id: string,
  payload: ProfessionInput,
): Promise<Profession> {
  const { data } = await api.patch<Profession>(`/professions/${id}`, payload);
  return data;
}

export async function inactivateProfession(id: string): Promise<Profession> {
  const { data } = await api.patch<Profession>(`/professions/${id}/inactivate`);
  return data;
}

export async function activateProfession(id: string): Promise<Profession> {
  const { data } = await api.patch<Profession>(`/professions/${id}/activate`);
  return data;
}
