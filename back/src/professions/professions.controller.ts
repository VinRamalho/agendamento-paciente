import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProfessionalStatus, UserRole } from '../common/enums';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { ProfessionsService } from './professions.service';

@ApiTags('professions')
@ApiBearerAuth('JWT-auth')
@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar profissões (autenticado)' })
  findAll(@Query('status') status?: ProfessionalStatus) {
    return this.professionsService.findAll(status);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar profissão (somente ADMIN)' })
  create(@Body() dto: CreateProfessionDto) {
    return this.professionsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar profissão (somente ADMIN)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfessionDto,
  ) {
    return this.professionsService.update(id, dto);
  }

  @Patch(':id/inactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inativar profissão (somente ADMIN)' })
  inactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionsService.inactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reativar profissão (somente ADMIN)' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionsService.activate(id);
  }
}
