import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const timezone = configService.get<string>(
          'TIMEZONE',
          'America/Sao_Paulo',
        );
        const timezoneOption = `-c timezone=${timezone}`;
        const databaseUrl =
          configService.get<string>('DATABASE_URL') ||
          configService.get<string>('TYPEORM_URL');

        if (databaseUrl) {
          const separator = databaseUrl.includes('?') ? '&' : '?';
          return {
            type: 'postgres' as const,
            url: `${databaseUrl}${separator}options=${encodeURIComponent(timezoneOption)}`,
            entities,
            autoLoadEntities: true,
            synchronize:
              configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
            logging: configService.get<string>('TYPEORM_LOGGING') === 'true',
            ssl:
              databaseUrl.includes('amazonaws.com') ||
              databaseUrl.includes('azure.com')
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        const dbPassword = configService.get<string>('DB_PASSWORD')?.trim();
        if (!dbPassword) {
          throw new Error(
            'DB_PASSWORD is required when DATABASE_URL/TYPEORM_URL is not set',
          );
        }

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get<string>('DB_PORT', '5432')),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: dbPassword,
          database: configService.get<string>('DB_DATABASE', 'agendamento'),
          entities,
          autoLoadEntities: true,
          synchronize:
            configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
          logging: configService.get<string>('TYPEORM_LOGGING') === 'true',
          extra: {
            options: timezoneOption,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
