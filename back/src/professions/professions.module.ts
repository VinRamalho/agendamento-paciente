import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from '../professionals/entities/professional.entity';
import { Profession } from './entities/profession.entity';
import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profession, Professional])],
  controllers: [ProfessionsController],
  providers: [ProfessionsService],
  exports: [ProfessionsService, TypeOrmModule],
})
export class ProfessionsModule {}
