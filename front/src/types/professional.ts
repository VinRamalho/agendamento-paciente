export type ProfessionalType = 'PROFESSIONAL' | 'ASSISTANT';
export type ProfessionalStatus = 'ACTIVE' | 'INACTIVE';

export type ProfessionalProfession = {
  id: string;
  name: string;
  category: ProfessionalType;
  status: ProfessionalStatus;
};

export type Professional = {
  id: string;
  name: string;
  email: string;
  phone: string;
  professionId: string;
  profession?: ProfessionalProfession;
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
  professionId: string;
};

export type ProfessionalsListParams = {
  page?: number;
  limit?: number;
  name?: string;
  type?: ProfessionalType | '';
  status?: ProfessionalStatus | '';
};
