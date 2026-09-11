import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProfessionalStatus, ProfessionalType } from '../../common/enums';

export class ListProfessionalsQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Busca por nome' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ProfessionalType })
  @IsOptional()
  @IsEnum(ProfessionalType)
  type?: ProfessionalType;

  @ApiPropertyOptional({ enum: ProfessionalStatus })
  @IsOptional()
  @IsEnum(ProfessionalStatus)
  status?: ProfessionalStatus;
}
