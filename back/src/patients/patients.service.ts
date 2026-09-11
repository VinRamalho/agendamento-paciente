import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PatientStatus } from '../common/enums';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';

export type PaginatedPatients = {
  data: Patient[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    const cpf = this.normalizeOptionalCpf(dto.cpf);
    await this.ensureUniqueCpf(cpf);

    const patient = this.patientRepository.create({
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      email: this.normalizeOptionalEmail(dto.email),
      birthDate: dto.birthDate ?? null,
      cpf,
      status: PatientStatus.PENDING,
    });

    return this.patientRepository.save(patient);
  }

  async findAll(query: ListPatientsQueryDto): Promise<PaginatedPatients> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.name?.trim()) {
      where.name = ILike(`%${query.name.trim()}%`);
    }

    if (query.phone?.trim()) {
      where.phone = ILike(`%${query.phone.trim()}%`);
    }

    const [data, total] = await this.patientRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    if (dto.name !== undefined) {
      patient.name = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      patient.phone = dto.phone.trim();
    }
    if (dto.email !== undefined) {
      patient.email = this.normalizeOptionalEmail(dto.email);
    }
    if (dto.birthDate !== undefined) {
      patient.birthDate = dto.birthDate ?? null;
    }
    if (dto.cpf !== undefined) {
      const cpf = this.normalizeOptionalCpf(dto.cpf);
      await this.ensureUniqueCpf(cpf, patient.id);
      patient.cpf = cpf;
    }

    return this.patientRepository.save(patient);
  }

  async confirm(id: string): Promise<Patient> {
    const patient = await this.findOne(id);

    if (patient.status === PatientStatus.INACTIVE) {
      throw new BadRequestException('Paciente inativo não pode ser confirmado');
    }

    if (patient.status === PatientStatus.CONFIRMED) {
      return patient;
    }

    patient.status = PatientStatus.CONFIRMED;
    return this.patientRepository.save(patient);
  }

  async inactivate(id: string): Promise<Patient> {
    const patient = await this.findOne(id);
    patient.status = PatientStatus.INACTIVE;
    return this.patientRepository.save(patient);
  }

  private normalizeOptionalEmail(
    email: string | null | undefined,
  ): string | null {
    if (!email?.trim()) {
      return null;
    }
    return email.trim().toLowerCase();
  }

  private normalizeOptionalCpf(cpf: string | null | undefined): string | null {
    if (!cpf?.trim()) {
      return null;
    }
    return cpf.trim();
  }

  private async ensureUniqueCpf(
    cpf: string | null,
    ignoreId?: string,
  ): Promise<void> {
    if (!cpf) {
      return;
    }

    const existing = await this.patientRepository.findOne({ where: { cpf } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Já existe um paciente com este CPF');
    }
  }
}
