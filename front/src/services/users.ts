import { api } from '@/services/api';
import type { AppUser } from '@/types/auth';

export async function listUsers(): Promise<AppUser[]> {
  const { data } = await api.get<AppUser[]>('/users');
  return data;
}

export async function createUser(payload: {
  name: string;
  email: string;
}): Promise<AppUser> {
  const { data } = await api.post<AppUser>('/users', payload);
  return data;
}

export async function inactivateUser(id: string): Promise<AppUser> {
  const { data } = await api.patch<AppUser>(`/users/${id}/inactivate`);
  return data;
}

export async function activateUser(id: string): Promise<AppUser> {
  const { data } = await api.patch<AppUser>(`/users/${id}/activate`);
  return data;
}
