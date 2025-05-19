import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '../entities/user.entity';

export interface RequiredPermission {
  resource: string;
  action: string;
}

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (permission: RequiredPermission) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permission, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<RequiredPermission>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;

    if (!user) {
      return false;
    }

    // Make sure roles and permissions are loaded
    if (!user.roles) {
      return false;
    }

    // Check if user has the required permission
    return await user.hasPermission(requiredPermission.resource, requiredPermission.action);
  }
} 