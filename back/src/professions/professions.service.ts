import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProfessionalStatus } from '../common/enums';
import { Professional } from '../professionals/entities/professional.entity';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { Profession } from './entities/profession.entity';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private readonly professionRepository: Repository<Profession>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async create(dto: CreateProfessionDto): Promise<Profession> {
    const name = dto.name.trim();
    await this.ensureUniqueName(name);

    const profession = this.professionRepository.create({
      name,
      category: dto.category,
      status: ProfessionalStatus.ACTIVE,
    });

    return this.professionRepository.save(profession);
  }

  async findAll(status?: ProfessionalStatus): Promise<Profession[]> {
    return this.professionRepository.find({
      where: status ? { status } : undefined,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Profession> {
    const profession = await this.professionRepository.findOne({
      where: { id },
    });
    if (!profession) {
      throw new NotFoundException('Profissão não encontrada');
    }
    return profession;
  }

  async update(id: string, dto: UpdateProfessionDto): Promise<Profession> {
    const profession = await this.findOne(id);
    const previousCategory = profession.category;

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      await this.ensureUniqueName(name, profession.id);
      profession.name = name;
    }
    if (dto.category !== undefined) {
      profession.category = dto.category;
    }

    const saved = await this.professionRepository.save(profession);

    if (dto.category !== undefined && dto.category !== previousCategory) {
      await this.professionalRepository.update(
        { professionId: saved.id },
        { type: saved.category },
      );
    }

    return saved;
  }

  async inactivate(id: string): Promise<Profession> {
    const profession = await this.findOne(id);
    profession.status = ProfessionalStatus.INACTIVE;
    return this.professionRepository.save(profession);
  }

  async activate(id: string): Promise<Profession> {
    const profession = await this.findOne(id);
    profession.status = ProfessionalStatus.ACTIVE;
    return this.professionRepository.save(profession);
  }

  async findActiveById(id: string): Promise<Profession> {
    const profession = await this.findOne(id);
    if (profession.status !== ProfessionalStatus.ACTIVE) {
      throw new ConflictException('Profissão inativa');
    }
    return profession;
  }

  private async ensureUniqueName(
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.professionRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Já existe uma profissão com este nome');
    }
  }
}
