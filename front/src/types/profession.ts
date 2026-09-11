export type ProfessionCategory = 'PROFESSIONAL' | 'ASSISTANT';
export type ProfessionStatus = 'ACTIVE' | 'INACTIVE';

export type Profession = {
  id: string;
  name: string;
  category: ProfessionCategory;
  status: ProfessionStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionInput = {
  name: string;
  category: ProfessionCategory;
};
