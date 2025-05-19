import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../entities/role.entity';
import { PermissionEntity } from '../../../entities/permission.entity';
import { UpdateRoleDto } from '../dto/role.dto';
import { UpdatePermissionDto } from '../dto/permission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
  ) {}

  async createRole(name: string, description?: string): Promise<RoleEntity> {
    const role = this.roleRepository.create({ name, description });
    return this.roleRepository.save(role);
  }

  async getRoleWithPermissions(id: number): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.getRoleWithPermissions(id);
    
    if (updateRoleDto.name) {
      role.name = updateRoleDto.name;
    }
    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.getRoleWithPermissions(id);
    await this.roleRepository.remove(role);
  }

  async createPermission(
    name: string,
    resource: string,
    action: string,
    description?: string,
  ): Promise<PermissionEntity> {
    const permission = this.permissionRepository.create({
      name,
      resource,
      action,
      description,
    });
    return this.permissionRepository.save(permission);
  }

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<RoleEntity> {
    const role = await this.getRoleWithPermissions(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    role.permissions = [...(role.permissions || []), permission];
    return this.roleRepository.save(role);
  }

  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<RoleEntity> {
    const role = await this.getRoleWithPermissions(roleId);
    const permissions = await this.permissionRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<RoleEntity> {
    const role = await this.getRoleWithPermissions(roleId);

    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    return this.roleRepository.save(role);
  }

  async getAllRoles(): Promise<RoleEntity[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find();
  }

  async getRolePermissions(roleId: number): Promise<PermissionEntity[]> {
    const role = await this.getRoleWithPermissions(roleId);
    return role.permissions;
  }

  async getPermission(id: number): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionEntity> {
    const permission = await this.getPermission(id);

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async deletePermission(id: number): Promise<void> {
    const permission = await this.getPermission(id);
    await this.permissionRepository.remove(permission);
  }
} 