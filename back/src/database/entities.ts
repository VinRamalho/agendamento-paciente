import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Profession } from '../professions/entities/profession.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentParticipant } from '../appointments/entities/appointment-participant.entity';

export const entities = [
  User,
  Patient,
  Profession,
  Professional,
  Appointment,
  AppointmentParticipant,
];
