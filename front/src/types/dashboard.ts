export type DashboardAppointmentItem = {
  id: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: string;
  patientName: string;
  notes: string | null;
};

export type DashboardSummary = {
  todayCount: number;
  pendingPatientsCount: number;
  activeProfessionalsCount: number;
  todayAppointments: DashboardAppointmentItem[];
  upcomingAppointments: DashboardAppointmentItem[];
};
