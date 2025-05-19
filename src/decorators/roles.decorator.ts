import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (permissions: { resource: string; action: string }[]) => 
  SetMetadata('permissions', permissions); 