import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AppointmentStatus,
  PatientStatus,
  ProfessionalStatus,
  ProfessionalType,
} from '../common/enums';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentParticipant } from './entities/appointment-participant.entity';
import { Appointment } from './entities/appointment.entity';
import { AppointmentConflictException } from './exceptions/appointment-conflict.exception';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  const appointmentRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
  };
  const participantRepository = {
    createQueryBuilder: jest.fn(),
  };
  const patientRepository = {
    findOne: jest.fn(),
  };
  const professionalRepository = {
    findOne: jest.fn(),
  };

  const manager = {
    getRepository: jest.fn(),
  };

  const dataSource = {
    transaction: jest.fn(async (cb: (m: typeof manager) => unknown) =>
      cb(manager),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: DataSource, useValue: dataSource },
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentRepository,
        },
        {
          provide: getRepositoryToken(AppointmentParticipant),
          useValue: participantRepository,
        },
        { provide: getRepositoryToken(Patient), useValue: patientRepository },
        {
          provide: getRepositoryToken(Professional),
          useValue: professionalRepository,
        },
      ],
    }).compile();

    service = module.get(AppointmentsService);
    jest.clearAllMocks();
  });

  it('should reject pending patient', async () => {
    patientRepository.findOne.mockResolvedValue({
      id: 'p1',
      status: PatientStatus.PENDING,
    });

    await expect(
      service.create({
        patientId: 'p1',
        responsibleProfessionalId: 'd1',
        date: '2026-09-15',
        startTime: '14:00',
        durationMinutes: 60,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject schedule conflict for professional', async () => {
    patientRepository.findOne.mockResolvedValue({
      id: 'p1',
      status: PatientStatus.CONFIRMED,
    });
    professionalRepository.findOne.mockResolvedValue({
      id: 'd1',
      name: 'Dr. João',
      status: ProfessionalStatus.ACTIVE,
      type: ProfessionalType.DENTIST,
    });

    const qb = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        professional: { name: 'Dr. João' },
      }),
    };
    participantRepository.createQueryBuilder.mockReturnValue(qb);

    await expect(
      service.create({
        patientId: 'p1',
        responsibleProfessionalId: 'd1',
        date: '2026-09-15',
        startTime: '14:00',
        durationMinutes: 60,
      }),
    ).rejects.toBeInstanceOf(AppointmentConflictException);
  });

  it('should cancel appointment preserving record', async () => {
    appointmentRepository.findOne.mockResolvedValue({
      id: 'a1',
      status: AppointmentStatus.SCHEDULED,
      participants: [],
    });
    appointmentRepository.save.mockImplementation(async (value) => value);

    const result = await service.cancel('a1');
    expect(result.status).toBe(AppointmentStatus.CANCELLED);
  });
});
