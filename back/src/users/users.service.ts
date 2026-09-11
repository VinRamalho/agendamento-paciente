import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole, UserStatus } from '../common/enums';
import { PublicUser } from '../common/types/public-user';
import { hashPassword } from '../common/utils/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

export const DEFAULT_USER_PASSWORD = '1234';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => this.toPublicUser(user));
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }

    const passwordHash = await hashPassword(DEFAULT_USER_PASSWORD);
    const user = await this.userRepository.save(
      this.userRepository.create({
        name: dto.name.trim(),
        email,
        passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
      }),
    );

    return this.toPublicUser(user);
  }

  async inactivate(id: string, actorId: string): Promise<PublicUser> {
    if (id === actorId) {
      throw new BadRequestException('Você não pode inativar a si mesmo');
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.status = UserStatus.INACTIVE;
    const saved = await this.userRepository.save(user);
    return this.toPublicUser(saved);
  }

  async activate(id: string): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.status = UserStatus.ACTIVE;
    const saved = await this.userRepository.save(user);
    return this.toPublicUser(saved);
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    mustChangePassword: boolean,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.passwordHash = passwordHash;
    user.mustChangePassword = mustChangePassword;
    return this.userRepository.save(user);
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
