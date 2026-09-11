export type PatientStatus = 'PENDING' | 'CONFIRMED' | 'INACTIVE';

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  cpf: string | null;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
};

export type PatientsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PatientsListResponse = {
  data: Patient[];
  meta: PatientsListMeta;
};

export type PatientInput = {
  name: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
  cpf?: string | null;
};

export type PatientsListParams = {
  page?: number;
  limit?: number;
  name?: string;
  phone?: string;
  status?: PatientStatus | '';
};
