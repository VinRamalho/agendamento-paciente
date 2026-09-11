import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';
import * as passwordUtil from '../common/utils/password.util';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const activeUser: User = {
    id: 'user-1',
    name: 'Administrador',
    email: 'admin@agendamento.local',
    passwordHash: 'hashed',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findActiveById: jest.fn(),
            toPublicUser: jest.fn((user: User) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token-123'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1h'),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should login with valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(true);

    const result = await authService.login({
      email: 'admin@agendamento.local',
      password: 'Admin@123',
    });

    expect(result.accessToken).toBe('token-123');
    expect(result.user.email).toBe('admin@agendamento.local');
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('should reject invalid password', async () => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    jest.spyOn(passwordUtil, 'comparePassword').mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'admin@agendamento.local',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should reject unknown user', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nobody@agendamento.local',
        password: 'Admin@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should reject inactive user', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...activeUser,
      status: UserStatus.INACTIVE,
    });

    await expect(
      authService.login({
        email: 'admin@agendamento.local',
        password: 'Admin@123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
