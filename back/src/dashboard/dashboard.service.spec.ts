import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  AppointmentStatus,
  PatientStatus,
  ProfessionalStatus,
} from '../common/enums';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const appointmentRepository = {
    find: jest.fn(),
  };
  const patientRepository = {
    count: jest.fn(),
  };
  const professionalRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: patientRepository,
        },
        {
          provide: getRepositoryToken(Professional),
          useValue: professionalRepository,
        },
      ],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  it('should return dashboard summary', async () => {
    const now = new Date('2026-09-15T12:00:00.000Z');
    const appointment = {
      id: 'a1',
      startAt: new Date('2026-09-15T17:00:00.000Z'),
      endAt: new Date('2026-09-15T18:00:00.000Z'),
      durationMinutes: 60,
      status: AppointmentStatus.SCHEDULED,
      notes: null,
      patient: { name: 'Carlos Mendes' },
    };

    appointmentRepository.find
      .mockResolvedValueOnce([appointment])
      .mockResolvedValueOnce([appointment]);
    patientRepository.count.mockResolvedValue(2);
    professionalRepository.count.mockResolvedValue(3);

    const summary = await service.getSummary(now);

    expect(summary.todayCount).toBe(1);
    expect(summary.pendingPatientsCount).toBe(2);
    expect(summary.activeProfessionalsCount).toBe(3);
    expect(summary.todayAppointments[0].patientName).toBe('Carlos Mendes');
    expect(patientRepository.count).toHaveBeenCalledWith({
      where: { status: PatientStatus.PENDING },
    });
    expect(professionalRepository.count).toHaveBeenCalledWith({
      where: { status: ProfessionalStatus.ACTIVE },
    });
  });
});
