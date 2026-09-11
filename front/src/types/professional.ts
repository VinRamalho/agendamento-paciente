export type ProfessionalType = 'DENTIST' | 'ASSISTANT';
export type ProfessionalStatus = 'ACTIVE' | 'INACTIVE';

export type Professional = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ProfessionalType;
  status: ProfessionalStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalsListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProfessionalsListResponse = {
  data: Professional[];
  meta: ProfessionalsListMeta;
};

export type ProfessionalInput = {
  name: string;
  email: string;
  phone: string;
  type: ProfessionalType;
};

export type ProfessionalsListParams = {
  page?: number;
  limit?: number;
  name?: string;
  type?: ProfessionalType | '';
  status?: ProfessionalStatus | '';
};
