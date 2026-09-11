import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ProfessionalStatus, ProfessionalType } from '../common/enums';
import { Professional } from './entities/professional.entity';
import { ProfessionalsService } from './professionals.service';

describe('ProfessionalsService', () => {
  let service: ProfessionalsService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionalsService,
        {
          provide: getRepositoryToken(Professional),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(ProfessionalsService);
    jest.clearAllMocks();
  });

  it('should create professional as ACTIVE', async () => {
    const created = {
      id: 'pr1',
      name: 'Dr. João',
      email: 'joao@agendamento.local',
      phone: '11999990001',
      type: ProfessionalType.DENTIST,
      status: ProfessionalStatus.ACTIVE,
    };

    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.create({
      name: 'Dr. João',
      email: 'joao@agendamento.local',
      phone: '11999990001',
      type: ProfessionalType.DENTIST,
    });

    expect(result.status).toBe(ProfessionalStatus.ACTIVE);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProfessionalStatus.ACTIVE,
        email: 'joao@agendamento.local',
      }),
    );
  });

  it('should reject duplicated email', async () => {
    repository.findOne.mockResolvedValue({
      id: 'other',
      email: 'joao@agendamento.local',
    });

    await expect(
      service.create({
        name: 'Outro',
        email: 'joao@agendamento.local',
        phone: '11999990002',
        type: ProfessionalType.ASSISTANT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should inactivate professional', async () => {
    repository.findOne.mockResolvedValue({
      id: 'pr1',
      status: ProfessionalStatus.ACTIVE,
    });
    repository.save.mockImplementation(async (value) => value);

    const result = await service.inactivate('pr1');
    expect(result.status).toBe(ProfessionalStatus.INACTIVE);
  });
});
