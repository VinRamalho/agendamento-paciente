import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProfessionalType } from '../../common/enums';

export class CreateProfessionDto {
  @ApiProperty({ example: 'Dentista' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter ao menos 2 caracteres' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    enum: ProfessionalType,
    example: ProfessionalType.PROFESSIONAL,
    description:
      'PROFESSIONAL = pode ser responsável no agendamento; ASSISTANT = auxiliar',
  })
  @IsEnum(ProfessionalType, { message: 'Categoria inválida' })
  category!: ProfessionalType;
}
