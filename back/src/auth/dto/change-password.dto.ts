import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter ao menos 6 caracteres' })
  @MaxLength(72)
  newPassword!: string;
}
