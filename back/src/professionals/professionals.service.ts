import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProfessionalStatus } from '../common/enums';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { ListProfessionalsQueryDto } from './dto/list-professionals-query.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { Professional } from './entities/professional.entity';

export type PaginatedProfessionals = {
  data: Professional[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async create(dto: CreateProfessionalDto): Promise<Professional> {
    const email = dto.email.trim().toLowerCase();
    await this.ensureUniqueEmail(email);

    const professional = this.professionalRepository.create({
      name: dto.name.trim(),
      email,
      phone: dto.phone.trim(),
      type: dto.type,
      status: ProfessionalStatus.ACTIVE,
    });

    return this.professionalRepository.save(professional);
  }

  async findAll(
    query: ListProfessionalsQueryDto,
  ): Promise<PaginatedProfessionals> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.name?.trim()) {
      where.name = ILike(`%${query.name.trim()}%`);
    }

    const [data, total] = await this.professionalRepository.findAndCount({
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

  async findOne(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({
      where: { id },
    });
    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }
    return professional;
  }

  async update(id: string, dto: UpdateProfessionalDto): Promise<Professional> {
    const professional = await this.findOne(id);

    if (dto.name !== undefined) {
      professional.name = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      professional.phone = dto.phone.trim();
    }
    if (dto.type !== undefined) {
      professional.type = dto.type;
    }
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      await this.ensureUniqueEmail(email, professional.id);
      professional.email = email;
    }

    return this.professionalRepository.save(professional);
  }

  async inactivate(id: string): Promise<Professional> {
    const professional = await this.findOne(id);
    professional.status = ProfessionalStatus.INACTIVE;
    return this.professionalRepository.save(professional);
  }

  async activate(id: string): Promise<Professional> {
    const professional = await this.findOne(id);
    professional.status = ProfessionalStatus.ACTIVE;
    return this.professionalRepository.save(professional);
  }

  private async ensureUniqueEmail(
    email: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.professionalRepository.findOne({
      where: { email },
    });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Já existe um profissional com este e-mail');
    }
  }
}
