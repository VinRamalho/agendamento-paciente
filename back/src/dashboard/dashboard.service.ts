import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import {
  AppointmentStatus,
  PatientStatus,
  ProfessionalStatus,
} from '../common/enums';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';

export type DashboardAppointmentItem = {
  id: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
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

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async getSummary(now = new Date()): Promise<DashboardSummary> {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const activeStatuses = [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CONFIRMED,
    ];

    const [
      todayAppointments,
      upcomingAppointments,
      pendingPatientsCount,
      activeProfessionalsCount,
    ] = await Promise.all([
      this.appointmentRepository.find({
        where: {
          startAt: Between(startOfDay, endOfDay),
          status: In(activeStatuses),
        },
        relations: { patient: true },
        order: { startAt: 'ASC' },
        take: 20,
      }),
      this.appointmentRepository.find({
        where: {
          startAt: MoreThanOrEqual(now),
          status: In(activeStatuses),
        },
        relations: { patient: true },
        order: { startAt: 'ASC' },
        take: 8,
      }),
      this.patientRepository.count({
        where: { status: PatientStatus.PENDING },
      }),
      this.professionalRepository.count({
        where: { status: ProfessionalStatus.ACTIVE },
      }),
    ]);

    return {
      todayCount: todayAppointments.length,
      pendingPatientsCount,
      activeProfessionalsCount,
      todayAppointments: todayAppointments.map((item) =>
        this.mapAppointment(item),
      ),
      upcomingAppointments: upcomingAppointments.map((item) =>
        this.mapAppointment(item),
      ),
    };
  }

  private mapAppointment(appointment: Appointment): DashboardAppointmentItem {
    return {
      id: appointment.id,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      patientName: appointment.patient?.name ?? 'Paciente',
      notes: appointment.notes,
    };
  }
}
