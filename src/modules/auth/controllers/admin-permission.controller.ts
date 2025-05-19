import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';
import { RoleService } from '../services/role.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permission.dto';

@ApiTags('admin/permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AdminPermissionController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions({ resource: 'admin/permissions', action: 'create' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.roleService.createPermission(
      createPermissionDto.name,
      createPermissionDto.resource,
      createPermissionDto.action,
      createPermissionDto.description
    );
  }

  @Get()
  @RequirePermissions({ resource: 'admin/permissions', action: 'read' })
  async getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'admin/permissions', action: 'read' })
  async getPermission(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getPermission(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'admin/permissions', action: 'update' })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.roleService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'admin/permissions', action: 'delete' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.deletePermission(id);
  }
} 