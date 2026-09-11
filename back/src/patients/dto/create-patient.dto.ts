import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Carlos Mendes' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter ao menos 2 caracteres' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: '11988880001' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({ example: 'carlos@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(255)
  email?: string | null;

  @ApiPropertyOptional({ example: '1990-05-12' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  birthDate?: string | null;

  @ApiPropertyOptional({ example: '111.444.777-35' })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== null && value !== undefined && value !== '',
  )
  @IsString()
  @MaxLength(14)
  @Matches(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, {
    message: 'CPF inválido',
  })
  cpf?: string | null;
}
