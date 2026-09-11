import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Paciente inválido' })
  patientId!: string;

  @ApiProperty({
    type: [String],
    description: 'Um ou mais profissionais responsáveis',
  })
  @IsArray({ message: 'Profissionais inválidos' })
  @ArrayMinSize(1, { message: 'Informe ao menos um profissional' })
  @ArrayUnique({ message: 'Profissionais duplicados não são permitidos' })
  @IsUUID('4', { each: true, message: 'Profissional inválido' })
  responsibleProfessionalIds!: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Zero ou mais auxiliares',
  })
  @IsOptional()
  @IsArray({ message: 'Auxiliares inválidos' })
  @ArrayUnique({ message: 'Auxiliares duplicados não são permitidos' })
  @IsUUID('4', { each: true, message: 'Auxiliar inválido' })
  assistantProfessionalIds?: string[];

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
  @Min(15, { message: 'Duração mínima de 15 minutos' })
  @Max(480, { message: 'Duração máxima de 8 horas' })
  durationMinutes!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
