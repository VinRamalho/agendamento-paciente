import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProfessionalType } from '../../common/enums';

export class CreateProfessionalDto {
  @ApiProperty({ example: 'Dr. João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter ao menos 2 caracteres' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'joao.silva@agendamento.local' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: '11999990001' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ enum: ProfessionalType, example: ProfessionalType.DENTIST })
  @IsEnum(ProfessionalType, { message: 'Tipo de profissional inválido' })
  type!: ProfessionalType;
}
