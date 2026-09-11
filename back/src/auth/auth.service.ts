import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { comparePassword, hashPassword } from '../common/utils/password.util';
import { UserStatus } from '../common/enums';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, LoginResponse } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const passwordValid = await comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildLoginResponse(user);
  }

  async changePassword(
    user: User,
    dto: ChangePasswordDto,
  ): Promise<LoginResponse> {
    const currentValid = await comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual',
      );
    }

    if (dto.newPassword === '1234') {
      throw new BadRequestException(
        'Escolha uma senha diferente da senha padrão',
      );
    }

    const passwordHash = await hashPassword(dto.newPassword);
    const updated = await this.usersService.updatePassword(
      user.id,
      passwordHash,
      false,
    );

    return this.buildLoginResponse(updated);
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findActiveById(userId);
  }

  async getProfile(user: User) {
    return this.usersService.toPublicUser(user);
  }

  assertCanAccessApp(user: User, path: string): void {
    if (!user.mustChangePassword) {
      return;
    }

    const allowed =
      path.endsWith('/auth/me') || path.endsWith('/auth/change-password');

    if (!allowed) {
      throw new ForbiddenException(
        'É necessário alterar a senha padrão antes de continuar',
      );
    }
  }

  private buildLoginResponse(user: User): LoginResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      accessToken,
      user: this.usersService.toPublicUser(user),
    };
  }
}
