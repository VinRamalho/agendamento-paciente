import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { entities } from './entities';

loadEnv({ path: resolve(process.cwd(), '.env') });

const configService = new ConfigService();

const databaseUrl =
  configService.get<string>('DATABASE_URL') ||
  configService.get<string>('TYPEORM_URL');

const dbPassword =
  configService.get<string>('DB_PASSWORD')?.trim() ||
  configService.get<string>('TYPEORM_PASSWORD')?.trim();

if (!databaseUrl && !dbPassword) {
  throw new Error(
    'DB_PASSWORD is required when DATABASE_URL is not set. Ensure back/.env exists and run migration commands from the back/ directory.',
  );
}

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities,
        migrations: ['src/migration/*.ts'],
        synchronize: false,
        logging: true,
      }
    : {
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: dbPassword!,
        database: configService.get<string>('DB_DATABASE', 'agendamento'),
        entities,
        migrations: ['src/migration/*.ts'],
        synchronize: false,
        logging: true,
      },
);
