import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter ao menos 2 caracteres' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'maria@clinica.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(255)
  email!: string;
}
