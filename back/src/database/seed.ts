/**
 * Seed opcional — cria apenas o usuário admin inicial.
 * NÃO é executado automaticamente. Use: npm run seed
 *
 * Credenciais DEV: admin@agendamento.local / Admin@123
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { AppDataSource } from './data-source';
import { hashPassword } from '../common/utils/password.util';
import { UserRole, UserStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';

async function seed(): Promise<void> {
  loadEnv({ path: resolve(process.cwd(), '.env') });

  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@agendamento.local' },
  });

  if (existingAdmin) {
    console.log('Admin já existe. Nada a fazer.');
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await hashPassword('Admin@123');
  await userRepo.save(
    userRepo.create({
      name: 'Administrador',
      email: 'admin@agendamento.local',
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    }),
  );

  console.log('Admin criado: admin@agendamento.local / Admin@123');
  await AppDataSource.destroy();
}

seed().catch(async (error: unknown) => {
  console.error('Falha ao executar seed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
