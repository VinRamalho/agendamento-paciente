export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipationType = 'RESPONSIBLE' | 'ASSISTANT';

export type AppointmentParticipant = {
  id: string;
  professionalId: string;
  participationType: ParticipationType;
  professional?: {
    id: string;
    name: string;
    type: string;
  };
};

export type Appointment = {
  id: string;
  patientId: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes: string | null;
  patient?: {
    id: string;
    name: string;
  };
  participants?: AppointmentParticipant[];
};

export type AppointmentsListResponse = {
  data: Appointment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AppointmentInput = {
  patientId: string;
  responsibleProfessionalId: string;
  assistantProfessionalId?: string | null;
  date: string;
  startTime: string;
  durationMinutes: number;
  notes?: string | null;
};

export type AppointmentsListParams = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus | '';
  professionalId?: string;
};
