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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { ListProfessionalsQueryDto } from './dto/list-professionals-query.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { ProfessionalsService } from './professionals.service';

@ApiTags('professionals')
@ApiBearerAuth('JWT-auth')
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar profissional (status ACTIVE)' })
  @ApiResponse({ status: 201, description: 'Profissional criado' })
  create(@Body() dto: CreateProfessionalDto) {
    return this.professionalsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar profissionais com filtros e paginação' })
  findAll(@Query() query: ListProfessionalsQueryDto) {
    return this.professionalsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter profissional por ID' })
  @ApiResponse({ status: 404, description: 'Profissional não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar profissional' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfessionalDto,
  ) {
    return this.professionalsService.update(id, dto);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar profissional' })
  inactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.inactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reativar profissional' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.professionalsService.activate(id);
  }
}
