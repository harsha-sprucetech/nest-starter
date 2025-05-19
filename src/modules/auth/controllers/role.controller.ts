import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard, RequirePermissions } from '../../../guards/permission.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions({ resource: 'roles', action: 'create' })
  async createRole(
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.roleService.createRole(name, description);
  }

  @Post('permissions')
  @RequirePermissions({ resource: 'permissions', action: 'create' })
  async createPermission(
    @Body('name') name: string,
    @Body('resource') resource: string,
    @Body('action') action: string,
    @Body('description') description?: string,
  ) {
    return this.roleService.createPermission(name, resource, action, description);
  }

  @Post(':roleId/permissions/:permissionId')
  @RequirePermissions({ resource: 'roles', action: 'update' })
  async assignPermissionToRole(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ) {
    return this.roleService.assignPermissionToRole(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @RequirePermissions({ resource: 'roles', action: 'update' })
  async removePermissionFromRole(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ) {
    return this.roleService.removePermissionFromRole(roleId, permissionId);
  }

  @Get()
  @RequirePermissions({ resource: 'roles', action: 'read' })
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermissions({ resource: 'permissions', action: 'read' })
  async getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Get(':roleId/permissions')
  @RequirePermissions({ resource: 'roles', action: 'read' })
  async getRolePermissions(@Param('roleId') roleId: number) {
    return this.roleService.getRolePermissions(roleId);
  }
} 