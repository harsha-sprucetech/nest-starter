import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequirePermissions } from '../decorators/roles.decorator';

interface Permission {
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      return false;
    }

    // Check if user has any of the required permissions through their roles
    return user.roles.some((role: Role) => 
      role.permissions.some((permission: Permission) => 
        requiredPermissions.some(required => 
          permission.resource === required.resource && 
          permission.action === required.action
        )
      )
    );
  }
} 