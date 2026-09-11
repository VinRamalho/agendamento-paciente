import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const jwtSecret = configService.get<string>('JWT_SECRET')?.trim();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  const port = configService.get<number>('PORT', 3333);
  const corsOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Agendamento Odontológico API')
    .setDescription(
      'API REST para gerenciamento de pacientes, profissionais e agendamentos odontológicos.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticação')
    .addTag('health', 'Saúde da API')
    .addTag('dashboard', 'Painel')
    .addTag('patients', 'Pacientes')
    .addTag('professionals', 'Profissionais')
    .addTag('appointments', 'Agendamentos')
    .addTag('users', 'Usuários (ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/api`);
  logger.log(`Swagger docs on http://localhost:${port}/api/docs`);
}

void bootstrap();
