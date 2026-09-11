import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuários (somente ADMIN)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Criar usuário com senha padrão 1234 (somente ADMIN)',
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/inactivate')
  @ApiOperation({ summary: 'Inativar usuário (somente ADMIN)' })
  inactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: User,
  ) {
    return this.usersService.inactivate(id, actor.id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reativar usuário (somente ADMIN)' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }
}
