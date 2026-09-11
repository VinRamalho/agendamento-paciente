import { api } from '@/services/api';
import type {
  Patient,
  PatientInput,
  PatientsListParams,
  PatientsListResponse,
} from '@/types/patient';

export async function listPatients(
  params: PatientsListParams,
): Promise<PatientsListResponse> {
  const { data } = await api.get<PatientsListResponse>('/patients', {
    params: {
      page: params.page,
      limit: params.limit,
      name: params.name || undefined,
      phone: params.phone || undefined,
      status: params.status || undefined,
    },
  });
  return data;
}

export async function getPatient(id: string): Promise<Patient> {
  const { data } = await api.get<Patient>(`/patients/${id}`);
  return data;
}

export async function createPatient(payload: PatientInput): Promise<Patient> {
  const { data } = await api.post<Patient>('/patients', payload);
  return data;
}

export async function updatePatient(
  id: string,
  payload: PatientInput,
): Promise<Patient> {
  const { data } = await api.patch<Patient>(`/patients/${id}`, payload);
  return data;
}

export async function confirmPatient(id: string): Promise<Patient> {
  const { data } = await api.patch<Patient>(`/patients/${id}/confirm`);
  return data;
}

export async function inactivatePatient(id: string): Promise<Patient> {
  const { data } = await api.patch<Patient>(`/patients/${id}/inactivate`);
  return data;
}
