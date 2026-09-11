export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum PatientStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  INACTIVE = 'INACTIVE',
}

export enum ProfessionalType {
  DENTIST = 'DENTIST',
  ASSISTANT = 'ASSISTANT',
}

export enum ProfessionalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ParticipationType {
  RESPONSIBLE = 'RESPONSIBLE',
  ASSISTANT = 'ASSISTANT',
  // Futuro: SUPERVISOR = 'SUPERVISOR',
}
