import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Paciente inválido' })
  patientId!: string;

  @ApiProperty({ description: 'Dentista responsável' })
  @IsUUID('4', { message: 'Dentista responsável inválido' })
  responsibleProfessionalId!: string;

  @ApiPropertyOptional({ description: 'Auxiliar (opcional)' })
  @IsOptional()
  @IsUUID('4', { message: 'Auxiliar inválido' })
  assistantProfessionalId?: string | null;

  @ApiProperty({ example: '2026-09-15', description: 'Data (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Data inválida' })
  date!: string;

  @ApiProperty({ example: '14:00', description: 'Horário inicial (HH:mm)' })
  @IsString()
  @IsNotEmpty({ message: 'Horário inicial é obrigatório' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Horário inicial inválido (use HH:mm)',
  })
  startTime!: string;

  @ApiProperty({ example: 60 })
  @IsInt({ message: 'Duração deve ser um número inteiro' })
  @Min(1, { message: 'Duração deve ser maior que zero' })
  durationMinutes!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
