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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../dto/role.dto';

@ApiTags('admin/roles')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AdminRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions({ resource: 'admin/roles', action: 'create' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto.name, createRoleDto.description);
  }

  @Get()
  @RequirePermissions({ resource: 'admin/roles', action: 'read' })
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'admin/roles', action: 'read' })
  async getRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getRoleWithPermissions(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'admin/roles', action: 'update' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'admin/roles', action: 'delete' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.deleteRole(id);
  }

  @Post('permissions')
  @RequirePermissions({ resource: 'admin/permissions', action: 'create' })
  async createPermission(
    @Body('name') name: string,
    @Body('resource') resource: string,
    @Body('action') action: string,
    @Body('description') description?: string,
  ) {
    return this.roleService.createPermission(name, resource, action, description);
  }

  @Get('permissions')
  @RequirePermissions({ resource: 'admin/permissions', action: 'read' })
  async getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Post(':roleId/permissions')
  @RequirePermissions({ resource: 'admin/roles', action: 'update' })
  async assignPermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissionsToRole(roleId, assignPermissionsDto.permissionIds);
  }

  @Delete(':roleId/permissions/:permissionId')
  @RequirePermissions({ resource: 'admin/roles', action: 'update' })
  async removePermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.roleService.removePermissionFromRole(roleId, permissionId);
  }

  @Get(':roleId/permissions')
  @RequirePermissions({ resource: 'admin/roles', action: 'read' })
  async getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.roleService.getRolePermissions(roleId);
  }
} 