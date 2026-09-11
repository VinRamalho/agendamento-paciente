import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PatientStatus } from '../common/enums';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(PatientsService);
    jest.clearAllMocks();
  });

  it('should create patient as PENDING', async () => {
    const created = {
      id: 'p1',
      name: 'Carlos',
      phone: '11999999999',
      email: null,
      birthDate: null,
      cpf: null,
      status: PatientStatus.PENDING,
    };

    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.create({
      name: 'Carlos',
      phone: '11999999999',
    });

    expect(result.status).toBe(PatientStatus.PENDING);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: PatientStatus.PENDING }),
    );
  });

  it('should confirm pending patient', async () => {
    const patient = {
      id: 'p1',
      status: PatientStatus.PENDING,
    };

    repository.findOne.mockResolvedValue(patient);
    repository.save.mockImplementation(async (value) => value);

    const result = await service.confirm('p1');
    expect(result.status).toBe(PatientStatus.CONFIRMED);
  });

  it('should not confirm inactive patient', async () => {
    repository.findOne.mockResolvedValue({
      id: 'p1',
      status: PatientStatus.INACTIVE,
    });

    await expect(service.confirm('p1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should reject duplicated CPF', async () => {
    repository.findOne.mockResolvedValue({
      id: 'other',
      cpf: '111.444.777-35',
    });

    await expect(
      service.create({
        name: 'Novo',
        phone: '11988887777',
        cpf: '111.444.777-35',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
