import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo do dashboard' })
  @ApiResponse({ status: 200, description: 'Resumo carregado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
