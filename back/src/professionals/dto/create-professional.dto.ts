import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @ApiProperty({ example: '(11) 99999-0001' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @MaxLength(20)
  @Matches(/^[\d\s()\-]{10,20}$/, {
    message: 'Telefone inválido',
  })
  phone!: string;

  @ApiProperty({ format: 'uuid', description: 'ID da profissão cadastrada' })
  @IsUUID('4', { message: 'Profissão inválida' })
  professionId!: string;
}
